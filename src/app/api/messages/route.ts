import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationWith = searchParams.get("with") || "";

    if (conversationWith) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: session.user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      await prisma.message.updateMany({
        where: {
          senderId: conversationWith,
          receiverId: session.user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // Get conversation list (latest message per unique conversation partner)
    const sent = await prisma.message.findMany({
      where: { senderId: session.user.id },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const received = await prisma.message.findMany({
      where: { receiverId: session.user.id },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    const partnerIds = [
      ...new Set([
        ...sent.map((m) => m.receiverId),
        ...received.map((m) => m.senderId),
      ]),
    ];

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: partnerId },
              { senderId: partnerId, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: session.user.id,
            read: false,
          },
        });

        const partner = await prisma.user.findUnique({
          where: { id: partnerId },
          select: { id: true, name: true, role: true, profile: { select: { companyName: true, university: true } } },
        });

        return { partner, lastMessage, unreadCount };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? new Date(0);
      const bTime = b.lastMessage?.createdAt ?? new Date(0);
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: parsed.data.receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: parsed.data.receiverId,
        body: parsed.data.body,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

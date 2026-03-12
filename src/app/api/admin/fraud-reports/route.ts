import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.fraudReport.findMany({
      include: {
        reportedBy: { select: { id: true, name: true, email: true, role: true } },
        reportedUser: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching fraud reports:", error);
    return NextResponse.json({ error: "Failed to fetch fraud reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportedUserId, reason, description } = await req.json();

    if (!reportedUserId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.fraudReport.create({
      data: {
        reportedById: session.user.id,
        reportedUserId,
        reason,
        description: description || "",
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating fraud report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId, status } = await req.json();

    if (!reportId || !["reviewed", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const report = await prisma.fraudReport.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error updating fraud report:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

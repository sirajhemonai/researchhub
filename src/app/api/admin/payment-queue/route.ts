import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const engagements = await prisma.engagement.findMany({
    where: { status: "pending_deposit" },
    include: {
      problem: { select: { title: true } },
      company: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const items = engagements.map((eng) => {
    const depositDeadline = eng.agreedAt
      ? new Date(eng.agreedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
      : null;
    const now = new Date();
    const daysRemaining = depositDeadline
      ? Math.max(0, Math.ceil((depositDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      id: eng.id,
      problemTitle: eng.problem.title,
      company: eng.company,
      student: eng.student,
      projectValueBdt: eng.projectValueBdt,
      depositAmountBdt: eng.depositAmountBdt,
      namedContactPhone: eng.namedContactPhone,
      agreedAt: eng.agreedAt,
      depositDeadline,
      daysRemaining,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { engagementId, notes } = body;

  if (!engagementId) {
    return NextResponse.json({ error: "Engagement ID is required" }, { status: 400 });
  }
  if (!notes || notes.length < 10) {
    return NextResponse.json({ error: "Notes must be at least 10 characters" }, { status: 400 });
  }

  const engagement = await prisma.engagement.findUnique({ where: { id: engagementId } });
  if (!engagement || engagement.status !== "pending_deposit") {
    return NextResponse.json({ error: "Engagement not found or not in pending_deposit state" }, { status: 400 });
  }

  await prisma.adminAction.create({
    data: {
      adminId: session.user.id,
      actionType: "deposit_confirmed",
      entityId: engagementId,
      entityType: "engagement",
      engagementId,
      notes,
      metadata: JSON.stringify({ depositAmount: engagement.depositAmountBdt }),
    },
  });

  await prisma.engagement.update({
    where: { id: engagementId },
    data: { status: "active", depositConfirmedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

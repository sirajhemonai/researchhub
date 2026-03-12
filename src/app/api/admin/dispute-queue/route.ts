import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disputes = await prisma.dispute.findMany({
    where: { status: "open" },
    include: {
      engagement: {
        include: {
          problem: { select: { title: true } },
          company: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true } },
        },
      },
      milestone: { select: { id: true, title: true, order: true } },
    },
    orderBy: { raisedAt: "asc" },
  });

  const now = new Date();
  const items = disputes.map((d) => ({
    id: d.id,
    reason: d.reason,
    description: d.description,
    raisedAt: d.raisedAt,
    daysSinceRaised: Math.ceil((now.getTime() - d.raisedAt.getTime()) / (1000 * 60 * 60 * 24)),
    milestone: d.milestone,
    engagement: {
      id: d.engagement.id,
      problemTitle: d.engagement.problem.title,
      company: d.engagement.company,
      student: d.engagement.student,
      namedContactPhone: d.engagement.namedContactPhone,
    },
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { disputeId, ruling, rulingPercent, rulingNotes } = body;

  if (!disputeId || !ruling || !rulingNotes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["full_release", "partial", "refund"].includes(ruling)) {
    return NextResponse.json({ error: "Invalid ruling type" }, { status: 400 });
  }

  if (ruling === "partial" && (rulingPercent === undefined || rulingPercent < 0 || rulingPercent > 100)) {
    return NextResponse.json({ error: "Partial ruling requires a valid percentage (0-100)" }, { status: 400 });
  }

  if (rulingNotes.length < 10) {
    return NextResponse.json({ error: "Ruling notes must be at least 10 characters" }, { status: 400 });
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { engagement: { include: { company: { include: { profile: true } } } } },
  });

  if (!dispute || dispute.status !== "open") {
    return NextResponse.json({ error: "Dispute not found or already resolved" }, { status: 400 });
  }

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: "resolved",
      ruling,
      rulingPercent: ruling === "partial" ? rulingPercent : null,
      rulingNotes,
      adminId: session.user.id,
      resolvedAt: new Date(),
    },
  });

  await prisma.adminAction.create({
    data: {
      adminId: session.user.id,
      actionType: "dispute_ruling",
      entityId: disputeId,
      entityType: "dispute",
      engagementId: dispute.engagementId,
      notes: rulingNotes,
      metadata: JSON.stringify({ ruling, rulingPercent }),
    },
  });

  const companyId = dispute.engagement.companyId;
  const unresolvedCount = await prisma.dispute.count({
    where: {
      engagement: { companyId },
      status: "resolved",
      ruling: { in: ["partial", "refund"] },
    },
  });

  let badge = "green";
  if (unresolvedCount >= 4) badge = "banned";
  else if (unresolvedCount >= 3) badge = "red";
  else if (unresolvedCount >= 1) badge = "yellow";

  if (dispute.engagement.company.profile) {
    await prisma.profile.update({
      where: { userId: companyId },
      data: { standingBadge: badge },
    });
  }

  return NextResponse.json({ success: true });
}

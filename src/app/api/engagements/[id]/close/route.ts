import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { notes } = body;

  if (!notes || notes.length < 10) {
    return NextResponse.json({ error: "Notes must be at least 10 characters" }, { status: 400 });
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: { milestones: true, disputes: { where: { status: "open" } } },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  if (engagement.status !== "active" && engagement.status !== "closing") {
    return NextResponse.json({ error: "Engagement must be active or closing to perform quality check" }, { status: 400 });
  }

  const allMilestonesApproved = engagement.milestones.length > 0 &&
    engagement.milestones.every((m) => m.status === "approved");

  if (!allMilestonesApproved) {
    return NextResponse.json({ error: "All milestones must be approved before closure" }, { status: 400 });
  }

  if (engagement.disputes.length > 0) {
    return NextResponse.json({ error: "Cannot close with open disputes" }, { status: 400 });
  }

  await prisma.adminAction.create({
    data: {
      adminId: session.user.id,
      actionType: "quality_check",
      entityId: id,
      entityType: "engagement",
      engagementId: id,
      notes,
      metadata: JSON.stringify({
        milestonesCount: engagement.milestones.length,
        allApproved: true,
        namedContactEmail: engagement.namedContactEmail,
      }),
    },
  });

  await prisma.engagement.update({
    where: { id },
    data: { status: "closing" },
  });

  return NextResponse.json({ success: true, status: "closing" });
}

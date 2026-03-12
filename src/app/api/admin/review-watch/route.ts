import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const milestones = await prisma.milestone.findMany({
    where: { status: "under_review" },
    include: {
      engagement: {
        include: {
          problem: { select: { title: true } },
          company: { select: { id: true, name: true } },
          student: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  const now = new Date();
  const items = milestones.map((m) => {
    const submittedAt = m.submittedAt || m.updatedAt;
    const reviewDays = Math.ceil((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
    const baseDeadlineDays = 10;
    const extensionDays = m.extensionsUsed * 7;
    const totalDeadlineDays = baseDeadlineDays + extensionDays;
    const daysRemaining = totalDeadlineDays - reviewDays;

    return {
      id: m.id,
      title: m.title,
      order: m.order,
      submittedAt,
      reviewDays,
      daysRemaining,
      isOverdue: daysRemaining < 0,
      isApproachingDeadline: daysRemaining <= 2 && daysRemaining >= 0,
      extensionsUsed: m.extensionsUsed,
      engagementId: m.engagementId,
      problemTitle: m.engagement.problem.title,
      company: m.engagement.company,
      student: m.engagement.student,
      namedContactPhone: m.engagement.namedContactPhone,
    };
  });

  items.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return NextResponse.json({ items });
}

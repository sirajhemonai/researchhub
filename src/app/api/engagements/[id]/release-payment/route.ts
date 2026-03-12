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
  const { transactionRefId, notes } = body;

  if (!transactionRefId) {
    return NextResponse.json({ error: "Transaction reference ID is required" }, { status: 400 });
  }
  if (!notes || notes.length < 10) {
    return NextResponse.json({ error: "Notes must be at least 10 characters" }, { status: 400 });
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: {
      milestones: true,
      student: { include: { profile: true } },
      company: { include: { profile: true } },
      problem: true,
    },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  if (engagement.status !== "closing") {
    return NextResponse.json({ error: "Engagement must be in closing state to release payment" }, { status: 400 });
  }

  const projectValue = engagement.projectValueBdt || 0;
  const feeRate = engagement.platformFeeRate;
  const grossAmount = projectValue * (1 - feeRate);
  const platformFee = projectValue * feeRate;
  const netPayout = grossAmount;

  const startDate = engagement.agreedAt || engagement.createdAt;
  const endDate = new Date();
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  const durationStr = durationDays > 30 ? `${Math.round(durationDays / 30)} months` : `${durationDays} days`;

  const milestoneSummary = engagement.milestones.map((m) => ({
    title: m.title,
    status: m.status,
    approvedAt: m.approvedAt,
  }));

  const certId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    await tx.adminAction.create({
      data: {
        adminId: session.user.id,
        actionType: "payment_released",
        entityId: id,
        entityType: "engagement",
        engagementId: id,
        notes,
        metadata: JSON.stringify({
          transactionRefId,
          grossAmount,
          platformFee,
          netPayout,
          projectValue,
        }),
      },
    });

    const certificate = await tx.certificate.create({
      data: {
        id: certId,
        engagementId: id,
        studentId: engagement.studentId,
        studentName: engagement.student.name,
        university: engagement.student.profile?.university || null,
        projectTitle: engagement.problem.title,
        companyName: engagement.company.profile?.companyName || engagement.company.name,
        duration: durationStr,
        milestoneSummary: JSON.stringify(milestoneSummary),
        verificationUrl: `/verify/${certId}`,
      },
    });

    const now = new Date();
    await tx.engagement.update({
      where: { id },
      data: {
        status: "closed",
        completedAt: now,
        closedAt: now,
        netStudentPayoutBdt: netPayout,
      },
    });

    return certificate;
  });

  await updateStudentTrustScore(engagement.studentId);

  return NextResponse.json({
    success: true,
    status: "closed",
    certificateId: result.id,
    verificationUrl: result.verificationUrl,
  });
}

async function updateStudentTrustScore(studentId: string) {
  const engagements = await prisma.engagement.findMany({
    where: { studentId, status: { in: ["closed", "payment_released", "archived"] } },
    include: { milestones: true, projectRatings: { where: { rateeId: studentId } } },
  });

  if (engagements.length === 0) return;

  let totalMilestones = 0;
  let approvedMilestones = 0;
  let onTimeMilestones = 0;
  let totalProjectValue = 0;
  let positiveTagCount = 0;
  let totalTagCount = 0;

  const positiveTags = ["submitted_on_time", "communication_clear", "deliverable_matched_scope"];

  for (const eng of engagements) {
    totalProjectValue += eng.projectValueBdt || 0;

    for (const m of eng.milestones) {
      totalMilestones++;
      if (m.status === "approved") {
        approvedMilestones++;
        if (!m.isLate) onTimeMilestones++;
      }
    }

    for (const rating of eng.projectRatings) {
      const tags = JSON.parse(rating.tags || "[]") as string[];
      for (const tag of tags) {
        totalTagCount++;
        if (positiveTags.includes(tag)) positiveTagCount++;
      }
    }
  }

  const completionRate = totalMilestones > 0 ? approvedMilestones / totalMilestones : 0;
  const onTimeRate = totalMilestones > 0 ? onTimeMilestones / totalMilestones : 0;
  const positiveTagRatio = totalTagCount > 0 ? positiveTagCount / totalTagCount : 0.5;
  const avgProjectValue = engagements.length > 0 ? totalProjectValue / engagements.length : 0;
  const projectValueFactor = avgProjectValue > 0 ? Math.log(avgProjectValue) / 10 : 0;

  const score = Math.round(
    (completionRate * 0.40 + onTimeRate * 0.30 + positiveTagRatio * 0.20 + Math.min(projectValueFactor, 1) * 0.10) * 100
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  await prisma.user.update({
    where: { id: studentId },
    data: { trustScore: clampedScore },
  });
}

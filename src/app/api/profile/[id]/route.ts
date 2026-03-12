import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAndPersistTrustScore } from "@/lib/trust-score-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        trustScore: true,
        createdAt: true,
        profile: true,
        _count: {
          select: { submissions: true, problems: true, jobs: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trustResult = await computeAndPersistTrustScore(id);

    const shortlistedCount = await prisma.submission.count({
      where: { userId: id, status: { in: ["shortlisted", "accepted"] } },
    });

    const engagementCount = await prisma.engagement.count({
      where: {
        OR: [{ companyId: id }, { studentId: id }],
      },
    });

    const activeEngagementCount = await prisma.engagement.count({
      where: {
        OR: [{ companyId: id }, { studentId: id }],
        status: "active",
      },
    });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: id },
      select: {
        id: true,
        projectTitle: true,
        companyName: true,
        verificationUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ...user,
      trustScore: trustResult.score,
      trustBreakdown: trustResult.factors,
      certificates,
      _stats: {
        shortlisted: shortlistedCount,
        engagements: engagementCount,
        activeEngagements: activeEngagementCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

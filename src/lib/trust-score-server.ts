import { prisma } from "@/lib/prisma";
import { calculateTrustScore, TrustBreakdown } from "@/lib/trust-score";

export async function computeAndPersistTrustScore(userId: string): Promise<TrustBreakdown> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      _count: { select: { submissions: true, problems: true } },
    },
  });

  if (!user) return { score: 0, factors: [] };

  const shortlistedCount = await prisma.submission.count({
    where: { userId, status: { in: ["shortlisted", "accepted"] } },
  });

  const engagementCount = await prisma.engagement.count({
    where: {
      OR: [{ companyId: userId }, { studentId: userId }],
    },
  });

  const result = calculateTrustScore({
    role: user.role,
    verified: user.verified,
    profile: user.profile,
    stats: {
      submissions: user._count.submissions,
      shortlisted: shortlistedCount,
      problems: user._count.problems,
      engagements: engagementCount,
    },
  });

  if (user.trustScore !== result.score) {
    await prisma.user.update({
      where: { id: userId },
      data: { trustScore: result.score },
    });
  }

  return result;
}

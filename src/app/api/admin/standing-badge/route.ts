import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.user.findMany({
    where: { role: "industry" },
    include: {
      profile: { select: { id: true, companyName: true, standingBadge: true } },
      _count: {
        select: {
          engagementsAsCompany: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const items = await Promise.all(
    companies.map(async (c) => {
      const disputeCount = await prisma.dispute.count({
        where: {
          engagement: { companyId: c.id },
        },
      });
      const unresolvedDisputeCount = await prisma.dispute.count({
        where: {
          engagement: { companyId: c.id },
          status: "open",
        },
      });
      const negativeDisputeCount = await prisma.dispute.count({
        where: {
          engagement: { companyId: c.id },
          status: "resolved",
          ruling: { in: ["partial", "refund"] },
        },
      });

      return {
        id: c.id,
        name: c.name,
        companyName: c.profile?.companyName || c.name,
        standingBadge: c.profile?.standingBadge || "green",
        engagementCount: c._count.engagementsAsCompany,
        totalDisputes: disputeCount,
        unresolvedDisputes: unresolvedDisputeCount,
        negativeDisputes: negativeDisputeCount,
      };
    })
  );

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyId, badge, notes } = body;

  if (!companyId || !badge || !notes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["green", "yellow", "red", "banned"].includes(badge)) {
    return NextResponse.json({ error: "Invalid badge value" }, { status: 400 });
  }

  if (notes.length < 10) {
    return NextResponse.json({ error: "Notes must be at least 10 characters" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: companyId } });
  if (!profile) {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  await prisma.profile.update({
    where: { userId: companyId },
    data: { standingBadge: badge },
  });

  await prisma.adminAction.create({
    data: {
      adminId: session.user.id,
      actionType: "standing_override",
      entityId: companyId,
      entityType: "profile",
      notes,
      metadata: JSON.stringify({ previousBadge: profile.standingBadge, newBadge: badge }),
    },
  });

  return NextResponse.json({ success: true });
}

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
    where: { status: "closing" },
    include: {
      problem: { select: { title: true } },
      company: { select: { id: true, name: true } },
      student: { select: { id: true, name: true } },
      milestones: {
        select: {
          id: true,
          title: true,
          status: true,
          deliverableUrl: true,
          approvedAt: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  const items = engagements.map((eng) => ({
    id: eng.id,
    problemTitle: eng.problem.title,
    company: eng.company,
    student: eng.student,
    projectValueBdt: eng.projectValueBdt,
    netStudentPayoutBdt: eng.netStudentPayoutBdt,
    platformFeeRate: eng.platformFeeRate,
    milestones: eng.milestones,
    namedContactEmail: eng.namedContactEmail,
    namedContactPhone: eng.namedContactPhone,
    updatedAt: eng.updatedAt,
  }));

  return NextResponse.json({ items });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actions = await prisma.adminAction.findMany({
    where: {
      actionType: { in: ["payment_confirmed", "payment_released", "deposit_confirmed"] },
    },
    include: {
      admin: { select: { id: true, name: true } },
      engagement: {
        select: {
          id: true,
          problem: { select: { title: true } },
          company: { select: { name: true } },
          student: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = actions.map((a) => {
    let metadata = {};
    try {
      metadata = JSON.parse(a.metadata);
    } catch {
      metadata = {};
    }
    return {
      id: a.id,
      actionType: a.actionType,
      adminName: a.admin.name,
      notes: a.notes,
      metadata,
      engagement: a.engagement
        ? {
            id: a.engagement.id,
            problemTitle: a.engagement.problem.title,
            companyName: a.engagement.company.name,
            studentName: a.engagement.student.name,
          }
        : null,
      createdAt: a.createdAt,
    };
  });

  return NextResponse.json({ items });
}

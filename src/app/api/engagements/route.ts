import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    const where = role === "admin"
      ? {}
      : {
          OR: [
            { companyId: userId },
            { studentId: userId },
          ],
        };

    const engagements = await prisma.engagement.findMany({
      where,
      include: {
        problem: { select: { id: true, title: true, bountyType: true, bountyValue: true } },
        company: { select: { id: true, name: true, profile: { select: { companyName: true, standingBadge: true } } } },
        student: { select: { id: true, name: true, profile: { select: { university: true } } } },
        milestones: {
          select: { id: true, status: true, dueDate: true, order: true, title: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const now = new Date();
    for (const eng of engagements) {
      if (
        eng.status === "pending_deposit" &&
        eng.depositDeadline &&
        now > new Date(eng.depositDeadline)
      ) {
        await prisma.engagement.update({
          where: { id: eng.id },
          data: {
            status: "negotiating",
            companyConfirmed: false,
            studentConfirmed: false,
            depositDeadline: null,
            agreedAt: null,
            negotiationRound: 0,
            proposedBy: null,
            adminProposedBinding: false,
            agreementPdfUrl: null,
          },
        });
        eng.status = "negotiating";
        eng.depositDeadline = null;
      }
    }

    return NextResponse.json({ engagements });
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return NextResponse.json({ error: "Failed to fetch engagements" }, { status: 500 });
  }
}

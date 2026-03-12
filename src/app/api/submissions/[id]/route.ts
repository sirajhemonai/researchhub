import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAndPersistTrustScore } from "@/lib/trust-score-server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { problem: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.problem.companyId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Only the problem owner can evaluate submissions" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ["status", "score", "feedback"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: updateData,
    });

    if (body.status === "shortlisted") {
      const existingEngagement = await prisma.engagement.findFirst({
        where: {
          problemId: submission.problemId,
          companyId: submission.problem.companyId,
          studentId: submission.userId,
        },
      });
      if (!existingEngagement) {
        await prisma.engagement.create({
          data: {
            problemId: submission.problemId,
            companyId: submission.problem.companyId,
            studentId: submission.userId,
            status: "negotiating",
          },
        });
      }
    }

    if (body.status) {
      await computeAndPersistTrustScore(submission.userId);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}

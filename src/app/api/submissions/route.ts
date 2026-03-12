import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validations";
import { computeAndPersistTrustScore } from "@/lib/trust-score-server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["student", "researcher", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only students and researchers can submit solutions" }, { status: 403 });
    }

    const body = await req.json();
    const { problemId, ...rest } = body;

    if (!problemId) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
    }

    const parsed = submissionSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem || problem.status !== "open") {
      return NextResponse.json({ error: "Problem not found or no longer accepting submissions" }, { status: 400 });
    }

    const existing = await prisma.submission.findFirst({
      where: { problemId, userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already submitted a solution to this problem" }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        problemId,
        userId: session.user.id,
        description: parsed.data.description,
        fileUrl: parsed.data.fileUrl || null,
        githubRepoUrl: parsed.data.githubRepoUrl || null,
        demoUrl: parsed.data.demoUrl || null,
        ipAccepted: parsed.data.ipAccepted,
        teamMembers: parsed.data.teamMembers ? JSON.stringify(parsed.data.teamMembers) : null,
      },
    });

    await computeAndPersistTrustScore(session.user.id);

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}

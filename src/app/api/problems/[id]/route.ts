import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            profile: { select: { companyName: true, companySector: true, companySize: true, website: true } },
          },
        },
        submissions: {
          include: {
            user: { select: { id: true, name: true, profile: { select: { university: true, skills: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { submissions: true } },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.id === problem.companyId;
    const isAdmin = session?.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        ...problem,
        submissions: problem.submissions.map((s) => ({
          ...s,
          description: s.status === "shortlisted" || isOwner ? s.description : s.description.slice(0, 200) + "...",
        })),
      });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}

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
    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    if (problem.companyId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.problem.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}

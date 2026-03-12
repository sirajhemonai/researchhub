import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { problemSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const status = searchParams.get("status") || "open";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (sector) where.sector = sector;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { abstract: { contains: search } },
      ];
    }
    where.visibility = "public";

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, profile: { select: { companyName: true, companySector: true } } },
          },
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({ problems, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["industry", "government", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only industry and government users can post problems" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = problemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const problem = await prisma.problem.create({
      data: {
        companyId: session.user.id,
        title: parsed.data.title,
        abstract: parsed.data.abstract,
        fullDescription: parsed.data.fullDescription,
        visibility: parsed.data.visibility,
        bountyType: parsed.data.bountyType || null,
        bountyValue: parsed.data.bountyValue || null,
        skills: JSON.stringify(parsed.data.skills || []),
        sector: parsed.data.sector || null,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        ipClauseAccepted: parsed.data.ipClauseAccepted,
      },
    });

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}

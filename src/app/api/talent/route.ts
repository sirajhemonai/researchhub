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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const university = searchParams.get("university") || "";
    const skill = searchParams.get("skill") || "";
    const available = searchParams.get("available") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const userWhere: Record<string, unknown> = {};
    if (role) {
      userWhere.role = role;
    } else {
      userWhere.role = { in: ["student", "researcher"] };
    }

    if (search) {
      userWhere.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const profileWhere: Record<string, unknown> = {};
    if (university) profileWhere.university = university;
    if (skill) profileWhere.skills = { contains: skill };
    if (available === "true") profileWhere.availableForInternship = true;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          ...userWhere,
          profile: profileWhere,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          trustScore: true,
          profile: {
            select: {
              university: true,
              department: true,
              skills: true,
              bio: true,
              gpa: true,
              graduationYear: true,
              availableForInternship: true,
              researchInterests: true,
              portfolioItems: true,
              pastResearch: true,
              availableForConsulting: true,
              verificationStatus: true,
            },
          },
          _count: { select: { submissions: true } },
        },
        orderBy: { trustScore: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({
        where: {
          ...userWhere,
          profile: profileWhere,
        },
      }),
    ]);

    return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching talent:", error);
    return NextResponse.json({ error: "Failed to fetch talent" }, { status: 500 });
  }
}

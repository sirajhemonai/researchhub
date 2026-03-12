import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalStudents,
      totalResearchers,
      totalIndustry,
      totalProblems,
      openProblems,
      totalSubmissions,
      totalJobs,
      pendingVerifications,
      pendingFraudReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "researcher" } }),
      prisma.user.count({ where: { role: "industry" } }),
      prisma.problem.count(),
      prisma.problem.count({ where: { status: "open" } }),
      prisma.submission.count(),
      prisma.job.count(),
      prisma.verification.count({ where: { status: "pending" } }),
      prisma.fraudReport.count({ where: { status: "pending" } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalResearchers,
      totalIndustry,
      totalProblems,
      openProblems,
      totalSubmissions,
      totalJobs,
      pendingVerifications,
      pendingFraudReports,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "admin_review";

    const requests = await prisma.dataAccessRequest.findMany({
      where: { status },
      include: {
        dataAsset:  { select: { id: true, title: true, sensitivityLevel: true, accessMode: true } },
        requester:  { select: { id: true, name: true, email: true, role: true, profile: { select: { university: true, companyName: true } } } },
        agreement:  { select: { id: true, signedAt: true } },
        grant:      { select: { id: true, status: true, expiresAt: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching admin access requests:", error);
    return NextResponse.json({ error: "Failed to fetch access requests" }, { status: 500 });
  }
}

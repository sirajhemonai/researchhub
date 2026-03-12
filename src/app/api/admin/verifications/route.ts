import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifications = await prisma.verification.findMany({
      where: { status: "pending" },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, profile: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verificationId, status: newStatus, notes } = await req.json();

    if (!verificationId || !["approved", "rejected"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const verification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: newStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        notes,
      },
    });

    if (newStatus === "approved") {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verified: true },
      });
      await prisma.profile.update({
        where: { userId: verification.userId },
        data: { verificationStatus: "verified" },
      });
    }

    if (newStatus === "rejected") {
      await prisma.profile.update({
        where: { userId: verification.userId },
        data: { verificationStatus: "rejected" },
      });
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}

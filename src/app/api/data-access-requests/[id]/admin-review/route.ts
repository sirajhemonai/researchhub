import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const request = await prisma.dataAccessRequest.findUnique({
      where: { id },
      include: { dataAsset: true },
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (request.status !== "admin_review") {
      return NextResponse.json({ error: "Request is not awaiting admin review" }, { status: 400 });
    }

    const { decision, rejectionReason } = await req.json();
    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be approved or rejected" }, { status: 400 });
    }

    const newStatus = decision === "approved" ? "approved" : "rejected";

    const updated = await prisma.dataAccessRequest.update({
      where: { id },
      data: {
        adminDecision:   decision,
        status:          newStatus,
        rejectionReason: decision === "rejected" ? (rejectionReason || null) : request.rejectionReason,
        reviewedAt:      new Date(),
      },
    });

    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: request.dataAssetId,
        requestId:   id,
        action:      decision === "approved" ? "admin_approved" : "admin_rejected",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
        metadata:    rejectionReason ? JSON.stringify({ rejectionReason }) : null,
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Error in admin review:", error);
    return NextResponse.json({ error: "Failed to process admin review" }, { status: 500 });
  }
}

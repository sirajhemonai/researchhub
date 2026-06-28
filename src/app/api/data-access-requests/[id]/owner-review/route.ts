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

    const { id } = await params;

    const request = await prisma.dataAccessRequest.findUnique({
      where: { id },
      include: { dataAsset: true },
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (request.dataAsset.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the asset owner can review this request" }, { status: 403 });
    }

    if (!["pending", "owner_review"].includes(request.status)) {
      return NextResponse.json({ error: "Request is not in a reviewable state" }, { status: 400 });
    }

    const { decision, rejectionReason } = await req.json();
    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be approved or rejected" }, { status: 400 });
    }

    const newStatus = decision === "approved" ? "admin_review" : "rejected";

    const updated = await prisma.dataAccessRequest.update({
      where: { id },
      data: {
        ownerDecision:  decision,
        status:         newStatus,
        rejectionReason: decision === "rejected" ? (rejectionReason || null) : null,
        reviewedAt:     new Date(),
      },
    });

    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: request.dataAssetId,
        requestId:   id,
        action:      decision === "approved" ? "owner_approved" : "owner_rejected",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
        metadata:    rejectionReason ? JSON.stringify({ rejectionReason }) : null,
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Error in owner review:", error);
    return NextResponse.json({ error: "Failed to process owner review" }, { status: 500 });
  }
}

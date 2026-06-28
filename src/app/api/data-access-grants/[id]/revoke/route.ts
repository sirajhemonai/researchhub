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

    const grant = await prisma.dataAccessGrant.findUnique({
      where: { id },
      include: { dataAsset: true },
    });

    if (!grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });

    const isOwner = grant.dataAsset.ownerId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Only the asset owner or an admin can revoke access" }, { status: 403 });
    }

    if (grant.status !== "active") {
      return NextResponse.json({ error: "Grant is not active" }, { status: 400 });
    }

    const updated = await prisma.dataAccessGrant.update({
      where: { id },
      data: { status: "revoked", revokedAt: new Date() },
    });

    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: grant.dataAssetId,
        requestId:   grant.requestId,
        action:      "access_revoked",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
        metadata:    JSON.stringify({ revokedBy: session.user.role }),
      },
    });

    return NextResponse.json({ grant: updated });
  } catch (error) {
    console.error("Error revoking grant:", error);
    return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 });
  }
}

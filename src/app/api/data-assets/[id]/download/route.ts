import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.dataAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // check for active grant
    const grant = await prisma.dataAccessGrant.findFirst({
      where: {
        userId:      session.user.id,
        dataAssetId: id,
        status:      "active",
      },
    });

    // log the attempt regardless
    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: id,
        action:      "download_attempted",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
        userAgent:   req.headers.get("user-agent") || null,
        metadata:    JSON.stringify({ grantFound: !!grant }),
      },
    });

    if (!grant) {
      return NextResponse.json({ error: "No active access grant" }, { status: 403 });
    }

    // check expiry
    if (grant.expiresAt < new Date()) {
      await prisma.dataAccessGrant.update({ where: { id: grant.id }, data: { status: "expired" } });
      return NextResponse.json({ error: "Access grant has expired" }, { status: 403 });
    }

    // In production this would return a signed short-lived URL from S3/R2.
    // For MVP: return a placeholder URL based on storagePath.
    const downloadUrl = asset.storagePath
      ? `${asset.storagePath}?token=${Buffer.from(`${grant.id}:${Date.now()}`).toString("base64")}&expires=${Date.now() + 15 * 60 * 1000}`
      : null;

    return NextResponse.json({
      downloadUrl,
      expiresAt:    grant.expiresAt,
      accessMode:   grant.accessMode,
      message:      asset.storagePath ? "Download link generated (valid 15 minutes)" : "This dataset is available in controlled access mode only. Contact the owner for workspace access.",
    });
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}

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
    const status = searchParams.get("status") || "review";

    const assets = await prisma.dataAsset.findMany({
      where: { status },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true, profile: { select: { companyName: true } } },
        },
        _count: { select: { accessRequests: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching admin data assets:", error);
    return NextResponse.json({ error: "Failed to fetch data assets" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { assetId, action } = await req.json();
    if (!assetId || !["publish", "suspend", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      publish:  "published",
      suspend:  "suspended",
      reject:   "draft",
    };

    const asset = await prisma.dataAsset.update({
      where: { id: assetId },
      data:  { status: statusMap[action] },
    });

    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: assetId,
        action:      `admin_${action}ed_asset`,
        ipAddress:   req.headers.get("x-forwarded-for") || null,
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error updating data asset status:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

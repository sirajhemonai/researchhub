import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dataAssetSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.dataAsset.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, profile: { select: { companyName: true, companySector: true, avatarUrl: true } } },
        },
        _count: { select: { accessRequests: true } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Data asset not found" }, { status: 404 });
    }

    // non-admins can only see published assets unless they are the owner
    if (asset.status !== "published" && asset.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // check if the requesting user has an active grant
    const grant = await prisma.dataAccessGrant.findFirst({
      where: { userId: session.user.id, dataAssetId: id, status: "active" },
    });

    // check if the requesting user has a pending/approved request
    const existingRequest = await prisma.dataAccessRequest.findFirst({
      where: { requesterId: session.user.id, dataAssetId: id },
      orderBy: { createdAt: "desc" },
    });

    // log metadata view
    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: id,
        action:      "viewed_metadata",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
        userAgent:   req.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ asset, grant, existingRequest });
  } catch (error) {
    console.error("Error fetching data asset:", error);
    return NextResponse.json({ error: "Failed to fetch data asset" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const asset = await prisma.dataAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (asset.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // handle submit-for-review action
    if (body.action === "submit_for_review") {
      const updated = await prisma.dataAsset.update({
        where: { id },
        data: { status: "review" },
      });
      await prisma.dataAuditLog.create({
        data: { userId: session.user.id, dataAssetId: id, action: "submitted_for_review", ipAddress: req.headers.get("x-forwarded-for") || null },
      });
      return NextResponse.json({ asset: updated });
    }

    const parsed = dataAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const d = parsed.data;
    if (d.sensitivityLevel === "critical" && d.accessMode === "download") {
      return NextResponse.json({ error: "Critical sensitivity data cannot use download access mode" }, { status: 400 });
    }

    const updated = await prisma.dataAsset.update({
      where: { id },
      data: {
        title:           d.title,
        description:     d.description,
        sector:          d.sector || null,
        dataType:        d.dataType,
        sensitivityLevel: d.sensitivityLevel,
        accessMode:      d.accessMode,
        anonymization:   d.anonymization,
        recordsCount:    d.recordsCount || null,
        timePeriod:      d.timePeriod || null,
        ndaRequired:     d.ndaRequired,
        ethicsRequired:  d.ethicsRequired,
        commercialUse:   d.commercialUse,
      },
    });

    return NextResponse.json({ asset: updated });
  } catch (error) {
    console.error("Error updating data asset:", error);
    return NextResponse.json({ error: "Failed to update data asset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const asset = await prisma.dataAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (asset.ownerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.dataAsset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting data asset:", error);
    return NextResponse.json({ error: "Failed to delete data asset" }, { status: 500 });
  }
}

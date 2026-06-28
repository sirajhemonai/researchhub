import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dataAssetSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";
    const sensitivityLevel = searchParams.get("sensitivityLevel") || "";
    const dataType = searchParams.get("dataType") || "";
    const accessMode = searchParams.get("accessMode") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = { status: "published" };
    if (sector) where.sector = sector;
    if (sensitivityLevel) where.sensitivityLevel = sensitivityLevel;
    if (dataType) where.dataType = dataType;
    if (accessMode) where.accessMode = accessMode;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.dataAsset.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, profile: { select: { companyName: true, companySector: true } } },
          },
          _count: { select: { accessRequests: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dataAsset.count({ where }),
    ]);

    return NextResponse.json({ assets, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching data assets:", error);
    return NextResponse.json({ error: "Failed to fetch data assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["industry", "government", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only industry, government, or admin users can publish data assets" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = dataAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const d = parsed.data;

    // critical sensitivity must use metadata_only or controlled
    if (d.sensitivityLevel === "critical" && d.accessMode === "download") {
      return NextResponse.json({ error: "Critical sensitivity data cannot use download access mode" }, { status: 400 });
    }

    const asset = await prisma.dataAsset.create({
      data: {
        ownerId:         session.user.id,
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
        status:          "draft",
      },
    });

    // audit log
    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: asset.id,
        action:      "asset_created",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating data asset:", error);
    return NextResponse.json({ error: "Failed to create data asset" }, { status: 500 });
  }
}

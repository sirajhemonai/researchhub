import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dataAccessRequestSchema } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["student", "researcher", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Only students and researchers can request data access" }, { status: 403 });
    }

    const { id } = await params;

    const asset = await prisma.dataAsset.findUnique({ where: { id } });
    if (!asset || asset.status !== "published") {
      return NextResponse.json({ error: "Data asset not found or not published" }, { status: 404 });
    }

    // prevent owner from requesting their own asset
    if (asset.ownerId === session.user.id) {
      return NextResponse.json({ error: "You cannot request access to your own asset" }, { status: 400 });
    }

    // prevent duplicate active requests
    const existing = await prisma.dataAccessRequest.findFirst({
      where: {
        requesterId: session.user.id,
        dataAssetId: id,
        status: { notIn: ["rejected", "revoked", "expired"] },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have an active request for this dataset" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = dataAccessRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const d = parsed.data;

    const request = await prisma.dataAccessRequest.create({
      data: {
        dataAssetId:    id,
        requesterId:    session.user.id,
        purpose:        d.purpose,
        methodology:    d.methodology || null,
        expectedOutput: d.expectedOutput || null,
        institution:    d.institution || null,
        ethicsDocUrl:   d.ethicsDocUrl || null,
        requestedDays:  parseInt(d.requestedDays),
        status:         "pending",
      },
    });

    await prisma.dataAuditLog.create({
      data: {
        userId:      session.user.id,
        dataAssetId: id,
        requestId:   request.id,
        action:      "requested_access",
        ipAddress:   req.headers.get("x-forwarded-for") || null,
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Error submitting access request:", error);
    return NextResponse.json({ error: "Failed to submit access request" }, { status: 500 });
  }
}

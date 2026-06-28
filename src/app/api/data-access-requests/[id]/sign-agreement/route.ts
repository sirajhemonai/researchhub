import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NDA_TEMPLATE = `DATA USE AGREEMENT

This Data Use Agreement ("Agreement") is entered into between the data owner ("Provider") and the researcher ("Recipient").

1. PURPOSE: The Recipient may use the data solely for the research purpose stated in their access request.
2. CONFIDENTIALITY: The Recipient agrees to keep all data strictly confidential and not disclose it to any third party.
3. NO REDISTRIBUTION: The data shall not be copied, transferred, published, or redistributed in any form.
4. SECURITY: The Recipient shall implement reasonable security measures to prevent unauthorised access.
5. COMPLIANCE: The Recipient shall comply with all applicable data protection laws and regulations.
6. TERMINATION: Access may be revoked at any time if these terms are violated.
7. LIABILITY: The Recipient accepts full liability for any breach of this agreement.

By signing, the Recipient acknowledges they have read, understood, and agree to be bound by these terms.`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const request = await prisma.dataAccessRequest.findUnique({
      where: { id },
      include: { dataAsset: true, agreement: true },
    });

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (request.requesterId !== session.user.id) {
      return NextResponse.json({ error: "You can only sign your own agreement" }, { status: 403 });
    }

    if (request.status !== "approved") {
      return NextResponse.json({ error: "Request must be approved before signing" }, { status: 400 });
    }

    if (request.agreement) {
      return NextResponse.json({ error: "Agreement already signed" }, { status: 400 });
    }

    const { confirmed } = await req.json();
    if (!confirmed) {
      return NextResponse.json({ error: "You must confirm the agreement" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || null;

    // atomically create agreement + grant
    const [agreement, grant] = await prisma.$transaction(async (tx) => {
      const agr = await tx.dataUseAgreement.create({
        data: {
          requestId:      id,
          agreementText:  NDA_TEMPLATE,
          signedByUserId: session.user.id,
          ipAddress:      ip,
          status:         "signed",
        },
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (request.requestedDays || 30));

      const grt = await tx.dataAccessGrant.create({
        data: {
          requestId:   id,
          userId:      session.user.id,
          dataAssetId: request.dataAssetId,
          accessMode:  request.dataAsset.accessMode,
          expiresAt,
          status:      "active",
        },
      });

      await tx.dataAuditLog.create({
        data: {
          userId:      session.user.id,
          dataAssetId: request.dataAssetId,
          requestId:   id,
          action:      "agreement_signed",
          ipAddress:   ip,
          userAgent:   req.headers.get("user-agent") || null,
        },
      });

      await tx.dataAuditLog.create({
        data: {
          userId:      session.user.id,
          dataAssetId: request.dataAssetId,
          requestId:   id,
          action:      "access_granted",
          ipAddress:   ip,
          metadata:    JSON.stringify({ expiresAt, accessMode: request.dataAsset.accessMode }),
        },
      });

      return [agr, grt];
    });

    return NextResponse.json({ agreement, grant }, { status: 201 });
  } catch (error) {
    console.error("Error signing agreement:", error);
    return NextResponse.json({ error: "Failed to sign agreement" }, { status: 500 });
  }
}

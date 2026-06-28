import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "mine"; // mine | incoming

    if (view === "incoming") {
      // owner sees requests on their assets
      const requests = await prisma.dataAccessRequest.findMany({
        where: {
          dataAsset: { ownerId: session.user.id },
        },
        include: {
          dataAsset: { select: { id: true, title: true, sensitivityLevel: true, accessMode: true } },
          requester:  { select: { id: true, name: true, email: true, role: true, profile: { select: { university: true, companyName: true } } } },
          agreement:  { select: { id: true, signedAt: true, status: true } },
          grant:      { select: { id: true, status: true, expiresAt: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ requests });
    }

    // researcher sees their own requests
    const requests = await prisma.dataAccessRequest.findMany({
      where: { requesterId: session.user.id },
      include: {
        dataAsset: { select: { id: true, title: true, sensitivityLevel: true, accessMode: true, ndaRequired: true } },
        agreement:  { select: { id: true, signedAt: true, status: true } },
        grant:      { select: { id: true, status: true, expiresAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json({ error: "Failed to fetch access requests" }, { status: 500 });
  }
}

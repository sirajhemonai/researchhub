import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isPrivateOrReservedHostname(hostname: string): boolean {
  const blocked = [
    "localhost", "127.0.0.1", "0.0.0.0", "[::1]", "[::0]",
    "metadata.google.internal", "169.254.169.254",
  ];
  if (blocked.includes(hostname.toLowerCase())) return true;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return true;

  const parts = hostname.split(".");
  if (parts.every(p => /^\d+$/.test(p)) && parts.length === 4) {
    const [a, b] = parts.map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
  }
  return false;
}

async function checkUrlReachability(url: string): Promise<{ status: "pass" | "manual_review" | "fail"; httpStatus?: number }> {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { status: "fail" };
    }

    if (isPrivateOrReservedHostname(parsed.hostname)) {
      return { status: "fail" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (response.status === 200) return { status: "pass", httpStatus: 200 };
    if (response.status === 403) return { status: "manual_review", httpStatus: 403 };
    return { status: "fail", httpStatus: response.status };
  } catch {
    return { status: "fail" };
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const engagement = await prisma.engagement.findUnique({
      where: { id },
      include: { milestones: { orderBy: { order: "asc" } } },
    });

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    if (engagement.status !== "active") {
      return NextResponse.json({ error: "Engagement must be active to submit milestones" }, { status: 400 });
    }

    const userId = session.user.id;
    if (engagement.studentId !== userId) {
      return NextResponse.json({ error: "Only the student can submit deliverables" }, { status: 403 });
    }

    const body = await req.json();
    const { milestoneId, deliverableUrl, writtenNote } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    const milestone = engagement.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found in this engagement" }, { status: 404 });
    }

    if (milestone.status !== "pending" && milestone.status !== "revision_requested") {
      return NextResponse.json({ error: "Milestone is not in a submittable state" }, { status: 400 });
    }

    const previousMilestones = engagement.milestones.filter(m => m.order < milestone.order);
    const completedStatuses = ["approved", "refunded"];
    for (const prev of previousMilestones) {
      if (!completedStatuses.includes(prev.status)) {
        return NextResponse.json({ error: `Previous milestone "${prev.title}" must be completed first` }, { status: 400 });
      }
      if (prev.status === "approved") {
        const prevTags = await prisma.milestoneTag.findMany({ where: { milestoneId: prev.id } });
        if (prevTags.length < 2) {
          return NextResponse.json({ error: `Tagging for milestone "${prev.title}" must be completed before proceeding` }, { status: 400 });
        }
      }
    }

    if (!deliverableUrl || typeof deliverableUrl !== "string") {
      return NextResponse.json({ error: "Deliverable URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(deliverableUrl);
    } catch {
      return NextResponse.json({ error: "Deliverable URL must be a valid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Deliverable URL must use http or https protocol" }, { status: 400 });
    }

    if (isPrivateOrReservedHostname(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Deliverable URL must point to a public host" }, { status: 400 });
    }

    if (!writtenNote || typeof writtenNote !== "string") {
      return NextResponse.json({ error: "Written note is required" }, { status: 400 });
    }

    const wordCount = countWords(writtenNote);
    if (wordCount < 50) {
      return NextResponse.json({ error: `Written note must be at least 50 words (currently ${wordCount})` }, { status: 400 });
    }

    const urlCheck = await checkUrlReachability(deliverableUrl);
    if (urlCheck.status === "fail") {
      return NextResponse.json({
        error: "Deliverable URL is not reachable. Please provide a valid, accessible URL.",
        autoCheckResult: { urlCheck: "fail", httpStatus: urlCheck.httpStatus, wordCount, isLate: false },
      }, { status: 400 });
    }

    const isLateNow = new Date() > new Date(milestone.dueDate);
    const isLate = milestone.isLate !== null ? milestone.isLate : isLateNow;

    const autoCheckResult = {
      urlCheck: urlCheck.status,
      httpStatus: urlCheck.httpStatus,
      wordCount,
      isLate,
    };

    const updateData: Record<string, unknown> = {
      deliverableUrl,
      writtenNote,
      autoCheckResult: JSON.stringify(autoCheckResult),
      status: "under_review",
      submittedAt: new Date(),
      reviewDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    };

    if (milestone.isLate === null) {
      updateData.isLate = isLate;
    }

    if (urlCheck.status === "manual_review") {
      await prisma.adminAction.create({
        data: {
          adminId: userId,
          actionType: "milestone_url_manual_review",
          entityId: milestoneId,
          entityType: "milestone",
          engagementId: engagement.id,
          notes: `Milestone "${milestone.title}" URL returned HTTP 403 — requires admin review. URL: ${deliverableUrl}`,
          metadata: JSON.stringify({ milestoneId, httpStatus: urlCheck.httpStatus, url: deliverableUrl }),
        },
      });
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error submitting milestone:", error);
    return NextResponse.json({ error: "Failed to submit milestone" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        engagement: true,
        disputes: true,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isCompany = milestone.engagement.companyId === userId;
    const isStudent = milestone.engagement.studentId === userId;
    const isAdmin = session.user.role === "admin";

    if (!isCompany && !isStudent && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "approve") {
      if (!isCompany && !isAdmin) {
        return NextResponse.json({ error: "Only company can approve milestones" }, { status: 403 });
      }

      if (milestone.status !== "under_review") {
        return NextResponse.json({ error: "Milestone must be under review to approve" }, { status: 400 });
      }

      const updated = await prisma.milestone.update({
        where: { id },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });

      return NextResponse.json(updated);
    }

    if (action === "request_revision") {
      if (!isCompany && !isAdmin) {
        return NextResponse.json({ error: "Only company can request revisions" }, { status: 403 });
      }

      if (milestone.status !== "under_review") {
        return NextResponse.json({ error: "Milestone must be under review to request revision" }, { status: 400 });
      }

      if (milestone.revisionCount >= 2) {
        return NextResponse.json({ error: "Maximum revisions (2) exhausted. Use dispute escalation instead." }, { status: 400 });
      }

      const { feedback } = body;
      if (!feedback || typeof feedback !== "string") {
        return NextResponse.json({ error: "Feedback is required" }, { status: 400 });
      }

      if (countWords(feedback) < 30) {
        return NextResponse.json({ error: `Feedback must be at least 30 words (currently ${countWords(feedback)})` }, { status: 400 });
      }

      const updated = await prisma.milestone.update({
        where: { id },
        data: {
          status: "revision_requested",
          companyFeedback: feedback,
          revisionCount: milestone.revisionCount + 1,
          reviewDeadline: null,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === "extend_review") {
      if (!isCompany && !isAdmin) {
        return NextResponse.json({ error: "Only company can extend review" }, { status: 403 });
      }

      if (milestone.status !== "under_review") {
        return NextResponse.json({ error: "Milestone must be under review to extend" }, { status: 400 });
      }

      if (milestone.extensionsUsed >= 1) {
        return NextResponse.json({ error: "Extension already used for this milestone" }, { status: 400 });
      }

      const newDeadline = milestone.reviewDeadline
        ? new Date(new Date(milestone.reviewDeadline).getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const updated = await prisma.milestone.update({
        where: { id },
        data: {
          extensionsUsed: milestone.extensionsUsed + 1,
          reviewDeadline: newDeadline,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === "escalate_dispute") {
      if (!isCompany && !isStudent) {
        return NextResponse.json({ error: "Only engagement parties can escalate disputes" }, { status: 403 });
      }

      if (milestone.status !== "under_review" && milestone.status !== "revision_requested") {
        return NextResponse.json({ error: "Cannot dispute this milestone in its current state" }, { status: 400 });
      }

      const existingDispute = milestone.disputes.find(d => !d.resolvedAt);
      if (existingDispute) {
        return NextResponse.json({ error: "An active dispute already exists for this milestone" }, { status: 400 });
      }

      const dispute = await prisma.dispute.create({
        data: {
          milestoneId: id,
          raisedById: userId,
          engagementId: milestone.engagementId,
          status: "open",
        },
      });

      await prisma.milestone.update({
        where: { id },
        data: { status: "disputed" },
      });

      return NextResponse.json(dispute);
    }

    if (action === "resolve_dispute") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Only admin can resolve disputes" }, { status: 403 });
      }

      const { disputeId, ruling, rulingPercent, rulingNotes, notes } = body;
      if (!disputeId || !ruling || !rulingNotes) {
        return NextResponse.json({ error: "disputeId, ruling, and rulingNotes are required" }, { status: 400 });
      }

      const existingDispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
      if (!existingDispute || existingDispute.milestoneId !== id) {
        return NextResponse.json({ error: "Dispute not found for this milestone" }, { status: 404 });
      }
      if (existingDispute.resolvedAt) {
        return NextResponse.json({ error: "This dispute has already been resolved. Rulings are immutable." }, { status: 400 });
      }

      if (!["full_release", "partial", "refund"].includes(ruling)) {
        return NextResponse.json({ error: "Invalid ruling type" }, { status: 400 });
      }

      if (ruling === "partial" && (rulingPercent === undefined || rulingPercent < 0 || rulingPercent > 100)) {
        return NextResponse.json({ error: "Partial ruling requires a valid percentage (0-100)" }, { status: 400 });
      }

      const adminNotes = notes || rulingNotes;
      if (!adminNotes || adminNotes.trim().length < 10) {
        return NextResponse.json({ error: "Admin notes must be at least 10 characters" }, { status: 400 });
      }

      const dispute = await prisma.dispute.update({
        where: { id: disputeId },
        data: {
          adminId: userId,
          ruling,
          rulingPercent: ruling === "partial" ? rulingPercent : null,
          rulingNotes,
          resolvedAt: new Date(),
        },
      });

      await prisma.adminAction.create({
        data: {
          adminId: userId,
          actionType: "resolve_dispute",
          entityId: disputeId,
          entityType: "dispute",
          engagementId: milestone.engagementId,
          notes: adminNotes.trim(),
          metadata: JSON.stringify({ ruling, rulingPercent, milestoneId: id }),
        },
      });

      if (ruling === "full_release" || ruling === "partial") {
        await prisma.milestone.update({
          where: { id },
          data: {
            status: "approved",
            approvedAt: new Date(),
          },
        });
      } else if (ruling === "refund") {
        await prisma.milestone.update({
          where: { id },
          data: {
            status: "refunded",
          },
        });
      }

      const disputeCount = await prisma.dispute.count({
        where: {
          milestone: { engagement: { companyId: milestone.engagement.companyId } },
          resolvedAt: { not: null },
        },
      });

      let standingBadge = "green";
      if (disputeCount >= 4) standingBadge = "banned";
      else if (disputeCount >= 3) standingBadge = "red";
      else if (disputeCount >= 1) standingBadge = "yellow";

      await prisma.profile.updateMany({
        where: { userId: milestone.engagement.companyId },
        data: { standingBadge },
      });

      return NextResponse.json(dispute);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COMPANY_TAGS_FOR_STUDENT = [
  "submitted_on_time",
  "communication_clear",
  "deliverable_matched_scope",
  "needed_multiple_revisions",
  "required_significant_guidance",
];

const STUDENT_TAGS_FOR_COMPANY = [
  "reviewed_promptly",
  "feedback_was_specific",
  "unresponsive",
  "changed_scope_mid_milestone",
  "payment_committed",
];

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
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { engagement: true, tags: true },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (milestone.status !== "approved") {
      return NextResponse.json({ error: "Milestone must be approved before tagging" }, { status: 400 });
    }

    if (!milestone.approvedAt) {
      return NextResponse.json({ error: "Milestone approval time not recorded" }, { status: 400 });
    }

    const hoursSinceApproval = (Date.now() - new Date(milestone.approvedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceApproval < 48) {
      return NextResponse.json({ error: "Tagging opens 48 hours after milestone approval" }, { status: 400 });
    }

    const userId = session.user.id;
    const isCompany = milestone.engagement.companyId === userId;
    const isStudent = milestone.engagement.studentId === userId;

    if (!isCompany && !isStudent) {
      return NextResponse.json({ error: "Only engagement parties can submit tags" }, { status: 403 });
    }

    const existingTag = milestone.tags.find(t => t.submittedBy === userId);
    if (existingTag) {
      return NextResponse.json({ error: "You have already submitted tags for this milestone" }, { status: 400 });
    }

    const body = await req.json();
    const { tags } = body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
    }

    const validTags = isCompany ? COMPANY_TAGS_FOR_STUDENT : STUDENT_TAGS_FOR_COMPANY;
    const invalidTags = tags.filter((t: string) => !validTags.includes(t));
    if (invalidTags.length > 0) {
      return NextResponse.json({ error: `Invalid tags: ${invalidTags.join(", ")}` }, { status: 400 });
    }

    const tag = await prisma.milestoneTag.create({
      data: {
        milestoneId: id,
        submittedBy: userId,
        taggedRole: isCompany ? "company" : "student",
        tags: JSON.stringify(tags),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error submitting milestone tags:", error);
    return NextResponse.json({ error: "Failed to submit tags" }, { status: 500 });
  }
}

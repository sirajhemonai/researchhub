import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STUDENT_TAGS_FOR_COMPANY = [
  "clear_requirements",
  "responsive_communication",
  "fair_timeline",
  "constructive_feedback",
  "professional_conduct",
  "scope_creep",
  "delayed_reviews",
  "unclear_expectations",
];

const COMPANY_TAGS_FOR_STUDENT = [
  "submitted_on_time",
  "communication_clear",
  "deliverable_matched_scope",
  "proactive_updates",
  "high_quality_work",
  "missed_deadlines",
  "poor_communication",
  "incomplete_deliverables",
];

const OVERALL_TAGS = ["would_collaborate_again", "would_not_recommend", "neutral"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: { projectRatings: true },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const userId = session.user.id;
  if (engagement.companyId !== userId && engagement.studentId !== userId) {
    return NextResponse.json({ error: "Not a party to this engagement" }, { status: 403 });
  }

  const isCompany = engagement.companyId === userId;
  const availableTags = isCompany ? COMPANY_TAGS_FOR_STUDENT : STUDENT_TAGS_FOR_COMPANY;

  const closedAt = engagement.closedAt || engagement.completedAt;
  if (!closedAt) {
    return NextResponse.json({ ratingOpen: false, reason: "Project not yet closed" });
  }

  const windowOpenDate = new Date(closedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const windowCloseDate = new Date(closedAt.getTime() + 21 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const ratingOpen = now >= windowOpenDate && now <= windowCloseDate;
  const existingRating = engagement.projectRatings.find((r) => r.raterId === userId);

  return NextResponse.json({
    ratingOpen,
    windowOpens: windowOpenDate.toISOString(),
    windowCloses: windowCloseDate.toISOString(),
    alreadyRated: !!existingRating,
    existingRating: existingRating || null,
    availableTags,
    overallTags: OVERALL_TAGS,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { tags, overallTag } = body;

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json({ error: "At least one tag is required" }, { status: 400 });
  }
  if (!overallTag || !OVERALL_TAGS.includes(overallTag)) {
    return NextResponse.json({ error: "Valid overall tag is required" }, { status: 400 });
  }

  const engagement = await prisma.engagement.findUnique({
    where: { id },
    include: { projectRatings: true },
  });

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
  }

  const userId = session.user.id;
  if (engagement.companyId !== userId && engagement.studentId !== userId) {
    return NextResponse.json({ error: "Not a party to this engagement" }, { status: 403 });
  }

  const closedAt = engagement.closedAt || engagement.completedAt;
  if (!closedAt) {
    return NextResponse.json({ error: "Project not yet closed" }, { status: 400 });
  }

  const windowOpenDate = new Date(closedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const windowCloseDate = new Date(closedAt.getTime() + 21 * 24 * 60 * 60 * 1000);
  const now = new Date();

  if (now < windowOpenDate || now > windowCloseDate) {
    return NextResponse.json({ error: "Rating window is not open" }, { status: 400 });
  }

  const existingRating = engagement.projectRatings.find((r) => r.raterId === userId);
  if (existingRating) {
    return NextResponse.json({ error: "Already submitted rating" }, { status: 400 });
  }

  const isCompany = engagement.companyId === userId;
  const rateeId = isCompany ? engagement.studentId : engagement.companyId;
  const validTags = isCompany ? COMPANY_TAGS_FOR_STUDENT : STUDENT_TAGS_FOR_COMPANY;

  const invalidTags = tags.filter((t: string) => !validTags.includes(t));
  if (invalidTags.length > 0) {
    return NextResponse.json({ error: `Invalid tags: ${invalidTags.join(", ")}` }, { status: 400 });
  }

  const rating = await prisma.projectRating.create({
    data: {
      engagementId: id,
      raterId: userId,
      rateeId,
      tags: JSON.stringify(tags),
      overallTag,
    },
  });

  return NextResponse.json({ success: true, rating });
}

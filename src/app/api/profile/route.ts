import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAndPersistTrustScore } from "@/lib/trust-score-server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        _count: {
          select: { submissions: true, problems: true, jobs: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const trustResult = await computeAndPersistTrustScore(session.user.id);

    const shortlistedCount = await prisma.submission.count({
      where: { userId: session.user.id, status: { in: ["shortlisted", "accepted"] } },
    });

    const engagementCount = await prisma.engagement.count({
      where: {
        OR: [
          { companyId: session.user.id },
          { studentId: session.user.id },
        ],
      },
    });

    const activeEngagementCount = await prisma.engagement.count({
      where: {
        OR: [
          { companyId: session.user.id },
          { studentId: session.user.id },
        ],
        status: "active",
      },
    });

    return NextResponse.json({
      ...user,
      trustScore: trustResult.score,
      trustBreakdown: trustResult.factors,
      _stats: {
        shortlisted: shortlistedCount,
        engagements: engagementCount,
        activeEngagements: activeEngagementCount,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const skillsValue = body.skills ? JSON.stringify(body.skills) : undefined;
    const researchInterestsValue = body.researchInterests
      ? JSON.stringify(body.researchInterests)
      : undefined;
    const publicationsValue = body.publications
      ? JSON.stringify(body.publications)
      : undefined;
    const portfolioItemsValue = body.portfolioItems !== undefined
      ? JSON.stringify(body.portfolioItems)
      : undefined;
    const pastResearchValue = body.pastResearch !== undefined
      ? JSON.stringify(body.pastResearch)
      : undefined;

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        bio: body.bio,
        phone: body.phone,
        location: body.location,
        linkedinUrl: body.linkedinUrl || null,
        githubUrl: body.githubUrl || null,
        portfolioUrl: body.portfolioUrl || null,
        skills: skillsValue,
        portfolioItems: portfolioItemsValue,
        pastResearch: pastResearchValue,
        university: body.university,
        department: body.department,
        studentId: body.studentId,
        gpa: body.gpa ? parseFloat(body.gpa) : undefined,
        graduationYear: body.graduationYear ? parseInt(body.graduationYear) : undefined,
        availableForInternship: body.availableForInternship,
        researchInterests: researchInterestsValue,
        publications: publicationsValue,
        orcidId: body.orcidId,
        googleScholarUrl: body.googleScholarUrl || null,
        researchGateUrl: body.researchGateUrl || null,
        hIndex: body.hIndex !== undefined && body.hIndex !== "" ? parseInt(body.hIndex) : undefined,
        publicationCount: body.publicationCount !== undefined && body.publicationCount !== "" ? parseInt(body.publicationCount) : undefined,
        citationCount: body.citationCount !== undefined && body.citationCount !== "" ? parseInt(body.citationCount) : undefined,
        availableForConsulting: body.availableForConsulting,
        companyName: body.companyName,
        companySector: body.companySector,
        companySize: body.companySize,
        tradeLicenseNumber: body.tradeLicenseNumber,
        website: body.website || null,
        yearEstablished: body.yearEstablished !== undefined && body.yearEstablished !== "" ? parseInt(body.yearEstablished) : undefined,
      },
    });

    if (body.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: body.name },
      });
    }

    await computeAndPersistTrustScore(session.user.id);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

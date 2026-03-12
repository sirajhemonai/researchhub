import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      include: {
        problem: { select: { id: true, title: true, abstract: true, bountyType: true, bountyValue: true, sector: true } },
        company: { select: { id: true, name: true, profile: { select: { companyName: true, standingBadge: true, phone: true } } } },
        student: { select: { id: true, name: true, profile: { select: { university: true, department: true } } } },
        milestones: {
          include: {
            tags: true,
            disputes: true,
          },
          orderBy: { order: "asc" },
        },
        adminActions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isParty = engagement.companyId === userId || engagement.studentId === userId;
    if (!isParty && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      engagement.status === "pending_deposit" &&
      engagement.depositDeadline &&
      new Date() > new Date(engagement.depositDeadline)
    ) {
      const expired = await prisma.engagement.update({
        where: { id },
        data: {
          status: "negotiating",
          companyConfirmed: false,
          studentConfirmed: false,
          depositDeadline: null,
          agreedAt: null,
          negotiationRound: 0,
          proposedBy: null,
          adminProposedBinding: false,
          agreementPdfUrl: null,
        },
      });
      return NextResponse.json({ ...engagement, ...expired });
    }

    return NextResponse.json(engagement);
  } catch (error) {
    console.error("Error fetching engagement:", error);
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 });
  }
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
    const engagement = await prisma.engagement.findUnique({
      where: { id },
      include: { milestones: true, company: { select: { profile: true } } },
    });

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isCompany = engagement.companyId === userId;
    const isStudent = engagement.studentId === userId;
    const isAdmin = session.user.role === "admin";

    if (!isCompany && !isStudent && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "propose_milestones") {
      if (engagement.status !== "negotiating") {
        return NextResponse.json({ error: "Can only propose milestones during negotiation" }, { status: 400 });
      }

      if (!isAdmin && engagement.negotiationRound >= 2 && !engagement.adminProposedBinding) {
        return NextResponse.json({ error: "Max negotiation rounds reached. Awaiting admin binding proposal." }, { status: 400 });
      }

      const { milestones, projectValueBdt } = body;
      if (!milestones || !Array.isArray(milestones) || milestones.length === 0 || milestones.length > 5) {
        return NextResponse.json({ error: "Provide 1-5 milestones" }, { status: 400 });
      }

      if (!projectValueBdt || projectValueBdt <= 0) {
        return NextResponse.json({ error: "Project value must be positive" }, { status: 400 });
      }

      await prisma.milestone.deleteMany({ where: { engagementId: id } });

      const milestoneData = milestones.map((m: { title: string; description: string; dueDate: string; submissionRequirements?: string }, i: number) => ({
        engagementId: id,
        title: m.title,
        description: m.description,
        dueDate: new Date(m.dueDate),
        submissionRequirements: m.submissionRequirements || null,
        order: i + 1,
        status: "pending",
      }));

      await prisma.milestone.createMany({ data: milestoneData });

      const feeRate = engagement.platformFeeRate || 0.10;
      const depositAmount = projectValueBdt * 0.3;
      const platformFee = projectValueBdt * feeRate;
      const netPayout = projectValueBdt - platformFee;

      const updateData: Record<string, unknown> = {
        projectValueBdt,
        depositAmountBdt: depositAmount,
        netStudentPayoutBdt: netPayout,
        proposedBy: userId,
      };

      updateData.companyConfirmed = false;
      updateData.studentConfirmed = false;

      if (isAdmin) {
        updateData.adminProposedBinding = true;
        updateData.negotiationRound = 3;
      } else {
        if (engagement.adminProposedBinding) {
          return NextResponse.json({ error: "Admin has proposed a binding split. Only admin can modify." }, { status: 400 });
        }
        updateData.negotiationRound = engagement.negotiationRound + 1;
        updateData.adminProposedBinding = false;
      }

      const updated = await prisma.engagement.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(updated);
    }

    if (action === "confirm_agreement") {
      if (engagement.status !== "negotiating") {
        return NextResponse.json({ error: "Can only confirm during negotiation" }, { status: 400 });
      }

      if (engagement.milestones.length === 0) {
        return NextResponse.json({ error: "No milestones proposed yet" }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {};

      if (isCompany) {
        updateData.companyConfirmed = true;
      } else if (isStudent) {
        updateData.studentConfirmed = true;
      }

      const bothConfirmed =
        (isCompany ? true : engagement.companyConfirmed) &&
        (isStudent ? true : engagement.studentConfirmed);

      if (bothConfirmed) {
        if (!engagement.namedContactPhone) {
          return NextResponse.json({ error: "Named contact phone is required before agreement can be generated" }, { status: 400 });
        }
        updateData.status = "pending_deposit";
        updateData.agreedAt = new Date();
        updateData.depositDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      }

      const updated = await prisma.engagement.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(updated);
    }

    if (action === "set_contact_phone") {
      if (!isCompany && !isAdmin) {
        return NextResponse.json({ error: "Only company can set contact phone" }, { status: 400 });
      }

      const { phone } = body;
      if (!phone || typeof phone !== "string" || phone.trim().length < 5) {
        return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
      }

      const updated = await prisma.engagement.update({
        where: { id },
        data: { namedContactPhone: phone.trim() },
      });

      return NextResponse.json(updated);
    }

    if (action === "mark_deposit_received") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Only admin can mark deposit received" }, { status: 403 });
      }

      if (engagement.status !== "pending_deposit") {
        return NextResponse.json({ error: "Engagement is not pending deposit" }, { status: 400 });
      }

      const { notes } = body;
      if (!notes || typeof notes !== "string" || notes.trim().length < 10) {
        return NextResponse.json({ error: "Admin notes must be at least 10 characters" }, { status: 400 });
      }

      await prisma.adminAction.create({
        data: {
          adminId: userId,
          actionType: "mark_deposit_received",
          entityId: id,
          entityType: "engagement",
          engagementId: id,
          notes: notes.trim(),
        },
      });

      const updated = await prisma.engagement.update({
        where: { id },
        data: {
          status: "active",
          depositConfirmedAt: new Date(),
        },
      });

      return NextResponse.json(updated);
    }

    if (action === "update_project_value") {
      if (!isCompany && !isAdmin) {
        return NextResponse.json({ error: "Only company or admin can update project value" }, { status: 400 });
      }
      if (engagement.status !== "negotiating") {
        return NextResponse.json({ error: "Can only update during negotiation" }, { status: 400 });
      }

      const { projectValueBdt } = body;
      if (!projectValueBdt || projectValueBdt <= 0) {
        return NextResponse.json({ error: "Project value must be positive" }, { status: 400 });
      }

      const feeRateForUpdate = engagement.platformFeeRate || 0.10;
      const updated = await prisma.engagement.update({
        where: { id },
        data: {
          projectValueBdt,
          depositAmountBdt: projectValueBdt * 0.3,
          netStudentPayoutBdt: projectValueBdt - (projectValueBdt * feeRateForUpdate),
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating engagement:", error);
    return NextResponse.json({ error: "Failed to update engagement" }, { status: 500 });
  }
}

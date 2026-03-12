import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateAgreementHtml(engagement: Record<string, unknown>): string {
  const problem = engagement.problem as Record<string, unknown>;
  const company = engagement.company as Record<string, unknown>;
  const student = engagement.student as Record<string, unknown>;
  const milestones = engagement.milestones as Array<Record<string, unknown>>;
  const companyProfile = (company.profile as Record<string, unknown>) || {};
  const studentProfile = (student.profile as Record<string, unknown>) || {};

  const e = (val: unknown) => escapeHtml(String(val || ""));

  const milestonesHtml = milestones.map((m, i) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${i + 1}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${e(m.title)}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${e(m.description)}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date(m.dueDate as string).toLocaleDateString("en-BD")}</td>
      <td style="padding: 8px; border: 1px solid #e2e8f0;">${e(m.submissionRequirements) || "N/A"}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ResearchBridge Agreement — ${e(problem.title)}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6; }
    h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f1f5f9; padding: 10px 8px; border: 1px solid #e2e8f0; text-align: left; font-weight: 600; }
    .section { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
    .highlight { background: #ecfdf5; padding: 15px; border-left: 4px solid #059669; border-radius: 4px; margin: 15px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.9em; color: #64748b; }
  </style>
</head>
<body>
  <h1>ResearchBridge Project Agreement</h1>
  <p><strong>Agreement Date:</strong> ${engagement.agreedAt ? new Date(engagement.agreedAt as string).toLocaleDateString("en-BD") : new Date().toLocaleDateString("en-BD")}</p>

  <h2>Project Details</h2>
  <div class="section">
    <p><strong>Project Title:</strong> ${e(problem.title)}</p>
    <p><strong>Sector:</strong> ${e(problem.sector) || "N/A"}</p>
    <p><strong>Bounty Type:</strong> ${e(problem.bountyType) || "N/A"}</p>
  </div>

  <h2>Parties</h2>
  <div class="section">
    <p><strong>Company:</strong> ${e(companyProfile.companyName || company.name)} (${e(company.email)})</p>
    <p><strong>Contact Phone:</strong> ${e(engagement.namedContactPhone) || "N/A"}</p>
    <p><strong>Student/Researcher:</strong> ${e(student.name)} (${e(student.email)})</p>
    <p><strong>University:</strong> ${e(studentProfile.university) || "N/A"}</p>
  </div>

  <h2>Payment Terms (BDT)</h2>
  <div class="highlight">
    <p><strong>Total Project Value:</strong> ৳${Number(engagement.projectValueBdt).toLocaleString()}</p>
    <p><strong>Deposit Amount (30%):</strong> ৳${Number(engagement.depositAmountBdt).toLocaleString()}</p>
    <p><strong>Platform Fee Rate:</strong> ${((engagement.platformFeeRate as number) * 100).toFixed(0)}%</p>
    <p><strong>Platform Fee Amount:</strong> ৳${(Number(engagement.projectValueBdt) * (engagement.platformFeeRate as number)).toLocaleString()}</p>
    <p><strong>Net Student Payout:</strong> ৳${Number(engagement.netStudentPayoutBdt).toLocaleString()}</p>
  </div>

  <h2>Milestone Schedule</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Description</th>
        <th>Due Date</th>
        <th>Requirements</th>
      </tr>
    </thead>
    <tbody>
      ${milestonesHtml}
    </tbody>
  </table>

  <h2>Revision Policy</h2>
  <div class="section">
    <ul>
      <li>Each milestone allows a maximum of <strong>2 revision requests</strong> by the company.</li>
      <li>Each revision request must include written feedback of at least 30 words.</li>
      <li>After 2 revisions are exhausted, either party may escalate to a dispute.</li>
      <li>The company has a 10-day review window per milestone, with one optional 7-day extension.</li>
    </ul>
  </div>

  <h2>Dispute Resolution Process</h2>
  <div class="section">
    <ul>
      <li>Either party may escalate a milestone to dispute after revisions are exhausted or during review.</li>
      <li>A ResearchBridge admin will review the dispute and issue a binding ruling.</li>
      <li>Possible rulings: <strong>Full Release</strong> (payment to student), <strong>Partial</strong> (percentage split), or <strong>Refund</strong> (to company).</li>
      <li>Dispute rulings are final and immutable.</li>
      <li>Company standing badge is updated based on dispute history.</li>
    </ul>
  </div>

  <h2>Certificate Conditions</h2>
  <div class="section">
    <p>Upon successful completion of all milestones and final payment release, the student will receive a ResearchBridge completion certificate. This requires all milestones to be approved and both-party tagging to be completed.</p>
  </div>

  <div class="footer">
    <p>This agreement is generated and managed by the ResearchBridge BD platform. Both parties have confirmed acceptance of these terms in-platform.</p>
    <p>Agreement ID: ${engagement.id}</p>
  </div>
</body>
</html>`;
}

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
        problem: { select: { title: true, sector: true, bountyType: true, bountyValue: true } },
        company: { select: { id: true, name: true, email: true, profile: { select: { companyName: true } } } },
        student: { select: { id: true, name: true, email: true, profile: { select: { university: true } } } },
        milestones: { orderBy: { order: "asc" } },
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

    if (!engagement.agreedAt && engagement.status === "negotiating") {
      return NextResponse.json({ error: "Agreement not yet finalized" }, { status: 400 });
    }

    const html = generateAgreementHtml(engagement as unknown as Record<string, unknown>);

    if (req.nextUrl.searchParams.get("format") === "json") {
      return NextResponse.json({ html, agreementPdfUrl: engagement.agreementPdfUrl });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating agreement:", error);
    return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
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
    });

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isParty = engagement.companyId === userId || engagement.studentId === userId;
    if (!isParty && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (engagement.status !== "pending_deposit" && engagement.status !== "active") {
      return NextResponse.json({ error: "Agreement can only be generated after both parties confirm" }, { status: 400 });
    }

    if (!engagement.namedContactPhone) {
      return NextResponse.json({ error: "Named contact phone is required before agreement generation" }, { status: 400 });
    }

    const agreementUrl = `/api/engagements/${id}/agreement`;

    const updated = await prisma.engagement.update({
      where: { id },
      data: { agreementPdfUrl: agreementUrl },
    });

    return NextResponse.json({ agreementPdfUrl: agreementUrl, engagement: updated });
  } catch (error) {
    console.error("Error saving agreement:", error);
    return NextResponse.json({ error: "Failed to save agreement" }, { status: 500 });
  }
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, Send,
  MessageSquare, FileText, ExternalLink, Plus, Trash2,
  Shield, ThumbsUp, ThumbsDown, RotateCcw, Flag, Tag,
  ChevronDown, ChevronRight, Timer, Building2, GraduationCap
} from "lucide-react";

interface MilestoneTag {
  id: string;
  taggedBy: string;
  taggedRole: string;
  tags: string;
}

interface Dispute {
  id: string;
  raisedBy: string;
  raisedAt: string;
  adminId?: string;
  ruling?: string;
  rulingPercent?: number;
  rulingNotes?: string;
  resolvedAt?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submissionRequirements?: string;
  order: number;
  deliverableUrl?: string;
  writtenNote?: string;
  isLate?: boolean;
  revisionCount: number;
  autoCheckResult?: string;
  status: string;
  companyFeedback?: string;
  submittedAt?: string;
  approvedAt?: string;
  reviewDeadline?: string;
  extensionUsed: boolean;
  tags: MilestoneTag[];
  disputes: Dispute[];
}

interface Engagement {
  id: string;
  status: string;
  problemId: string;
  companyId: string;
  studentId: string;
  problem: { id: string; title: string; abstract: string; bountyType?: string; bountyValue?: string; sector?: string };
  company: { id: string; name: string; profile?: { companyName?: string; standingBadge?: string; phone?: string } };
  student: { id: string; name: string; profile?: { university?: string; department?: string } };
  milestones: Milestone[];
  projectValueBdt?: number;
  platformFeeRate: number;
  depositAmountBdt?: number;
  netStudentPayoutBdt?: number;
  namedContactPhone?: string;
  negotiationRound: number;
  proposedBy?: string;
  adminProposedBinding: boolean;
  agreedAt?: string;
  companyConfirmed: boolean;
  studentConfirmed: boolean;
  depositDeadline?: string;
  depositConfirmedAt?: string;
  agreementPdfUrl?: string;
  adminActions: Array<{ id: string; actionType: string; notes: string; createdAt: string }>;
}

const BADGE_COLORS: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  banned: "bg-red-200 text-red-900",
};

const MILESTONE_STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600", icon: Clock },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: Send },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  revision_requested: { label: "Revision Requested", color: "bg-orange-100 text-orange-700", icon: RotateCcw },
  disputed: { label: "Disputed", color: "bg-red-100 text-red-700", icon: Flag },
  refunded: { label: "Refunded", color: "bg-amber-100 text-amber-700", icon: RotateCcw },
};

const COMPANY_TAGS = [
  "submitted_on_time", "communication_clear", "deliverable_matched_scope",
  "needed_multiple_revisions", "required_significant_guidance",
];

const STUDENT_TAGS = [
  "reviewed_promptly", "feedback_was_specific", "unresponsive",
  "changed_scope_mid_milestone", "payment_committed",
];

export default function EngagementWorkspacePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEngagement = useCallback(() => {
    fetch(`/api/engagements/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setEngagement(data);
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [id]);

  useEffect(() => { fetchEngagement(); }, [fetchEngagement]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-40 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !engagement) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-slate-900">{error || "Engagement not found"}</h1>
        <Link href="/engagements"><Button variant="outline" className="mt-4">Back to Engagements</Button></Link>
      </div>
    );
  }

  if (!session) return null;

  const userId = session.user.id;
  const isCompany = engagement.companyId === userId;
  const isStudent = engagement.studentId === userId;
  const isAdmin = session.user.role === "admin";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/engagements" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Engagements
      </Link>

      <EngagementHeader engagement={engagement} isCompany={isCompany} />

      <MetadataSection engagement={engagement} isStudent={isStudent} />

      {engagement.status === "negotiating" && (
        <NegotiationSection
          engagement={engagement}
          isCompany={isCompany}
          isStudent={isStudent}
          isAdmin={isAdmin}
          userId={userId}
          onRefresh={fetchEngagement}
          actionLoading={actionLoading}
          setActionLoading={setActionLoading}
        />
      )}

      {engagement.status === "pending_deposit" && (
        <DepositSection
          engagement={engagement}
          isAdmin={isAdmin}
          onRefresh={fetchEngagement}
          actionLoading={actionLoading}
          setActionLoading={setActionLoading}
        />
      )}

      {["active", "closing", "payment_released", "closed"].includes(engagement.status) && (
        <MilestoneTimeline
          engagement={engagement}
          isCompany={isCompany}
          isStudent={isStudent}
          isAdmin={isAdmin}
          userId={userId}
          onRefresh={fetchEngagement}
        />
      )}
    </div>
  );
}

function EngagementHeader({ engagement, isCompany }: { engagement: Engagement; isCompany: boolean }) {
  const statusLabels: Record<string, string> = {
    negotiating: "Negotiating",
    pending_deposit: "Pending Deposit",
    active: "Active",
    closing: "Closing",
    payment_released: "Payment Released",
    closed: "Closed",
    archived: "Archived",
  };

  const statusColors: Record<string, string> = {
    negotiating: "bg-blue-100 text-blue-700",
    pending_deposit: "bg-amber-100 text-amber-700",
    active: "bg-emerald-100 text-emerald-700",
    closing: "bg-purple-100 text-purple-700",
    payment_released: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-700",
    archived: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{engagement.problem.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Building2 className="w-4 h-4" />
              {engagement.company.profile?.companyName || engagement.company.name}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <GraduationCap className="w-4 h-4" />
              {engagement.student.name}
              {engagement.student.profile?.university && ` (${engagement.student.profile.university})`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={statusColors[engagement.status] || ""}>
            {statusLabels[engagement.status] || engagement.status}
          </Badge>
          {engagement.company.profile?.standingBadge && engagement.company.profile.standingBadge !== "green" && (
            <Badge className={BADGE_COLORS[engagement.company.profile.standingBadge] || ""}>
              Standing: {engagement.company.profile.standingBadge}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Link href={`/messages?to=${isCompany ? engagement.studentId : engagement.companyId}`}>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-3 h-3 mr-1" /> Messages
          </Button>
        </Link>
        {engagement.agreementPdfUrl && (
          <Link href={`/api/engagements/${engagement.id}/agreement`} target="_blank">
            <Button variant="outline" size="sm">
              <FileText className="w-3 h-3 mr-1" /> Agreement
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function MetadataSection({ engagement, isStudent }: { engagement: Engagement; isStudent: boolean }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {engagement.problem.bountyType && (
            <div>
              <span className="text-slate-500 text-xs">Bounty</span>
              <p className="font-medium">
                {engagement.problem.bountyType === "cash" ? `৳${engagement.problem.bountyValue}` : engagement.problem.bountyType}
              </p>
            </div>
          )}
          {engagement.projectValueBdt && (
            <div>
              <span className="text-slate-500 text-xs">Project Value</span>
              <p className="font-medium">৳{engagement.projectValueBdt.toLocaleString()}</p>
            </div>
          )}
          {(isStudent || engagement.status !== "negotiating") && engagement.netStudentPayoutBdt && (
            <div>
              <span className="text-slate-500 text-xs">Net Payout</span>
              <p className="font-medium text-emerald-700">৳{engagement.netStudentPayoutBdt.toLocaleString()}</p>
            </div>
          )}
          {engagement.depositAmountBdt && (
            <div>
              <span className="text-slate-500 text-xs">Deposit</span>
              <p className="font-medium">৳{engagement.depositAmountBdt.toLocaleString()}</p>
            </div>
          )}
          {engagement.problem.sector && (
            <div>
              <span className="text-slate-500 text-xs">Sector</span>
              <p className="font-medium">{engagement.problem.sector}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NegotiationSection({
  engagement, isCompany, isStudent, isAdmin, userId, onRefresh, actionLoading, setActionLoading,
}: {
  engagement: Engagement;
  isCompany: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  userId: string;
  onRefresh: () => void;
  actionLoading: boolean;
  setActionLoading: (v: boolean) => void;
}) {
  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; dueDate: string; submissionRequirements: string }>>([]);
  const [projectValue, setProjectValue] = useState(engagement.projectValueBdt?.toString() || "");
  const [phone, setPhone] = useState(engagement.namedContactPhone || "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (engagement.milestones.length > 0) {
      setMilestones(engagement.milestones.map(m => ({
        title: m.title,
        description: m.description,
        dueDate: m.dueDate.split("T")[0],
        submissionRequirements: m.submissionRequirements || "",
      })));
    }
  }, [engagement.milestones]);

  const canPropose = (isCompany || isStudent || isAdmin) &&
    (engagement.negotiationRound < 2 || isAdmin) &&
    engagement.proposedBy !== userId;

  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones([...milestones, { title: "", description: "", dueDate: "", submissionRequirements: "" }]);
  };

  const removeMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx: number, field: string, value: string) => {
    const updated = [...milestones];
    (updated[idx] as Record<string, string>)[field] = value;
    setMilestones(updated);
  };

  async function handlePropose() {
    setFormError("");
    if (milestones.length === 0) { setFormError("Add at least one milestone"); return; }
    if (!projectValue || parseFloat(projectValue) <= 0) { setFormError("Enter a valid project value"); return; }

    for (const m of milestones) {
      if (!m.title || !m.description || !m.dueDate) {
        setFormError("All milestones need a title, description, and due date");
        return;
      }
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "propose_milestones",
          milestones,
          projectValueBdt: parseFloat(projectValue),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetPhone() {
    if (!phone.trim()) return;
    setActionLoading(true);
    try {
      await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_contact_phone", phone }),
      });
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirm() {
    setFormError("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_agreement" }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); return; }

      if (data.status === "pending_deposit") {
        await fetch(`/api/engagements/${engagement.id}/agreement`, { method: "POST" });
      }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Negotiation Round {engagement.negotiationRound}/2</h2>
            {engagement.proposedBy && (
              <span className="text-xs text-slate-500">
                Last proposed by: {engagement.proposedBy === engagement.companyId ? "Company" : engagement.proposedBy === engagement.studentId ? "Student" : "Admin"}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {engagement.negotiationRound >= 2 && !engagement.adminProposedBinding && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Maximum negotiation rounds reached. An admin will propose a binding milestone split.
              </p>
            </div>
          )}

          {engagement.adminProposedBinding && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                <Shield className="w-4 h-4 inline mr-1" />
                Admin has proposed a binding milestone split. Both parties must confirm to proceed.
              </p>
            </div>
          )}

          {engagement.milestones.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Current Proposed Milestones</h3>
              <div className="space-y-2">
                {engagement.milestones.map((m, i) => (
                  <div key={m.id} className="p-3 rounded-lg bg-slate-50 border">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                      <span className="font-medium text-sm">{m.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">Due: {formatDate(m.dueDate)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 ml-8">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {engagement.projectValueBdt && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-emerald-600 text-xs">Project Value</span>
                  <p className="font-semibold">৳{engagement.projectValueBdt.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-emerald-600 text-xs">Deposit (30%)</span>
                  <p className="font-semibold">৳{engagement.depositAmountBdt?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-emerald-600 text-xs">Platform Fee ({((engagement.platformFeeRate || 0.10) * 100).toFixed(0)}%)</span>
                  <p className="font-semibold">৳{(engagement.projectValueBdt * (engagement.platformFeeRate || 0.10)).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-emerald-600 text-xs">Net Student Payout</span>
                  <p className="font-semibold text-emerald-700">৳{engagement.netStudentPayoutBdt?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {canPropose && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">
                {isAdmin ? "Propose Binding Split (Admin)" : "Propose Milestones"}
              </h3>

              <div className="mb-4">
                <Input
                  label="Project Value (BDT)"
                  type="number"
                  value={projectValue}
                  onChange={e => setProjectValue(e.target.value)}
                  placeholder="e.g. 50000"
                />
                {projectValue && parseFloat(projectValue) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Deposit (30%): ৳{(parseFloat(projectValue) * 0.3).toLocaleString()} | Platform fee ({((engagement.platformFeeRate || 0.10) * 100).toFixed(0)}%): ৳{(parseFloat(projectValue) * (engagement.platformFeeRate || 0.10)).toLocaleString()} | Net payout: ৳{(parseFloat(projectValue) - parseFloat(projectValue) * (engagement.platformFeeRate || 0.10)).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Milestone {i + 1}</span>
                      <button onClick={() => removeMilestone(i)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        label="Title"
                        value={m.title}
                        onChange={e => updateMilestone(i, "title", e.target.value)}
                        placeholder="Milestone title"
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={m.dueDate}
                        onChange={e => updateMilestone(i, "dueDate", e.target.value)}
                      />
                    </div>
                    <Textarea
                      label="Description"
                      value={m.description}
                      onChange={e => updateMilestone(i, "description", e.target.value)}
                      placeholder="What needs to be delivered"
                      className="mt-2"
                    />
                    <Input
                      label="Submission Requirements (optional)"
                      value={m.submissionRequirements}
                      onChange={e => updateMilestone(i, "submissionRequirements", e.target.value)}
                      placeholder="e.g. GitHub repo link, demo URL"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>

              {milestones.length < 5 && (
                <Button variant="outline" size="sm" onClick={addMilestone} className="mt-3">
                  <Plus className="w-3 h-3 mr-1" /> Add Milestone
                </Button>
              )}

              {formError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button onClick={handlePropose} loading={actionLoading}>
                  {isAdmin ? "Propose Binding Split" : "Submit Proposal"}
                </Button>
              </div>
            </div>
          )}

          {isCompany && !engagement.namedContactPhone && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Contact Phone (Required for Agreement)</h3>
              <div className="flex gap-2">
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +8801700000000" />
                <Button onClick={handleSetPhone} loading={actionLoading} variant="outline">Save</Button>
              </div>
            </div>
          )}

          {engagement.milestones.length > 0 && engagement.proposedBy && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Confirm Agreement</h3>
              <div className="flex items-center gap-4 text-sm mb-3">
                <span className={`flex items-center gap-1 ${engagement.companyConfirmed ? "text-emerald-600" : "text-slate-400"}`}>
                  {engagement.companyConfirmed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  Company {engagement.companyConfirmed ? "confirmed" : "pending"}
                </span>
                <span className={`flex items-center gap-1 ${engagement.studentConfirmed ? "text-emerald-600" : "text-slate-400"}`}>
                  {engagement.studentConfirmed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  Student {engagement.studentConfirmed ? "confirmed" : "pending"}
                </span>
              </div>

              {((isCompany && !engagement.companyConfirmed) || (isStudent && !engagement.studentConfirmed)) && (
                <>
                  {formError && (
                    <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                      {formError}
                    </div>
                  )}
                  <Button onClick={handleConfirm} loading={actionLoading}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm Agreement
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DepositSection({
  engagement, isAdmin, onRefresh, actionLoading, setActionLoading,
}: {
  engagement: Engagement;
  isAdmin: boolean;
  onRefresh: () => void;
  actionLoading: boolean;
  setActionLoading: (v: boolean) => void;
}) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const daysLeft = engagement.depositDeadline
    ? Math.ceil((new Date(engagement.depositDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  async function handleMarkDeposit() {
    setError("");
    if (!notes || notes.trim().length < 10) {
      setError("Notes must be at least 10 characters");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_deposit_received", notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-base font-semibold">Deposit & Activation</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Timer className="w-6 h-6 text-amber-600 mb-1" />
            <p className="text-sm font-medium text-amber-800">
              {daysLeft !== null && daysLeft >= 0
                ? `${daysLeft} days remaining`
                : "Deposit window expired"}
            </p>
            {engagement.depositDeadline && (
              <p className="text-xs text-amber-600">Deadline: {formatDate(engagement.depositDeadline)}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-600">Deposit Amount</p>
            <p className="text-lg font-bold text-emerald-700">
              ৳{engagement.depositAmountBdt?.toLocaleString()}
            </p>
          </div>
        </div>

        {engagement.agreementPdfUrl && (
          <Link href={`/api/engagements/${engagement.id}/agreement`} target="_blank">
            <Button variant="outline" size="sm" className="mb-4">
              <FileText className="w-3 h-3 mr-1" /> View Agreement
            </Button>
          </Link>
        )}

        {isAdmin && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Admin: Mark Payment Received</h3>
            <Textarea
              label="Admin Notes (min 10 characters)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe payment verification details..."
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <Button onClick={handleMarkDeposit} loading={actionLoading} className="mt-3">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Deposit Received
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MilestoneTimeline({
  engagement, isCompany, isStudent, isAdmin, userId, onRefresh,
}: {
  engagement: Engagement;
  isCompany: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  userId: string;
  onRefresh: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Milestone Timeline</h2>
      {engagement.milestones.map((milestone, i) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          index={i}
          engagement={engagement}
          isCompany={isCompany}
          isStudent={isStudent}
          isAdmin={isAdmin}
          userId={userId}
          onRefresh={onRefresh}
          expanded={expandedId === milestone.id}
          onToggle={() => setExpandedId(expandedId === milestone.id ? null : milestone.id)}
        />
      ))}
    </div>
  );
}

function MilestoneCard({
  milestone, index, engagement, isCompany, isStudent, isAdmin, userId, onRefresh, expanded, onToggle,
}: {
  milestone: Milestone;
  index: number;
  engagement: Engagement;
  isCompany: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  userId: string;
  onRefresh: () => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [writtenNote, setWrittenNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [ruling, setRuling] = useState("full_release");
  const [rulingPercent, setRulingPercent] = useState("50");
  const [rulingNotes, setRulingNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const config = MILESTONE_STATUS[milestone.status] || MILESTONE_STATUS.pending;
  const StatusIcon = config.icon;

  const autoCheck = milestone.autoCheckResult ? JSON.parse(milestone.autoCheckResult) : null;

  const canSubmit = isStudent &&
    (milestone.status === "pending" || milestone.status === "revision_requested") &&
    engagement.status === "active";

  const canReview = isCompany && milestone.status === "under_review";
  const canDispute = (isCompany || isStudent) &&
    (milestone.status === "under_review" || milestone.status === "revision_requested") &&
    (milestone.revisionCount >= 2 || milestone.status === "under_review");

  const canTag = milestone.status === "approved" && milestone.approvedAt &&
    (Date.now() - new Date(milestone.approvedAt).getTime()) >= 48 * 60 * 60 * 1000 &&
    !milestone.tags.find(t => t.taggedBy === userId);

  const activeDispute = milestone.disputes.find(d => !d.resolvedAt);

  async function handleSubmit() {
    setError("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/engagements/${engagement.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: milestone.id, deliverableUrl, writtenNote }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAction(action: string, extraBody: Record<string, unknown> = {}) {
    setError("");
    setActionLoading(true);
    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraBody }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTagSubmit() {
    setError("");
    if (selectedTags.length === 0) { setError("Select at least one tag"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/milestones/${milestone.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      onRefresh();
    } finally {
      setActionLoading(false);
    }
  }

  const tagList = isCompany ? COMPANY_TAGS : STUDENT_TAGS;

  return (
    <Card className={`${milestone.status === "approved" ? "border-emerald-200" : milestone.status === "disputed" ? "border-red-200" : ""}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{index + 1}. {milestone.title}</span>
              <Badge className={config.color}>{config.label}</Badge>
              {milestone.isLate && <Badge className="bg-red-100 text-red-700">Late</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Due: {formatDate(milestone.dueDate)}</p>
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-4 px-4">
          <div className="border-t pt-4">
            <p className="text-sm text-slate-700 mb-2">{milestone.description}</p>
            {milestone.submissionRequirements && (
              <p className="text-xs text-slate-500 mb-3">Requirements: {milestone.submissionRequirements}</p>
            )}

            {autoCheck && (
              <div className="mb-3 p-3 rounded-lg bg-slate-50 border">
                <h4 className="text-xs font-medium text-slate-700 mb-1">Auto-Check Results</h4>
                <div className="flex gap-3 text-xs">
                  <span className={autoCheck.urlCheck === "pass" ? "text-emerald-600" : autoCheck.urlCheck === "manual_review" ? "text-amber-600" : "text-red-600"}>
                    URL: {autoCheck.urlCheck} {autoCheck.httpStatus && `(${autoCheck.httpStatus})`}
                  </span>
                  <span className={autoCheck.wordCount >= 50 ? "text-emerald-600" : "text-red-600"}>
                    Words: {autoCheck.wordCount}
                  </span>
                  <span className={autoCheck.isLate ? "text-red-600" : "text-emerald-600"}>
                    {autoCheck.isLate ? "Late submission" : "On time"}
                  </span>
                </div>
              </div>
            )}

            {milestone.deliverableUrl && (
              <div className="mb-3">
                <a href={milestone.deliverableUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <ExternalLink className="w-3 h-3" /> View Deliverable
                </a>
              </div>
            )}

            {milestone.writtenNote && (
              <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <h4 className="text-xs font-medium text-blue-700 mb-1">Student&apos;s Note</h4>
                <p className="text-sm text-slate-700">{milestone.writtenNote}</p>
              </div>
            )}

            {milestone.companyFeedback && (
              <div className="mb-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <h4 className="text-xs font-medium text-orange-700 mb-1">
                  Company Feedback (Revision {milestone.revisionCount})
                </h4>
                <p className="text-sm text-slate-700">{milestone.companyFeedback}</p>
              </div>
            )}

            {milestone.reviewDeadline && milestone.status === "under_review" && (
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                <Timer className="w-3 h-3" />
                Review deadline: {formatDate(milestone.reviewDeadline)}
                {!milestone.extensionUsed && isCompany && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction("extend_review")}
                    loading={actionLoading}
                    className="text-xs"
                  >
                    +7 day extension
                  </Button>
                )}
                {milestone.extensionUsed && <span className="text-amber-600">(extended)</span>}
              </div>
            )}

            {milestone.disputes.length > 0 && (
              <div className="mb-3">
                {milestone.disputes.map(d => (
                  <div key={d.id} className={`p-3 rounded-lg border ${d.resolvedAt ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <h4 className="text-xs font-medium mb-1">
                      Dispute {d.resolvedAt ? "(Resolved)" : "(Active)"}
                    </h4>
                    {d.ruling && (
                      <p className="text-sm">
                        Ruling: <strong>{d.ruling}</strong>
                        {d.rulingPercent !== null && d.rulingPercent !== undefined && ` (${d.rulingPercent}%)`}
                      </p>
                    )}
                    {d.rulingNotes && <p className="text-xs text-slate-600 mt-1">{d.rulingNotes}</p>}
                  </div>
                ))}
              </div>
            )}

            {milestone.tags.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-slate-700 mb-1">Tags</h4>
                {milestone.tags.map(t => (
                  <div key={t.id} className="mb-1">
                    <span className="text-xs text-slate-500">{t.taggedRole}:</span>{" "}
                    {JSON.parse(t.tags).map((tag: string) => (
                      <Badge key={tag} className="mr-1 text-xs">{tag}</Badge>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {canSubmit && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Submit Deliverable</h4>
                <Input
                  label="Deliverable URL"
                  value={deliverableUrl}
                  onChange={e => setDeliverableUrl(e.target.value)}
                  placeholder="https://..."
                  className="mb-2"
                />
                <Textarea
                  label="Written Note (min 50 words)"
                  value={writtenNote}
                  onChange={e => setWrittenNote(e.target.value)}
                  placeholder="Describe your deliverable in detail..."
                  className="min-h-[120px]"
                />
                <Button onClick={handleSubmit} loading={actionLoading} className="mt-2">
                  <Send className="w-3 h-3 mr-1" /> Submit
                </Button>
              </div>
            )}

            {canReview && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Review</h4>
                <div className="flex gap-2 mb-3">
                  <Button onClick={() => handleAction("approve")} loading={actionLoading}>
                    <ThumbsUp className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  {milestone.revisionCount < 2 && (
                    <div className="flex-1">
                      <Textarea
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Revision feedback (min 30 words)..."
                        className="mb-2"
                      />
                      <Button
                        variant="outline"
                        onClick={() => handleAction("request_revision", { feedback })}
                        loading={actionLoading}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Request Revision ({milestone.revisionCount}/2)
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {canDispute && milestone.revisionCount >= 2 && !activeDispute && (
              <div className="border-t pt-3 mt-3">
                <Button
                  variant="danger"
                  onClick={() => handleAction("escalate_dispute")}
                  loading={actionLoading}
                >
                  <Flag className="w-3 h-3 mr-1" /> Escalate to Dispute
                </Button>
              </div>
            )}

            {isAdmin && activeDispute && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Admin: Resolve Dispute</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={ruling}
                      onChange={e => setRuling(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="full_release">Full Release (to student)</option>
                      <option value="partial">Partial Split</option>
                      <option value="refund">Refund (to company)</option>
                    </select>
                    {ruling === "partial" && (
                      <Input
                        type="number"
                        value={rulingPercent}
                        onChange={e => setRulingPercent(e.target.value)}
                        placeholder="Student %"
                        className="w-24"
                      />
                    )}
                  </div>
                  <Textarea
                    value={rulingNotes}
                    onChange={e => setRulingNotes(e.target.value)}
                    placeholder="Ruling notes (min 10 characters)..."
                  />
                  <Button
                    onClick={() => handleAction("resolve_dispute", {
                      disputeId: activeDispute.id,
                      ruling,
                      rulingPercent: ruling === "partial" ? parseFloat(rulingPercent) : undefined,
                      rulingNotes,
                      notes: rulingNotes,
                    })}
                    loading={actionLoading}
                  >
                    Submit Ruling
                  </Button>
                </div>
              </div>
            )}

            {canTag && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">
                  <Tag className="w-3 h-3 inline mr-1" />
                  Tag {isCompany ? "Student" : "Company"} Performance
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagList.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <Button onClick={handleTagSubmit} loading={actionLoading} size="sm">
                  Submit Tags
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Users, FileText, Briefcase, TrendingUp, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, Clock, DollarSign,
  Eye, Scale, FolderCheck, ScrollText, Shield, Database
} from "lucide-react";
import { AuditLogTable } from "@/components/data-rooms/AuditLogTable";
import { SensitivityBadge } from "@/components/data-rooms/SensitivityBadge";

type TabType = "overview" | "verifications" | "fraud" | "payments" | "review" | "disputes" | "closure" | "transactions" | "standing" | "data-rooms";

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [verifications, setVerifications] = useState<Record<string, unknown>[]>([]);
  const [fraudReports, setFraudReports] = useState<Record<string, unknown>[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "admin") return;
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/verifications").then((r) => r.json()),
      fetch("/api/admin/fraud-reports").then((r) => r.json()),
    ]).then(([statsData, verData, fraudData]) => {
      setStats(statsData);
      setVerifications(verData.verifications || []);
      setFraudReports(fraudData.reports || []);
      setLoading(false);
    });
  }, [session]);

  async function handleVerification(verificationId: string, status: "approved" | "rejected") {
    await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationId, status }),
    });
    const res = await fetch("/api/admin/verifications");
    const data = await res.json();
    setVerifications(data.verifications || []);
    const statsRes = await fetch("/api/admin/stats");
    setStats(await statsRes.json());
  }

  async function handleFraudReport(reportId: string, status: string) {
    await fetch("/api/admin/fraud-reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    const res = await fetch("/api/admin/fraud-reports");
    const data = await res.json();
    setFraudReports(data.reports || []);
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Admin Access Required</h1>
        <p className="text-slate-600 mt-2">You do not have permission to access this page.</p>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "verifications", label: "Verifications" },
    { key: "fraud", label: "Fraud Reports" },
    { key: "payments", label: "Payment Queue" },
    { key: "review", label: "Review Watch" },
    { key: "disputes", label: "Dispute Queue" },
    { key: "closure", label: "Closure Queue" },
    { key: "transactions", label: "Transaction Log" },
    { key: "standing", label: "Standing Badges" },
    { key: "data-rooms", label: "Data Rooms" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Panel</h1>

      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && activeTab === "overview" ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (<div key={i} className="h-24 bg-slate-200 rounded-xl" />))}
          </div>
        </div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0} color="bg-blue-100 text-blue-600" />
                <StatCard icon={Users} label="Students" value={stats.totalStudents || 0} color="bg-emerald-100 text-emerald-600" />
                <StatCard icon={Users} label="Researchers" value={stats.totalResearchers || 0} color="bg-violet-100 text-violet-600" />
                <StatCard icon={Users} label="Industry" value={stats.totalIndustry || 0} color="bg-amber-100 text-amber-600" />
                <StatCard icon={FileText} label="Problems" value={stats.totalProblems || 0} color="bg-rose-100 text-rose-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Open Problems" value={stats.openProblems || 0} color="bg-emerald-100 text-emerald-600" />
                <StatCard icon={TrendingUp} label="Submissions" value={stats.totalSubmissions || 0} color="bg-blue-100 text-blue-600" />
                <StatCard icon={Briefcase} label="Jobs" value={stats.totalJobs || 0} color="bg-violet-100 text-violet-600" />
                <StatCard icon={Clock} label="Pending Verifications" value={stats.pendingVerifications || 0} color="bg-amber-100 text-amber-600" />
              </div>
            </div>
          )}

          {activeTab === "verifications" && (
            <VerificationsTab verifications={verifications} onAction={handleVerification} />
          )}

          {activeTab === "fraud" && (
            <FraudTab reports={fraudReports} onAction={handleFraudReport} />
          )}

          {activeTab === "payments" && <PaymentQueueTab />}
          {activeTab === "review" && <ReviewWatchTab />}
          {activeTab === "disputes" && <DisputeQueueTab />}
          {activeTab === "closure" && <ClosureQueueTab />}
          {activeTab === "transactions" && <TransactionLogTab />}
          {activeTab === "standing" && <StandingBadgeTab />}
          {activeTab === "data-rooms" && <DataRoomsAdminTab />}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-2`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function VerificationsTab({ verifications, onAction }: { verifications: Record<string, unknown>[]; onAction: (id: string, status: "approved" | "rejected") => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Pending Verifications ({verifications.length})</h2>
      {verifications.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">All verifications reviewed!</p></CardContent></Card>
      ) : (
        verifications.map((v: Record<string, unknown>) => {
          const user = v.user as Record<string, unknown>;
          const profile = user?.profile as Record<string, unknown>;
          return (
            <Card key={v.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">{user?.name as string}</h3>
                      <Badge>{user?.role as string}</Badge>
                      <Badge variant="warning">{v.type as string}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{user?.email as string}</p>
                    {profile?.companyName ? <p className="text-sm text-slate-600 mt-1">Company: {String(profile.companyName)}</p> : null}
                    {profile?.tradeLicenseNumber ? <p className="text-sm text-slate-600">Trade License: {String(profile.tradeLicenseNumber)}</p> : null}
                    <p className="text-xs text-slate-400 mt-2">Submitted: {formatDate(v.createdAt as string)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => onAction(v.id as string, "approved")}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => onAction(v.id as string, "rejected")}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function FraudTab({ reports, onAction }: { reports: Record<string, unknown>[]; onAction: (id: string, status: string) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Fraud Reports ({reports.length})</h2>
      {reports.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><ShieldCheck className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No fraud reports!</p></CardContent></Card>
      ) : (
        reports.map((r: Record<string, unknown>) => {
          const reportedBy = r.reportedBy as Record<string, unknown>;
          const reportedUser = r.reportedUser as Record<string, unknown>;
          return (
            <Card key={r.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="font-medium text-slate-900">{r.reason as string}</h3>
                      <Badge variant={r.status === "pending" ? "warning" : r.status === "resolved" ? "success" : "default"}>{r.status as string}</Badge>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{r.description as string}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Reported by: {reportedBy?.name as string} ({reportedBy?.role as string})</span>
                      <span>Against: {reportedUser?.name as string} ({reportedUser?.role as string})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(r.createdAt as string)}</p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => onAction(r.id as string, "resolved")}>Resolve</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(r.id as string, "dismissed")}>Dismiss</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function PaymentQueueTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/payment-queue").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  async function markPaymentReceived(engagementId: string) {
    const n = notes[engagementId] || "";
    if (n.length < 10) { alert("Notes must be at least 10 characters"); return; }
    await fetch("/api/admin/payment-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagementId, notes: n }),
    });
    const res = await fetch("/api/admin/payment-queue");
    const data = await res.json();
    setItems(data.items || []);
  }

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <DollarSign className="w-5 h-5" /> Payment Queue ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No pending deposits!</p></CardContent></Card>
      ) : (
        items.map((item) => {
          const company = item.company as Record<string, unknown>;
          const student = item.student as Record<string, unknown>;
          return (
            <Card key={item.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{item.problemTitle as string}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-slate-600">
                      <span>Company: {company?.name as string}</span>
                      <span>Student: {student?.name as string}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span className="text-slate-600">Value: ৳{String(item.projectValueBdt || 0)}</span>
                      <span className="text-slate-600">Deposit: ৳{String(item.depositAmountBdt || 0)}</span>
                      {item.namedContactPhone ? <span className="text-slate-600">Phone: {String(item.namedContactPhone)}</span> : null}
                    </div>
                    <div className="mt-1">
                      {(item.daysRemaining as number) !== null ? (
                        <Badge variant={(item.daysRemaining as number) <= 1 ? "danger" : (item.daysRemaining as number) <= 3 ? "warning" : "info"}>
                          {String(item.daysRemaining)} days remaining
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-3 flex gap-2 items-end">
                      <input
                        type="text"
                        placeholder="Notes (min 10 chars)"
                        className="flex-1 px-3 py-1.5 text-sm border rounded-md"
                        value={notes[item.id as string] || ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [item.id as string]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => markPaymentReceived(item.id as string)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Payment Received
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function ReviewWatchTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/review-watch").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Eye className="w-5 h-5" /> Review Watch ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No milestones under review!</p></CardContent></Card>
      ) : (
        items.map((item) => {
          const company = item.company as Record<string, unknown>;
          const student = item.student as Record<string, unknown>;
          return (
            <Card key={item.id as string} className={item.isOverdue ? "border-red-200 bg-red-50" : item.isApproachingDeadline ? "border-amber-200 bg-amber-50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">Milestone {String((item.order as number) + 1)}: {item.title as string}</h3>
                      {item.isOverdue ? (
                        <Badge variant="danger">Overdue</Badge>
                      ) : item.isApproachingDeadline ? (
                        <Badge variant="warning">Due Soon</Badge>
                      ) : (
                        <Badge variant="info">{item.daysRemaining as number} days left</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">Project: {item.problemTitle as string}</p>
                    <div className="flex gap-4 mt-1 text-sm text-slate-600">
                      <span>Company: {company?.name as string}</span>
                      <span>Student: {student?.name as string}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-slate-500">
                      <span>Under review for {item.reviewDays as number} days</span>
                      {item.namedContactPhone ? <span>Phone: {String(item.namedContactPhone)}</span> : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function DisputeQueueTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [rulingForm, setRulingForm] = useState<Record<string, { ruling: string; percent: number; notes: string }>>({});

  useEffect(() => {
    fetch("/api/admin/dispute-queue").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  async function submitRuling(disputeId: string) {
    const form = rulingForm[disputeId];
    if (!form || !form.ruling || !form.notes) { alert("Fill all ruling fields"); return; }
    if (form.notes.length < 10) { alert("Ruling notes must be at least 10 characters"); return; }
    await fetch("/api/admin/dispute-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disputeId,
        ruling: form.ruling,
        rulingPercent: form.ruling === "partial" ? form.percent : undefined,
        rulingNotes: form.notes,
      }),
    });
    const res = await fetch("/api/admin/dispute-queue");
    const data = await res.json();
    setItems(data.items || []);
  }

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Scale className="w-5 h-5" /> Dispute Queue ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No open disputes!</p></CardContent></Card>
      ) : (
        items.map((item) => {
          const engagement = item.engagement as Record<string, unknown>;
          const company = engagement?.company as Record<string, unknown>;
          const student = engagement?.student as Record<string, unknown>;
          const milestone = item.milestone as Record<string, unknown> | null;
          const form = rulingForm[item.id as string] || { ruling: "", percent: 50, notes: "" };
          return (
            <Card key={item.id as string}>
              <CardContent className="p-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="font-medium text-slate-900">{item.reason as string}</h3>
                    <Badge variant="danger">{item.daysSinceRaised as number} days open</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{item.description as string}</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Project: {engagement?.problemTitle as string}</p>
                    {milestone && <p>Milestone: {milestone.title as string}</p>}
                    <div className="flex gap-4">
                      <span>Company: {company?.name as string} ({company?.email as string})</span>
                      <span>Student: {student?.name as string} ({student?.email as string})</span>
                    </div>
                    {engagement?.namedContactPhone ? <p>Phone: {String(engagement.namedContactPhone)}</p> : null}
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-slate-900">Issue Ruling</p>
                    <div className="flex gap-2">
                      {["full_release", "partial", "refund"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRulingForm((prev) => ({ ...prev, [item.id as string]: { ...form, ruling: r } }))}
                          className={`px-3 py-1.5 text-xs rounded-md border ${form.ruling === r ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}
                        >
                          {r === "full_release" ? "Full Release" : r === "partial" ? "Partial" : "Refund"}
                        </button>
                      ))}
                    </div>
                    {form.ruling === "partial" && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600">Student gets:</label>
                        <input
                          type="number" min="0" max="100" value={form.percent}
                          onChange={(e) => setRulingForm((prev) => ({ ...prev, [item.id as string]: { ...form, percent: Number(e.target.value) } }))}
                          className="w-20 px-2 py-1 text-sm border rounded-md"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    )}
                    <textarea
                      placeholder="Ruling notes (min 10 chars)"
                      className="w-full px-3 py-2 text-sm border rounded-md"
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setRulingForm((prev) => ({ ...prev, [item.id as string]: { ...form, notes: e.target.value } }))}
                    />
                    <Button size="sm" onClick={() => submitRuling(item.id as string)}>Submit Ruling</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function ClosureQueueTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [closureNotes, setClosureNotes] = useState<Record<string, string>>({});
  const [paymentForm, setPaymentForm] = useState<Record<string, { txRef: string; notes: string }>>({});
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [qualityChecked, setQualityChecked] = useState<Set<string>>(new Set());

  const loadData = useCallback(() => {
    fetch("/api/admin/closure-queue").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function performQualityCheck(engagementId: string) {
    const n = closureNotes[engagementId] || "";
    if (n.length < 10) { alert("Notes must be at least 10 characters"); return; }
    const res = await fetch(`/api/engagements/${engagementId}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: n }),
    });
    if (res.ok) {
      setQualityChecked((prev) => new Set(prev).add(engagementId));
    } else {
      const data = await res.json();
      alert(data.error || "Failed to perform quality check");
    }
  }

  async function releasePayment(engagementId: string) {
    const form = paymentForm[engagementId];
    if (!form?.txRef || !form?.notes) { alert("Fill transaction ref and notes"); return; }
    if (form.notes.length < 10) { alert("Notes must be at least 10 characters"); return; }
    const item = items.find((i) => (i.id as string) === engagementId);
    const projectValue = (item?.projectValueBdt as number) || 0;
    const feeRate = (item?.platformFeeRate as number) || 0.30;
    const gross = projectValue * 0.7;
    const fee = projectValue * feeRate;
    const net = gross - fee;
    const res = await fetch(`/api/engagements/${engagementId}/release-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionRefId: form.txRef,
        grossAmount: gross,
        platformFee: fee,
        netPayout: net,
        notes: form.notes,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setClosedIds((prev) => new Set(prev).add(engagementId));
      alert(`Payment released! Certificate: ${data.certificateId}`);
      loadData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to release payment");
    }
  }

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <FolderCheck className="w-5 h-5" /> Closure Queue ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No projects awaiting closure!</p></CardContent></Card>
      ) : (
        items.map((item) => {
          const company = item.company as Record<string, unknown>;
          const student = item.student as Record<string, unknown>;
          const milestones = item.milestones as Record<string, unknown>[];
          const engId = item.id as string;
          const isClosed = closedIds.has(engId);
          const isChecked = qualityChecked.has(engId);
          const form = paymentForm[engId] || { txRef: "", notes: "" };
          return (
            <Card key={engId}>
              <CardContent className="p-5">
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">{item.problemTitle as string}</h3>
                  <div className="flex gap-4 text-sm text-slate-600 mb-2">
                    <span>Company: {company?.name as string}</span>
                    <span>Student: {student?.name as string}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-600 mb-3">
                    <span>Value: ৳{String(item.projectValueBdt || 0)}</span>
                    <span>Net Payout: ৳{String(item.netStudentPayoutBdt || 0)}</span>
                    {item.namedContactEmail ? <span>Email: {String(item.namedContactEmail)}</span> : null}
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Milestones</p>
                    <div className="space-y-1">
                      {milestones.map((m, i) => (
                        <div key={m.id as string} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-slate-700">{m.title as string}</span>
                          {m.deliverableUrl ? (
                            <a href={String(m.deliverableUrl)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isClosed && (
                    <>
                      {!isChecked && (
                        <div className="p-3 bg-slate-50 rounded-lg space-y-2 mb-3">
                          <p className="text-sm font-medium text-slate-900">Quality Check</p>
                          <input
                            type="text"
                            placeholder="Quality check notes (min 10 chars)"
                            className="w-full px-3 py-1.5 text-sm border rounded-md"
                            value={closureNotes[engId] || ""}
                            onChange={(e) => setClosureNotes((prev) => ({ ...prev, [engId]: e.target.value }))}
                          />
                          <Button size="sm" onClick={() => performQualityCheck(engId)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete Quality Check
                          </Button>
                        </div>
                      )}

                      <div className="p-3 bg-emerald-50 rounded-lg space-y-2">
                        <p className="text-sm font-medium text-slate-900">Release Payment</p>
                        <input
                          type="text"
                          placeholder="Transaction reference ID (bKash/Nagad)"
                          className="w-full px-3 py-1.5 text-sm border rounded-md"
                          value={form.txRef}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, [engId]: { ...form, txRef: e.target.value } }))}
                        />
                        <input
                          type="text"
                          placeholder="Payment notes (min 10 chars)"
                          className="w-full px-3 py-1.5 text-sm border rounded-md"
                          value={form.notes}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, [engId]: { ...form, notes: e.target.value } }))}
                        />
                        <Button size="sm" onClick={() => releasePayment(engId)}>
                          <DollarSign className="w-4 h-4 mr-1" /> Release Payment & Generate Certificate
                        </Button>
                      </div>
                    </>
                  )}

                  {isClosed && (
                    <Badge variant="success">Payment Released & Certificate Generated</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function TransactionLogTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transaction-log").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <ScrollText className="w-5 h-5" /> Transaction Log ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-600">No transactions recorded yet.</p></CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Date</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Type</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Admin</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Project</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Amount</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Tx Ref</th>
                <th className="px-3 py-2 text-xs text-slate-500 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const meta = item.metadata as Record<string, unknown>;
                const engagement = item.engagement as Record<string, unknown> | null;
                return (
                  <tr key={item.id as string} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-600">{formatDate(item.createdAt as string)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={item.actionType === "payment_released" ? "success" : "info"}>
                        {(item.actionType as string).replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{item.adminName as string}</td>
                    <td className="px-3 py-2 text-slate-700">{engagement ? (engagement.problemTitle as string) : "—"}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {meta?.grossAmount ? `৳${String(meta.grossAmount)}` : meta?.depositAmount ? `৳${String(meta.depositAmount)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700 font-mono text-xs">{(meta?.transactionRefId as string) || "—"}</td>
                    <td className="px-3 py-2 text-slate-600 max-w-xs truncate">{item.notes as string}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StandingBadgeTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideForm, setOverrideForm] = useState<Record<string, { badge: string; notes: string }>>({});

  const loadData = useCallback(() => {
    fetch("/api/admin/standing-badge").then((r) => r.json()).then((data) => { setItems(data.items || []); setLoading(false); });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function overrideBadge(companyId: string) {
    const form = overrideForm[companyId];
    if (!form?.badge || !form?.notes) { alert("Badge and notes are required"); return; }
    if (form.notes.length < 10) { alert("Notes must be at least 10 characters"); return; }
    await fetch("/api/admin/standing-badge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, badge: form.badge, notes: form.notes }),
    });
    loadData();
    setOverrideForm((prev) => { const next = { ...prev }; delete next[companyId]; return next; });
  }

  const badgeColors: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    banned: "bg-slate-800 text-white border-slate-900",
  };

  if (loading) return <div className="animate-pulse"><div className="h-24 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Shield className="w-5 h-5" /> Company Standing ({items.length})
      </h2>
      {items.length === 0 ? (
        <Card className="p-8"><CardContent className="p-0 text-center"><Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-600">No companies registered.</p></CardContent></Card>
      ) : (
        items.map((item) => {
          const badge = item.standingBadge as string;
          const form = overrideForm[item.id as string];
          const showForm = !!form;
          return (
            <Card key={item.id as string}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">{item.companyName as string}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[badge] || badgeColors.green}`}>
                        {badge}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>{item.engagementCount as number} engagements</span>
                      <span>{item.totalDisputes as number} total disputes</span>
                      <span>{item.unresolvedDisputes as number} open</span>
                      <span>{item.negativeDisputes as number} negative rulings</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (showForm) {
                      setOverrideForm((prev) => { const next = { ...prev }; delete next[item.id as string]; return next; });
                    } else {
                      setOverrideForm((prev) => ({ ...prev, [item.id as string]: { badge, notes: "" } }));
                    }
                  }}>
                    {showForm ? "Cancel" : "Override"}
                  </Button>
                </div>
                {showForm && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      {["green", "yellow", "red", "banned"].map((b) => (
                        <button
                          key={b}
                          onClick={() => setOverrideForm((prev) => ({ ...prev, [item.id as string]: { ...form, badge: b } }))}
                          className={`px-3 py-1 text-xs rounded-md border ${form.badge === b ? badgeColors[b] : "bg-white border-slate-200 text-slate-600"}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Override reason (min 10 chars)"
                      className="w-full px-3 py-1.5 text-sm border rounded-md"
                      value={form.notes}
                      onChange={(e) => setOverrideForm((prev) => ({ ...prev, [item.id as string]: { ...form, notes: e.target.value } }))}
                    />
                    <Button size="sm" onClick={() => overrideBadge(item.id as string)}>Apply Override</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

function DataRoomsAdminTab() {
  const [subTab, setSubTab]         = useState<"pending-assets" | "pending-requests" | "audit-log">("pending-assets");
  const [assets, setAssets]         = useState<Record<string, unknown>[]>([]);
  const [requests, setRequests]     = useState<Record<string, unknown>[]>([]);
  const [auditLogs, setAuditLogs]   = useState<Record<string, unknown>[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage]   = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [actioning, setActioning]   = useState<string | null>(null);

  useEffect(() => { loadData(); }, [subTab, auditPage]);

  async function loadData() {
    setLoading(true);
    if (subTab === "pending-assets") {
      const res  = await fetch("/api/admin/data-assets?status=review");
      const data = await res.json();
      setAssets(data.assets || []);
    } else if (subTab === "pending-requests") {
      const res  = await fetch("/api/admin/data-access-requests?status=admin_review");
      const data = await res.json();
      setRequests(data.requests || []);
    } else {
      const res  = await fetch(`/api/admin/data-audit-logs?page=${auditPage}&limit=20`);
      const data = await res.json();
      setAuditLogs(data.logs || []);
      setAuditTotal(data.total || 0);
      setAuditTotalPages(data.totalPages || 1);
    }
    setLoading(false);
  }

  async function handleAssetAction(assetId: string, action: "publish" | "reject") {
    setActioning(assetId);
    await fetch("/api/admin/data-assets", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ assetId, action }),
    });
    await loadData();
    setActioning(null);
  }

  async function handleRequestAction(requestId: string, decision: "approved" | "rejected") {
    setActioning(requestId);
    await fetch(`/api/data-access-requests/${requestId}/admin-review`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ decision }),
    });
    await loadData();
    setActioning(null);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Database className="w-5 h-5" /> Data Rooms Administration
      </h2>

      <div className="flex gap-1 border-b border-slate-200">
        {[
          { key: "pending-assets",   label: `Pending Assets (${assets.length})`    },
          { key: "pending-requests", label: `Pending Requests (${requests.length})` },
          { key: "audit-log",        label: "Audit Log"                             },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setSubTab(t.key as typeof subTab); }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${subTab === t.key ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}
        </div>
      ) : subTab === "pending-assets" ? (
        assets.length === 0 ? (
          <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No datasets pending review.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => {
              const owner   = asset.owner as Record<string, unknown>;
              const profile = owner?.profile as Record<string, unknown> | null;
              return (
                <Card key={asset.id as string}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-slate-900">{asset.title as string}</h3>
                          <SensitivityBadge level={asset.sensitivityLevel as string} />
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{asset.description as string}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Owner: {(profile?.companyName as string) || (owner?.name as string)}</span>
                          <span>Type: {asset.dataType as string}</span>
                          {asset.sector && <span>Sector: {asset.sector as string}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleAssetAction(asset.id as string, "publish")}
                          disabled={actioning === (asset.id as string)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleAssetAction(asset.id as string, "reject")}
                          disabled={actioning === (asset.id as string)}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : subTab === "pending-requests" ? (
        requests.length === 0 ? (
          <Card className="p-8"><CardContent className="p-0 text-center"><CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" /><p className="text-slate-600">No access requests awaiting admin review.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const dataAsset  = req.dataAsset  as Record<string, unknown>;
              const requester  = req.requester  as Record<string, unknown>;
              const reqProfile = requester?.profile as Record<string, unknown> | null;
              return (
                <Card key={req.id as string}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-slate-900">{requester?.name as string}</h3>
                          <Badge>{requester?.role as string}</Badge>
                          {reqProfile?.university && <span className="text-xs text-slate-500">{reqProfile.university as string}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">Dataset: <span className="font-medium text-slate-700">{dataAsset?.title as string}</span></p>
                        <p className="text-sm text-slate-600 line-clamp-2">{req.purpose as string}</p>
                        <div className="mt-1 flex gap-2 items-center">
                          <SensitivityBadge level={dataAsset?.sensitivityLevel as string} />
                          <span className="text-xs text-slate-400">{req.requestedDays as number} days requested</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(req.id as string, "approved")}
                          disabled={actioning === (req.id as string)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRequestAction(req.id as string, "rejected")}
                          disabled={actioning === (req.id as string)}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <AuditLogTable
          logs={auditLogs as Parameters<typeof AuditLogTable>[0]["logs"]}
          total={auditTotal}
          page={auditPage}
          totalPages={auditTotalPages}
          onPageChange={(p) => setAuditPage(p)}
        />
      )}
    </div>
  );
}

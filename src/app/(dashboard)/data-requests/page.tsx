"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestStatusStepper } from "@/components/data-rooms/RequestStatusStepper";
import { NdaSignModal } from "@/components/data-rooms/NdaSignModal";
import { SensitivityBadge } from "@/components/data-rooms/SensitivityBadge";
import { formatDate } from "@/lib/utils";
import { Database, CheckCircle2, XCircle, ClipboardList, Inbox } from "lucide-react";

interface AccessRequest {
  id: string;
  status: string;
  purpose: string;
  methodology: string | null;
  institution: string | null;
  requestedDays: number | null;
  ownerDecision: string | null;
  adminDecision: string | null;
  rejectionReason: string | null;
  createdAt: string;
  dataAsset: { id: string; title: string; sensitivityLevel: string; accessMode: string; ndaRequired: boolean };
  requester?: { id: string; name: string; email: string; role: string; profile: { university: string | null; companyName: string | null } | null };
  agreement: { id: string; signedAt: string; status: string } | null;
  grant: { id: string; status: string; expiresAt: string } | null;
}

export default function DataRequestsPage() {
  const { data: session } = useSession();
  const [myRequests, setMyRequests]           = useState<AccessRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<AccessRequest[]>([]);
  const [view, setView]                       = useState<"mine" | "incoming">("mine");
  const [loading, setLoading]                 = useState(true);
  const [ndaModal, setNdaModal]               = useState<{ open: boolean; requestId: string; assetTitle: string }>({ open: false, requestId: "", assetTitle: "" });
  const [reviewingId, setReviewingId]         = useState<string | null>(null);

  const isOwner = session && ["industry", "government", "admin"].includes(session.user.role);

  useEffect(() => {
    if (!session) return;
    loadRequests();
  }, [session, view]);

  async function loadRequests() {
    setLoading(true);
    const [mineRes, incomingRes] = await Promise.all([
      fetch("/api/data-access-requests?view=mine"),
      isOwner ? fetch("/api/data-access-requests?view=incoming") : Promise.resolve(null),
    ]);
    const mineData = await mineRes.json();
    setMyRequests(mineData.requests || []);
    if (incomingRes) {
      const incData = await incomingRes.json();
      setIncomingRequests(incData.requests || []);
    }
    setLoading(false);
  }

  async function handleOwnerReview(requestId: string, decision: "approved" | "rejected", rejectionReason?: string) {
    setReviewingId(requestId);
    await fetch(`/api/data-access-requests/${requestId}/owner-review`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ decision, rejectionReason }),
    });
    await loadRequests();
    setReviewingId(null);
  }

  async function handleRevokeGrant(grantId: string) {
    await fetch(`/api/data-access-grants/${grantId}/revoke`, { method: "POST" });
    await loadRequests();
  }

  const displayedMyRequests   = myRequests;
  const displayedIncoming     = incomingRequests;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Requests</h1>
          <p className="text-slate-600 mt-1">Track your dataset access requests and manage approvals.</p>
        </div>
        <Link href="/data-rooms">
          <Button variant="outline"><Database className="w-4 h-4 mr-1" /> Browse Datasets</Button>
        </Link>
      </div>

      {/* view toggle */}
      {isOwner && (
        <div className="flex gap-1 border-b border-slate-200 mb-6">
          <button
            onClick={() => setView("mine")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${view === "mine" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <ClipboardList className="w-4 h-4" /> My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setView("incoming")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${view === "incoming" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Inbox className="w-4 h-4" /> Incoming Requests ({incomingRequests.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : view === "mine" ? (
        <div className="space-y-4">
          {displayedMyRequests.length === 0 ? (
            <Card className="p-12">
              <CardContent className="p-0 text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No requests yet</h3>
                <p className="text-sm text-slate-500 mt-1">Browse datasets and request access to get started.</p>
                <Link href="/data-rooms" className="mt-4 inline-block">
                  <Button size="sm">Browse Datasets</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            displayedMyRequests.map((req) => {
              const hasAgreement = !!req.agreement;
              const grantActive  = req.grant?.status === "active" && new Date(req.grant.expiresAt) > new Date();
              const canSign      = req.status === "approved" && !hasAgreement && req.dataAsset.ndaRequired;

              return (
                <Card key={req.id}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Database className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <Link href={`/data-rooms/${req.dataAsset.id}`} className="text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1">
                            {req.dataAsset.title}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">Requested {formatDate(req.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <SensitivityBadge level={req.dataAsset.sensitivityLevel} />
                      </div>
                    </div>

                    <RequestStatusStepper
                      status={req.status}
                      ownerDecision={req.ownerDecision}
                      adminDecision={req.adminDecision}
                      hasAgreement={hasAgreement}
                    />

                    {req.rejectionReason && (
                      <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        Rejection reason: {req.rejectionReason}
                      </div>
                    )}

                    {grantActive && (
                      <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                          Access active — expires {formatDate(req.grant!.expiresAt)}
                        </div>
                        <Link href={`/data-rooms/${req.dataAsset.id}`}>
                          <Button size="sm">Download</Button>
                        </Link>
                      </div>
                    )}

                    {canSign && (
                      <Button
                        size="sm"
                        onClick={() => setNdaModal({ open: true, requestId: req.id, assetTitle: req.dataAsset.title })}
                      >
                        Sign NDA to Activate Access
                      </Button>
                    )}

                    {/* approved with no NDA required: grant should already be created */}
                    {req.status === "approved" && !hasAgreement && !req.dataAsset.ndaRequired && !grantActive && (
                      <Button
                        size="sm"
                        onClick={() => setNdaModal({ open: true, requestId: req.id, assetTitle: req.dataAsset.title })}
                      >
                        Confirm Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        /* incoming requests — owner view */
        <div className="space-y-4">
          {displayedIncoming.length === 0 ? (
            <Card className="p-12">
              <CardContent className="p-0 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">No incoming requests</h3>
                <p className="text-sm text-slate-500 mt-1">Access requests for your datasets will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            displayedIncoming.map((req) => {
              const isPending = req.status === "pending";
              const grantActive = req.grant?.status === "active";

              return (
                <Card key={req.id}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">{req.requester?.name}</span>
                          <Badge>{req.requester?.role}</Badge>
                          {req.requester?.profile?.university && (
                            <span className="text-xs text-slate-500">{req.requester.profile.university}</span>
                          )}
                        </div>
                        <Link href={`/data-rooms/${req.dataAsset.id}`} className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                          {req.dataAsset.title}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">Submitted {formatDate(req.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <SensitivityBadge level={req.dataAsset.sensitivityLevel} />
                        <Badge variant={
                          req.status === "approved" ? "success" :
                          req.status === "rejected" ? "danger"  :
                          req.status === "admin_review" ? "info" : "warning"
                        }>
                          {req.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                      <p className="font-medium text-slate-800 text-xs mb-1">Research Purpose:</p>
                      <p className="text-xs leading-relaxed">{req.purpose}</p>
                    </div>

                    {req.institution && (
                      <p className="text-xs text-slate-500">Institution: {req.institution}</p>
                    )}

                    {grantActive && (
                      <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="text-xs text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Access active — expires {formatDate(req.grant!.expiresAt)}
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRevokeGrant(req.grant!.id)}
                        >
                          Revoke Access
                        </Button>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOwnerReview(req.id, "approved")}
                          disabled={reviewingId === req.id}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {reviewingId === req.id ? "Processing..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            const reason = prompt("Rejection reason (optional):");
                            handleOwnerReview(req.id, "rejected", reason || undefined);
                          }}
                          disabled={reviewingId === req.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      <NdaSignModal
        open={ndaModal.open}
        onClose={() => setNdaModal((p) => ({ ...p, open: false }))}
        requestId={ndaModal.requestId}
        assetTitle={ndaModal.assetTitle}
        onSigned={loadRequests}
      />
    </div>
  );
}

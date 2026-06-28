"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SensitivityBadge } from "@/components/data-rooms/SensitivityBadge";
import { formatDate } from "@/lib/utils";
import {
  Database, Download, Eye, Lock, FileText, ShieldCheck,
  AlertTriangle, CheckCircle2, ArrowRight, MessageSquare,
  Building, Calendar, Hash, Globe, Clock, ChevronLeft
} from "lucide-react";

interface DataAsset {
  id: string;
  title: string;
  description: string;
  sector: string | null;
  dataType: string;
  sensitivityLevel: string;
  accessMode: string;
  anonymization: string;
  recordsCount: number | null;
  timePeriod: string | null;
  ndaRequired: boolean;
  ethicsRequired: boolean;
  commercialUse: boolean;
  status: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    profile: { companyName: string | null; companySector: string | null; avatarUrl: string | null } | null;
  };
  _count: { accessRequests: number };
}

interface AccessRequest {
  id: string;
  status: string;
  ownerDecision: string | null;
  adminDecision: string | null;
  agreement: { id: string } | null;
}

interface AccessGrant {
  id: string;
  status: string;
  expiresAt: string;
  accessMode: string;
}

const DATA_TYPE_LABEL: Record<string, string>  = { tabular: "Tabular", image: "Image", text: "Text", audio: "Audio", mixed: "Mixed" };
const ANON_LABEL:      Record<string, string>  = { none: "None", deidentified: "De-identified", anonymized: "Anonymized", synthetic: "Synthetic" };
const ACCESS_MODE_LABEL: Record<string, string> = { download: "Download", metadata_only: "Metadata Only", controlled: "Controlled Access" };

export default function DataAssetDetailPage() {
  const { data: session }     = useSession();
  const params                = useParams();
  const router                = useRouter();
  const id                    = params.id as string;

  const [asset, setAsset]                       = useState<DataAsset | null>(null);
  const [existingRequest, setExistingRequest]   = useState<AccessRequest | null>(null);
  const [grant, setGrant]                       = useState<AccessGrant | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [downloading, setDownloading]           = useState(false);
  const [downloadInfo, setDownloadInfo]         = useState<{ downloadUrl: string | null; message: string } | null>(null);
  const [submitReview, setSubmitReview]         = useState(false);

  useEffect(() => {
    if (!id || !session) return;
    fetch(`/api/data-assets/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAsset(data.asset || null);
        setExistingRequest(data.existingRequest || null);
        setGrant(data.grant || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, session]);

  async function handleSubmitForReview() {
    setSubmitReview(true);
    const res = await fetch(`/api/data-assets/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "submit_for_review" }),
    });
    const data = await res.json();
    if (res.ok) setAsset(data.asset);
    setSubmitReview(false);
  }

  async function handleDownload() {
    setDownloading(true);
    const res  = await fetch(`/api/data-assets/${id}/download`);
    const data = await res.json();
    if (res.ok) {
      setDownloadInfo({ downloadUrl: data.downloadUrl, message: data.message });
      if (data.downloadUrl) window.open(data.downloadUrl, "_blank");
    }
    setDownloading(false);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">Dataset not found</h2>
        <p className="text-sm text-slate-500 mt-1">It may have been removed or you do not have access.</p>
        <Link href="/data-rooms" className="mt-4 inline-block">
          <Button variant="outline"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Data Rooms</Button>
        </Link>
      </div>
    );
  }

  const isOwner       = session?.user?.id === asset.owner.id;
  const isAdmin       = session?.user?.role === "admin";
  const canRequest    = session && ["student", "researcher"].includes(session.user.role) && !isOwner;
  const hasActive     = existingRequest && !["rejected", "revoked", "expired"].includes(existingRequest.status);
  const hasPending    = hasActive && existingRequest.status !== "approved";
  const hasApproved   = existingRequest?.status === "approved" && !existingRequest.agreement;
  const grantActive   = grant?.status === "active" && new Date(grant.expiresAt) > new Date();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/data-rooms" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Data Rooms
      </Link>

      {/* status banner for owner */}
      {isOwner && asset.status === "draft" && (
        <div className="mb-4 flex items-start justify-between gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">This dataset is a draft</p>
              <p className="text-xs text-amber-700 mt-0.5">Submit for admin review to make it publicly visible.</p>
            </div>
          </div>
          <Button size="sm" onClick={handleSubmitForReview} disabled={submitReview}>
            {submitReview ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      )}
      {isOwner && asset.status === "review" && (
        <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-blue-800">Under admin review — you will be notified when it is published.</p>
          </div>
        </div>
      )}

      {/* download info banner */}
      {downloadInfo && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-emerald-800">{downloadInfo.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* title card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 text-balance">{asset.title}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {asset.owner.profile?.companyName || asset.owner.name}
                      {asset.sector && <span className="ml-2 text-slate-400">· {asset.sector}</span>}
                    </p>
                  </div>
                </div>
                <SensitivityBadge level={asset.sensitivityLevel} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{asset.description}</p>
            </CardContent>
          </Card>

          {/* metadata grid */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Dataset Details</h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetaItem icon={Database}  label="Data Type"       value={DATA_TYPE_LABEL[asset.dataType] ?? asset.dataType} />
                <MetaItem icon={ShieldCheck} label="Anonymization" value={ANON_LABEL[asset.anonymization] ?? asset.anonymization} />
                <MetaItem icon={Hash}      label="Records"         value={asset.recordsCount ? asset.recordsCount.toLocaleString() : "Not specified"} />
                <MetaItem icon={Calendar}  label="Time Period"     value={asset.timePeriod || "Not specified"} />
                <MetaItem icon={Eye}       label="Access Mode"     value={ACCESS_MODE_LABEL[asset.accessMode] ?? asset.accessMode} />
                <MetaItem icon={Globe}     label="Commercial Use"  value={asset.commercialUse ? "Permitted" : "Not permitted"} />
              </div>
            </CardContent>
          </Card>

          {/* access requirements */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Access Requirements</h2>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <RequirementRow met={asset.ndaRequired}     label="NDA / Data Use Agreement required"    />
              <RequirementRow met={asset.ethicsRequired}  label="Ethics approval documentation required" />
              {asset.sensitivityLevel === "critical" && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Critical sensitivity — metadata viewing only by default. Contact the owner to discuss controlled workspace access.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          {/* action card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <Badge variant={asset.status === "published" ? "success" : asset.status === "review" ? "warning" : "default"}>
                  {asset.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Published</span>
                <span>{formatDate(asset.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Requests</span>
                <span>{asset._count.accessRequests}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                {/* grant active: show download */}
                {grantActive && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Access granted — expires {formatDate(grant!.expiresAt)}
                    </div>
                    <Button className="w-full" onClick={handleDownload} disabled={downloading}>
                      <Download className="w-4 h-4 mr-2" />
                      {downloading ? "Generating link..." : "Download Dataset"}
                    </Button>
                  </>
                )}

                {/* approved but not signed */}
                {!grantActive && hasApproved && canRequest && (
                  <Link href="/data-requests">
                    <Button className="w-full">
                      <FileText className="w-4 h-4 mr-2" /> Sign NDA to Get Access
                    </Button>
                  </Link>
                )}

                {/* pending request */}
                {!grantActive && hasPending && canRequest && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Your request is under review — status: <strong className="ml-1 capitalize">{existingRequest!.status.replace("_", " ")}</strong>
                  </div>
                )}

                {/* can request */}
                {!grantActive && !hasActive && canRequest && asset.status === "published" && (
                  asset.accessMode === "metadata_only" ? (
                    <Link href={`/messages?to=${asset.owner.id}`}>
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" /> Contact Owner
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/data-rooms/${asset.id}/request`}>
                      <Button className="w-full">
                        <ArrowRight className="w-4 h-4 mr-2" /> Request Access
                      </Button>
                    </Link>
                  )
                )}

                {/* always show message owner button */}
                {!isOwner && (
                  <Link href={`/messages?to=${asset.owner.id}`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message Owner
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* owner card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Building className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {asset.owner.profile?.companyName || asset.owner.name}
                  </p>
                  {asset.owner.profile?.companySector && (
                    <p className="text-xs text-slate-500">{asset.owner.profile.companySector}</p>
                  )}
                </div>
              </div>
              {(isOwner || isAdmin) && (
                <Badge variant={asset.status === "published" ? "success" : "warning"} className="mt-1">
                  {asset.status}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-slate-300 flex-shrink-0" />
      )}
      <span className={met ? "text-slate-800" : "text-slate-400"}>{label}</span>
    </div>
  );
}

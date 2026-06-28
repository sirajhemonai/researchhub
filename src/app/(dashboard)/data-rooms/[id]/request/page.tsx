"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SensitivityBadge } from "@/components/data-rooms/SensitivityBadge";
import { AlertTriangle, ChevronLeft, Database, ShieldCheck } from "lucide-react";

interface DataAsset {
  id: string;
  title: string;
  sensitivityLevel: string;
  accessMode: string;
  ndaRequired: boolean;
  ethicsRequired: boolean;
  status: string;
  owner: { id: string };
}

const DURATION_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

export default function RequestAccessPage() {
  const { data: session } = useSession();
  const params            = useParams();
  const router            = useRouter();
  const id                = params.id as string;

  const [asset, setAsset]         = useState<DataAsset | null>(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  const [form, setForm] = useState({
    purpose:        "",
    methodology:    "",
    expectedOutput: "",
    institution:    "",
    ethicsDocUrl:   "",
    requestedDays:  "30",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/data-assets/${id}`)
      .then((r) => r.json())
      .then((data) => { setAsset(data.asset || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res  = await fetch(`/api/data-assets/${id}/request-access`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to submit request");
      setSubmitting(false);
      return;
    }

    router.push("/data-requests");
  }

  if (!session || !["student", "researcher"].includes(session.user.role)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">Only students and researchers can request data access.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!asset || asset.status !== "published") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">Dataset not available</h2>
        <Link href="/data-rooms" className="mt-4 inline-block">
          <Button variant="outline"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Data Rooms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/data-rooms/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Dataset
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Request Data Access</h1>
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
        <Database className="w-4 h-4 text-slate-400" />
        <span className="truncate">{asset.title}</span>
        <SensitivityBadge level={asset.sensitivityLevel} />
      </div>

      {asset.ethicsRequired && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          This dataset requires ethics committee approval. Please provide a URL to your approval document.
        </div>
      )}

      {asset.ndaRequired && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          If approved, you will be required to sign a Data Use Agreement before gaining access.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Research Purpose</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Research Purpose <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.purpose}
                onChange={(e) => set("purpose", e.target.value)}
                placeholder="Describe your research goal and why you need this dataset (min 30 characters)..."
                rows={4}
                required
              />
              <p className="text-xs text-slate-400 mt-1">{form.purpose.length} / 30 minimum chars</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Methodology</label>
              <Textarea
                value={form.methodology}
                onChange={(e) => set("methodology", e.target.value)}
                placeholder="Describe your research methodology..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Output</label>
              <Textarea
                value={form.expectedOutput}
                onChange={(e) => set("expectedOutput", e.target.value)}
                placeholder="What do you expect to produce from this research? (paper, model, report...)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Affiliation & Documentation</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution / Organisation</label>
              <Input
                value={form.institution}
                onChange={(e) => set("institution", e.target.value)}
                placeholder="University or organisation name"
              />
            </div>
            {asset.ethicsRequired && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ethics Approval Document URL <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.ethicsDocUrl}
                  onChange={(e) => set("ethicsDocUrl", e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Requested Access Duration</label>
              <Select
                value={form.requestedDays}
                onChange={(e) => set("requestedDays", e.target.value)}
                options={DURATION_OPTIONS}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href={`/data-rooms/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting || form.purpose.length < 30}>
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}

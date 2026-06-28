"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, ChevronLeft, AlertTriangle } from "lucide-react";
import { BD_SECTORS } from "@/lib/utils";

const DATA_TYPES = [
  { value: "tabular", label: "Tabular (CSV, Excel, SQL)" },
  { value: "image",   label: "Image / Medical Imaging"  },
  { value: "text",    label: "Text / Documents"         },
  { value: "audio",   label: "Audio"                    },
  { value: "mixed",   label: "Mixed"                    },
];

const SENSITIVITY_LEVELS = [
  { value: "low",      label: "Low — non-personal, publicly safe"        },
  { value: "medium",   label: "Medium — aggregated, low re-id risk"      },
  { value: "high",     label: "High — identifiable, strong controls needed" },
  { value: "critical", label: "Critical — medical / financial / legal"   },
];

const ACCESS_MODES = [
  { value: "download",      label: "Download — researcher downloads the file"         },
  { value: "metadata_only", label: "Metadata Only — listing only, contact owner"     },
  { value: "controlled",    label: "Controlled — workspace access only (no download)" },
];

const ANONYMIZATION = [
  { value: "none",          label: "None — raw data"         },
  { value: "deidentified",  label: "De-identified"           },
  { value: "anonymized",    label: "Fully Anonymized"        },
  { value: "synthetic",     label: "Synthetic Data"          },
];

export default function NewDataAssetPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title:            "",
    description:      "",
    sector:           "",
    dataType:         "tabular",
    sensitivityLevel: "medium",
    accessMode:       "download",
    anonymization:    "anonymized",
    recordsCount:     "",
    timePeriod:       "",
    ndaRequired:      true,
    ethicsRequired:   false,
    commercialUse:    false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  if (!session || !["industry", "government", "admin"].includes(session.user.role)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">Only verified industry or government accounts can publish datasets.</p>
      </div>
    );
  }

  function set(key: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      ...form,
      recordsCount: form.recordsCount ? parseInt(form.recordsCount) : undefined,
    };

    const res  = await fetch("/api/data-assets", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create dataset");
      setSubmitting(false);
      return;
    }

    router.push(`/data-rooms/${data.asset.id}`);
  }

  const criticalAndDownload = form.sensitivityLevel === "critical" && form.accessMode === "download";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/data-rooms" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Data Rooms
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Publish a Dataset</h1>
      <p className="text-slate-500 text-sm mb-6">Your dataset will be saved as a draft. Submit it for admin review to make it publicly visible.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* basic info */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dataset Title <span className="text-red-500">*</span></label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. E-commerce Transaction Fraud Dataset 2020–2024" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the dataset, its contents, collection methodology, and potential research use cases (min 30 chars)..." rows={4} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Sector</label>
                <Select value={form.sector} onChange={(e) => set("sector", e.target.value)} options={[{ value: "", label: "Select sector..." }, ...BD_SECTORS.map((s) => ({ value: s, label: s }))]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Data Type <span className="text-red-500">*</span></label>
                <Select value={form.dataType} onChange={(e) => set("dataType", e.target.value)} options={DATA_TYPES} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Record Count</label>
                <Input type="number" value={form.recordsCount} onChange={(e) => set("recordsCount", e.target.value)} placeholder="e.g. 250000" min={1} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Period</label>
                <Input value={form.timePeriod} onChange={(e) => set("timePeriod", e.target.value)} placeholder="e.g. 2020–2024" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* sensitivity & access */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Sensitivity & Access Controls</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sensitivity Level <span className="text-red-500">*</span></label>
              <Select value={form.sensitivityLevel} onChange={(e) => set("sensitivityLevel", e.target.value)} options={SENSITIVITY_LEVELS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Mode <span className="text-red-500">*</span></label>
              <Select value={form.accessMode} onChange={(e) => set("accessMode", e.target.value)} options={ACCESS_MODES} />
            </div>
            {criticalAndDownload && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Critical sensitivity data cannot use download mode. Please select Metadata Only or Controlled.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Anonymization Method <span className="text-red-500">*</span></label>
              <Select value={form.anonymization} onChange={(e) => set("anonymization", e.target.value)} options={ANONYMIZATION} />
            </div>
          </CardContent>
        </Card>

        {/* toggles */}
        <Card>
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Requirements & Permissions</h2>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <ToggleRow
              checked={form.ndaRequired}
              onChange={(v) => set("ndaRequired", v)}
              label="Require NDA / Data Use Agreement"
              description="Researchers must sign a digital agreement before access is granted."
            />
            <ToggleRow
              checked={form.ethicsRequired}
              onChange={(v) => set("ethicsRequired", v)}
              label="Require Ethics Approval"
              description="Researchers must upload an ethics committee approval document."
            />
            <ToggleRow
              checked={form.commercialUse}
              onChange={(v) => set("commercialUse", v)}
              label="Permit Commercial Use"
              description="Allow researchers to use this data for commercial projects."
            />
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/data-rooms">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting || criticalAndDownload}>
            {submitting ? "Saving..." : "Save as Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleRow({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 flex-shrink-0"
      />
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </label>
  );
}

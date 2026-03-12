"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AgreementPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user || !id) return;
    fetch(`/api/engagements/${id}/agreement`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          throw new Error(data.error || "Failed to load agreement");
        }
        return r.text();
      })
      .then((text) => setHtml(text))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/engagements/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Engagement
          </Button>
        </Link>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/engagements/${id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Engagement
        </Button>
      </Link>
      <div
        className="bg-white border border-slate-200 rounded-lg shadow-sm p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

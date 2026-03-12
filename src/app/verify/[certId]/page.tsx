"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Award, Building2, GraduationCap, Calendar, Shield } from "lucide-react";

interface CertificateData {
  id: string;
  studentName: string;
  university: string | null;
  projectTitle: string;
  companyName: string;
  duration: string;
  milestoneSummary: { title: string; status: string; approvedAt: string | null }[];
  verificationUrl: string;
  createdAt: string;
  error?: string;
}

export default function VerifyCertificatePage() {
  const { certId } = useParams();
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/certificates/${certId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCert(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load certificate");
        setLoading(false);
      });
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading certificate...</div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 mb-2">Certificate Not Found</h1>
            <p className="text-slate-600">{error || "This certificate ID does not exist."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const milestones = cert.milestoneSummary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Verified Certificate
          </div>
          <h1 className="text-3xl font-bold text-slate-900">ResearchBridge BD</h1>
          <p className="text-slate-500 mt-1">Certificate of Project Completion</p>
        </div>

        <Card className="border-2 border-emerald-200 shadow-lg">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-10 h-10 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{cert.studentName}</h2>
                  {cert.university && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> {cert.university}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="success" className="text-xs">Verified</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Project</p>
              <p className="text-lg font-semibold text-slate-900">{cert.projectTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Company</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {cert.companyName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {cert.duration}
                </p>
              </div>
            </div>

            {milestones.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Milestones Completed</p>
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{m.title}</span>
                      {m.approvedAt && (
                        <span className="text-xs text-slate-400 ml-auto">{formatDate(m.approvedAt)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Certificate ID: {cert.id}</span>
                <span>Issued: {formatDate(cert.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          This certificate was issued by ResearchBridge BD and can be verified at this URL.
        </p>
      </div>
    </div>
  );
}

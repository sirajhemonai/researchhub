"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate } from "@/lib/utils";
import { ArrowLeft, Building2, MapPin, Clock, Banknote, Calendar, MessageSquare } from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => { setJob(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-2/3" />
          <div className="h-40 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Job Not Found</h1>
        <Link href="/jobs"><Button variant="outline" className="mt-4">Back to Jobs</Button></Link>
      </div>
    );
  }

  const company = job.company as Record<string, unknown>;
  const profile = company?.profile as Record<string, unknown> | null;

  const typeColors: Record<string, "info" | "success" | "warning" | "default"> = {
    internship: "info", fulltime: "success", parttime: "warning", contract: "default",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{job.title as string}</h1>
          <Badge variant={typeColors[job.type as string] || "default"} className="capitalize text-sm">
            {job.type as string}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {(profile?.companyName as string) || (company?.name as string)}
          </span>
          {job.location ? (
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location as string}</span>
          ) : null}
          {job.salary ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Banknote className="w-4 h-4" />৳{job.salary as string}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />Posted {formatDate(job.createdAt as string)}
          </span>
          {job.deadline ? (
            <span className="flex items-center gap-1 text-amber-600">
              <Calendar className="w-4 h-4" />Deadline: {formatDate(job.deadline as string)}
            </span>
          ) : null}
        </div>
      </div>

      {parseJsonField(job.skills as string).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {parseJsonField(job.skills as string).map((skill) => (
            <Badge key={skill} variant="default">{skill}</Badge>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader><h2 className="text-base font-semibold">Job Description</h2></CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {job.description as string}
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card className="mb-6">
          <CardHeader><h2 className="text-base font-semibold">About the Company</h2></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{profile.companyName as string || company.name as string}</p>
              {profile.companySector ? <p className="text-slate-600">Sector: {profile.companySector as string}</p> : null}
              {profile.companySize ? <p className="text-slate-600">Size: {profile.companySize as string} employees</p> : null}
              {profile.website ? (
                <a href={profile.website as string} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  Visit website
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href={`/messages?to=${company?.id}`}>
          <Button size="lg">
            <MessageSquare className="w-4 h-4 mr-2" /> Contact Company
          </Button>
        </Link>
      </div>
    </div>
  );
}

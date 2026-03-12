"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate } from "@/lib/utils";
import { Search, Plus, Briefcase, MapPin, Clock, Building2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  type: string;
  skills: string;
  description: string;
  location: string | null;
  salary: string | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    profile: { companyName: string | null; companySector: string | null } | null;
  };
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [page, type]);

  async function fetchJobs() {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set("search", search);
    if (type) params.set("type", type);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  }

  const canPostJob = session && ["industry", "admin"].includes(session.user.role);

  const typeColors: Record<string, "info" | "success" | "warning" | "default"> = {
    internship: "info",
    fulltime: "success",
    parttime: "warning",
    contract: "default",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs & Internships</h1>
          <p className="text-slate-600 mt-1">Find your next career opportunity in Bangladesh</p>
        </div>
        {canPostJob && (
          <Link href="/jobs/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Post Job</Button>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="pl-10" />
          </div>
          <Select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            options={[
              { value: "", label: "All Types" },
              { value: "internship", label: "Internship" },
              { value: "fulltime", label: "Full-time" },
              { value: "parttime", label: "Part-time" },
              { value: "contract", label: "Contract" },
            ]}
            className="sm:w-48"
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} job{total !== 1 ? "s" : ""} found</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border p-5 space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12">
          <CardContent className="p-0 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer mb-4">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <Badge variant={typeColors[job.type] || "default"} className="capitalize">
                          {job.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company.profile?.companyName || job.company.name}
                        </span>
                        {job.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {job.location}
                          </span>
                        ) : null}
                        {job.salary ? (
                          <span className="font-medium text-emerald-600">৳{job.salary}</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parseJsonField(job.skills).slice(0, 5).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(job.createdAt)}
                      </p>
                      {job.deadline ? (
                        <p className="text-xs text-amber-600 mt-1">
                          Deadline: {formatDate(job.deadline)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

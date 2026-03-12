"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate, BD_SECTORS } from "@/lib/utils";
import { Search, Plus, FileText, Clock, Users as UsersIcon } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  abstract: string;
  visibility: string;
  bountyType: string | null;
  bountyValue: string | null;
  status: string;
  skills: string;
  sector: string | null;
  deadline: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    profile: { companyName: string | null; companySector: string | null } | null;
  };
  _count: { submissions: number };
}

export default function ProblemsPage() {
  const { data: session } = useSession();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProblems();
  }, [page, sector]);

  async function fetchProblems() {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "12" });
    if (search) params.set("search", search);
    if (sector) params.set("sector", sector);

    const res = await fetch(`/api/problems?${params}`);
    const data = await res.json();
    setProblems(data.problems || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProblems();
  }

  const canPostProblem = session && ["industry", "government", "admin"].includes(session.user.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Problem Marketplace</h1>
          <p className="text-slate-600 mt-1">Browse real industry challenges and submit your solutions</p>
        </div>
        {canPostProblem && (
          <Link href="/problems/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Post Problem</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="pl-10"
            />
          </div>
          <Select
            value={sector}
            onChange={(e) => { setSector(e.target.value); setPage(1); }}
            options={[{ value: "", label: "All Sectors" }, ...BD_SECTORS.map((s) => ({ value: s, label: s }))]}
            className="sm:w-48"
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} problem{total !== 1 ? "s" : ""} found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : problems.length === 0 ? (
        <Card className="p-12">
          <CardContent className="p-0 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No problems found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <Link key={problem.id} href={`/problems/${problem.id}`}>
              <Card className="h-full hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2">{problem.title}</h3>
                    {problem.bountyType && problem.bountyType !== "none" ? (
                      <Badge variant="success" className="flex-shrink-0">
                        {problem.bountyType === "cash" ? `৳${problem.bountyValue || ""}` : "Certificate"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{problem.abstract}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {parseJsonField(problem.skills).slice(0, 3).map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                    {parseJsonField(problem.skills).length > 3 && (
                      <Badge variant="default">+{parseJsonField(problem.skills).length - 3}</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="font-medium text-slate-700">
                      {problem.company.profile?.companyName || problem.company.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {problem._count.submissions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(problem.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

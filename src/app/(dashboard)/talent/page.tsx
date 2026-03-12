"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, BD_SKILLS, BD_UNIVERSITIES } from "@/lib/utils";
import { getTrustColorClasses } from "@/lib/trust-score";
import {
  Search, GraduationCap, FlaskConical, MapPin, Star,
  CheckCircle2, Briefcase, Users as UsersIcon, MessageSquare,
  Shield, FolderOpen, BookOpen
} from "lucide-react";

interface TalentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  trustScore: number;
  profile: {
    university: string | null;
    department: string | null;
    skills: string;
    bio: string | null;
    gpa: number | null;
    graduationYear: number | null;
    availableForInternship: boolean;
    researchInterests: string | null;
    portfolioItems: string | null;
    pastResearch: string | null;
    availableForConsulting: boolean;
    verificationStatus: string;
  } | null;
  _count: { submissions: number };
}

export default function TalentPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<TalentUser[]>([]);
  const [search, setSearch] = useState("");
  const [university, setUniversity] = useState("");
  const [skill, setSkill] = useState("");
  const [role, setRole] = useState("");
  const [available, setAvailable] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTalent();
  }, [page, university, skill, role, available]);

  async function fetchTalent() {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set("search", search);
    if (university) params.set("university", university);
    if (skill) params.set("skill", skill);
    if (role) params.set("role", role);
    if (available) params.set("available", available);

    const res = await fetch(`/api/talent?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchTalent();
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Talent Discovery</h1>
        <p className="text-slate-600 mt-1">Find verified students and researchers by skill, university, and availability</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="pl-10" />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              options={[
                { value: "", label: "All Roles" },
                { value: "student", label: "Students" },
                { value: "researcher", label: "Researchers" },
              ]}
            />
            <Select
              value={university}
              onChange={(e) => { setUniversity(e.target.value); setPage(1); }}
              options={[{ value: "", label: "All Universities" }, ...BD_UNIVERSITIES.map((u) => ({ value: u, label: u }))]}
            />
            <Select
              value={skill}
              onChange={(e) => { setSkill(e.target.value); setPage(1); }}
              options={[{ value: "", label: "All Skills" }, ...BD_SKILLS.slice(0, 30).map((s) => ({ value: s, label: s }))]}
            />
            <Select
              value={available}
              onChange={(e) => { setAvailable(e.target.value); setPage(1); }}
              options={[
                { value: "", label: "Any Availability" },
                { value: "true", label: "Available for internship" },
              ]}
            />
          </div>
        </form>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} talent{total !== 1 ? "s" : ""} found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12">
          <CardContent className="p-0 text-center">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No talent found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-lg hover:border-emerald-200 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-emerald-700">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{user.name}</h3>
                      {user.verified && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {user.role === "student" ? (
                        <GraduationCap className="w-3.5 h-3.5" />
                      ) : (
                        <FlaskConical className="w-3.5 h-3.5" />
                      )}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                {user.profile?.university && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" /> {user.profile.university}
                    {user.profile.department && ` — ${user.profile.department}`}
                  </p>
                )}

                {user.profile?.bio && (
                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">{user.profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {parseJsonField(user.profile?.skills || "").slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="default">{skill}</Badge>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {(() => {
                    const colors = getTrustColorClasses(user.trustScore);
                    return (
                      <div className="flex items-center gap-2">
                        <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${colors.text}`} />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors.bg}`} style={{ width: `${user.trustScore}%` }} />
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${colors.text}`}>{user.trustScore}/100</span>
                      </div>
                    );
                  })()}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3 flex-wrap">
                      {user.profile?.gpa && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> GPA: {user.profile.gpa}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {user._count.submissions} solutions
                      </span>
                      {(() => {
                        const portfolioCount = parseJsonField(user.profile?.portfolioItems || "").length;
                        const researchCount = parseJsonField(user.profile?.pastResearch || "").length;
                        return (
                          <>
                            {portfolioCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3" /> {portfolioCount} project{portfolioCount !== 1 ? "s" : ""}
                              </span>
                            )}
                            {researchCount > 0 && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> {researchCount} research
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {user.profile?.availableForInternship && (
                      <Badge variant="success" className="text-xs">Available</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link href={`/profile/${user.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                  </Link>
                  <Link href={`/messages?to=${user.id}`}>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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

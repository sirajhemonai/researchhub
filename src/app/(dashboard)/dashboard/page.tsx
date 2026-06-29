"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate } from "@/lib/utils";
import {
  FileText, Briefcase, Users, MessageSquare, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle2, AlertCircle, Handshake
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentProblems, setRecentProblems] = useState<Record<string, unknown>[]>([]);
  const [recentJobs, setRecentJobs] = useState<Record<string, unknown>[]>([]);
  const [engagementCount, setEngagementCount] = useState(0);
  const [awaitingAction, setAwaitingAction] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated" || !session) return;

    fetch("/api/problems?limit=5").then((r) => r.json()).then((d) => setRecentProblems(d.problems || []));
    fetch("/api/jobs?limit=5").then((r) => r.json()).then((d) => setRecentJobs(d.jobs || []));
    if (session.user.role === "admin") {
      fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
    }
    fetch("/api/engagements").then(r => r.json()).then(data => {
      const engs = data.engagements || [];
      const active = engs.filter((e: Record<string, unknown>) =>
        ["active", "negotiating", "pending_deposit"].includes(e.status as string)
      );
      setEngagementCount(active.length);
      const userId = session.user.id;
      const isCompany = session.user.role === "industry";
      const hasAction = engs.some((e: Record<string, unknown>) => {
        if (e.status === "negotiating" && (e as Record<string, unknown>).proposedBy && (e as Record<string, unknown>).proposedBy !== userId) return true;
        if (e.status === "active") {
          const milestones = (e as Record<string, unknown>).milestones as Array<Record<string, unknown>> || [];
          if (isCompany && milestones.some(m => m.status === "under_review")) return true;
          if (!isCompany && milestones.some(m => m.status === "pending" || m.status === "revision_requested")) return true;
        }
        return false;
      });
      setAwaitingAction(hasAction);
    });
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user.role;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-slate-600 mt-1">
          {role === "student" && "Find problems to solve, build your verified portfolio, and get noticed by companies."}
          {role === "researcher" && "Discover applied research opportunities and collaboration partners."}
          {role === "industry" && "Post challenges, discover talent, and find innovative solutions."}
          {role === "government" && "Monitor innovation activity and post national challenges."}
          {role === "admin" && "Manage verifications, monitor platform activity, and review reports."}
        </p>
      </div>

      {!session.user.verified && role !== "admin" && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Profile verification pending</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Complete your profile to get verified and unlock all platform features.
            </p>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="mt-2 text-amber-700 hover:text-amber-800 hover:bg-amber-100">
                Complete Profile <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} />
          <StatCard label="Students" value={stats.totalStudents || 0} icon={Users} />
          <StatCard label="Problems" value={stats.totalProblems || 0} icon={FileText} />
          <StatCard label="Submissions" value={stats.totalSubmissions || 0} icon={TrendingUp} />
          <StatCard label="Pending Verifications" value={stats.pendingVerifications || 0} icon={Clock} color="amber" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(role === "industry" || role === "student" || role === "researcher") && (
          <Link href="/engagements">
            <Card className="p-4 hover:border-teal-200 hover:shadow-md transition-all cursor-pointer h-full relative">
              <CardContent className="p-0 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center relative">
                  <Handshake className="w-5 h-5 text-teal-600" />
                  {engagementCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                      {engagementCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700">Active Engagements</span>
                {awaitingAction && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
              </CardContent>
            </Card>
          </Link>
        )}
        {(role === "industry" || role === "government" || role === "admin") && (
          <Link href="/problems/new">
            <Card className="p-4 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-0 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Post a Problem</span>
              </CardContent>
            </Card>
          </Link>
        )}
        {(role === "industry" || role === "admin") && (
          <Link href="/jobs/new">
            <Card className="p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-0 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Post a Job</span>
              </CardContent>
            </Card>
          </Link>
        )}
        <Link href="/problems">
          <Card className="p-4 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-0 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Browse Problems</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/messages">
          <Card className="p-4 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-0 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Messages</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile">
          <Card className="p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer h-full">
            <CardContent className="p-0 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">My Profile</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Problems</h2>
            <Link href="/problems" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProblems.length === 0 ? (
              <Card className="p-6">
                <CardContent className="p-0 text-center text-slate-500 text-sm">
                  No problems posted yet. Be the first!
                </CardContent>
              </Card>
            ) : (
              recentProblems.map((p: Record<string, unknown>) => (
                <Link key={p.id as string} href={`/problems/${p.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 truncate">{p.title as string}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {((p.company as Record<string, unknown>)?.profile as Record<string, unknown>)?.companyName as string || (p.company as Record<string, unknown>)?.name as string}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {p.bountyType && p.bountyType !== "none" ? (
                            <Badge variant="success">{String(p.bountyType)}</Badge>
                          ) : null}
                          <span className="text-xs text-slate-400">{formatDate(p.createdAt as string)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {parseJsonField(p.skills as string).slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="default">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Latest Jobs & Internships</h2>
            <Link href="/jobs" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <Card className="p-6">
                <CardContent className="p-0 text-center text-slate-500 text-sm">
                  No job listings yet.
                </CardContent>
              </Card>
            ) : (
              recentJobs.map((j: Record<string, unknown>) => (
                <Link key={j.id as string} href={`/jobs/${j.id}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 truncate">{j.title as string}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {((j.company as Record<string, unknown>)?.profile as Record<string, unknown>)?.companyName as string || (j.company as Record<string, unknown>)?.name as string}
                          </p>
                        </div>
                        <Badge variant={j.type === "internship" ? "info" : "default"}>
                          {j.type as string}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "emerald",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

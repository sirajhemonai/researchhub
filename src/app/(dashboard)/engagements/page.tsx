"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight, Clock, CheckCircle2, AlertCircle,
  Handshake, CreditCard, Loader2, Archive
} from "lucide-react";

interface EngagementMilestone {
  id: string;
  status: string;
  dueDate: string;
  order: number;
  title: string;
}

interface Engagement {
  id: string;
  status: string;
  problem: { id: string; title: string };
  company: { id: string; name: string; profile?: { companyName?: string; standingBadge?: string } };
  student: { id: string; name: string; profile?: { university?: string } };
  milestones: EngagementMilestone[];
  projectValueBdt?: number;
  netStudentPayoutBdt?: number;
  depositDeadline?: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  negotiating: { label: "Negotiating", color: "bg-blue-100 text-blue-700", icon: Handshake },
  pending_deposit: { label: "Pending Deposit", color: "bg-amber-100 text-amber-700", icon: CreditCard },
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: Loader2 },
  closing: { label: "Closing", color: "bg-purple-100 text-purple-700", icon: Clock },
  payment_released: { label: "Payment Released", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-700", icon: CheckCircle2 },
  archived: { label: "Archived", color: "bg-slate-100 text-slate-500", icon: Archive },
};

const BADGE_COLORS: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  banned: "bg-red-200 text-red-900",
};

function StandingBadge({ badge }: { badge?: string }) {
  if (!badge || badge === "green") return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_COLORS[badge] || ""}`}>
      {badge === "banned" ? "Banned" : badge.charAt(0).toUpperCase() + badge.slice(1)}
    </span>
  );
}

function getMilestoneProgress(milestones: EngagementMilestone[]) {
  const completed = milestones.filter(m => m.status === "approved" || m.status === "refunded").length;
  return { approved: completed, total: milestones.length };
}

function getDaysRemaining(milestones: EngagementMilestone[]) {
  const completedStatuses = ["approved", "refunded"];
  const current = milestones.find(m => !completedStatuses.includes(m.status));
  if (!current) return null;
  const days = Math.ceil((new Date(current.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days;
}

function DepositCountdown({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="text-xs text-red-600 font-medium">Deposit expired</span>;
  return <span className="text-xs text-amber-600 font-medium">{days}d left for deposit</span>;
}

export default function EngagementsListPage() {
  const { data: session } = useSession();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagements")
      .then(r => r.json())
      .then(data => {
        setEngagements(data.engagements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!session) return null;

  const isCompany = session.user.role === "industry";

  const grouped: Record<string, Engagement[]> = {};
  const groupOrder = ["active", "pending_deposit", "negotiating", "closing", "payment_released", "closed", "archived"];

  for (const eng of engagements) {
    const key = eng.status;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(eng);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Engagements</h1>
        <p className="text-slate-600 mt-1">Track your project collaborations and milestones</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : engagements.length === 0 ? (
        <Card className="p-8">
          <CardContent className="p-0 text-center">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No engagements yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              {isCompany
                ? "Shortlist a submission to start an engagement."
                : "Get shortlisted for a problem to begin collaborating."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupOrder.map(status => {
            const group = grouped[status];
            if (!group || group.length === 0) return null;
            const config = STATUS_CONFIG[status];
            const Icon = config?.icon || Clock;

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    {config?.label || status} ({group.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {group.map(eng => {
                    const progress = getMilestoneProgress(eng.milestones);
                    const daysRemaining = getDaysRemaining(eng.milestones);
                    const otherParty = isCompany
                      ? eng.student
                      : eng.company;
                    const otherName = isCompany
                      ? otherParty.name
                      : ((otherParty as Engagement["company"]).profile?.companyName || otherParty.name);

                    return (
                      <Link key={eng.id} href={`/engagements/${eng.id}`}>
                        <Card className="p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                          <CardContent className="p-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                  {eng.problem.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-slate-500">{otherName}</span>
                                  {isCompany && eng.company.profile?.standingBadge && (
                                    <StandingBadge badge={eng.company.profile.standingBadge} />
                                  )}
                                  {!isCompany && (eng.company.profile?.standingBadge) && (
                                    <StandingBadge badge={eng.company.profile.standingBadge} />
                                  )}
                                </div>
                                {eng.milestones.length > 0 && (
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-slate-500">
                                      {progress.approved}/{progress.total} milestones approved
                                    </span>
                                    {eng.status === "active" && daysRemaining !== null && (
                                      <span className={`text-xs font-medium ${daysRemaining < 0 ? "text-red-600" : daysRemaining <= 3 ? "text-amber-600" : "text-slate-500"}`}>
                                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d remaining`}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {eng.status === "pending_deposit" && (
                                  <div className="mt-2">
                                    <DepositCountdown deadline={eng.depositDeadline} />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={config?.color || ""}>
                                  {config?.label || status}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Building2, Clock, Users, Send, CheckCircle2,
  XCircle, Star, Eye, Lock, FileText, MessageSquare,
  Github, ExternalLink, Paperclip, UserPlus, X
} from "lucide-react";

export default function ProblemDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [problem, setProblem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [solutionDesc, setSolutionDesc] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [teamMemberInput, setTeamMemberInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [ipAccepted, setIpAccepted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProblem(data);
        setLoading(false);
      });
  }, [id]);

  function addTeamMember() {
    const name = teamMemberInput.trim();
    if (name && !teamMembers.includes(name)) {
      setTeamMembers([...teamMembers, name]);
    }
    setTeamMemberInput("");
  }

  async function handleSubmitSolution(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!ipAccepted) {
      setSubmitError("You must accept the IP ownership clause");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: id,
          description: solutionDesc,
          githubRepoUrl: githubRepoUrl || undefined,
          demoUrl: demoUrl || undefined,
          fileUrl: fileUrl || undefined,
          teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
          ipAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error);
        return;
      }

      setSubmitSuccess(true);
      setShowSubmitForm(false);
      const updated = await fetch(`/api/problems/${id}`).then((r) => r.json());
      setProblem(updated);
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSubmissionStatus(submissionId: string, status: string) {
    await fetch(`/api/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await fetch(`/api/problems/${id}`).then((r) => r.json());
    setProblem(updated);
  }

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

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Problem Not Found</h1>
        <Link href="/problems"><Button variant="outline" className="mt-4">Back to Problems</Button></Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === (problem.company as Record<string, unknown>)?.id;
  const canSubmit = session && ["student", "researcher"].includes(session.user.role);
  const submissions = (problem.submissions as Record<string, unknown>[]) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/problems" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Problems
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{problem.title as string}</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={problem.status === "open" ? "success" : "default"}>
              {problem.status as string}
            </Badge>
            <Badge variant={problem.visibility === "public" ? "info" : "warning"}>
              {problem.visibility === "public" && <><Eye className="w-3 h-3 mr-1" />Public</>}
              {problem.visibility === "private" && <><Lock className="w-3 h-3 mr-1" />Private</>}
              {problem.visibility === "nda" && <><FileText className="w-3 h-3 mr-1" />NDA</>}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {((problem.company as Record<string, unknown>)?.profile as Record<string, unknown>)?.companyName as string || (problem.company as Record<string, unknown>)?.name as string}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(problem.createdAt as string)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {(problem._count as Record<string, number>)?.submissions || 0} submissions
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {problem.bountyType && problem.bountyType !== "none" ? (
          <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-600 font-medium">Bounty</span>
            <p className="text-sm font-semibold text-emerald-700">
              {problem.bountyType === "cash" ? `৳${problem.bountyValue}` : "Certificate"}
            </p>
          </div>
        ) : null}
        {problem.deadline ? (
          <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-xs text-amber-600 font-medium">Deadline</span>
            <p className="text-sm font-semibold text-amber-700">{formatDate(problem.deadline as string)}</p>
          </div>
        ) : null}
        {problem.sector ? (
          <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-xs text-blue-600 font-medium">Sector</span>
            <p className="text-sm font-semibold text-blue-700">{problem.sector as string}</p>
          </div>
        ) : null}
      </div>

      {parseJsonField(problem.skills as string).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {parseJsonField(problem.skills as string).map((skill) => (
            <Badge key={skill} variant="default">{skill}</Badge>
          ))}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader><h2 className="text-base font-semibold">Problem Description</h2></CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p className="font-medium text-slate-800 mb-3">{problem.abstract as string}</p>
            <div className="whitespace-pre-wrap">{problem.fullDescription as string}</div>
          </div>
        </CardContent>
      </Card>

      {canSubmit && problem.status === "open" && !submitSuccess && (
        <Card className="mb-6">
          <CardContent className="p-5">
            {!showSubmitForm ? (
              <div className="text-center">
                <Button onClick={() => setShowSubmitForm(true)}>
                  <Send className="w-4 h-4 mr-1" /> Submit a Solution
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Submit Your Solution</h3>
                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{submitError}</div>
                )}
                <Textarea
                  label="Solution Description"
                  value={solutionDesc}
                  onChange={(e) => setSolutionDesc(e.target.value)}
                  placeholder="Describe your approach, methodology, and deliverables..."
                  className="min-h-[200px]"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="GitHub Repository URL"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                  <Input
                    label="Live Demo URL"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://your-demo.vercel.app"
                  />
                </div>

                <Input
                  label="Document / File Link (Google Drive, Dropbox, etc.)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Members (optional)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={teamMemberInput}
                      onChange={(e) => setTeamMemberInput(e.target.value)}
                      placeholder="Team member name"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTeamMember(); } }}
                    />
                    <Button type="button" variant="outline" onClick={addTeamMember}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  {teamMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((m) => (
                        <span key={m} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                          {m}
                          <button type="button" onClick={() => setTeamMembers(teamMembers.filter((t) => t !== m))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="ip-accept"
                    checked={ipAccepted}
                    onChange={(e) => setIpAccepted(e.target.checked)}
                    className="mt-1 rounded border-slate-300"
                  />
                  <label htmlFor="ip-accept" className="text-sm text-slate-700">
                    I accept that my submission becomes the intellectual property of the posting organization.
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" loading={submitting}>Submit Solution</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowSubmitForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {submitSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">Solution submitted successfully!</p>
        </div>
      )}

      {(isOwner || session?.user?.role === "admin") && submissions.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Submissions ({submissions.length})</h2>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {submissions.map((sub: Record<string, unknown>) => (
              <div key={sub.id as string} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">
                        {(sub.user as Record<string, unknown>)?.name as string}
                      </span>
                      <Badge variant={
                        sub.status === "shortlisted" ? "success" :
                        sub.status === "accepted" ? "info" :
                        sub.status === "rejected" ? "danger" : "default"
                      }>
                        {sub.status as string}
                      </Badge>
                    </div>
                    {((sub.user as Record<string, unknown>)?.profile as Record<string, unknown>)?.university ? (
                      <p className="text-xs text-slate-500">
                        {String(((sub.user as Record<string, unknown>).profile as Record<string, unknown>).university)}
                      </p>
                    ) : null}
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                      {sub.description as string}
                    </p>

                    {(sub.githubRepoUrl || sub.demoUrl || sub.fileUrl) ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {sub.githubRepoUrl ? (
                          <a href={sub.githubRepoUrl as string} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 transition-colors">
                            <Github className="w-3.5 h-3.5" /> GitHub Repo
                          </a>
                        ) : null}
                        {sub.demoUrl ? (
                          <a href={sub.demoUrl as string} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        ) : null}
                        {sub.fileUrl ? (
                          <a href={sub.fileUrl as string} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors">
                            <Paperclip className="w-3.5 h-3.5" /> Document
                          </a>
                        ) : null}
                      </div>
                    ) : null}

                    {sub.teamMembers ? (() => {
                      const members = parseJsonField(sub.teamMembers as string);
                      return members.length > 0 ? (
                        <div className="mt-2 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            Team: {members.join(", ")}
                          </span>
                        </div>
                      ) : null;
                    })() : null}

                    <p className="text-xs text-slate-400 mt-2">{formatDate(sub.createdAt as string)}</p>
                  </div>
                  {isOwner && sub.status === "submitted" && (
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSubmissionStatus(sub.id as string, "shortlisted")}
                      >
                        <Star className="w-3 h-3 mr-1" /> Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSubmissionStatus(sub.id as string, "rejected")}
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {sub.status === "shortlisted" && isOwner && (
                  <div className="mt-2">
                    <Link href={`/messages?to=${(sub.user as Record<string, unknown>)?.id}`}>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3 mr-1" /> Message
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

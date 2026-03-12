"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BD_SKILLS, BD_SECTORS } from "@/lib/utils";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

export default function NewProblemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    fullDescription: "",
    visibility: "public",
    bountyType: "none",
    bountyValue: "",
    skills: [] as string[],
    sector: "",
    deadline: "",
    ipClauseAccepted: false,
  });

  if (!session || !["industry", "government", "admin"].includes(session.user.role)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-600 mt-2">Only industry and government users can post problems.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.ipClauseAccepted) {
      setError("You must accept the IP ownership clause");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create problem");
        return;
      }

      router.push(`/problems/${data.problem.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function addSkill(skill: string) {
    if (skill && !form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] });
    }
    setSkillInput("");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/problems" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Problems
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a New Problem</h1>
      <p className="text-slate-600 mb-6">Describe your industry challenge and receive solutions from verified students and researchers.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader><h2 className="text-base font-semibold">Problem Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Problem Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Build an inventory management system for our garment factory"
              required
            />
            <Textarea
              label="Abstract (visible to everyone)"
              value={form.abstract}
              onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              placeholder="A brief overview of the problem..."
              required
            />
            <Textarea
              label="Full Description (may be gated)"
              value={form.fullDescription}
              onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
              placeholder="Detailed requirements, constraints, expected deliverables..."
              className="min-h-[200px]"
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-base font-semibold">Settings</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Visibility"
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                options={[
                  { value: "public", label: "Public — visible to all" },
                  { value: "private", label: "Private — abstract only" },
                  { value: "nda", label: "NDA-gated — requires agreement" },
                ]}
              />
              <Select
                label="Sector"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                options={[{ value: "", label: "Select sector" }, ...BD_SECTORS.map((s) => ({ value: s, label: s }))]}
              />
              <Select
                label="Bounty Type"
                value={form.bountyType}
                onChange={(e) => setForm({ ...form, bountyType: e.target.value })}
                options={[
                  { value: "none", label: "No bounty" },
                  { value: "cash", label: "Cash bounty" },
                  { value: "certificate", label: "Certificate" },
                ]}
              />
              {form.bountyType === "cash" && (
                <Input
                  label="Bounty Amount (BDT)"
                  value={form.bountyValue}
                  onChange={(e) => setForm({ ...form, bountyValue: e.target.value })}
                  placeholder="e.g. 10000"
                />
              )}
              <Input
                label="Deadline (optional)"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Type a skill..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  list="problem-skill-options"
                />
                <datalist id="problem-skill-options">
                  {BD_SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <Button type="button" onClick={() => addSkill(skillInput)} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                    {skill}
                    <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="ip-clause"
                checked={form.ipClauseAccepted}
                onChange={(e) => setForm({ ...form, ipClauseAccepted: e.target.checked })}
                className="mt-1 rounded border-slate-300"
              />
              <label htmlFor="ip-clause" className="text-sm text-slate-700">
                <span className="font-medium">IP Ownership Clause:</span> I understand that by posting this problem,
                all submitted solutions become the intellectual property of my organization, and submitters
                acknowledge this transfer of IP rights before submitting.
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">Post Problem</Button>
          <Link href="/problems">
            <Button type="button" variant="ghost" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

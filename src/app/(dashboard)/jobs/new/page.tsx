"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BD_SKILLS } from "@/lib/utils";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "internship",
    skills: [] as string[],
    description: "",
    location: "",
    salary: "",
    deadline: "",
  });

  if (!session || !["industry", "admin"].includes(session.user.role)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-600 mt-2">Only industry users can post jobs.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create job");
        return;
      }

      router.push(`/jobs/${data.job.id}`);
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
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a New Job</h1>
      <p className="text-slate-600 mb-6">Find talented students and researchers for your openings.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <Card>
          <CardHeader><h2 className="text-base font-semibold">Job Details</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Frontend Developer Intern" required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Job Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={[
                  { value: "internship", label: "Internship" },
                  { value: "fulltime", label: "Full-time" },
                  { value: "parttime", label: "Part-time" },
                  { value: "contract", label: "Contract" },
                ]}
              />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Dhaka, Remote" />
              <Input label="Salary (BDT, optional)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="e.g. 15000-25000" />
              <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Responsibilities, requirements, benefits..." className="min-h-[200px]" required />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Type a skill..."
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  list="job-skill-options"
                />
                <datalist id="job-skill-options">
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

        <div className="flex gap-3">
          <Button type="submit" loading={loading} size="lg">Post Job</Button>
          <Link href="/jobs">
            <Button type="button" variant="ghost" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

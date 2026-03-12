"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseJsonField } from "@/lib/utils";
import { BD_SKILLS, BD_UNIVERSITIES, BD_SECTORS } from "@/lib/utils";
import { getProfileCompleteness, getProfileCompletenessFromForm, getTrustColorClasses } from "@/lib/trust-score";
import {
  User, MapPin, Phone, Globe, GraduationCap, Building2,
  Linkedin, BookOpen, CheckCircle2, Save, X, Github,
  Shield, Briefcase, TrendingUp, ExternalLink, FolderOpen,
  Plus, Trash2, FlaskConical, Pencil
} from "lucide-react";

function TrustScoreMeter({ score, factors }: { score: number; factors: { label: string; points: number; maxPoints: number }[] }) {
  const colors = getTrustColorClasses(score);
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Trust Score: {score}/100
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-3xl font-bold ${colors.text}`}>{score}</div>
          <div className="flex-1">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {factors.map((f) => (
            <div key={f.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{f.label}</span>
              <span className={`font-medium ${f.points > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                {f.points}/{f.maxPoints}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompletenessBar({ percentage }: { percentage: number }) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">Profile Completeness</span>
        <span className="text-sm font-bold text-blue-700">{percentage}%</span>
      </div>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {percentage < 80 && (
        <p className="text-xs text-blue-600 mt-2">Fill out more fields to increase your trust score and visibility.</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [skillInput, setSkillInput] = useState("");
  const [pubInput, setPubInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          bio: data.profile?.bio || "",
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          linkedinUrl: data.profile?.linkedinUrl || "",
          githubUrl: data.profile?.githubUrl || "",
          portfolioUrl: data.profile?.portfolioUrl || "",
          skills: parseJsonField(data.profile?.skills),
          university: data.profile?.university || "",
          department: data.profile?.department || "",
          studentId: data.profile?.studentId || "",
          gpa: data.profile?.gpa || "",
          graduationYear: data.profile?.graduationYear || "",
          portfolioItems: parseJsonField(data.profile?.portfolioItems),
          pastResearch: parseJsonField(data.profile?.pastResearch),
          availableForInternship: data.profile?.availableForInternship || false,
          researchInterests: parseJsonField(data.profile?.researchInterests),
          orcidId: data.profile?.orcidId || "",
          googleScholarUrl: data.profile?.googleScholarUrl || "",
          researchGateUrl: data.profile?.researchGateUrl || "",
          hIndex: data.profile?.hIndex ?? "",
          publicationCount: data.profile?.publicationCount ?? "",
          citationCount: data.profile?.citationCount ?? "",
          publications: parseJsonField(data.profile?.publications),
          availableForConsulting: data.profile?.availableForConsulting || false,
          companyName: data.profile?.companyName || "",
          companySector: data.profile?.companySector || "",
          companySize: data.profile?.companySize || "",
          tradeLicenseNumber: data.profile?.tradeLicenseNumber || "",
          website: data.profile?.website || "",
          yearEstablished: data.profile?.yearEstablished ?? "",
        });
        setLoading(false);
      });
  }, []);

  const role = session?.user?.role || "";

  const completeness = useMemo(() => {
    if (editing) {
      return getProfileCompletenessFromForm(role, form);
    }
    const p = (profile as Record<string, unknown>)?.profile as Record<string, unknown> | null;
    return getProfileCompleteness(role, p);
  }, [editing, form, profile, role]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setEditing(false);
        const updated = await fetch("/api/profile").then((r) => r.json());
        setProfile(updated);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessage("Something went wrong");
    }
    setSaving(false);
  }

  function addSkill(skill: string) {
    const skills = form.skills as string[];
    if (skill && !skills.includes(skill)) {
      setForm({ ...form, skills: [...skills, skill] });
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setForm({ ...form, skills: (form.skills as string[]).filter((s) => s !== skill) });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-48 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!profile || !session) return null;

  const p = (profile as Record<string, unknown>).profile as Record<string, unknown> | null;
  const trustBreakdown = (profile as Record<string, unknown>).trustBreakdown as { label: string; points: number; maxPoints: number }[] | undefined;
  const trustScore = (profile as Record<string, unknown>).trustScore as number || 0;
  const stats = (profile as Record<string, unknown>)._stats as Record<string, number> | undefined;
  const counts = (profile as Record<string, unknown>)._count as Record<string, number> | undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-emerald-700">
                {(profile as Record<string, unknown>).name ? ((profile as Record<string, unknown>).name as string).charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              {editing ? (
                <Input value={form.name as string} onChange={(e) => setForm({ ...form, name: e.target.value })} label="Full Name" />
              ) : (
                <h2 className="text-xl font-bold text-slate-900">{(profile as Record<string, unknown>).name as string}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={(profile as Record<string, unknown>).verified ? "success" : "warning"}>
                  {(profile as Record<string, unknown>).verified ? "Verified" : "Pending Verification"}
                </Badge>
                <Badge>{role}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">{(profile as Record<string, unknown>).email as string}</p>

              {!editing && (
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500">
                  {role === "student" && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {counts?.submissions || 0} submissions · {stats?.shortlisted || 0} shortlisted
                    </span>
                  )}
                  {role === "researcher" && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {stats?.engagements || 0} problems consulted on
                    </span>
                  )}
                  {role === "industry" && (
                    <>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {counts?.problems || 0} problems posted
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {stats?.activeEngagements || stats?.engagements || 0} active engagements
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CompletenessBar percentage={completeness} />

      {trustBreakdown && <TrustScoreMeter score={trustScore} factors={trustBreakdown} />}

      <Card className="mb-6">
        <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><User className="w-4 h-4" /> About</h3></CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <Textarea label="Bio" value={form.bio as string} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone" value={form.phone as string} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880..." />
                <Input label="Location" value={form.location as string} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Dhaka, Bangladesh" />
                <Input label="LinkedIn URL" value={form.linkedinUrl as string} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
                <Input label="GitHub URL" value={form.githubUrl as string} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/username" />
                <Input label="Portfolio / Website" value={form.portfolioUrl as string} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="https://yoursite.com" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-700">{p?.bio ? p.bio as string : "No bio added yet."}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                {p?.phone ? <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{String(p.phone)}</span> : null}
                {p?.location ? <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{String(p.location)}</span> : null}
                {p?.linkedinUrl ? <a href={String(p.linkedinUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Linkedin className="w-4 h-4" />LinkedIn</a> : null}
                {p?.githubUrl ? <a href={String(p.githubUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-800 hover:underline"><Github className="w-4 h-4" />GitHub</a> : null}
                {p?.portfolioUrl ? <a href={String(p.portfolioUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><ExternalLink className="w-4 h-4" />Portfolio</a> : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Skills</h3></CardHeader>
        <CardContent>
          {editing ? (
            <div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Type a skill..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                    list="skill-options"
                  />
                  <datalist id="skill-options">
                    {BD_SKILLS.filter((s) => !(form.skills as string[]).includes(s)).map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <Button type="button" onClick={() => addSkill(skillInput)} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.skills as string[]).map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                    {skill}
                    <button onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {parseJsonField(p?.skills as string).length > 0 ? (
                parseJsonField(p?.skills as string).map((skill) => (
                  <Badge key={skill} variant="success">{skill}</Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills added yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(role === "student") && (
        <Card className="mb-6">
          <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Info</h3></CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="University" value={form.university as string} onChange={(e) => setForm({ ...form, university: e.target.value })} options={BD_UNIVERSITIES.map((u) => ({ value: u, label: u }))} placeholder="Select university" />
                <Input label="Department" value={form.department as string} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE" />
                <Input label="Student ID" value={form.studentId as string} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
                <Input label="GPA" type="number" step="0.01" min="0" max="4" value={form.gpa as string} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
                <Input label="Graduation Year" type="number" value={form.graduationYear as string} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="internship" checked={form.availableForInternship as boolean} onChange={(e) => setForm({ ...form, availableForInternship: e.target.checked })} className="rounded border-slate-300" />
                  <label htmlFor="internship" className="text-sm text-slate-700">Available for internship</label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="University" value={p?.university as string} />
                <InfoRow label="Department" value={p?.department as string} />
                <InfoRow label="Student ID" value={p?.studentId as string} />
                <InfoRow label="GPA" value={p?.gpa?.toString()} />
                <InfoRow label="Graduation Year" value={p?.graduationYear?.toString()} />
                <div>
                  {p?.availableForInternship ? <Badge variant="success">Available for internship</Badge> : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(role === "student") && (
        <Card className="mb-6">
          <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Portfolio Projects</h3></CardHeader>
          <CardContent>
            {editing ? (
              <PortfolioEditor
                items={(form.portfolioItems as PortfolioItem[]) || []}
                onChange={(items) => setForm({ ...form, portfolioItems: items })}
              />
            ) : (
              <PortfolioDisplay items={parseJsonField<PortfolioItem>(p?.portfolioItems as string)} />
            )}
          </CardContent>
        </Card>
      )}

      {(role === "student") && (
        <Card className="mb-6">
          <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Past Research</h3></CardHeader>
          <CardContent>
            {editing ? (
              <PastResearchEditor
                items={(form.pastResearch as ResearchEntry[]) || []}
                onChange={(items) => setForm({ ...form, pastResearch: items })}
              />
            ) : (
              <PastResearchDisplay items={parseJsonField<ResearchEntry>(p?.pastResearch as string)} />
            )}
          </CardContent>
        </Card>
      )}

      {role === "researcher" && (
        <Card className="mb-6">
          <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Research Info</h3></CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="University" value={form.university as string} onChange={(e) => setForm({ ...form, university: e.target.value })} options={BD_UNIVERSITIES.map((u) => ({ value: u, label: u }))} placeholder="Select university" />
                <Input label="Department" value={form.department as string} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                <Input label="ORCID ID" value={form.orcidId as string} onChange={(e) => setForm({ ...form, orcidId: e.target.value })} placeholder="0000-0001-2345-6789" />
                <Input label="Google Scholar URL" value={form.googleScholarUrl as string} onChange={(e) => setForm({ ...form, googleScholarUrl: e.target.value })} />
                <Input label="ResearchGate URL" value={form.researchGateUrl as string} onChange={(e) => setForm({ ...form, researchGateUrl: e.target.value })} placeholder="https://researchgate.net/profile/..." />
                <Input label="Publication Count" type="number" min="0" value={form.publicationCount as string} onChange={(e) => setForm({ ...form, publicationCount: e.target.value })} />
                <Input label="h-Index" type="number" min="0" value={form.hIndex as string} onChange={(e) => setForm({ ...form, hIndex: e.target.value })} />
                <Input label="Citation Count" type="number" min="0" value={form.citationCount as string} onChange={(e) => setForm({ ...form, citationCount: e.target.value })} />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publications (optional list)</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={pubInput}
                      onChange={(e) => setPubInput(e.target.value)}
                      placeholder="e.g. Title — Journal, Year"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = pubInput.trim();
                          if (val && !(form.publications as string[]).includes(val)) {
                            setForm({ ...form, publications: [...(form.publications as string[]), val] });
                          }
                          setPubInput("");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      const val = pubInput.trim();
                      if (val && !(form.publications as string[]).includes(val)) {
                        setForm({ ...form, publications: [...(form.publications as string[]), val] });
                      }
                      setPubInput("");
                    }}>Add</Button>
                  </div>
                  {(form.publications as string[]).length > 0 && (
                    <ul className="space-y-1">
                      {(form.publications as string[]).map((pub, i) => (
                        <li key={i} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                          <span className="text-slate-700">{pub}</span>
                          <button type="button" onClick={() => setForm({ ...form, publications: (form.publications as string[]).filter((_, idx) => idx !== i) })} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" id="consulting" checked={form.availableForConsulting as boolean} onChange={(e) => setForm({ ...form, availableForConsulting: e.target.checked })} className="rounded border-slate-300" />
                  <label htmlFor="consulting" className="text-sm text-slate-700">Available for consulting</label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow label="University" value={p?.university as string} />
                  <InfoRow label="Department" value={p?.department as string} />
                  <InfoRow label="ORCID" value={p?.orcidId as string} />
                  <InfoRow label="Publications" value={p?.publicationCount?.toString()} />
                  <InfoRow label="h-Index" value={p?.hIndex?.toString()} />
                  <InfoRow label="Citations" value={p?.citationCount?.toString()} />
                  {p?.googleScholarUrl ? <a href={String(p.googleScholarUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Google Scholar</a> : null}
                  {p?.researchGateUrl ? <a href={String(p.researchGateUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">ResearchGate</a> : null}
                  {p?.availableForConsulting ? <Badge variant="success">Available for consulting</Badge> : null}
                </div>
                {parseJsonField(p?.publications as string).length > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Publication List</p>
                    <ul className="space-y-1">
                      {parseJsonField(p?.publications as string).map((pub, i) => (
                        <li key={i} className="text-sm text-slate-700 bg-slate-50 rounded px-3 py-1.5">{pub}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {role === "industry" && (
        <Card className="mb-6">
          <CardHeader><h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company Info</h3></CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company Name" value={form.companyName as string} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                <Select label="Sector" value={form.companySector as string} onChange={(e) => setForm({ ...form, companySector: e.target.value })} options={BD_SECTORS.map((s) => ({ value: s, label: s }))} placeholder="Select sector" />
                <Select label="Company Size" value={form.companySize as string} onChange={(e) => setForm({ ...form, companySize: e.target.value })} options={[
                  { value: "1-10", label: "1-10 employees" },
                  { value: "11-50", label: "11-50 employees" },
                  { value: "51-200", label: "51-200 employees" },
                  { value: "201-1000", label: "201-1000 employees" },
                  { value: "1000+", label: "1000+ employees" },
                ]} placeholder="Select size" />
                <Input label="Trade License Number" value={form.tradeLicenseNumber as string} onChange={(e) => setForm({ ...form, tradeLicenseNumber: e.target.value })} />
                <Input label="Website" value={form.website as string} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                <Input label="Year Established" type="number" min="1900" max="2026" value={form.yearEstablished as string} onChange={(e) => setForm({ ...form, yearEstablished: e.target.value })} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="Company" value={p?.companyName as string} />
                <InfoRow label="Sector" value={p?.companySector as string} />
                <InfoRow label="Size" value={p?.companySize as string} />
                <InfoRow label="Trade License" value={p?.tradeLicenseNumber as string} />
                <InfoRow label="Year Established" value={p?.yearEstablished?.toString()} />
                {p?.website ? <a href={String(p.website)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe className="w-4 h-4" />Website</a> : null}
                {p?.verificationStatus === "verified" && (
                  <div className="col-span-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Trade License Verified</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PortfolioItem {
  title: string;
  description: string;
  role: string;
  techStack: string[];
  url: string;
}

interface ResearchEntry {
  title: string;
  year: string;
  contribution: string;
  venue: string;
  link: string;
}

function PortfolioItemForm({ draft, setDraft, techInput, setTechInput, onSave, onCancel, saveLabel }: {
  draft: PortfolioItem; setDraft: (d: PortfolioItem) => void; techInput: string; setTechInput: (v: string) => void;
  onSave: () => void; onCancel: () => void; saveLabel: string;
}) {
  return (
    <div className="p-3 border border-slate-300 rounded-lg space-y-3">
      <Input label="Title *" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Project name" />
      <Textarea label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Brief description..." />
      <Input label="Your Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g. Lead Developer" />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack</label>
        <div className="flex gap-2 mb-2">
          <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} placeholder="e.g. React" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (techInput.trim() && !draft.techStack.includes(techInput.trim())) { setDraft({ ...draft, techStack: [...draft.techStack, techInput.trim()] }); } setTechInput(""); } }} />
          <Button type="button" variant="outline" onClick={() => { if (techInput.trim() && !draft.techStack.includes(techInput.trim())) { setDraft({ ...draft, techStack: [...draft.techStack, techInput.trim()] }); } setTechInput(""); }}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {draft.techStack.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
              {t} <button onClick={() => setDraft({ ...draft, techStack: draft.techStack.filter((x) => x !== t) })}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>
      <Input label="URL (optional)" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://..." />
      <div className="flex gap-2">
        <Button type="button" onClick={onSave} size="sm">{saveLabel}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PortfolioEditor({ items, onChange }: { items: PortfolioItem[]; onChange: (items: PortfolioItem[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<PortfolioItem>({ title: "", description: "", role: "", techStack: [], url: "" });
  const [techInput, setTechInput] = useState("");

  const emptyDraft: PortfolioItem = { title: "", description: "", role: "", techStack: [], url: "" };

  function addItem() {
    if (!draft.title.trim()) return;
    onChange([...items, { ...draft, title: draft.title.trim(), description: draft.description.trim(), role: draft.role.trim(), url: draft.url.trim() }]);
    setDraft(emptyDraft);
    setTechInput("");
    setAdding(false);
  }

  function saveEdit() {
    if (editingIndex === null || !draft.title.trim()) return;
    const updated = [...items];
    updated[editingIndex] = { ...draft, title: draft.title.trim(), description: draft.description.trim(), role: draft.role.trim(), url: draft.url.trim() };
    onChange(updated);
    setEditingIndex(null);
    setDraft(emptyDraft);
    setTechInput("");
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft({ ...items[index] });
    setTechInput("");
    setAdding(false);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) { setEditingIndex(null); setDraft(emptyDraft); }
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        editingIndex === i ? (
          <PortfolioItemForm key={i} draft={draft} setDraft={setDraft} techInput={techInput} setTechInput={setTechInput} onSave={saveEdit} onCancel={() => { setEditingIndex(null); setDraft(emptyDraft); setTechInput(""); }} saveLabel="Update Item" />
        ) : (
          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-slate-900">{item.title}</p>
                {item.role && <p className="text-xs text-slate-500">Role: {item.role}</p>}
                {item.description && <p className="text-xs text-slate-600 mt-1">{item.description}</p>}
                {item.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.techStack.map((t) => (
                      <Badge key={t} variant="default">{t}</Badge>
                    ))}
                  </div>
                )}
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Link</a>}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => startEdit(i)} className="text-slate-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )
      ))}

      {adding ? (
        <PortfolioItemForm draft={draft} setDraft={setDraft} techInput={techInput} setTechInput={setTechInput} onSave={addItem} onCancel={() => { setAdding(false); setDraft(emptyDraft); setTechInput(""); }} saveLabel="Save Item" />
      ) : editingIndex === null ? (
        <Button type="button" variant="outline" size="sm" onClick={() => { setAdding(true); setDraft(emptyDraft); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Portfolio Item
        </Button>
      ) : null}
    </div>
  );
}

function PortfolioDisplay({ items }: { items: PortfolioItem[] }) {
  const portfolioItems = items;
  if (!portfolioItems || portfolioItems.length === 0) {
    return <p className="text-sm text-slate-500">No portfolio projects added yet.</p>;
  }
  return (
    <div className="space-y-3">
      {portfolioItems.map((item, i) => (
        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-medium text-sm text-slate-900">{item.title}</p>
          {item.role && <p className="text-xs text-slate-500">Role: {item.role}</p>}
          {item.description && <p className="text-xs text-slate-600 mt-1">{item.description}</p>}
          {item.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.techStack.map((t) => (
                <Badge key={t} variant="default">{t}</Badge>
              ))}
            </div>
          )}
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />View Project</a>}
        </div>
      ))}
    </div>
  );
}

function ResearchEntryForm({ draft, setDraft, onSave, onCancel, saveLabel }: {
  draft: ResearchEntry; setDraft: (d: ResearchEntry) => void;
  onSave: () => void; onCancel: () => void; saveLabel: string;
}) {
  return (
    <div className="p-3 border border-slate-300 rounded-lg space-y-3">
      <Input label="Title *" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Research title" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Year" value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="e.g. 2024" />
        <Input label="Venue / Journal (optional)" value={draft.venue} onChange={(e) => setDraft({ ...draft, venue: e.target.value })} placeholder="e.g. IEEE Conference" />
      </div>
      <Input label="Your Contribution / Role" value={draft.contribution} onChange={(e) => setDraft({ ...draft, contribution: e.target.value })} placeholder="e.g. Data analysis, co-author" />
      <Input label="Link (optional)" value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="https://..." />
      <div className="flex gap-2">
        <Button type="button" onClick={onSave} size="sm">{saveLabel}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function PastResearchEditor({ items, onChange }: { items: ResearchEntry[]; onChange: (items: ResearchEntry[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ResearchEntry>({ title: "", year: "", contribution: "", venue: "", link: "" });

  const emptyDraft: ResearchEntry = { title: "", year: "", contribution: "", venue: "", link: "" };

  function addItem() {
    if (!draft.title.trim()) return;
    onChange([...items, { ...draft, title: draft.title.trim(), contribution: draft.contribution.trim(), venue: draft.venue.trim(), link: draft.link.trim() }]);
    setDraft(emptyDraft);
    setAdding(false);
  }

  function saveEdit() {
    if (editingIndex === null || !draft.title.trim()) return;
    const updated = [...items];
    updated[editingIndex] = { ...draft, title: draft.title.trim(), contribution: draft.contribution.trim(), venue: draft.venue.trim(), link: draft.link.trim() };
    onChange(updated);
    setEditingIndex(null);
    setDraft(emptyDraft);
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft({ ...items[index] });
    setAdding(false);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) { setEditingIndex(null); setDraft(emptyDraft); }
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        editingIndex === i ? (
          <ResearchEntryForm key={i} draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={() => { setEditingIndex(null); setDraft(emptyDraft); }} saveLabel="Update Entry" />
        ) : (
          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-slate-900">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {item.year && <span>{item.year}</span>}
                  {item.venue && <span>· {item.venue}</span>}
                </div>
                {item.contribution && <p className="text-xs text-slate-600 mt-1">Contribution: {item.contribution}</p>}
                {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Link</a>}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => startEdit(i)} className="text-slate-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )
      ))}

      {adding ? (
        <ResearchEntryForm draft={draft} setDraft={setDraft} onSave={addItem} onCancel={() => { setAdding(false); setDraft(emptyDraft); }} saveLabel="Save Entry" />
      ) : editingIndex === null ? (
        <Button type="button" variant="outline" size="sm" onClick={() => { setAdding(true); setDraft(emptyDraft); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Research Entry
        </Button>
      ) : null}
    </div>
  );
}

function PastResearchDisplay({ items }: { items: ResearchEntry[] }) {
  const researchEntries = items;
  if (!researchEntries || researchEntries.length === 0) {
    return <p className="text-sm text-slate-500">No past research added yet.</p>;
  }
  return (
    <div className="space-y-3">
      {researchEntries.map((item, i) => (
        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="font-medium text-sm text-slate-900">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {item.year && <span>{item.year}</span>}
            {item.venue && <span>· {item.venue}</span>}
          </div>
          {item.contribution && <p className="text-xs text-slate-600 mt-1">Contribution: {item.contribution}</p>}
          {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />View</a>}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-800 font-medium">{value || "Not set"}</p>
    </div>
  );
}

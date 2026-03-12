"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseJsonField, formatDate } from "@/lib/utils";
import { getTrustColorClasses } from "@/lib/trust-score";
import {
  ArrowLeft, GraduationCap, FlaskConical, Building2, MapPin,
  Phone, Linkedin, Globe, CheckCircle2, Star, Briefcase,
  MessageSquare, BookOpen, Github, ExternalLink, Shield,
  FolderOpen, Award
} from "lucide-react";

function TrustScoreBadge({ score }: { score: number }) {
  const colors = getTrustColorClasses(score);
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colors.bgLight} border ${colors.border}`}>
      <Shield className={`w-3.5 h-3.5 ${colors.text}`} />
      <span className={`text-sm font-bold ${colors.text}`}>{score}</span>
      <span className={`text-xs ${colors.text} opacity-70`}>Trust</span>
    </div>
  );
}

function TrustBreakdownCard({ score, factors }: { score: number; factors: { label: string; points: number; maxPoints: number }[] }) {
  const colors = getTrustColorClasses(score);
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4" /> Trust Score: {score}/100
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-3xl font-bold ${colors.text}`}>{score}</div>
          <div className="flex-1">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${colors.bg} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-1">out of 100</p>
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

export default function PublicProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false); });
  }, [id]);

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

  if (!user || user.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">User Not Found</h1>
      </div>
    );
  }

  const profile = user.profile as Record<string, unknown> | null;
  const role = user.role as string;
  const roleIcon = role === "student" ? GraduationCap : role === "researcher" ? FlaskConical : Building2;
  const RoleIcon = roleIcon;
  const trustScore = (user.trustScore as number) || 0;
  const trustBreakdown = user.trustBreakdown as { label: string; points: number; maxPoints: number }[] | undefined;
  const stats = user._stats as Record<string, number> | undefined;
  const counts = user._count as Record<string, number>;
  const certificates = (user.certificates || []) as { id: string; projectTitle: string; companyName: string; verificationUrl: string; createdAt: string }[];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/talent" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Talent
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-emerald-700">
                {(user.name as string).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{user.name as string}</h1>
                {user.verified ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : null}
                <TrustScoreBadge score={trustScore} />
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="info" className="flex items-center gap-1 capitalize">
                  <RoleIcon className="w-3 h-3" /> {role}
                </Badge>
                {profile?.verificationStatus === "verified" ? <Badge variant="success">Verified</Badge> : null}
                {role === "student" && profile?.availableForInternship ? <Badge variant="success">Available for Internship</Badge> : null}
                {role === "researcher" && profile?.availableForConsulting ? <Badge variant="success">Available for Consulting</Badge> : null}
                {(() => {
                  const badge = profile?.standingBadge ? String(profile.standingBadge) : null;
                  if (role !== "industry" || !badge || badge === "green") return null;
                  return (
                    <Badge className={
                      badge === "banned" ? "bg-black text-white" :
                      badge === "red" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }>
                      {"Standing: " + badge}
                    </Badge>
                  );
                })()}
              </div>

              {(role === "industry" && profile?.companyName) ? (
                <div className="mb-1">
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {profile.companyName as string}
                    {profile.companySector ? ` · ${profile.companySector}` : ""}
                    {profile.yearEstablished ? ` · Est. ${profile.yearEstablished}` : ""}
                  </p>
                  {profile.verificationStatus === "verified" && profile.tradeLicenseNumber ? (
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">Trade License Verified</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {profile?.university ? (
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {profile.university as string}
                  {profile.department ? ` — ${profile.department}` : ""}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                {profile?.location ? (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location as string}</span>
                ) : null}
                {profile?.phone ? (
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{profile.phone as string}</span>
                ) : null}
                {profile?.linkedinUrl ? (
                  <a href={profile.linkedinUrl as string} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Linkedin className="w-4 h-4" />LinkedIn
                  </a>
                ) : null}
                {profile?.githubUrl ? (
                  <a href={profile.githubUrl as string} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-800 hover:underline">
                    <Github className="w-4 h-4" />GitHub
                  </a>
                ) : null}
                {profile?.portfolioUrl ? (
                  <a href={profile.portfolioUrl as string} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4" />Portfolio
                  </a>
                ) : null}
                {profile?.website ? (
                  <a href={profile.website as string} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="w-4 h-4" />Website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {trustBreakdown && <TrustBreakdownCard score={trustScore} factors={trustBreakdown} />}

      {profile?.bio ? (
        <Card className="mb-6">
          <CardHeader><h2 className="text-base font-semibold">About</h2></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{profile.bio as string}</p>
          </CardContent>
        </Card>
      ) : null}

      {parseJsonField(profile?.skills as string).length > 0 && (
        <Card className="mb-6">
          <CardHeader><h2 className="text-base font-semibold">Skills</h2></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {parseJsonField(profile?.skills as string).map((skill) => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {role === "student" && (
        <Card className="mb-6">
          <CardHeader><h2 className="text-base font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {profile?.gpa ? <div><p className="text-slate-500 text-xs">GPA</p><p className="font-medium flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{String(profile.gpa)}</p></div> : null}
              {profile?.graduationYear ? <div><p className="text-slate-500 text-xs">Graduation Year</p><p className="font-medium">{String(profile.graduationYear)}</p></div> : null}
            </div>
          </CardContent>
        </Card>
      )}

      {role === "student" && (() => {
        const portfolioItems = parseJsonField<{ title: string; description: string; role: string; techStack: string[]; url: string }>(profile?.portfolioItems as string);
        return portfolioItems.length > 0 ? (
          <Card className="mb-6">
            <CardHeader><h2 className="text-base font-semibold flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Portfolio Projects</h2></CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : null;
      })()}

      {role === "student" && (() => {
        const researchEntries = parseJsonField<{ title: string; year: string; contribution: string; venue: string; link: string }>(profile?.pastResearch as string);
        return researchEntries.length > 0 ? (
          <Card className="mb-6">
            <CardHeader><h2 className="text-base font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Past Research</h2></CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : null;
      })()}

      {role === "researcher" && (
        <Card className="mb-6">
          <CardHeader><h2 className="text-base font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" /> Research Metrics</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {profile?.publicationCount !== null && profile?.publicationCount !== undefined && (
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-700">{String(profile.publicationCount)}</p>
                  <p className="text-xs text-blue-500">Publications</p>
                </div>
              )}
              {profile?.hIndex !== null && profile?.hIndex !== undefined && (
                <div className="p-3 rounded-lg bg-purple-50 text-center">
                  <p className="text-2xl font-bold text-purple-700">{String(profile.hIndex)}</p>
                  <p className="text-xs text-purple-500">h-Index</p>
                </div>
              )}
              {profile?.citationCount !== null && profile?.citationCount !== undefined && (
                <div className="p-3 rounded-lg bg-amber-50 text-center">
                  <p className="text-2xl font-bold text-amber-700">{String(profile.citationCount)}</p>
                  <p className="text-xs text-amber-500">Citations</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              {profile?.orcidId ? <span className="text-slate-600">ORCID: {profile?.orcidId as string}</span> : null}
              {profile?.googleScholarUrl ? <a href={profile?.googleScholarUrl as string} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Scholar</a> : null}
              {profile?.researchGateUrl ? <a href={profile?.researchGateUrl as string} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">ResearchGate</a> : null}
            </div>
            {parseJsonField(profile?.publications as string).length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium mb-2">Publications</p>
                <ul className="space-y-1">
                  {parseJsonField(profile?.publications as string).map((pub, i) => (
                    <li key={i} className="text-sm text-slate-700 bg-slate-50 rounded px-3 py-1.5">{pub}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {certificates.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> Certificates ({certificates.length})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <Link key={cert.id} href={cert.verificationUrl}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer">
                    <Award className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{cert.projectTitle}</p>
                      <p className="text-xs text-slate-600">{cert.companyName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="success" className="text-xs">Verified</Badge>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(cert.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 flex-wrap">
        {role === "student" && (
          <>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{counts?.submissions || 0} submissions</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4" />{stats?.shortlisted || 0} shortlisted</span>
          </>
        )}
        {role === "researcher" && (
          <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{stats?.engagements || 0} problems consulted on</span>
        )}
        {role === "industry" && (
          <>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{counts?.problems || 0} problems posted</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{stats?.activeEngagements || stats?.engagements || 0} active engagements</span>
          </>
        )}
        <span>Joined {formatDate(user.createdAt as string)}</span>
      </div>

      {session && session.user.id !== id && (
        <Link href={`/messages?to=${id}`}>
          <Button><MessageSquare className="w-4 h-4 mr-2" /> Send Message</Button>
        </Link>
      )}
    </div>
  );
}

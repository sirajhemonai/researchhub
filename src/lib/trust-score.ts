interface TrustScoreInput {
  role: string;
  verified: boolean;
  profile: {
    bio?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
    portfolioItems?: string | null;
    pastResearch?: string | null;
    skills?: string | null;
    university?: string | null;
    department?: string | null;
    studentId?: string | null;
    gpa?: number | null;
    graduationYear?: number | null;
    orcidId?: string | null;
    googleScholarUrl?: string | null;
    researchGateUrl?: string | null;
    hIndex?: number | null;
    publicationCount?: number | null;
    citationCount?: number | null;
    companyName?: string | null;
    companySector?: string | null;
    companySize?: string | null;
    tradeLicenseNumber?: string | null;
    website?: string | null;
    yearEstablished?: number | null;
    verificationStatus?: string | null;
  } | null;
  stats: {
    submissions: number;
    shortlisted: number;
    problems: number;
    engagements: number;
  };
}

export interface TrustBreakdown {
  score: number;
  factors: { label: string; points: number; maxPoints: number }[];
}

export function calculateTrustScore(input: TrustScoreInput): TrustBreakdown {
  const { role, verified, profile, stats } = input;

  if (role === "student") return calculateStudentScore(verified, profile, stats);
  if (role === "researcher") return calculateResearcherScore(verified, profile, stats);
  if (role === "industry") return calculateIndustryScore(verified, profile, stats);

  return { score: 0, factors: [] };
}

function calculateStudentScore(
  verified: boolean,
  profile: TrustScoreInput["profile"],
  stats: TrustScoreInput["stats"]
): TrustBreakdown {
  const factors: TrustBreakdown["factors"] = [];

  factors.push({ label: "Verified Email", points: verified ? 20 : 0, maxPoints: 20 });

  let completeness = 0;
  if (profile?.bio) completeness += 5;
  if (profile?.skills && JSON.parse(profile.skills).length > 0) completeness += 5;
  if (profile?.university) completeness += 5;
  if (profile?.department) completeness += 3;
  if (profile?.gpa) completeness += 3;
  if (profile?.graduationYear) completeness += 3;
  if (profile?.location) completeness += 3;
  if (profile?.phone) completeness += 3;
  factors.push({ label: "Profile Completeness", points: completeness, maxPoints: 30 });

  const githubLinked = profile?.githubUrl ? 5 : 0;
  factors.push({ label: "GitHub Linked", points: githubLinked, maxPoints: 5 });

  let portfolioCount = 0;
  try { portfolioCount = profile?.portfolioItems ? JSON.parse(profile.portfolioItems).length : 0; } catch { portfolioCount = 0; }
  const portfolioPoints = portfolioCount > 0 ? 5 : 0;
  factors.push({ label: "Portfolio Projects", points: portfolioPoints, maxPoints: 5 });

  let researchCount = 0;
  try { researchCount = profile?.pastResearch ? JSON.parse(profile.pastResearch).length : 0; } catch { researchCount = 0; }
  const researchPoints = researchCount > 0 ? 5 : 0;
  factors.push({ label: "Past Research", points: researchPoints, maxPoints: 5 });

  const subPoints = Math.min(stats.submissions * 4, 15);
  factors.push({ label: "Submissions Count", points: subPoints, maxPoints: 15 });

  const ratio = stats.submissions > 0 ? stats.shortlisted / stats.submissions : 0;
  const ratioPoints = Math.round(ratio * 20);
  factors.push({ label: "Shortlisted/Accepted Ratio", points: ratioPoints, maxPoints: 20 });

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  return { score, factors };
}

function calculateResearcherScore(
  verified: boolean,
  profile: TrustScoreInput["profile"],
  stats: TrustScoreInput["stats"]
): TrustBreakdown {
  const factors: TrustBreakdown["factors"] = [];

  factors.push({ label: "Verified Account", points: verified ? 20 : 0, maxPoints: 20 });

  const orcidLinked = profile?.orcidId ? 15 : 0;
  factors.push({ label: "ORCID Linked", points: orcidLinked, maxPoints: 15 });

  const scholarLinked = profile?.googleScholarUrl ? 10 : 0;
  factors.push({ label: "Google Scholar Linked", points: scholarLinked, maxPoints: 10 });

  const rgLinked = profile?.researchGateUrl ? 5 : 0;
  factors.push({ label: "ResearchGate Linked", points: rgLinked, maxPoints: 5 });

  const hIndexFilled = profile?.hIndex ? 10 : 0;
  factors.push({ label: "h-Index Filled", points: hIndexFilled, maxPoints: 10 });

  const pubCount = profile?.publicationCount || 0;
  const pubPoints = Math.min(pubCount * 2, 20);
  factors.push({ label: "Publications Count", points: pubPoints, maxPoints: 20 });

  const activityPoints = Math.min(stats.engagements * 5, 20);
  factors.push({ label: "Activity", points: activityPoints, maxPoints: 20 });

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  return { score, factors };
}

function calculateIndustryScore(
  verified: boolean,
  profile: TrustScoreInput["profile"],
  stats: TrustScoreInput["stats"]
): TrustBreakdown {
  const factors: TrustBreakdown["factors"] = [];

  factors.push({ label: "Verified Account", points: verified ? 30 : 0, maxPoints: 30 });

  const licenseVerified = profile?.verificationStatus === "verified";
  factors.push({ label: "Trade License Verified", points: licenseVerified ? 20 : 0, maxPoints: 20 });

  const websiteLinked = profile?.website ? 10 : 0;
  factors.push({ label: "Website Linked", points: websiteLinked, maxPoints: 10 });

  const probPoints = Math.min(stats.problems * 4, 20);
  factors.push({ label: "Problems Posted", points: probPoints, maxPoints: 20 });

  let completeness = 0;
  if (profile?.companyName) completeness += 4;
  if (profile?.companySector) completeness += 4;
  if (profile?.companySize) completeness += 3;
  if (profile?.bio) completeness += 3;
  if (profile?.location) completeness += 3;
  if (profile?.yearEstablished) completeness += 3;
  factors.push({ label: "Company Profile", points: completeness, maxPoints: 20 });

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  return { score, factors };
}

export function getProfileCompleteness(role: string, profile: Record<string, unknown> | null): number {
  if (!profile) return 0;

  const commonFields = ["bio", "phone", "location", "linkedinUrl", "skills"];
  const studentFields = [...commonFields, "university", "department", "studentId", "gpa", "graduationYear", "githubUrl"];
  const researcherFields = [...commonFields, "university", "department", "orcidId", "googleScholarUrl", "publicationCount"];
  const industryFields = [...commonFields, "companyName", "companySector", "companySize", "tradeLicenseNumber", "website", "yearEstablished"];

  let fields: string[];
  if (role === "student") fields = studentFields;
  else if (role === "researcher") fields = researcherFields;
  else if (role === "industry") fields = industryFields;
  else fields = commonFields;

  let filled = 0;
  for (const field of fields) {
    const val = profile[field];
    if (val === null || val === undefined || val === "" || val === "[]") continue;
    filled++;
  }

  return Math.round((filled / fields.length) * 100);
}

export function getProfileCompletenessFromForm(role: string, form: Record<string, unknown>): number {
  const commonFields = ["bio", "phone", "location", "linkedinUrl", "skills"];
  const studentFields = [...commonFields, "university", "department", "studentId", "gpa", "graduationYear", "githubUrl"];
  const researcherFields = [...commonFields, "university", "department", "orcidId", "googleScholarUrl", "publicationCount"];
  const industryFields = [...commonFields, "companyName", "companySector", "companySize", "tradeLicenseNumber", "website", "yearEstablished"];

  let fields: string[];
  if (role === "student") fields = studentFields;
  else if (role === "researcher") fields = researcherFields;
  else if (role === "industry") fields = industryFields;
  else fields = commonFields;

  let filled = 0;
  for (const field of fields) {
    const val = form[field];
    if (val === null || val === undefined || val === "" || val === "[]") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (val === 0 || val === "0") continue;
    filled++;
  }

  return Math.round((filled / fields.length) * 100);
}

export function getTrustColorClasses(score: number): { text: string; bg: string; border: string; bgLight: string } {
  if (score >= 70) return {
    text: "text-emerald-600",
    bg: "bg-emerald-500",
    border: "border-emerald-200",
    bgLight: "bg-emerald-50",
  };
  if (score >= 40) return {
    text: "text-amber-600",
    bg: "bg-amber-500",
    border: "border-amber-200",
    bgLight: "bg-amber-50",
  };
  return {
    text: "text-red-600",
    bg: "bg-red-500",
    border: "border-red-200",
    bgLight: "bg-red-50",
  };
}

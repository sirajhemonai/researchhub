import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Building2, Landmark, FlaskConical,
  ArrowRight, CheckCircle2, Users, FileText, Briefcase,
  Shield, TrendingUp, Globe
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Bangladesh Research Collaboration Initiative
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
              Where Industry Problems Become{" "}
              <span className="text-emerald-600">Research Opportunities</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              ResearchBridge BD connects students, researchers, companies, and government bodies
              into a single ecosystem — turning real-world challenges into verified solutions
              and career breakthroughs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-base px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/problems">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Browse Problems
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free for students and researchers. Always.
            </p>
          </div>
        </div>
      </section>

      {/* Stakeholder value cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">
              Built for Every Stakeholder
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Immediate, tangible value — independent of whether the other side shows up first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StakeholderCard
              icon={GraduationCap}
              title="Students"
              color="emerald"
              items={[
                "Solve real industry problems",
                "Verified portfolio & certificates",
                "Get headhunted by companies",
                "Find thesis teammates by skill",
              ]}
            />
            <StakeholderCard
              icon={FlaskConical}
              title="Researchers"
              color="blue"
              items={[
                "Industry data for applied research",
                "Co-author with industry partners",
                "Grant discovery engine",
                "Publication impact tracking",
              ]}
            />
            <StakeholderCard
              icon={Building2}
              title="Industry"
              color="violet"
              items={[
                "Post problems, get diverse solutions",
                "Pre-screened talent pipeline",
                "Zero upfront cost for solutions",
                "IP protection built in",
              ]}
            />
            <StakeholderCard
              icon={Landmark}
              title="Government"
              color="amber"
              items={[
                "Live innovation dashboard",
                "Skill gap maps by sector",
                "Policy-ready data reports",
                "Post national challenges",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-3 text-lg text-slate-600">
              Three simple steps to real collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              title="Industry Posts a Problem"
              description="Companies describe a real challenge they face — with optional bounty and IP protection."
            />
            <StepCard
              number={2}
              title="Students & Researchers Solve"
              description="Verified students and researchers submit diverse solution approaches with full portfolio credit."
            />
            <StepCard
              number={3}
              title="Everyone Wins"
              description="Industry gets solutions. Students get experience, certificates, and job leads. Researchers get data and publications."
            />
          </div>
        </div>
      </section>

      {/* Platform stats / Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Platform Features</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={FileText} title="Problem Marketplace" description="Tiered visibility (Public / Private / NDA), solution submissions, and automated IP clauses." />
            <FeatureCard icon={Shield} title="Verified Trust System" description="University email verification, trade license checks, outcome ratings, and fraud reporting." />
            <FeatureCard icon={Users} title="Talent Discovery" description="Filter by skill, university, GPA, project history. Save candidates. Send direct invites." />
            <FeatureCard icon={Briefcase} title="Jobs & Internships" description="Industry posts listings. Students browse and apply. The easiest on-ramp for both sides." />
            <FeatureCard icon={TrendingUp} title="Research Collaboration" description="Find thesis partners, co-researchers, and co-authors. Post open collaboration calls." />
            <FeatureCard icon={Landmark} title="Government Dashboard" description="Innovation index, skill gap maps, and policy-ready reports — powered by real platform data." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Bridge the Gap?
          </h2>
          <p className="mt-4 text-lg text-emerald-100">
            Join Bangladesh&apos;s first platform connecting industry problems
            with academic talent. Free for students and researchers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-base px-8"
              >
                Create Free Account
              </Button>
            </Link>
            <Link href="/register?role=industry">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-emerald-700 text-base px-8"
              >
                Post a Problem
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StakeholderCard({
  icon: Icon,
  title,
  color,
  items,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  items: string[];
}) {
  const colorMap: Record<string, { bg: string; icon: string; check: string }> = {
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", check: "text-emerald-500" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", check: "text-blue-500" },
    violet: { bg: "bg-violet-50", icon: "text-violet-600", check: "text-violet-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", check: "text-amber-500" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${c.bg} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.check}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all">
      <Icon className="w-8 h-8 text-emerald-600 mb-3" />
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

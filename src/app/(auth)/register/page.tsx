"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, FlaskConical, Building2, Landmark, UserPlus } from "lucide-react";

const roles = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Solve problems, build portfolio, get hired" },
  { value: "researcher", label: "Researcher / Faculty", icon: FlaskConical, desc: "Applied research, co-author, grants" },
  { value: "industry", label: "Industry / Company", icon: Building2, desc: "Post problems, find talent, get solutions" },
  { value: "government", label: "Government Body", icon: Landmark, desc: "Data dashboards, post national challenges" },
];

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse h-96 w-96 bg-slate-200 rounded-xl" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select your role");
      return;
    }

    if (role === "student" && !email.endsWith(".edu.bd")) {
      setError("Students must register with a .edu.bd university email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join ResearchBridge BD</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create your free account and start collaborating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all text-center ${
                    role === r.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <r.icon className={`w-6 h-6 mb-1.5 ${role === r.value ? "text-emerald-600" : "text-slate-400"}`} />
                  <span className={`text-sm font-medium ${role === r.value ? "text-emerald-700" : "text-slate-700"}`}>
                    {r.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            id="name"
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder={role === "student" ? "you@diu.edu.bd" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {role === "student" && (
              <p className="mt-1 text-xs text-amber-600">
                Students must use a .edu.bd university email for verification
              </p>
            )}
          </div>

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

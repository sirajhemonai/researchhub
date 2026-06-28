"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu, X, ChevronDown, User, LogOut, LayoutDashboard,
  Briefcase, MessageSquare, Search, FileText, Shield, Handshake, Database
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [engagementNotify, setEngagementNotify] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/engagements")
      .then(r => r.json())
      .then(data => {
        const engs = data.engagements || [];
        const hasAction = engs.some((e: { status: string }) =>
          ["negotiating", "pending_deposit"].includes(e.status)
        );
        setEngagementNotify(hasAction);
      })
      .catch(() => {});
  }, [session]);

  const navLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, notify: false },
        { href: "/problems", label: "Problems", icon: FileText, notify: false },
        { href: "/engagements", label: "Engagements", icon: Handshake, notify: engagementNotify },
        { href: "/talent", label: "Talent", icon: Search, notify: false },
        { href: "/jobs", label: "Jobs", icon: Briefcase, notify: false },
        { href: "/messages",   label: "Messages",   icon: MessageSquare, notify: false },
        { href: "/data-rooms", label: "Data Rooms", icon: Database,      notify: false },
      ]
    : [];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
            <span className="font-bold text-lg text-slate-900">
              Research<span className="text-emerald-600">Bridge</span>
            </span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {link.notify && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              ))}
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-medium text-sm">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {session.user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                      <p className="text-xs text-slate-500">{session.user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 capitalize">
                        {session.user.role}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {session && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && session && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Scale,
  ArrowRight,
  CalendarCheck,
  FolderOpen,
  BookOpen,
  Bell,
  Shield,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!isMounted) return;
        setIsLoggedIn(res.ok);
      } catch {
        if (!isMounted) return;
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const ctaHref = isLoggedIn ? "/dashboard" : "/register";
  const ctaLabel = isLoggedIn ? "Dashboard" : "Create account";

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* ---- glow ---- */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#103168]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#027f7e]/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[50%] w-[50%] h-[50%] rounded-full bg-[#027f7e]/5 blur-[100px] pointer-events-none"></div>

      {/* ---- nav ---- */}
      <nav className="fixed top-0 inset-x-0 z-20 bg-[#000203]/40 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center shadow-md">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Law<span className="text-[#027f7e]">Portal</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href={ctaHref}
              className="px-5 py-2 text-sm font-medium bg-[#027f7e] text-white rounded-lg hover:bg-[#026a69] transition-all shadow-md shadow-[#027f7e]/20"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- hero sec ---- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#027f7e]/10 border border-[#027f7e]/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#027f7e]"></span>
              <span className="text-xs font-mono text-[#027f7e] tracking-wide">
                LEGAL PRACTICE MANAGEMENT
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Manage your law practice with{" "}
              <span className="bg-gradient-to-r from-[#027f7e] to-[#33adad] bg-clip-text text-transparent">
                precision
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg">
              Case management, hearing calendar, law books library, and
              reminders — built specifically for Pakistani lawyers.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={ctaHref}
                className="group px-6 py-3 bg-[#027f7e] text-white font-semibold rounded-lg hover:bg-[#026a69] transition-all shadow-lg shadow-[#027f7e]/25 flex items-center gap-2 "
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="group px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-all flex items-center gap-2  "
              >
                See features
                <ArrowRight className="w-4 h-4  rotate-90 group-hover:translate-y-1 transition-transform " />
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-2">
                {[
                  "/api/placeholder/32/32",
                  "/api/placeholder/32/32",
                  "/api/placeholder/32/32",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-black bg-gray-700"
                  ></div>
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Trusted by <span className="text-white font-semibold">50+</span>{" "}
                law firms across Pakistan
              </div>
            </div>
          </div>

          {/* right content */}
          <div className="relative lg:ml-auto">
            <div className="relative">
              {/* decorative line */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-2 border-r-2 border-[#027f7e]/30 rounded-tr-3xl hidden lg:block"></div>

              {/* Card stack  */}
              <div className="relative z-10 bg-[#11161F] border border-gray-800 rounded-2xl p-6 shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#027f7e]/20 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-[#027f7e]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Today's Hearings</p>
                    <p className="text-xs text-gray-500">3 matters scheduled</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: "State v. Rahman",
                      time: "10:30 AM",
                      court: "Session Court",
                    },
                    {
                      title: "Khan Family Petition",
                      time: "11:45 AM",
                      court: "Family Court",
                    },
                    {
                      title: "Bail Application #234",
                      time: "2:00 PM",
                      court: "High Court",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-gray-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">{item.court}</p>
                      </div>
                      <span className="text-xs text-[#027f7e] font-mono">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating smaller card */}
              <div className="absolute -bottom-4 -left-4 z-0 bg-[#0D1220] border border-gray-800 rounded-xl p-4 w-48 shadow-xl transform -rotate-3">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-4 h-4 text-[#103168]" />
                  <span className="text-xs font-semibold text-white">
                    Active Cases
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-[10px] text-gray-500">+5 this month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- feature sections ---- */}
      <section
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-6 py-24"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#103168]/20 border border-[#103168]/30 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#103168]"></span>
            <span className="text-xs font-mono text-[#103168] tracking-wide">
              WHAT YOU GET
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            Built for modern legal practice
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Everything you need to manage cases, track hearings, and stay
            organized.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FolderOpen,
              title: "Case Management",
              desc: "Full CRUD with case details, provisions, counsel info, FIR number, and hearing dates.",
              color: "#027f7e",
            },
            {
              icon: CalendarCheck,
              title: "Hearing Calendar",
              desc: "Monthly calendar view with hearing/proceeding dates, day-click modal, and upcoming events.",
              color: "#103168",
            },
            {
              icon: BookOpen,
              title: "Law Books Library",
              desc: "Upload and manage PDF law books with inline viewer and search.",
              color: "#027f7e",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Priority-based reminders with upcoming, overdue, and completed filters.",
              color: "#103168",
            },
            {
              icon: Users,
              title: "Client Management",
              desc: "Store client details, communication history, and case associations.",
              color: "#027f7e",
            },
            {
              icon: Shield,
              title: "Secure & Role-based",
              desc: "JWT authentication with httpOnly cookies and middleware-protected routes.",
              color: "#103168",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group bg-[#11161F]/50 border border-gray-800 rounded-2xl p-6 hover:border-[#027f7e]/30 hover:bg-[#11161F] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#027f7e]/20 to-[#103168]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-[#027f7e]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- stats banner ---- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-[#103168]/20 via-[#027f7e]/10 to-transparent border border-gray-800 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-sm text-gray-400 mt-1">Cases Managed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">1,200+</p>
              <p className="text-sm text-gray-400 mt-1">Hearings Tracked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">50+</p>
              <p className="text-sm text-gray-400 mt-1">Law Firms</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0F1A] to-[#05080F] border border-gray-800 p-10 md:p-16 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#027f7e]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#103168]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to streamline your practice?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Join dozens of law firms already using LawPortal to manage cases
              and hearings efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={ctaHref}
                className="px-8 py-3 bg-[#027f7e] text-white font-semibold rounded-lg hover:bg-[#026a69] transition-all shadow-lg shadow-[#027f7e]/25 flex items-center gap-2"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get started"}{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-white/5 transition-all"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- footer ---- */}
      <footer className="relative z-10 border-t border-gray-800/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2  justify-center">
            <Scale className="w-5 h-5 text-[#027f7e]" />
            <span className="text-sm text-gray-500 ">
              © 2026 LawPortal — Legal Practice Management
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

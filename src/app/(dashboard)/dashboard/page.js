"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/utils/api";
import { formatDate, relativeDate } from "@/utils/helpers";
import { StatCard, StatusBadge, PageLoader, EmptyState } from "@/components/ui";
import WeeklyOutlook from "@/components/dashboard/Weeklyoutlook";
import LegalUpdatesTicker from "@/components/dashboard/LegalUpdatesTicker";
import { useRouter } from "next/navigation";

import {
  FolderOpen,
  CheckCircle,
  Clock,
  CalendarCheck,
  CalendarClock,
  ArrowRight,
  Plus,
  Scale,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/cases/stats")
      .then((d) => setStats(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const hour = new Date().getHours();
  let greeting = "";
  if (hour >= 0 && hour < 5) {
    greeting = "Good Night";
  } else if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Night";
  }

  return (
    <div className="min-h-screen bg-[#eef5f3] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Section */}
        <div className="pt-8 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-display">
              {greeting}, {user?.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Here&apos;s your practice overview •{" "}
              <span className="text-teal-600">
                {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
              </span>
            </p>
          </div>

          <Link
            href="/cases/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0f766e] hover:bg-[#0d9488] text-white font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            New Case
          </Link>
        </div>

        {/* Stats Grid - Modern Card Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard
            label="Total Cases"
            value={stats?.total ?? 0}
            icon={Scale}
            color="blue"
            sub="All time"
          />
          <StatCard
            label="Active Cases"
            value={stats?.active ?? 0}
            icon={FolderOpen}
            color="emerald"
            sub="Currently active"
          />
          <Link href="/calendar?date=today" className="group block">
            <div className="h-full bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#0f766e] rounded-3xl p-5 shadow-lg shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-900/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden">
              {/* Decorative corner glow */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 bg-white/15 text-white rounded-xl group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-bold text-white">
                  {stats?.todayCases ?? 0}
                </p>
                <p className="text-xs text-teal-50 font-medium mt-1">
                  Today's Hearings
                </p>
                <p className="text-[10px] text-teal-100/70 mt-0.5">
                  Scheduled today
                </p>
              </div>
            </div>
          </Link>
          <StatCard
            label="Tomorrow"
            value={stats?.tomorrowCases ?? 0}
            icon={CalendarClock}
            color="purple"
            sub="Hearings & proceedings"
          />
          <StatCard
            label="Closed Cases"
            value={stats?.closed ?? 0}
            icon={CheckCircle}
            color="slate"
            sub="Disposed / closed"
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Add Case",
              href: "/cases/new",
              icon: FolderOpen,
              color: "text-teal-600 bg-teal-50 border border-teal-100",
            },
            {
              label: "Calendar",
              href: "/calendar",
              icon: CalendarCheck,
              color: "text-blue-600 bg-blue-50 border border-blue-100",
            },
            {
              label: "Law Books",
              href: "/books",
              icon: Scale,
              color: "text-purple-600 bg-purple-50 border border-purple-100",
            },
            {
              label: "Reminders",
              href: "/reminders",
              icon: Clock,
              color: "text-orange-600 bg-orange-50 border border-orange-100",
            },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm
                         hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Legal Updates Ticker - Styled Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-1">
          <LegalUpdatesTicker />
        </div>

        {/* Recent Cases Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
              <h3 className="font-bold text-slate-800 text-lg">Recent Cases</h3>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {stats?.recentCases?.length ?? 0}
              </span>
            </div>
            <Link
              href="/cases"
              className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 p-0">
            {!stats?.recentCases?.length ? (
              <EmptyState
                icon={FolderOpen}
                title="No cases yet"
                description="Add your first case to get started."
                action={
                  <Link
                    href="/cases/new"
                    className="btn-primary mt-4 px-6 py-2.5 rounded-full bg-[#0f766e] text-white font-semibold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Case
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Case Title</th>
                      <th className="px-6 py-4 font-semibold">Court</th>
                      <th className="px-6 py-4 font-semibold hidden sm:table-cell">
                        Client
                      </th>
                      <th className="px-6 py-4 font-semibold">Next Hearing</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentCases.map((c) => (
                      <tr
                        key={c._id}
                        onClick={() => router.push(`/cases/${c._id}`)}
                        className="cursor-pointer hover:bg-teal-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                            {c.caseTitle}
                          </div>
                          {c.caseNumber && (
                            <div className="text-xs text-slate-400 font-mono mt-1">
                              {c.caseNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                          {c.courtType}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">
                          {c.clientName || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {c.nextHearingDate ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-700">
                                {formatDate(c.nextHearingDate)}
                              </span>
                              <span className="text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full w-fit mt-1">
                                {relativeDate(c.nextHearingDate)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Outlook Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-1">
          <WeeklyOutlook />
        </div>

        {/* Alert Banner */}
        {stats?.todayCases > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 flex items-start gap-4 shadow-sm">
            <div className="mt-0.5 p-2 bg-amber-400 rounded-full text-white">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                {stats.todayCases} hearing{stats.todayCases !== 1 ? "s" : ""}{" "}
                scheduled today
              </h4>
              <p className="text-amber-700/80 text-sm mt-1">
                Don't forget to check your schedule.{" "}
                <Link
                  href="/calendar"
                  className="underline font-semibold text-amber-800 hover:text-amber-900 decoration-amber-400 underline-offset-2"
                >
                  Open calendar →
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

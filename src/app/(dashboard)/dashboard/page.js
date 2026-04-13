"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/utils/api";
import { formatDate, relativeDate } from "@/utils/helpers";
import { StatCard, StatusBadge, PageLoader, EmptyState } from "@/components/ui";
import WeeklyOutlook from "@/components/dashboard/Weeklyoutlook";
import IntelligenceFeed from "@/components/dashboard/IntelligenceFeed";
import LegalUpdatesTicker from "@/components/dashboard/LegalUpdatesTicker";

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
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">
            {greeting}, {user?.name}, to your dashboard
            
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s your practice overview for today,{" "}
            {formatDate(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <Link href="/cases/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Case
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
          color="green"
          sub="Currently active"
        />
        <StatCard
          label="Today's Hearings"
          value={stats?.todayCases ?? 0}
          icon={CalendarCheck}
          color="amber"
          sub="Scheduled today"
        />
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Add Case",
            href: "/cases/new",
            icon: FolderOpen,
            color: "text-primary-600 bg-primary-50",
          },
          {
            label: "Calendar",
            href: "/calendar",
            icon: CalendarCheck,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Law Books",
            href: "/books",
            icon: Scale,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Reminders",
            href: "/reminders",
            icon: Clock,
            color: "text-purple-600 bg-purple-50",
          },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="card-hover p-4 flex items-center gap-3 group"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <LegalUpdatesTicker />

      {/* Recent Cases Section - Full Width */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 font-display">
            Recent Cases
          </h3>
          <Link href="/cases" className="btn-ghost text-xs gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats?.recentCases?.length ? (
          <EmptyState
            icon={FolderOpen}
            title="No cases yet"
            description="Add your first case to get started."
            action={
              <Link href="/cases/new" className="btn-primary mt-2">
                <Plus className="w-4 h-4" /> Add Case
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Court</th>
                  <th>Client</th>
                  <th>Next Hearing</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCases.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => (window.location.href = `/cases/${c._id}`)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="font-semibold text-slate-800 text-sm">
                        {c.caseTitle}
                      </div>
                      {c.caseNumber && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {c.caseNumber}
                        </div>
                      )}
                    </td>
                    <td className="text-slate-600">{c.courtType}</td>
                    <td className="text-slate-600">{c.clientName || "—"}</td>
                    <td>
                      {c.nextHearingDate ? (
                        <div>
                          <div className="text-sm text-slate-700">
                            {formatDate(c.nextHearingDate)}
                          </div>
                          <div className="text-xs text-slate-400">
                            {relativeDate(c.nextHearingDate)}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Outlook Section - Full Width Below Recent Cases */}
      <div className="w-full">
        <WeeklyOutlook />
      </div>

      <div className="bg-white w-full rounded-2xl border border-gray-200 p-4">
        <IntelligenceFeed />
      </div>

      {/* Today's schedule banner */}
      {stats?.todayCases > 0 && (
        <div className="card p-5 border-l-4 border-l-amber-400 bg-amber-50/30">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">
              {stats.todayCases} hearing{stats.todayCases !== 1 ? "s" : ""}{" "}
              scheduled today
            </span>
          </div>
          <p className="text-sm text-amber-700">
            <Link
              href="/calendar"
              className="underline underline-offset-2 hover:text-amber-900"
            >
              Open calendar
            </Link>{" "}
            to view today&apos;s full schedule.
          </p>
        </div>
      )}
    </div>
  );
}

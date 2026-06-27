"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Menu,
  X,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { api } from "@/utils/api";
import UserAvatar from "@/components/ui/UserAvatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cases", icon: FolderOpen, label: "Cases" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/books", icon: BookOpen, label: "Law Books" },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/cases": "Case Management",
  "/cases/new": "New Case",
  "/calendar": "Calendar",
  "/books": "Law Books",
  "/reminders": "Reminders",
  "/intelligencefeed": "Intelligence Feed",
  "/settings": "Settings",
};

export default function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  const title =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname.startsWith(path + "/"),
    )?.[1] || "LawPortal";

  const fetchReminderCounts = useCallback(async () => {
    try {
      const [upcomingData, overdueData] = await Promise.all([
        api.get("/api/reminders?filter=upcoming"),
        api.get("/api/reminders?filter=overdue"),
      ]);
      const upcoming = upcomingData?.data?.reminders || [];
      const overdue = overdueData?.data?.reminders || [];
      setUpcomingCount(upcoming.length);
      setOverdueCount(overdue.length);
    } catch {
      setUpcomingCount(0);
      setOverdueCount(0);
    }
  }, []);

  useEffect(() => {
    fetchReminderCounts();
    const interval = setInterval(fetchReminderCounts, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchReminderCounts]);

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 sticky top-3 mx-3 mt-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-full text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 active:scale-95"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumbish text */}
        <div className="hidden md:flex items-center gap-3">
          <div className="h-8 w-1 bg-teal-500 rounded-full" />
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              {title}
            </h1>
            {pathname !== "/dashboard" && (
              <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Current View
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notification Bell */}
          <Link
          href="/reminders">
          <button className="relative p-2.5 rounded-full text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 group">
            <Bell className="w-5 h-5 group-hover:animate-bounce" />

            {(overdueCount > 0 || upcomingCount > 0) && (
              <span
                className={`
                absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1.5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-sm ring-2 ring-white animate-pulse
                ${overdueCount > 0 ? "bg-rose-500" : "bg-amber-400"}
              `}
              >
                {overdueCount > 99
                  ? "99+"
                  : overdueCount > 0
                    ? overdueCount
                    : upcomingCount > 99
                      ? "99+"
                      : upcomingCount}
              </span>
            )}
          </button>
          </Link>

          <div className="w-[1px] h-8 bg-slate-200 mx-2" />

          <Link
            href="/settings"
            className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-all duration-200 border border-transparent hover:border-slate-200"
          >
            <div className="relative">
              <UserAvatar user={user} size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-slate-700 leading-tight group-hover:text-teal-700 transition-colors">
                {user?.name}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight font-medium capitalize">
                {user?.seniority
                  ? `${user.seniority} ${user.role || "Lawyer"}`
                  : user?.role || "Lawyer"}
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile sidebar overlay - Styled to match new sidebar theme */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-gradient-to-b from-[#0f766e] to-[#042f2e] shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="lg" />
                <div>
                  <p className="text-white font-bold text-base">{user?.name}</p>
                  <p className="text-teal-200/70 text-xs">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === href
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all",
                      active
                        ? "bg-white text-[#0f766e] shadow-sm"
                        : "text-teal-100/80 hover:text-white hover:bg-white/10",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                    {active && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#0f766e]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-medium text-red-100 bg-red-500/10 border border-red-400/20"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
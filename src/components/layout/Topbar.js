"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Search,
  Menu,
  X,
  Scale,
  LayoutDashboard,
  FolderOpen,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/utils/helpers";
import { api } from "@/utils/api";

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
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 md:px-5 shrink-0 z-20 shadow-sm">
        {/* Mobile menu btn */}
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 active:scale-95"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Page Title */}
        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          {pathname !== "/dashboard" && (
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              Current
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Search Button (Optional - can be activated) */}
          {/* <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <Search className="w-4 h-4" />
          </button> */}

          {/* Notification Bell */}
          <Link
            href="/reminders"
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 group"
          >
            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {overdueCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md shadow-red-500/20 ring-2 ring-white">
                {overdueCount > 99 ? "99+" : overdueCount}
              </span>
            )}
            {upcomingCount > 0 && overdueCount === 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md shadow-amber-400/20 ring-2 ring-white">
                {upcomingCount > 99 ? "99+" : upcomingCount}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="w-px h-4 bg-slate-200 mx-1.5" />

          {/* User Profile */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all duration-200">
                <span className="text-white text-[10px] font-bold tracking-wider">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-700 leading-tight">
                {user?.name}
              </div>
              <p className="text-[9px] text-slate-500 leading-tight font-medium capitalize">
                {user.seniority
                  ? `${user.seniority} ${user.role || "Lawyer"}`
                  : user.role || "Lawyer"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
                  <Scale className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white font-bold text-sm tracking-tight">
                  LawPortal
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
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
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent",
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Sidebar Footer */}
            <div className="px-2 pb-3 border-t border-slate-800 pt-3">
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

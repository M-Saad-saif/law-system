"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Scale,
  LayoutDashboard,
  FolderOpen,
  CalendarDays,
  BookOpen,
  Bell,
  Newspaper,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/helpers";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cases", icon: FolderOpen, label: "Cases" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/books", icon: BookOpen, label: "Law Books" },
  { href: "/reminders", icon: Bell, label: "Reminders" },
  { href: "/intelligencefeed", icon: Newspaper, label: "Intelligence Feed" },
  { href: "/judgement-image-generator", icon: Newspaper, label: "Image Generator" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar hidden md:flex flex-col w-60 shrink-0 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
          <Scale className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm font-display leading-none">
            LawPortal
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">
            Practice Manager
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-title px-3 mb-3">Navigation</p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", active && "active")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center shrink-0">
            <span className="text-primary-300 text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">
              {user?.name || "Loading..."}
            </div>
            <div className="text-slate-500 text-[10px] truncate capitalize">
              {user?.role || "lawyer"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

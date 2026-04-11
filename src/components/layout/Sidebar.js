"use client";

import {
  Bell,
  BookOpenText,
  BookUser,
  Calendar,
  Home,
  Scale,
  Settings,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Icon = {
  Dashboard: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <Home />
    </svg>
  ),
  Cases: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <Calendar />
    </svg>
  ),
  Books: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <BookUser />
    </svg>
  ),
  Reminders: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <Bell />
    </svg>
  ),
  CrossExam: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <BookOpenText />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <Settings />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Scale: () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <Scale />
    </svg>
  ),
  Logout: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
};

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Icon.Dashboard },
      { label: "Cases", href: "/cases", icon: Icon.Cases },
      { label: "Calendar", href: "/calendar", icon: Icon.Calendar },
    ],
  },
  {
    label: "Litigation",
    items: [
      {
        label: "Cross-Examinations",
        href: "/cross-exams",
        icon: Icon.CrossExam,
        subLinks: [
          { label: "All Cross-Exams", href: "/cross-exams" },
          { label: "+ New Draft", href: "/cross-exams/new" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Law Books", href: "/books", icon: Icon.Books },
      { label: "Reminders", href: "/reminders", icon: Icon.Reminders },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/settings", icon: Icon.Settings }],
  },
];

// --- Single nav item ------─

function NavItem({ item, pathname }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const [subOpen, setSubOpen] = useState(isActive);

  const hasSubLinks = item.subLinks && item.subLinks.length > 0;

  return (
    <div>
      <div className="flex items-center group">
        <Link
          href={item.href}
          className={`
            flex items-center gap-3 flex-1 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150
            ${
              isActive
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }
          `}
        >
          <span
            className={
              isActive
                ? "text-teal-400"
                : "text-slate-500 group-hover:text-slate-300"
            }
          >
            <item.icon />
          </span>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-full tracking-wide">
              {item.badge}
            </span>
          )}
        </Link>

        {hasSubLinks && (
          <button
            onClick={() => setSubOpen((v) => !v)}
            className="p-1 text-slate-500 hover:text-slate-300 ml-1"
          >
            <span
              className={`block transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`}
            >
              <Icon.ChevronDown />
            </span>
          </button>
        )}
      </div>

      {hasSubLinks && subOpen && (
        <div className="ml-8 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
          {item.subLinks.map((sub) => {
            const subActive = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={`
                  block py-1.5 px-2 rounded text-xs font-medium transition-colors
                  ${
                    subActive
                      ? "text-teal-400"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Main Sidebar ------------

export default function Sidebar({ user, onLogout }) {
  const pathname = usePathname();

  return (
    <aside
      className="
      h-screen w-60 flex flex-col
      bg-[#0f172a] border-r border-slate-800
      z-40 select-none
    "
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-[#026665] flex items-center justify-center flex-shrink-0 text-white">
          <Icon.Scale />
        </div>
        <div>
          <p
            className="text-sm font-bold text-white tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            LawPortal
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Legal Practice
          </p>
        </div>
      </div>

      {/* --- Navigation ------------------------------------─ */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* --- User footer ------------------------------------ */}
      {user && (
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#026665]/20 border border-[#026665]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#026665] text-xs font-bold uppercase">
                {user.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {user.role || "Lawyer"}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-slate-600 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <Icon.Logout />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

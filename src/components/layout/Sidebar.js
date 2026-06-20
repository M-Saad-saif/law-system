"use client";

import {
  Bell,
  CreditCard,
  BookOpenText,
  BookUser,
  Calendar,
  Home,
  LogOutIcon,
  Scale,
  Settings,
  Library,
  FileText,
  Image,
  Search,
  Cpu,
  ShieldCheck,
  Layout,
  Users,
  Lock,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const Icon = {
  Dashboard: Home,
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
  Calendar,
  Books: BookUser,
  Reminders: Bell,
  CrossExam: BookOpenText,
  Settings,
  Scale,
  Library,
  Applications: FileText,
  ImageGen: Image,
  Search,
  Extractor: Cpu,
  Admin: ShieldCheck,
  Template: Layout,
  Users,
  Billing: CreditCard,
  Logout: LogOutIcon,
  Lock,
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
};

function buildNavSections(user) {
  const isSenior = user?.seniority === "senior";
  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    return [
      {
        label: "Account Details",
        items: [
          {
            label: "Users",
            href: "/admin/users",
            icon: Icon.Users,
          },
          {
            label: "Payment Verification",
            href: "/admin/payments",
            icon: Icon.Admin,
          },
          { label: "Settings", href: "/settings", icon: Icon.Settings },
          { label: "Reminder", href: "/reminders", icon: Icon.Reminders },
        ],
      },
    ];
  }

  return [
    {
      label: "Account",
      items: [
        { label: "Settings", href: "/settings", icon: Icon.Settings },
        { label: "Billing", href: "/billing", icon: Icon.Billing },
      ],
    },
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
        {
          label: "Application Generator",
          href: "/applications",
          icon: Icon.Applications,
          subLinks: [
            { label: "All Applications", href: "/applications" },
            ...(isSenior
              ? [{ label: "Review Applications", href: "/applications/review" }]
              : []),
          ],
        },
      ],
    },
    {
      label: "Judgements",
      items: [
        {
          label: "Search Judgements",
          href: "/judgements",
          icon: Icon.Search,
        },
        {
          label: "AI Extractor",
          href: "/judgement-extractor",
          icon: Icon.Extractor,
        },
        { label: "Library", href: "/library", icon: Icon.Library },
        {
          label: "Image Generator",
          href: "/judgement-image-generator",
          icon: Icon.ImageGen,
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
  ];
}

function LockedNavItem({ item }) {
  return (
    <div className="relative group/locked">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
          border border-transparent opacity-40 cursor-not-allowed select-none"
      >
        <span className="text-slate-600">
          <item.icon className="w-5 h-5" />
        </span>
        <span className="flex-1 truncate text-slate-600">{item.label}</span>
        <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
      </div>
      {/* Tooltip */}
      <div
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
        opacity-0 group-hover/locked:opacity-100 pointer-events-none
        transition-opacity duration-200 whitespace-nowrap"
      >
        <div
          className="bg-slate-800 border border-slate-700/60 text-slate-300
          text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl shadow-black/40"
        >
          Renew your subscription to access
          <div
            className="absolute right-full top-1/2 -translate-y-1/2
            border-4 border-transparent border-r-slate-700/60"
          />
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, pathname, isLocked }) {
  if (isLocked) {
    return <LockedNavItem item={item} />;
  }

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
            flex items-center gap-3 flex-1 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 relative overflow-hidden
            ${
              isActive
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:shadow-md"
            }
          `}
        >
          {/* Active indicator bar */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-400 rounded-r-full shadow-lg shadow-teal-400/50" />
          )}

          <span
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isActive
                ? "text-teal-400 drop-shadow-sm"
                : "text-slate-500 group-hover:text-slate-300"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </span>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="text-[10px] font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white px-2 py-0.5 rounded-full tracking-wide shadow-md shadow-teal-500/20">
              {item.badge}
            </span>
          )}
        </Link>
        {hasSubLinks && (
          <button
            onClick={() => setSubOpen((v) => !v)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 ml-1 transition-all duration-200"
          >
            <span
              className={`block transition-transform duration-300 ${subOpen ? "rotate-180" : ""}`}
            >
              <Icon.ChevronDown />
            </span>
          </button>
        )}
      </div>
      {hasSubLinks && subOpen && (
        <div className="ml-8 mt-1.5 space-y-1 border-l-2 border-slate-700/50 pl-4">
          {item.subLinks.map((sub) => {
            const subActive = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={`block py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                  subActive
                    ? "text-teal-400 bg-teal-500/5 border border-teal-500/10"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                {subActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-teal-400 rounded-r-full" />
                )}
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ALWAYS_ALLOWED_HREFS = new Set(["/billing"]);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAllowed, subLoading } = useSubscription();
  const NAV_SECTIONS = buildNavSections(user);

  const subscriptionExpired =
    !subLoading && user && user.role !== "admin" && !isAllowed();

  return (
    <aside className="h-screen w-60 flex flex-col bg-[#0f172a] border-r border-slate-800/80 z-40 select-none shadow-2xl shadow-black/20">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-800/50 to-transparent">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#026665] to-[#024947] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#026665]/20 ring-1 ring-[#026665]/30">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <p
            className="text-sm font-bold text-white tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            LawPortal
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-medium">
            Legal Practice
          </p>
        </div>
      </div>

      {/* Expired subscription banner */}
      {subscriptionExpired && (
        <div className="mx-3 mt-4 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-0.5">
            <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-amber-400">
              Subscription Ended
            </p>
          </div>
          <p className="text-[10px] text-amber-400/70 leading-relaxed">
            Renew to unlock all features
          </p>
          <Link
            href="/billing"
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg
              bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30
              text-[11px] font-semibold text-amber-400 transition-all duration-200"
          >
            <CreditCard className="w-3 h-3" />
            Renew Now
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-2.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isLocked =
                  subscriptionExpired && !ALWAYS_ALLOWED_HREFS.has(item.href);
                return (
                  <NavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    isLocked={isLocked}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-slate-800/80 px-4 py-4 bg-gradient-to-t from-slate-800/50 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#026665]/20 to-[#026665]/5 border-2 border-[#026665]/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#026665]/10 group-hover:scale-105 transition-transform duration-200">
                <span className="text-[#026665] text-xs font-bold uppercase tracking-wider">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f172a] shadow-lg shadow-emerald-500/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize font-medium">
                {user.seniority === "senior"
                  ? "Senior Lawyer"
                  : user.seniority === "junior"
                    ? "Junior Lawyer"
                    : user.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group/logout flex-shrink-0"
              title="Logout"
            >
              <LogOutIcon className="w-4 h-4 group-hover/logout:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

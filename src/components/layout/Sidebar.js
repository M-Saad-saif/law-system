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
import UserAvatar from "@/components/ui/UserAvatar";

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
          { label: "Users", href: "/admin/users", icon: Icon.Users },
          {
            label: "Payment Verification",
            href: "/admin/payments",
            icon: Icon.Admin,
          },
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
        { label: "Search Judgements", href: "/judgements", icon: Icon.Search },
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
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium
          border border-transparent opacity-40 cursor-not-allowed select-none"
      >
        <span className="text-white/50">
          <item.icon className="w-5 h-5" />
        </span>
        <span className="flex-1 truncate text-white/50">{item.label}</span>
        <Lock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
      </div>
      {/* Tooltip */}
      <div
        className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
        opacity-0 group-hover/locked:opacity-100 pointer-events-none
        transition-opacity duration-200 whitespace-nowrap"
      >
        <div
          className="bg-slate-900 text-white
          text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10"
        >
          Renew subscription to access
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, pathname, isLocked }) {
  if (isLocked) return <LockedNavItem item={item} />;

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
            flex items-center gap-3 flex-1 px-3.5 py-2.5 rounded-full text-sm font-medium
            transition-all duration-200 relative overflow-hidden
            ${
              isActive
                ? "bg-white text-[#0f766e] shadow-lg shadow-black/10"
                : "text-teal-100/80 hover:text-white hover:bg-white/10 border border-transparent"
            }
          `}
        >
          <span
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isActive ? "text-[#0f766e]" : "text-teal-200/70 group-hover:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </span>
          <span className={`flex-1 truncate ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
          
          {item.badge && (
            <span className="text-[10px] font-bold bg-[#0f766e] text-white px-2 py-0.5 rounded-full tracking-wide shadow-sm">
              {item.badge}
            </span>
          )}
        </Link>
        
        {hasSubLinks && (
          <button
            onClick={() => setSubOpen((v) => !v)}
            className="p-1.5 rounded-full text-teal-200/60 hover:text-white hover:bg-white/10 ml-1 transition-all duration-200"
          >
            <span
              className={`block transition-transform duration-300 ${subOpen ? "rotate-180" : ""}`}
            >
              <Icon.ChevronDown />
            </span>
          </button>
        )}
      </div>
      
      {/* Submenu */}
      {hasSubLinks && subOpen && (
        <div className="ml-6 mt-1 space-y-0.5 pl-3 border-l border-white/10">
          {item.subLinks.map((sub) => {
            const subActive = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={`block py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                  subActive
                    ? "text-white bg-white/15"
                    : "text-teal-200/60 hover:text-white hover:bg-white/5"
                }`}
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

const ALWAYS_ALLOWED_HREFS = new Set(["/billing"]);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAllowed, subLoading } = useSubscription();
  const NAV_SECTIONS = buildNavSections(user);

  const subscriptionExpired =
    !subLoading && user && user.role !== "admin" && !isAllowed();

  return (
    <aside 
      className="h-[calc(100vh-1.5rem)] my-3 ml-3 w-64 flex flex-col z-40 select-none shrink-0 rounded-3xl
                 bg-gradient-to-b from-[#0f766e] via-[#0d9488] to-[#042f2e]
                 shadow-xl shadow-teal-900/25"
    >
      {/* User Profile Section */}
      {user && (
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="rounded-full ring-2 ring-white/40 ring-offset-2 ring-offset-[#0f766e]">
                <UserAvatar user={user} size="lg" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f766e] shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-teal-200/70 truncate mt-0.5 font-medium">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Warning */}
      {subscriptionExpired && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-100">
              Subscription Expired
            </p>
          </div>
          <p className="text-[10px] text-amber-200/80 leading-relaxed mb-2">
            Renew access to unlock features
          </p>
          <Link
            href="/billing"
            className="block w-full text-center py-1.5 rounded-full
                     bg-amber-400 hover:bg-amber-300 text-amber-950
                     text-xs font-bold transition-colors"
          >
            Renew Now
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-teal-900/50 scrollbar-track-transparent">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-teal-300/60 uppercase tracking-widest px-3 mb-2 ml-1">
              {section.label}
            </p>
            <div className="space-y-1">
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

      {/* Footer */}
      <div className="px-4 pb-5 pt-2 border-t border-white/10 mt-auto">
         <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full
            text-sm font-medium text-red-100
            bg-red-500/10 hover:bg-red-500/20 border border-red-400/20
            transition-all duration-200 group"
        >
          <LogOutIcon className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell, Search, Menu, X, Scale, LayoutDashboard,
  FolderOpen, CalendarDays, BookOpen, Settings, LogOut
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { api } from '@/utils/api';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/cases', icon: FolderOpen, label: 'Cases' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/books', icon: BookOpen, label: 'Law Books' },
  { href: '/reminders', icon: Bell, label: 'Reminders' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/cases': 'Case Management',
  '/cases/new': 'New Case',
  '/calendar': 'Calendar',
  '/books': 'Law Books',
  '/reminders': 'Reminders',
  '/settings': 'Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const title = Object.entries(pageTitles).find(([path]) => pathname === path || pathname.startsWith(path + '/'))?.[1] || 'LawPortal';

  const fetchUpcomingCount = useCallback(async () => {
    try {
      const data = await api.get('/api/reminders?filter=upcoming');
      const reminders = data?.data?.reminders || [];
      setUpcomingCount(reminders.length);
    } catch {
      setUpcomingCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingCount();
    const interval = setInterval(fetchUpcomingCount, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchUpcomingCount]);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
        {/* Mobile menu btn */}
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="hidden md:block text-lg font-bold text-slate-800 font-display">{title}</h1>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/reminders"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {upcomingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {upcomingCount > 99 ? '99+' : upcomingCount}
              </span>
            )}
          </Link>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-700 leading-none">{user?.name}</div>
              <div className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="sidebar absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm font-display">LawPortal</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn('sidebar-link', active && 'active')}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-4 border-t border-white/5 pt-3">
              <button onClick={logout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/5">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

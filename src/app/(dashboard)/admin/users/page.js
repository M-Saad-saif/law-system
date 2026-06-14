"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Shield,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Briefcase,
  Calendar,
  Mail,
  Hash,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StatCard({ label, value, icon: Icon, color, bg, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`${bg} rounded-lg p-2`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Avatar({ name, color = "teal" }) {
  const colors = {
    teal: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <div
      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[color]}`}
    >
      {initials(name)}
    </div>
  );
}

function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      Inactive
    </span>
  );
}

function ToggleModal({ user, onClose, onDone }) {
  const [loading, setLoading] = useState(false);
  const willDeactivate = user.isActive;

  const confirm = async () => {
    setLoading(true);
    try {
      await api.patch("/api/admin/users", {
        userId: user._id,
        isActive: !user.isActive,
      });
      toast.success(
        willDeactivate
          ? `${user.name} has been deactivated.`
          : `${user.name} has been activated.`,
      );
      onDone();
    } catch (err) {
      toast.error(err.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <div
            className={`rounded-xl p-3 ${
              willDeactivate ? "bg-rose-100" : "bg-emerald-100"
            }`}
          >
            {willDeactivate ? (
              <UserX className="w-6 h-6 text-rose-600" />
            ) : (
              <UserCheck className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {willDeactivate ? "Deactivate User?" : "Activate User?"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.name}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          {willDeactivate
            ? "This will prevent the user from logging in. You can reactivate them at any time."
            : "This will restore the user's access to the platform."}
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${
              willDeactivate
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : willDeactivate ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {loading
              ? "Processing..."
              : willDeactivate
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JuniorRow({ junior, onToggle }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 hover:bg-slate-50 transition-colors group">
      {/* Tree line */}
      <div className="w-8 flex-shrink-0 flex items-center justify-end">
        <div className="w-4 h-px bg-slate-300" />
      </div>

      <Avatar name={junior.name} color="slate" />

      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {junior.name}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 flex-shrink-0" />
            {junior.email}
          </p>
        </div>
        <div className="hidden sm:flex items-center">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            <Briefcase className="w-3 h-3" />
            Junior Lawyer
          </span>
        </div>
        <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          {fmt(junior.createdAt)}
        </div>
        <div className="hidden lg:flex items-center">
          <StatusBadge isActive={junior.isActive} />
        </div>
      </div>

      <button
        onClick={() => onToggle(junior)}
        className={`opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${
          junior.isActive
            ? "border-rose-200 text-rose-600 hover:bg-rose-50"
            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        {junior.isActive ? (
          <>
            <XCircle className="w-3.5 h-3.5" /> Deactivate
          </>
        ) : (
          <>
            <CheckCircle className="w-3.5 h-3.5" /> Activate
          </>
        )}
      </button>
    </div>
  );
}

function SeniorCard({ entry, onToggle, defaultOpen }) {
  const { senior, juniors } = entry;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Senior row */}
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {juniors.length > 0 ? (
            open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          )}
        </button>

        <Avatar name={senior.name} color="teal" />

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0.5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {senior.name}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              {senior.email}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              Senior Lawyer
            </span>
            {juniors.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">
                {juniors.length} junior{juniors.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            {fmt(senior.createdAt)}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <StatusBadge isActive={senior.isActive} />
            {senior.barCouncilNo && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {senior.barCouncilNo}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggle(senior)}
          className={`opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${
            senior.isActive
              ? "border-rose-200 text-rose-600 hover:bg-rose-50"
              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {senior.isActive ? (
            <>
              <XCircle className="w-3.5 h-3.5" /> Deactivate
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Activate
            </>
          )}
        </button>
      </div>

      {/* Juniors */}
      {open && juniors.length > 0 && (
        <div className="border-t border-slate-100">
          {juniors.map((j) => (
            <JuniorRow key={j._id} junior={j} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrphanSection({ juniors, onToggle }) {
  if (!juniors.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-600">
          Unassigned Junior Lawyers ({juniors.length})
        </h3>
      </div>
      <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
        {juniors.map((j, i) => (
          <div key={j._id} className={i > 0 ? "border-t border-slate-100" : ""}>
            <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
              <div className="w-6 flex-shrink-0" />
              <Avatar name={j.name} color="slate" />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {j.name}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {j.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                    <Briefcase className="w-3 h-3" />
                    Junior Lawyer
                  </span>
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    No Senior
                  </span>
                </div>
                <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  {fmt(j.createdAt)}
                </div>
                <div className="hidden lg:flex items-center">
                  <StatusBadge isActive={j.isActive} />
                </div>
              </div>
              <button
                onClick={() => onToggle(j)}
                className={`opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${
                  j.isActive
                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {j.isActive ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Activate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("newest");
  const [toggleTarget, setToggleTarget] = useState(null);

  // Admin guard
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "50",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await api.get(`/api/admin/users?${qs}`);
      setData(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  // Sort hierarchy
  const sortedHierarchy = useMemo(() => {
    if (!data?.hierarchy) return [];
    return [...data.hierarchy].sort((a, b) => {
      const da = new Date(a.senior.createdAt);
      const db = new Date(b.senior.createdAt);
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [data, sortOrder]);

  const handleToggleDone = () => {
    setToggleTarget(null);
    load();
  };

  if (authLoading || (user && user.role !== "admin")) return null;

  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Users Management
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                View and manage all registered lawyers in the system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </button>
              <button
                onClick={load}
                disabled={loading}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.total ?? "—"}
            icon={Users}
            color="text-slate-600"
            bg="bg-slate-100"
            sub="All registered lawyers"
          />
          <StatCard
            label="Senior Lawyers"
            value={stats?.seniors ?? "—"}
            icon={Shield}
            color="text-teal-600"
            bg="bg-teal-100"
            sub="Chamber owners"
          />
          <StatCard
            label="Junior Lawyers"
            value={stats?.juniors ?? "—"}
            icon={Briefcase}
            color="text-indigo-600"
            bg="bg-indigo-100"
            sub="Associated with seniors"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            placeholder="Search by name, email, or bar council number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-slate-200 rounded-full" />
              <div className="absolute top-0 left-0 w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Loading users...
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-slate-500">
              Failed to load users. Try refreshing.
            </p>
          </div>
        ) : sortedHierarchy.length === 0 && !data.orphanJuniors?.length ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 px-4 shadow-sm">
            <div className="bg-slate-100 rounded-2xl p-5 mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              No users found
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              {debouncedSearch
                ? "No users match your search. Try different keywords."
                : "No registered users yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500/30 border border-teal-500/50" />
                Senior Lawyer
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                Junior Lawyer
              </span>
            </div>

            <div className="space-y-3">
              {sortedHierarchy.map((entry) => (
                <SeniorCard
                  key={entry.senior._id}
                  entry={entry}
                  onToggle={setToggleTarget}
                  defaultOpen={entry.juniors.length > 0}
                />
              ))}
            </div>

            <OrphanSection
              juniors={data.orphanJuniors || []}
              onToggle={setToggleTarget}
            />

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                <p className="text-sm text-slate-500">
                  Page
                  <span className="font-semibold text-slate-700">
                    {pagination.page}
                  </span>
                  of
                  <span className="font-semibold text-slate-700">
                    {pagination.pages}
                  </span>
                  &nbsp;·&nbsp; {pagination.total} users total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {toggleTarget && (
        <ToggleModal
          user={toggleTarget}
          onClose={() => setToggleTarget(null)}
          onDone={handleToggleDone}
        />
      )}
    </div>
  );
}

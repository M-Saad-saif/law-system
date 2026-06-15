"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
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
  UserPlus,
  Activity,
  Building2,
  GraduationCap,
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

function StatCard({ label, value, icon: Icon, color, bg, sub, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          {trend && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        <div
          className={`${bg} rounded-xl p-2.5 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function Avatar({ name, color = "teal", size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
  };

  const colors = {
    teal: "bg-gradient-to-br from-teal-400 to-teal-500 text-white border-teal-200 shadow-teal-500/20",
    indigo:
      "bg-gradient-to-br from-indigo-400 to-indigo-500 text-white border-indigo-200 shadow-indigo-500/20",
    slate:
      "bg-gradient-to-br from-slate-400 to-slate-500 text-white border-slate-200 shadow-slate-500/20",
    amber:
      "bg-gradient-to-br from-amber-400 to-amber-500 text-white border-amber-200 shadow-amber-500/20",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0 shadow-lg ${colors[color]} transition-transform duration-300 hover:scale-110`}
    >
      {initials(name)}
    </div>
  );
}

function StatusBadge({ isActive }) {
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5"
    >
      {isActive ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Inactive
        </span>
      )}
    </motion.div>
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={`rounded-2xl p-3.5 shadow-lg ${
                willDeactivate
                  ? "bg-rose-100 shadow-rose-500/20"
                  : "bg-emerald-100 shadow-emerald-500/20"
              }`}
            >
              {willDeactivate ? (
                <UserX className="w-7 h-7 text-rose-600" />
              ) : (
                <UserCheck className="w-7 h-7 text-emerald-600" />
              )}
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {willDeactivate ? "Deactivate User?" : "Activate User?"}
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                {user.name}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-600 leading-relaxed">
              {willDeactivate
                ? "This will prevent the user from logging in and accessing any system features. You can reactivate them at any time."
                : "This will restore the user's access to the platform and all associated features."}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-md"
              disabled={loading}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={confirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl ${
                willDeactivate
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
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
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function JuniorRow({ junior, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-slate-50/80 to-white border-t border-slate-100 hover:from-slate-100 hover:to-slate-50 transition-all duration-200 group"
    >
      {/* Tree line */}
      <div className="w-10 flex-shrink-0 flex items-center justify-end">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="w-5 h-px bg-slate-300 origin-right"
        />
        <div className="w-px h-8 bg-slate-200 -ml-px" />
      </div>

      <Avatar name={junior.name} color="indigo" size="sm" />

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
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full shadow-sm">
            <GraduationCap className="w-3 h-3" />
            Junior Lawyer
          </span>
        </div>
        <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1.5">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          {fmt(junior.createdAt)}
        </div>
        <div className="hidden lg:flex items-center">
          <StatusBadge isActive={junior.isActive} />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(junior)}
        className={`opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border shadow-sm hover:shadow-md ${
          junior.isActive
            ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
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
      </motion.button>
    </motion.div>
  );
}

function SeniorCard({ entry, onToggle, defaultOpen }) {
  const { senior, juniors } = entry;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Senior row */}
      <motion.div
        whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
        className="flex items-center gap-4 px-6 py-5 transition-colors duration-200 group cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 flex-shrink-0 shadow-sm"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {juniors.length > 0 ? (
            <motion.div
              animate={{ rotate: open ? 0 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {open ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </motion.div>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300" />
          )}
        </motion.button>

        <Avatar name={senior.name} color="teal" size="md" />

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0.5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {senior.name}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              {senior.email}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full shadow-sm">
              <Building2 className="w-3 h-3" />
              Senior Lawyer
            </span>
            {juniors.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-full font-semibold shadow-sm"
              >
                +{juniors.length}
              </motion.span>
            )}
          </div>

          <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1.5">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            {fmt(senior.createdAt)}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <StatusBadge isActive={senior.isActive} />
            {senior.barCouncilNo && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg font-mono">
                <Hash className="w-3 h-3" />
                {senior.barCouncilNo}
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(senior);
          }}
          className={`opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border shadow-sm hover:shadow-md ${
            senior.isActive
              ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
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
        </motion.button>
      </motion.div>

      {/* Juniors */}
      <AnimatePresence>
        {open && juniors.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-slate-100">
              {juniors.map((j, index) => (
                <JuniorRow
                  key={j._id}
                  junior={j}
                  onToggle={onToggle}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrphanSection({ juniors, onToggle }) {
  if (!juniors.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4 px-1">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </motion.div>
        <h3 className="text-sm font-semibold text-slate-600">
          Unassigned Junior Lawyers
        </h3>
        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
          {juniors.length}
        </span>
      </div>
      <div className="bg-white border-2 border-amber-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {juniors.map((j, i) => (
          <motion.div
            key={j._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={i > 0 ? "border-t border-slate-100" : ""}
          >
            <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all duration-200 group">
              <div className="w-8 flex-shrink-0" />
              <Avatar name={j.name} color="amber" size="sm" />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {j.name}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {j.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full shadow-sm">
                    <GraduationCap className="w-3 h-3" />
                    Junior Lawyer
                  </span>
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full font-medium">
                    Unassigned
                  </span>
                </div>
                <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  {fmt(j.createdAt)}
                </div>
                <div className="hidden lg:flex items-center">
                  <StatusBadge isActive={j.isActive} />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(j)}
                className={`opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border shadow-sm hover:shadow-md ${
                  j.isActive
                    ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
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
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg shadow-slate-200/50"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-xl">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Users Management
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-2 ml-14">
                View and manage all registered lawyers in the system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-md"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={load}
                disabled={loading}
                className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold flex items-center gap-2 transition-all duration-200 hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
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
            icon={Building2}
            color="text-teal-600"
            bg="bg-teal-100"
            sub="Chamber owners"
          />
          <StatCard
            label="Junior Lawyers"
            value={stats?.juniors ?? "—"}
            icon={GraduationCap}
            color="text-indigo-600"
            bg="bg-indigo-100"
            sub="Associated with seniors"
          />
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            className="w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md"
            placeholder="Search by name, email, or bar council number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-16 h-16 border-4 border-slate-200 rounded-2xl" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-2xl" />
            </motion.div>
            <p className="text-sm text-slate-500 font-semibold">
              Loading users...
            </p>
          </div>
        ) : !data ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <AlertCircle className="w-16 h-16 text-rose-400" />
            <p className="text-sm text-slate-500 font-medium">
              Failed to load users. Try refreshing.
            </p>
          </motion.div>
        ) : sortedHierarchy.length === 0 && !data.orphanJuniors?.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center justify-center py-24 px-4 shadow-lg"
          >
            <div className="bg-slate-100 rounded-2xl p-6 mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No users found
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-xs">
              {debouncedSearch
                ? "No users match your search. Try different keywords."
                : "No registered users yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 px-1 py-2">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 shadow-md" />
                Senior Lawyer
              </span>
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-md" />
                Junior Lawyer
              </span>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {sortedHierarchy.map((entry) => (
                <SeniorCard
                  key={entry.senior._id}
                  entry={entry}
                  onToggle={setToggleTarget}
                  defaultOpen={false}
                />
              ))}
            </motion.div>

            <OrphanSection
              juniors={data.orphanJuniors || []}
              onToggle={setToggleTarget}
            />

            {pagination && pagination.pages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 shadow-lg"
              >
                <p className="text-sm text-slate-500 font-medium">
                  Page
                  <span className="font-bold text-slate-900 mx-1 bg-slate-100 px-2 py-1 rounded-lg">
                    {pagination.page}
                  </span>
                  of
                  <span className="font-bold text-slate-900 mx-1 bg-slate-100 px-2 py-1 rounded-lg">
                    {pagination.pages}
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-semibold text-slate-700">
                    {pagination.total} users total
                  </span>
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={pagination.page >= pagination.pages}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toggleTarget && (
          <ToggleModal
            user={toggleTarget}
            onClose={() => setToggleTarget(null)}
            onDone={handleToggleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

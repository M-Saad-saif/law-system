"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Search,
  Filter,
  X,
  Eye,
  Edit3,
  FileText,
  History,
  Download,
  Trash2,
  ChevronRight,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookMarked,
  User,
  MessageSquare,
  Flag,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Zap,
  Play,
  Square,
  BarChart,
  GitBranch,
  ArrowLeft,
  ArrowRight,
  Settings,
  Menu,
  Home,
  Folder,
  Briefcase,
  UserCircle,
  LogOut,
  Bell,
  PlusCircle,
  MinusCircle,
  Upload,
  Link2,
  ExternalLink,
  Copy,
  MoreVertical,
  Star,
  StarOff,
  Send,
  Inbox,
  Archive,
  Trash,
  Edit,
  Save,
  XCircle,
  CheckSquare,
  Square as SquareIcon,
  Radio,
  RadioOff,
  EyeOff,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  CalendarDays,
  FileCheck,
  FileX,
  Clock as ClockIcon,
  MessageCircle,
  HelpCircle,
  Info,
  Loader2,
} from "lucide-react";

// --- Theme Colors ---
const COLORS = {
  primary: "#026665",
  primaryLight: "#0e9185",
  primaryMuted: "#9fd8d1",
  primaryBg: "#eef5f3",
  white: "#ffffff",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

// --- Status Config ---
const STATUS = {
  draft: {
    label: "Draft",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600",
    icon: Edit3,
  },
  submitted: {
    label: "Submitted",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700",
    icon: Send,
  },
  in_review: {
    label: "In Review",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700",
    icon: Eye,
  },
  changes_requested: {
    label: "Changes Requested",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-700",
    icon: AlertCircle,
  },
  approved: {
    label: "Approved",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle,
  },
  courtroom_active: {
    label: "Live in Court",
    dot: "bg-red-500",
    pill: "bg-red-100 text-red-700",
    icon: Activity,
  },
  archived: {
    label: "Archived",
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-500",
    icon: Archive,
  },
};

// --- Components ---

function StatusPill({ status, size = "sm" }) {
  const s = STATUS[status] || STATUS.draft;
  const Icon = s.icon;
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${s.pill}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

function StatCard({ label, count, status, active, onClick }) {
  const s = STATUS[status] || STATUS.draft;
  const Icon = s.icon;

  return (
    <button
      onClick={onClick}
      className={`
        group relative overflow-hidden text-left p-5 rounded-2xl border-2 transition-all duration-300
        ${active
          ? "border-[#026665] bg-[#eef5f3] shadow-lg shadow-[#026665]/10"
          : "border-slate-200 bg-white hover:border-[#0e9185] hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      <div className={`absolute top-0 left-0 h-1 w-full transition-all duration-300 ${active ? "bg-[#026665]" : "bg-transparent group-hover:bg-[#0e9185]"}`} />
      <div className="flex items-center justify-between mb-3">
        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
        <Icon className={`w-4 h-4 ${active ? "text-[#026665]" : "text-slate-400"}`} />
      </div>
      <p className={`text-2xl font-bold ${active ? "text-[#026665]" : "text-slate-800"}`}>
        {count}
      </p>
      <p className={`text-xs mt-1 font-medium ${active ? "text-[#026665]" : "text-slate-500"}`}>
        {label}
      </p>
    </button>
  );
}

function EmptyState({ hasFilters, onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#eef5f3] flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-[#9fd8d1]" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {hasFilters ? "No results found" : "No cross-examinations yet"}
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        {hasFilters
          ? "Try adjusting your filters to find what you're looking for."
          : "Create your first cross-examination draft to get started."}
      </p>
      {!hasFilters && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-[#026665] hover:bg-[#0e9185] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#026665]/20 hover:shadow-[#026665]/30 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Cross-Examination
        </button>
      )}
    </div>
  );
}

// --- Main Page ---
export default function CrossExamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSenior = user?.seniority === "senior" || user?.role === "admin";
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", page: 1 });
  const [viewMode, setViewMode] = useState("list"); // list | grid

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        status: filters.status,
        page: String(filters.page),
        limit: "20",
      }).toString();
      const data = await apiFetch(`/api/cross-exams?${qs}`);
      let fetchedExams = data.exams || [];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        fetchedExams = fetchedExams.filter(
          (e) =>
            e.title?.toLowerCase().includes(q) ||
            e.caseId?.caseTitle?.toLowerCase().includes(q) ||
            e.caseId?.caseNumber?.toLowerCase().includes(q),
        );
      }
      setExams(fetchedExams);
      setPagination(
        data.pagination || {
          total: data.total || 0,
          pages: data.totalPages || 1,
          page: data.page || 1,
        },
      );
    } catch {
      toast.error("Failed to load cross-examinations.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/cross-exams/${id}`, { method: "DELETE" });
      toast.success("Deleted.");
      fetchExams();
    } catch (err) {
      toast.error(err.message || "Delete failed.");
    }
  };

  const fmtDate = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");
  const hasFilters = !!(filters.search || filters.status);
  const countBy = (s) => exams.filter((e) => e.status === s).length;

  return (
    <div className="min-h-screen bg-[#eef5f3]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cross-Examinations
            </h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborative drafting & reviewing
            </p>
          </div>
          <button
            onClick={() => router.push("/cross-exams/new")}
            className="inline-flex items-center gap-2 bg-[#026665] hover:bg-[#0e9185] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#026665]/20 hover:shadow-[#026665]/30 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Cross-Exam
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(STATUS).map(([key, cfg]) => (
            <StatCard
              key={key}
              label={cfg.label}
              count={countBy(key)}
              status={key}
              active={filters.status === key}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  status: f.status === key ? "" : key,
                  page: 1,
                }))
              }
            />
          ))}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, case, or number…"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
              }
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#eef5f3] focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {filters.status && (
              <button
                onClick={() => setFilters((f) => ({ ...f, status: "", page: 1 }))}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#eef5f3] text-[#026665] rounded-xl text-sm font-medium border border-[#9fd8d1] hover:bg-[#9fd8d1]/30 transition-colors"
              >
                <StatusPill status={filters.status} size="sm" />
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {hasFilters && (
              <button
                onClick={() => setFilters({ search: "", status: "", page: 1 })}
                className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2.5 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto border-l border-slate-200 pl-3">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#026665] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#026665] text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#026665] animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onNew={() => router.push("/cross-exams/new")} />
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-[#eef5f3]">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Case</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Reviewer</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Hearing</th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-[#026665] uppercase tracking-wide">Updated</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-[#eef5f3]/50 transition-colors group">
                    <td className="px-5 py-4">
                      <Link
                        href={`/cross-exams/${exam._id}`}
                        className="font-semibold text-slate-800 hover:text-[#026665] transition-colors"
                      >
                        {exam.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {exam.userId?.name}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{exam.userId?.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {exam.caseId ? (
                        <div>
                          <span className="font-medium text-slate-700">{exam.caseId.caseTitle}</span>
                          <br />
                          <span className="text-xs text-slate-400">{exam.caseId.caseNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill status={exam.status} />
                    </td>
                    <td className="px-4 py-4">
                      {exam.assignedTo?.name ? (
                        <span className="text-slate-600">{exam.assignedTo.name}</span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-sm">{fmtDate(exam.hearingDate)}</td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{fmtDate(exam.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSenior && ["submitted", "in_review"].includes(exam.status) ? (
                          <Link
                            href={`/cross-exams/${exam._id}/review`}
                            className="px-3 py-1.5 bg-[#026665] text-white text-xs font-semibold rounded-lg hover:bg-[#0e9185] transition-colors"
                          >
                            {exam.status === "submitted" ? "Start Review" : "Review"}
                          </Link>
                        ) : (
                          <Link
                            href={`/cross-exams/${exam._id}`}
                            className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            {["draft", "changes_requested"].includes(exam.status) ? "Edit" : "View"}
                          </Link>
                        )}
                        <Link
                          href={`/cross-exams/${exam._id}/compare`}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Link>
                        {exam.status === "approved" && (
                          <a
                            href={`/api/cross-exams/${exam._id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {exam.status === "draft" && !isSenior && (
                          <button
                            onClick={() => handleDelete(exam._id, exam.title)}
                            className="px-3 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors border border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-[#eef5f3]">
                <p className="text-xs text-slate-500">
                  {exams.length} of {pagination.total} total
                </p>
                <div className="flex gap-1.5">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === filters.page
                          ? "bg-[#026665] text-white"
                          : "text-slate-600 hover:bg-[#9fd8d1]/30"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <StatusPill status={exam.status} size="sm" />
                  <span className="text-xs text-slate-400">{fmtDate(exam.updatedAt)}</span>
                </div>
                <Link href={`/cross-exams/${exam._id}`}>
                  <h3 className="font-semibold text-slate-800 hover:text-[#026665] transition-colors text-lg">
                    {exam.title}
                  </h3>
                </Link>
                {exam.caseId && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {exam.caseId.caseTitle}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {exam.userId?.name}
                  </span>
                  {exam.hearingDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {fmtDate(exam.hearingDate)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href={`/cross-exams/${exam._id}`}
                    className="flex-1 text-center bg-[#026665] hover:bg-[#0e9185] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    {["draft", "changes_requested"].includes(exam.status) ? "Edit" : "View"}
                  </Link>
                  <Link
                    href={`/cross-exams/${exam._id}/compare`}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                  {exam.status === "approved" && (
                    <a
                      href={`/api/cross-exams/${exam._id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-white" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
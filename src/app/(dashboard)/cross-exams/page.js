// ─────────────────────────────────────────────────────────────────────────────
// /cross-exams — Junior + Senior Dashboard
// Matches LexisPortal aesthetic: slate-900 sidebar, white content, gold accents
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";

// ── Status config ─────────────────────────────────────────────────────────
const STATUS = {
  draft: {
    label: "Draft",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600",
  },
  submitted: {
    label: "Submitted",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700",
  },
  in_review: {
    label: "In Review",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700",
  },
  changes_requested: {
    label: "Changes Requested",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-700",
  },
  approved: {
    label: "Approved",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700",
  },
  archived: {
    label: "Archived",
    dot: "bg-gray-300",
    pill: "bg-gray-100 text-gray-500",
  },
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, count, status, active, onClick }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-5 rounded-2xl border transition-all duration-200
        ${
          active
            ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        }
      `}
    >
      <div className={`w-2 h-2 rounded-full mb-3 ${s.dot}`} />
      <p
        className={`text-2xl font-bold ${active ? "text-amber-700" : "text-slate-800"}`}
      >
        {count}
      </p>
      <p
        className={`text-xs mt-1 font-medium ${active ? "text-amber-600" : "text-slate-500"}`}
      >
        {label}
      </p>
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-slate-600 font-semibold text-base">
        {hasFilters ? "No results found" : "No cross-examinations yet"}
      </p>
      <p className="text-slate-400 text-sm mt-1 mb-5">
        {hasFilters
          ? "Try adjusting your filters."
          : "Create your first draft to get started."}
      </p>
      {!hasFilters && (
        <Link
          href="/cross-exams/new"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Cross-Examination
        </Link>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CrossExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [filters, setFilters] = useState({ search: "", status: "", page: 1 });

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        search: filters.search,
        status: filters.status,
        page: String(filters.page),
        limit: "20",
      }).toString();
      const data = await apiFetch(`/api/cross-exams?${qs}`);
      setExams(data.exams || []);
      setPagination(data.pagination || { total: 0, pages: 1, page: 1 });
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

  // Count per status across all loaded exams
  const countBy = (s) => exams.filter((e) => e.status === s).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Cross-Examinations
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Collaborative drafting &amp; review — like Google Docs meets
              GitHub PR
            </p>
          </div>
          <Link
            href="/cross-exams/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Cross-Exam
          </Link>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────────── */}
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

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search title…"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
              }
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-64"
            />
          </div>
          {filters.status && (
            <button
              onClick={() => setFilters((f) => ({ ...f, status: "", page: 1 }))}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 text-amber-800 rounded-xl text-sm font-medium border border-amber-200"
            >
              <StatusPill status={filters.status} />
              <span className="text-amber-500 ml-1">×</span>
            </button>
          )}
          {hasFilters && (
            <button
              onClick={() => setFilters({ search: "", status: "", page: 1 })}
              className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2.5"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Case
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Reviewer
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Hearing
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Updated
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/cross-exams/${exam._id}`}
                        className="font-semibold text-slate-800 hover:text-slate-600 group-hover:underline underline-offset-2"
                      >
                        {exam.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        by {exam.createdBy?.name}
                      </p>
                    </td>
                    {/* Case */}
                    <td className="px-4 py-4 text-slate-600">
                      {exam.caseId ? (
                        <>
                          <span className="font-medium">
                            {exam.caseId.caseTitle}
                          </span>
                          <br />
                          <span className="text-xs text-slate-400">
                            {exam.caseId.caseNumber}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusPill status={exam.status} />
                    </td>
                    {/* Reviewer */}
                    <td className="px-4 py-4 text-slate-600 text-sm">
                      {exam.assignedTo?.name || (
                        <span className="text-slate-300 italic text-xs">
                          Unassigned
                        </span>
                      )}
                    </td>
                    {/* Hearing date */}
                    <td className="px-4 py-4 text-slate-500 text-sm">
                      {fmtDate(exam.hearingDate)}
                    </td>
                    {/* Updated at */}
                    <td className="px-4 py-4 text-slate-400 text-xs">
                      {fmtDate(exam.updatedAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {exam.status === "in_review" ? (
                          <Link
                            href={`/cross-exams/${exam._id}/review`}
                            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Review
                          </Link>
                        ) : (
                          <Link
                            href={`/cross-exams/${exam._id}`}
                            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            {["draft", "changes_requested"].includes(
                              exam.status,
                            )
                              ? "Edit"
                              : "View"}
                          </Link>
                        )}
                        <Link
                          href={`/cross-exams/${exam._id}/compare`}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          History
                        </Link>
                        {exam.status === "approved" && (
                          <a
                            href={`/api/cross-exams/${exam._id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            PDF
                          </a>
                        )}
                        {exam.status === "draft" && (
                          <button
                            onClick={() => handleDelete(exam._id, exam.title)}
                            className="px-2 py-1.5 text-red-400 hover:text-red-600 text-xs transition-colors"
                          >
                            Delete
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
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500">
                  {exams.length} of {pagination.total} total
                </p>
                <div className="flex gap-1.5">
                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === filters.page
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

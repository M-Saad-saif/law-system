"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate, relativeDate } from "@/utils/helpers";
import {
  StatusBadge,
  PageLoader,
  EmptyState,
  SearchInput,
  ConfirmDialog,
} from "@/components/ui";
import {
  Plus,
  FolderOpen,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUSES = ["", "Active", "Closed", "Pending", "Adjourned", "Disposed"];
const CASE_TYPES = [
  "",
  "Civil",
  "Criminal",
  "Family",
  "Corporate",
  "Tax",
  "Constitutional",
  "Labour",
  "Banking",
  "Property",
  "Other",
];

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [caseType, setCaseType] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (caseType) params.set("caseType", caseType);
      const data = await api.get(`/api/cases?${params}`);
      setCases(data.data.cases);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch {
      toast.error("Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, caseType]);

  useEffect(() => {
    const t = setTimeout(fetchCases, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCases, search]);

  useEffect(() => {
    setPage(1);
  }, [search, status, caseType]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/cases/${deleteTarget._id}`);
      toast.success("Case deleted.");
      setDeleteTarget(null);
      fetchCases();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Case Management</h1>
          <p className="page-subtitle">{total} total cases in your practice</p>
        </div>
        <Link href="/cases/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, case number, court, client..."
          className="flex-1"
        />
        <select
          className="select w-full sm:w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>
        <select
          className="select w-full sm:w-40"
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
        >
          {CASE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t || "All Types"}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No cases found"
            description={
              search || status
                ? "Try adjusting your search or filters."
                : "Add your first case to get started."
            }
            action={
              !search && !status ? (
                <Link href="/cases/new" className="btn-primary">
                  <Plus className="w-4 h-4" /> Add Case
                </Link>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Court</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Next Hearing</th>
                    <th>Status</th>
                    <th className="w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => router.push(`/cases/${c._id}`)}
                    >
                      <td>
                        <div className="font-semibold text-slate-800">
                          {c.caseTitle}
                        </div>
                        {c.caseNumber && (
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {c.caseNumber}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-slate-700 text-sm">
                          {c.courtType}
                        </div>
                        {c.courtName && (
                          <div className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">
                            {c.courtName}
                          </div>
                        )}
                      </td>
                      <td className="text-slate-600">{c.caseType}</td>
                      <td className="text-slate-600">{c.clientName || "—"}</td>
                      <td>
                        {c.nextHearingDate ? (
                          <div>
                            <div className="text-sm">
                              {formatDate(c.nextHearingDate)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {relativeDate(c.nextHearingDate)}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/cases/${c._id}`)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages} · {total} cases
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-2 py-1.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-2 py-1.5 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Case"
        message={`Are you sure you want to delete "${deleteTarget?.caseTitle}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

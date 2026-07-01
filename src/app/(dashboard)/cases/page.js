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
  Star,
  Briefcase,
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
      const response = await api.get(`/api/cases?${params}`);
      setCases(response?.data?.cases || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
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

  const toggleFavourite = async (e, c) => {
    e.stopPropagation();
    try {
      const response = await api.patch(`/api/cases/${c._id}/favourite`);
      const isFav = response?.data?.isFavourite;

      setCases((prev) =>
        prev.map((x) => (x._id === c._id ? { ...x, isFavourite: isFav } : x)),
      );
      toast.success(isFav ? "Saved to Library" : "Removed from Library");
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0 flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg,#026665,#0d8e83)" }}
          >
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Case Management</h1>
            <p className="page-subtitle">
              <span className="font-semibold text-[#026665]">{total}</span>{" "}
              total cases in your practice
            </p>
          </div>
        </div>
        <Link
          href="/cases/new"
          className="btn-primary shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-[#d9ede6] shadow-sm">
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
      <div className="table-container animate-fade-in-up">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-[3px] border-[#ccebdb] border-t-[#026665] rounded-full animate-spin" />
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
                  {cases.map((c, i) => (
                    <tr
                      key={c._id}
                      onClick={() => router.push(`/cases/${c._id}`)}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {c.isFavourite && (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-[#1c3d3b]">
                              {c.caseTitle}
                            </div>
                            {c.caseNumber && (
                              <div className="text-xs text-[#5b7a77] font-mono mt-0.5">
                                {c.caseNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-[#1c3d3b]/80 text-sm">
                          {c.courtType}
                        </div>
                        {c.courtName && (
                          <div className="text-xs text-[#5b7a77] mt-0.5 max-w-[160px] truncate">
                            {c.courtName}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-[#ccebdb] text-[#026665]">
                          {c.caseType}
                        </span>
                      </td>
                      <td className="text-[#1c3d3b]/80">
                        {c.clientName || "—"}
                      </td>
                      <td>
                        {c.nextHearingDate ? (
                          <div>
                            <div className="text-sm text-[#1c3d3b]">
                              {formatDate(c.nextHearingDate)}
                            </div>
                            <div className="text-xs text-[#5b7a77]">
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
                            className="p-1.5 rounded-md text-[#5b7a77] hover:text-[#026665] hover:bg-[#ccebdb] transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => toggleFavourite(e, c)}
                            className="p-1.5 rounded-md hover:bg-amber-50 transition-colors"
                            title={
                              c.isFavourite
                                ? "Remove from Library"
                                : "Save to Library"
                            }
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${c.isFavourite ? "fill-amber-400 text-amber-400" : "text-[#5b7a77]"}`}
                            />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 rounded-md text-[#5b7a77] hover:text-red-600 hover:bg-red-50 transition-colors"
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
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-[#eef6f3] bg-[#f5faf8]">
                <p className="text-sm text-[#4d6b68]">
                  Page <span className="font-semibold text-[#1c3d3b]">{page}</span> of{" "}
                  {totalPages} · {total} cases
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
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
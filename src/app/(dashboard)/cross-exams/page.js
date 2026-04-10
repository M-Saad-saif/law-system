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

const STATUSES = ["", "draft", "submitted", "in_review", "changes_requested", "approved", "archived"];

export default function CrossExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const data = await api.get(`/api/cross-exams?${params}`);
      setExams(data.exams);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error("Failed to load cross-examinations.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const t = setTimeout(fetchExams, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchExams, search]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/cross-exams/${deleteTarget._id}`);
      toast.success("Cross-examination deleted.");
      setDeleteTarget(null);
      fetchExams();
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
          <h1 className="page-title">Cross-Examinations</h1>
          <p className="page-subtitle">{total} total cross-examinations</p>
        </div>
        <Link href="/cross-exams/new" className="btn-primary shrink-0">
          <Plus className="w-4 h-4" /> New Cross-Examination
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title..."
          className="flex-1"
        />
        <select
          className="select w-full sm:w-40"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "All Statuses"}
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
        ) : exams.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No cross-examinations found"
            description={search ? "Try adjusting your filters or search term." : "Start by creating a new cross-examination."}
            action={
              <Link href="/cross-exams/new" className="btn-primary">
                <Plus className="w-4 h-4" /> Create One
              </Link>
            }
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-700">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-xs text-gray-700">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-xs text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      <Link href={`/cross-exams/${exam._id}`} className="hover:text-indigo-600">
                        {exam.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exam.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {relativeDate(exam.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/cross-exams/${exam._id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      {exam.status === "draft" && (
                        <button
                          onClick={() => setDeleteTarget(exam)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-600">
                  Page {page} of {totalPages} • {total} total
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-secondary disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="btn-secondary disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Cross-Examination"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

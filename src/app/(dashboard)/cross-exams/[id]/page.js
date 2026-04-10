// app/(dashboard)/cross-exams/[id]/page.js
// Junior draft editor — Add witnesses, manage QA pairs, submit for review

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { format } from "date-fns";
import WitnessPanel from "@/components/cross-exam/WitnessPanel";
import StatusBadge from "@/components/cross-exam/StatusBadge";
import ActivityFeed from "@/components/cross-exam/ActivityFeed";

export default function CrossExamEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  // ── Fetch exam + witnesses + activity ──────────────────────────────────────
  const fetchExam = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}`);
      setExam(data.exam);
      setActivity(data.activity || []);
    } catch (err) {
      toast.error("Failed to load cross-examination.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // ── Add witness ────────────────────────────────────────────────────────────
  const handleAddWitness = async (witnessData) => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/witnesses`, {
        method: "POST",
        body: JSON.stringify(witnessData),
      });
      setExam((prev) => ({
        ...prev,
        witnesses: [...(prev.witnesses || []), data.witness],
      }));
      toast.success("Witness added.");
    } catch (err) {
      toast.error(err.message || "Failed to add witness.");
    }
  };

  // ── Delete witness ─────────────────────────────────────────────────────────
  const handleDeleteWitness = async (wId) => {
    if (!confirm("Remove this witness and all their QA pairs?")) return;
    try {
      await apiFetch(`/api/cross-exams/${id}/witnesses/${wId}`, {
        method: "DELETE",
      });
      setExam((prev) => ({
        ...prev,
        witnesses: prev.witnesses.filter((w) => w._id !== wId),
      }));
      toast.success("Witness removed.");
    } catch (err) {
      toast.error(err.message || "Failed to remove witness.");
    }
  };

  // ── Add QA pair ────────────────────────────────────────────────────────────
  const handleAddQA = async (wId, qaData) => {
    try {
      const data = await apiFetch(
        `/api/cross-exams/${id}/witnesses/${wId}/qa`,
        {
          method: "POST",
          body: JSON.stringify(qaData),
        },
      );
      setExam((prev) => ({
        ...prev,
        witnesses: prev.witnesses.map((w) =>
          w._id === wId ? { ...w, qaPairs: [...w.qaPairs, data.qaPair] } : w,
        ),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to add QA pair.");
      throw err;
    }
  };

  // ── Update QA pair ─────────────────────────────────────────────────────────
  const handleUpdateQA = async (wId, qaId, payload) => {
    try {
      const data = await apiFetch(
        `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/edit`,
        { method: "PUT", body: JSON.stringify(payload) },
      );
      setExam((prev) => ({
        ...prev,
        witnesses: prev.witnesses.map((w) =>
          w._id === wId
            ? {
                ...w,
                qaPairs: w.qaPairs.map((p) =>
                  p._id === qaId ? data.qaPair : p,
                ),
              }
            : w,
        ),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to update QA pair.");
      throw err;
    }
  };

  // ── Submit for review ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!confirm("Submit this cross-examination for senior review?")) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/submit`, {
        method: "POST",
        body: "{}",
      });
      setExam((prev) => ({ ...prev, status: data.exam.status }));
      toast.success("Submitted for review!");
      fetchExam(); // refresh activity
    } catch (err) {
      toast.error(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Resubmit ──────────────────────────────────────────────────────────────
  const handleResubmit = async () => {
    if (!confirm("Resubmit for review?")) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/resubmit`, {
        method: "POST",
        body: "{}",
      });
      setExam((prev) => ({ ...prev, status: data.exam.status }));
      toast.success("Resubmitted!");
      fetchExam();
    } catch (err) {
      toast.error(err.message || "Resubmit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!exam)
    return <div className="p-6 text-red-500">Cross-examination not found.</div>;

  const isEditable =
    ["draft", "changes_requested"].includes(exam.status) && !exam.isLocked;
  const canSubmit = exam.status === "draft";
  const canResubmit = exam.status === "changes_requested";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/cross-exams" className="hover:text-indigo-600">
          Cross-Examinations
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">
          {exam.title}
        </span>
      </nav>

      {/* Header bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <StatusBadge status={exam.status} />
          </div>
          <p className="text-sm text-gray-500">
            Version {exam.version - 1} ·{" "}
            {exam.hearingDate
              ? `Hearing ${format(new Date(exam.hearingDate), "dd MMM yyyy")}`
              : "No hearing date set"}
            {exam.assignedTo && ` · Reviewer: ${exam.assignedTo.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Activity
          </button>
          <Link
            href={`/cross-exams/${id}/compare`}
            className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Version History
          </Link>
          {exam.status === "approved" && (
            <a
              href={`/api/cross-exams/${id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Export PDF
            </a>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          )}
          {canResubmit && (
            <button
              onClick={handleResubmit}
              disabled={submitting}
              className="text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              {submitting ? "Resubmitting…" : "Resubmit"}
            </button>
          )}
        </div>
      </div>

      {/* Changes-requested banner */}
      {exam.status === "changes_requested" && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200">
          <p className="font-semibold text-orange-800 text-sm">
            ⚠ Changes requested by reviewer
          </p>
          <p className="text-xs text-orange-700 mt-1">
            Update the flagged QA pairs below, then resubmit.
          </p>
        </div>
      )}

      {/* Locked banner */}
      {exam.isLocked && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
          <p className="font-semibold text-green-800 text-sm">
            ✓ Approved — document is locked
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Witnesses panel takes 2/3 */}
        <div className="lg:col-span-2">
          <WitnessPanel
            witnesses={exam.witnesses || []}
            isEditable={isEditable}
            onAddWitness={handleAddWitness}
            onDeleteWitness={handleDeleteWitness}
            onAddQA={handleAddQA}
            onUpdateQA={handleUpdateQA}
            mode="junior"
          />
        </div>

        {/* Activity feed takes 1/3 */}
        {showActivity && (
          <div className="lg:col-span-1">
            <ActivityFeed activity={activity} />
          </div>
        )}
      </div>
    </div>
  );
}

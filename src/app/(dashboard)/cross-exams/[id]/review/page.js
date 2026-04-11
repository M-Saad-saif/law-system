// app/(dashboard)/cross-exams/[id]/review/page.js
// Senior Review Panel — 3-column: witnesses | QA pairs | comments

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import StatusBadge from "@/components/cross-exam/StatusBadge";
import CommentThread from "@/components/cross-exam/CommentThread";

// ─── QA pair component for the review panel ───────────────────────────────
function ReviewQAPair({
  pair,
  witnessId,
  examId,
  isLocked,
  onUpdate,
  onFlag,
  onSelectForComment,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedQ, setEditedQ] = useState(pair.editedQuestion || "");
  const [editedA, setEditedA] = useState(pair.editedAnswer || "");
  const [useEdited, setUseEdited] = useState(pair.useEditedVersion || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(witnessId, pair._id, {
        editedQuestion: editedQ,
        editedAnswer: editedA,
        useEditedVersion: useEdited,
      });
      setEditMode(false);
      toast.success("Saved.");
    } catch (_) {
      // error already toasted
    } finally {
      setSaving(false);
    }
  };

  const statusClass = pair.isApproved
    ? "border-green-300 bg-green-50"
    : pair.isFlagged
      ? "border-red-300 bg-red-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-xl border p-4 ${statusClass} transition-all`}>
      {/* Sequence + status badges */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          Q{pair.sequence}
        </span>
        <div className="flex items-center gap-1.5">
          {pair.isFlagged && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              ⚑ Flagged
            </span>
          )}
          {pair.isApproved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              ✓ Approved
            </span>
          )}
          {pair.useEditedVersion && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Edited version active
            </span>
          )}
        </div>
      </div>

      {/* Original */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
          Original Question
        </p>
        <p className="text-sm text-gray-800">
          {pair.originalQuestion || <em className="text-gray-400">—</em>}
        </p>
        {pair.originalAnswer && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase mt-2 mb-1">
              Expected Answer
            </p>
            <p className="text-sm text-gray-600">{pair.originalAnswer}</p>
          </>
        )}
      </div>

      {/* Edited version (senior) */}
      {!isLocked && editMode ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-indigo-600 uppercase">
            Your Edit
          </p>
          <textarea
            rows={2}
            value={editedQ}
            onChange={(e) => setEditedQ(e.target.value)}
            placeholder="Edited question…"
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <textarea
            rows={2}
            value={editedA}
            onChange={(e) => setEditedA(e.target.value)}
            placeholder="Edited answer / expected response…"
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={useEdited}
              onChange={(e) => setUseEdited(e.target.checked)}
              className="rounded"
            />
            Use this edited version in final PDF
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Edit"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : pair.editedQuestion ? (
        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
            Edited Version
          </p>
          <p className="text-sm text-blue-900">{pair.editedQuestion}</p>
          {pair.editedAnswer && (
            <p className="text-sm text-blue-700 mt-1">{pair.editedAnswer}</p>
          )}
        </div>
      ) : null}

      {/* Action buttons */}
      {!isLocked && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => setEditMode((v) => !v)}
            className="text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            {editMode ? "Cancel Edit" : "Edit"}
          </button>
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isFlagged: !pair.isFlagged })
            }
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              pair.isFlagged
                ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                : "border-gray-200 text-gray-600 hover:bg-red-50"
            }`}
          >
            {pair.isFlagged ? "Unflag" : "⚑ Flag"}
          </button>
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isApproved: !pair.isApproved })
            }
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              pair.isApproved
                ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                : "border-gray-200 text-gray-600 hover:bg-green-50"
            }`}
          >
            {pair.isApproved ? "✓ Approved" : "Approve"}
          </button>
          <button
            onClick={() => onSelectForComment(witnessId, pair._id)}
            className="text-xs text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md hover:bg-gray-50 transition-colors ml-auto"
          >
            💬 {pair.comments?.length || 0}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main review page ──────────────────────────────────────────────────────
export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWitness, setActiveWitness] = useState(null);
  const [commentTarget, setCommentTarget] = useState(null); // { witnessId, qaId }
  const [actionLoading, setActionLoading] = useState(false);
  const [changesNote, setChangesNote] = useState("");
  const [showChangesModal, setShowChangesModal] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}`);
      setExam(data.exam);
      if (data.exam.witnesses?.length > 0 && !activeWitness) {
        setActiveWitness(data.exam.witnesses[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  // ── Start review ────────────────────────────────────────────────────────
  const handleStartReview = async () => {
    setActionLoading(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/start-review`, {
        method: "POST",
        body: "{}",
      });
      setExam((p) => ({ ...p, status: data.exam.status }));
      toast.success("Review started.");
    } catch (err) {
      toast.error(err.message || "Failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Approve ─────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (
      !confirm("Approve this cross-examination? This will lock the document.")
    )
      return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/cross-exams/${id}/approve`, {
        method: "POST",
        body: "{}",
      });
      toast.success("Approved and locked!");
      router.push("/cross-exams");
    } catch (err) {
      toast.error(err.message || "Failed.");
      setActionLoading(false);
    }
  };

  // ── Request changes ─────────────────────────────────────────────────────
  const handleRequestChanges = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/cross-exams/${id}/request-changes`, {
        method: "POST",
        body: JSON.stringify({ notes: changesNote }),
      });
      toast.success("Changes requested.");
      setShowChangesModal(false);
      router.push("/cross-exams");
    } catch (err) {
      toast.error(err.message || "Failed.");
      setActionLoading(false);
    }
  };

  // ── Update QA ────────────────────────────────────────────────────────────
  const handleUpdateQA = async (wId, qaId, payload) => {
    const data = await apiFetch(
      `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/edit`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
    setExam((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((p) => (p._id === qaId ? data.qaPair : p)),
            }
          : w,
      ),
    }));
  };

  // ── Flag / approve QA ────────────────────────────────────────────────────
  const handleFlag = async (wId, qaId, payload) => {
    const data = await apiFetch(
      `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/flag`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    setExam((prev) => ({
      ...prev,
      witnesses: prev.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((p) => (p._id === qaId ? data.qaPair : p)),
            }
          : w,
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!exam) return <div className="p-6 text-red-500">Not found.</div>;

  const currentWitness = exam.witnesses?.find((w) => w._id === activeWitness);
  const commentWitness = commentTarget
    ? exam.witnesses?.find((w) => w._id === commentTarget.witnessId)
    : null;
  const commentQaPair = commentWitness?.qaPairs?.find(
    (p) => p._id === commentTarget?.qaId,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link
            href="/cross-exams"
            className="text-gray-400 hover:text-gray-600"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-sm">
            {exam.title}
          </h1>
          <StatusBadge status={exam.status} />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/cross-exams/${id}/compare`}
            className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Version History
          </Link>
          {exam.status === "submitted" && (
            <button
              onClick={handleStartReview}
              disabled={actionLoading}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-60"
            >
              Start Review
            </button>
          )}
          {exam.status === "in_review" && (
            <>
              <button
                onClick={() => setShowChangesModal(true)}
                disabled={actionLoading}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
              >
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-60"
              >
                Approve ✓
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Witness list */}
        <aside className="w-52 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
          <p className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200">
            Witnesses
          </p>
          {(exam.witnesses || []).map((w) => {
            const flaggedCount = w.qaPairs.filter((p) => p.isFlagged).length;
            const approvedCount = w.qaPairs.filter((p) => p.isApproved).length;
            const total = w.qaPairs.length;
            return (
              <button
                key={w._id}
                onClick={() => setActiveWitness(w._id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                  activeWitness === w._id
                    ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {w.witnessName}
                </p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  {w.witnessType}
                </p>
                <div className="flex gap-2 mt-1">
                  {flaggedCount > 0 && (
                    <span className="text-xs text-red-600">
                      ⚑ {flaggedCount}
                    </span>
                  )}
                  {approvedCount > 0 && (
                    <span className="text-xs text-green-600">
                      ✓ {approvedCount}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{total} Q</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Column 2: QA pairs */}
        <main className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentWitness ? (
            currentWitness.qaPairs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No QA pairs for this witness yet.</p>
              </div>
            ) : (
              currentWitness.qaPairs
                .sort((a, b) => a.sequence - b.sequence)
                .map((pair) => (
                  <ReviewQAPair
                    key={pair._id}
                    pair={pair}
                    witnessId={currentWitness._id}
                    examId={id}
                    isLocked={exam.isLocked}
                    onUpdate={handleUpdateQA}
                    onFlag={handleFlag}
                    onSelectForComment={(wId, qaId) =>
                      setCommentTarget({ witnessId: wId, qaId })
                    }
                  />
                ))
            )
          ) : (
            <div className="text-center py-12 text-gray-400">
              Select a witness to view QA pairs.
            </div>
          )}
        </main>

        {/* Column 3: Comment thread */}
        <aside className="w-72 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          {commentTarget && commentQaPair ? (
            <CommentThread
              examId={id}
              witnessId={commentTarget.witnessId}
              qaPair={commentQaPair}
              onClose={() => setCommentTarget(null)}
              onCommentAdded={(comment) => {
                setExam((prev) => ({
                  ...prev,
                  witnesses: prev.witnesses.map((w) =>
                    w._id === commentTarget.witnessId
                      ? {
                          ...w,
                          qaPairs: w.qaPairs.map((p) =>
                            p._id === commentTarget.qaId
                              ? { ...p, comments: [...p.comments, comment] }
                              : p,
                          ),
                        }
                      : w,
                  ),
                }));
              }}
              onCommentResolved={(commentId, resolved) => {
                setExam((prev) => ({
                  ...prev,
                  witnesses: prev.witnesses.map((w) =>
                    w._id === commentTarget.witnessId
                      ? {
                          ...w,
                          qaPairs: w.qaPairs.map((p) =>
                            p._id === commentTarget.qaId
                              ? {
                                  ...p,
                                  comments: p.comments.map((c) =>
                                    c._id === commentId
                                      ? { ...c, resolved }
                                      : c,
                                  ),
                                }
                              : p,
                          ),
                        }
                      : w,
                  ),
                }));
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
              <svg
                className="w-8 h-8 mb-2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">
                Click the 💬 button on a QA pair to view comments.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Request changes modal */}
      {showChangesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Request Changes
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Provide overall revision notes. You can also flag individual QA
              pairs above.
            </p>
            <textarea
              rows={4}
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              placeholder="Describe the changes needed…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleRequestChanges}
                disabled={actionLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-60"
              >
                Send to Junior
              </button>
              <button
                onClick={() => setShowChangesModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";

// --- Tiny status pill ─---
function Pill({ children, color }) {
  const map = {
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.slate}`}
    >
      {children}
    </span>
  );
}

// --- QA pair for review ---
function ReviewCard({
  pair,
  witnessId,
  examId,
  isLocked,
  onUpdate,
  onFlag,
  onDelete,
  onSelectComment,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedQ, setEditedQ] = useState(pair.editedQuestion || "");
  const [editedA, setEditedA] = useState(pair.editedAnswer || "");
  const [useEdited, setUseEdited] = useState(pair.useEditedVersion || false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(witnessId, pair._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await onUpdate(witnessId, pair._id, {
        editedQuestion: editedQ,
        editedAnswer: editedA,
        useEditedVersion: useEdited,
      });
      setEditMode(false);
      toast.success("Edit saved.");
    } finally {
      setSaving(false);
    }
  };

  const borderClass = pair.isApproved
    ? "border-l-emerald-400"
    : pair.isFlagged
      ? "border-l-red-400"
      : "border-l-slate-200";
  const bgClass = pair.isApproved
    ? "bg-emerald-50/40"
    : pair.isFlagged
      ? "bg-red-50/40"
      : "bg-white";

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${borderClass} ${bgClass} p-4 transition-all`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Q{pair.sequence}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {pair.isFlagged && <Pill color="red">⚑ Flagged</Pill>}
          {pair.isApproved && <Pill color="green">✓ Approved</Pill>}
          {pair.useEditedVersion && <Pill color="blue">Edited active</Pill>}
          {pair.comments?.length > 0 && (
            <span className="text-[10px] text-slate-400">
              💬 {pair.comments.length}
            </span>
          )}
        </div>
      </div>

      {/* Original */}
      <div className="mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
          Original Question
        </p>
        <p className="text-sm text-slate-800 font-medium leading-relaxed">
          {pair.originalQuestion || (
            <em className="text-slate-400 font-normal">—</em>
          )}
        </p>
        {pair.originalAnswer && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {pair.originalAnswer}
          </p>
        )}
      </div>

      {/* Senior edit area */}
      {!isLocked && editMode ? (
        <div className="mt-3 space-y-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-[10px] font-bold text-indigo-600 uppercase">
            Your Inline Edit
          </p>
          <textarea
            rows={2}
            value={editedQ}
            onChange={(e) => setEditedQ(e.target.value)}
            placeholder="Edited question…"
            className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
          />
          <textarea
            rows={2}
            value={editedA}
            onChange={(e) => setEditedA(e.target.value)}
            placeholder="Edited answer / expected response…"
            className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
          />
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useEdited}
              onChange={(e) => setUseEdited(e.target.checked)}
              className="rounded border-slate-300"
            />
            Use this version in final PDF
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 font-semibold"
            >
              {saving ? "Saving…" : "Save Edit"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : pair.editedQuestion ? (
        <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">
            Your Edit {pair.useEditedVersion ? "(active in PDF)" : "(inactive)"}
          </p>
          <p className="text-sm text-blue-900 font-medium">
            {pair.editedQuestion}
          </p>
          {pair.editedAnswer && (
            <p className="text-xs text-blue-700 mt-1">{pair.editedAnswer}</p>
          )}
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
        {!isLocked && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className="text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            {editMode ? "Cancel" : "✏️ Edit"}
          </button>
        )}
        {!isLocked && (
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isFlagged: !pair.isFlagged })
            }
            className={`text-[11px] px-2.5 py-1.5 border rounded-lg font-medium transition-colors ${
              pair.isFlagged
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            }`}
          >
            {pair.isFlagged ? "× Unflag" : "⚑ Flag"}
          </button>
        )}
        {!isLocked && (
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isApproved: !pair.isApproved })
            }
            className={`text-[11px] px-2.5 py-1.5 border rounded-lg font-medium transition-colors ${
              pair.isApproved
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
            }`}
          >
            {pair.isApproved ? "✓ Approved" : "✓ Approve"}
          </button>
        )}
        <button
          onClick={() => onSelectComment(witnessId, pair._id)}
          className="ml-auto text-[11px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
        >
          💬 Comment{" "}
          {pair.comments?.length > 0 ? `(${pair.comments.length})` : ""}
        </button>

        {pair.isApproved &&
          (confirmDelete ? (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-[11px] text-red-600 font-semibold">
                Delete?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-60 transition-colors"
              >
                {deleting ? "…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] px-2 py-1.5 text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[11px] px-2.5 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-300 font-medium transition-colors"
            >
              🗑 Delete
            </button>
          ))}
      </div>
    </div>
  );
}

// --- Comment thread (right column) ---
function CommentPanel({
  examId,
  witnessId,
  qaPair,
  onClose,
  onCommentAdded,
  onCommentResolved,
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const post = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const data = await apiFetch(
        `/api/cross-exams/${examId}/witnesses/${witnessId}/qa/${qaPair._id}/comment`,
        {
          method: "POST",
          body: JSON.stringify({
            text: text.trim(),
            parentComment: null,
          }),
        },
      );
      onCommentAdded(data.comment);
      setText("");
    } catch {
      toast.error("Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  const resolve = async (commentId, resolved) => {
    try {
      await apiFetch(
        `/api/cross-exams/${examId}/witnesses/${witnessId}/qa/${qaPair._id}/comment`,
        {
          method: "PUT",
          body: JSON.stringify({ commentId, resolved }),
        },
      );
      onCommentResolved(commentId, resolved);
    } catch {
      toast.error("Failed.");
    }
  };

  const topLevel = (qaPair.comments || []).filter((c) => !c.parentComment);
  const replies = (qaPair.comments || []).filter((c) => c.parentComment);
  const getReplies = (parentId) =>
    replies.filter((r) => r.parentComment?.toString() === parentId?.toString());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Comments
          </p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">
            Q{qaPair.sequence}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {topLevel.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-40"
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
            <p className="text-sm">No comments yet.</p>
          </div>
        )}
        {topLevel.map((c) => (
          <div key={c._id}>
            <div
              className={`rounded-xl p-3 border ${c.resolved ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 bg-white"}`}
            >
              <p className="text-sm text-slate-800 leading-relaxed">{c.text}</p>
              <div className="flex items-center justify-between mt-2 gap-2">
                <p className="text-[10px] text-slate-400">
                  {c.author?.name || "Unknown"} ·{" "}
                  {c.createdAt
                    ? format(new Date(c.createdAt), "dd MMM HH:mm")
                    : ""}
                </p>
                <button
                  onClick={() => resolve(c._id, !c.resolved)}
                  className={`text-[10px] font-medium ${c.resolved ? "text-slate-400 hover:text-slate-600" : "text-emerald-600 hover:text-emerald-800"}`}
                >
                  {c.resolved ? "↩ Reopen" : "✓ Resolve"}
                </button>
              </div>
            </div>
            {getReplies(c._id).map((r) => (
              <div
                key={r._id}
                className={`ml-4 mt-1.5 rounded-xl p-3 border border-l-2 border-l-indigo-400 ${r.resolved ? "bg-slate-50 border-slate-100 opacity-60" : "bg-indigo-50/60 border-indigo-100"}`}
              >
                <p className="text-xs text-slate-700 leading-relaxed">
                  {r.text}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold text-indigo-500">
                    {r.author?.name || "Junior"}
                  </span>
                  {r.createdAt && (
                    <span className="text-[10px] text-slate-400">
                      · {format(new Date(r.createdAt), "dd MMM HH:mm")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Input — senior posts new top-level comments */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex-shrink-0">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment… (Ctrl+Enter to submit)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none mb-2"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") post();
          }}
        />
        <button
          onClick={post}
          disabled={posting || !text.trim()}
          className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {posting ? "Posting…" : "Post Comment"}
        </button>
      </div>
    </div>
  );
}

// --- Main review page ---
export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWitness, setActiveWitness] = useState(null);
  const [commentTarget, setCommentTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [changesNote, setChangesNote] = useState("");
  const [showChanges, setShowChanges] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}`);
      setExam(data.exam);
      if (data.exam.witnesses?.length > 0 && !activeWitness)
        setActiveWitness(data.exam.witnesses[0]._id);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const handleStartReview = async () => {
    setBusy(true);
    try {
      const d = await apiFetch(`/api/cross-exams/${id}/start-review`, {
        method: "POST",
        body: "{}",
      });
      setExam((p) => ({ ...p, status: d.exam.status }));
      toast.success("Review started.");
    } catch (err) {
      toast.error(err.message || "Failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Approve this document? It will be locked permanently."))
      return;
    setBusy(true);
    try {
      await apiFetch(`/api/cross-exams/${id}/approve`, {
        method: "POST",
        body: "{}",
      });
      toast.success("Approved and locked!");
      router.push("/cross-exams");
    } catch (err) {
      toast.error(err.message || "Failed.");
      setBusy(false);
    }
  };

  const handleRequestChanges = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/cross-exams/${id}/request-changes`, {
        method: "POST",
        body: JSON.stringify({ notes: changesNote }),
      });
      toast.success("Changes requested. Junior will be notified.");
      setShowChanges(false);
      router.push("/cross-exams");
    } catch (err) {
      toast.error(err.message || "Failed.");
      setBusy(false);
    }
  };

  const handleUpdateQA = async (wId, qaId, payload) => {
    const data = await apiFetch(
      `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/edit`,
      { method: "PUT", body: JSON.stringify(payload) },
    );
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((q) => (q._id === qaId ? data.qaPair : q)),
            }
          : w,
      ),
    }));
  };

  const handleFlag = async (wId, qaId, payload) => {
    const data = await apiFetch(
      `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/flag`,
      { method: "POST", body: JSON.stringify(payload) },
    );
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((q) => (q._id === qaId ? data.qaPair : q)),
            }
          : w,
      ),
    }));
  };

  const handleDeleteQA = async (wId, qaId) => {
    try {
      await apiFetch(
        `/api/cross-exams/${id}/witnesses/${wId}/qa/${qaId}/delete`,
        { method: "DELETE" },
      );
      setExam((p) => ({
        ...p,
        witnesses: p.witnesses.map((w) =>
          w._id === wId
            ? { ...w, qaPairs: w.qaPairs.filter((q) => q._id !== qaId) }
            : w,
        ),
      }));
      toast.success("QA pair deleted.");
    } catch (err) {
      toast.error(err.message || "Failed to delete QA pair.");
    }
  };

  const updateCommentInState = (wId, qaId, fn) => {
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((q) =>
                q._id === qaId ? { ...q, comments: fn(q.comments) } : q,
              ),
            }
          : w,
      ),
    }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!exam) return <div className="p-8 text-red-500">Not found.</div>;

  const currentWitness = exam.witnesses?.find((w) => w._id === activeWitness);
  const commentWitness = commentTarget
    ? exam.witnesses?.find((w) => w._id === commentTarget.witnessId)
    : null;
  const commentQaPair = commentWitness?.qaPairs?.find(
    (p) => p._id === commentTarget?.qaId,
  );

  const statusColors = {
    submitted: "bg-blue-50 text-blue-700",
    in_review: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* ── Top bar --- */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/cross-exams"
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          <h1
            className="font-bold text-slate-800 truncate max-w-xs text-sm"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {exam.title}
          </h1>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[exam.status] || "bg-slate-100 text-slate-600"}`}
          >
            {exam.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/cross-exams/${id}/compare`}
            className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Version History
          </Link>
          {exam.status === "submitted" && (
            <button
              onClick={handleStartReview}
              disabled={busy}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors"
            >
              {busy ? "…" : "Start Review →"}
            </button>
          )}
          {exam.status === "in_review" && (
            <>
              <button
                onClick={() => setShowChanges(true)}
                disabled={busy}
                className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors"
              >
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-bold disabled:opacity-60 transition-colors"
              >
                Approve ✓
              </button>
            </>
          )}
        </div>
      </div>

      {/*--- 3-column body --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1 — Witness list */}
        <aside className="w-56 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
          <p className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            Witnesses
          </p>
          {(exam.witnesses || []).length === 0 ? (
            <p className="px-4 py-6 text-xs text-slate-400 italic">
              No witnesses.
            </p>
          ) : (
            exam.witnesses.map((w) => {
              const fl = w.qaPairs.filter((p) => p.isFlagged).length;
              const ap = w.qaPairs.filter((p) => p.isApproved).length;
              const isActive = activeWitness === w._id;
              return (
                <button
                  key={w._id}
                  onClick={() => setActiveWitness(w._id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-colors ${
                    isActive
                      ? "bg-slate-900 border-l-2 border-l-amber-400"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 ${isActive ? "text-white" : "text-slate-800"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isActive ? "bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-600"}`}
                    >
                      {w.witnessName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {w.witnessName}
                    </span>
                  </div>
                  <div className="flex gap-2 pl-8">
                    {fl > 0 && (
                      <span className="text-[10px] text-red-500">⚑{fl}</span>
                    )}
                    {ap > 0 && (
                      <span className="text-[10px] text-emerald-500">
                        ✓{ap}
                      </span>
                    )}
                    <span
                      className={`text-[10px] ${isActive ? "text-slate-400" : "text-slate-400"}`}
                    >
                      {w.qaPairs.length}Q
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* Column 2 — QA pairs */}
        <main className="flex-1 overflow-y-auto p-5 space-y-3">
          {!currentWitness ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a witness from the left panel.
            </div>
          ) : currentWitness.qaPairs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No Q&A pairs for this witness.
            </div>
          ) : (
            currentWitness.qaPairs
              .sort((a, b) => a.sequence - b.sequence)
              .map((pair) => (
                <ReviewCard
                  key={pair._id}
                  pair={pair}
                  witnessId={currentWitness._id}
                  examId={id}
                  isLocked={exam.isLocked}
                  onUpdate={handleUpdateQA}
                  onFlag={handleFlag}
                  onDelete={handleDeleteQA}
                  onSelectComment={(wId, qaId) =>
                    setCommentTarget({ witnessId: wId, qaId })
                  }
                />
              ))
          )}
        </main>

        {/* Column 3 — Comments */}
        <aside
          className={`border-l border-slate-200 bg-white flex-shrink-0 transition-all duration-200 ${commentQaPair ? "w-72" : "w-16"}`}
        >
          {commentQaPair ? (
            <CommentPanel
              examId={id}
              witnessId={commentTarget.witnessId}
              qaPair={commentQaPair}
              onClose={() => setCommentTarget(null)}
              onCommentAdded={(c) =>
                updateCommentInState(
                  commentTarget.witnessId,
                  commentTarget.qaId,
                  (cs) => [...cs, c],
                )
              }
              onCommentResolved={(cId, resolved) =>
                updateCommentInState(
                  commentTarget.witnessId,
                  commentTarget.qaId,
                  (cs) =>
                    cs.map((c) => (c._id === cId ? { ...c, resolved } : c)),
                )
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300 px-2">
              <svg
                className="w-5 h-5"
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
              <p
                className="text-[10px] text-center leading-tight writing-mode-vertical"
                style={{ writingMode: "vertical-rl" }}
              >
                Comments
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Request changes modal */}
      {showChanges && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Request Changes
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                The junior will see your note alongside all flagged Q&A pairs.
              </p>
            </div>
            <div className="px-6 py-5">
              <textarea
                rows={4}
                value={changesNote}
                onChange={(e) => setChangesNote(e.target.value)}
                placeholder="Describe the overall revisions needed…"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRequestChanges}
                  disabled={busy}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  Send to Junior
                </button>
                <button
                  onClick={() => setShowChanges(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

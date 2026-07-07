"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import {
  ChevronLeft,
  CheckCircle,
  Flag,
  Edit3,
  MessageCircle,
  Trash2,
  X,
  Send,
  Users,
  FileText,
  Clock,
  RotateCcw,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";

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
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[color] || map.slate}`}
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
    ? "border-l-[#0e9185]"
    : pair.isFlagged
      ? "border-l-[#026665]"
      : "border-l-[#9fd8d1]";
  const bgClass = pair.isApproved
    ? "bg-gradient-to-r from-[#eef5f3] to-white"
    : pair.isFlagged
      ? "bg-gradient-to-r from-[#eef5f3] to-white"
      : "bg-white";

  return (
    <div
      className={`rounded-2xl border border-[#9fd8d1]/30 border-l-4 ${borderClass} ${bgClass} p-5 transition-all duration-200 hover:shadow-md`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-[#026665] uppercase tracking-widest bg-[#eef5f3] px-3 py-1 rounded-full">
          Q{pair.sequence}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {pair.isFlagged && <Pill color="red">⚑ Flagged</Pill>}
          {pair.isApproved && <Pill color="green">✓ Approved</Pill>}
          {pair.useEditedVersion && <Pill color="blue">Edited active</Pill>}
          {pair.comments?.length > 0 && (
            <span className="text-[10px] text-[#0e9185] bg-[#eef5f3] px-2 py-1 rounded-full flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {pair.comments.length}
            </span>
          )}
        </div>
      </div>

      {/* Original */}
      <div className="mb-3">
        <p className="text-[10px] font-bold text-[#0e9185] uppercase tracking-wide mb-1">
          Original Question
        </p>
        <p className="text-sm text-[#026665] font-medium leading-relaxed">
          {pair.originalQuestion || (
            <em className="text-[#9fd8d1] font-normal">—</em>
          )}
        </p>
        {pair.originalAnswer && (
          <p className="text-xs text-[#0e9185] mt-1 leading-relaxed">
            {pair.originalAnswer}
          </p>
        )}
      </div>

      {/* Senior edit area */}
      {!isLocked && editMode ? (
        <div className="mt-3 space-y-2 p-4 bg-[#eef5f3] rounded-2xl border border-[#9fd8d1]/40">
          <p className="text-[10px] font-bold text-[#026665] uppercase tracking-wide">
            Your Inline Edit
          </p>
          <textarea
            rows={2}
            value={editedQ}
            onChange={(e) => setEditedQ(e.target.value)}
            placeholder="Edited question…"
            className="w-full border border-[#9fd8d1]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent resize-none bg-white"
          />
          <textarea
            rows={2}
            value={editedA}
            onChange={(e) => setEditedA(e.target.value)}
            placeholder="Edited answer / expected response…"
            className="w-full border border-[#9fd8d1]/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent resize-none bg-white"
          />
          <label className="flex items-center gap-2 text-xs text-[#026665] cursor-pointer">
            <input
              type="checkbox"
              checked={useEdited}
              onChange={(e) => setUseEdited(e.target.checked)}
              className="rounded border-[#9fd8d1] accent-[#026665]"
            />
            Use this version in final PDF
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="text-xs bg-[#026665] hover:bg-[#0e9185] text-white px-4 py-2 rounded-xl disabled:opacity-60 font-semibold transition-colors"
            >
              {saving ? "Saving…" : "Save Edit"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-[#0e9185] hover:text-[#026665] px-2 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : pair.editedQuestion ? (
        <div className="mt-3 p-4 rounded-2xl bg-[#eef5f3] border border-[#9fd8d1]/40">
          <p className="text-[10px] font-bold text-[#0e9185] uppercase mb-1">
            Your Edit {pair.useEditedVersion ? "(active in PDF)" : "(inactive)"}
          </p>
          <p className="text-sm text-[#026665] font-medium">
            {pair.editedQuestion}
          </p>
          {pair.editedAnswer && (
            <p className="text-xs text-[#0e9185] mt-1">{pair.editedAnswer}</p>
          )}
        </div>
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#9fd8d1]/20">
        {!isLocked && (
          <button
            onClick={() => setEditMode((v) => !v)}
            className="text-[11px] px-3 py-1.5 border border-[#9fd8d1]/40 rounded-xl text-[#026665] hover:bg-[#eef5f3] font-medium transition-all duration-200 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {editMode ? "Cancel" : "Edit"}
          </button>
        )}
        {!isLocked && (
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isFlagged: !pair.isFlagged })
            }
            className={`text-[11px] px-3 py-1.5 border rounded-xl font-medium transition-all duration-200 flex items-center gap-1 ${
              pair.isFlagged
                ? "bg-[#026665] border-[#026665] text-white hover:bg-[#0e9185]"
                : "border-[#9fd8d1]/40 text-[#026665] hover:bg-[#eef5f3]"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            {pair.isFlagged ? "Unflag" : "Flag"}
          </button>
        )}
        {!isLocked && (
          <button
            onClick={() =>
              onFlag(witnessId, pair._id, { isApproved: !pair.isApproved })
            }
            className={`text-[11px] px-3 py-1.5 border rounded-xl font-medium transition-all duration-200 flex items-center gap-1 ${
              pair.isApproved
                ? "bg-[#0e9185] border-[#0e9185] text-white hover:bg-[#026665]"
                : "border-[#9fd8d1]/40 text-[#026665] hover:bg-[#eef5f3]"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {pair.isApproved ? "Approved" : "Approve"}
          </button>
        )}
        <button
          onClick={() => onSelectComment(witnessId, pair._id)}
          className="ml-auto text-[11px] px-3 py-1.5 border border-[#9fd8d1]/40 rounded-xl text-[#0e9185] hover:bg-[#eef5f3] transition-all duration-200 flex items-center gap-1"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Comment {pair.comments?.length > 0 ? `(${pair.comments.length})` : ""}
        </button>

        {pair.isApproved &&
          (confirmDelete ? (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[11px] text-[#026665] font-semibold">
                Delete?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-60 transition-colors"
              >
                {deleting ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[11px] px-2 py-1.5 text-[#0e9185] hover:text-[#026665]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[11px] px-3 py-1.5 border border-red-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-300 font-medium transition-all duration-200 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef5f3] bg-[#eef5f3]/30 flex-shrink-0">
        <div>
          <p className="text-[10px] font-bold text-[#0e9185] uppercase tracking-wide">
            Comments
          </p>
          <p className="text-sm font-bold text-[#026665] mt-0.5">
            Q{qaPair.sequence}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#9fd8d1] hover:text-[#026665] w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#eef5f3] transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {topLevel.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#eef5f3] flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-8 h-8 text-[#9fd8d1]" />
            </div>
            <p className="text-sm text-[#000000] font-medium">No comments yet</p>
            <p className="text-xs text-[#000000] mt-1">
              Start the conversation
            </p>
          </div>
        )}
        {topLevel.map((c) => (
          <div key={c._id}>
            <div
              className={`rounded-2xl p-4 border ${
                c.resolved
                  ? "border-[#9fd8d1]/30 bg-[#eef5f3]/50 opacity-70"
                  : "border-[#9fd8d1]/40 bg-white shadow-sm"
              }`}
            >
              <p className="text-sm text-[#026665] leading-relaxed">{c.text}</p>
              <div className="flex items-center justify-between mt-2.5 gap-2">
                <p className="text-[10px] text-[#0e9185]">
                  {c.author?.name || "Unknown"} ·{" "}
                  {c.createdAt
                    ? format(new Date(c.createdAt), "dd MMM HH:mm")
                    : ""}
                </p>
                <button
                  onClick={() => resolve(c._id, !c.resolved)}
                  className={`text-[10px] font-medium px-2 py-1 rounded-full transition-colors ${
                    c.resolved
                      ? "text-[#9fd8d1] hover:text-[#0e9185] bg-[#eef5f3]"
                      : "text-[#0e9185] hover:text-[#026665] bg-[#eef5f3]"
                  }`}
                >
                  {c.resolved ? "↩ Reopen" : "✓ Resolve"}
                </button>
              </div>
            </div>
            {getReplies(c._id).map((r) => (
              <div
                key={r._id}
                className={`ml-5 mt-2 rounded-2xl p-4 border-l-4 ${
                  r.resolved
                    ? "border-[#9fd8d1]/30 bg-[#eef5f3]/30"
                    : "border-[#0e9185] bg-[#eef5f3]/50"
                }`}
              >
                <p className="text-sm text-[#026665] leading-relaxed">
                  {r.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-semibold text-[#0e9185]">
                    {r.author?.name || "Junior"}
                  </span>
                  {r.createdAt && (
                    <span className="text-[10px] text-[#9fd8d1]">
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
      <div className="px-5 pb-5 pt-3 border-t border-[#eef5f3] flex-shrink-0">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment… (Ctrl+Enter to submit)"
          className="w-full border border-[#9fd8d1]/40 rounded-2xl px-4 py-3 text-sm text-[#026665] placeholder-[#9fd8d1] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent resize-none mb-2.5 bg-[#eef5f3]/30"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") post();
          }}
        />
        <button
          onClick={post}
          disabled={posting || !text.trim()}
          className="w-full bg-[#026665] hover:bg-[#0e9185] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {posting ? "Posting…" : <><Send className="w-4 h-4" /> Post Comment</>}
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
      if (data.exam.witnesses?.length > 0) {
        setActiveWitness((current) => current || data.exam.witnesses[0]._id);
      }
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
      <div className="flex items-center justify-center h-screen bg-[#eef5f3]">
        <div className="w-12 h-12 border-4 border-[#026665] border-t-transparent rounded-full animate-spin" />
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
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    in_review: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const statusIcons = {
    submitted: <Clock className="w-4 h-4" />,
    in_review: <AlertCircle className="w-4 h-4" />,
    approved: <ThumbsUp className="w-4 h-4" />,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#eef5f3]">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#9fd8d1]/30 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/cross-exams"
            className="text-[#9fd8d1] hover:text-[#026665] transition-colors p-1.5 rounded-xl hover:bg-[#eef5f3]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#026665] flex items-center justify-center shadow-md shadow-[#026665]/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="font-bold text-[#000000] truncate max-w-xs text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {exam.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-3 py-0.5 rounded-full border ${statusColors[exam.status] || "bg-slate-100 text-slate-600"}`}
                >
                  {exam.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-[10px] text-[#000000]">
                  {exam.witnesses?.length || 0} witnesses ·{" "}
                  {exam.witnesses?.reduce((acc, w) => acc + w.qaPairs.length, 0) || 0} questions
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/cross-exams/${id}/compare`}
            className="text-xs text-[#0e9185] border border-[#9fd8d1]/40 px-4 py-2 rounded-xl hover:bg-[#eef5f3] transition-all duration-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Version History
          </Link>
          {exam.status === "submitted" && (
            <button
              onClick={handleStartReview}
              disabled={busy}
              className="text-xs bg-[#026665] hover:bg-[#0e9185] text-white px-5 py-2 rounded-xl font-bold disabled:opacity-60 transition-all duration-200 shadow-md shadow-[#026665]/20 hover:shadow-lg hover:shadow-[#026665]/30 flex items-center gap-1.5"
            >
              {busy ? "…" : "Start Review →"}
            </button>
          )}
          {exam.status === "in_review" && (
            <>
              <button
                onClick={() => setShowChanges(true)}
                disabled={busy}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-60 transition-all duration-200 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={busy}
                className="text-xs bg-[#0e9185] hover:bg-[#026665] text-white px-5 py-2 rounded-xl font-bold disabled:opacity-60 transition-all duration-200 shadow-md shadow-[#0e9185]/20 hover:shadow-lg flex items-center gap-1.5"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/*--- 3-column body --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1 — Witness list */}
        <aside className="w-64 border-r border-[#9fd8d1]/30 bg-white overflow-y-auto flex-shrink-0">
          <div className="px-4 py-4 border-b border-[#eef5f3] bg-[#eef5f3]/30">
            <p className="text-[10px] font-bold text-[#0e9185] uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Witnesses
            </p>
          </div>
          {(exam.witnesses || []).length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-xs text-[#9fd8d1] italic">No witnesses.</p>
            </div>
          ) : (
            exam.witnesses.map((w) => {
              const fl = w.qaPairs.filter((p) => p.isFlagged).length;
              const ap = w.qaPairs.filter((p) => p.isApproved).length;
              const isActive = activeWitness === w._id;
              return (
                <button
                  key={w._id}
                  onClick={() => setActiveWitness(w._id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-[#eef5f3] transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#026665] to-[#0e9185] border-l-4 border-l-[#9fd8d1]"
                      : "hover:bg-[#eef5f3]"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2.5 mb-1.5 ${
                      isActive ? "text-white" : "text-[#026665]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#eef5f3] text-[#026665]"
                      }`}
                    >
                      {w.witnessName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {w.witnessName}
                    </span>
                  </div>
                  <div className="flex gap-3 pl-11">
                    {fl > 0 && (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1">
                        <Flag className="w-3 h-3" /> {fl}
                      </span>
                    )}
                    {ap > 0 && (
                      <span className="text-[10px] text-[#0e9185] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {ap}
                      </span>
                    )}
                    <span
                      className={`text-[10px] ${
                        isActive ? "text-white/70" : "text-[#9fd8d1]"
                      }`}
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
        <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#eef5f3]/30">
          {!currentWitness ? (
            <div className="flex flex-col items-center justify-center h-full text-[#9fd8d1]">
              <Users className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Select a witness</p>
              <p className="text-xs">from the left panel to review Q&A</p>
            </div>
          ) : currentWitness.qaPairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#9fd8d1]">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No Q&A pairs</p>
              <p className="text-xs">This witness has no questions yet</p>
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
          className={`border-l border-[#9fd8d1]/30 bg-white flex-shrink-0 transition-all duration-300 ${
            commentQaPair ? "w-80" : "w-16"
          }`}
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
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#9fd8d1] px-2">
              <div className="w-12 h-12 rounded-2xl bg-[#eef5f3] flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <p
                className="text-[10px] text-center leading-tight font-medium text-[#0e9185]"
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
        <div className="fixed inset-0 bg-[#026665]/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-[#eef5f3] bg-gradient-to-r from-[#eef5f3] to-white">
              <h2 className="text-lg font-bold text-[#026665]">
                Request Changes
              </h2>
              <p className="text-xs text-[#0e9185] mt-1">
                The junior will see your note alongside all flagged Q&A pairs.
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="mb-4">
                <label className="text-xs font-bold text-[#026665] uppercase tracking-wider">
                  Revision Notes
                </label>
                <textarea
                  rows={4}
                  value={changesNote}
                  onChange={(e) => setChangesNote(e.target.value)}
                  placeholder="Describe the overall revisions needed…"
                  className="w-full border border-[#9fd8d1]/40 rounded-2xl px-4 py-3 text-sm text-[#026665] placeholder-[#9fd8d1] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent resize-none mt-1.5 bg-[#eef5f3]/30"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRequestChanges}
                  disabled={busy}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 transition-colors duration-200 shadow-md shadow-amber-500/20"
                >
                  {busy ? "Sending…" : "Send to Junior"}
                </button>
                <button
                  onClick={() => setShowChanges(false)}
                  className="flex-1 bg-[#eef5f3] hover:bg-[#9fd8d1]/30 text-[#026665] font-bold py-3 rounded-xl text-sm transition-colors duration-200"
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
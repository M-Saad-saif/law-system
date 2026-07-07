"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { apiFetch } from "@/utils/api";
import {
  BookMarked,
  Calendar,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  Flag,
  Check,
  Edit3,
  Trash2,
  Eye,
  Send,
  AlertCircle,
  CheckCircle,
  Activity,
  Archive,
  History,
  FileText,
  Users,
  Clock,
  ArrowLeft,
  Loader2,
  Sparkles,
  RefreshCw,
  Download,
  MoreVertical,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Zap,
  Play,
  Square,
  BarChart,
  GitBranch,
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
  Star,
  StarOff,
  Send as SendIcon,
  Inbox,
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
  PieChart,
  CalendarDays,
  FileCheck,
  FileX,
  Clock as ClockIcon,
  HelpCircle,
  Info,
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
const STATUS_STYLES = {
  draft: {
    bg: "bg-slate-100",
    text: "text-black",
    border: "border-slate-200",
    icon: Edit3,
  },
  submitted: {
    bg: "bg-blue-50",
    text: "text-black",
    border: "border-blue-200",
    icon: SendIcon,
  },
  in_review: {
    bg: "bg-amber-50",
    text: "text-black",
    border: "border-amber-200",
    icon: Eye,
  },
  changes_requested: {
    bg: "bg-orange-50",
    text: "text-black",
    border: "border-orange-200",
    icon: AlertCircle,
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-black",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  courtroom_active: {
    bg: "bg-red-50",
    text: "text-black",
    border: "border-red-200",
    icon: Activity,
  },
  archived: {
    bg: "bg-gray-100",
    text: "text-black",
    border: "border-gray-200",
    icon: Archive,
  },
};

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  courtroom_active: "Live in Court",
  archived: "Archived",
};

// --- Components ---

function StatusPill({ status, size = "sm" }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const Icon = style.icon;
  const sizeClasses =
    size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${style.bg} ${style.text} border ${style.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function AddWitnessModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    witnessName: "",
    witnessType: "prosecution",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.witnessName.trim()) {
      toast.error("Name required.");
      return;
    }
    setSaving(true);
    try {
      await onAdd(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#eef5f3]">
          <h2 className="text-base font-bold text-black">Add Witness</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1.5">
              Witness Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.witnessName}
              onChange={(e) =>
                setForm((f) => ({ ...f, witnessName: e.target.value }))
              }
              placeholder="e.g. Muhammad Tariq"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1.5">
              Type
            </label>
            <select
              value={form.witnessType}
              onChange={(e) =>
                setForm((f) => ({ ...f, witnessType: e.target.value }))
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-transparent bg-white transition-all"
            >
              <option value="prosecution">Prosecution</option>
              <option value="defense">Defense</option>
              <option value="expert">Expert</option>
              <option value="character">Character</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1.5">
              Role / Description
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Eyewitness present at scene"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#026665] hover:bg-[#0e9185] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all shadow-lg shadow-[#026665]/20 hover:shadow-[#026665]/30"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding…
                </span>
              ) : (
                "Add Witness"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitReviewModal({
  mode,
  reviewers,
  selectedReviewer,
  onReviewerChange,
  onClose,
  onConfirm,
  loadingReviewers,
  submitting,
}) {
  const isResubmit = mode === "resubmit";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-[#eef5f3]">
          <div>
            <h2 className="text-base font-bold text-black">
              {isResubmit ? "Resubmit For Review" : "Submit For Review"}
            </h2>
            <p className="text-xs text-black mt-0.5">
              {isResubmit
                ? "Send updated version for approval"
                : "Send for senior review"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-black hover:text-black w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-[#eef5f3] rounded-xl p-4 border border-[#9fd8d1]">
            <p className="text-sm text-black flex items-center gap-2">
              <Info className="w-4 h-4 text-black" />
              You can optionally assign a senior lawyer now, or leave it
              unassigned.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1.5">
              Senior Lawyer{" "}
              <span className="text-black font-normal normal-case">
                (Optional)
              </span>
            </label>
            <select
              value={selectedReviewer}
              onChange={(e) => onReviewerChange(e.target.value)}
              disabled={loadingReviewers || submitting}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-transparent bg-white disabled:opacity-60 transition-all"
            >
              <option value="">No preference (auto-assign later)</option>
              {reviewers.map((reviewer) => (
                <option key={reviewer._id} value={reviewer._id}>
                  {reviewer.name} ({reviewer.email})
                </option>
              ))}
            </select>
            {loadingReviewers && (
              <p className="mt-2 text-xs text-black flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading senior lawyers...
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 bg-[#026665] hover:bg-[#0e9185] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all shadow-lg shadow-[#026665]/20 hover:shadow-[#026665]/30"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isResubmit ? "Resubmitting..." : "Submitting..."}
              </span>
            ) : isResubmit ? (
              "Confirm Resubmit"
            ) : (
              "Confirm Submit"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AddQAForm({ witnessId, onAdd, onClose }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) {
      toast.error("Question required.");
      return;
    }
    setSaving(true);
    try {
      await onAdd(witnessId, {
        originalQuestion: q.trim(),
        originalAnswer: a.trim(),
      });
      setQ("");
      setA("");
      toast.success("Q&A pair added.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-[#eef5f3] rounded-xl border border-[#9fd8d1] space-y-3"
    >
      <textarea
        rows={2}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Question *"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] resize-none transition-all"
        required
      />
      <textarea
        rows={2}
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="Expected answer (optional)"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] resize-none transition-all"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#026665] hover:bg-[#0e9185] text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-60 transition-all shadow-md shadow-[#026665]/20"
        >
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Adding…
            </span>
          ) : (
            "Add Q&A"
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-black hover:text-black px-3 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ReviewerComments({
  comments,
  examId,
  witnessId,
  qaId,
  onCommentAdded,
}) {
  const [open, setOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  if (!comments || comments.length === 0) return null;

  const topLevel = comments.filter((c) => !c.parentComment);
  const getReplies = (parentId) =>
    comments.filter(
      (c) => c.parentComment?.toString() === parentId?.toString(),
    );

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      const data = await apiFetch(
        `/api/cross-exams/${examId}/witnesses/${witnessId}/qa/${qaId}/comment`,
        {
          method: "POST",
          body: JSON.stringify({
            text: replyText.trim(),
            parentComment: parentId,
          }),
        },
      );
      onCommentAdded(data.comment);
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply posted.");
    } catch {
      toast.error("Failed to post reply.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-orange-100/50 transition-colors"
      >
        <span className="text-[10px] font-bold text-black uppercase tracking-wide flex items-center gap-1.5">
          <MessageSquare className="w-3 h-3" />
          Reviewer Comments ({comments.length})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-black transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {topLevel.map((c) => (
            <div key={c._id}>
              <div
                className={`rounded-lg p-2.5 border ${
                  c.resolved
                    ? "bg-white/40 border-slate-100 opacity-50"
                    : "bg-white border-orange-200"
                }`}
              >
                <p className="text-xs text-black leading-relaxed">{c.text}</p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-black">
                      {c.author?.name || "Reviewer"}
                    </span>
                    {c.createdAt && (
                      <span className="text-[10px] text-black">
                        · {format(new Date(c.createdAt), "dd MMM HH:mm")}
                      </span>
                    )}
                    {c.resolved && (
                      <span className="text-[10px] text-black italic flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        resolved
                      </span>
                    )}
                  </div>
                  {!c.resolved && (
                    <button
                      onClick={() =>
                        setReplyingTo((prev) => (prev === c._id ? null : c._id))
                      }
                      className="text-[10px] font-semibold text-black hover:text-black transition-colors"
                    >
                      {replyingTo === c._id ? "Cancel" : "↩ Reply"}
                    </button>
                  )}
                </div>
              </div>

              {getReplies(c._id).map((r) => (
                <div
                  key={r._id}
                  className="ml-4 mt-1 rounded-lg p-2.5 border border-l-2 border-l-[#0e9185] bg-[#eef5f3] border-slate-100"
                >
                  <p className="text-xs text-black leading-relaxed">{r.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-black">
                      {r.author?.name || "You"}
                    </span>
                    {r.createdAt && (
                      <span className="text-[10px] text-black">
                        · {format(new Date(r.createdAt), "dd MMM HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {replyingTo === c._id && (
                <div className="ml-4 mt-1.5 p-2.5 bg-[#eef5f3] rounded-lg border border-[#9fd8d1]">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply…"
                    autoFocus
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#026665] resize-none bg-white transition-all"
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                        handleReply(c._id);
                    }}
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={() => handleReply(c._id)}
                      disabled={posting || !replyText.trim()}
                      className="text-[10px] font-bold bg-[#026665] hover:bg-[#0e9185] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {posting ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Posting…
                        </span>
                      ) : (
                        "Post Reply"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="text-[10px] text-black hover:text-black px-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QAPairCard({
  pair,
  witnessId,
  examId,
  isEditable,
  onUpdate,
  onCommentAdded,
  onDelete,
}) {
  const [editMode, setEditMode] = useState(false);
  const [q, setQ] = useState(pair.originalQuestion || "");
  const [a, setA] = useState(pair.originalAnswer || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(witnessId, pair._id, {
        originalQuestion: q,
        originalAnswer: a,
      });
      setEditMode(false);
      toast.success("Updated.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(witnessId, pair._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const borderColor = pair.isApproved
    ? "border-l-emerald-400"
    : pair.isFlagged
      ? "border-l-orange-400"
      : "border-l-slate-200";

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold text-black uppercase tracking-widest mt-0.5">
          Q{pair.sequence}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {pair.isFlagged && (
            <span className="text-[10px] bg-orange-50 text-black border border-orange-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Flag className="w-3 h-3" />
              FLAGGED
            </span>
          )}
          {pair.isApproved && (
            <span className="text-[10px] bg-emerald-50 text-black border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              APPROVED
            </span>
          )}
          {pair.useEditedVersion && (
            <span className="text-[10px] bg-[#9fd8d1]/30 text-black border border-[#9fd8d1] px-2 py-0.5 rounded-full font-bold">
              REVIEWER EDITED
            </span>
          )}
          {pair.comments?.length > 0 && (
            <span className="text-[10px] text-black font-semibold flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {pair.comments.length}
            </span>
          )}
        </div>
      </div>

      {editMode && isEditable ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] resize-none transition-all"
          />
          <textarea
            rows={2}
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#026665] resize-none transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-[#026665] hover:bg-[#0e9185] text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-all shadow-md shadow-[#026665]/20"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-black hover:text-black transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-black leading-relaxed">
            {pair.originalQuestion || (
              <em className="text-black font-normal">No question yet</em>
            )}
          </p>
          {pair.originalAnswer && (
            <p className="text-sm text-black mt-1.5 leading-relaxed">
              {pair.originalAnswer}
            </p>
          )}
          {pair.editedQuestion && (
            <div className="mt-3 p-3 rounded-lg bg-[#eef5f3] border border-[#9fd8d1]">
              <p className="text-[10px] font-bold text-black uppercase mb-1 flex items-center gap-1.5">
                <Edit3 className="w-3 h-3" />
                Reviewer's Edit
              </p>
              <p className="text-xs text-black">{pair.editedQuestion}</p>
              {pair.editedAnswer && (
                <p className="text-xs text-black mt-1">{pair.editedAnswer}</p>
              )}
            </div>
          )}

          {pair.comments?.length > 0 && (
            <ReviewerComments
              comments={pair.comments}
              examId={examId}
              witnessId={witnessId}
              qaId={pair._id}
              onCommentAdded={onCommentAdded}
            />
          )}

          {isEditable && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-3 text-xs text-black hover:text-black font-medium transition-colors"
            >
              <Edit3 className="w-3 h-3 inline mr-1" />
              Edit
            </button>
          )}

          {pair.isApproved &&
            (confirmDelete ? (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[11px] text-black font-semibold">
                  Delete?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-[11px] px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-60 transition-colors"
                >
                  {deleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Yes, delete"
                  )}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[11px] px-2 py-1.5 text-black hover:text-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="mt-3 text-[11px] px-2.5 py-1.5 border border-red-200 rounded-lg text-black hover:bg-red-50 hover:border-red-300 font-medium transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            ))}
        </>
      )}
    </div>
  );
}

function WitnessCard({
  witness,
  examId,
  isEditable,
  onDelete,
  onAddQA,
  onUpdateQA,
  onDeleteQA,
  onCommentAdded,
}) {
  const [open, setOpen] = useState(true);
  const [addingQA, setAddingQA] = useState(false);

  const flagged = witness.qaPairs.filter((p) => p.isFlagged).length;
  const approved = witness.qaPairs.filter((p) => p.isApproved).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-5 py-4 bg-[#eef5f3] border-b border-slate-200">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#026665] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md shadow-[#026665]/20">
            {witness.witnessName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-black text-sm truncate">
              {witness.witnessName}
            </p>
            <p className="text-xs text-black capitalize">
              {witness.witnessType} · {witness.qaPairs.length} Q&amp;A pair
              {witness.qaPairs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2 mr-2">
            {flagged > 0 && (
              <span className="text-xs bg-orange-50 text-black border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3" />
                {flagged}
              </span>
            )}
            {approved > 0 && (
              <span className="text-xs bg-emerald-50 text-black border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                {approved}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-black transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {isEditable && (
          <button
            onClick={() => onDelete(witness._id)}
            className="text-xs text-black hover:text-black border border-red-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="p-5 space-y-3">
          {witness.role && (
            <p className="text-xs text-black italic border-l-2 border-[#9fd8d1] pl-3">
              {witness.role}
            </p>
          )}

          {witness.qaPairs.length === 0 ? (
            <div className="py-6 text-center text-black text-sm border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="w-8 h-8 mx-auto mb-2 text-black" />
              No Q&amp;A pairs yet. Add your first one below.
            </div>
          ) : (
            witness.qaPairs
              .sort((a, b) => a.sequence - b.sequence)
              .map((pair) => (
                <QAPairCard
                  key={pair._id}
                  pair={pair}
                  witnessId={witness._id}
                  examId={examId}
                  isEditable={isEditable}
                  onUpdate={onUpdateQA}
                  onDelete={onDeleteQA}
                  onCommentAdded={(comment) =>
                    onCommentAdded(witness._id, pair._id, comment)
                  }
                />
              ))
          )}

          {isEditable &&
            (addingQA ? (
              <AddQAForm
                witnessId={witness._id}
                onAdd={onAddQA}
                onClose={() => setAddingQA(false)}
              />
            ) : (
              <button
                onClick={() => setAddingQA(true)}
                className="w-full py-3 border-2 border-dashed border-[#9fd8d1] rounded-xl text-sm text-black hover:border-[#0e9185] hover:text-black transition-colors font-medium bg-[#eef5f3]/50 hover:bg-[#eef5f3]"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Add Q&amp;A Pair
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// --- Main Page ---
export default function CrossExamEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitMode, setSubmitMode] = useState("submit");
  const [reviewers, setReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showAIQuestions, setShowAIQuestions] = useState(true);

  const fetchExam = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}`);
      setExam(data.exam);
      setActivity(data.activity || []);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const handleAddWitness = async (witnessData) => {
    const data = await apiFetch(`/api/cross-exams/${id}/witnesses`, {
      method: "POST",
      body: JSON.stringify(witnessData),
    });
    setExam((p) => ({
      ...p,
      witnesses: [...(p.witnesses || []), data.witness],
    }));
    toast.success("Witness added.");
  };

  const handleDeleteWitness = async (wId) => {
    if (!confirm("Remove this witness and all their Q&A pairs?")) return;
    await apiFetch(`/api/cross-exams/${id}/witnesses/${wId}`, {
      method: "DELETE",
    });
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.filter((w) => w._id !== wId),
    }));
    toast.success("Witness removed.");
  };

  const handleAddQA = async (wId, qaData) => {
    const data = await apiFetch(`/api/cross-exams/${id}/witnesses/${wId}/qa`, {
      method: "POST",
      body: JSON.stringify(qaData),
    });
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.map((w) =>
        w._id === wId ? { ...w, qaPairs: [...w.qaPairs, data.qaPair] } : w,
      ),
    }));
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

  const handleAddComment = (wId, qaId, newComment) => {
    setExam((p) => ({
      ...p,
      witnesses: p.witnesses.map((w) =>
        w._id === wId
          ? {
              ...w,
              qaPairs: w.qaPairs.map((q) =>
                q._id === qaId
                  ? { ...q, comments: [...(q.comments || []), newComment] }
                  : q,
              ),
            }
          : w,
      ),
    }));
  };

  const openSubmitModal = async (mode) => {
    setSubmitMode(mode);
    setSelectedReviewer(exam?.assignedTo?._id || "");
    setShowSubmitModal(true);

    setLoadingReviewers(true);
    try {
      const data = await apiFetch(
        "/api/user?seniority=senior&role=lawyer,admin",
      );
      setReviewers(data.users || []);
    } catch {
      setReviewers([]);
      toast.error("Could not load senior lawyers.");
    } finally {
      setLoadingReviewers(false);
    }
  };

  const closeSubmitModal = () => {
    if (submitting) return;
    setShowSubmitModal(false);
  };

  const confirmSubmission = async () => {
    const endpoint =
      submitMode === "resubmit"
        ? `/api/cross-exams/${id}/resubmit`
        : `/api/cross-exams/${id}/submit`;

    const successMessage =
      submitMode === "resubmit" ? "Resubmitted!" : "Submitted for review!";

    setSubmitting(true);
    try {
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          assignedTo: selectedReviewer || null,
        }),
      });
      setExam((p) => ({
        ...p,
        status: data.exam.status,
        assignedTo: data.exam.assignedTo || null,
      }));
      toast.success(successMessage);
      setShowSubmitModal(false);
      fetchExam();
    } catch (err) {
      toast.error(err.message || "Action failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    await openSubmitModal("submit");
  };

  const handleResubmit = async () => {
    await openSubmitModal("resubmit");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#026665] animate-spin" />
      </div>
    );
  if (!exam) return <div className="p-8 text-black">Not found.</div>;

  const isEditable =
    ["draft", "changes_requested"].includes(exam.status) && !exam.isLocked;
  const canSubmit = exam.status === "draft";
  const canResubmit = exam.status === "changes_requested";

  return (
    <div className="min-h-screen bg-[#eef5f3]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cross-exams"
              className="text-black hover:text-black transition-colors flex-shrink-0 p-1.5 rounded-lg hover:bg-[#eef5f3]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1
              className="text-lg font-bold text-black truncate max-w-xs"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {exam.title}
            </h1>
            <StatusPill status={exam.status} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowActivity((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                showActivity
                  ? "bg-[#026665] text-white shadow-md shadow-[#026665]/20"
                  : "text-black border border-slate-200 hover:bg-[#eef5f3] hover:border-[#9fd8d1]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1" />
              Activity
            </button>
            <Link
              href={`/cross-exams/${id}/compare`}
              className="text-xs text-black border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-[#eef5f3] hover:border-[#9fd8d1] transition-all"
            >
              <History className="w-3.5 h-3.5 inline mr-1" />
              History
            </Link>
            {(exam.status === "approved" ||
              exam.status === "courtroom_active") && (
              <Link
                href={`/cross-exams/${id}/courtroom`}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-md shadow-red-600/20"
              >
                <Activity className="w-3.5 h-3.5 inline mr-1" />
                Courtroom
              </Link>
            )}
            {exam.status === "approved" && (
              <a
                href={`/api/cross-exams/${id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5 inline mr-1" />
                PDF
              </a>
            )}
            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs bg-[#026665] hover:bg-[#0e9185] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg font-semibold transition-all shadow-md shadow-[#026665]/20 hover:shadow-[#026665]/30"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  "Submit for Review →"
                )}
              </button>
            )}
            {canResubmit && (
              <button
                onClick={handleResubmit}
                disabled={submitting}
                className="text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-md shadow-orange-600/20"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resubmitting…
                  </span>
                ) : (
                  "Resubmit →"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Banners */}
        {exam.status === "changes_requested" && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-black text-sm flex items-center gap-2">
                Changes requested by reviewer
                <span className="text-xs font-normal text-black">
                  Please address all flagged items
                </span>
              </p>
              {exam.revisionNote ? (
                <p className="text-xs text-black mt-1.5 p-2.5 bg-orange-100 rounded-lg border border-orange-200 leading-relaxed whitespace-pre-wrap">
                  {exam.revisionNote}
                </p>
              ) : (
                <p className="text-xs text-black mt-0.5">
                  Check the flagged Q&amp;A pairs below, make your revisions,
                  then click Resubmit.
                </p>
              )}
            </div>
          </div>
        )}
        {exam.isLocked && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="font-semibold text-black text-sm">
                Approved — Document is locked
              </p>
              <p className="text-xs text-black mt-0.5">
                This cross-examination has been approved. Export the PDF using
                the button above.
              </p>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-black bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-sm">
          {exam.caseId && (
            <span className="flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-black" />
              {exam.caseId.caseTitle}
            </span>
          )}
          {exam.hearingDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black" />
              Hearing {format(new Date(exam.hearingDate), "dd MMM yyyy")}
            </span>
          )}
          {exam.assignedTo && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-black" />
              Reviewer: {exam.assignedTo.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-black" />
            Version {exam.version - 1}
          </span>
        </div>

        {/* AI Generated Questions Panel */}
        {exam.aiGeneratedQuestions && (
          <div className="mb-6 border border-[#9fd8d1] rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowAIQuestions((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#eef5f3] hover:bg-[#9fd8d1]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#9fd8d1]/50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-black">
                    AI-Generated Questions
                  </p>
                  <p className="text-xs text-black mt-0.5">
                    Use these as a reference to build your witness Q&amp;A pairs
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-black transition-transform flex-shrink-0 ${showAIQuestions ? "rotate-180" : ""}`}
              />
            </button>

            {showAIQuestions && (
              <div className="px-5 py-4">
                <pre className="whitespace-pre-wrap text-xs text-black leading-relaxed font-sans bg-[#eef5f3] rounded-xl p-4 border border-slate-200 max-h-96 overflow-y-auto">
                  {exam.aiGeneratedQuestions}
                </pre>
                <p className="text-xs text-black mt-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-black" />
                  Add these as formal Q&amp;A pairs by clicking{" "}
                  <strong className="text-black">Add Witness</strong> below,
                  then using{" "}
                  <strong className="text-black">+ Add Q&amp;A</strong> on each
                  witness section.
                </p>
              </div>
            )}
          </div>
        )}

        <div
          className={`grid gap-6 ${showActivity ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {/* Witnesses */}
          <div className={showActivity ? "lg:col-span-2" : ""}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4" />
                Witnesses ({(exam.witnesses || []).length})
              </h2>
              {isEditable && (
                <button
                  onClick={() => setShowWitnessModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-[#026665] hover:bg-[#0e9185] text-white px-3 py-2 rounded-lg font-semibold transition-all shadow-md shadow-[#026665]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Witness
                </button>
              )}
            </div>

            {(exam.witnesses || []).length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-[#9fd8d1] rounded-2xl bg-white">
                <Users className="w-12 h-12 text-black mx-auto mb-3" />
                <p className="text-black font-medium text-sm">
                  No witnesses added yet
                </p>
                {isEditable && (
                  <button
                    onClick={() => setShowWitnessModal(true)}
                    className="mt-4 text-sm font-semibold text-black hover:text-black transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add your first witness
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {exam.witnesses.map((w) => (
                  <WitnessCard
                    key={w._id}
                    witness={w}
                    examId={id}
                    isEditable={isEditable}
                    onDelete={handleDeleteWitness}
                    onAddQA={handleAddQA}
                    onUpdateQA={handleUpdateQA}
                    onDeleteQA={handleDeleteQA}
                    onCommentAdded={handleAddComment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          {showActivity && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </h2>
                <button
                  onClick={() => setShowActivity(false)}
                  className="text-black hover:text-black w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-h-[600px] overflow-y-auto shadow-sm">
                {activity.length === 0 ? (
                  <p className="text-center text-black text-sm py-8">
                    No activity yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {activity.map((e) => (
                      <li
                        key={e._id}
                        className="px-4 py-3 flex gap-3 hover:bg-[#eef5f3]/50 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#026665] mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-black">{e.message}</p>
                          <p className="text-[10px] text-black mt-1">
                            {e.performedBy?.name} ·{" "}
                            {e.createdAt
                              ? format(new Date(e.createdAt), "dd MMM HH:mm")
                              : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showWitnessModal && (
        <AddWitnessModal
          onAdd={handleAddWitness}
          onClose={() => setShowWitnessModal(false)}
        />
      )}

      {showSubmitModal && (
        <SubmitReviewModal
          mode={submitMode}
          reviewers={reviewers}
          selectedReviewer={selectedReviewer}
          onReviewerChange={setSelectedReviewer}
          onClose={closeSubmitModal}
          onConfirm={confirmSubmission}
          loadingReviewers={loadingReviewers}
          submitting={submitting}
        />
      )}
    </div>
  );
}

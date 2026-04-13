"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import {
  activateCourtroom,
  deactivateCourtroom,
  updateCourtroomQA,
} from "@/utils/crossExamApi";

// ----- Helpers -----

const JUDGE_REACTION_LABELS = {
  neutral: { label: "Neutral", color: "bg-slate-100 text-slate-600" },
  sustained_objection: { label: "Sustained", color: "bg-red-100 text-red-700" },
  overruled_objection: {
    label: "Overruled",
    color: "bg-emerald-100 text-emerald-700",
  },
  struck_question: { label: "Struck", color: "bg-orange-100 text-orange-700" },
  admonished_counsel: { label: "Admonished", color: "bg-red-200 text-red-800" },
  "": { label: "—", color: "bg-slate-50 text-slate-400" },
};

const OUTCOME_OPTIONS = [
  { value: "favorable", label: "Favorable" },
  { value: "neutral", label: "Neutral" },
  { value: "unfavorable", label: "Unfavorable" },
  { value: "adjourned", label: "Adjourned" },
];

function JudgeReactionBadge({ reaction }) {
  const r = JUDGE_REACTION_LABELS[reaction] || JUDGE_REACTION_LABELS[""];
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.color}`}
    >
      {r.label}
    </span>
  );
}

// -------- Start Session Modal --------

function StartSessionModal({ onStart, onClose }) {
  const [form, setForm] = useState({
    courtRoom: "",
    judge: "",
    sessionNotes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Start Courtroom Session
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              This will lock the document for editing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Court Room
            </label>
            <input
              value={form.courtRoom}
              onChange={(e) =>
                setForm((f) => ({ ...f, courtRoom: e.target.value }))
              }
              placeholder="e.g. Court Room No. 3"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Judge
            </label>
            <input
              value={form.judge}
              onChange={(e) =>
                setForm((f) => ({ ...f, judge: e.target.value }))
              }
              placeholder="e.g. Justice Syed Mansoor Ali Shah"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Session Notes (optional)
            </label>
            <textarea
              rows={2}
              value={form.sessionNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, sessionNotes: e.target.value }))
              }
              placeholder="Any opening notes for this session…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
            >
              {loading ? "Starting…" : "🏛 Start Session"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- End Session Modal --------

function EndSessionModal({ onEnd, onClose }) {
  const [outcome, setOutcome] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnd = async () => {
    if (!outcome) {
      toast.error("Please select an outcome.");
      return;
    }
    setLoading(true);
    try {
      await onEnd({ outcome, postSessionReview: review });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">End Session</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record the outcome before closing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Session Outcome *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    outcome === o.value
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Post-Session Review
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How did the cross-examination go? Any notes for next time…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleEnd}
              disabled={loading}
              className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
            >
              {loading ? "Ending…" : "End Session"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- QA Card used in live runner --------

function LiveQACard({
  pair,
  witnessId,
  examId,
  isActive,
  isCourtroomActive,
  onAction,
  onNavigate,
  totalPairs,
  localIndex,
}) {
  const [answerText, setAnswerText] = useState(
    pair.courtroomUsage?.witnessActualAnswer || "",
  );
  const [skipReason, setSkipReason] = useState("");
  const [judgeReaction, setJudgeReaction] = useState(
    pair.courtroomUsage?.judgeReaction || "",
  );
  const [note, setNote] = useState(
    pair.courtroomUsage?.notesDuringHearing || "",
  );
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [acting, setActing] = useState(false);

  const usage = pair.courtroomUsage || {};
  const q = pair.useEditedVersion ? pair.editedQuestion : pair.originalQuestion;
  const expectedA = pair.useEditedVersion
    ? pair.editedAnswer
    : pair.originalAnswer;

  const doAction = async (action, extra = {}) => {
    setActing(true);
    try {
      await onAction({
        witnessId,
        qaId: pair._id,
        action,
        nextQaIndex: localIndex + 1,
        ...extra,
      });
    } finally {
      setActing(false);
    }
  };

  const statusBorder = usage.isSkipped
    ? "border-l-slate-300"
    : usage.isAnswered
      ? "border-l-emerald-400"
      : usage.isAsked
        ? "border-l-amber-400"
        : isActive
          ? "border-l-red-500"
          : "border-l-slate-200";

  const cardBg = isActive
    ? "bg-red-50/40"
    : usage.isSkipped
      ? "opacity-50 bg-slate-50"
      : "bg-white";

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${statusBorder} ${cardBg} p-4 transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Q{pair.sequence}
          </span>
          {isActive && (
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
              ▶ NOW
            </span>
          )}
          {usage.isAsked && !usage.isAnswered && !usage.isSkipped && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Asked
            </span>
          )}
          {usage.isAnswered && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              ✓ Answered
            </span>
          )}
          {usage.isSkipped && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Skipped
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {usage.judgeReaction && usage.judgeReaction !== "" && (
            <JudgeReactionBadge reaction={usage.judgeReaction} />
          )}
          {pair.reviewStatus === "risky" && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              ⚠ Risky
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-2">
        {q}
      </p>

      {/* Expected answer (collapsed until asked) */}
      {expectedA && usage.isAsked && (
        <div className="mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            Expected
          </p>
          <p className="text-xs text-slate-600">{expectedA}</p>
        </div>
      )}

      {/* Actual answer recorded */}
      {usage.witnessActualAnswer && (
        <div className="mb-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
            Witness Said
          </p>
          <p className="text-xs text-emerald-800">
            {usage.witnessActualAnswer}
          </p>
        </div>
      )}

      {/* Skip reason */}
      {usage.isSkipped && usage.skipReason && (
        <p className="text-xs text-slate-400 italic mb-2">
          Skipped: {usage.skipReason}
        </p>
      )}

      {/* Notes during hearing */}
      {usage.notesDuringHearing && (
        <p className="text-xs text-slate-500 mb-2 border-l-2 border-slate-200 pl-2">
          {usage.notesDuringHearing}
        </p>
      )}

      {/* Objections raised in court */}
      {usage.objectionsRaisedInCourt?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {usage.objectionsRaisedInCourt.map((obj, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded-full font-medium"
            >
              {obj}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons — only shown when courtroom is active and not yet done */}
      {isCourtroomActive && !usage.isSkipped && !usage.isAnswered && (
        <div className="mt-3 flex flex-wrap gap-2">
          {!usage.isAsked && (
            <>
              <button
                onClick={() => doAction("ask")}
                disabled={acting}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
              >
                {acting ? "…" : "▶ Ask"}
              </button>
              <button
                onClick={() => setShowSkipForm((v) => !v)}
                className="text-xs border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Skip
              </button>
            </>
          )}
          {usage.isAsked && (
            <button
              onClick={() => setShowAnswerForm((v) => !v)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
            >
              Record Answer
            </button>
          )}
        </div>
      )}

      {/* Record answer form */}
      {showAnswerForm && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <textarea
            rows={2}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="What did the witness actually say?"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={judgeReaction}
              onChange={(e) => setJudgeReaction(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Judge reaction…</option>
              {Object.entries(JUDGE_REACTION_LABELS)
                .filter(([k]) => k !== "")
                .map(([v, { label }]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
            </select>
            <button
              disabled={acting}
              onClick={() =>
                doAction("answer", {
                  witnessActualAnswer: answerText,
                  judgeReaction,
                  note,
                }).then(() => setShowAnswerForm(false))
              }
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
            >
              {acting ? "Saving…" : "Save Answer"}
            </button>
            <button
              onClick={() => setShowAnswerForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skip form */}
      {showSkipForm && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <input
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder="Reason for skipping (optional)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <div className="flex gap-2">
            <button
              disabled={acting}
              onClick={() =>
                doAction("skip", { note: skipReason }).then(() =>
                  setShowSkipForm(false),
                )
              }
              className="text-xs bg-slate-700 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
            >
              {acting ? "…" : "Confirm Skip"}
            </button>
            <button
              onClick={() => setShowSkipForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Witness Panel --------

function WitnessPanel({
  witness,
  examId,
  activeQaIndex,
  isCourtroomActive,
  onAction,
}) {
  const [open, setOpen] = useState(true);

  const asked = witness.qaPairs.filter((p) => p.courtroomUsage?.isAsked).length;
  const answered = witness.qaPairs.filter(
    (p) => p.courtroomUsage?.isAnswered,
  ).length;
  const skipped = witness.qaPairs.filter(
    (p) => p.courtroomUsage?.isSkipped,
  ).length;
  const total = witness.qaPairs.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100 text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {witness.witnessName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {witness.witnessName}
          </p>
          <p className="text-xs text-slate-400 capitalize">
            {witness.witnessType} · {answered}/{total} answered · {skipped}{" "}
            skipped
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{
              width:
                total > 0
                  ? `${Math.round(((answered + skipped) / total) * 100)}%`
                  : "0%",
            }}
          />
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="p-5 space-y-3">
          {witness.qaPairs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No Q&A pairs.
            </p>
          ) : (
            witness.qaPairs
              .sort((a, b) => a.sequence - b.sequence)
              .map((pair, idx) => (
                <LiveQACard
                  key={pair._id}
                  pair={pair}
                  witnessId={witness._id}
                  examId={examId}
                  isActive={isCourtroomActive && activeQaIndex === idx}
                  isCourtroomActive={isCourtroomActive}
                  localIndex={idx}
                  totalPairs={witness.qaPairs.length}
                  onAction={onAction}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
}

// -------- Session Summary Card --------

function SessionSummaryCard({ session }) {
  const duration =
    session.startedAt && session.endedAt
      ? Math.round(
          (new Date(session.endedAt) - new Date(session.startedAt)) / 60000,
        )
      : null;

  const outcomeColors = {
    favorable: "bg-emerald-50 text-emerald-700 border-emerald-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    unfavorable: "bg-red-50 text-red-700 border-red-200",
    adjourned: "bg-amber-50 text-amber-700 border-amber-200",
    "": "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
            Session
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {session.sessionDate
              ? format(new Date(session.sessionDate), "dd MMM yyyy")
              : "—"}
          </p>
        </div>
        {session.outcome && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${outcomeColors[session.outcome] || outcomeColors[""]}`}
          >
            {session.outcome.charAt(0).toUpperCase() + session.outcome.slice(1)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-3">
        {session.courtRoom && (
          <div>
            <span className="text-slate-400">Room: </span>
            {session.courtRoom}
          </div>
        )}
        {session.judge && (
          <div>
            <span className="text-slate-400">Judge: </span>
            {session.judge}
          </div>
        )}
        {session.startedAt && (
          <div>
            <span className="text-slate-400">Started: </span>
            {format(new Date(session.startedAt), "HH:mm")}
          </div>
        )}
        {duration !== null && (
          <div>
            <span className="text-slate-400">Duration: </span>
            {duration} min
          </div>
        )}
      </div>

      {session.postSessionReview && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            Post-Session Review
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            {session.postSessionReview}
          </p>
        </div>
      )}
    </div>
  );
}

// -------- Main Page --------

export default function CourtroomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/cross-exams/${id}`);
      setExam(data.exam);
    } catch {
      toast.error("Failed to load cross-examination.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  const handleStart = async (form) => {
    try {
      const data = await activateCourtroom(id, form);
      setExam(data.exam);
      setShowStartModal(false);
      toast.success("Courtroom session started!");
    } catch (err) {
      toast.error(err.message || "Could not start session.");
    }
  };

  const handleEnd = async (form) => {
    try {
      const data = await deactivateCourtroom(id, form);
      setExam(data.exam);
      setShowEndModal(false);
      toast.success("Session ended successfully.");
    } catch (err) {
      toast.error(err.message || "Could not end session.");
    }
  };

  const handleQAAction = async (body) => {
    try {
      await updateCourtroomQA(id, body);
      // Optimistically refresh to get updated state
      await fetchExam();
    } catch (err) {
      toast.error(err.message || "Action failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam)
    return <div className="p-8 text-red-500">Cross-examination not found.</div>;

  // Guard: only approved or courtroom_active exams can enter this page
  if (!["approved", "courtroom_active"].includes(exam.status)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-slate-700 font-semibold mb-2">
            Courtroom not available
          </p>
          <p className="text-sm text-slate-400 mb-6">
            This cross-examination must be approved before entering courtroom
            mode.
          </p>
          <Link
            href={`/cross-exams/${id}`}
            className="text-sm text-slate-600 underline"
          >
            ← Back to cross-examination
          </Link>
        </div>
      </div>
    );
  }

  const isLive = exam.courtroomModeActive && exam.status === "courtroom_active";
  const witnesses = exam.witnesses || [];
  const sessions = exam.hearingSessions || [];
  const lastSession = sessions[sessions.length - 1];

  // Stats across all witnesses
  const allPairs = witnesses.flatMap((w) => w.qaPairs || []);
  const totalQ = allPairs.length;
  const askedQ = allPairs.filter((p) => p.courtroomUsage?.isAsked).length;
  const answeredQ = allPairs.filter((p) => p.courtroomUsage?.isAnswered).length;
  const skippedQ = allPairs.filter((p) => p.courtroomUsage?.isSkipped).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div
        className={`sticky top-0 z-30 border-b shadow-sm ${isLive ? "bg-red-700" : "bg-white border-slate-200"}`}
      >
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/cross-exams/${id}`}
              className={`transition-colors flex-shrink-0 ${isLive ? "text-red-200 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
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
            <div>
              <h1
                className={`text-base font-bold truncate max-w-xs ${isLive ? "text-white" : "text-slate-800"}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {exam.title}
              </h1>
              <p
                className={`text-xs ${isLive ? "text-red-200" : "text-slate-400"}`}
              >
                🏛 Courtroom Mode
              </p>
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-100 bg-red-600 border border-red-500 px-2.5 py-1 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-300 inline-block" />
                LIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isLive && exam.status === "approved" && (
              <button
                onClick={() => setShowStartModal(true)}
                className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                🏛 Start Session
              </button>
            )}
            {isLive && (
              <button
                onClick={() => setShowEndModal(true)}
                className="text-sm bg-white hover:bg-slate-100 text-red-700 font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Live stats bar */}
        {(isLive || sessions.length > 0) && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: totalQ, color: "text-slate-800" },
              { label: "Asked", value: askedQ, color: "text-amber-700" },
              {
                label: "Answered",
                value: answeredQ,
                color: "text-emerald-700",
              },
              { label: "Skipped", value: skippedQ, color: "text-slate-500" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm"
              >
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Session info banner when live */}
        {isLive && lastSession && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <span className="text-base">🏛</span>
              <strong>{lastSession.courtRoom || "Court"}</strong>
            </div>
            {lastSession.judge && (
              <div className="text-sm text-red-600">
                <span className="text-red-400">Judge: </span>
                {lastSession.judge}
              </div>
            )}
            {lastSession.startedAt && (
              <div className="text-xs text-red-400 ml-auto">
                Started {format(new Date(lastSession.startedAt), "HH:mm")}
              </div>
            )}
          </div>
        )}

        {/* Not started yet */}
        {!isLive && exam.status === "approved" && sessions.length === 0 && (
          <div className="mb-8 text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-4xl mb-3">🏛</p>
            <p className="text-slate-700 font-semibold mb-1">Ready for Court</p>
            <p className="text-sm text-slate-400 mb-6">
              This cross-examination is approved. Start a session to go live.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              🏛 Start Courtroom Session
            </button>
          </div>
        )}

        <div
          className={`grid gap-6 ${sessions.length > 0 ? "lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {/* Witness Q&A runner */}
          <div className={sessions.length > 0 ? "lg:col-span-2" : ""}>
            {witnesses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No witnesses found in this cross-examination.
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Witnesses ({witnesses.length})
                </h2>
                {witnesses.map((w) => (
                  <WitnessPanel
                    key={w._id}
                    witness={w}
                    examId={id}
                    activeQaIndex={exam.activeQaIndex || 0}
                    isCourtroomActive={isLive}
                    onAction={handleQAAction}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Session history */}
          {sessions.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                Session History ({sessions.length})
              </h2>
              <div className="space-y-3">
                {[...sessions].reverse().map((s, i) => (
                  <SessionSummaryCard key={i} session={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showStartModal && (
        <StartSessionModal
          onStart={handleStart}
          onClose={() => setShowStartModal(false)}
        />
      )}
      {showEndModal && (
        <EndSessionModal
          onEnd={handleEnd}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}

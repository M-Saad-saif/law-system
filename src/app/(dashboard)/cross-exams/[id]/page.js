"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { apiFetch } from "@/utils/api";

// --- Status pill ----
const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  changes_requested: "bg-orange-50 text-orange-700",
  approved: "bg-emerald-50 text-emerald-700",
  archived: "bg-gray-100 text-gray-500",
};
const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  archived: "Archived",
};

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// --- Add Witness modal ---`
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add Witness</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Witness Name *
            </label>
            <input
              value={form.witnessName}
              onChange={(e) =>
                setForm((f) => ({ ...f, witnessName: e.target.value }))
              }
              placeholder="e.g. Muhammad Tariq"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Type
            </label>
            <select
              value={form.witnessType}
              onChange={(e) =>
                setForm((f) => ({ ...f, witnessType: e.target.value }))
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="prosecution">Prosecution</option>
              <option value="defense">Defense</option>
              <option value="expert">Expert</option>
              <option value="character">Character</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              Role / Description
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Eyewitness present at scene"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add Witness"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Add QA inline form ---
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
    >
      <textarea
        rows={2}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Question *"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
        required
      />
      <textarea
        rows={2}
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="Expected answer (optional)"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Q&A"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- QA pair display -----
function QAPairCard({ pair, witnessId, isEditable, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [q, setQ] = useState(pair.originalQuestion || "");
  const [a, setA] = useState(pair.originalAnswer || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(witnessId, pair._id, {
        originalQuestion: q,
        originalAnswer: a,
      });
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const borderColor = pair.isApproved
    ? "border-l-emerald-400"
    : pair.isFlagged
      ? "border-l-red-400"
      : "border-l-slate-200";

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} p-4`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Q{pair.sequence}
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {pair.isFlagged && (
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
              ⚑ FLAGGED
            </span>
          )}
          {pair.isApproved && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              ✓ APPROVED
            </span>
          )}
          {pair.useEditedVersion && (
            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              REVIEWER EDITED
            </span>
          )}
          {pair.comments?.length > 0 && (
            <span className="text-[10px] text-slate-400">
              💬 {pair.comments.length}
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
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
          <textarea
            rows={2}
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {pair.originalQuestion || (
              <em className="text-slate-400 font-normal">No question yet</em>
            )}
          </p>
          {pair.originalAnswer && (
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {pair.originalAnswer}
            </p>
          )}
          {pair.editedQuestion && (
            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">
                Reviewer's Edit
              </p>
              <p className="text-xs text-blue-800">{pair.editedQuestion}</p>
              {pair.editedAnswer && (
                <p className="text-xs text-blue-600 mt-1">
                  {pair.editedAnswer}
                </p>
              )}
            </div>
          )}
          {isEditable && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-2 text-xs text-slate-400 hover:text-slate-700 font-medium underline underline-offset-2"
            >
              Edit
            </button>
          )}
        </>
      )}
    </div>
  );
}

// --- Witness accordion ---─
function WitnessCard({ witness, isEditable, onDelete, onAddQA, onUpdateQA }) {
  const [open, setOpen] = useState(true);
  const [addingQA, setAddingQA] = useState(false);

  const flagged = witness.qaPairs.filter((p) => p.isFlagged).length;
  const approved = witness.qaPairs.filter((p) => p.isApproved).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {witness.witnessName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">
              {witness.witnessName}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {witness.witnessType} · {witness.qaPairs.length} Q&amp;A pair
              {witness.qaPairs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2 mr-2">
            {flagged > 0 && (
              <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                ⚑ {flagged}
              </span>
            )}
            {approved > 0 && (
              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                ✓ {approved}
              </span>
            )}
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
        {isEditable && (
          <button
            onClick={() => onDelete(witness._id)}
            className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            Remove
          </button>
        )}
      </div>

      {/* Body */}
      {open && (
        <div className="p-5 space-y-3">
          {witness.role && (
            <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
              {witness.role}
            </p>
          )}

          {witness.qaPairs.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
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
                  isEditable={isEditable}
                  onUpdate={onUpdateQA}
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
                className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors font-medium"
              >
                + Add Q&amp;A Pair
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// --- Main page -------
export default function CrossExamEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

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

  const handleSubmit = async () => {
    if (!confirm("Submit for senior review?")) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/submit`, {
        method: "POST",
        body: "{}",
      });
      setExam((p) => ({ ...p, status: data.exam.status }));
      toast.success("Submitted for review!");
      fetchExam();
    } catch (err) {
      toast.error(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!confirm("Resubmit for review?")) return;
    setSubmitting(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/resubmit`, {
        method: "POST",
        body: "{}",
      });
      setExam((p) => ({ ...p, status: data.exam.status }));
      toast.success("Resubmitted!");
      fetchExam();
    } catch (err) {
      toast.error(err.message || "Resubmit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!exam) return <div className="p-8 text-red-500">Not found.</div>;

  const isEditable =
    ["draft", "changes_requested"].includes(exam.status) && !exam.isLocked;
  const canSubmit = exam.status === "draft";
  const canResubmit = exam.status === "changes_requested";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/cross-exams"
              className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
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
              className="text-base font-bold text-slate-800 truncate max-w-xs"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {exam.title}
            </h1>
            <StatusPill status={exam.status} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowActivity((v) => !v)}
              className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Activity
            </button>
            <Link
              href={`/cross-exams/${id}/compare`}
              className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              History
            </Link>
            {exam.status === "approved" && (
              <a
                href={`/api/cross-exams/${id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Export PDF
              </a>
            )}
            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="text-xs bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Submitting…" : "Submit for Review →"}
              </button>
            )}
            {canResubmit && (
              <button
                onClick={handleResubmit}
                disabled={submitting}
                className="text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Resubmitting…" : "Resubmit →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Banners */}
        {exam.status === "changes_requested" && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                Changes requested by reviewer
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Check the flagged Q&A pairs below, make your revisions, then
                click Resubmit.
              </p>
            </div>
          </div>
        )}
        {exam.isLocked && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-sm">
                Approved — Document is locked
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                This cross-examination has been approved. Export the PDF using
                the button above.
              </p>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-5 mb-6 text-xs text-slate-500">
          {exam.caseId && <span>📁 {exam.caseId.caseTitle}</span>}
          {exam.hearingDate && (
            <span>
              📅 Hearing {format(new Date(exam.hearingDate), "dd MMM yyyy")}
            </span>
          )}
          {exam.assignedTo && <span>👤 Reviewer: {exam.assignedTo.name}</span>}
          <span>Version {exam.version - 1}</span>
        </div>

        <div
          className={`grid gap-6 ${showActivity ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {/* Witnesses */}
          <div className={showActivity ? "lg:col-span-2" : ""}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Witnesses ({(exam.witnesses || []).length})
              </h2>
              {isEditable && (
                <button
                  onClick={() => setShowWitnessModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                  Add Witness
                </button>
              )}
            </div>

            {(exam.witnesses || []).length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <svg
                  className="w-10 h-10 text-slate-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-slate-500 font-medium text-sm">
                  No witnesses added yet
                </p>
                {isEditable && (
                  <button
                    onClick={() => setShowWitnessModal(true)}
                    className="mt-4 text-sm font-semibold text-slate-900 hover:text-slate-600 underline underline-offset-2"
                  >
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
                    isEditable={isEditable}
                    onDelete={handleDeleteWitness}
                    onAddQA={handleAddQA}
                    onUpdateQA={handleUpdateQA}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          {showActivity && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Activity
                </h2>
                <button
                  onClick={() => setShowActivity(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-h-[600px] overflow-y-auto">
                {activity.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-8">
                    No activity yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {activity.map((e) => (
                      <li key={e._id} className="px-4 py-3 flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-700">{e.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
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

      {/* Add Witness modal */}
      {showWitnessModal && (
        <AddWitnessModal
          onAdd={handleAddWitness}
          onClose={() => setShowWitnessModal(false)}
        />
      )}
    </div>
  );
}

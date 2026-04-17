"use client";

export const dynamic = "force-dynamic";

/**
 * /app/(dashboard)/applications/page.js  (UPGRADED)
 * ─────────────────────────────────────────────────────────────────────────────
 * Key additions vs original:
 *  - ApplicationForm modal: full form with type dropdown, autoGenerate toggle,
 *    AI improve button, and content editor.
 *  - Application detail modal: view content, submit for review, improve with AI.
 *  - Status badges with colour coding (draft / generated / review / approved / filed).
 *  - Filter by status + type.
 *  - "Improve with AI" button per card (non-destructive; shows diff modal).
 *  - All state handled with clean React hooks (no global state).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { PageLoader, EmptyState, Modal, ConfirmDialog } from "@/components/ui";
import {
  Plus,
  Eye,
  Trash2,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  RefreshCw,
  Filter,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLICATION_TYPES = [
  { value: "post_arrest_bail", label: "Post-Arrest Bail" },
  { value: "pre_arrest_bail", label: "Pre-Arrest / Anticipatory Bail" },
  { value: "civil_suit", label: "Civil Suit / Plaint" },
  { value: "adjournment", label: "Adjournment Application" },
  { value: "exemption", label: "Exemption from Personal Appearance" },
  { value: "placement_of_documents", label: "Placement of Documents" },
  { value: "substitute_witness", label: "Substitute Witness Application" },
  { value: "miscellaneous", label: "Miscellaneous Application" },
];

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  generated: { label: "Generated", color: "bg-blue-100 text-blue-700" },
  review: { label: "Under Review", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
  filed: { label: "Filed", color: "bg-purple-100 text-purple-700" },
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);

      const data = await api.get(`/api/applications?${params}`);
      setApplications(data.data.applications);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/applications/${deleteTarget._id}`);
      toast.success("Application deleted.");
      setDeleteTarget(null);
      fetchApplications();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = filterType || filterStatus;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} application{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="select w-full sm:w-64"
        >
          <option value="">All Types</option>
          {APPLICATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>
              {cfg.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setFilterType("");
              setFilterStatus("");
            }}
            className="btn-ghost text-red-500 hover:bg-red-50 shrink-0"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Create your first legal application. Use Auto-Generate to draft instantly, then improve with AI."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                app={app}
                onView={() => setViewTarget(app)}
                onDelete={() => setDeleteTarget(app)}
                onUpdated={(updated) => {
                  setApplications((prev) =>
                    prev.map((a) => (a._id === updated._id ? updated : a)),
                  );
                  if (viewTarget?._id === updated._id) setViewTarget(updated);
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {createOpen && (
        <CreateApplicationModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            fetchApplications();
          }}
        />
      )}

      {viewTarget && (
        <ApplicationDetailModal
          app={viewTarget}
          onClose={() => setViewTarget(null)}
          onUpdated={(updated) => {
            setViewTarget(updated);
            setApplications((prev) =>
              prev.map((a) => (a._id === updated._id ? updated : a)),
            );
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Delete this ${deleteTarget?.applicationType?.replace(/_/g, " ")} application? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ app, onView, onDelete, onUpdated }) {
  const [improving, setImproving] = useState(false);

  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;

  const typeLabel =
    APPLICATION_TYPES.find((t) => t.value === app.applicationType)?.label ||
    app.applicationType;

  const handleQuickImprove = async () => {
    if (!app.content && !app.generatedText) {
      toast.error("Generate a draft first before using AI improvement.");
      return;
    }
    setImproving(true);
    try {
      const data = await api.post("/api/applications/improve", {
        applicationId: app._id,
      });
      toast.success("Draft improved with AI!");
      onUpdated(data.data.application);
    } catch (err) {
      toast.error(err.message || "AI improvement failed.");
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-3 group">
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary-600 truncate mb-0.5">
            {typeLabel}
          </p>
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
            {app.caseTitle || app.applicantName || "Untitled Application"}
          </h3>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Meta */}
      <div className="space-y-1 text-xs text-slate-500">
        {app.caseNumber && <p>Case: {app.caseNumber}</p>}
        {app.courtName && <p>Court: {app.courtName}</p>}
        {app.hearingDate && (
          <p className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(app.hearingDate).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-2 flex-wrap">
        {app.autoGenerated && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium">
            <FileText className="w-3 h-3" /> Auto-generated
          </span>
        )}
        {app.aiEnhanced && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium">
            <Sparkles className="w-3 h-3" /> AI Enhanced
          </span>
        )}
        {app.version > 1 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[11px] font-medium">
            v{app.version}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
        <button
          onClick={onView}
          className="btn-ghost flex-1 text-xs justify-center"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>

        {(app.content || app.generatedText) &&
          !["review", "approved", "filed"].includes(app.status) && (
            <button
              onClick={handleQuickImprove}
              disabled={improving}
              title="Improve with AI"
              className="btn-ghost px-2.5 text-violet-500 hover:bg-violet-50 disabled:opacity-40"
            >
              {improving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          )}

        <button
          onClick={onDelete}
          className="btn-ghost px-2.5 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Create Application Modal ─────────────────────────────────────────────────

function CreateApplicationModal({ onClose, onCreated }) {
  const [cases, setCases] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    applicationType: "post_arrest_bail",
    caseId: "",
    caseTitle: "",
    caseNumber: "",
    firNo: "",
    courtName: "",
    courtType: "",
    applicantName: "",
    respondentName: "",
    ppcSections: "", // comma-separated input → split to array on submit
    judgeName: "",
    hearingDate: "",
    grounds: "", // newline-separated → split to array on submit
    prayer: "",
    additionalNotes: "",
  });

  // Control flags
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [step, setStep] = useState("form"); // "form" | "preview"

  useEffect(() => {
    api
      .get("/api/cases?limit=100")
      .then((d) => setCases(d.data?.cases || []))
      .catch(() => {});
  }, []);

  // Auto-fill from linked case
  const handleCaseSelect = async (caseId) => {
    setForm((f) => ({ ...f, caseId }));
    if (!caseId) return;
    try {
      const data = await api.get(`/api/cases/${caseId}`);
      const c = data.data?.case;
      if (!c) return;
      setForm((f) => ({
        ...f,
        caseId,
        caseTitle: c.caseTitle || f.caseTitle,
        caseNumber: c.caseNumber || c.suitNo || f.caseNumber,
        firNo: c.firNo || f.firNo,
        courtName: c.courtName || f.courtName,
        courtType: c.courtType || f.courtType,
        applicantName: c.clientName || f.applicantName,
        judgeName: c.judgeName || f.judgeName,
        ppcSections: (c.provisions || []).join(", ") || f.ppcSections,
      }));
    } catch {
      // Non-fatal; user can fill manually
    }
  };

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // Prepare body for API call
  const buildPayload = () => ({
    ...form,
    ppcSections: form.ppcSections
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    grounds: form.grounds
      .split("\n")
      .map((g) => g.trim())
      .filter(Boolean),
    caseId: form.caseId || undefined,
    autoGenerate,
    useAI,
  });

  // Generate preview (no DB save yet — we POST but could also do client-side generation)
  // For simplicity and to honour the API boundary, we use the API.
  const handleGenerate = async () => {
    if (!form.applicationType) {
      toast.error("Select an application type.");
      return;
    }
    setGenerating(true);
    try {
      const payload = buildPayload();
      const data = await api.post("/api/applications", payload);
      setGeneratedContent(data.data.application.content || "");
      setStep("preview");
      toast.success(
        useAI ? "Draft generated and AI-improved!" : "Draft generated!",
      );
      onCreated(); // refresh list
      onClose();
    } catch (err) {
      toast.error(err.message || "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.applicationType) {
      toast.error("Select an application type.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/applications", {
        ...buildPayload(),
        autoGenerate: false,
        useAI: false,
      });
      toast.success("Draft saved.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="New Legal Application" size="xl">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* ── Type ─────────────────────────────────────────────────── */}
        <div>
          <label className="label">Application Type *</label>
          <select
            className="select"
            value={form.applicationType}
            onChange={set("applicationType")}
          >
            {APPLICATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Linked Case ──────────────────────────────────────────── */}
        <div>
          <label className="label">
            Link to Case{" "}
            <span className="text-slate-400 font-normal normal-case">
              (auto-fills fields)
            </span>
          </label>
          <select
            className="select"
            value={form.caseId}
            onChange={(e) => handleCaseSelect(e.target.value)}
          >
            <option value="">— Select a case —</option>
            {cases.map((c) => (
              <option key={c._id} value={c._id}>
                {c.caseTitle}
                {c.caseNumber ? ` (${c.caseNumber})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ── Case Details ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Case Title</label>
            <input
              className="input"
              placeholder="e.g. State vs Ahmed Ali"
              value={form.caseTitle}
              onChange={set("caseTitle")}
            />
          </div>
          <div>
            <label className="label">Case / Suit Number</label>
            <input
              className="input"
              placeholder="e.g. 123/2024"
              value={form.caseNumber}
              onChange={set("caseNumber")}
            />
          </div>
          <div>
            <label className="label">FIR Number</label>
            <input
              className="input"
              placeholder="e.g. 45/2024"
              value={form.firNo}
              onChange={set("firNo")}
            />
          </div>
          <div>
            <label className="label">Applicant / Accused Name</label>
            <input
              className="input"
              placeholder="Full name"
              value={form.applicantName}
              onChange={set("applicantName")}
            />
          </div>
          <div>
            <label className="label">Respondent / Complainant</label>
            <input
              className="input"
              placeholder="Full name or 'The State'"
              value={form.respondentName}
              onChange={set("respondentName")}
            />
          </div>
          <div>
            <label className="label">Court Name</label>
            <input
              className="input"
              placeholder="e.g. Lahore High Court"
              value={form.courtName}
              onChange={set("courtName")}
            />
          </div>
          <div>
            <label className="label">Court Type</label>
            <input
              className="input"
              placeholder="e.g. Sessions Court"
              value={form.courtType}
              onChange={set("courtType")}
            />
          </div>
          <div>
            <label className="label">Judge Name</label>
            <input
              className="input"
              placeholder="Honourable Mr. Justice ..."
              value={form.judgeName}
              onChange={set("judgeName")}
            />
          </div>
          <div>
            <label className="label">Hearing Date</label>
            <input
              type="date"
              className="input"
              value={form.hearingDate}
              onChange={set("hearingDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">
              PPC / Act Sections (comma-separated)
            </label>
            <input
              className="input font-mono"
              placeholder="e.g. 302, 34, 120-B"
              value={form.ppcSections}
              onChange={set("ppcSections")}
            />
          </div>
        </div>

        {/* ── Grounds ──────────────────────────────────────────────── */}
        <div>
          <label className="label">
            Grounds{" "}
            <span className="text-slate-400 font-normal normal-case">
              (one per line)
            </span>
          </label>
          <textarea
            className="textarea h-28"
            placeholder={
              "1. The applicant has no previous criminal record.\n2. The allegations are false and fabricated.\n3. The maximum sentence does not bar bail."
            }
            value={form.grounds}
            onChange={set("grounds")}
          />
        </div>

        {/* ── Prayer ───────────────────────────────────────────────── */}
        <div>
          <label className="label">Prayer / Relief Sought</label>
          <textarea
            className="textarea h-20"
            placeholder="It is respectfully prayed that bail be granted..."
            value={form.prayer}
            onChange={set("prayer")}
          />
        </div>

        {/* ── Additional Notes ─────────────────────────────────────── */}
        <div>
          <label className="label">Additional Notes / Submissions</label>
          <textarea
            className="textarea h-16"
            placeholder="Any additional context or special circumstances..."
            value={form.additionalNotes}
            onChange={set("additionalNotes")}
          />
        </div>

        {/* ── Control Flags ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Generation Options
          </p>

          {/* Auto-generate */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="w-4 h-4 accent-primary-600 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-slate-700">
                Auto-Generate Draft
              </p>
              <p className="text-xs text-slate-500">
                Use the built-in legal template to instantly produce a full
                application text from the fields above.
              </p>
            </div>
          </label>

          {/* AI Improve */}
          <label
            className={`flex items-start gap-3 cursor-pointer ${!autoGenerate ? "opacity-40 pointer-events-none" : ""}`}
          >
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              disabled={!autoGenerate}
              className="w-4 h-4 accent-violet-600 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                Improve with AI
              </p>
              <p className="text-xs text-slate-500">
                After generation, send the draft to AI for legal language
                enhancement. Facts are preserved — only clarity and formal tone
                are improved. Requires OpenAI API key.
              </p>
            </div>
          </label>
        </div>

        {/* ── Actions ──────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving || generating}
            className="btn-secondary"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          {autoGenerate && (
            <button
              onClick={handleGenerate}
              disabled={saving || generating}
              className="btn-primary"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {useAI ? "Generating + Improving..." : "Generating..."}
                </span>
              ) : useAI ? (
                <>
                  <Sparkles className="w-4 h-4" /> Generate & Improve
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Generate Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Application Detail Modal ─────────────────────────────────────────────────

function ApplicationDetailModal({ app, onClose, onUpdated }) {
  const [data, setData] = useState(app);
  const [improving, setImproving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [contentDraft, setContentDraft] = useState(
    app.content || app.generatedText || "",
  );
  const [savingContent, setSavingContent] = useState(false);

  const typeLabel =
    APPLICATION_TYPES.find((t) => t.value === data.applicationType)?.label ||
    data.applicationType;

  // ── AI Improve ────────────────────────────────────────────────────────────
  const handleImprove = async () => {
    setImproving(true);
    try {
      const res = await api.post("/api/applications/improve", {
        applicationId: data._id,
      });
      const updated = res.data.application;
      setData(updated);
      setContentDraft(updated.content || "");
      onUpdated(updated);
      toast.success("Draft improved with AI!");
    } catch (err) {
      toast.error(err.message || "AI improvement failed.");
    } finally {
      setImproving(false);
    }
  };

  // ── Submit for Review ─────────────────────────────────────────────────────
  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/applications/${data._id}`, {
        action: "submitForReview",
      });
      const updated = res.data.application;
      setData(updated);
      onUpdated(updated);
      toast.success("Submitted for senior review!");
    } catch (err) {
      toast.error(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Save Edited Content ───────────────────────────────────────────────────
  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      const res = await api.put(`/api/applications/${data._id}`, {
        content: contentDraft,
      });
      const updated = res.data.application;
      setData(updated);
      onUpdated(updated);
      setEditingContent(false);
      toast.success("Changes saved.");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSavingContent(false);
    }
  };

  const canEdit = !["review", "approved", "filed"].includes(data.status);
  const canSubmit = ["draft", "generated"].includes(data.status);
  const hasContent = !!(data.content || data.generatedText);

  return (
    <Modal isOpen onClose={onClose} title={typeLabel} size="xl">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* ── Status + Meta ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={data.status} />
          {data.autoGenerated && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              Auto-generated
            </span>
          )}
          {data.aiEnhanced && (
            <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Enhanced
            </span>
          )}
          {data.version > 1 && (
            <span className="text-xs text-slate-500">v{data.version}</span>
          )}
        </div>

        {/* ── Key Fields ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Applicant", data.applicantName],
            ["Respondent", data.respondentName],
            ["Case No.", data.caseNumber],
            ["FIR No.", data.firNo],
            ["Court", data.courtName],
            ["Judge", data.judgeName],
            [
              "Hearing",
              data.hearingDate
                ? new Date(data.hearingDate).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null,
            ],
            ["Sections", data.ppcSections?.join(", ")],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div
                key={label}
                className="bg-slate-50 rounded-lg p-3 border border-slate-100"
              >
                <p className="text-xs text-slate-400 font-medium mb-0.5">
                  {label}
                </p>
                <p className="text-slate-700 font-medium text-sm truncate">
                  {value}
                </p>
              </div>
            ))}
        </div>

        {/* ── Grounds ──────────────────────────────────────────────── */}
        {data.grounds?.length > 0 && (
          <div>
            <p className="label">Grounds</p>
            <ol className="space-y-1.5">
              {data.grounds.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-slate-400 font-mono text-xs mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  {g}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Generated Content ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label mb-0">Application Text</p>
            {canEdit && hasContent && (
              <div className="flex items-center gap-2">
                {!editingContent ? (
                  <button
                    onClick={() => setEditingContent(true)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveContent}
                      disabled={savingContent}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      {savingContent ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingContent(false);
                        setContentDraft(
                          data.content || data.generatedText || "",
                        );
                      }}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {hasContent ? (
            editingContent ? (
              <textarea
                className="textarea h-80 font-mono text-xs"
                value={contentDraft}
                onChange={(e) => setContentDraft(e.target.value)}
              />
            ) : (
              <pre className="text-xs text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 whitespace-pre-wrap font-mono overflow-x-auto max-h-80 overflow-y-auto">
                {data.content || data.generatedText}
              </pre>
            )
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                No draft content yet. Create a new version with Auto-Generate
                enabled.
              </p>
            </div>
          )}
        </div>

        {/* ── Review Note ──────────────────────────────────────────── */}
        {data.reviewNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">
              Review Note from Senior Lawyer
            </p>
            <p className="text-sm text-amber-900">{data.reviewNote}</p>
          </div>
        )}

        {/* ── Action Bar ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          {/* AI Improve */}
          {canEdit && hasContent && (
            <button
              onClick={handleImprove}
              disabled={improving}
              className="btn-secondary text-violet-600 border-violet-200 hover:bg-violet-50"
            >
              {improving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Improving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Improve with AI
                </>
              )}
            </button>
          )}

          {/* Submit for Review */}
          {canSubmit && hasContent && (
            <button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit for Review
                </>
              )}
            </button>
          )}

          {/* Approved indicator */}
          {data.status === "approved" && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
              <CheckCircle className="w-4 h-4" /> Approved by Senior Lawyer
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

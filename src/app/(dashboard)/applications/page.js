"use client";

export const dynamic = "force-dynamic";

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
  Calendar,
  Building2,
  Scale,
  User,
  BadgeCheck,
  PenTool,
  Layers,
  Gavel,
} from "lucide-react";

// ---─ Constants ------------------

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
  draft: { label: "Draft", color: "bg-[#eef5f3] text-[#026665]" },
  generated: { label: "Generated", color: "bg-[#9fd8d1]/30 text-[#0e9185]" },
  review: { label: "Under Review", color: "bg-[#9fd8d1]/50 text-[#026665]" },
  approved: { label: "Approved", color: "bg-[#0e9185]/20 text-[#026665]" },
  filed: { label: "Filed", color: "bg-[#026665]/20 text-[#026665]" },
};

// ---─ Main Page Component ---

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

  // --- Fetch ------
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);

      const response = await api.get(`/api/applications?${params}`);
      setApplications(response?.data?.applications || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
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

  // --- Delete ------------------─
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 bg-[#eef5f3]">
      {/* --- Header ---─ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black font-display tracking-tight">
            Applications
          </h1>
          <p className="text-sm text-black/60 mt-0.5">
            {total} application{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#026665] text-white rounded-xl font-medium hover:bg-[#0e9185] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* --- Filters --- */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-4 border border-[#9fd8d1]/30 shadow-sm">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all"
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
          className="w-full sm:w-48 px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all"
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
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[#026665] hover:bg-[#eef5f3] rounded-xl transition-all duration-200 shrink-0"
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* --- Content --- */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-4 py-2 text-black/60 hover:text-[#026665] hover:bg-[#eef5f3] rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-black/60">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 text-black/60 hover:text-[#026665] hover:bg-[#eef5f3] rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* --- Modals ---─ */}
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

// ---─ Application Card ------─

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
      const response = await api.post("/api/applications/improve", {
        applicationId: app._id,
      });

      const updatedApp = response?.data?.application;
      if (!updatedApp) {
        throw new Error("Invalid response from server");
      }

      toast.success("Draft improved with AI!");
      onUpdated(updatedApp);
    } catch (err) {
      toast.error(err.message || "AI improvement failed.");
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#9fd8d1]/30 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-3 hover:border-[#0e9185]/40">
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#0e9185] truncate mb-1">
            {typeLabel}
          </p>
          <h3 className="font-semibold text-black text-sm leading-snug line-clamp-2">
            {app.caseTitle || app.applicantName || "Untitled Application"}
          </h3>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-black/60">
        {app.caseNumber && (
          <p className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#0e9185]" />
            <span>Case: {app.caseNumber}</span>
          </p>
        )}
        {app.courtName && (
          <p className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0e9185]" />
            <span>{app.courtName}</span>
          </p>
        )}
        {app.hearingDate && (
          <p className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0e9185]" />
            <span>
              {new Date(app.hearingDate).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-2 flex-wrap">
        {app.autoGenerated && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9fd8d1]/20 text-[#026665] text-[11px] font-medium">
            <FileText className="w-3 h-3" /> Auto-generated
          </span>
        )}
        {app.aiEnhanced && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9fd8d1]/30 text-[#0e9185] text-[11px] font-medium">
            <Sparkles className="w-3 h-3" /> AI Enhanced
          </span>
        )}
        {app.version > 1 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef5f3] text-black/60 text-[11px] font-medium">
            v{app.version}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-[#9fd8d1]/20">
        <button
          onClick={onView}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-black/70 hover:text-[#026665] hover:bg-[#eef5f3] rounded-xl text-xs font-medium transition-all duration-200"
        >
          <Eye className="w-3.5 h-3.5" /> View Details
        </button>

        {(app.content || app.generatedText) &&
          !["review", "approved", "filed"].includes(app.status) && (
            <button
              onClick={handleQuickImprove}
              disabled={improving}
              title="Improve with AI"
              className="p-2 text-[#0e9185] hover:bg-[#9fd8d1]/20 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="p-2 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---─ Status Badge ------------─

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

// ---─ Create Application Modal ------------─

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
    ppcSections: "",
    judgeName: "",
    hearingDate: "",
    grounds: "",
    prayer: "",
    additionalNotes: "",
  });

  // Control flags
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [step, setStep] = useState("form");

  useEffect(() => {
    api
      .get("/api/cases?limit=100")
      .then((d) => setCases(d.data?.cases || []))
      .catch(() => {});
  }, []);

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

  const handleGenerate = async () => {
    if (!form.applicationType) {
      toast.error("Select an application type.");
      return;
    }
    setGenerating(true);
    try {
      const payload = buildPayload();
      const response = await api.post("/api/applications", payload);
      const application = response?.data?.application;

      if (!application) {
        throw new Error("Invalid response from server");
      }

      setGeneratedContent(application.content || "");
      setStep("preview");
      toast.success(
        useAI ? "Draft generated and AI-improved!" : "Draft generated!",
      );
      onCreated();
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
      const response = await api.post("/api/applications", {
        ...buildPayload(),
        autoGenerate: false,
        useAI: false,
      });

      if (!response?.data?.application) {
        throw new Error("Invalid response from server");
      }

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
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 ">
        {/* --- Type ---------------─ */}
        <div>
          <label className="text-sm font-medium text-black mb-1.5 block">
            Application Type <span className="text-[#026665]">*</span>
          </label>
          <select
            className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all"
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

        {/* --- Linked Case --------------------- */}
        <div>
          <label className="text-sm font-medium text-black mb-1.5 block">
            Link to Case{" "}
            <span className="text-black/50 font-normal normal-case">
              (auto-fills fields)
            </span>
          </label>
          <select
            className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all"
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

        {/* --- Case Details ------------------─ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-black mb-1.5 block">
              Case Title
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. State vs Ahmed Ali"
              value={form.caseTitle}
              onChange={set("caseTitle")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Case / Suit Number
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. 123/2024"
              value={form.caseNumber}
              onChange={set("caseNumber")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              FIR Number
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. 45/2024"
              value={form.firNo}
              onChange={set("firNo")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Applicant / Accused Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="Full name"
              value={form.applicantName}
              onChange={set("applicantName")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Respondent / Complainant
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="Full name or 'The State'"
              value={form.respondentName}
              onChange={set("respondentName")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Court Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. Lahore High Court"
              value={form.courtName}
              onChange={set("courtName")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Court Type
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. Sessions Court"
              value={form.courtType}
              onChange={set("courtType")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Judge Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="Honourable Mr. Justice ..."
              value={form.judgeName}
              onChange={set("judgeName")}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-black mb-1.5 block">
              Hearing Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all"
              value={form.hearingDate}
              onChange={set("hearingDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-black mb-1.5 block">
              PPC / Act Sections{" "}
              <span className="text-black/50 font-normal normal-case">
                (comma-separated)
              </span>
            </label>
            <input
              className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm font-mono focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40"
              placeholder="e.g. 302, 34, 120-B"
              value={form.ppcSections}
              onChange={set("ppcSections")}
            />
          </div>
        </div>

        {/* --- Grounds ------------ */}
        <div>
          <label className="text-sm font-medium text-black mb-1.5 block">
            Grounds{" "}
            <span className="text-black/50 font-normal normal-case">
              (one per line)
            </span>
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40 resize-none h-28"
            placeholder={
              "1. The applicant has no previous criminal record.\n2. The allegations are false and fabricated.\n3. The maximum sentence does not bar bail."
            }
            value={form.grounds}
            onChange={set("grounds")}
          />
        </div>

        {/* --- Prayer ------------─ */}
        <div>
          <label className="text-sm font-medium text-black mb-1.5 block">
            Prayer / Relief Sought
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40 resize-none h-20"
            placeholder="It is respectfully prayed that bail be granted..."
            value={form.prayer}
            onChange={set("prayer")}
          />
        </div>

        {/* --- Additional Notes ------------─ */}
        <div>
          <label className="text-sm font-medium text-black mb-1.5 block">
            Additional Notes / Submissions
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-[#eef5f3] border-0 rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all placeholder:text-black/40 resize-none h-16"
            placeholder="Any additional context or special circumstances..."
            value={form.additionalNotes}
            onChange={set("additionalNotes")}
          />
        </div>

        {/* --- Control Flags ------------------─ */}
        <div className="rounded-2xl border border-[#9fd8d1]/40 bg-[#eef5f3] p-5 space-y-4">
          <p className="text-xs font-bold text-[#026665] uppercase tracking-wide">
            Generation Options
          </p>

          {/* Auto-generate */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="w-5 h-5 accent-[#026665] mt-0.5 rounded-md border-[#9fd8d1]"
            />
            <div>
              <p className="text-sm font-medium text-black">
                Auto-Generate Draft
              </p>
              <p className="text-xs text-black/60">
                Use the built-in legal template to instantly produce a full
                application text from the fields above.
              </p>
            </div>
          </label>

          {/* AI Improve */}
          <label
            className={`flex items-start gap-3 cursor-pointer group ${
              !autoGenerate ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              disabled={!autoGenerate}
              className="w-5 h-5 accent-[#0e9185] mt-0.5 rounded-md border-[#9fd8d1]"
            />
            <div>
              <p className="text-sm font-medium text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0e9185]" />
                Improve with AI
              </p>
              <p className="text-xs text-black/60">
                After generation, send the draft to AI for legal language
                enhancement. Facts are preserved — only clarity and formal tone
                are improved. Requires OpenAI API key.
              </p>
            </div>
          </label>
        </div>

        {/* --- Actions ------------ */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#9fd8d1]/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-black/60 hover:text-black hover:bg-[#eef5f3] rounded-xl font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving || generating}
            className="px-5 py-2.5 text-[#026665] bg-[#eef5f3] hover:bg-[#9fd8d1]/30 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          {autoGenerate && (
            <button
              onClick={handleGenerate}
              disabled={saving || generating}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#026665] text-white rounded-xl font-medium hover:bg-[#0e9185] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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

// ---─ Application Detail Modal ------------─

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

  const handleImprove = async () => {
    setImproving(true);
    try {
      const res = await api.post("/api/applications/improve", {
        applicationId: data._id,
      });
      const updated = res?.data?.application;

      if (!updated) {
        throw new Error("Invalid response from server");
      }

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

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/applications/${data._id}`, {
        action: "submitForReview",
      });
      const updated = res?.data?.application;

      if (!updated) {
        throw new Error("Invalid response from server");
      }

      setData(updated);
      onUpdated(updated);
      toast.success("Submitted for senior review!");
    } catch (err) {
      toast.error(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      const res = await api.put(`/api/applications/${data._id}`, {
        content: contentDraft,
      });
      const updated = res?.data?.application;

      if (!updated) {
        throw new Error("Invalid response from server");
      }

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
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* --- Status + Meta ------------------─ */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={data.status} />
          {data.autoGenerated && (
            <span className="text-xs text-[#026665] bg-[#eef5f3] px-3 py-1 rounded-full font-medium">
              Auto-generated
            </span>
          )}
          {data.aiEnhanced && (
            <span className="text-xs text-[#0e9185] bg-[#9fd8d1]/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Enhanced
            </span>
          )}
          {data.version > 1 && (
            <span className="text-xs text-black/50 bg-[#eef5f3] px-3 py-1 rounded-full font-medium">
              v{data.version}
            </span>
          )}
        </div>

        {/* --- Key Fields ------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ["Applicant", data.applicantName, User],
            ["Respondent", data.respondentName, User],
            ["Case No.", data.caseNumber, Scale],
            ["FIR No.", data.firNo, FileText],
            ["Court", data.courtName, Building2],
            ["Judge", data.judgeName, Gavel],
            [
              "Hearing",
              data.hearingDate
                ? new Date(data.hearingDate).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null,
              Calendar,
            ],
            ["Sections", data.ppcSections?.join(", "), Layers],
          ]
            .filter(([, v]) => v)
            .map(([label, value, Icon]) => (
              <div
                key={label}
                className="bg-[#eef5f3] rounded-xl p-4 border border-[#9fd8d1]/20 hover:border-[#9fd8d1]/40 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#0e9185]" />}
                  <p className="text-xs text-black/50 font-medium">{label}</p>
                </div>
                <p className="text-black font-medium text-sm truncate">
                  {value}
                </p>
              </div>
            ))}
        </div>

        {/* --- Grounds ------------ */}
        {data.grounds?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-black mb-2">Grounds</p>
            <div className="bg-[#eef5f3] rounded-xl p-4 border border-[#9fd8d1]/20">
              <ol className="space-y-2">
                {data.grounds.map((g, i) => (
                  <li key={i} className="flex gap-3 text-sm text-black/80">
                    <span className="text-[#0e9185] font-mono text-xs mt-0.5 shrink-0">
                      {i + 1}.
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* --- Generated Content ------------─ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-black">Application Text</p>
            {canEdit && hasContent && (
              <div className="flex items-center gap-2">
                {!editingContent ? (
                  <button
                    onClick={() => setEditingContent(true)}
                    className="text-xs text-[#0e9185] hover:text-[#026665] font-medium transition-colors"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveContent}
                      disabled={savingContent}
                      className="text-xs text-[#026665] hover:text-[#0e9185] font-medium transition-colors disabled:opacity-40"
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
                      className="text-xs text-black/40 hover:text-black/60 font-medium transition-colors"
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
                className="w-full px-4 py-3 bg-[#eef5f3] border-0 rounded-xl text-black text-sm font-mono focus:ring-2 focus:ring-[#0e9185] focus:outline-none transition-all resize-none h-80"
                value={contentDraft}
                onChange={(e) => setContentDraft(e.target.value)}
              />
            ) : (
              <pre className="text-xs text-black/80 bg-[#eef5f3] rounded-xl px-4 py-4 border border-[#9fd8d1]/20 whitespace-pre-wrap font-mono overflow-x-auto max-h-80 overflow-y-auto">
                {data.content || data.generatedText}
              </pre>
            )
          ) : (
            <div className="bg-[#eef5f3] rounded-xl p-4 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-black/60">
                No draft content yet. Create a new version with Auto-Generate
                enabled.
              </p>
            </div>
          )}
        </div>

        {/* --- Review Note --------------------- */}
        {data.reviewNote && (
          <div className="bg-[#eef5f3] rounded-xl p-4 border border-[#9fd8d1]/30">
            <p className="text-xs font-semibold text-[#026665] mb-1">
              Review Note from Senior Lawyer
            </p>
            <p className="text-sm text-black/80">{data.reviewNote}</p>
          </div>
        )}

        {/* --- Action Bar ------------------------ */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#9fd8d1]/30">
          {/* AI Improve */}
          {canEdit && hasContent && (
            <button
              onClick={handleImprove}
              disabled={improving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#0e9185] bg-[#eef5f3] hover:bg-[#9fd8d1]/30 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#026665] text-white rounded-xl font-medium hover:bg-[#0e9185] transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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
            <span className="flex items-center gap-2 text-sm text-[#026665] font-medium bg-[#eef5f3] px-4 py-2 rounded-xl">
              <BadgeCheck className="w-4 h-4" /> Approved by Senior Lawyer
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

"use client";

export const dynamic = "force-dynamic";

/**
 * /app/(dashboard)/applications/review/page.js  (NEW)
 * ─────────────────────────────────────────────────────────────────────────────
 * Senior lawyer review dashboard.
 * Shows all applications with status = "review".
 * Allows: Approve, Request Changes (with a note), and view full content.
 *
 * Access should be restricted to senior lawyers / admins via middleware
 * or a role check (user.seniority === "senior" || user.role === "admin").
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { PageLoader, EmptyState, Modal } from "@/components/ui";
import {
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ClipboardList,
  Sparkles,
} from "lucide-react";

const APPLICATION_TYPES = {
  post_arrest_bail: "Post-Arrest Bail",
  pre_arrest_bail: "Pre-Arrest Bail",
  civil_suit: "Civil Suit",
  adjournment: "Adjournment",
  exemption: "Exemption",
  placement_of_documents: "Placement of Documents",
  substitute_witness: "Substitute Witness",
  miscellaneous: "Miscellaneous",
};

export default function ReviewDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/applications?status=review&limit=50");
      setApplications(data.data.applications || []);
    } catch {
      toast.error("Failed to load pending reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleUpdated = (updated) => {
    // Remove from list once approved/changed
    if (updated?._id) {
      setApplications((prev) => prev.filter((a) => a._id !== updated._id));
    }
    setViewTarget(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Review Queue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} awaiting your review
          </p>
        </div>
        <button onClick={fetchPending} className="btn-secondary">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications pending review"
          description="All caught up! Junior lawyers will submit new applications here for your approval."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ReviewCard
              key={app._id}
              app={app}
              onView={() => setViewTarget(app)}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}

      {viewTarget && (
        <ReviewDetailModal
          app={viewTarget}
          onClose={() => setViewTarget(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ app, onView, onUpdated }) {
  const [processing, setProcessing] = useState(null); // "approve" | "changes"
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const typeLabel =
    APPLICATION_TYPES[app.applicationType] || app.applicationType;

  const handleApprove = async () => {
    setProcessing("approve");
    try {
      const res = await api.put(`/api/applications/${app._id}`, {
        action: "approve",
      });

      if (!res?.data?.application) {
        throw new Error("Invalid response from server");
      }

      toast.success("Application approved!");
      onUpdated(res.data.application);
    } catch (err) {
      toast.error(err.message || "Approval failed.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!reviewNote.trim()) {
      toast.error("Please enter a note explaining what changes are needed.");
      return;
    }
    setProcessing("changes");
    try {
      const res = await api.put(`/api/applications/${app._id}`, {
        action: "requestChanges",
        reviewNote: reviewNote.trim(),
      });

      if (!res?.data?.application) {
        throw new Error("Invalid response from server");
      }

      toast.success("Changes requested. Junior lawyer notified.");
      onUpdated(res.data.application);
    } catch (err) {
      toast.error(err.message || "Failed to request changes.");
    } finally {
      setProcessing(null);
      setShowNoteInput(false);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary-600 mb-0.5">
            {typeLabel}
          </p>
          <h3 className="font-semibold text-slate-800 text-sm">
            {app.caseTitle || app.applicantName || "Untitled Application"}
          </h3>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
            {app.caseNumber && <span>Case: {app.caseNumber}</span>}
            {app.courtName && <span>Court: {app.courtName}</span>}
            {app.applicantName && <span>Applicant: {app.applicantName}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {app.autoGenerated && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              Auto-generated
            </span>
          )}
          {app.aiEnhanced && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Enhanced
            </span>
          )}
        </div>
      </div>

      {/* Note input for requesting changes */}
      {showNoteInput && (
        <div className="space-y-2">
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Explain what needs to be changed (e.g. 'Ground 3 is too vague — cite the specific precedent')..."
            className="textarea h-20 text-sm"
            autoFocus
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <button onClick={onView} className="btn-ghost text-xs">
          <Eye className="w-3.5 h-3.5" /> View Full Draft
        </button>
        <div className="flex-1" />

        {!showNoteInput ? (
          <>
            <button
              onClick={() => setShowNoteInput(true)}
              className="btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
            >
              <XCircle className="w-3.5 h-3.5" /> Request Changes
            </button>
            <button
              onClick={handleApprove}
              disabled={!!processing}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-xs"
            >
              {processing === "approve" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              Approve
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setShowNoteInput(false);
                setReviewNote("");
              }}
              className="btn-ghost text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={!!processing}
              className="btn-primary bg-amber-500 hover:bg-amber-600 text-xs"
            >
              {processing === "changes" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Send Feedback"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Review Detail Modal ──────────────────────────────────────────────────────

function ReviewDetailModal({ app, onClose, onUpdated }) {
  const [processing, setProcessing] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const typeLabel =
    APPLICATION_TYPES[app.applicationType] || app.applicationType;

  const handleApprove = async () => {
    setProcessing("approve");
    try {
      const res = await api.put(`/api/applications/${app._id}`, {
        action: "approve",
      });

      if (!res?.data?.application) {
        throw new Error("Invalid response from server");
      }

      toast.success("Application approved!");
      onUpdated(res.data.application);
    } catch (err) {
      toast.error(err.message || "Approval failed.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!reviewNote.trim()) {
      toast.error("Please add a note for the junior lawyer.");
      return;
    }
    setProcessing("changes");
    try {
      const res = await api.put(`/api/applications/${app._id}`, {
        action: "requestChanges",
        reviewNote: reviewNote.trim(),
      });

      if (!res?.data?.application) {
        throw new Error("Invalid response from server");
      }

      toast.success("Changes requested.");
      onUpdated(res.data.application);
    } catch (err) {
      toast.error(err.message || "Failed to request changes.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={typeLabel} size="xl">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Applicant", app.applicantName],
            ["Respondent", app.respondentName],
            ["Case No.", app.caseNumber],
            ["FIR No.", app.firNo],
            ["Court", app.courtName],
            ["Judge", app.judgeName],
            ["Sections", app.ppcSections?.join(", ")],
            ["Version", app.version ? `v${app.version}` : null],
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
                <p className="text-slate-700 font-medium text-sm">{value}</p>
              </div>
            ))}
        </div>

        {/* Grounds */}
        {app.grounds?.length > 0 && (
          <div>
            <p className="label">Grounds</p>
            <ol className="space-y-2">
              {app.grounds.map((g, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100"
                >
                  <span className="text-slate-400 font-mono text-xs mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  {g}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Full application text */}
        <div>
          <p className="label">Full Application Text</p>
          <pre className="text-xs text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 whitespace-pre-wrap font-mono overflow-x-auto max-h-96 overflow-y-auto">
            {app.content || app.generatedText || "No content available."}
          </pre>
        </div>

        {/* Review note input */}
        <div>
          <label className="label">
            Review Note{" "}
            <span className="text-slate-400 font-normal normal-case">
              (required if requesting changes)
            </span>
          </label>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Explain what needs to be changed or improved..."
            className="textarea h-24"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button
            onClick={handleRequestChanges}
            disabled={!!processing}
            className="btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            {processing === "changes" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Request Changes
          </button>
          <button
            onClick={handleApprove}
            disabled={!!processing}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
          >
            {processing === "approve" ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve
          </button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

export const dynamic = "force-dynamic";

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
  Clock,
  User,
  Hash,
  Building,
  FileText,
  AlertCircle,
  Send,
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
    if (updated?._id) {
      setApplications((prev) => prev.filter((a) => a._id !== updated._id));
    }
    setViewTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef5f3] via-white to-[#eef5f3]">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#026665]/5 to-[#0e9185]/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-[#9fd8d1]/30 p-6 shadow-lg shadow-[#026665]/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#026665] to-[#0e9185] rounded-xl shadow-md">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#000000] to-[#000000]">
                    Review Queue
                  </h1>
                </div>
                <p className="text-sm text-gray-600 ml-14">
                  {applications.length} application
                  {applications.length !== 1 ? "s" : ""} awaiting your review
                </p>
              </div>
              <button
                onClick={fetchPending}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-[#9fd8d1] rounded-xl text-[#026665] font-medium hover:bg-[#eef5f3] hover:border-[#0e9185] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <PageLoader />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#9fd8d1]/30 p-12 shadow-lg">
            <EmptyState
              icon={ClipboardList}
              title="No applications pending review"
              description="All caught up! Junior lawyers will submit new applications here for your approval."
            />
          </div>
        ) : (
          <div className="space-y-4">
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

        {/* Detail Modal */}
        {viewTarget && (
          <ReviewDetailModal
            app={viewTarget}
            onClose={() => setViewTarget(null)}
            onUpdated={handleUpdated}
          />
        )}
      </div>
    </div>
  );
}

// ----- Review Card -----
function ReviewCard({ app, onView, onUpdated }) {
  const [processing, setProcessing] = useState(null);
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
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-[#9fd8d1]/30 p-6 shadow-md hover:shadow-xl hover:border-[#0e9185]/40 transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Applicant Info */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-[#026665] to-[#0e9185] rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {app.userId?.name || "Unknown Junior"}
                </p>
                <p className="text-xs text-gray-500">{app.userId?.email}</p>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#026665]/10 to-[#0e9185]/10 text-[#026665] rounded-full text-xs font-semibold border border-[#9fd8d1]/40">
                <FileText className="w-3 h-3" />
                {typeLabel}
              </span>
              {app.autoGenerated && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  Auto-generated
                </span>
              )}
              {app.aiEnhanced && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-full text-xs font-medium border border-violet-200">
                  <Sparkles className="w-3 h-3" /> AI Enhanced
                </span>
              )}
            </div>

            {/* Case Title */}
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {app.caseTitle || app.applicantName || "Untitled Application"}
            </h3>

            {/* Meta Details */}
            <div className="flex flex-wrap gap-4 text-xs">
              {app.caseNumber && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Hash className="w-3 h-3 text-[#0e9185]" />
                  Case: {app.caseNumber}
                </span>
              )}
              {app.courtName && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <Building className="w-3 h-3 text-[#0e9185]" />
                  Court: {app.courtName}
                </span>
              )}
              {app.applicantName && (
                <span className="inline-flex items-center gap-1 text-gray-600">
                  <User className="w-3 h-3 text-[#0e9185]" />
                  Applicant: {app.applicantName}
                </span>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 lg:self-start">
            <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending Review
            </div>
          </div>
        </div>

        {/* Note input for requesting changes */}
        {showNoteInput && (
          <div className="space-y-2 animate-fadeIn">
            <div className="relative">
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Explain what needs to be changed (e.g. 'Ground 3 is too vague — cite the specific precedent')..."
                className="w-full h-24 px-4 py-3 bg-[#eef5f3]/50 border border-[#9fd8d1] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0e9185]/30 focus:border-[#0e9185] transition-all resize-none"
                autoFocus
              />
              <AlertCircle className="absolute top-3 right-3 w-4 h-4 text-amber-500" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-[#9fd8d1]/20">
          <button
            onClick={onView}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#026665] bg-gray-50 hover:bg-[#eef5f3] rounded-xl transition-all duration-200 border border-gray-200 hover:border-[#9fd8d1]"
          >
            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
            View Full Draft
          </button>
          <div className="flex-1" />

          {!showNoteInput ? (
            <>
              <button
                onClick={() => setShowNoteInput(true)}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 border border-amber-200 hover:border-amber-300"
              >
                <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={!!processing}
                className="group flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#026665] to-[#0e9185] hover:from-[#025554] hover:to-[#0a7d73] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {processing === "approve" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!!processing}
                className="group flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {processing === "changes" ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                Send Feedback
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Review Detail Modal -----
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
    <Modal isOpen onClose={onClose} size="xl">
      <div className="bg-gradient-to-b from-white to-[#eef5f3]/30 rounded-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-[#9fd8d1]/30 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#026665] to-[#0e9185] rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{typeLabel}</h2>
                <p className="text-sm text-gray-500">Detailed Review</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {app.autoGenerated && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  Auto-generated
                </span>
              )}
              {app.aiEnhanced && (
                <span className="px-3 py-1 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-full text-xs font-medium border border-violet-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Enhanced
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 max-h-[70vh] overflow-y-auto">
          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User, label: "Applicant", value: app.applicantName },
              { icon: User, label: "Respondent", value: app.respondentName },
              { icon: Hash, label: "Case No.", value: app.caseNumber },
              { icon: Hash, label: "FIR No.", value: app.firNo },
              { icon: Building, label: "Court", value: app.courtName },
              { icon: User, label: "Judge", value: app.judgeName },
              {
                icon: FileText,
                label: "Sections",
                value: app.ppcSections?.join(", "),
              },
              {
                icon: Clock,
                label: "Version",
                value: app.version ? `v${app.version}` : null,
              },
            ]
              .filter(([, , v]) => v)
              .map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="group bg-gradient-to-br from-[#eef5f3]/50 to-white rounded-xl p-4 border border-[#9fd8d1]/20 hover:border-[#0e9185]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#0e9185]" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {label}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 ml-6">
                    {value}
                  </p>
                </div>
              ))}
          </div>

          {/* Grounds */}
          {app.grounds?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-[#026665] to-[#0e9185] rounded-lg">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Grounds</h3>
              </div>
              <div className="space-y-2">
                {app.grounds.map((g, i) => (
                  <div
                    key={i}
                    className="group flex gap-3 bg-gradient-to-r from-[#eef5f3]/50 to-white rounded-xl p-4 border border-[#9fd8d1]/20 hover:border-[#0e9185]/30 transition-all duration-200"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#026665] to-[#0e9185] text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-1">
                      {g}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Application Text */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-[#026665] to-[#0e9185] rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Full Application Text
              </h3>
            </div>
            <div className="bg-gradient-to-br from-[#eef5f3]/30 to-white rounded-xl border border-[#9fd8d1]/20 overflow-hidden">
              <pre className="text-sm text-gray-800 p-5 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
                {app.content || app.generatedText || "No content available."}
              </pre>
            </div>
          </div>

          {/* Review Note Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <AlertCircle className="w-4 h-4 text-[#0e9185]" />
              Review Note
              <span className="text-gray-400 font-normal">
                (required if requesting changes)
              </span>
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Explain what needs to be changed or improved..."
              className="w-full h-28 px-4 py-3 bg-[#eef5f3]/30 border border-[#9fd8d1] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0e9185]/30 focus:border-[#0e9185] transition-all resize-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#9fd8d1]/30 p-6 rounded-b-2xl">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Close
            </button>
            <button
              onClick={handleRequestChanges}
              disabled={!!processing}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 border border-amber-200 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing === "changes" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              Request Changes
            </button>
            <button
              onClick={handleApprove}
              disabled={!!processing}
              className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#026665] to-[#0e9185] hover:from-[#025554] hover:to-[#0a7d73] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {processing === "approve" ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              Approve Application
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

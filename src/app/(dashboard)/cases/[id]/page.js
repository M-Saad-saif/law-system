"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate } from "@/utils/helpers";
import ProceedingsTab from "@/components/cases/ProceedingsTab";
import CitationsTab from "@/components/cases/CitationsTab";
import NotesTab from "@/components/cases/NotesTab";
import AccusedTab from "@/components/cases/AccusedTab";
import FeeTab from "@/components/cases/FeeTab";
import DownloadReportButton from "@/components/cases/Downloadreportbutton";
import ShareWithClientButton from "@/components/cases/ShareWithClientButton";
import GenerateDocButton from "@/components/cases/GenerateDocButton";
import OverviewTab from "@/components/cases/OverviewTab";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  User,
  Scale,
  Calendar,
  Hash,
  Gavel,
  FileText,
  StickyNote,
  BookMarked,
  Banknote,
  Star,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import {
  StatusBadge,
  PageLoader,
  ConfirmDialog,
  TabBar,
  Spinner,
} from "@/components/ui";

const TABS = [
  { id: "overview", label: "Overview", icon: Scale },
  { id: "proceedings", label: "Proceedings", icon: Calendar },
  { id: "accused", label: "Accused / Bail", icon: User },
  { id: "citations", label: "Citations", icon: BookMarked },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "fee", label: "Fee", icon: Banknote },
];

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      const response = await api.get(`/api/cases/${id}`);
      const caseData = response?.data?.case;

      if (!caseData) {
        throw new Error("Case not found");
      }

      setCaseData(caseData);
    } catch {
      toast.error("Failed to load case.");
      router.push("/cases");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/cases/${id}`);
      toast.success("Case deleted.");
      router.push("/cases");
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      const res = await api.patch(`/api/cases/${id}/favourite`);
      setCaseData((prev) => ({ ...prev, isFavourite: res.data.isFavourite }));
      toast.success(
        res.data.isFavourite ? "Saved to Library ⭐" : "Removed from Library",
      );
    } catch {
      toast.error("Failed to update.");
    }
  };

  const toggleStatus = async () => {
    const newStatus = caseData.status === "Closed" ? "Active" : "Closed";
    setStatusLoading(true);
    try {
      const res = await api.put(`/api/cases/${id}`, { status: newStatus });
      setCaseData(res.data.case);
      toast.success(`Case ${newStatus === "Closed" ? "closed" : "reopened"}.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!caseData) return null;

  const isClosed = caseData.status === "Closed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 backdrop-blur-sm">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl" />

          <div className="relative p-6 sm:p-8">
            {/* Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <button
                    onClick={() => router.push("/cases")}
                    className="hover:text-slate-700 transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Cases</span>
                  </button>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-slate-400 truncate">
                    {caseData.caseTitle}
                  </span>
                </div>

                {/* Title & Meta */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {caseData.caseTitle}
                    </h1>
                    <button
                      onClick={toggleFavourite}
                      className={`mt-1.5 p-2 rounded-xl transition-all duration-200 ${
                        caseData.isFavourite
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm shadow-amber-200/50"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      }`}
                      title={
                        caseData.isFavourite
                          ? "Remove from Library"
                          : "Save to Library"
                      }
                    >
                      <Star
                        className={`w-5 h-5 transition-transform ${
                          caseData.isFavourite
                            ? "fill-amber-500 scale-110"
                            : "hover:scale-110"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {caseData.caseNumber && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-mono font-semibold">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {caseData.caseNumber}
                      </span>
                    )}
                    <StatusBadge status={caseData.status} />
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Gavel className="w-3.5 h-3.5" />
                      {caseData.caseType} · {caseData.courtType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-slate-200/90 mt-2 mb-2"></div>
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 lg:self-start">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={toggleStatus}
                  disabled={statusLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isClosed
                      ? "bg-white text-emerald-600 shadow-sm hover:shadow-md"
                      : "bg-slate-800 text-white shadow-lg shadow-slate-800/20 hover:bg-slate-700"
                  }`}
                >
                  {statusLoading ? (
                    <Spinner
                      size="sm"
                      className={isClosed ? "" : "text-white"}
                    />
                  ) : isClosed ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isClosed ? "Reopen Case" : "Close Case"}
                </button>
              </div>

              {!isClosed && (
                <Link
                  href={`/cases/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}

              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              <DownloadReportButton
                caseId={id}
                caseTitle={caseData.caseTitle}
              />

              <GenerateDocButton caseId={id} caseTitle={caseData.caseTitle} />

              <ShareWithClientButton
                caseId={id}
                isSharedWithClient={caseData.isSharedWithClient}
                client={caseData.client}
                onAccessChanged={(update) =>
                  setCaseData((prev) => ({ ...prev, ...update }))
                }
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60">
              <QuickStat
                icon={Calendar}
                label="Next Hearing"
                value={formatDate(caseData.nextHearingDate) || "Not scheduled"}
                accent="blue"
              />
              <QuickStat
                icon={Users}
                label="Accused"
                value={caseData.accused?.length || 0}
                accent="purple"
              />
              <QuickStat
                icon={FileText}
                label="Proceedings"
                value={caseData.proceedings?.length || 0}
                accent="emerald"
              />
              <QuickStat
                icon={Clock}
                label="Last Updated"
                value={formatDate(caseData.updatedAt)}
                accent="orange"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-2 bg-slate-50/50 border-b border-slate-200/60">
            <TabBar
              tabs={TABS.map((t) => ({
                ...t,
                count:
                  t.id === "proceedings"
                    ? caseData.proceedings?.length
                    : t.id === "citations"
                      ? caseData.citations?.length
                      : t.id === "notes"
                        ? caseData.notes?.length
                        : t.id === "accused"
                          ? caseData.accused?.length
                          : t.id === "fee"
                            ? caseData.fee?.payments?.length || undefined
                            : undefined,
              }))}
              active={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="p-6">
            {activeTab === "overview" && <OverviewTab c={caseData} />}
            {activeTab === "proceedings" && (
              <ProceedingsTab
                caseId={id}
                proceedings={caseData.proceedings || []}
                onUpdate={fetchCase}
              />
            )}
            {activeTab === "accused" && (
              <AccusedTab
                caseId={id}
                accused={caseData.accused || []}
                onUpdate={fetchCase}
              />
            )}
            {activeTab === "citations" && (
              <CitationsTab
                caseId={id}
                citations={caseData.citations || []}
                onUpdate={fetchCase}
              />
            )}
            {activeTab === "notes" && (
              <NotesTab
                caseId={id}
                notes={caseData.notes || []}
                onUpdate={fetchCase}
              />
            )}
            {activeTab === "fee" && <FeeTab caseId={id} onUpdate={fetchCase} />}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Case"
        message={`Are you sure you want to delete "${caseData.caseTitle}"? This action is permanent and cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

// Quick Stat Component
function QuickStat({ icon: Icon, label, value, accent = "blue" }) {
  const accentColors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-slate-50 transition-colors group">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentColors[accent]} transition-transform group-hover:scale-110`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-bold text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

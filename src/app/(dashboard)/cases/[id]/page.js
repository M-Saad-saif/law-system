"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate, formatDateTime } from "@/utils/helpers";
import {
  StatusBadge,
  PageLoader,
  ConfirmDialog,
  TabBar,
  Spinner,
} from "@/components/ui";
import ProceedingsTab from "@/components/cases/ProceedingsTab";
import CitationsTab from "@/components/cases/CitationsTab";
import NotesTab from "@/components/cases/NotesTab";
import AccusedTab from "@/components/cases/AccusedTab";
import FeeTab from "@/components/cases/FeeTab";
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
  Phone,
  Gavel,
  FileText,
  StickyNote,
  BookMarked,
  Banknote,
  Star,
} from "lucide-react";

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
      const data = await api.get(`/api/cases/${id}`);
      setCaseData(data.data.case);
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
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.push("/cases")}
            className="btn-ghost p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="page-title truncate">{caseData.caseTitle}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {caseData.caseNumber && (
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  {caseData.caseNumber}
                </span>
              )}
              <StatusBadge status={caseData.status} />
              <span className="text-xs text-slate-400">
                {caseData.caseType} · {caseData.courtType}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={toggleFavourite}
            title={caseData.isFavourite ? "Remove from Library" : "Save to Library"}
            className={`btn-secondary gap-1.5 ${
              caseData.isFavourite
                ? "text-yellow-600 border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                : ""
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${caseData.isFavourite ? "fill-yellow-400 text-yellow-500" : ""}`}
            />
            {caseData.isFavourite ? "Saved" : "Save to Library"}
          </button>
          <button
            onClick={toggleStatus}
            disabled={statusLoading}
            className={
              isClosed
                ? "btn-secondary gap-1.5"
                : "btn bg-slate-700 text-white hover:bg-slate-800 gap-1.5"
            }
          >
            {statusLoading ? (
              <Spinner size="sm" className={isClosed ? "" : "text-white"} />
            ) : isClosed ? (
              <RotateCcw className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            {isClosed ? "Reopen" : "Close Case"}
          </button>
          {!isClosed && (
            <Link href={`/cases/${id}/edit`} className="btn-secondary">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Link>
          )}
          <button onClick={() => setShowDelete(true)} className="btn-danger">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
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

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Case"
        message={`Delete "${caseData.caseTitle}"? This is permanent and cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-slate-700 mt-0.5 font-medium">{value}</div>
      </div>
    </div>
  );
}

function OverviewTab({ c }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main */}
      <div className="lg:col-span-2 space-y-5">
        <div className="card p-5">
          <h3 className="section-title mb-4">Case Details</h3>
          <InfoRow icon={Scale} label="Case Type" value={c.caseType} />
          <InfoRow
            icon={Gavel}
            label="Court"
            value={[c.courtType, c.courtName].filter(Boolean).join(" — ")}
          />
          <InfoRow icon={Hash} label="Case Number" value={c.caseNumber} />
          <InfoRow icon={Hash} label="Suit / File No." value={c.suitNo} />
          <InfoRow icon={Hash} label="FIR No." value={c.firNo} />
          <InfoRow icon={User} label="Counsel For" value={c.counselFor} />
          <InfoRow icon={User} label="Judge" value={c.judgeName} />
          <InfoRow
            icon={Calendar}
            label="Filing Date"
            value={formatDate(c.filingDate)}
          />
        </div>

        {c.provisions?.length > 0 && (
          <div className="card p-5">
            <h3 className="section-title mb-3">Legal Provisions</h3>
            <div className="flex flex-wrap gap-2">
              {c.provisions.map((p, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar info */}
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="section-title mb-4">Client</h3>
          <InfoRow icon={User} label="Name" value={c.clientName} />
          <InfoRow icon={Phone} label="Contact" value={c.clientContact} />
          <InfoRow icon={Phone} label="Case Phone" value={c.phone} />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Opposite Counsel</h3>
          <InfoRow icon={User} label="Name" value={c.oppositeCounsel?.name} />
          <InfoRow
            icon={Phone}
            label="Contact"
            value={c.oppositeCounsel?.contact}
          />
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Schedule</h3>
          <InfoRow
            icon={Calendar}
            label="Next Hearing"
            value={formatDate(c.nextHearingDate)}
          />
          <InfoRow
            icon={Calendar}
            label="Next Proceeding"
            value={formatDate(c.nextProceedingDate)}
          />
          <InfoRow
            icon={Calendar}
            label="Last Updated"
            value={formatDateTime(c.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}
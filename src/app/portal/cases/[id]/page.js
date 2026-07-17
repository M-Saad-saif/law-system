"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, UploadCloud, Calendar, Wallet } from "lucide-react";

export default function PortalCaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/client-portal/cases/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        router.replace("/portal/login");
        return;
      }
      setData(json.data);
    } catch {
      toast.error("Failed to load case.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/client-portal/cases/${id}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed.");
      toast.success("Evidence uploaded.");
      load();
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1c3d3b]/60 text-sm">Loading…</div>;
  }
  if (!data) return null;

  const { case: caseDoc, upcomingEvents } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button
        onClick={() => router.push("/portal/dashboard")}
        className="flex items-center gap-1.5 text-sm text-[#1c3d3b]/60 hover:text-[#026665] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to your cases
      </button>

      <h1 className="text-xl font-semibold text-[#1c3d3b] mb-1">{caseDoc.caseTitle}</h1>
      <p className="text-sm text-[#1c3d3b]/60 mb-8">
        {caseDoc.courtName || caseDoc.courtType} · {caseDoc.caseType} · Status: {caseDoc.status}
      </p>

      {/* Upcoming hearings / meetings */}
      <section className="bg-white rounded-2xl ring-1 ring-[#ccebdb] p-6 mb-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#026665] mb-4">
          <Calendar className="w-4 h-4" /> Upcoming Hearings & Meetings
        </h2>
        {caseDoc.nextHearingDate && (
          <div className="text-sm text-[#1c3d3b] mb-2">
            Next hearing date: <strong>{new Date(caseDoc.nextHearingDate).toLocaleDateString()}</strong>
          </div>
        )}
        {upcomingEvents?.length ? (
          <ul className="space-y-2">
            {upcomingEvents.map((ev) => (
              <li key={ev._id} className="text-sm text-[#1c3d3b]/80 flex justify-between">
                <span>{ev.title} <span className="text-xs text-[#1c3d3b]/50">({ev.type})</span></span>
                <span>{new Date(ev.date).toLocaleDateString()} {ev.time}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#1c3d3b]/50">No upcoming events scheduled.</p>
        )}
      </section>

      {/* Billing / fee summary for THIS case */}
      {caseDoc.fee && (
        <section className="bg-white rounded-2xl ring-1 ring-[#ccebdb] p-6 mb-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#026665] mb-4">
            <Wallet className="w-4 h-4" /> Billing Summary
          </h2>
          <div className="text-sm text-[#1c3d3b] mb-2">
            Agreed Fee: PKR {Number(caseDoc.fee.agreedAmount || 0).toLocaleString()}
          </div>
          <div className="text-sm text-[#1c3d3b] mb-3">
            Paid: PKR{" "}
            {(caseDoc.fee.payments || [])
              .reduce((sum, p) => sum + Number(p.amount || 0), 0)
              .toLocaleString()}
          </div>
          {caseDoc.fee.payments?.length > 0 && (
            <ul className="space-y-1">
              {caseDoc.fee.payments.map((p, i) => (
                <li key={i} className="text-xs text-[#1c3d3b]/70 flex justify-between">
                  <span>{new Date(p.date).toLocaleDateString()} · {p.method}</span>
                  <span>PKR {Number(p.amount).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Shared documents + evidence upload */}
      <section className="bg-white rounded-2xl ring-1 ring-[#ccebdb] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#026665]">
            <FileText className="w-4 h-4" /> Documents
          </h2>
          <label className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#026665] hover:bg-[#0d8e83] rounded-lg px-3 py-1.5 cursor-pointer transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload Evidence"}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {caseDoc.documents?.length ? (
          <ul className="space-y-2">
            {caseDoc.documents.map((doc, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#026665] hover:underline"
                >
                  {doc.name}
                </a>
                {doc.uploadedByClient && (
                  <span className="text-xs text-[#1c3d3b]/40">Uploaded by you</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#1c3d3b]/50">No documents shared yet.</p>
        )}
      </section>
    </div>
  );
}

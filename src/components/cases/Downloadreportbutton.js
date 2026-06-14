"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Spinner } from "@/components/ui";
import toast from "react-hot-toast";

export default function DownloadReportButton({ caseId, caseTitle }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to generate report.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      if (!win) {
        window.location.href = `/api/cases/${caseId}/pdf`;
      }

      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      toast.success("Report opened — use Print › Save as PDF to download.");
    } catch (err) {
      toast.error(err.message || "Could not generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title={`Download report for "${caseTitle}"`}
      className="btn-secondary gap-1.5 bg-[#ccebdb]"
    >
      {loading ? <Spinner size="sm" /> : <FileDown className="w-3.5 h-3.5" />}
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}

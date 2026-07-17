"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui";
import toast from "react-hot-toast";

const TEMPLATE_OPTIONS = [
  { key: "vakalatnama", label: "Vakalatnama" },
  { key: "bail", label: "Bail Application" },
];

export default function GenerateDocButton({ caseId, caseTitle }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleGenerate = async (templateKey, label) => {
    if (loading) return;
    setLoading(true);
    setOpen(false);

    try {
      const res = await fetch(
        `/api/cases/${caseId}/generate-doc?template=${templateKey}`,
        { method: "GET", credentials: "include" },
      );

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to generate document.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "-")}-${(caseTitle || "case").replace(/[^a-z0-9]+/gi, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      toast.success(`${label} generated — opening in your downloads.`);
    } catch (err) {
      toast.error(err.message || "Could not generate document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        title={`Generate a Word document for "${caseTitle}"`}
        className="btn-secondary gap-1.5 bg-[#ccebdb]"
      >
        {loading ? <Spinner size="sm" /> : <FileText className="w-3.5 h-3.5" />}
        {loading ? "Generating…" : "Generate Doc"}
        {!loading && <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && !loading && (
        <div className="absolute right-0 mt-1 w-48 rounded-lg border border-[#0d8e83]/20 bg-white shadow-lg z-20 overflow-hidden">
          {TEMPLATE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleGenerate(opt.key, opt.label)}
              className="w-full text-left px-3 py-2 text-sm text-[#1c3d3b] hover:bg-[#ccebdb] transition-colors"
            >
              {opt.label} (.docx)
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

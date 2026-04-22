"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Scale, BookOpen, Tag, Trophy, AlertCircle } from "lucide-react";
import { PageLoader } from "@/components/ui";

const SECTIONS = [
  { key: "offenceName", label: "Offence", color: "bg-red-50 border-red-200" },
  { key: "courtName", label: "Court", color: "bg-blue-50 border-blue-200" },
  {
    key: "lawsDiscussed",
    label: "Laws Discussed",
    color: "bg-purple-50 border-purple-200",
  },
  {
    key: "crossExaminationQuestions",
    label: "Cross-Examination Questions",
    color: "bg-amber-50 border-amber-200",
  },
  {
    key: "courtExaminationOfEvidence",
    label: "Court Examination of Evidence",
    color: "bg-orange-50 border-orange-200",
  },
  {
    key: "finalDecision",
    label: "Final Decision",
    color: "bg-green-50 border-green-200",
  },
  {
    key: "voiceSummary",
    label: "Comprehensive Summary",
    color: "bg-teal-50 border-teal-200",
  },
];

export default function SharedEntryPage() {
  const { token } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/library/share?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.entry) setEntry(d.data.entry);
        else setError("This shared link is invalid or has expired.");
      })
      .catch(() => setError("Failed to load shared judgement."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <PageLoader />;

  if (error)
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-700">{error}</h2>
        <Link
          href="/library"
          className="mt-4 inline-block text-primary-600 hover:underline text-sm"
        >
          Go to Library
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {entry.citation && (
              <p className="text-xs font-mono text-teal-600 font-bold mb-1">
                {entry.citation}
              </p>
            )}
            <h1 className="text-xl font-bold text-slate-800">{entry.title}</h1>
            {entry.courtName && (
              <p className="text-sm text-slate-500 mt-0.5">{entry.courtName}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {entry.isMostImportant && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Trophy className="w-3 h-3" /> Most Important
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        {entry.judgementDate && (
          <p className="text-xs text-slate-400">
            {new Date(entry.judgementDate).toLocaleDateString("en-PK", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 7 sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(({ key, label, color }) =>
          entry[key] ? (
            <div key={key} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-2">
                {label}
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {entry[key]}
              </p>
            </div>
          ) : null,
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        Shared via LawPortal —{" "}
        <Link href="/library" className="text-primary-600 hover:underline">
          View Full Library
        </Link>
      </div>
    </div>
  );
}

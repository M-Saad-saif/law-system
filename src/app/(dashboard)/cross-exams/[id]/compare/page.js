// ─────────────────────────────────────────────────────────────────────────────
// /cross-exams/[id]/compare — Version history & diff view
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";

const FIELD_LABELS = {
  originalQuestion: "Original Question",
  originalAnswer: "Original Answer",
  editedQuestion: "Edited Question",
  editedAnswer: "Edited Answer",
  useEditedVersion: "Use Edited",
  isFlagged: "Flagged",
  isApproved: "Approved",
  strategyNote: "Strategy Note",
};

const DIFF_STYLE = {
  unchanged: { border: "border-l-slate-200", bg: "bg-white", badge: null },
  added: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50/40",
    badge: { label: "Added", cls: "bg-emerald-100 text-emerald-700" },
  },
  removed: {
    border: "border-l-red-400",
    bg: "bg-red-50/40",
    badge: { label: "Removed", cls: "bg-red-100 text-red-700" },
  },
  modified: {
    border: "border-l-amber-400",
    bg: "bg-amber-50/40",
    badge: { label: "Modified", cls: "bg-amber-100 text-amber-700" },
  },
};

export default function ComparePage() {
  const { id } = useParams();
  const [versions, setVersions] = useState([]);
  const [vA, setVA] = useState("");
  const [vB, setVB] = useState("");
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vLoading, setVLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/cross-exams/${id}/versions`)
      .then((d) => {
        const vs = d.versions || [];
        setVersions(vs);
        if (vs.length >= 2) {
          setVA(String(vs[1].version));
          setVB(String(vs[0].version));
        } else if (vs.length === 1) setVA(String(vs[0].version));
      })
      .catch(() => toast.error("Failed to load versions."))
      .finally(() => setVLoading(false));
  }, [id]);

  const compare = async () => {
    if (!vA || !vB || vA === vB) {
      toast.error("Select two different versions.");
      return;
    }
    setLoading(true);
    try {
      const d = await apiFetch(
        `/api/cross-exams/${id}/compare?versionA=${vA}&versionB=${vB}`,
      );
      setDiff(d);
    } catch (err) {
      toast.error(err.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => (d ? format(new Date(d), "dd MMM yyyy HH:mm") : "—");
  const changedCount = diff
    ? diff.diff.reduce(
        (n, w) =>
          n + (w.qaDiffs?.filter((q) => q.status !== "unchanged").length || 0),
        0,
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link
            href="/cross-exams"
            className="hover:text-slate-800 transition-colors"
          >
            Cross-Examinations
          </Link>
          <svg
            className="w-3 h-3 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            href={`/cross-exams/${id}`}
            className="hover:text-slate-800 transition-colors"
          >
            Edit
          </Link>
          <svg
            className="w-3 h-3 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-800 font-medium">Version History</span>
        </nav>

        <h1
          className="text-2xl font-bold text-slate-900 mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Version History &amp; Compare
        </h1>

        {vLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 font-medium">
              No version snapshots yet.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Submit the document to create the first snapshot.
            </p>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="mb-8">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Snapshot Timeline
              </h2>
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <div
                    key={v.version}
                    className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-5 py-4"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {v.message || "Version snapshot"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {fmtDate(v.createdAt)}
                      </p>
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-full font-bold">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compare selector */}
            {versions.length >= 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">
                  Compare Two Versions
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 w-20">
                      Version A (old)
                    </span>
                    <select
                      value={vA}
                      onChange={(e) => setVA(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="">— select —</option>
                      {versions.map((v) => (
                        <option key={v.version} value={String(v.version)}>
                          v{v.version}
                        </option>
                      ))}
                    </select>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 w-20">
                      Version B (new)
                    </span>
                    <select
                      value={vB}
                      onChange={(e) => setVB(e.target.value)}
                      className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="">— select —</option>
                      {versions.map((v) => (
                        <option key={v.version} value={String(v.version)}>
                          v{v.version}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={compare}
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-colors"
                  >
                    {loading ? "Comparing…" : "Compare →"}
                  </button>
                </div>
              </div>
            )}

            {/* Diff result */}
            {diff && (
              <div>
                {/* Legend + summary */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-200 inline-block" />
                      Added
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-red-200 inline-block" />
                      Removed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-200 inline-block" />
                      Modified
                    </span>
                  </div>
                  {changedCount > 0 && (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-semibold">
                      {changedCount} Q&A pair{changedCount !== 1 ? "s" : ""}{" "}
                      changed
                    </span>
                  )}
                </div>

                {diff.diff.map((witness) => {
                  const style =
                    DIFF_STYLE[witness.status] || DIFF_STYLE.unchanged;
                  return (
                    <div
                      key={witness.witnessId}
                      className="mb-6 bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      {/* Witness header */}
                      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                            {witness.witnessName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">
                            {witness.witnessName}
                          </span>
                        </div>
                        {style.badge && (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge.cls}`}
                          >
                            {style.badge.label}
                          </span>
                        )}
                      </div>

                      {/* QA diffs */}
                      {(witness.qaDiffs || []).length === 0 ? (
                        <p className="px-5 py-4 text-sm text-slate-400 italic">
                          No Q&A pairs in this witness section.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {witness.qaDiffs
                            .sort((a, b) => a.sequence - b.sequence)
                            .map((qa) => {
                              const qs =
                                DIFF_STYLE[qa.status] || DIFF_STYLE.unchanged;
                              return (
                                <div
                                  key={qa.qaId}
                                  className={`border-l-4 ${qs.border} ${qs.bg} px-5 py-4`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      Q{qa.sequence}
                                    </span>
                                    {qs.badge && (
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qs.badge.cls}`}
                                      >
                                        {qs.badge.label}
                                      </span>
                                    )}
                                  </div>
                                  {qa.changes.length > 0 && (
                                    <div className="space-y-3">
                                      {qa.changes.map((ch) => (
                                        <div key={ch.field}>
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                                            {FIELD_LABELS[ch.field] || ch.field}
                                          </p>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                              <p className="text-[10px] font-bold text-red-400 mb-1">
                                                Before
                                              </p>
                                              <p className="text-xs text-red-800 leading-relaxed">
                                                {String(ch.before) || (
                                                  <em>empty</em>
                                                )}
                                              </p>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                              <p className="text-[10px] font-bold text-emerald-500 mb-1">
                                                After
                                              </p>
                                              <p className="text-xs text-emerald-800 leading-relaxed">
                                                {String(ch.after) || (
                                                  <em>empty</em>
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {qa.status === "unchanged" && (
                                    <p className="text-xs text-slate-400 italic">
                                      No changes.
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

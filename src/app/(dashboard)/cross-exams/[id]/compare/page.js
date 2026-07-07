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
  unchanged: {
    border: "border-l-[#9fd8d1]",
    bg: "bg-white",
    badge: null,
  },
  added: {
    border: "border-l-[#0e9185]",
    bg: "bg-[#eef5f3]",
    badge: {
      label: "Added",
      cls: "bg-[#0e9185] text-white",
    },
  },
  removed: {
    border: "border-l-rose-400",
    bg: "bg-rose-50/60",
    badge: {
      label: "Removed",
      cls: "bg-rose-100 text-rose-700",
    },
  },
  modified: {
    border: "border-l-amber-400",
    bg: "bg-amber-50/60",
    badge: {
      label: "Modified",
      cls: "bg-amber-100 text-amber-800",
    },
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
    <div className="min-h-screen bg-gradient-to-b from-[#eef5f3] via-white to-[#eef5f3]/50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2.5 text-sm mb-10">
          <Link
            href="/cross-exams"
            className="text-[#0e9185] hover:text-[#026665] font-medium transition-colors duration-200"
          >
            Cross-Examinations
          </Link>
          <svg
            className="w-3.5 h-3.5 text-[#9fd8d1]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            href={`/cross-exams/${id}`}
            className="text-[#0e9185] hover:text-[#026665] font-medium transition-colors duration-200"
          >
            Edit
          </Link>
          <svg
            className="w-3.5 h-3.5 text-[#9fd8d1]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-[#026665] font-semibold">Version History</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl font-bold text-black mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Version History &amp; Compare
          </h1>
          <p className="text-[#0e9185] text-sm font-medium">
            Track changes and compare snapshots of your cross-examination
          </p>
        </div>

        {vLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-[#0e9185] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#9fd8d1]/50 shadow-lg shadow-[#026665]/5">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#eef5f3] flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#0e9185]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <p className="text-black font-semibold text-lg mb-1">
              No version snapshots yet.
            </p>
            <p className="text-[#0e9185] text-sm">
              Submit the document to create the first snapshot.
            </p>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-5 w-1 bg-[#026665] rounded-full" />
                <h2 className="text-sm font-bold text-black uppercase tracking-widest">
                  Snapshot Timeline
                </h2>
              </div>
              <div className="space-y-3">
                {versions.map((v, i) => (
                  <div
                    key={v.version}
                    className="group flex items-center gap-5 bg-white rounded-2xl border border-[#9fd8d1]/40 px-6 py-4 shadow-sm hover:shadow-md hover:border-[#0e9185]/30 transition-all duration-300"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300 ${
                        i === 0
                          ? "bg-gradient-to-br from-[#026665] to-[#0e9185] text-white shadow-lg shadow-[#026665]/20"
                          : "bg-[#eef5f3] text-[#026665] group-hover:bg-[#9fd8d1]/30"
                      }`}
                    >
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black">
                        {v.message || "Version snapshot"}
                      </p>
                      <p className="text-xs text-[#0e9185] mt-1 font-medium">
                        {fmtDate(v.createdAt)}
                      </p>
                    </div>
                    {i === 0 && (
                      <span className="text-[11px] bg-gradient-to-r from-[#026665] to-[#0e9185] text-white px-3 py-1.5 rounded-full font-bold shadow-sm">
                        Latest
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compare selector */}
            {versions.length >= 2 && (
              <div className="bg-white rounded-2xl border border-[#9fd8d1]/40 p-7 mb-10 shadow-lg shadow-[#026665]/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-5 w-1 bg-[#026665] rounded-full" />
                  <h2 className="text-sm font-bold text-black uppercase tracking-widest">
                    Compare Two Versions
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-black w-24">
                      Version A (old)
                    </span>
                    <select
                      value={vA}
                      onChange={(e) => setVA(e.target.value)}
                      className="border-2 border-[#9fd8d1]/50 rounded-xl px-4 py-3 text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-[#026665] bg-white hover:border-[#0e9185] transition-all duration-200 cursor-pointer"
                    >
                      <option value="">— select —</option>
                      {versions.map((v) => (
                        <option key={v.version} value={String(v.version)}>
                          v{v.version}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#eef5f3]">
                    <svg
                      className="w-5 h-5 text-[#026665]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-black w-24">
                      Version B (new)
                    </span>
                    <select
                      value={vB}
                      onChange={(e) => setVB(e.target.value)}
                      className="border-2 border-[#9fd8d1]/50 rounded-xl px-4 py-3 text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#026665] focus:border-[#026665] bg-white hover:border-[#0e9185] transition-all duration-200 cursor-pointer"
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
                    className="bg-gradient-to-r from-[#026665] to-[#0e9185] hover:from-[#0e9185] hover:to-[#026665] text-white px-7 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#026665]/20 hover:shadow-xl hover:shadow-[#026665]/30 active:scale-95"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Comparing…
                      </span>
                    ) : (
                      "Compare →"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Diff result */}
            {diff && (
              <div>
                {/* Legend + summary */}
                <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-[#9fd8d1]/30 px-5 py-3 shadow-sm">
                  <div className="flex gap-5 text-xs font-semibold">
                    <span className="flex items-center gap-2 text-black">
                      <span className="w-3.5 h-3.5 rounded-md bg-[#0e9185] inline-block shadow-sm" />
                      Added
                    </span>
                    <span className="flex items-center gap-2 text-black">
                      <span className="w-3.5 h-3.5 rounded-md bg-rose-400 inline-block shadow-sm" />
                      Removed
                    </span>
                    <span className="flex items-center gap-2 text-black">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-400 inline-block shadow-sm" />
                      Modified
                    </span>
                  </div>
                  {changedCount > 0 && (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-full font-bold">
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
                      className="mb-6 bg-white rounded-2xl border border-[#9fd8d1]/30 overflow-hidden shadow-lg shadow-[#026665]/5 hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Witness header */}
                      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#eef5f3] to-white border-b border-[#9fd8d1]/30">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#026665] to-[#0e9185] text-white flex items-center justify-center text-xs font-bold shadow-md">
                            {witness.witnessName?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <span className="font-bold text-black text-sm">
                            {witness.witnessName}
                          </span>
                        </div>
                        {style.badge && (
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full ${style.badge.cls}`}
                          >
                            {style.badge.label}
                          </span>
                        )}
                      </div>

                      {/* QA diffs */}
                      {(witness.qaDiffs || []).length === 0 ? (
                        <p className="px-6 py-5 text-sm text-[#0e9185] italic font-medium">
                          No Q&A pairs in this witness section.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#9fd8d1]/20">
                          {witness.qaDiffs
                            .sort((a, b) => a.sequence - b.sequence)
                            .map((qa) => {
                              const qs =
                                DIFF_STYLE[qa.status] || DIFF_STYLE.unchanged;
                              return (
                                <div
                                  key={qa.qaId}
                                  className={`border-l-[3px] ${qs.border} ${qs.bg} px-6 py-5 transition-colors duration-200`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold text-black uppercase tracking-widest bg-white/80 px-2.5 py-1 rounded-lg">
                                      Q{qa.sequence}
                                    </span>
                                    {qs.badge && (
                                      <span
                                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${qs.badge.cls}`}
                                      >
                                        {qs.badge.label}
                                      </span>
                                    )}
                                  </div>
                                  {qa.changes.length > 0 && (
                                    <div className="space-y-4">
                                      {qa.changes.map((ch) => (
                                        <div key={ch.field}>
                                          <p className="text-[11px] font-bold text-black uppercase tracking-wide mb-2 bg-white/60 inline-block px-2.5 py-1 rounded-lg">
                                            {FIELD_LABELS[ch.field] || ch.field}
                                          </p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
                                              <p className="text-[10px] font-bold text-rose-600 mb-1.5 uppercase tracking-wider">
                                                Before
                                              </p>
                                              <p className="text-sm text-black leading-relaxed font-medium">
                                                {String(ch.before) || (
                                                  <em className="text-rose-400">
                                                    empty
                                                  </em>
                                                )}
                                              </p>
                                            </div>
                                            <div className="bg-[#eef5f3] border border-[#0e9185]/30 rounded-xl p-4 shadow-sm">
                                              <p className="text-[10px] font-bold text-[#026665] mb-1.5 uppercase tracking-wider">
                                                After
                                              </p>
                                              <p className="text-sm text-black leading-relaxed font-medium">
                                                {String(ch.after) || (
                                                  <em className="text-[#0e9185]">
                                                    empty
                                                  </em>
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {qa.status === "unchanged" && (
                                    <p className="text-sm text-[#0e9185] italic font-medium">
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

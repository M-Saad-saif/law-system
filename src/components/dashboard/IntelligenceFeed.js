"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/utils/api";
import { Calendar, Scale, School } from "lucide-react";

// ----- Badge colour helpers -----
const importanceConfig = {
  High: { dot: "#E24B4A", bg: "#FCEBEB", text: "#A32D2D" },
  Medium: { dot: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
  Low: { dot: "#639922", bg: "#EAF3DE", text: "#3B6D11" },
};

const outcomeConfig = {
  "Bail Granted": { bg: "#EAF3DE", text: "#3B6D11" },
  "Bail Refused": { bg: "#FCEBEB", text: "#A32D2D" },
  "Appeal Allowed": { bg: "#EAF3DE", text: "#3B6D11" },
  "Appeal Dismissed": { bg: "#FCEBEB", text: "#A32D2D" },
  Acquitted: { bg: "#EAF3DE", text: "#3B6D11" },
  Convicted: { bg: "#FCEBEB", text: "#A32D2D" },
  Remanded: { bg: "#FFF3CD", text: "#856404" },
};

const FILTERS = [
  { label: "All", value: "" },
  { label: "Bail", value: "Bail" },
  { label: "Criminal", value: "Criminal" },
  { label: "Family", value: "Family" },
  { label: "High Priority", value: "High" },
];

// ----- Single judgment card -----
function JudgmentCard({ j }) {
  const [expanded, setExpanded] = useState(false);
  const imp = importanceConfig[j.importance] || importanceConfig.Medium;
  const out = outcomeConfig[j.outcome] || { bg: "#f1f5f9", text: "#475569" };

  const dateStr = j.decisionDate
    ? new Date(j.decisionDate).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className="border border-slate-200 rounded-2xl p-5 bg-white transition-all duration-200 cursor-pointer hover:border-slate-300  h-full flex flex-col hover:bg-gradient-to-t hover:from-[#22656c0d] hover:to-transparent
        border-[#027f7e]/30 hover:shadow-sm"
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Importance dot + sections + case type */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div
              className="flex items-center gap-1.5 py-0.5 pl-1.5 pr-2.5 rounded-full"
              style={{ background: imp.bg }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: imp.dot }}
              />
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: imp.text }}
              >
                {j.importance || "Medium"} Priority
              </span>
            </div>
            {j.ppcSections?.map((s) => (
              <span
                key={s}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-mono tracking-wide"
              >
                §{s} PPC
              </span>
            ))}
            {j.caseType && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                {j.caseType}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-base font-semibold text-slate-900 leading-tight mb-2 tracking-tight">
            {j.title}
          </h4>
        </div>

        {/* Outcome badge */}
        {j.outcome && (
          <span
            className="text-xs font-semibold py-1.5 px-3.5 rounded-full whitespace-nowrap flex-shrink-0 shadow-sm"
            style={{ background: out.bg, color: out.text }}
          >
            {j.outcome}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex gap-4 mt-2 flex-wrap items-center">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="bg-[#0266653b] p-[5px] rounded-[16px] text-[#004b49]">
            <School size={15} />
          </span>{" "}
          {j.court}
        </span>
        {j.judgeName && (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="bg-[#0266653b] p-[5px] rounded-[16px] text-[#004b49]">
              <Scale size={15} />
            </span>{" "}
            {j.judgeName}
          </span>
        )}
        {dateStr && (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="bg-[#0266653b] p-[5px] rounded-[16px] text-[#004b49]">
              <Calendar size={15} />
            </span>{" "}
            {dateStr}
          </span>
        )}
      </div>

      {/* Summary  */}
      <p
        className="text-sm text-black-600 mt-3 leading-relaxed flex-1"
        style={{
          overflow: expanded ? "visible" : "hidden",
          display: expanded ? "block" : "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {j.summary}
      </p>

      {/* Expanded: headnote + tags */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {j.headnote && (
            <div className="text-sm bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-800 leading-relaxed mb-3.5">
              <span className="font-bold mr-1.5">Key principle:</span>
              {j.headnote}
            </div>
          )}
          {j.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {j.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          {j.sourceUrl && (
            <a
              href={j.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-indigo-600 mt-3.5 inline-flex items-center gap-1.5 no-underline font-medium border-b border-indigo-200 pb-0.5 hover:text-indigo-700"
            >
              <span>🔗</span> View original source
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Main feed component -----
export default function IntelligenceFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: "4",
        page: String(page),
      });
      if (activeFilter === "High") params.set("importance", "High");
      else if (activeFilter) params.set("caseType", activeFilter);
      if (searchSection.trim()) params.set("section", searchSection.trim());

      const res = await apiFetch(`/api/intelligence?${params.toString()}`);
      if (!res.success) throw new Error(res.message || "Failed to load");
      setAlerts(res.data || []);
      setPagination(
        res.pagination || { total: 0, page: 1, limit: 4, totalPages: 1 },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchSection, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchSection]);

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-6 pt-2">
      {/* ----- Header ----- */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b-2  border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 rounded-full w-10 h-10 flex items-center justify-center text-xl">
            <Scale />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 m-0 tracking-tight">
              Intelligence Feed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              Track latest judicial decisions
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold ml-2">
            Recent Judgments
          </span>
        </div>

        {/* PPC section quick-search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 pl-3.5 pr-1 py-0.5">
            <input
              type="text"
              placeholder="PPC section, e.g. 302"
              value={searchSection}
              onChange={(e) => setSearchSection(e.target.value)}
              className="text-[13px] py-1.5 border-none bg-transparent text-slate-900 outline-none w-36"
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <button
              onClick={load}
              className="text-xs px-4 py-1.5 rounded-full bg-[#103168] text-white border-none cursor-pointer font-semibold ml-1.5 transition-colors hover:bg-[#16418c]"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ----- Filter pills ----- */}
      <div className="flex gap-2 flex-wrap mt-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`text-[13px] px-4 py-1.5 rounded-full border font-medium transition-all duration-150 ${
              activeFilter === f.value
                ? "border-[#103168]-600 bg-[#103168] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ----- Content area - 2 column grid ----- */}
      <div className="mt-1">
        {loading ? (
          <div className="flex justify-center items-center py-14 text-slate-500 text-sm gap-3">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <span>Loading judgments…</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-6 bg-red-50 rounded-2xl text-red-700 text-sm">
            <div className="text-3xl mb-2">⚠️</div>
            {error} —{" "}
            <button
              onClick={load}
              className="text-indigo-600 bg-none border-none cursor-pointer underline text-sm font-medium ml-1.5 hover:text-indigo-700"
            >
              retry
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-14 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
            <div className="text-4xl mb-3">📭</div>
            No judgments found for this filter.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((j) => (
                <JudgmentCard key={j._id} j={j} />
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className={`text-xs px-4 py-1.5 rounded-full font-semibold ${
                  pagination.page <= 1
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#103168] text-white hover:bg-[#16418c]"
                }`}
              >
                Prev
              </button>

              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.page >= pagination.totalPages}
                className={`text-xs px-4 py-1.5 rounded-full font-semibold ${
                  pagination.page >= pagination.totalPages
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-[#103168] text-white hover:bg-[#16418c]"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { PageLoader, EmptyState, SearchInput } from "@/components/ui";
import {
  Scale,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  X,
} from "lucide-react";

const COURTS = [
  "",
  "Supreme Court",
  "Lahore High Court",
  "Sindh High Court",
  "Peshawar High Court",
  "Islamabad High Court",
  "Balochistan High Court",
  "Session Court",
  "Other",
];
const CASE_TYPES = [
  "",
  "Bail",
  "Criminal",
  "Civil",
  "Family",
  "Tax",
  "Constitutional",
  "Other",
];
const OUTCOMES = [
  "",
  "Bail Granted",
  "Bail Refused",
  "Appeal Allowed",
  "Appeal Dismissed",
  "Acquitted",
  "Convicted",
  "Remanded",
  "Other",
];
const IMPORTANCE = ["", "High", "Medium", "Low"];
const PPC_SECTIONS = [
  "",
  "302",
  "324",
  "376",
  "392",
  "394",
  "420",
  "468",
  "471",
  "489-F",
  "9(c) CNSA",
];

const importanceBadge = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};
const outcomeBadge = {
  "Bail Granted": "bg-green-50 text-green-700",
  "Bail Refused": "bg-red-50 text-red-700",
  "Appeal Allowed": "bg-green-50 text-green-700",
  "Appeal Dismissed": "bg-red-50 text-red-700",
  Acquitted: "bg-green-50 text-green-700",
  Convicted: "bg-red-50 text-red-700",
  Remanded: "bg-amber-50 text-amber-700",
};

function ResultCard({ j }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`card p-5 cursor-pointer transition-all hover:shadow-md ${
        j.importance === "High"
          ? "border-l-4 border-l-red-400"
          : j.importance === "Medium"
            ? "border-l-4 border-l-amber-400"
            : "border-l-4 border-l-green-400"
      }`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${importanceBadge[j.importance] || importanceBadge.Medium}`}
            >
              {j.importance} Priority
            </span>
            {j.outcome && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${outcomeBadge[j.outcome] || "bg-slate-100 text-slate-600"}`}
              >
                {j.outcome}
              </span>
            )}
            {j.caseType && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                {j.caseType}
              </span>
            )}
            {j.ppcSections?.map((s) => (
              <span
                key={s}
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800"
              >
                §{s} PPC
              </span>
            ))}
          </div>

          <h3 className="font-semibold text-slate-800 text-sm leading-snug">
            {j.title}
          </h3>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span>{j.court}</span>
            {j.judgeName && (
              <>
                <span>·</span>
                <span>{j.judgeName}</span>
              </>
            )}
            {j.decisionDate && (
              <>
                <span>·</span>
                <span>
                  {new Date(j.decisionDate).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
        {j.sourceUrl && (
          <a
            href={j.sourceUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-slate-400 hover:text-primary-600 p-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Summary always visible */}
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{j.summary}</p>

      {/* Expanded: headnote */}
      {expanded && j.headnote && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
            Key Legal Principle
          </p>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{j.headnote}"
          </p>
        </div>
      )}

      {j.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {j.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JudgementSearchPage() {
  const [search, setSearch] = useState("");
  const [court, setCourt] = useState("");
  const [caseType, setCaseType] = useState("");
  const [outcome, setOutcome] = useState("");
  const [section, setSection] = useState("");
  const [importance, setImportance] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set("search", search);
      if (court) params.set("court", court);
      if (caseType) params.set("caseType", caseType);
      if (outcome) params.set("outcome", outcome);
      if (section) params.set("section", section);
      if (importance) params.set("importance", importance);
      if (year) params.set("year", year);

      const res = await api.get(`/api/judgement-search?${params}`);
      setResults(res?.data?.results || []);
      setTotal(res?.data?.total || 0);
      setTotalPages(res?.data?.totalPages || 1);
    } catch {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [search, court, caseType, outcome, section, importance, year, page]);

  const clearFilters = () => {
    setCourt("");
    setCaseType("");
    setOutcome("");
    setSection("");
    setImportance("");
    setYear("");
    setPage(1);
  };

  const hasFilters =
    court || caseType || outcome || section || importance || year;

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchResults();
  };

  // Auto-search on page change
  useEffect(() => {
    if (searched) fetchResults();
  }, [page, fetchResults, searched]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">
          Judgement Search & Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Search Pakistani court precedents across Supreme Court, High Courts,
          and Sessions Courts
        </p>
      </div>

      {/* Search + Filters card */}
      <div className="card p-5 space-y-4">
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search by title, judge name, legal principle, keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </form>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <select
            className="select w-auto text-xs py-1.5"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
          >
            <option value="">All Courts</option>
            {COURTS.filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="select w-auto text-xs py-1.5"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
          >
            <option value="">All Types</option>
            {CASE_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="select w-auto text-xs py-1.5"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="">All Outcomes</option>
            {OUTCOMES.filter(Boolean).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <select
            className="select w-auto text-xs py-1.5"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">All PPC Sections</option>
            {PPC_SECTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                §{s} PPC
              </option>
            ))}
          </select>

          <select
            className="select w-auto text-xs py-1.5"
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
          >
            <option value="">All Priority</option>
            {IMPORTANCE.filter(Boolean).map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input w-24 text-xs py-1.5"
            placeholder="Year"
            min="1947"
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost text-xs text-red-500 py-1.5 gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Scale className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-600 font-semibold">
            Search Pakistani Legal Precedents
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Enter a keyword, PPC section, judge name, or select filters above
          </p>
        </div>
      )}

      {loading && <PageLoader />}

      {!loading && searched && (
        <>
          {results.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No judgements found"
              description="Try different keywords or broaden your filters."
            />
          ) : (
            <>
              <p className="text-xs text-slate-500">
                {total} judgement{total !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((j) => (
                  <ResultCard key={j._id} j={j} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

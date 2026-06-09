"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Scale,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Calendar,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/utils/api";

const PAGE_SIZE = 20;

const COURT_TABS = [
  { abbr: "ALL", label: "All Courts", color: "#6366f1", bg: "#eef2ff" },
  { abbr: "SCP", label: "Supreme Court", color: "#7c3aed", bg: "#f5f3ff" },
  { abbr: "LHC", label: "Lahore High Court", color: "#0369a1", bg: "#e0f2fe" },
  {
    abbr: "IHC",
    label: "Islamabad High Court",
    color: "#b45309",
    bg: "#fef3c7",
  },
  {
    abbr: "PHC",
    label: "Peshawar High Court",
    color: "#be185d",
    bg: "#fce7f3",
  },
  {
    abbr: "BHC",
    label: "High Court of Balochistan",
    color: "#7c2d12",
    bg: "#ffedd5",
  },
];

function CourtBadge({ abbr }) {
  const meta = COURT_TABS.find((c) => c.abbr === abbr) ?? COURT_TABS[0];
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: meta.bg, color: meta.color }}
    >
      {abbr}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function JudgmentCard({ judgment }) {
  const date = formatDate(judgment.orderDate);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <CourtBadge abbr={judgment.courtAbbr} />
        {judgment.approved && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            ✓ Approved
          </span>
        )}
        {judgment.matter && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {judgment.matter}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
        {judgment.title}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="truncate max-w-[200px]">{judgment.courtFull}</span>
        {judgment.judge && (
          <>
            <span className="text-slate-300">·</span>
            <span className="truncate max-w-[180px]">{judgment.judge}</span>
          </>
        )}
        {date && (
          <>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          </>
        )}
      </div>

      {judgment.citation && (
        <p className="text-[11px] font-mono text-indigo-600 font-semibold">
          {judgment.citation}
        </p>
      )}

      {judgment.sourceUrl && (
        <a
          href={judgment.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium no-underline"
        >
          <ExternalLink className="w-3 h-3" />
          View judgment
        </a>
      )}
    </div>
  );
}

function CourtTabs({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {COURT_TABS.map(({ abbr, label, color, bg }) => {
        const count = abbr === "ALL" ? counts.total : (counts[abbr] ?? 0);
        const isActive = active === abbr;
        return (
          <button
            key={abbr}
            onClick={() => onChange(abbr)}
            className={`whitespace-nowrap text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
              isActive
                ? "text-white border-transparent shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
            style={isActive ? { background: color } : {}}
            title={label}
          >
            {abbr === "ALL" ? "All" : abbr}
            {count > 0 && (
              <span
                className={`ml-1 text-[10px] ${isActive ? "opacity-75" : "text-slate-400"}`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 animate-pulse flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="h-4 w-10 rounded-full bg-slate-200" />
        <div className="h-4 w-16 rounded-full bg-slate-100" />
      </div>
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

export default function JudgmentsPage() {
  const [allJudgments, setAllJudgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [syncRequired, setSyncRequired] = useState(false);

  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/legal-updates?limit=200");
      if (!res.success)
        throw new Error(res.error || "Failed to fetch judgments");
      setAllJudgments(res.data ?? []);
      setFetchedAt(res.fetchedAt ?? null);
      setSyncRequired(Boolean(res.syncRequired));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  const counts = useMemo(() => {
    const c = { total: allJudgments.length };
    for (const j of allJudgments) {
      c[j.courtAbbr] = (c[j.courtAbbr] ?? 0) + 1;
    }
    return c;
  }, [allJudgments]);

  const tabFiltered = useMemo(
    () =>
      activeTab === "ALL"
        ? allJudgments
        : allJudgments.filter((j) => j.courtAbbr === activeTab),
    [allJudgments, activeTab],
  );

  const searchFiltered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tabFiltered;
    return tabFiltered.filter(
      (j) =>
        j.title?.toLowerCase().includes(q) ||
        j.citation?.toLowerCase().includes(q) ||
        j.judge?.toLowerCase().includes(q),
    );
  }, [tabFiltered, search]);

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / PAGE_SIZE));
  const paginated = searchFiltered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const lastUpdated = fetchedAt
    ? new Date(fetchedAt).toLocaleString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            Court Judgments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Latest judgments from Pakistani superior courts — updated
            automatically every 3 days.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-100 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {syncRequired && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No judgments in the database yet.</p>
            <p className="text-xs mt-1">
              Ask an admin to trigger a sync from the Admin panel, or wait for
              the automatic cron job to run (every 3 days).
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, citation, or judge name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
          />
        </div>

        <CourtTabs
          active={activeTab}
          onChange={(abbr) => setActiveTab(abbr)}
          counts={counts}
        />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {loading
              ? "Loading…"
              : `${searchFiltered.length} judgment${searchFiltered.length !== 1 ? "s" : ""} found`}
          </span>
          {lastUpdated && <span>Updated {lastUpdated}</span>}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="font-semibold text-slate-700">
            Could not load judgments
          </p>
          <p className="text-sm text-slate-500 mt-1 mb-4">{error}</p>
          <button
            onClick={load}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      ) : searchFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
          <p className="font-semibold text-slate-600">No judgments found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search
              ? `No results for "${search}". Try different keywords.`
              : `No judgments available for ${activeTab === "ALL" ? "any court" : activeTab} yet.`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((j, i) => (
              <JudgmentCard key={j._id || j.sourceUrl || i} judgment={j} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 min-w-[100px] text-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

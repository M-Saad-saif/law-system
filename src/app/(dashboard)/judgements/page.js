"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  Hash,
  Tag,
  Gavel,
} from "lucide-react";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

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
  {
    abbr: "SHC",
    label: "Sindh High Court",
    color: "#0f766e",
    bg: "#ccfbf1",
  },
];

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

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
  const [expanded, setExpanded] = useState(false);
  const date = formatDate(judgment.orderDate);
  const keywords = judgment.keywords ?? [];
  const visibleKeywords = keywords.slice(0, 3);
  const extraKeywordCount = keywords.length - visibleKeywords.length;

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
        {judgment.status && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            {judgment.status}
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

      {(judgment.caseNumber || judgment.bench) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {judgment.caseNumber && (
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {judgment.caseNumber}
            </span>
          )}
          {judgment.bench && (
            <span className="flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              {judgment.bench}
            </span>
          )}
        </div>
      )}

      {judgment.citation && (
        <p className="text-[11px] font-mono text-indigo-600 font-semibold">
          {judgment.citation}
        </p>
      )}

      {visibleKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {visibleKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"
            >
              <Tag className="w-2.5 h-2.5" />
              {kw}
            </span>
          ))}
          {extraKeywordCount > 0 && (
            <span className="text-[10px] text-slate-400">
              +{extraKeywordCount} more
            </span>
          )}
        </div>
      )}

      {judgment.summary && (
        <div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700"
          >
            {expanded ? (
              <>
                Hide summary <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show summary <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
          {expanded && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {judgment.summary}
            </p>
          )}
        </div>
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
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [syncRequired, setSyncRequired] = useState(false);

  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [courtCounts, setCourtCounts] = useState({ total: 0 });

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 350);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const myRequestId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (activeTab !== "ALL") params.set("courts", activeTab);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await apiFetch(`/api/legal-updates?${params.toString()}`);
      if (myRequestId !== requestId.current) return; // stale response
      if (!res.success)
        throw new Error(res.error || "Failed to fetch judgments");

      setJudgments(res.data ?? []);
      setFetchedAt(res.fetchedAt ?? null);
      setSyncRequired(Boolean(res.syncRequired));
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);

      const counts = { total: res.totalAllCourts ?? 0 };
      for (const c of res.courts ?? []) counts[c.court] = c.count;
      setCourtCounts(counts);
    } catch (err) {
      if (myRequestId !== requestId.current) return;
      setError(err.message);
    } finally {
      if (myRequestId === requestId.current) setLoading(false);
    }
  }, [page, activeTab, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await apiFetch("/api/sync-judgments-sheet", {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message || "Sync failed");
      setSyncMessage(
        `Synced: ${res.inserted} new, ${res.updated} updated, ${res.skipped} skipped.`,
      );
      await load();
    } catch (err) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }, [load]);

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
            Latest judgments from Pakistani superior courts — synced from the
            judgment feed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              title="Pull the latest rows from the Google Sheet feed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          )}
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
      </div>

      {syncMessage && (
        <div className="text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
          {syncMessage}
        </div>
      )}

      {syncRequired && !loading && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No judgments in the database yet.</p>
            <p className="text-xs mt-1">
              {isAdmin
                ? 'Click "Sync now" above, or wait for the automatic cron job to run.'
                : "Ask an admin to trigger a sync, or wait for the automatic cron job to run."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, citation, case number, or judge…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
          />
        </div>

        <CourtTabs
          active={activeTab}
          onChange={(abbr) => setActiveTab(abbr)}
          counts={courtCounts}
        />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {loading
              ? "Loading…"
              : `${total} judgment${total !== 1 ? "s" : ""} found`}
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
      ) : judgments.length === 0 ? (
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
            {judgments.map((j, i) => (
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

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
  Sparkles,
  Clock,
  Filter,
  ArrowUpRight,
  Layers,
  TrendingUp,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 20;

const COURT_TABS = [
  {
    abbr: "ALL",
    label: "All Courts",
    gradient: "from-[#026a69] to-[#0e8e83]",
    bg: "from-[#eef5f3] to-[#e8f0ed]",
    icon: Layers,
  },
  {
    abbr: "SCP",
    label: "Supreme Court",
    gradient: "from-[#053534] to-[#026a69]",
    bg: "from-[#eef5f3] to-[#e6f0ec]",
    icon: Sparkles,
  },
  {
    abbr: "LHC",
    label: "Lahore High Court",
    gradient: "from-[#0e8e83] to-[#026a69]",
    bg: "from-[#f0f7f5] to-[#eef5f3]",
    icon: Scale,
  },
  {
    abbr: "IHC",
    label: "Islamabad High Court",
    gradient: "from-[#026a69] to-[#053534]",
    bg: "from-[#eef5f3] to-[#e8f0ed]",
    icon: TrendingUp,
  },
  {
    abbr: "PHC",
    label: "Peshawar High Court",
    gradient: "from-[#0e8e83] to-[#026a69]",
    bg: "from-[#eef5f3] to-[#e6f0ec]",
    icon: Zap,
  },
  {
    abbr: "BHC",
    label: "High Court of Balochistan",
    gradient: "from-[#053534] to-[#0e8e83]",
    bg: "from-[#f0f7f5] to-[#eef5f3]",
    icon: Gavel,
  },
  {
    abbr: "SHC",
    label: "High Court of Sindh",
    gradient: "from-[#026a69] to-[#0e8e83]",
    bg: "from-[#eef5f3] to-[#e8f0ed]",
    icon: BookOpen,
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
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r shadow-sm text-black"
      style={{
        backgroundImage: `linear-gradient(135deg, ${meta.gradient.split(" ")[1] || "#026a69"}, ${meta.gradient.split(" ")[3] || "#0e8e83"})`,
      }}
    >
      <Icon className="w-2.5 h-2.5" />
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
    <div className="group relative bg-white border border-[#eef5f3] rounded-2xl p-5 hover:border-[#0e8e83] hover:shadow-lg hover:shadow-[#026a69]/5 transition-all duration-300 flex flex-col gap-3">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#026a69] to-[#0e8e83] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center gap-2 flex-wrap">
        <CourtBadge abbr={judgment.courtAbbr} />
        {judgment.approved && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#eef5f3] text-[#026a69] border border-[#d0e8e4]">
            ✓ Approved
          </span>
        )}
        {judgment.matter && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#f0f7f5] text-black border border-[#d5e8e4]">
            {judgment.matter}
          </span>
        )}
        {judgment.status && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5] text-[#0e8e83] border border-[#d0e8e4]">
            {judgment.status}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-black leading-snug line-clamp-2 group-hover:text-[#026a69] transition-colors">
        {judgment.title}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/70">
        <span className="truncate max-w-[200px] font-medium">
          {judgment.courtFull}
        </span>
        {judgment.judge && (
          <>
            <span className="text-black/30">·</span>
            <span className="truncate max-w-[180px]">{judgment.judge}</span>
          </>
        )}
        {date && (
          <>
            <span className="text-black/30">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          </>
        )}
      </div>

      {(judgment.caseNumber || judgment.bench) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-black/60">
          {judgment.caseNumber && (
            <span className="flex items-center gap-1 bg-[#eef5f3] px-2 py-0.5 rounded-md">
              <Hash className="w-3 h-3" />
              {judgment.caseNumber}
            </span>
          )}
          {judgment.bench && (
            <span className="flex items-center gap-1 bg-[#eef5f3] px-2 py-0.5 rounded-md">
              <Gavel className="w-3 h-3" />
              {judgment.bench}
            </span>
          )}
        </div>
      )}

      {judgment.citation && (
        <p className="text-[11px] font-mono font-semibold bg-gradient-to-r from-[#026a69] to-[#0e8e83] bg-clip-text text-transparent">
          {judgment.citation}
        </p>
      )}

      {visibleKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5] text-black border border-[#d0e8e4] hover:border-[#0e8e83] transition-colors cursor-default"
            >
              <Tag className="w-2.5 h-2.5" />
              {kw}
            </span>
          ))}
          {extraKeywordCount > 0 && (
            <span className="text-[10px] text-black/50 font-medium">
              +{extraKeywordCount} more
            </span>
          )}
        </div>
      )}

      {judgment.summary && (
        <div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0e8e83] hover:text-[#026a69] transition-colors"
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
            <div className="mt-2 p-3 bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5] rounded-xl border border-[#d0e8e4]">
              <p className="text-xs text-black leading-relaxed">
                {judgment.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {judgment.sourceUrl && (
        <a
          href={judgment.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#026a69] hover:text-[#0e8e83] no-underline group/link"
        >
          <span className="group-hover/link:underline">View judgment</span>
          <ArrowUpRight className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      )}
    </div>
  );
}

function CourtTabs({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
      {COURT_TABS.map(({ abbr, label, gradient, bg, icon: Icon }) => {
        const count = abbr === "ALL" ? counts.total : (counts[abbr] ?? 0);
        const isActive = active === abbr;
        const gradientColors = gradient.split(" ").slice(1).join(" ");

        return (
          <button
            key={abbr}
            onClick={() => onChange(abbr)}
            className={`
              group relative whitespace-nowrap text-[12px] font-semibold 
              px-4 py-2 rounded-xl border-2 
              transition-all duration-300 ease-out 
              flex items-center gap-2
              ${
                isActive
                  ? "text-black border-transparent shadow-lg shadow-[#026a69]/20 scale-105"
                  : "border-[#eef5f3] bg-white text-black hover:border-[#0e8e83] hover:shadow-md hover:shadow-[#026a69]/5 hover:scale-[1.02]"
              }
            `}
            style={
              isActive
                ? {
                    backgroundImage: `linear-gradient(135deg, ${gradientColors})`,
                  }
                : {}
            }
            title={label}
          >
            {/* Hover glow effect for inactive tabs */}
            {!isActive && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#026a69]/5 to-[#0e8e83]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Icon with animated scale */}
            <Icon
              className={`
                w-3.5 h-3.5 transition-all duration-300
                ${
                  isActive
                    ? "text-white"
                    : "text-[#0e8e83] group-hover:text-[#026a69] group-hover:scale-110"
                }
              `}
            />

            {/* Label */}
            <span className="relative z-10">
              {abbr === "ALL" ? "All Courts" : abbr}
            </span>

            {/* Count badge */}
            {count > 0 && (
              <span
                className={`
                  relative z-10 ml-1 text-[10px] px-1.5 py-0.5 rounded-full 
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#eef5f3] text-black group-hover:bg-[#d0e8e4] group-hover:scale-110"
                  }
                `}
              >
                {count}
              </span>
            )}

            {/* Active indicator underline */}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white/50 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#eef5f3] rounded-2xl p-5 animate-pulse flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-lg bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5]" />
        <div className="h-5 w-20 rounded-lg bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5]" />
      </div>
      <div className="h-5 w-3/4 rounded bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5]" />
      <div className="h-4 w-1/2 rounded bg-gradient-to-r from-[#f0f7f5] to-[#eef5f3]" />
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
      if (myRequestId !== requestId.current) return;
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
      const syncUrl =
        activeTab !== "ALL"
          ? `/api/sync-judgments-sheet?courts=${encodeURIComponent(activeTab)}`
          : "/api/sync-judgments-sheet";

      const res = await apiFetch(syncUrl, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message || "Sync failed");
      setSyncMessage(
        `Synced ${activeTab === "ALL" ? "all courts" : activeTab}: ${res.inserted} new, ${res.updated} updated, ${res.skipped} skipped.`,
      );
      await load();
    } catch (err) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }, [activeTab, load]);

  const handleFullSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const params = new URLSearchParams({ full: "1" });
      if (activeTab !== "ALL") params.set("courts", activeTab);
      const res = await apiFetch(`/api/sync-judgments-sheet?${params.toString()}`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.message || "Full sync failed");
      setSyncMessage(
        `Full sync ${activeTab === "ALL" ? "all courts" : activeTab}: ${res.inserted} new, ${res.updated} updated, ${res.skipped} skipped.`,
      );
      await load();
    } catch (err) {
      setSyncMessage(`Full sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }, [activeTab, load]);

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Modern gradient background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#053534] via-[#026a69] to-[#0e8e83] p-8 text-white shadow-xl shadow-[#026a69]/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Scale className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold font-display">
                Court Judgments
              </h1>
            </div>
            <p className="text-[#eef5f3]/80 text-sm mt-2 max-w-2xl">
              Latest judgments from Pakistani superior courts — synced from the
              judgment feed with real-time updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 text-sm font-semibold bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 hover:scale-105"
                  title="Sync only rows newer than the current checkpoint"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  />
                  {syncing
                    ? `Syncing${activeTab === "ALL" ? "" : ` ${activeTab}`}…`
                    : activeTab === "ALL"
                      ? "Sync Now"
                      : `Sync ${activeTab}`}
                </button>
                <button
                  onClick={handleFullSync}
                  disabled={syncing}
                  className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 hover:scale-105"
                  title="Force a full backfill of matching court rows"
                >
                  Full Sync
                </button>
              </>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 hover:scale-105"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mt-6 flex gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Clock className="w-4 h-4 text-[#eef5f3]/70" />
            <span className="text-xs text-[#eef5f3]/70">
              {lastUpdated ? `Updated ${lastUpdated}` : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
            <Filter className="w-4 h-4 text-[#eef5f3]/70" />
            <span className="text-xs text-[#eef5f3]/70">
              {COURT_TABS.length - 1} Courts Available
            </span>
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="animate-in slide-in-from-top-2 duration-300 text-xs px-4 py-3 rounded-xl bg-gradient-to-r from-[#eef5f3] to-[#f0f7f5] border border-[#d0e8e4] text-black flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#0e8e83]" />
          {syncMessage}
        </div>
      )}

      {syncRequired && !loading && (
        <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 text-sm text-black shadow-lg shadow-amber-100/50">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">No judgments in the database yet.</p>
            <p className="text-xs mt-1">
              {isAdmin
                ? 'Click "Sync Now" above, or wait for the automatic cron job to run.'
                : "Ask an admin to trigger a sync, or wait for the automatic cron job to run."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-[#eef5f3] rounded-2xl p-6 space-y-4 shadow-lg shadow-[#026a69]/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <input
            type="text"
            placeholder="Search by title, citation, case number, or judge…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm border-2 border-[#eef5f3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#026a69]/20 focus:border-[#0e8e83] bg-[#f0f7f5] placeholder:text-black/40 transition-all"
          />
        </div>

        <CourtTabs
          active={activeTab}
          onChange={(abbr) => setActiveTab(abbr)}
          counts={courtCounts}
        />

        <div className="flex items-center justify-between text-xs text-black/60">
          <span className="font-medium">
            {loading
              ? "Loading…"
              : `${total} judgment${total !== 1 ? "s" : ""} found`}
          </span>
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
          <div className="p-4 bg-red-50 rounded-2xl mb-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <p className="font-semibold text-black text-lg">
            Could not load judgments
          </p>
          <p className="text-sm text-black/70 mt-2 mb-4">{error}</p>
          <button
            onClick={load}
            className="text-sm px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#026a69] to-[#0e8e83] text-white hover:shadow-lg hover:shadow-[#026a69]/25 transition-all hover:scale-105"
          >
            Try again
          </button>
        </div>
      ) : judgments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-[#eef5f3] to-[#f0f7f5] rounded-3xl border-2 border-dashed border-[#d0e8e4]">
          <div className="p-4 bg-white rounded-2xl shadow-lg shadow-[#026a69]/5 mb-4">
            <BookOpen className="w-10 h-10 text-black/50" />
          </div>
          <p className="font-semibold text-black text-lg">No judgments found</p>
          <p className="text-sm text-black/70 mt-2">
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
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border-2 border-[#eef5f3] disabled:opacity-40 hover:bg-[#eef5f3] hover:border-[#0e8e83] transition-all group"
              >
                <ChevronLeft className="w-4 h-4 text-black group-hover:text-[#026a69]" />
              </button>
              <div className="flex items-center gap-2 bg-[#eef5f3] rounded-xl px-4 py-2">
                <span className="text-sm font-semibold text-black">
                  Page {page}
                </span>
                <span className="text-sm text-black/60">of {totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border-2 border-[#eef5f3] disabled:opacity-40 hover:bg-[#eef5f3] hover:border-[#0e8e83] transition-all group"
              >
                <ChevronRight className="w-4 h-4 text-black group-hover:text-[#026a69]" />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

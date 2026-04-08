"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";

// --─ Court metadata ---
const COURTS = {
  ALL: { label: "All Courts", color: "#6366f1", bg: "#eef2ff" },
  SCP: { label: "Supreme Court", color: "#7c3aed", bg: "#f5f3ff" },
  LHC: { label: "Lahore High Court", color: "#0369a1", bg: "#e0f2fe" },
  SHC: { label: "Sindh High Court", color: "#0f766e", bg: "#ccfbf1" },
  IHC: { label: "Islamabad High Court", color: "#b45309", bg: "#fef3c7" },
  PHC: { label: "Peshawar High Court", color: "#be185d", bg: "#fce7f3" },
  BHC: { label: "Balochistan HC", color: "#7c2d12", bg: "#ffedd5" },
};

// Matter badge colours (same palette as before, extended)
const MATTER_COLORS = {
  default: { bg: "#f1f5f9", text: "#475569" },
  SERVICE: { bg: "#e0f2fe", text: "#0369a1" },
  CRIMINAL: { bg: "#fce7f3", text: "#be185d" },
  CIVIL: { bg: "#f0fdf4", text: "#15803d" },
  CONSTITUTION: { bg: "#f5f3ff", text: "#6d28d9" },
  TAX: { bg: "#fef9c3", text: "#854d0e" },
  FAMILY: { bg: "#fff7ed", text: "#c2410c" },
  LABOUR: { bg: "#f0fdf4", text: "#166534" },
};

function matterColor(matter) {
  if (!matter) return MATTER_COLORS.default;
  const key = Object.keys(MATTER_COLORS).find((k) =>
    matter.toUpperCase().includes(k),
  );
  return MATTER_COLORS[key] || MATTER_COLORS.default;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// --─ Court badge pill --------------------------------------------------------─
function CourtBadge({ abbr, small = false }) {
  const meta = COURTS[abbr] || COURTS.ALL;
  return (
    <span
      className={`font-bold rounded-full ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}
      style={{ background: meta.bg, color: meta.color }}
    >
      {abbr}
    </span>
  );
}

// --─ Single item in the scrolling ticker strip --------------------------------
function TickerItem({ j }) {
  const mc = matterColor(j.matter);
  return (
    <span className="inline-flex items-center gap-2.5 px-1 whitespace-nowrap">
      <CourtBadge abbr={j.courtAbbr} small />
      {j.matter && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: mc.bg, color: mc.text }}
        >
          {j.matter}
        </span>
      )}
      <span className="text-[13px] text-slate-700 font-medium max-w-[340px] truncate">
        {j.title}
      </span>
      {j.citation && (
        <span className="text-[11px] text-indigo-600 font-mono font-semibold">
          {j.citation}
        </span>
      )}
      {j.orderDate && (
        <span className="text-[11px] text-slate-400">
          {formatDate(j.orderDate)}
        </span>
      )}
      {j.sourceUrl && (
        <a
          href={j.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-indigo-500 hover:text-indigo-700 underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </a>
      )}
      <span className="text-slate-200 mx-2 select-none">◆</span>
    </span>
  );
}

// --─ Expanded row ------------------------------------------------------------─
function JudgmentRow({ j, idx }) {
  const mc = matterColor(j.matter);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 group">
      <span className="text-xs text-slate-300 font-mono mt-0.5 min-w-[22px] text-right">
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <CourtBadge abbr={j.courtAbbr} />
          {j.approved && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              ✓ Approved
            </span>
          )}
          {j.matter && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: mc.bg, color: mc.text }}
            >
              {j.matter}
            </span>
          )}
          {j.citation && (
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">
              {j.citation}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {j.title}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-slate-500">{j.court}</span>
          {j.judge && (
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {j.judge}
            </span>
          )}
          {j.orderDate && (
            <span className="text-xs text-slate-400">
              {formatDate(j.orderDate)}
            </span>
          )}
          {j.downloads > 0 && (
            <span className="text-xs text-slate-400">{j.downloads} ↓</span>
          )}
        </div>
      </div>
      {j.sourceUrl && (
        <a
          href={j.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 mt-0.5 border border-indigo-100 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors no-underline"
        >
          View
        </a>
      )}
    </div>
  );
}

// --─ Court filter tabs --------------------------------------------------------
function CourtTabs({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
      {Object.entries(COURTS).map(([abbr, meta]) => {
        const count = abbr === "ALL" ? counts.total : (counts[abbr] ?? 0);
        const isActive = active === abbr;
        return (
          <button
            key={abbr}
            onClick={() => onChange(abbr)}
            className={`whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all border ${
              isActive
                ? "border-transparent text-white shadow-sm"
                : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
            }`}
            style={
              isActive
                ? { background: meta.color, borderColor: meta.color }
                : {}
            }
          >
            {abbr === "ALL" ? "All" : abbr}
            {count > 0 && (
              <span
                className={`ml-1 text-[9px] ${isActive ? "opacity-80" : "text-slate-400"}`}
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

// --─ Main component --------
export default function LegalUpdatesTicker() {
  const [allJudgments, setAllJudgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [source, setSource] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");

  // Fetch
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch("/api/legal-updates?limit=60");
        if (!res.success)
          throw new Error(res.error || "Failed to fetch legal updates");
        setAllJudgments(res.data || []);
        setFetchedAt(res.fetchedAt);
        setSource(res.source);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered view
  const filtered =
    activeTab === "ALL"
      ? allJudgments
      : allJudgments.filter((j) => j.courtAbbr === activeTab);

  // Count per court for tabs
  const counts = { total: allJudgments.length };
  for (const j of allJudgments) {
    counts[j.courtAbbr] = (counts[j.courtAbbr] || 0) + 1;
  }

  // Ticker content (doubled for seamless loop)
  const tickerContent = [...filtered, ...filtered];

  // Ticker speed: longer content = faster scroll so items don't linger
  const tickerDuration = Math.max(25, Math.min(60, filtered.length * 3));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* -- Header bar -- */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Live pulse */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
            Legal Updates
          </span>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">
            Pakistani Courts — Live
          </span>
          {source === "stale-cache" && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Cached
            </span>
          )}
          {source === "error" && (
            <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {fetchedAt && (
            <span className="text-[10px] text-slate-400 hidden md:block">
              Updated{" "}
              {new Date(fetchedAt).toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 whitespace-nowrap"
          >
            {expanded ? "Collapse ↑" : "View all →"}
          </button>
        </div>
      </div>

      {/* -- Court filter tabs (always visible) -- */}
      <div className="px-4 py-2 border-b border-slate-50 bg-white">
        <CourtTabs active={activeTab} onChange={setActiveTab} counts={counts} />
      </div>

      {/* -- Ticker strip -- */}
      {!expanded && (
        <div
          className="relative overflow-hidden border-b border-slate-50"
          style={{ height: "40px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="flex items-center h-full px-4 gap-2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">
                Fetching judgments from all Pakistani courts…
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-red-500">{error}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-slate-400">
                No judgments found.
              </span>
            </div>
          ) : (
            <div
              className="flex items-center h-full"
              style={{
                animation: `legalTicker ${tickerDuration}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
                whiteSpace: "nowrap",
              }}
            >
              {tickerContent.map((j, i) => (
                <TickerItem key={`${j.id}-${i}`} j={j} />
              ))}
            </div>
          )}
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
        </div>
      )}

      {/* -- Expanded list -- */}
      {expanded && (
        <div className="px-4 py-2 max-h-[460px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading…
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No judgments found for {COURTS[activeTab]?.label}.
            </div>
          ) : (
            <div>
              {filtered.map((j, i) => (
                <JudgmentRow key={j.id || i} j={j} idx={i} />
              ))}
            </div>
          )}

          {/* Footer links per court */}
          {!loading && filtered.length > 0 && (
            <div className="py-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {(activeTab === "ALL"
                ? Object.keys(COURTS).filter(
                    (k) => k !== "ALL" && counts[k] > 0,
                  )
                : [activeTab]
              ).map((abbr) => {
                const urls = {
                  SCP: "https://www.supremecourt.gov.pk/category/judgements/",
                  LHC: "https://lhc.gov.pk/reported_judgments",
                  SHC: "https://caselaw.shc.gov.pk/caselaw/public/home",
                  IHC: "https://ihc.gov.pk",
                  PHC: "https://www.peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php",
                  BHC: "https://bhc.gov.pk/resources/judgments",
                };
                return (
                  <a
                    key={abbr}
                    href={urls[abbr]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium no-underline"
                    style={{ color: COURTS[abbr].color }}
                  >
                    {abbr} website →
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -- Ticker keyframe -- */}
      <style>{`
        @keyframes legalTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

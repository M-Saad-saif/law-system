"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";

// ------- helpers ---

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// --- single ticker item ------
function TickerItem({ j }) {
  return (
    <span className="inline-flex items-center gap-3 px-1 whitespace-nowrap">
      {/* Matter badge */}
      {j.matter && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: mc.bg, color: mc.text }}
        >
          {j.matter}
        </span>
      )}
      {/* Case title */}
      <span className="text-[13px] text-slate-700 font-medium max-w-[360px] truncate">
        {j.title}
      </span>
      {/* Citation */}
      {j.citation && (
        <span className="text-[11px] text-indigo-600 font-mono font-semibold">
          {j.citation}
        </span>
      )}
      {/* Court */}
      <span className="text-[11px] text-slate-400">{j.court}</span>
      {/* Date */}
      {j.orderDate && (
        <span className="text-[11px] text-slate-400">
          {formatDate(j.orderDate)}
        </span>
      )}
      {/* Source link */}
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
      {/* Separator */}
      <span className="text-slate-300 mx-2 select-none">◆</span>
    </span>
  );
}

// ----- judgment card for expanded view ------------

function JudgmentRow({ j, idx }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 group">
      <span className="text-xs text-slate-300 font-mono mt-0.5 min-w-[20px]">
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {j.approved && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Approved for Reporting
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
        <p className="text-sm font-medium text-slate-800 leading-snug truncate group-hover:text-indigo-700 transition-colors">
          {j.title}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-slate-400">{j.court}</span>
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
            <span className="text-xs text-slate-400">
              {j.downloads} downloads
            </span>
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
          View PDF
        </a>
      )}
    </div>
  );
}

// ----- main component -----

export default function LegalUpdatesTicker() {
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [source, setSource] = useState(null);
  const tickerRef = useRef(null);
  const animRef = useRef(null);

  // ----- fetch live data -------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch("/api/legal-updates?limit=20");
        if (!res.success) throw new Error(res.error || "Failed");
        setJudgments(res.data || []);
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

  
  const tickerContent = [...judgments, ...judgments];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* ----- header bar ----- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          {/* Live pulse dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-slate-800">
            Legal Updates
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Sindh High Court — Live
          </span>
          {source === "stale-cache" && (
            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Cached
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {fetchedAt && (
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Updated{" "}
              {new Date(fetchedAt).toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
          >
            {expanded ? "Collapse ↑" : "View all →"}
          </button>
        </div>
      </div>

      {/* ----- ticker strip ----- */}
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
                Fetching latest judgments from SHC…
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-red-500">{error}</span>
            </div>
          ) : judgments.length === 0 ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-slate-400">
                No judgments found.
              </span>
            </div>
          ) : (
            <div
              ref={tickerRef}
              className="flex items-center h-full"
              style={{
                animation: "legalTicker 8s linear infinite",
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

      {/* ----- expanded list view ----- */}
      {expanded && (
        <div className="px-4 py-2 max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading…
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          ) : judgments.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No judgments found.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {judgments.map((j, i) => (
                <JudgmentRow key={j.id || i} j={j} idx={i} />
              ))}
            </div>
          )}
          {judgments.length > 0 && (
            <div className="py-3 text-center">
              <a
                href="https://caselaw.shc.gov.pk/caselaw/public/home"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium no-underline"
              >
                View all judgments on SHC website →
              </a>
            </div>
          )}
        </div>
      )}

      {/* ----- ticker keyframe (injected inline) ----- */}
      <style>{`
        @keyframes legalTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

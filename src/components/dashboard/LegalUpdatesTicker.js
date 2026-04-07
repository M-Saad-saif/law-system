"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";

// ── court config for UI ───────────────────────────────────────────────────────
const COURT_COLORS = {
  SHC: { bg: "#E6F1FB", text: "#185FA5", dot: "#378ADD" },  // blue — Sindh
  LHC: { bg: "#EAF3DE", text: "#3B6D11", dot: "#639922" },  // green — Punjab
  IHC: { bg: "#FAEEDA", text: "#854F0B", dot: "#EF9F27" },  // amber — Islamabad
  PHC: { bg: "#FAECE7", text: "#993C1D", dot: "#D85A30" },  // coral — KPK
  BHC: { bg: "#EEEDFE", text: "#3C3489", dot: "#7F77DD" },  // purple — Balochistan
  SCP: { bg: "#FCEBEB", text: "#A32D2D", dot: "#E24B4A" },  // red — Supreme Court
};

const ALL_COURTS = [
  { key: "shc", label: "SHC", full: "Sindh High Court", province: "Sindh" },
  { key: "ihc", label: "IHC", full: "Islamabad High Court", province: "Islamabad" },
  { key: "phc", label: "PHC", full: "Peshawar High Court", province: "KPK" },
  { key: "scp", label: "SCP", full: "Supreme Court", province: "Federal" },
  // These two are noted as unavailable but shown greyed out:
  { key: "lhc", label: "LHC", full: "Lahore High Court", province: "Punjab", unavailable: true },
  { key: "bhc", label: "BHC", full: "High Court Balochistan", province: "Balochistan", unavailable: true },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── ticker item ───────────────────────────────────────────────────────────────
function TickerItem({ j }) {
  const colors = COURT_COLORS[j.court] || COURT_COLORS.SHC;
  return (
    <span className="inline-flex items-center gap-2.5 px-1 whitespace-nowrap">
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: colors.bg, color: colors.text }}
      >
        {j.court}
      </span>
      {j.matter && (
        <span className="text-[10px] text-slate-400 font-medium">[{j.matter}]</span>
      )}
      <span className="text-[13px] text-slate-700 font-medium max-w-[380px] truncate">
        {j.title}
      </span>
      {j.citation && (
        <span className="text-[11px] text-indigo-600 font-mono font-semibold">
          {j.citation}
        </span>
      )}
      {j.orderDate && (
        <span className="text-[11px] text-slate-400">{formatDate(j.orderDate)}</span>
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
      <span className="text-slate-200 mx-1 select-none">◆</span>
    </span>
  );
}

// ── judgment row for expanded view ───────────────────────────────────────────
function JudgmentRow({ j, idx }) {
  const colors = COURT_COLORS[j.court] || COURT_COLORS.SHC;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0 group">
      <span className="text-[10px] text-slate-300 font-mono mt-1 min-w-[20px]">{idx + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: colors.bg, color: colors.text }}
          >
            {j.court}
          </span>
          <span className="text-[10px] text-slate-400">{j.province}</span>
          {j.matter && (
            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {j.matter}
            </span>
          )}
          {j.citation && (
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">
              {j.citation}
            </span>
          )}
          {j.approved && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Approved
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {j.title}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-slate-400">{j.courtFull}</span>
          {j.judge && (
            <span className="text-xs text-slate-400 truncate max-w-[180px]">{j.judge}</span>
          )}
          {j.orderDate && (
            <span className="text-xs text-slate-400">{formatDate(j.orderDate)}</span>
          )}
        </div>
      </div>
      {j.sourceUrl && (
        <a
          href={j.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 border border-indigo-100 rounded-lg px-2.5 py-1 hover:bg-indigo-50 transition-colors no-underline mt-0.5"
        >
          PDF
        </a>
      )}
    </div>
  );
}

// ── court status pill ─────────────────────────────────────────────────────────
function CourtPill({ court, stats, selected, onClick }) {
  const colors = COURT_COLORS[court.label] || COURT_COLORS.SHC;
  const isUnavailable = court.unavailable;
  const stat = stats?.[court.label];

  return (
    <button
      onClick={() => !isUnavailable && onClick(court.key)}
      disabled={isUnavailable}
      title={isUnavailable ? `${court.full} — not available for live scraping` : court.full}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border
        ${isUnavailable
          ? "opacity-40 cursor-not-allowed border-slate-200 text-slate-400 bg-white"
          : selected
          ? "shadow-sm border-transparent"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
      style={selected && !isUnavailable ? { background: colors.bg, color: colors.text, borderColor: colors.dot } : {}}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isUnavailable ? "#cbd5e1" : colors.dot }}
      />
      {court.label}
      {stat?.count > 0 && !isUnavailable && (
        <span className="ml-0.5 opacity-70">({stat.count})</span>
      )}
      {isUnavailable && <span className="ml-0.5 text-[9px]">🔒</span>}
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function LegalUpdatesTicker() {
  const [judgments, setJudgments] = useState([]);
  const [courtStats, setCourtStats] = useState({});
  const [unavailable, setUnavailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [selectedCourts, setSelectedCourts] = useState(["shc", "ihc", "phc", "scp"]);
  const [showUnavailableInfo, setShowUnavailableInfo] = useState(false);

  const load = async (courts) => {
    try {
      setLoading(true);
      setError(null);
      const courtParam = courts.join(",");
      const res = await apiFetch(`/api/legal-updates?courts=${courtParam}&limit=30`);
      if (!res.success) throw new Error(res.error || "Failed");
      setJudgments(res.data || []);
      setFetchedAt(res.fetchedAt);
      setUnavailable(res.unavailable || []);
      // Build court stats map
      const statsMap = {};
      (res.courts || []).forEach((c) => { statsMap[c.court] = c; });
      setCourtStats(statsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(selectedCourts); }, []);

  const toggleCourt = (key) => {
    const label = key.toUpperCase();
    const next = selectedCourts.includes(key)
      ? selectedCourts.filter((k) => k !== key)
      : [...selectedCourts, key];
    if (next.length === 0) return; // always keep at least one
    setSelectedCourts(next);
    load(next);
  };

  const tickerContent = [...judgments, ...judgments];
  const liveCount = Object.values(courtStats).filter((c) => c.status === "live" && c.count > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── header ── */}
      <div className="px-4 pt-3.5 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-sm font-semibold text-slate-800">Legal Updates</span>
            <span className="text-[11px] text-slate-400">
              Pakistan Courts — {liveCount} court{liveCount !== 1 ? "s" : ""} live
            </span>
          </div>
          <div className="flex items-center gap-2">
            {fetchedAt && (
              <span className="text-[10px] text-slate-400 hidden sm:block">
                {new Date(fetchedAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {expanded ? "Collapse ↑" : "View all →"}
            </button>
          </div>
        </div>

        {/* Court selector pills */}
        <div className="flex items-center gap-1.5 flex-wrap pb-1">
          {ALL_COURTS.map((court) => (
            <CourtPill
              key={court.key}
              court={court}
              stats={courtStats}
              selected={selectedCourts.includes(court.key)}
              onClick={toggleCourt}
            />
          ))}
          {unavailable.length > 0 && (
            <button
              onClick={() => setShowUnavailableInfo((v) => !v)}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-1"
            >
              Why are some greyed out?
            </button>
          )}
        </div>

        {/* Unavailable info box */}
        {showUnavailableInfo && unavailable.length > 0 && (
          <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
            <p className="font-semibold mb-1">Courts not available for live scraping:</p>
            {unavailable.map((c) => (
              <div key={c.court} className="mb-1">
                <span className="font-medium">{c.court} ({c.courtFull}):</span>{" "}
                {c.reason}{" "}
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                    Visit website →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ticker strip ── */}
      {!expanded && (
        <div
          className="relative overflow-hidden"
          style={{ height: "40px" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {loading ? (
            <div className="flex items-center h-full px-4 gap-2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading from Pakistani courts…</span>
            </div>
          ) : error ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-red-500">{error}</span>
            </div>
          ) : judgments.length === 0 ? (
            <div className="flex items-center h-full px-4">
              <span className="text-xs text-slate-400">No judgments found for selected courts.</span>
            </div>
          ) : (
            <div
              className="flex items-center h-full"
              style={{
                animation: paused ? "none" : "legalTicker 70s linear infinite",
                whiteSpace: "nowrap",
              }}
            >
              {tickerContent.map((j, i) => (
                <TickerItem key={`${j.title}-${i}`} j={j} />
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
        </div>
      )}

      {/* ── expanded list ── */}
      {expanded && (
        <div className="px-4 py-2 max-h-[460px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          ) : judgments.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No judgments found.</div>
          ) : (
            judgments.map((j, i) => <JudgmentRow key={`${j.title}-${i}`} j={j} idx={i} />)
          )}
          {/* Court source links */}
          <div className="py-4 border-t border-slate-50 mt-2">
            <p className="text-[11px] text-slate-400 font-medium mb-2">Direct links to court websites:</p>
            <div className="flex flex-wrap gap-2">
              {ALL_COURTS.map((c) => (
                <a
                  key={c.key}
                  href={
                    c.key === "shc" ? "https://caselaw.shc.gov.pk/caselaw/public/home"
                    : c.key === "ihc" ? "https://mis.ihc.gov.pk/frmJgmnt"
                    : c.key === "phc" ? "https://peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php"
                    : c.key === "lhc" ? "https://lhc.gov.pk/reported_judgments"
                    : c.key === "bhc" ? "https://portal.bhc.gov.pk/judgments/"
                    : "https://scp.gov.pk/judgments"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium no-underline border border-indigo-100 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {c.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes legalTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/utils/api";

const CASE_TYPE_COLORS = {
  Criminal: "bg-red-100 text-red-700",
  Civil: "bg-blue-100 text-blue-700",
  Family: "bg-purple-100 text-purple-700",
  Tax: "bg-amber-100 text-amber-700",
  Bail: "bg-green-100 text-green-700",
};

function typeBadge(caseType) {
  const cls = CASE_TYPE_COLORS[caseType] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {caseType}
    </span>
  );
}

function dateTypeBadge(dateType) {
  return dateType === "hearing" ? (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#027f7e]/10 text-[#027f7e]">
      Hearing
    </span>
  ) : (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#103168]/20 text-[#103168]">
      Proceeding
    </span>
  );
}

// ----------- sub-components -------

function DayColumn({ day, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(day.dateKey)}
      className={`w-full flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all
        ${
          isSelected
            ? "bg-[#103168] text-white shadow-sm "
            : day.isToday
              ? "bg-[#027f7e]/5 text-[#027f7e] border border-[#027f7e]/20"
              : "text-gray-500 bg-gray-100 hover:bg-white hover:border-[0.5px] hover:border-gray-300"
        }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {day.label.split(" ")[0]}
      </span>
      <span
        className={`text-lg font-bold leading-none ${isSelected ? "text-white" : ""}`}
      >
        {new Date(day.dateKey + "T00:00:00").getDate()}
      </span>
      {day.count > 0 ? (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
          ${isSelected ? "bg-white text-[#103168]" : "bg-[#027f7e]/10 text-[#027f7e]"}`}
        >
          {day.count}
        </span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-0.5" />
      )}
    </button>
  );
}

function HearingCard({ hearing }) {
  return (
    <Link
      href={`/cases/${hearing._id}`}
      className="group flex flex-col gap-2 w- p-3 rounded-xl border  bg-white hover:bg-gradient-to-t hover:from-[#22656c0d] hover:to-transparent
        border-[#027f7e]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug  transition-colors line-clamp-2">
          {hearing.caseTitle}
        </p>
        {dateTypeBadge(hearing.dateType)}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {typeBadge(hearing.caseType)}
        {hearing.caseNumber && (
          <span className="text-[10px] text-gray-400 font-mono">
            #{hearing.caseNumber}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 6l9-3 9 3v12l-9 3-9-3V6z"
          />
        </svg>
        <span className="truncate">
          {hearing.courtName || "Court not specified"}
        </span>
      </div>

      {hearing.clientName && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="truncate">{hearing.clientName}</span>
        </div>
      )}
    </Link>
  );
}

function EmptyDay() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400 font-medium">No hearings scheduled</p>
      <p className="text-xs text-gray-300 mt-1">Free day</p>
    </div>
  );
}

// ----------- main component ----------

export default function WeeklyOutlook() {
  const [outlook, setOutlook] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOutlook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/api/hearings/weekly");
      setOutlook(data.outlook ?? []);
      setTotalCount(data.totalCount ?? 0);
      // Default to today
      const todayDay = data.outlook?.find((d) => d.isToday);
      setSelectedKey(todayDay?.dateKey ?? data.outlook?.[0]?.dateKey ?? null);
    } catch (err) {
      setError("Failed to load weekly outlook.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlook();
  }, [fetchOutlook]);

  const selectedDay = outlook.find((d) => d.dateKey === selectedKey);

  // ----------- loading skeleton -----------
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-40 bg-gray-100 rounded mb-4" />
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 w-16 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // ----------- error -----------
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-5 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchOutlook}
          className="mt-2 text-xs text-[#027f7e] underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Weekly Outlook
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalCount === 0
              ? "No hearings in the next 7 days"
              : `${totalCount} hearing${totalCount !== 1 ? "s" : ""} scheduled this week`}
          </p>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-[#027f7e] hover:text-[#103168] font-medium transition-colors"
        >
          Full calendar →
        </Link>
      </div>

      {/* Day selector strip */}
      <div className="grid grid-cols-7 gap-1.5 px-4 pb-4">
        {outlook.map((day) => (
          <DayColumn
            key={day.dateKey}
            day={day}
            isSelected={day.dateKey === selectedKey}
            onClick={setSelectedKey}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-50 mx-4" />

      {/* Selected day hearings */}
      <div className="p-4">
        {selectedDay && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {selectedDay.isToday ? "Today — " : ""}
              {selectedDay.label}
            </p>
            {selectedDay.count > 0 && (
              <span className="text-xs text-[#027f7e] font-medium">
                {selectedDay.count} matter{selectedDay.count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {selectedDay?.count > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {selectedDay.hearings.map((h, i) => (
              <HearingCard key={`${h._id}-${i}`} hearing={h} />
            ))}
          </div>
        ) : (
          <EmptyDay />
        )}
      </div>
    </div>
  );
}

// components/cross-exam/StatusBadge.js
// Reusable status badge used across all cross-exam pages

"use client";

const STATUS_CONFIG = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  submitted: { label: "Submitted", bg: "bg-blue-100", text: "text-blue-700" },
  in_review: {
    label: "In Review",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  changes_requested: {
    label: "Changes Requested",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  approved: { label: "Approved", bg: "bg-green-100", text: "text-green-700" },
  archived: { label: "Archived", bg: "bg-gray-200", text: "text-gray-500" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

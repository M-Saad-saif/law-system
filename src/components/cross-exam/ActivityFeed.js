"use client";

import { format } from "date-fns";

const ACTION_ICONS = {
  created: "📝",
  updated: "✏️",
  submitted: "📤",
  assigned: "👤",
  review_started: "🔍",
  qa_edited: "✏️",
  comment_added: "💬",
  comment_resolved: "✅",
  flagged: "⚑",
  unflagged: "◯",
  qa_approved: "✓",
  changes_requested: "↩️",
  resubmitted: "📤",
  approved: "🎉",
  archived: "📦",
  witness_added: "➕",
  witness_deleted: "🗑️",
  qa_added: "➕",
  qa_deleted: "🗑️",
};

export default function ActivityFeed({ activity = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-700">Activity Log</h3>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {activity.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity.map((entry) => (
              <li key={entry._id} className="px-4 py-3 flex gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">
                  {ACTION_ICONS[entry.action] || "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug">
                    {entry.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {entry.performedBy?.name || "Unknown"} ·{" "}
                    {entry.createdAt
                      ? format(new Date(entry.createdAt), "dd MMM, HH:mm")
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

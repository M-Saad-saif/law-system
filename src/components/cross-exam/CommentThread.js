"use client";

import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";

function Comment({ comment, onReply, onResolve, depth = 0 }) {
  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-3" : ""}`}
    >
      <div
        className={`rounded-lg p-3 mb-2 ${comment.resolved ? "bg-gray-50 opacity-60" : "bg-white border border-gray-200"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-800 flex-1">{comment.text}</p>
          <button
            onClick={() => onResolve(comment._id, !comment.resolved)}
            className={`text-xs flex-shrink-0 px-2 py-0.5 rounded transition-colors ${
              comment.resolved
                ? "text-gray-400 hover:text-gray-600"
                : "text-green-600 hover:text-green-800"
            }`}
            title={comment.resolved ? "Reopen" : "Resolve"}
          >
            {comment.resolved ? "↩ Reopen" : "✓ Resolve"}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {comment.author?.name || "Unknown"} ·{" "}
            {comment.createdAt
              ? format(new Date(comment.createdAt), "dd MMM HH:mm")
              : ""}
          </p>
          {depth === 0 && !comment.resolved && (
            <button
              onClick={() => onReply(comment._id)}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({
  examId,
  witnessId,
  qaPair,
  onClose,
  onCommentAdded,
  onCommentResolved,
}) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // parentComment _id
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const url = `/api/cross-exams/${examId}/witnesses/${witnessId}/qa/${qaPair._id}/comment`;
      const data = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({
          text: text.trim(),
          parentComment: replyTo || null,
        }),
      });
      onCommentAdded(data.comment);
      setText("");
      setReplyTo(null);
      toast.success("Comment added.");
    } catch (err) {
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (commentId, resolved) => {
    try {
      const url = `/api/cross-exams/${examId}/witnesses/${witnessId}/qa/${qaPair._id}/comment`;
      await apiFetch(url, {
        method: "PUT",
        body: JSON.stringify({ commentId, resolved }),
      });
      onCommentResolved(commentId, resolved);
    } catch (err) {
      toast.error("Failed to update comment.");
    }
  };

  // Separate top-level comments and replies
  const topLevel = (qaPair.comments || []).filter((c) => !c.parentComment);
  const replies = (qaPair.comments || []).filter((c) => c.parentComment);

  const getReplies = (parentId) =>
    replies.filter((r) => r.parentComment?.toString() === parentId?.toString());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Comments</p>
          <p className="text-sm font-medium text-gray-800">
            Q{qaPair.sequence}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {topLevel.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">
            No comments yet. Be the first.
          </p>
        )}
        {topLevel.map((c) => (
          <div key={c._id}>
            <Comment
              comment={c}
              onReply={(id) => setReplyTo(id)}
              onResolve={handleResolve}
              depth={0}
            />
            {getReplies(c._id).map((r) => (
              <Comment
                key={r._id}
                comment={r}
                onReply={() => {}}
                onResolve={handleResolve}
                depth={1}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="mx-4 mb-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
          <span className="text-xs text-indigo-700">Replying to a comment</span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-indigo-400 hover:text-indigo-600 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-200 flex-shrink-0">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {submitting ? "Posting…" : "Post Comment"}
        </button>
      </div>
    </div>
  );
}

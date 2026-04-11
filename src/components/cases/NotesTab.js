"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { EmptyState, Spinner } from "@/components/ui";
import { Plus, StickyNote, X } from "lucide-react";

const NOTE_COLORS = [
  { label: "Yellow", bg: "#fef9c3", border: "#fde047", text: "#713f12" },
  { label: "Blue", bg: "#dbeafe", border: "#93c5fd", text: "#1e3a8a" },
  { label: "Green", bg: "#dcfce7", border: "#86efac", text: "#14532d" },
  { label: "Pink", bg: "#fce7f3", border: "#f9a8d4", text: "#831843" },
];

export default function NotesTab({ caseId, notes, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0].bg);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/cases/${caseId}/notes`, { content, color });
      toast.success("Note added.");
      setContent("");
      setColor(NOTE_COLORS[0].bg);
      setShowForm(false);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    setDeletingId(noteId);
    try {
      await api.delete(`/api/cases/${caseId}/notes`, { noteId });
      toast.success("Note removed.");
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const colorObj = (bg) =>
    NOTE_COLORS.find((c) => c.bg === bg) || NOTE_COLORS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Quick Notes</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {showForm && (
        <div className="card p-4 space-y-3 border-primary-100 border-2">
          <div className="flex gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.bg}
                type="button"
                onClick={() => setColor(c.bg)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.bg,
                  borderColor: color === c.bg ? c.border : "transparent",
                  boxShadow: color === c.bg ? `0 0 0 2px ${c.border}` : "none",
                }}
              />
            ))}
          </div>
          <textarea
            className="w-full px-3 py-2.5 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400/30"
            style={{
              backgroundColor: color,
              borderColor: colorObj(color).border,
              color: colorObj(color).text,
            }}
            rows={3}
            placeholder="Write a quick note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setContent("");
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !content.trim()}
              className="btn-primary"
            >
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm ? (
        <div className="card">
          <EmptyState
            icon={StickyNote}
            title="No notes yet"
            description="Add quick sticky notes for this case."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((n) => {
            const c = colorObj(n.color);
            return (
              <div
                key={n._id}
                className="rounded-xl p-4 relative border shadow-sm"
                style={{
                  backgroundColor: n.color || c.bg,
                  borderColor: c.border,
                }}
              >
                <button
                  onClick={() => handleDelete(n._id)}
                  disabled={deletingId === n._id}
                  className="absolute top-2 right-2 p-1 rounded-full opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: c.text }}
                >
                  {deletingId === n._id ? (
                    <Spinner size="sm" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap pr-5"
                  style={{ color: c.text }}
                >
                  {n.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

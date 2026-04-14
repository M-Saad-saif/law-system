"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import {
  PageLoader,
  EmptyState,
  SearchInput,
  Modal,
  ConfirmDialog,
} from "@/components/ui";
import {
  Star,
  StarOff,
  Bookmark,
  Tag,
  Trash2,
  Eye,
  Plus,
  StickyNote,
  Trophy,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COURTS = [
  "",
  "Supreme Court of Pakistan",
  "Lahore High Court",
  "Sindh High Court",
  "Peshawar High Court",
  "Balochistan High Court",
  "Islamabad High Court",
  "Sessions Court",
  "Special Court",
];

export default function LibraryPage() {
  const [entries, setEntries] = useState([]);
  const [tags, setTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [filterImportant, setFilterImportant] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set("search", search);
      if (filterTag) params.set("tag", filterTag);
      if (filterCourt) params.set("courtName", filterCourt);
      if (filterImportant) params.set("isMostImportant", "true");
      const data = await api.get(`/api/library?${params}`);
      setEntries(data.data.entries);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setTags(data.data.tags || []);
    } catch {
      toast.error("Failed to load library.");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterTag, filterCourt, filterImportant]);

  useEffect(() => {
    const t = setTimeout(fetchEntries, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchEntries]);

  useEffect(() => {
    setPage(1);
  }, [search, filterTag, filterCourt, filterImportant]);

  const toggleFlag = async (entry, field) => {
    try {
      await api.put(`/api/library/${entry._id}`, { [field]: !entry[field] });
      setEntries((prev) =>
        prev.map((e) =>
          e._id === entry._id ? { ...e, [field]: !e[field] } : e,
        ),
      );
      toast.success(
        field === "isMostImportant"
          ? !entry[field]
            ? "Marked as Most Important"
            : "Removed from Most Important"
          : !entry[field]
            ? "Added to Favourites"
            : "Removed from Favourites",
      );
    } catch {
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/library/${deleteTarget._id}`);
      toast.success("Entry removed from library.");
      setDeleteTarget(null);
      fetchEntries();
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterTag("");
    setFilterCourt("");
    setFilterImportant(false);
  };

  const hasFilters = filterTag || filterCourt || filterImportant;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            Judgement Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} saved judgement{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Judgement
        </button>
      </div>

      {/* Most Important Banner */}
      {!filterImportant && (
        <button
          onClick={() => setFilterImportant(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          View Most Important Judgements
        </button>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, citation, offence, tags..."
          className="flex-1"
        />
        <select
          value={filterCourt}
          onChange={(e) => setFilterCourt(e.target.value)}
          className="select w-full sm:w-52"
        >
          <option value="">All Courts</option>
          {COURTS.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {tags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="select w-full sm:w-44"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="btn-ghost text-red-500 hover:bg-red-50 shrink-0"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Active filter pills */}
      {filterImportant && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <Trophy className="w-3 h-3" />
            Most Important
            <button onClick={() => setFilterImportant(false)}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <PageLoader />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No judgements in library"
          description="Save important judgements here for quick access, tagging, and annotations."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <LibraryCard
                key={entry._id}
                entry={entry}
                onView={() => setViewEntry(entry)}
                onToggleFavourite={() => toggleFlag(entry, "isFavourite")}
                onToggleImportant={() => toggleFlag(entry, "isMostImportant")}
                onDelete={() => setDeleteTarget(entry)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {viewEntry && (
        <EntryDetailModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
          onUpdated={(updated) => {
            setViewEntry(updated);
            setEntries((prev) =>
              prev.map((e) => (e._id === updated._id ? { ...updated } : e)),
            );
          }}
        />
      )}

      {addOpen && (
        <AddEntryModal
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            fetchEntries();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove from Library"
        message={`Remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}

// ── Library Card ─────────────────────────────────────────────────────────────

function LibraryCard({
  entry,
  onView,
  onToggleFavourite,
  onToggleImportant,
  onDelete,
}) {
  return (
    <div
      className={`card p-5 flex flex-col gap-3 group ${
        entry.isMostImportant ? "ring-2 ring-amber-400/50 bg-amber-50/30" : ""
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {entry.citation && (
            <p className="text-xs font-mono text-teal-600 font-semibold mb-0.5 truncate">
              {entry.citation}
            </p>
          )}
          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">
            {entry.title}
          </h3>
        </div>
        {entry.isMostImportant && (
          <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        )}
      </div>

      {/* Meta */}
      {entry.courtName && (
        <p className="text-xs text-slate-500">{entry.courtName}</p>
      )}

      {/* Final decision snippet */}
      {entry.finalDecision && (
        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          {entry.finalDecision}
        </p>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-medium"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
        <button
          onClick={onView}
          className="btn-ghost flex-1 text-xs justify-center"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={onToggleFavourite}
          title={entry.isFavourite ? "Remove favourite" : "Mark favourite"}
          className={`btn-ghost px-2.5 ${
            entry.isFavourite ? "text-yellow-500" : "text-slate-400"
          }`}
        >
          {entry.isFavourite ? (
            <Star className="w-4 h-4 fill-yellow-400" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onToggleImportant}
          title={
            entry.isMostImportant
              ? "Remove important flag"
              : "Mark as Most Important"
          }
          className={`btn-ghost px-2.5 ${
            entry.isMostImportant ? "text-amber-500" : "text-slate-400"
          }`}
        >
          <Trophy className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="btn-ghost px-2.5 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Entry Detail Modal ────────────────────────────────────────────────────────

function EntryDetailModal({ entry, onClose, onUpdated }) {
  const [data, setData] = useState(entry);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editTags, setEditTags] = useState(false);
  const [tagInput, setTagInput] = useState((entry.tags || []).join(", "));

  const SECTIONS = [
    { key: "offenceName", label: "Offence Name" },
    { key: "courtName", label: "Court" },
    { key: "lawsDiscussed", label: "Laws Discussed" },
    { key: "crossExaminationQuestions", label: "Cross-Examination Questions" },
    {
      key: "courtExaminationOfEvidence",
      label: "Court Examination of Evidence",
    },
    { key: "finalDecision", label: "Final Decision" },
    { key: "voiceSummary", label: "Comprehensive Summary" },
  ];

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      const res = await api.post(`/api/library/${data._id}/notes`, {
        content: noteText,
      });
      const updated = { ...data, notes: res.data.notes };
      setData(updated);
      onUpdated(updated);
      setNoteText("");
      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const res = await api.delete(
        `/api/library/${data._id}/notes?noteId=${noteId}`,
      );
      const updated = { ...data, notes: res.data.notes };
      setData(updated);
      onUpdated(updated);
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  const saveTags = async () => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await api.put(`/api/library/${data._id}`, { tags });
      const updated = { ...data, tags: res.data.entry.tags };
      setData(updated);
      onUpdated(updated);
      setEditTags(false);
      toast.success("Tags updated.");
    } catch {
      toast.error("Failed to update tags.");
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={data.title} size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Citation + meta */}
        <div className="flex flex-wrap gap-3 text-sm">
          {data.citation && (
            <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
              {data.citation}
            </span>
          )}
          {data.judgementDate && (
            <span className="text-slate-500">
              {new Date(data.judgementDate).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* 7-section display */}
        <div className="space-y-4">
          {SECTIONS.map(({ key, label }) =>
            data[key] ? (
              <div key={key}>
                <p className="label">{label}</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 whitespace-pre-wrap">
                  {data[key]}
                </p>
              </div>
            ) : null,
          )}
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label mb-0">Tags</p>
            <button
              onClick={() => setEditTags((v) => !v)}
              className="text-xs text-primary-600 hover:underline"
            >
              {editTags ? "Cancel" : "Edit tags"}
            </button>
          </div>
          {editTags ? (
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Criminal, Bail, High Court..."
              />
              <button onClick={saveTags} className="btn-primary text-xs px-4">
                Save
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.tags?.length > 0 ? (
                data.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No tags yet</span>
              )}
            </div>
          )}
        </div>

        {/* Private notes */}
        <div>
          <p className="label">Private Notes</p>
          <div className="space-y-2 mb-3">
            {(data.notes || []).length === 0 ? (
              <p className="text-xs text-slate-400">No notes yet.</p>
            ) : (
              data.notes.map((note) => (
                <div
                  key={note._id}
                  className="flex gap-2 items-start bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                >
                  <StickyNote className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 flex-1 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <button
                    onClick={() => deleteNote(note._id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              className="textarea flex-1 h-16 text-xs"
              placeholder="Add a private note or annotation..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button
              onClick={addNote}
              disabled={saving || !noteText.trim()}
              className="btn-primary text-xs px-4 self-end"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Add Entry Modal ───────────────────────────────────────────────────────────

function AddEntryModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    citation: "",
    courtName: "",
    judgementDate: "",
    offenceName: "",
    lawsDiscussed: "",
    finalDecision: "",
    voiceSummary: "",
    tags: "",
    isMostImportant: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api.post("/api/library", { ...form, tags });
      toast.success("Judgement saved to library.");
      onAdded();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Judgement to Library" size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="e.g. State vs Ahmed Ali"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Citation</label>
            <input
              className="input font-mono"
              placeholder="e.g. 2015 SCMR 1002"
              value={form.citation}
              onChange={(e) => setForm({ ...form, citation: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Judgement Date</label>
            <input
              type="date"
              className="input"
              value={form.judgementDate}
              onChange={(e) =>
                setForm({ ...form, judgementDate: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Court Name</label>
            <select
              className="select"
              value={form.courtName}
              onChange={(e) => setForm({ ...form, courtName: e.target.value })}
            >
              <option value="">Select court...</option>
              {COURTS.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Offence Name</label>
            <input
              className="input"
              placeholder="e.g. Possession under Section 9(c) CNSA 1997"
              value={form.offenceName}
              onChange={(e) =>
                setForm({ ...form, offenceName: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Laws Discussed</label>
            <textarea
              className="textarea h-16"
              placeholder="Sections, articles, legal principles..."
              value={form.lawsDiscussed}
              onChange={(e) =>
                setForm({ ...form, lawsDiscussed: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Final Decision</label>
            <textarea
              className="textarea h-16"
              placeholder="Verdict, conviction/acquittal, sentence..."
              value={form.finalDecision}
              onChange={(e) =>
                setForm({ ...form, finalDecision: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Summary</label>
            <textarea
              className="textarea h-20"
              placeholder="Plain-language summary of the judgement..."
              value={form.voiceSummary}
              onChange={(e) =>
                setForm({ ...form, voiceSummary: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input"
              placeholder="Criminal, Bail, High Court Precedent..."
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="mostImportant"
              checked={form.isMostImportant}
              onChange={(e) =>
                setForm({ ...form, isMostImportant: e.target.checked })
              }
              className="w-4 h-4 accent-amber-500"
            />
            <label
              htmlFor="mostImportant"
              className="text-sm text-slate-700 font-medium cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Mark as Most Important
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Save to Library"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

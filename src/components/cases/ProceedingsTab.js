"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate } from "@/utils/helpers";
import { EmptyState, Modal, Spinner, ConfirmDialog } from "@/components/ui";
import {
  Plus,
  Calendar,
  Trash2,
  Clock,
  ChevronRight,
  FileText,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProceedingsTab({ caseId, proceedings, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", notes: "", nextDate: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...proceedings].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.date || !form.notes)
      return toast.error("Date and notes are required.");
    setSaving(true);
    try {
      await api.post(`/api/cases/${caseId}/proceedings`, form);
      toast.success("Proceeding added.");
      setForm({ date: "", notes: "", nextDate: "" });
      setShowForm(false);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/cases/${caseId}/proceedings`, {
        proceedingId: deleteTarget._id,
      });
      toast.success("Proceeding removed.");
      setDeleteTarget(null);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            Proceeding History
          </h3>
          <p className="text-sm text-slate-500">
            {proceedings.length}{" "}
            {proceedings.length === 1 ? "entry" : "entries"} recorded
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5  bg-[#0f766e] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Proceeding
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-2xl p-12"
          >
            <EmptyState
              icon={Calendar}
              title="No proceedings yet"
              description="Add the first proceeding entry to start building the case timeline."
              className="text-slate-600"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="relative">
                {/* Timeline line - hidden on mobile */}
                <div className="hidden sm:block absolute left-5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-purple-200" />

                <AnimatePresence>
                  {sorted.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-5 pb-8 last:pb-0 relative group"
                    >
                      {/* Timeline dot with pulse effect */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#0f766e] flex items-center justify-center shadow-md shadow-blue-500/20 z-10 relative">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        {i < sorted.length - 1 && (
                          <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-indigo-200 -translate-x-1/2 sm:hidden" />
                        )}
                      </div>

                      {/* Content card */}
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex-1 min-w-0 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200/60 p-5 transition-all duration-300 hover:shadow-md hover:border-blue-200/50 group-hover:border-blue-200/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50">
                                {formatDate(p.date)}
                              </span>
                              {p.nextDate && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/50">
                                  <Calendar className="w-3 h-3" />
                                  Next: {formatDate(p.nextDate)}
                                </span>
                              )}
                            </div>
                            {p.addedBy && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <User className="w-3 h-3" />
                                <span>Added by {p.addedBy}</span>
                              </div>
                            )}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="mt-3">
                          <div className="relative">
                            <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-indigo-300 rounded-full" />
                            <p className="text-sm text-slate-600 pl-4 leading-relaxed">
                              {p.notes}
                            </p>
                          </div>
                        </div>

                        {/* Subtle gradient overlay for longer content */}
                        {p.notes.length > 200 && (
                          <div className="mt-2">
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                              Read more{" "}
                              <ChevronRight className="w-3 h-3 inline" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer summary */}
            <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white px-6 py-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Showing all {sorted.length} proceedings</span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Most recent first
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal with enhanced styling */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Proceeding"
        size="sm"
      >
        <form onSubmit={handleAdd} className="space-y-5">
          <div className="form-group">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none text-sm"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Proceeding Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none text-sm resize-none"
              rows={4}
              placeholder="Describe what happened in this proceeding..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Next Date{" "}
              <span className="text-slate-400 text-xs">(optional)</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none text-sm"
              value={form.nextDate}
              onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#0f766e] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                "Add Proceeding"
              )}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Enhanced ConfirmDialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Proceeding"
        message="Remove this proceeding entry? This action cannot be undone."
        loading={deleting}
        className="rounded-2xl"
      />
    </div>
  );
}

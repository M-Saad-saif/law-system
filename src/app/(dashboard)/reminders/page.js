"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDateTime, relativeDate } from "@/utils/helpers";
import {
  EmptyState,
  PageLoader,
  Modal,
  ConfirmDialog,
  PriorityBadge,
  Spinner,
  TabBar,
} from "@/components/ui";
import {
  Bell,
  Plus,
  Check,
  Trash2,
  Pencil,
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS = [
  { id: "upcoming", label: "Upcoming", icon: CalendarClock },
  { id: "overdue", label: "Overdue", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

const defaultForm = {
  title: "",
  description: "",
  dateTime: "",
  priority: "medium",
};

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toISOStringFromLocalInput = (value) => {
  if (!value) return "";
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  return date.toISOString();
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/reminders?filter=${filter}`);
      setReminders(response?.data?.reminders || []);
    } catch {
      toast.error("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchReminders();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  const openAdd = () => {
    setForm(defaultForm);
    setEditTarget(null);
    setShowForm(true);
  };
  const openEdit = (r) => {
    setForm({
      title: r.title,
      description: r.description || "",
      dateTime: toLocalInputValue(r.dateTime),
      priority: r.priority,
    });
    setEditTarget(r);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dateTime)
      return toast.error("Title and date/time are required.");
    setSaving(true);
    try {
      const payload = {
        ...form,
        dateTime: toISOStringFromLocalInput(form.dateTime),
      };
      if (editTarget) {
        await api.put(`/api/reminders/${editTarget._id}`, payload);
        toast.success("Reminder updated.");
      } else {
        await api.post("/api/reminders", payload);
        toast.success("Reminder added.");
      }
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (r) => {
    try {
      await api.put(`/api/reminders/${r._id}`, { isCompleted: !r.isCompleted });
      fetchReminders();
    } catch {
      toast.error("Failed to update reminder.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/reminders/${deleteTarget._id}`);
      toast.success("Reminder deleted.");
      setDeleteTarget(null);
      fetchReminders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const priorityStyles = {
    high: {
      border: "border-l-red-400",
      bg: "bg-red-50/50",
      badge: "bg-red-100 text-red-700 border-red-200",
      icon: "text-red-500",
    },
    medium: {
      border: "border-l-amber-400",
      bg: "bg-amber-50/50",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      icon: "text-amber-500",
    },
    low: {
      border: "border-l-slate-300",
      bg: "bg-slate-50/50",
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      icon: "text-slate-400",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            Reminders
          </h1>
          <p className="page-subtitle">Deadlines and scheduled alerts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="btn-primary shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </motion.button>
      </div>

      {/* Tab Bar with animation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <TabBar tabs={FILTERS} active={filter} onChange={setFilter} />
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PageLoader />
          </motion.div>
        ) : reminders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card">
              <EmptyState
                icon={Bell}
                title={
                  filter === "upcoming"
                    ? "No upcoming reminders"
                    : filter === "overdue"
                      ? "No overdue reminders"
                      : "No completed reminders"
                }
                description={
                  filter === "upcoming"
                    ? "Add a reminder to stay on top of deadlines."
                    : ""
                }
                action={
                  filter === "upcoming" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openAdd}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4" /> Add Reminder
                    </motion.button>
                  )
                }
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <AnimatePresence>
              {reminders.map((r) => {
                const overdue = !r.isCompleted && isPast(new Date(r.dateTime));
                const priorityStyle =
                  priorityStyles[r.priority] || priorityStyles.medium;

                return (
                  <motion.div
                    key={r._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    className={`card p-4 flex gap-3 border-l-4 ${priorityStyle.border} ${r.isCompleted ? "opacity-60 hover:opacity-80" : ""} hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
                  >
                    {/* Subtle background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${priorityStyle.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    {/* Complete button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleComplete(r)}
                      className={`relative z-10 w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
                        r.isCompleted
                          ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30"
                          : "border-slate-300 hover:border-emerald-400 hover:shadow-md"
                      }`}
                    >
                      {r.isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-semibold text-sm transition-all duration-200 ${
                            r.isCompleted
                              ? "line-through text-slate-400"
                              : "text-slate-800 group-hover:text-slate-900"
                          }`}
                        >
                          {r.title}
                        </h3>
                        <PriorityBadge priority={r.priority} />
                      </div>
                      {r.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {r.description}
                        </p>
                      )}
                      <div
                        className={`flex items-center gap-1.5 mt-1.5 text-xs font-medium transition-colors duration-200 ${
                          overdue
                            ? "text-red-500"
                            : "text-slate-400 group-hover:text-slate-500"
                        }`}
                      >
                        {overdue ? (
                          <AlertCircle className="w-3 h-3 animate-pulse" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {overdue ? "Overdue · " : ""}
                        {formatDateTime(r.dateTime)}
                      </div>
                      {r.linkedCase && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mt-2 text-xs text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg inline-block font-medium"
                        >
                          Case: {r.linkedCase.caseTitle}
                        </motion.div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 shrink-0 relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Edit Reminder" : "New Reminder"}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group">
            <label className="label">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="input focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
              placeholder="e.g. File written arguments"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="textarea focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
              rows={2}
              placeholder="Optional details..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="input focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="select focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="btn-primary shadow-lg shadow-teal-500/20"
            >
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : editTarget ? (
                "Save Changes"
              ) : (
                "Add Reminder"
              )}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message={`Delete "${deleteTarget?.title}"?`}
        loading={deleting}
      />
    </motion.div>
  );
}

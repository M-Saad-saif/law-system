"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDateTime, relativeDate } from "@/utils/helpers";
import {
  EmptyState,
  Modal,
  ConfirmDialog,
  PriorityBadge,
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
  Sparkles,
  Zap,
  Target,
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

// Custom TabBar with animated underline
function TabBar({ tabs, active, onChange }) {
  return (
    <div className="relative flex gap-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-1 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl 
              text-sm font-medium transition-all duration-300
              ${
                isActive
                  ? "text-teal-700 bg-gradient-to-r from-teal-50/80 to-teal-50/40"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/60"
              }
            `}
          >
            <Icon
              className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-teal-600" : "text-slate-400"}`}
            />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.charAt(0)}</span>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-full shadow-sm shadow-teal-500/30"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

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
      border: "border-l-red-500",
      bg: "bg-gradient-to-r from-red-50/60 to-transparent",
      glow: "shadow-red-500/10",
      accent: "red",
    },
    medium: {
      border: "border-l-amber-500",
      bg: "bg-gradient-to-r from-amber-50/60 to-transparent",
      glow: "shadow-amber-500/10",
      accent: "amber",
    },
    low: {
      border: "border-l-teal-500",
      bg: "bg-gradient-to-r from-teal-50/60 to-transparent",
      glow: "shadow-teal-500/10",
      accent: "teal",
    },
  };

  const getTimeRemaining = (dateTime) => {
    const now = new Date();
    const target = new Date(dateTime);
    const diff = target - now;
    if (diff < 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 shadow-sm border border-teal-200/50">
              <Bell className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent flex items-center gap-2">
                Reminders
                <Sparkles className="w-5 h-5 text-teal-500" />
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Stay on top of your deadlines and tasks
              </p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 font-medium text-sm group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Reminder
        </motion.button>
      </motion.div>

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
            className="flex items-center justify-center h-64"
          >
            <div className="relative">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-teal-600 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </motion.div>
        ) : reminders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-12">
              <EmptyState
                icon={Bell}
                title={
                  filter === "upcoming"
                    ? "All caught up!"
                    : filter === "overdue"
                      ? "No overdue reminders"
                      : "No completed reminders"
                }
                description={
                  filter === "upcoming"
                    ? "No upcoming reminders. Add one to stay organized."
                    : filter === "overdue"
                      ? "Great job! You have no overdue reminders."
                      : "Complete reminders to track your progress."
                }
                action={
                  filter === "upcoming" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openAdd}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 font-medium text-sm"
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
            className="space-y-3"
          >
            <AnimatePresence>
              {reminders.map((r) => {
                const overdue = !r.isCompleted && isPast(new Date(r.dateTime));
                const priorityStyle =
                  priorityStyles[r.priority] || priorityStyles.medium;
                const timeRemaining =
                  !r.isCompleted && !overdue
                    ? getTimeRemaining(r.dateTime)
                    : null;

                return (
                  <motion.div
                    key={r._id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    className={`
                      relative bg-white border border-slate-200/60 rounded-2xl 
                      p-4 sm:p-5 flex gap-4 border-l-[5px] ${priorityStyle.border} 
                      ${r.isCompleted ? "opacity-50" : ""} 
                      hover:shadow-xl hover:border-slate-200 transition-all duration-300 
                      group overflow-hidden
                    `}
                  >
                    {/* Animated gradient background on hover */}
                    <div
                      className={`absolute inset-0 ${priorityStyle.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                    />

                    {/* Glow effect on hover */}
                    <div
                      className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${priorityStyle.glow}`}
                    />

                    {/* Status indicators */}
                    {overdue && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span className="text-[10px] font-bold text-red-600">
                          OVERDUE
                        </span>
                      </div>
                    )}

                    {r.isCompleted && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span className="text-[10px] font-bold text-teal-600">
                          DONE
                        </span>
                      </div>
                    )}

                    {/* Complete toggle */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleComplete(r)}
                      className={`
                        relative z-10 w-6 h-6 rounded-full border-2 shrink-0 mt-1 
                        flex items-center justify-center transition-all duration-300
                        ${
                          r.isCompleted
                            ? "bg-teal-500 border-teal-500 shadow-lg shadow-teal-500/30"
                            : "border-slate-300 hover:border-teal-400 hover:shadow-md hover:shadow-teal-500/10"
                        }
                      `}
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
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 relative z-10 space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                          <h3
                            className={`
                              font-semibold text-sm sm:text-base transition-all duration-200 truncate
                              ${
                                r.isCompleted
                                  ? "line-through text-slate-400"
                                  : "text-slate-800 group-hover:text-slate-900"
                              }
                            `}
                          >
                            {r.title}
                          </h3>
                          <PriorityBadge priority={r.priority} />
                        </div>
                      </div>

                      {r.description && (
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {/* Date & time */}
                        <div
                          className={`
                            flex items-center gap-1.5 text-xs font-medium transition-colors duration-200
                            ${
                              overdue
                                ? "text-red-500"
                                : r.isCompleted
                                  ? "text-slate-400"
                                  : "text-slate-400 group-hover:text-slate-500"
                            }
                          `}
                        >
                          {overdue ? (
                            <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                          ) : r.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {formatDateTime(r.dateTime)}
                        </div>

                        {/* Time remaining badge */}
                        {timeRemaining && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5"
                          >
                            <Zap className="w-3 h-3" />
                            {timeRemaining}
                          </motion.span>
                        )}

                        {/* Linked case */}
                        {r.linkedCase && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs text-teal-600 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 font-medium"
                          >
                            <Target className="w-3 h-3" />
                            {r.linkedCase.caseTitle}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - improved visibility */}
                    <div className="flex gap-1 shrink-0 relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEdit(r)}
                        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteTarget(r)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal - Enhanced */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Edit Reminder" : "New Reminder"}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-sm placeholder:text-slate-400"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-sm resize-none placeholder:text-slate-400"
              rows={2}
              placeholder="Add any additional details..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-sm"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Priority
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-sm bg-white cursor-pointer"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low"> Low</option>
                <option value="medium"> Medium</option>
                <option value="high"> High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200 text-sm font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : editTarget ? (
                "Save Changes"
              ) : (
                "Add Reminder"
              )}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation - Enhanced */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleting}
        className="rounded-2xl"
      />
    </motion.div>
  );
}

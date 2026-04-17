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
} from "lucide-react";
import { isPast } from "date-fns";

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

  const priorityBorderColor = {
    high: "border-l-red-400",
    medium: "border-l-amber-400",
    low: "border-l-slate-300",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">Deadlines and scheduled alerts</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      <TabBar tabs={FILTERS} active={filter} onChange={setFilter} />

      {loading ? (
        <PageLoader />
      ) : reminders.length === 0 ? (
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
                <button onClick={openAdd} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add Reminder
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const overdue = !r.isCompleted && isPast(new Date(r.dateTime));
            return (
              <div
                key={r._id}
                className={`card p-4 flex gap-3 border-l-4 ${priorityBorderColor[r.priority] || "border-l-slate-200"} ${r.isCompleted ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() => toggleComplete(r)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    r.isCompleted
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 hover:border-emerald-400"
                  }`}
                >
                  {r.isCompleted && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`font-semibold text-sm ${r.isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}
                    >
                      {r.title}
                    </h3>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.description}
                    </p>
                  )}
                  <div
                    className={`flex items-center gap-1 mt-1.5 text-xs ${overdue ? "text-red-500 font-semibold" : "text-slate-400"}`}
                  >
                    <Clock className="w-3 h-3" />
                    {overdue ? "Overdue · " : ""}
                    {formatDateTime(r.dateTime)}
                  </div>
                  {r.linkedCase && (
                    <div className="mt-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md inline-block">
                      Case: {r.linkedCase.caseTitle}
                    </div>
                  )}
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              className="input"
              placeholder="e.g. File written arguments"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="textarea"
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
                className="input"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : editTarget ? (
                "Save Changes"
              ) : (
                "Add Reminder"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message={`Delete "${deleteTarget?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}

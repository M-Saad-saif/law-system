"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate } from "@/utils/helpers";
import { Modal, ConfirmDialog, StatusBadge, Spinner } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Gavel,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting", icon: Users, dot: "bg-primary-500" },
  {
    value: "deadline",
    label: "Deadline",
    icon: AlertCircle,
    dot: "bg-red-500",
  },
  { value: "other", label: "Other", icon: Tag, dot: "bg-slate-400" },
];

const typeMeta = (type) =>
  EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[2];

const defaultForm = { title: "", time: "", type: "meeting", notes: "" };

const toDateInputValue = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await api.get(
        `/api/hearings?year=${year}&month=${month}`,
      );
      setEvents(response?.data?.events || []);
    } catch {
      toast.error("Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const dateParam = searchParams.get("date");

  useEffect(() => {
    if (!dateParam) return;

    const targetDate =
      dateParam === "today"
        ? new Date()
        : new Date(dateParam.replace(/\+/g, " "));

    if (Number.isNaN(targetDate.getTime())) return;

    setCurrentMonth(startOfMonth(targetDate));
    setSelectedDate(targetDate);
  }, [dateParam]);

  const getEventsForDay = useCallback(
    (day) => events.filter((e) => isSameDay(new Date(e.date), day)),
    [events],
  );

  useEffect(() => {
    if (!selectedDate) {
      setSelectedEvents([]);
      return;
    }
    setSelectedEvents(getEventsForDay(selectedDate));
  }, [selectedDate, getEventsForDay]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Clicking any day (with or without events) opens the day modal now.
  const handleDayClick = (day) => {
    setSelectedDate(day);
    setSelectedEvents(getEventsForDay(day));
  };

  const openAddForm = (day) => {
    setFormDate(day || selectedDate || new Date());
    setEditTarget(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEditForm = (e) => {
    setFormDate(new Date(e.date));
    setEditTarget(e);
    setForm({
      title: e.title || "",
      time: e.time || "",
      type: ["meeting", "deadline", "other"].includes(e.type)
        ? e.type
        : "other",
      notes: e.notes || "",
    });
    setShowForm(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!form.title.trim() || !formDate) {
      toast.error("Title and date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        date: formDate.toISOString(),
        time: form.time,
        type: form.type,
        notes: form.notes,
      };
      if (editTarget) {
        await api.put(`/api/calendar-events/${editTarget.id}`, payload);
        toast.success("Event updated.");
      } else {
        await api.post("/api/calendar-events", payload);
        toast.success("Event added.");
      }
      setShowForm(false);
      await fetchEvents();
      // Refresh whatever's showing in the day modal
      if (selectedDate) setSelectedEvents(getEventsForDay(selectedDate));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/calendar-events/${deleteTarget.id}`);
      toast.success("Event deleted.");
      setDeleteTarget(null);
      await fetchEvents();
      if (selectedDate) setSelectedEvents(getEventsForDay(selectedDate));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">
            Hearings, proceedings, meetings and deadlines
          </p>
        </div>
        <button onClick={() => openAddForm(new Date())} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="btn-ghost p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 font-display">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="btn-ghost p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const hasEvents = dayEvents.length > 0;
                  const hasHearing = dayEvents.some(
                    (e) => e.type === "hearing" || e.type === "proceeding",
                  );
                  const hasCustom = dayEvents.some(
                    (e) =>
                      e.type === "meeting" ||
                      e.type === "deadline" ||
                      e.type === "other",
                  );

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        group relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] transition-all
                        ${!inMonth ? "opacity-30" : ""}
                        ${today ? "bg-primary-600 text-white" : hasEvents ? "bg-primary-50 hover:bg-primary-100 cursor-pointer" : "hover:bg-slate-50 cursor-pointer"}
                      `}
                    >
                      <span
                        className={`text-sm font-semibold ${today ? "text-white" : inMonth ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {format(day, "d")}
                      </span>
                      {hasEvents && !today && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasHearing && (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                          {hasCustom && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          )}
                        </div>
                      )}
                      {hasEvents && !today && (
                        <span className="text-[9px] text-primary-600 font-semibold mt-0.5">
                          {dayEvents.length}
                        </span>
                      )}
                      {/* Hover affordance to quick-add on an empty day */}
                      {!hasEvents && !today && (
                        <Plus className="w-3 h-3 text-slate-300 group-hover:text-primary-500 mt-0.5 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-500">
                    Hearing / Proceeding
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  <span className="text-xs text-slate-500">
                    Meeting / Deadline
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                  <span className="text-xs text-slate-500">Today</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-800 font-display mb-4">
            Upcoming
          </h3>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => {
                const meta = e.custom ? typeMeta(e.type) : null;
                return (
                  <button
                    key={e.id}
                    onClick={() =>
                      e.custom
                        ? openEditForm(e)
                        : router.push(`/cases/${e.caseId}`)
                    }
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {e.type === "hearing" || e.type === "proceeding" ? (
                        <Gavel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {meta ? meta.label : e.type}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {formatDate(e.date)}
                        {e.time ? ` · ${e.time}` : ""}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-primary-700 truncate">
                      {e.title}
                    </div>
                    {e.court && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {e.court}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Day modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, "EEEE, dd MMMM yyyy") : ""}
        size="sm"
      >
        <div className="space-y-3">
          {selectedEvents.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">
              Nothing scheduled for this day yet.
            </p>
          )}

          {selectedEvents.map((e) => {
            const isHearing = e.type === "hearing" || e.type === "proceeding";
            const meta = !isHearing ? typeMeta(e.type) : null;
            return (
              <div
                key={e.id}
                className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => {
                      if (isHearing) {
                        router.push(`/cases/${e.caseId}`);
                        setSelectedDate(null);
                      }
                    }}
                    className={`flex-1 text-left ${isHearing ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {isHearing ? (
                        <span className="badge bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                          {e.type}
                        </span>
                      ) : (
                        <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
                          {meta.label}
                        </span>
                      )}
                      {e.status && <StatusBadge status={e.status} />}
                      {e.time && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {e.time}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-800">
                      {e.title}
                    </div>
                    {e.caseNumber && (
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {e.caseNumber}
                      </div>
                    )}
                    {e.court && (
                      <div className="text-xs text-slate-500 mt-1">
                        {e.court}
                      </div>
                    )}
                    {e.notes && (
                      <div className="text-xs text-slate-500 mt-1.5">
                        {e.notes}
                      </div>
                    )}
                  </button>

                  {e.custom && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditForm(e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => openAddForm(selectedDate)}
            className="btn-secondary w-full justify-center mt-2"
          >
            <Plus className="w-4 h-4" /> Add Event for This Day
          </button>
        </div>
      </Modal>

      {/* Quick-add / edit event form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? "Edit Event" : "Add Event"}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group">
            <label className="label">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="input"
              value={toDateInputValue(formDate)}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                if (y && m && d) setFormDate(new Date(y, m - 1, d));
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Client meeting, file submission deadline"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Time</label>
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Type</label>
              <select
                className="select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Optional details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
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
                "Add Event"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}

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
  { value: "meeting", label: "Meeting", icon: Users, dot: "bg-[#0d8e83]" },
  {
    value: "deadline",
    label: "Deadline",
    icon: AlertCircle,
    dot: "bg-rose-500",
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
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 py-2 bg-[#eef5f3]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c3d3b] tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-[#1c3d3b]/60 mt-1">
            Hearings, proceedings, meetings and deadlines
          </p>
        </div>
        <button
          onClick={() => openAddForm(new Date())}
          className="inline-flex items-center gap-2 rounded-xl bg-[#026665] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#026665]/20 transition-all duration-200 hover:bg-[#0d8e83] hover:shadow-md hover:shadow-[#0d8e83]/25 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl border border-[#ccebdb] bg-white p-5 sm:p-6 shadow-sm shadow-[#1c3d3b]/5">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg text-[#1c3d3b]/50 hover:text-[#026665] hover:bg-[#ccebdb]/50 transition-colors duration-150"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-[#1c3d3b] tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg text-[#1c3d3b]/50 hover:text-[#026665] hover:bg-[#ccebdb]/50 transition-colors duration-150"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-[#ccebdb] border-t-[#026665] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[11px] font-bold text-[#1c3d3b]/35 uppercase tracking-wider py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1.5">
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
                        group relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[56px] cursor-pointer
                        transition-all duration-150 ease-out
                        ${!inMonth ? "opacity-30" : ""}
                        ${
                          today
                            ? "bg-[#026665] text-white shadow-sm shadow-[#026665]/30"
                            : hasEvents
                              ? "bg-[#ccebdb]/60 hover:bg-[#ccebdb] hover:-translate-y-0.5 hover:shadow-sm"
                              : "hover:bg-[#ccebdb]/40 hover:-translate-y-0.5"
                        }
                      `}
                    >
                      <span
                        className={`text-sm font-semibold ${today ? "text-white" : inMonth ? "text-[#1c3d3b]" : "text-[#1c3d3b]/40"}`}
                      >
                        {format(day, "d")}
                      </span>
                      {hasEvents && !today && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasHearing && (
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                          {hasCustom && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0d8e83]" />
                          )}
                        </div>
                      )}
                      {hasEvents && !today && (
                        <span className="text-[9px] text-[#026665] font-bold mt-0.5">
                          {dayEvents.length}
                        </span>
                      )}
                      {/* Hover affordance to quick-add on an empty day */}
                      {!hasEvents && !today && (
                        <Plus className="w-3 h-3 text-[#1c3d3b]/0 group-hover:text-[#0d8e83]/70 mt-0.5 transition-colors duration-150" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#ccebdb] flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-[#1c3d3b]/55">
                    Hearing / Proceeding
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0d8e83]" />
                  <span className="text-xs text-[#1c3d3b]/55">
                    Meeting / Deadline
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#026665]" />
                  <span className="text-xs text-[#1c3d3b]/55">Today</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div className="rounded-2xl border border-[#ccebdb] bg-white p-5 sm:p-6 shadow-sm shadow-[#1c3d3b]/5">
          <h3 className="font-bold text-[#1c3d3b] tracking-tight mb-4">
            Upcoming
          </h3>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ccebdb]/50 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5 text-[#0d8e83]" />
              </div>
              <p className="text-sm text-[#1c3d3b]/45">No upcoming events</p>
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
                    className="w-full text-left p-3.5 rounded-xl border border-[#ccebdb]/70 hover:border-[#0d8e83]/40 hover:bg-[#ccebdb]/25 transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {e.type === "hearing" || e.type === "proceeding" ? (
                        <Gavel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#0d8e83] shrink-0" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c3d3b]/40">
                        {meta ? meta.label : e.type}
                      </span>
                      <span className="text-[10px] text-[#1c3d3b]/40 ml-auto">
                        {formatDate(e.date)}
                        {e.time ? ` · ${e.time}` : ""}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[#1c3d3b] group-hover:text-[#026665] transition-colors truncate">
                      {e.title}
                    </div>
                    {e.court && (
                      <div className="text-xs text-[#1c3d3b]/40 truncate mt-0.5">
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
            <p className="text-sm text-[#1c3d3b]/40 text-center py-3">
              Nothing scheduled for this day yet.
            </p>
          )}

          {selectedEvents.map((e) => {
            const isHearing = e.type === "hearing" || e.type === "proceeding";
            const meta = !isHearing ? typeMeta(e.type) : null;
            return (
              <div
                key={e.id}
                className="w-full text-left p-4 rounded-xl border border-[#ccebdb]/70 hover:border-[#0d8e83]/40 hover:bg-[#ccebdb]/20 transition-all duration-150"
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
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-100 capitalize">
                          {e.type}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#ccebdb]/70 px-2.5 py-1 text-[11px] font-semibold text-[#026665] border border-[#ccebdb]">
                          {meta.label}
                        </span>
                      )}
                      {e.status && <StatusBadge status={e.status} />}
                      {e.time && (
                        <span className="text-xs text-[#1c3d3b]/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {e.time}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-[#1c3d3b]">
                      {e.title}
                    </div>
                    {e.caseNumber && (
                      <div className="text-xs text-[#1c3d3b]/40 font-mono mt-0.5">
                        {e.caseNumber}
                      </div>
                    )}
                    {e.court && (
                      <div className="text-xs text-[#1c3d3b]/55 mt-1">
                        {e.court}
                      </div>
                    )}
                    {e.notes && (
                      <div className="text-xs text-[#1c3d3b]/55 mt-1.5">
                        {e.notes}
                      </div>
                    )}
                  </button>

                  {e.custom && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditForm(e)}
                        className="p-1.5 rounded-lg text-[#1c3d3b]/35 hover:text-[#026665] hover:bg-[#ccebdb]/60 transition-all duration-150"
                        aria-label="Edit event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(e)}
                        className="p-1.5 rounded-lg text-[#1c3d3b]/35 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
                        aria-label="Delete event"
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
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#0d8e83]/30 bg-[#ccebdb]/25 px-4 py-2.5 text-sm font-semibold text-[#026665] transition-all duration-150 hover:bg-[#ccebdb]/50 mt-2"
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c3d3b]/70">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-[#ccebdb] bg-white px-3 py-2.5 text-sm text-[#1c3d3b] transition-colors focus:border-[#0d8e83] focus:outline-none focus:ring-2 focus:ring-[#0d8e83]/20"
              value={toDateInputValue(formDate)}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                if (y && m && d) setFormDate(new Date(y, m - 1, d));
              }}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c3d3b]/70">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-[#ccebdb] bg-white px-3 py-2.5 text-sm text-[#1c3d3b] placeholder:text-[#1c3d3b]/30 transition-colors focus:border-[#0d8e83] focus:outline-none focus:ring-2 focus:ring-[#0d8e83]/20"
              placeholder="e.g. Client meeting, file submission deadline"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1c3d3b]/70">
                Time
              </label>
              <input
                type="time"
                className="w-full rounded-lg border border-[#ccebdb] bg-white px-3 py-2.5 text-sm text-[#1c3d3b] transition-colors focus:border-[#0d8e83] focus:outline-none focus:ring-2 focus:ring-[#0d8e83]/20"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1c3d3b]/70">
                Type
              </label>
              <select
                className="w-full rounded-lg border border-[#ccebdb] bg-white px-3 py-2.5 text-sm text-[#1c3d3b] transition-colors focus:border-[#0d8e83] focus:outline-none focus:ring-2 focus:ring-[#0d8e83]/20"
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1c3d3b]/70">
              Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-[#ccebdb] bg-white px-3 py-2.5 text-sm text-[#1c3d3b] placeholder:text-[#1c3d3b]/30 transition-colors focus:border-[#0d8e83] focus:outline-none focus:ring-2 focus:ring-[#0d8e83]/20 resize-none"
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
              className="rounded-xl border border-[#ccebdb] px-4 py-2.5 text-sm font-semibold text-[#1c3d3b]/70 transition-colors duration-150 hover:bg-[#ccebdb]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#026665] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#026665]/20 transition-all duration-200 hover:bg-[#0d8e83] disabled:opacity-60 disabled:cursor-not-allowed min-w-[112px]"
            >
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

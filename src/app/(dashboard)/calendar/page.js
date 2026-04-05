'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { formatDate } from '@/utils/helpers';
import { PageLoader, Modal, StatusBadge } from '@/components/ui';
import { ChevronLeft, ChevronRight, CalendarDays, Gavel, Clock } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns';

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await api.get(`/api/hearings?year=${year}&month=${month}`);
      setEvents(data.data.events);
    } catch {
      toast.error('Failed to load calendar.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const handleDayClick = (day) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length === 0) return;
    setSelectedDate(day);
    setSelectedEvents(dayEvents);
  };

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <p className="page-subtitle">Hearings and proceedings schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 font-display">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost p-2">
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
                  <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
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
                  const hasHearing = dayEvents.some((e) => e.type === 'hearing');
                  const hasProceeding = dayEvents.some((e) => e.type === 'proceeding');

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        relative flex flex-col items-center justify-start p-1.5 rounded-xl min-h-[52px] transition-all
                        ${!inMonth ? 'opacity-30' : ''}
                        ${today ? 'bg-primary-600 text-white' : hasEvents ? 'bg-primary-50 hover:bg-primary-100 cursor-pointer' : 'hover:bg-slate-50'}
                        ${!today && !hasEvents ? 'cursor-default' : ''}
                      `}
                    >
                      <span className={`text-sm font-semibold ${today ? 'text-white' : inMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                        {format(day, 'd')}
                      </span>
                      {hasEvents && !today && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasHearing && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {hasProceeding && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                        </div>
                      )}
                      {hasEvents && !today && (
                        <span className="text-[9px] text-primary-600 font-semibold mt-0.5">
                          {dayEvents.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-500">Hearing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  <span className="text-xs text-slate-500">Proceeding</span>
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
          <h3 className="font-bold text-slate-800 font-display mb-4">Upcoming</h3>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => router.push(`/cases/${e.caseId}`)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {e.type === 'hearing' ? (
                      <Gavel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {e.type}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{formatDate(e.date)}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-primary-700 truncate">
                    {e.title}
                  </div>
                  {e.court && <div className="text-xs text-slate-400 truncate mt-0.5">{e.court}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, 'EEEE, dd MMMM yyyy') : ''}
        size="sm"
      >
        <div className="space-y-3">
          {selectedEvents.map((e) => (
            <button
              key={e.id}
              onClick={() => { router.push(`/cases/${e.caseId}`); setSelectedDate(null); }}
              className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                {e.type === 'hearing' ? (
                  <span className="badge bg-amber-50 text-amber-700 border border-amber-100">Hearing</span>
                ) : (
                  <span className="badge bg-primary-50 text-primary-700 border border-primary-100">Proceeding</span>
                )}
                <StatusBadge status={e.status} />
              </div>
              <div className="font-semibold text-slate-800">{e.title}</div>
              {e.caseNumber && <div className="text-xs text-slate-400 font-mono mt-0.5">{e.caseNumber}</div>}
              {e.court && <div className="text-xs text-slate-500 mt-1">{e.court}</div>}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

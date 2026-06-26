import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";
import CalendarEvent from "@/models/CalendarEvent";

export const GET = withAuth(async (req, context, user) => {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  sevenDaysLater.setHours(23, 59, 59, 999);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const cases = await Case.find({
    userId: user.id,
    $or: [
      { nextHearingDate: { $gte: today, $lte: sevenDaysLater } },
      { nextProceedingDate: { $gte: today, $lte: sevenDaysLater } },
    ],
    status: { $ne: "Decided" },
  })
    .select(
      "caseTitle caseNumber courtName caseType nextHearingDate nextProceedingDate status clientName",
    )
    .lean();

  const customEvents = await CalendarEvent.find({
    userId: user.id,
    date: { $gte: today, $lte: sevenDaysLater },
  })
    .select("title date time type notes linkedCase")
    .lean();

  const toKey = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const grouped = {};
  days.forEach((d) => {
    grouped[toKey(d)] = [];
  });

  cases.forEach((c) => {
    if (c.nextHearingDate) {
      const key = toKey(c.nextHearingDate);
      if (grouped[key] !== undefined) {
        grouped[key].push({
          _id: c._id,
          caseTitle: c.caseTitle,
          caseNumber: c.caseNumber,
          courtName: c.courtName,
          caseType: c.caseType,
          clientName: c.clientName,
          status: c.status,
          dateType: "hearing",
          date: c.nextHearingDate,
        });
      }
    }
    if (
      c.nextProceedingDate &&
      toKey(c.nextProceedingDate) !== toKey(c.nextHearingDate)
    ) {
      const key = toKey(c.nextProceedingDate);
      if (grouped[key] !== undefined) {
        grouped[key].push({
          _id: c._id,
          caseTitle: c.caseTitle,
          caseNumber: c.caseNumber,
          courtName: c.courtName,
          caseType: c.caseType,
          clientName: c.clientName,
          status: c.status,
          dateType: "proceeding",
          date: c.nextProceedingDate,
        });
      }
    }
  });

  customEvents.forEach((event) => {
    const key = toKey(event.date);
    if (grouped[key] === undefined) return;

    grouped[key].push({
      _id: event._id,
      caseTitle: event.title,
      caseNumber: null,
      courtName: null,
      caseType: null,
      clientName: null,
      status: null,
      dateType: event.type || "other",
      date: event.date,
      time: event.time || "",
      notes: event.notes || "",
      custom: true,
      linkedCase: event.linkedCase || null,
    });
  });

  Object.values(grouped).forEach((items) => {
    items.sort((a, b) => {
      const toMinutes = (value) => {
        if (!value) return Number.MAX_SAFE_INTEGER;
        const timeMatch = String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (timeMatch) {
          let hours = Number(timeMatch[1]);
          const minutes = Number(timeMatch[2]);
          const period = timeMatch[3]?.toUpperCase();
          if (period === "PM" && hours !== 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          return hours * 60 + minutes;
        }
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
      };

      return toMinutes(a.time || a.date) - toMinutes(b.time || b.date);
    });
  });

  // Shape into array of day objects
  const outlook = days.map((d) => ({
    dateKey: toKey(d),
    label: d.toLocaleDateString("en-PK", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    isToday: toKey(d) === toKey(new Date()),
    hearings: grouped[toKey(d)],
    count: grouped[toKey(d)].length,
  }));

  const totalCount = outlook.reduce((sum, d) => sum + d.count, 0);

  return NextResponse.json({ outlook, totalCount });
});

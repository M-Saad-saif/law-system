import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

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

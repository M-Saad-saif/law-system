import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withAuth } from "@/lib/api";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear());
    const month = parseInt(
      searchParams.get("month") || new Date().getMonth() + 1,
    );

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const cases = await Case.find({
      userId: user.id,
      $or: [
        { nextHearingDate: { $gte: startDate, $lte: endDate } },
        { nextProceedingDate: { $gte: startDate, $lte: endDate } },
      ],
    }).select(
      "caseTitle caseNumber courtName nextHearingDate nextProceedingDate status",
    );

    const events = [];
    cases.forEach((c) => {
      if (c.nextHearingDate >= startDate && c.nextHearingDate <= endDate) {
        events.push({
          id: `${c._id}-hearing`,
          caseId: c._id,
          title: c.caseTitle,
          caseNumber: c.caseNumber,
          court: c.courtName,
          date: c.nextHearingDate,
          type: "hearing",
          status: c.status,
        });
      }
      if (
        c.nextProceedingDate >= startDate &&
        c.nextProceedingDate <= endDate
      ) {
        events.push({
          id: `${c._id}-proceeding`,
          caseId: c._id,
          title: c.caseTitle,
          caseNumber: c.caseNumber,
          court: c.courtName,
          date: c.nextProceedingDate,
          type: "proceeding",
          status: c.status,
        });
      }
    });

    return NextResponse.json({ success: true, data: { events } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch hearings." },
      { status: 500 },
    );
  }
});

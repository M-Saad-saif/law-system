import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CalendarEvent from "@/models/CalendarEvent";
import { withAuth } from "@/lib/api";

const ALLOWED_TYPES = ["meeting", "deadline", "hearing", "other"];

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

    const events = await CalendarEvent.find({
      userId: user.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: { events } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch calendar events." },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const { title, date, time, type, notes } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title is required." },
        { status: 400 },
      );
    }

    if (!date || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json(
        { success: false, message: "A valid date is required." },
        { status: 400 },
      );
    }

    const event = await CalendarEvent.create({
      userId: user.id,
      title: title.trim(),
      date: new Date(date),
      time: time?.trim() || "",
      type: ALLOWED_TYPES.includes(type) ? type : "meeting",
      notes: notes?.trim() || "",
    });

    return NextResponse.json(
      { success: true, data: { event } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create calendar event." },
      { status: 500 },
    );
  }
});

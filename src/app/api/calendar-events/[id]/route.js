import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CalendarEvent from "@/models/CalendarEvent";
import { withAuth } from "@/lib/api";

const ALLOWED_TYPES = ["meeting", "deadline", "hearing", "other"];

export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const update = {};

    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json(
          { success: false, message: "Title is required." },
          { status: 400 },
        );
      }
      update.title = body.title.trim();
    }

    if (body.date !== undefined) {
      if (Number.isNaN(new Date(body.date).getTime())) {
        return NextResponse.json(
          { success: false, message: "A valid date is required." },
          { status: 400 },
        );
      }
      update.date = new Date(body.date);
    }

    if (body.time !== undefined) update.time = body.time?.trim() || "";
    if (body.notes !== undefined) update.notes = body.notes?.trim() || "";
    if (body.type !== undefined) {
      update.type = ALLOWED_TYPES.includes(body.type) ? body.type : "meeting";
    }

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { event } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update calendar event." },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const event = await CalendarEvent.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Event deleted." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete calendar event." },
      { status: 500 },
    );
  }
});

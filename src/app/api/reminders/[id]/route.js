import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Reminder } from "@/models/BookReminder";
import { withAuth } from "@/lib/api";

export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const reminder = await Reminder.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: body },
      { new: true, runValidators: true },
    );
    if (!reminder) {
      return NextResponse.json(
        { success: false, message: "Reminder not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: { reminder } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update reminder." },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const reminder = await Reminder.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });
    if (!reminder) {
      return NextResponse.json(
        { success: false, message: "Reminder not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, message: "Reminder deleted." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete reminder." },
      { status: 500 },
    );
  }
});

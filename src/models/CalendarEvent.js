import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["meeting", "deadline", "hearing", "other"],
      default: "meeting",
    },
    notes: { type: String, trim: true, default: "" },
    linkedCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
    },
  },
  { timestamps: true },
);

calendarEventSchema.index({ userId: 1, date: 1 });

export default mongoose.models.CalendarEvent ||
  mongoose.model("CalendarEvent", calendarEventSchema);

import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    crossExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrossExamination",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "submitted",
        "assigned",
        "review_started",
        "qa_edited",
        "comment_added",
        "comment_resolved",
        "flagged",
        "unflagged",
        "qa_approved",
        "qa_reviewed",
        "changes_requested",
        "resubmitted",
        "approved",
        "archived",
        "witness_added",
        "witness_deleted",
        "qa_added",
        "qa_deleted",
      ],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    before: { type: mongoose.Schema.Types.Mixed, default: null },

    after: { type: mongoose.Schema.Types.Mixed, default: null },

    message: { type: String, default: "" },
  },
  { timestamps: true },
);

activityLogSchema.index({ crossExamId: 1, createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);

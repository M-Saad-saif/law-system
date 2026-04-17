/**
 * CrossExamination.js  (UPDATED)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from original:
 *  - Added `aiGeneratedQuestions` string field to store raw AI output.
 *  - All original fields preserved.
 * ─────────────────────────────────────────────────────────────────────────────
 * Read the original model first to ensure full field parity.
 */
import mongoose from "mongoose";

const crossExaminationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "in_review",
        "changes_requested",
        "approved",
        "courtroom_active",
        "archived",
      ],
      default: "draft",
    },
    hearingDate: { type: Date },

    // ── Original fields (preserved) ────────────────────────────────────────
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    approvedAt: { type: Date },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    summary: { type: String, trim: true },
    reviewNotes: { type: String, trim: true },

    // ── NEW: AI-generated cross-examination questions ──────────────────────
    // Raw text output from aiService.generateCrossQuestions().
    // Lawyers use this as a reference when building formal WitnessSection QA pairs.
    aiGeneratedQuestions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

crossExaminationSchema.index({ userId: 1, createdAt: -1 });
crossExaminationSchema.index({ caseId: 1 });
crossExaminationSchema.index({ status: 1 });

export default mongoose.models.CrossExamination ||
  mongoose.model("CrossExamination", crossExaminationSchema);

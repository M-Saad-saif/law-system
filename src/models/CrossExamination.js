
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

    // Witness sections stored as array of ObjectIds
    witnessSections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "WitnessSection",
      default: [],
    },

    // Version tracking for snapshots
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: {
      type: [
        {
          version: Number,
          snapshot: Object,
          diffs: Array,
          insights: Object,
          createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          message: String,
          triggerAction: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // --- Original fields (preserved) ---
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

    // Assigned reviewer for review workflow
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    summary: { type: String, trim: true },
    reviewNotes: { type: String, trim: true },

    aiGeneratedQuestions: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

crossExaminationSchema.pre("save", function (next) {
  if (this.isModified("userId") && this.userId) {
    this.createdBy = this.userId;
  }
  next();
});

crossExaminationSchema.index({ userId: 1, createdAt: -1 });
crossExaminationSchema.index({ caseId: 1 });
crossExaminationSchema.index({ status: 1 });

export default mongoose.models.CrossExamination ||
  mongoose.model("CrossExamination", crossExaminationSchema);

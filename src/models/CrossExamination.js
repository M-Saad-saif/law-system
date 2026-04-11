import mongoose from "mongoose";

const versionSnapshotSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },

    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, default: "" },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

const crossExaminationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "in_review",
        "changes_requested",
        "approved",
        "archived",
      ],
      default: "draft",
    },

    version: { type: Number, default: 1 },

    versionHistory: { type: [versionSnapshotSchema], default: [] },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    witnessSections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WitnessSection" },
    ],

    hearingDate: { type: Date, default: null },

    isLocked: { type: Boolean, default: false },

    generalComments: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.CrossExamination ||
  mongoose.model("CrossExamination", crossExaminationSchema);

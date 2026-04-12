import mongoose from "mongoose";

// ---- Diff Entry for meaningful version compariso ----
const diffEntrySchema = new mongoose.Schema(
  {
    witnessId: String,
    witnessName: String,
    qaId: String,
    sequence: Number,
    field: String,
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changeType: {
      type: String,
      enum: ["added", "removed", "modified", "statusChanged", "reordered"],
      default: "modified",
    },
  },
  { _id: false },
);

// ---- Version Snapshot (enriched) ----
const versionSnapshotSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    diffs: { type: [diffEntrySchema], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, default: "" },
    triggerAction: {
      type: String,
      enum: ["submit", "resubmit", "approve", "manual", "courtroom_session"],
      default: "manual",
    },

    insights: {
      questionsAdded: { type: Number, default: 0 },
      questionsRemoved: { type: Number, default: 0 },
      questionsModified: { type: Number, default: 0 },
      statusChanges: { type: Number, default: 0 },
      phaseChanges: { type: Number, default: 0 },
      summary: { type: String, default: "" },
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
);

// ---- Hearing Session (tracks live courtroom usage) ----
const hearingSessionSchema = new mongoose.Schema(
  {
    sessionDate: { type: Date, required: true },
    courtRoom: { type: String, default: "" },
    judge: { type: String, default: "" },
    conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    sessionNotes: { type: String, default: "" },
    questionsAsked: { type: Number, default: 0 },
    questionsSkipped: { type: Number, default: 0 },
    outcome: {
      type: String,
      enum: ["favorable", "neutral", "unfavorable", "adjourned", ""],
      default: "",
    },
    postSessionReview: { type: String, default: "" },
  },
  { timestamps: true },
);

// ---- Cross Examination ----
const crossExaminationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      default: null,
    },

    //    --- Workflow Status    ---
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "in_review",
        "changes_requested",
        "approved",
        "courtroom_active", // locked into live court mode
        "archived",
      ],
      default: "draft",
    },

    //    --- Team    ---
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
    supervisingPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    //    --- Hearing Info    ---
    hearingDate: { type: Date, default: null },
    courtName: { type: String, default: "" },
    judgeName: { type: String, default: "" },
    opposingCounsel: { type: String, default: "" },
    hearingSessions: { type: [hearingSessionSchema], default: [] },

    // ---- Version Control ----
    version: { type: Number, default: 1 },
    versionHistory: { type: [versionSnapshotSchema], default: [] },

    // ---- Strategic Overview (top-level, not per-question) ----
    caseTheory: { type: String, default: "" },
    overallObjective: { type: String, default: "" },
    keyAdmissionsTargeted: [{ type: String }],

    // ---- Witnesses ----
    witnessSections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "WitnessSection" },
    ],

    // ---- Review Metadata ----
    isLocked: { type: Boolean, default: false },
    revisionNote: { type: String, default: "" },
    generalComments: { type: mongoose.Schema.Types.Mixed, default: [] },
    reviewCompletedAt: { type: Date, default: null },

    // ---- Courtroom Mode ----
    courtroomModeActive: { type: Boolean, default: false },
    activeWitnessId: { type: mongoose.Schema.Types.ObjectId, default: null },
    activeQaIndex: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.CrossExamination ||
  mongoose.model("CrossExamination", crossExaminationSchema);

import mongoose from "mongoose";

const inlineCommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: { type: mongoose.Schema.Types.ObjectId, default: null },
    resolved: { type: Boolean, default: false },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const objectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "leading",
        "relevance",
        "hearsay",
        "badCharacter",
        "speculation",
        "compound",
        "asked",
        "argumentative",
        "privilege",
        "other",
      ],
      required: true,
    },
    description: { type: String, default: "" },
    responseStrategy: { type: String, default: "" },
    caseAuthority: { type: String, default: "" },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { _id: true },
);

const scoringSchema = new mongoose.Schema(
  {
    clarity: { type: Number, min: 0, max: 10, default: null },
    legalStrength: { type: Number, min: 0, max: 10, default: null },
    strategicValue: { type: Number, min: 0, max: 10, default: null },
    overallScore: { type: Number, min: 0, max: 10, default: null },
    scoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scoredAt: { type: Date, default: null },
    reviewerNote: { type: String, default: "" },
  },
  { _id: false },
);

const courtroomUsageSchema = new mongoose.Schema(
  {
    isAsked: { type: Boolean, default: false },
    askedAt: { type: Date, default: null },
    isAnswered: { type: Boolean, default: false },
    isSkipped: { type: Boolean, default: false },
    skipReason: { type: String, default: "" },
    witnessActualAnswer: { type: String, default: "" },
    notesDuringHearing: { type: String, default: "" },
    judgeReaction: {
      type: String,
      enum: [
        "neutral",
        "sustained_objection",
        "overruled_objection",
        "struck_question",
        "admonished_counsel",
        "",
      ],
      default: "",
    },
    objectionsRaisedInCourt: [{ type: String }],
  },
  { _id: false },
);

const qaPairSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },

    originalQuestion: { type: String, default: "" },
    originalAnswer: { type: String, default: "" },
    editedQuestion: { type: String, default: "" },
    editedAnswer: { type: String, default: "" },
    useEditedVersion: { type: Boolean, default: false },

    questionType: {
      type: String,
      enum: [
        "leading",
        "open",
        "impeachment",
        "fact",
        "credibility",
        "hypothetical",
      ],
      default: "leading",
    },

    phase: {
      type: String,
      enum: [
        "intro",
        "factEstablish",
        "contradiction",
        "credibilityAttack",
        "admission",
        "closing",
      ],
      default: "factEstablish",
    },

    objective: { type: String, default: "" },
    expectedAnswer: { type: String, default: "" },
    ifWitnessDenies: { type: String, default: "" },
    linkedToEvidence: { type: String, default: "" },

    possibleObjections: { type: [objectionSchema], default: [] },

    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "needsRevision", "risky", "withdrawn"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    seniorNote: { type: String, default: "" },

    isApproved: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },

    strategyNote: { type: String, default: "" },
    evidenceNote: { type: String, default: "" },
    caseLawNote: { type: String, default: "" },
    internalNote: { type: String, default: "" },

    comments: { type: [inlineCommentSchema], default: [] },

    scoring: { type: scoringSchema, default: () => ({}) },

    courtroomUsage: { type: courtroomUsageSchema, default: () => ({}) },
  },
  { timestamps: true },
);

const witnessSectionSchema = new mongoose.Schema(
  {
    crossExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrossExamination",
      required: true,
    },

    witnessName: { type: String, required: true, trim: true },

    witnessType: {
      type: String,
      enum: ["prosecution", "defense", "expert", "character", "hostile"],
      default: "prosecution",
    },

    role: { type: String, default: "" },

    witnessBackground: { type: String, default: "" },
    knownBiases: { type: String, default: "" },
    priorStatements: [{ label: String, text: String }],

    primaryObjective: { type: String, default: "" },
    successCriteria: { type: String, default: "" },

    displayOrder: { type: Number, default: 0 },

    qaPairs: { type: [qaPairSchema], default: [] },
  },
  { timestamps: true },
);

witnessSectionSchema.pre("save", function (next) {
  this.qaPairs.forEach((pair) => {
    const { clarity, legalStrength, strategicValue } = pair.scoring;
    if (clarity !== null && legalStrength !== null && strategicValue !== null) {
      pair.scoring.overallScore = parseFloat(
        ((clarity + legalStrength + strategicValue) / 3).toFixed(1),
      );
    }
    pair.isApproved = pair.reviewStatus === "approved";
    pair.isFlagged = pair.reviewStatus === "risky";
  });
  next();
});

export default mongoose.models.WitnessSection ||
  mongoose.model("WitnessSection", witnessSectionSchema);

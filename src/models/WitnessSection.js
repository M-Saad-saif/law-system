import mongoose from "mongoose";

// ---- Inline Comment for senior lawyers to annotate QA pairs ----
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

// ----- Objection Entry -----
const objectionSchema = new mongoose.Schema(
  {
    /**
     * Type of objection (PO = Prosecution / opposing counsel may raise)
     * Common objections in Pakistani / common-law courts:
     *   leading      - objection to a leading question during examination-in-chief
     *   relevance    - question not relevant to the matter in issue
     *   hearsay      - answer would be based on out-of-court statements
     *   badCharacter - attacking character without permission
     *   speculation  - asking the witness to speculate
     *   compound     - two questions in one
     *   asked        - question already asked and answered
     *   argumentative- counsel arguing rather than questioning
     */
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

// ---- Scoring Rubric filled by senior reviewer ----
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

// ---- Courtroom Live Tracking used during actual hearing----
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

// ----- QA Pair (the core unit of cross-examination) -----
const qaPairSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },

    // ----- Question Content -----
    originalQuestion: { type: String, default: "" },
    originalAnswer: { type: String, default: "" },
    editedQuestion: { type: String, default: "" },
    editedAnswer: { type: String, default: "" },
    useEditedVersion: { type: Boolean, default: false },

    // ----- Legal Classification -----
    /**
     * questionType:
     *   leading      -suggests the answer (preferred in cross-examination)
     *   open         -"What happened next?" (use sparingly — gives witness control)
     *   impeachment  -contradicts witness's prior statement or evidence
     *   fact         -establishes a bare factual point
     *   credibility  -challenges the witness's truthfulness or bias
     *   hypothetical -used with expert witnesses
     */
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

    /**
     * phase: strategic position of this question in the overall cross-exam arc
     *   intro          -establish rapport / lock witness into basic facts
     *   factEstablish  -build the factual foundation
     *   contradiction  -expose inconsistencies
     *   credibilityAttack -challenge motive, bias, prior convictions
     *   admission      -force a concession
     *   closing        -seal the contradiction / end on strength
     */
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

    // ---- Strategic Intent ----
    objective: { type: String, default: "" },
    expectedAnswer: { type: String, default: "" },
    ifWitnessDenies: { type: String, default: "" },
    linkedToEvidence: { type: String, default: "" },

    // ---- Objection Handling ----
    possibleObjections: { type: [objectionSchema], default: [] },

    // ---- Review System (multi-state, replaces simple isApproved) ----
    /**
     * reviewStatus:
     *   pending         -not yet reviewed by senior
     *   approved        -ready for court as-is
     *   needsRevision   -junior must revise before it can be used
     *   risky           -legal risk flagged; use with extreme caution
     *   withdrawn       -removed from the cross-exam (kept for audit trail)
     */
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

    // ---- Legacy compatibility (kept to avoid migration issues) ----
    isApproved: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },

    // ---- Notes (restructured for clarity) ----
    strategyNote: { type: String, default: "" },
    evidenceNote: { type: String, default: "" },
    caseLawNote: { type: String, default: "" },
    internalNote: { type: String, default: "" },

    // ---- Inline Comments Thread ----
    comments: { type: [inlineCommentSchema], default: [] },

    // ---- Scoring ----
    scoring: { type: scoringSchema, default: () => ({}) },

    // ----courtroom live---
    courtroomUsage: { type: courtroomUsageSchema, default: () => ({}) },
  },
  { timestamps: true },
);

// ---- Witness Section ----
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

    // ---- Witness Background (for preparation) ----
    witnessBackground: { type: String, default: "" },
    knownBiases: { type: String, default: "" },
    priorStatements: [{ label: String, text: String }],

    // ---- Strategic Goal for this Witness ----
    primaryObjective: { type: String, default: "" },
    successCriteria: { type: String, default: "" },

    // ---- Sequence / Phase Order ----
    displayOrder: { type: Number, default: 0 },

    // ---- QA Pairs ----
    qaPairs: { type: [qaPairSchema], default: [] },
  },
  { timestamps: true },
);

// ---- Auto-compute overallScore before save ----
witnessSectionSchema.pre("save", function (next) {
  this.qaPairs.forEach((pair) => {
    const { clarity, legalStrength, strategicValue } = pair.scoring;
    if (clarity !== null && legalStrength !== null && strategicValue !== null) {
      pair.scoring.overallScore = parseFloat(
        ((clarity + legalStrength + strategicValue) / 3).toFixed(1),
      );
    }
    // Sync legacy fields
    pair.isApproved = pair.reviewStatus === "approved";
    pair.isFlagged = pair.reviewStatus === "risky";
  });
  next();
});

export default mongoose.models.WitnessSection ||
  mongoose.model("WitnessSection", witnessSectionSchema);

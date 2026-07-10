import mongoose from "mongoose";

const JudgmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    court: { type: String, required: true, trim: true, index: true },
    courtFull: { type: String, required: true },
    courtAbbr: { type: String, required: true },
    rawCourtName: { type: String, default: null, trim: true },
    province: { type: String, default: null },
    citation: { type: String, default: null, trim: true },
    judge: { type: String, default: null, trim: true },
    matter: { type: String, default: null, trim: true },
    orderDate: { type: Date, default: null, index: true },
    sourceUrl: {
      type: String,
      trim: true,
      index: true,
    },
    approved: { type: Boolean, default: false },
    fetchedAt: { type: Date, default: Date.now, index: true },

    caseNumber: { type: String, default: null, trim: true },
    summary: { type: String, default: null, trim: true },
    keywords: { type: [String], default: [] },
    bench: { type: String, default: null, trim: true },
    qualityScore: { type: Number, default: null },
    status: { type: String, default: null, trim: true },
    source: {
      type: String,
      enum: ["apify", "sheet", "manual"],
      default: "apify",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "judgments",
  },
);

JudgmentSchema.index({ court: 1, orderDate: -1 });
JudgmentSchema.index({ fetchedAt: -1 });
JudgmentSchema.index({
  title: "text",
  citation: "text",
  matter: "text",
  caseNumber: "text",
  keywords: "text",
});

export default mongoose.models.Judgment ||
  mongoose.model("Judgment", JudgmentSchema);

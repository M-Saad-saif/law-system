import mongoose from "mongoose";

const JudgmentAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    court: {
      type: String,
      enum: [
        "Supreme Court",
        "Lahore High Court",
        "Sindh High Court",
        "Peshawar High Court",
        "Islamabad High Court",
        "Balochistan High Court",
        "Session Court",
        "Other",
      ],
      required: true,
    },
    ppcSections: [{ type: String }],
    caseType: {
      type: String,
      enum: [
        "Bail",
        "Criminal",
        "Civil",
        "Family",
        "Tax",
        "Constitutional",
        "Other",
      ],
      default: "Criminal",
    },
    outcome: {
      type: String,
      enum: [
        "Bail Granted",
        "Bail Refused",
        "Appeal Allowed",
        "Appeal Dismissed",
        "Acquitted",
        "Convicted",
        "Remanded",
        "Other",
      ],
    },
    judgeName: { type: String },
    decisionDate: { type: Date, required: true },
    summary: { type: String, required: true },
    headnote: { type: String },
    importance: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    tags: [{ type: String }],
    sourceUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

JudgmentAlertSchema.index({ ppcSections: 1 });
JudgmentAlertSchema.index({ decisionDate: -1 });
JudgmentAlertSchema.index({ importance: 1 });

export default mongoose.models.JudgmentAlert ||
  mongoose.model("JudgmentAlert", JudgmentAlertSchema);

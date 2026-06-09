import mongoose from "mongoose";

const JudgmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    court: {
      type: String,
      required: true,
      enum: ["SCP", "LHC", "IHC", "PHC", "BHC", "SHC"],
      index: true,
    },
    courtFull: { type: String, required: true },
    courtAbbr: { type: String, required: true },
    province: { type: String, default: null },
    citation: { type: String, default: null, trim: true },
    judge: { type: String, default: null, trim: true },
    matter: { type: String, default: null, trim: true },
    orderDate: { type: Date, default: null, index: true },
    sourceUrl: {
      type: String,
      default: null,
      trim: true,
      index: { unique: true, sparse: true },
    },
    approved: { type: Boolean, default: false },
    fetchedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: "judgments",
  },
);

JudgmentSchema.index({ court: 1, orderDate: -1 });
JudgmentSchema.index({ fetchedAt: -1 });
JudgmentSchema.index({ title: "text", citation: "text", matter: "text" });

export default mongoose.models.Judgment ||
  mongoose.model("Judgment", JudgmentSchema);

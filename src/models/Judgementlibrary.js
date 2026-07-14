import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const judgementLibrarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Core judgement i dentity
    citation: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    courtName: { type: String, trim: true },
    judgementDate: { type: Date },

    // The 7-section structured content (populated by AI extractor or manually)
    offenceName: { type: String, trim: true },
    lawsDiscussed: { type: String, trim: true },
    crossExaminationQuestions: { type: String, trim: true },
    courtExaminationOfEvidence: { type: String, trim: true },
    finalDecision: { type: String, trim: true },
    voiceSummary: { type: String, trim: true },

    // Raw text (for re-extraction later)
    rawText: { type: String },

    // Organisation
    tags: [{ type: String, trim: true }],
    isFavourite: { type: Boolean, default: false },
    isMostImportant: { type: Boolean, default: false },
    pdfUrl: { type: String, trim: true },
    // Private notes
    notes: { type: [noteSchema], default: [] },

    // Source references
    sourceJudgementImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JudgementImage",
    },
    sourceCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    // Reference back to the judgment (from the Court Judgments feed) this
    // entry was saved from. Used to de-duplicate saves and to show a
    // "Saved" state on the Judgements page.
    sourceUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

judgementLibrarySchema.index({ userId: 1, isMostImportant: -1, createdAt: -1 });
judgementLibrarySchema.index({ userId: 1, isFavourite: 1 });
judgementLibrarySchema.index({ citation: 1 });
// Prevent the same judgment being saved twice for the same user, while
// allowing many entries with no sourceUrl (manually created entries).
judgementLibrarySchema.index(
  { userId: 1, sourceUrl: 1 },
  { unique: true, sparse: true },
);
judgementLibrarySchema.index(
  { title: "text", citation: "text", offenceName: "text", tags: "text" },
  { name: "library_text_search" },
);

export default mongoose.models.JudgementLibrary ||
  mongoose.model("JudgementLibrary", judgementLibrarySchema);

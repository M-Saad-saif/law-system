import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
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

    applicationType: {
      type: String,
      required: true,
      enum: [
        "post_arrest_bail",
        "pre_arrest_bail",
        "adjournment",
        "exemption",
        "placement_of_documents",
        "substitute_witness",
        "miscellaneous",
      ],
    },

    // Auto-filled from case or manually entered
    caseTitle: { type: String, trim: true },
    caseNumber: { type: String, trim: true },
    firNo: { type: String, trim: true },
    courtName: { type: String, trim: true },
    courtType: { type: String, trim: true },
    applicantName: { type: String, trim: true },
    respondentName: { type: String, trim: true },
    ppcSections: [{ type: String, trim: true }],
    judgeName: { type: String, trim: true },
    hearingDate: { type: Date },

    // Application-specific fields
    grounds: [{ type: String, trim: true }],
    prayer: { type: String, trim: true },
    additionalNotes: { type: String, trim: true },

    // Generated output
    generatedText: { type: String },

    status: {
      type: String,
      enum: ["draft", "generated", "filed"],
      default: "draft",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ caseId: 1 });

export default mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

import mongoose from "mongoose";

const JudgementImageSchema = new mongoose.Schema({
  // Reference to original case (optional)
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
  },

  // User who generated this image
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Image data
  imageUrl: {
    type: String, // Path to stored image
    required: true,
  },

  imagePublicId: String, // For cloud storage

  // Input data used to generate
  inputData: {
    judgementTitle: String,
    courtName: String,
    caseNumber: String,
    judgementDate: Date,
    judgeName: String,
    keyFindings: String,
    finalDecision: String,
    relevantSections: [String],
    petitioner: String,
    respondent: String,
  },

  // Metadata
  templateVersion: {
    type: String,
    default: "v1",
  },

  downloadCount: {
    type: Number,
    default: 0,
  },

  shareCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.JudgementImage ||
  mongoose.model("JudgementImage", JudgementImageSchema);

import mongoose from "mongoose";

const JudgementImageSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },

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

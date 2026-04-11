import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parentComment: { type: mongoose.Schema.Types.ObjectId, default: null },

    resolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const qaPairSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },

    originalQuestion: { type: String, default: "" },
    originalAnswer: { type: String, default: "" },

    editedQuestion: { type: String, default: "" },
    editedAnswer: { type: String, default: "" },

    useEditedVersion: { type: Boolean, default: false },

    isApproved: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    strategyNote: { type: String, default: "" },
    evidenceNote: { type: String, default: "" },
    caseLawNote: { type: String, default: "" },

    comments: { type: [commentSchema], default: [] },
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
      enum: ["prosecution", "defense", "expert", "character"],
      default: "prosecution",
    },

    role: { type: String, default: "" },

    qaPairs: { type: [qaPairSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.WitnessSection ||
  mongoose.model("WitnessSection", witnessSectionSchema);

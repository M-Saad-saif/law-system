import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Comment sub-schema — supports threaded replies via parentComment
// ---------------------------------------------------------------------------
const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // null = top-level comment; ObjectId = reply to another comment
    parentComment: { type: mongoose.Schema.Types.ObjectId, default: null },

    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// QA-pair sub-schema — one question/answer exchange per witness
// ---------------------------------------------------------------------------
const qaPairSchema = new mongoose.Schema(
  {
    // Display order within the witness section (1-based)
    sequence: { type: Number, required: true },

    // Original text written by the junior lawyer
    originalQuestion: { type: String, default: '' },
    originalAnswer: { type: String, default: '' },

    // Senior's inline edits
    editedQuestion: { type: String, default: '' },
    editedAnswer: { type: String, default: '' },

    // If true the edited version is used in the final PDF
    useEditedVersion: { type: Boolean, default: false },

    // Review flags
    isApproved: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },

    // Notes attached to this QA pair
    strategyNote: { type: String, default: '' },
    evidenceNote: { type: String, default: '' },
    caseLawNote: { type: String, default: '' },

    // Threaded comments on this specific pair
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// WitnessSection schema
// ---------------------------------------------------------------------------
const witnessSectionSchema = new mongoose.Schema(
  {
    // Parent cross-examination document
    crossExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrossExamination',
      required: true,
    },

    witnessName: { type: String, required: true, trim: true },

    witnessType: {
      type: String,
      enum: ['prosecution', 'defense', 'expert', 'character'],
      default: 'prosecution',
    },

    // Free-text description of the witness's role in the case
    role: { type: String, default: '' },

    qaPairs: { type: [qaPairSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.WitnessSection ||
  mongoose.model('WitnessSection', witnessSectionSchema);

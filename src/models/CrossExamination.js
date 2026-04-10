import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Sub-schema: a version snapshot stored inside the parent document
// Each snapshot is a full deep clone of all WitnessSection documents at that
// point in time, so we can diff any two versions without extra DB queries.
// ---------------------------------------------------------------------------
const versionSnapshotSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    // Full serialised array of WitnessSection plain objects (toObject())
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '' },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

// ---------------------------------------------------------------------------
// Main schema
// ---------------------------------------------------------------------------
const crossExaminationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // Optional link to an existing Case document
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', default: null },

    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'in_review',
        'changes_requested',
        'approved',
        'archived',
      ],
      default: 'draft',
    },

    // Auto-incremented each time a new version snapshot is pushed
    version: { type: Number, default: 1 },

    // Chronological list of version snapshots
    versionHistory: { type: [versionSnapshotSchema], default: [] },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Senior lawyer assigned for review
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // References to WitnessSection documents (ordered array)
    witnessSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WitnessSection' }],

    // Optional hearing date — used for priority / deadline display
    hearingDate: { type: Date, default: null },

    // When true, no further edits are allowed (set on approval)
    isLocked: { type: Boolean, default: false },

    // High-level comments on the whole document (not per QA-pair)
    generalComments: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Prevent model re-registration during Next.js hot-reload
// ---------------------------------------------------------------------------
export default mongoose.models.CrossExamination ||
  mongoose.model('CrossExamination', crossExaminationSchema);

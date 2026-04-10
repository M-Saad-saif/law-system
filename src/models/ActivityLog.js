import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Every state-changing operation records an ActivityLog entry.
// The before/after fields store plain-object snapshots of whatever changed
// (e.g. a single QA pair, or the whole exam status field).
// ---------------------------------------------------------------------------
const activityLogSchema = new mongoose.Schema(
  {
    crossExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrossExamination',
      required: true,
    },

    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'submitted',
        'assigned',
        'review_started',
        'qa_edited',
        'comment_added',
        'comment_resolved',
        'flagged',
        'unflagged',
        'qa_approved',
        'changes_requested',
        'resubmitted',
        'approved',
        'archived',
        'witness_added',
        'witness_deleted',
        'qa_added',
        'qa_deleted',
      ],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Serialised snapshot before the change (optional — omit for creates)
    before: { type: mongoose.Schema.Types.Mixed, default: null },

    // Serialised snapshot after the change
    after: { type: mongoose.Schema.Types.Mixed, default: null },

    // Human-readable description shown in the activity feed
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for fast per-exam feed queries (newest first)
activityLogSchema.index({ crossExamId: 1, createdAt: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model('ActivityLog', activityLogSchema);

// ---------------------------------------------------------------------------
// lib/crossExamWorkflow.js
//
// Central state-machine rules and helpers shared by all workflow API routes.
// Keeping transition logic here prevents duplication and makes it easy to
// audit every allowed status change in one place.
// ---------------------------------------------------------------------------

import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import ActivityLog from "@/models/ActivityLog";

// ---------------------------------------------------------------------------
// Valid transitions: { fromStatus: allowedAction }
// Each entry describes what prior status is required before an action.
// ---------------------------------------------------------------------------
export const TRANSITIONS = {
  submit: "draft",
  "start-review": "submitted",
  "request-changes": "in_review",
  approve: "in_review",
  resubmit: "changes_requested",
  archive: "approved",
};

// Map workflow actions to the resulting status
export const ACTION_TO_STATUS = {
  submit: "submitted",
  "start-review": "in_review",
  "request-changes": "changes_requested",
  approve: "approved",
  resubmit: "submitted",
  archive: "archived",
};

// ---------------------------------------------------------------------------
// assertTransition
// Throws a structured error object if the transition is not allowed.
// Call this at the top of every workflow route handler.
// ---------------------------------------------------------------------------
export function assertTransition(exam, action) {
  const required = TRANSITIONS[action];
  if (!required) {
    return {
      ok: false,
      message: `Unknown workflow action: ${action}`,
      status: 400,
    };
  }
  if (exam.status !== required) {
    return {
      ok: false,
      message: `Action "${action}" requires status "${required}", but current status is "${exam.status}".`,
      status: 409,
    };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// createVersionSnapshot
// Saves the current state of all WitnessSections as a version snapshot
// inside the CrossExamination document before a status transition.
// ---------------------------------------------------------------------------
export async function createVersionSnapshot(exam, userId, message = "") {
  const witnesses = await WitnessSection.find({ crossExamId: exam._id }).lean();

  exam.versionHistory.push({
    version: exam.version,
    snapshot: witnesses,
    createdBy: userId,
    message,
  });

  // Bump the version counter for the NEXT snapshot
  exam.version += 1;
}

// ---------------------------------------------------------------------------
// logActivity
// Creates an ActivityLog entry. Accepts a plain-object payload.
// ---------------------------------------------------------------------------
export async function logActivity({
  crossExamId,
  action,
  performedBy,
  before,
  after,
  message,
}) {
  await ActivityLog.create({
    crossExamId,
    action,
    performedBy,
    before: before ?? null,
    after: after ?? null,
    message: message ?? "",
  });
}

// ---------------------------------------------------------------------------
// applyTransition
// Full transition helper: validates → snapshots (if needed) → updates status
// → logs activity. Returns the saved exam document.
// ---------------------------------------------------------------------------
export async function applyTransition({
  exam,
  action,
  userId,
  message,
  skipSnapshot,
}) {
  const check = assertTransition(exam, action);
  if (!check.ok) return check;

  const previousStatus = exam.status;
  const newStatus = ACTION_TO_STATUS[action];

  // Snapshot before transitions that create a new review cycle
  if (!skipSnapshot && ["submit", "resubmit", "approve"].includes(action)) {
    await createVersionSnapshot(
      exam,
      userId,
      message || `Version snapshot on ${action}`,
    );
  }

  exam.status = newStatus;

  // Lock the document on approval so no further edits are possible
  if (action === "approve") {
    exam.isLocked = true;
  }

  await exam.save();

  await logActivity({
    crossExamId: exam._id,
    action:
      action === "start-review"
        ? "review_started"
        : action === "submit"
          ? "submitted"
          : action,
    performedBy: userId,
    before: { status: previousStatus },
    after: { status: newStatus },
    message:
      message || `Status changed from "${previousStatus}" to "${newStatus}"`,
  });

  return { ok: true, exam };
}

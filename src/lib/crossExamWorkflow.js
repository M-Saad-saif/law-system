import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import ActivityLog from "@/models/ActivityLog";

export const TRANSITIONS = {
  submit: "draft",
  "start-review": "submitted",
  "request-changes": "in_review",
  approve: "in_review",
  resubmit: "changes_requested",
  archive: "approved",
};

export const ACTION_TO_STATUS = {
  submit: "submitted",
  "start-review": "in_review",
  "request-changes": "changes_requested",
  approve: "approved",
  resubmit: "submitted",
  archive: "archived",
};

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

export async function createVersionSnapshot(exam, userId, message = "") {
  const witnesses = await WitnessSection.find({ crossExamId: exam._id }).lean();

  exam.versionHistory.push({
    version: exam.version,
    snapshot: witnesses,
    createdBy: userId,
    message,
  });

  exam.version += 1;
}

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

  if (!skipSnapshot && ["submit", "resubmit", "approve"].includes(action)) {
    await createVersionSnapshot(
      exam,
      userId,
      message || `Version snapshot on ${action}`,
    );
  }

  exam.status = newStatus;

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

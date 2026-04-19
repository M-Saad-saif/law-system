import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import ActivityLog from "@/models/ActivityLog";

//  State Machine

export const TRANSITIONS = {
  submit: "draft",
  "start-review": "submitted",
  "request-changes": "in_review",
  approve: "in_review",
  "activate-courtroom": "approved",
  "deactivate-courtroom": "courtroom_active",
  resubmit: "changes_requested",
  archive: "approved",
};

export const ACTION_TO_STATUS = {
  submit: "submitted",
  "start-review": "in_review",
  "request-changes": "changes_requested",
  approve: "approved",
  "activate-courtroom": "courtroom_active",
  "deactivate-courtroom": "approved",
  resubmit: "submitted",
  archive: "archived",
};

export function assertTransition(exam, action) {
  const required = TRANSITIONS[action];
  if (!required) {
    return { ok: false, message: `Unknown action: ${action}`, status: 400 };
  }
  if (exam.status !== required) {
    return {
      ok: false,
      message: `Action "${action}" requires status "${required}", current: "${exam.status}".`,
      status: 409,
    };
  }
  return { ok: true };
}

// ---- Validation Rules ----

export function validateQAPair(pair) {
  const errors = [];
  const warnings = [];

  const q = (pair.editedQuestion || pair.originalQuestion || "").trim();

  if (!q) {
    errors.push("Question text is required.");
  }

  if (pair.questionType === "open") {
    warnings.push(
      "Open questions give the witness narrative control. Ensure this is intentional.",
    );
  }

  if (pair.questionType === "leading" && q && !q.endsWith("?")) {
    warnings.push("Leading questions should end with a question mark.");
  }

  const conjunctions = [" and ", " or ", " but also ", " as well as "];
  const isCompound = conjunctions.some((c) => q.toLowerCase().includes(c));
  if (isCompound && pair.questionType !== "hypothetical") {
    warnings.push(
      "This may be a compound question. Consider splitting into two separate questions to avoid an objection.",
    );
  }

  if (
    pair.questionType === "impeachment" &&
    !pair.linkedToEvidence &&
    !pair.evidenceNote
  ) {
    warnings.push(
      "Impeachment questions should reference a prior statement, exhibit, or evidence note.",
    );
  }

  if (
    pair.questionType === "credibility" &&
    pair.possibleObjections?.length === 0
  ) {
    warnings.push(
      "Credibility attacks often draw objections. Add at least one possible objection and your response strategy.",
    );
  }

  if (!pair.objective) {
    warnings.push(
      "No objective set. Every question should have a clear purpose.",
    );
  }

  if (!pair.phase) {
    warnings.push(
      "No phase assigned. Assign a phase to enforce strategic flow.",
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}


export function validateWitnessSection(witness) {
  const warnings = [];
  const errors = [];
  const pairs = witness.qaPairs || [];

  if (pairs.length === 0) {
    errors.push(`Witness "${witness.witnessName}" has no questions.`);
    return { valid: false, errors, warnings };
  }

  const openCount = pairs.filter((p) => p.questionType === "open").length;
  const leadingCount = pairs.filter((p) => p.questionType === "leading").length;
  const impeachCount = pairs.filter(
    (p) => p.questionType === "impeachment",
  ).length;

  if (openCount > leadingCount) {
    warnings.push(
      `Witness "${witness.witnessName}": Open questions outnumber leading questions. In cross-examination, leading questions are preferred.`,
    );
  }

  if (impeachCount === 0 && pairs.length > 5) {
    warnings.push(
      `Witness "${witness.witnessName}": No impeachment questions found. Consider adding at least one question that challenges a prior statement.`,
    );
  }

  const PHASE_ORDER = [
    "intro",
    "factEstablish",
    "contradiction",
    "credibilityAttack",
    "admission",
    "closing",
  ];
  const phases = pairs.map((p) => p.phase).filter(Boolean);
  let lastPhaseIdx = -1;
  let phaseViolation = false;
  for (const ph of phases) {
    const idx = PHASE_ORDER.indexOf(ph);
    if (idx < lastPhaseIdx) {
      phaseViolation = true;
      break;
    }
    lastPhaseIdx = idx;
  }
  if (phaseViolation) {
    warnings.push(
      `Witness "${witness.witnessName}": Questions are not in logical phase order. Review the sequence: intro → factEstablish → contradiction → credibilityAttack → admission → closing.`,
    );
  }

  if (!witness.primaryObjective) {
    warnings.push(
      `Witness "${witness.witnessName}": No primary objective set. Define what you must achieve from this witness.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ---- Diff Engine ----

const TRACKED_FIELDS = [
  "editedQuestion",
  "originalQuestion",
  "reviewStatus",
  "phase",
  "questionType",
  "objective",
  "sequence",
];

/**
 * Compute meaningful diffs between two witness section snapshots.
 * Returns an array of DiffEntry objects.
 */
export function computeDiffs(previousWitnesses, currentWitnesses) {
  const diffs = [];

  const prevMap = new Map(previousWitnesses.map((w) => [String(w._id), w]));
  const currMap = new Map(currentWitnesses.map((w) => [String(w._id), w]));

  // Check for removed witnesses
  for (const [id, prev] of prevMap) {
    if (!currMap.has(id)) {
      diffs.push({
        witnessId: id,
        witnessName: prev.witnessName,
        field: "witness",
        changeType: "removed",
        before: prev.witnessName,
        after: null,
      });
    }
  }

  // Check for added or modified witnesses
  for (const [id, curr] of currMap) {
    const prev = prevMap.get(id);
    if (!prev) {
      diffs.push({
        witnessId: id,
        witnessName: curr.witnessName,
        field: "witness",
        changeType: "added",
        before: null,
        after: curr.witnessName,
      });
      continue;
    }

    const prevQaMap = new Map(
      (prev.qaPairs || []).map((q) => [String(q._id), q]),
    );
    const currQaMap = new Map(
      (curr.qaPairs || []).map((q) => [String(q._id), q]),
    );

    // Removed QA pairs
    for (const [qaId, prevQa] of prevQaMap) {
      if (!currQaMap.has(qaId)) {
        diffs.push({
          witnessId: id,
          witnessName: curr.witnessName,
          qaId,
          sequence: prevQa.sequence,
          field: "qaPair",
          changeType: "removed",
          before: prevQa.editedQuestion || prevQa.originalQuestion,
          after: null,
        });
      }
    }

    // Added or modified QA pairs
    for (const [qaId, currQa] of currQaMap) {
      const prevQa = prevQaMap.get(qaId);
      if (!prevQa) {
        diffs.push({
          witnessId: id,
          witnessName: curr.witnessName,
          qaId,
          sequence: currQa.sequence,
          field: "qaPair",
          changeType: "added",
          before: null,
          after: currQa.editedQuestion || currQa.originalQuestion,
        });
        continue;
      }

      for (const field of TRACKED_FIELDS) {
        if (String(prevQa[field] ?? "") !== String(currQa[field] ?? "")) {
          diffs.push({
            witnessId: id,
            witnessName: curr.witnessName,
            qaId,
            sequence: currQa.sequence,
            field,
            changeType:
              field === "reviewStatus"
                ? "statusChanged"
                : field === "sequence"
                  ? "reordered"
                  : "modified",
            before: prevQa[field],
            after: currQa[field],
          });
        }
      }
    }
  }

  return diffs;
}


export function buildInsightSummary(diffs) {
  const added = diffs.filter(
    (d) => d.changeType === "added" && d.field === "qaPair",
  ).length;
  const removed = diffs.filter(
    (d) => d.changeType === "removed" && d.field === "qaPair",
  ).length;
  const modified = diffs.filter((d) => d.changeType === "modified").length;
  const statusChanges = diffs.filter(
    (d) => d.changeType === "statusChanged",
  ).length;
  const phaseChanges = diffs.filter((d) => d.field === "phase").length;

  const parts = [];
  if (added) parts.push(`${added} question${added > 1 ? "s" : ""} added`);
  if (removed)
    parts.push(`${removed} question${removed > 1 ? "s" : ""} removed`);
  if (modified)
    parts.push(`${modified} question${modified > 1 ? "s" : ""} revised`);
  if (statusChanges)
    parts.push(
      `${statusChanges} review status change${statusChanges > 1 ? "s" : ""}`,
    );
  if (phaseChanges)
    parts.push(
      `${phaseChanges} phase reassignment${phaseChanges > 1 ? "s" : ""}`,
    );

  return parts.length
    ? parts.join(", ") + "."
    : "No meaningful changes detected.";
}

// ---- Version Snapshot ----

export async function createVersionSnapshot(
  exam,
  userId,
  message = "",
  triggerAction = "manual",
) {
  const currentWitnesses = await WitnessSection.find({
    crossExamId: exam._id,
  }).lean();

  let diffs = [];
  let insights = {
    questionsAdded: 0,
    questionsRemoved: 0,
    questionsModified: 0,
    statusChanges: 0,
    phaseChanges: 0,
    summary: "",
  };

  const versionHistory = exam.versionHistory || [];
  if (versionHistory.length > 0) {
    const lastSnapshot = versionHistory[versionHistory.length - 1];
    const previousWitnesses = lastSnapshot.snapshot || [];
    diffs = computeDiffs(previousWitnesses, currentWitnesses);

    insights.questionsAdded = diffs.filter(
      (d) => d.changeType === "added" && d.field === "qaPair",
    ).length;
    insights.questionsRemoved = diffs.filter(
      (d) => d.changeType === "removed" && d.field === "qaPair",
    ).length;
    insights.questionsModified = diffs.filter(
      (d) => d.changeType === "modified",
    ).length;
    insights.statusChanges = diffs.filter(
      (d) => d.changeType === "statusChanged",
    ).length;
    insights.phaseChanges = diffs.filter((d) => d.field === "phase").length;
    insights.summary = buildInsightSummary(diffs);
  }

  // Initialize versionHistory if it doesn't exist
  if (!exam.versionHistory) {
    exam.versionHistory = [];
  }
  if (!exam.version) {
    exam.version = 1;
  }

  exam.versionHistory.push({
    version: exam.version,
    snapshot: currentWitnesses,
    diffs,
    insights,
    createdBy: userId,
    message,
    triggerAction,
  });

  exam.version += 1;
}

// ---- Activity Logging ----

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

// ---- Full Transition ----

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
      action,
    );
  }

  exam.status = newStatus;

  if (action === "approve") {
    exam.isLocked = true;
    exam.reviewCompletedAt = new Date();
  }

  if (action === "activate-courtroom") {
    exam.courtroomModeActive = true;
  }

  if (action === "deactivate-courtroom") {
    exam.courtroomModeActive = false;
    await createVersionSnapshot(
      exam,
      userId,
      "Post-courtroom session snapshot",
      "courtroom_session",
    );
  }

  await exam.save();

  await logActivity({
    crossExamId: exam._id,
    action:
      action === "start-review"
        ? "review_started"
        : action === "submit"
          ? "submitted"
          : action === "activate-courtroom"
            ? "courtroom_activated"
            : action,
    performedBy: userId,
    before: { status: previousStatus },
    after: { status: newStatus },
    message:
      message || `Status changed from "${previousStatus}" to "${newStatus}"`,
  });

  return { ok: true, exam };
}

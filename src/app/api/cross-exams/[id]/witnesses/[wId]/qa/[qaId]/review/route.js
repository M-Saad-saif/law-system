import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity } from "@/lib/crossExamWorkflow";

export const PATCH = withAuth(async (req, { params }, user) => {
  await connectDB();

  const isSenior = user.seniority === "senior" || user.role === "admin";
  if (!isSenior) {
    return NextResponse.json(
      { error: "Only senior lawyers may review questions." },
      { status: 403 },
    );
  }

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const witness = await WitnessSection.findOne({
    _id: params.wId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const pair = witness.qaPairs.id(params.qaId);
  if (!pair)
    return NextResponse.json({ error: "QA pair not found." }, { status: 404 });

  const body = await req.json();
  const {
    reviewStatus,
    seniorNote,
    scoring,
    phase,
    questionType,
    possibleObjections,
  } = body;

  const VALID_STATUSES = [
    "approved",
    "needsRevision",
    "risky",
    "withdrawn",
    "pending",
  ];
  if (reviewStatus && !VALID_STATUSES.includes(reviewStatus)) {
    return NextResponse.json(
      { error: "Invalid reviewStatus." },
      { status: 400 },
    );
  }

  const previousStatus = pair.reviewStatus;

  if (reviewStatus) pair.reviewStatus = reviewStatus;
  if (seniorNote !== undefined) pair.seniorNote = seniorNote;
  if (phase) pair.phase = phase;
  if (questionType) pair.questionType = questionType;
  if (possibleObjections) pair.possibleObjections = possibleObjections;

  if (scoring) {
    if (scoring.clarity !== undefined) pair.scoring.clarity = scoring.clarity;
    if (scoring.legalStrength !== undefined)
      pair.scoring.legalStrength = scoring.legalStrength;
    if (scoring.strategicValue !== undefined)
      pair.scoring.strategicValue = scoring.strategicValue;
    pair.scoring.scoredBy = user.id;
    pair.scoring.scoredAt = new Date();
    pair.scoring.reviewerNote =
      scoring.reviewerNote ?? pair.scoring.reviewerNote;
  }

  pair.reviewedBy = user.id;
  pair.reviewedAt = new Date();

  await witness.save();

  await logActivity({
    crossExamId: exam._id,
    action: "qa_reviewed",
    performedBy: user.id,
    before: { reviewStatus: previousStatus },
    after: { reviewStatus: pair.reviewStatus, scoring: pair.scoring },
    message: `Q${pair.sequence} reviewed: ${previousStatus} → ${pair.reviewStatus}`,
  });

  return NextResponse.json({ qaPair: pair });
});

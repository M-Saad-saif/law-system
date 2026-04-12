import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import WitnessSection from "@/models/WitnessSection";
import CrossExamination from "@/models/CrossExamination";

export const PATCH = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam || !exam.courtroomModeActive) {
    return NextResponse.json(
      { error: "Courtroom mode is not active." },
      { status: 400 },
    );
  }

  const body = await req.json();
  const {
    witnessId,
    qaId,
    action,
    note,
    witnessActualAnswer,
    judgeReaction,
    objectionsRaisedInCourt,
  } = body;

  const witness = await WitnessSection.findOne({
    _id: witnessId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const pair = witness.qaPairs.id(qaId);
  if (!pair)
    return NextResponse.json({ error: "QA pair not found." }, { status: 404 });

  if (action === "ask") {
    pair.courtroomUsage.isAsked = true;
    pair.courtroomUsage.askedAt = new Date();
  } else if (action === "answer") {
    pair.courtroomUsage.isAnswered = true;
    if (witnessActualAnswer)
      pair.courtroomUsage.witnessActualAnswer = witnessActualAnswer;
  } else if (action === "skip") {
    pair.courtroomUsage.isSkipped = true;
    pair.courtroomUsage.skipReason = note ?? "";
  }

  if (note !== undefined) pair.courtroomUsage.notesDuringHearing = note;
  if (judgeReaction) pair.courtroomUsage.judgeReaction = judgeReaction;
  if (objectionsRaisedInCourt)
    pair.courtroomUsage.objectionsRaisedInCourt = objectionsRaisedInCourt;

  exam.activeQaIndex = body.nextQaIndex ?? exam.activeQaIndex;
  await exam.save();
  await witness.save();

  return NextResponse.json({ success: true, pair });
});

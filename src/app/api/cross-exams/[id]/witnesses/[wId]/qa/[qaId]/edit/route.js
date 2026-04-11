import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity } from "@/lib/crossExamWorkflow";

export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam)
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  if (exam.isLocked)
    return NextResponse.json({ error: "Document is locked." }, { status: 403 });

  const witness = await WitnessSection.findOne({
    _id: params.wId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair)
    return NextResponse.json({ error: "QA pair not found." }, { status: 404 });

  const isCreator = exam.createdBy.toString() === user.id.toString();
  const isAssignedReviewer =
    exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  const isSenior = user.seniority === "senior";
  const isReviewer = isAssignedReviewer || isSenior || isAdmin;
  if (!isCreator && !isReviewer) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const body = await req.json();
  const before = qaPair.toObject();

  // Senior reviewer edits
  if (isReviewer) {
    if (body.editedQuestion !== undefined)
      qaPair.editedQuestion = body.editedQuestion;
    if (body.editedAnswer !== undefined)
      qaPair.editedAnswer = body.editedAnswer;
    if (body.useEditedVersion !== undefined)
      qaPair.useEditedVersion = body.useEditedVersion;
  }

  // Junior can update original text only while in draft or changes_requested
  if (isCreator && ["draft", "changes_requested"].includes(exam.status)) {
    if (body.originalQuestion !== undefined)
      qaPair.originalQuestion = body.originalQuestion;
    if (body.originalAnswer !== undefined)
      qaPair.originalAnswer = body.originalAnswer;
  }

  // Notes are editable by both roles at any non-locked stage
  if (body.strategyNote !== undefined) qaPair.strategyNote = body.strategyNote;
  if (body.evidenceNote !== undefined) qaPair.evidenceNote = body.evidenceNote;
  if (body.caseLawNote !== undefined) qaPair.caseLawNote = body.caseLawNote;

  await witness.save();

  await logActivity({
    crossExamId: exam._id,
    action: "qa_edited",
    performedBy: user.id,
    before,
    after: qaPair.toObject(),
    message: `QA pair #${qaPair.sequence} edited by ${isReviewer ? "reviewer" : "creator"}.`,
  });

  return NextResponse.json({ qaPair });
});

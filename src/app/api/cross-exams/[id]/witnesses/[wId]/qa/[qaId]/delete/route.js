import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity } from "@/lib/crossExamWorkflow";

export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam)
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  // Only senior reviewers or admins can delete approved QA pairs
  const isSenior = user.seniority === "senior" || user.role === "admin";
  const isAssignedReviewer =
    exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  if (!isAssignedReviewer && !isSenior) {
    return NextResponse.json(
      { error: "Only a senior reviewer can delete approved QA pairs." },
      { status: 403 },
    );
  }

  const witness = await WitnessSection.findOne({
    _id: params.wId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair)
    return NextResponse.json({ error: "QA pair not found." }, { status: 404 });

  if (exam.isLocked && !qaPair.isApproved)
    return NextResponse.json({ error: "Document is locked." }, { status: 403 });

  if (!qaPair.isApproved)
    return NextResponse.json(
      { error: "Only approved QA pairs can be deleted." },
      { status: 400 },
    );

  const before = qaPair.toObject();

  witness.qaPairs.pull({ _id: params.qaId });
  await witness.save();

  await logActivity({
    crossExamId: exam._id,
    action: "qa_deleted",
    performedBy: user.id,
    before,
    after: null,
    message: `Approved QA pair #${before.sequence} deleted by reviewer.`,
  });

  return NextResponse.json({ success: true, deletedQaId: params.qaId });
});

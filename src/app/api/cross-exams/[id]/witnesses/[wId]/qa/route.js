import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity, validateQAPair } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (exam.isLocked)
    return NextResponse.json({ error: "Document is locked." }, { status: 403 });

  const witness = await WitnessSection.findOne({
    _id: params.wId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const creatorId = exam.userId?.toString();
  const isCreator = creatorId === user.id.toString();
  const isReviewer =
    exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  if (!isCreator && !isReviewer && user.role !== "admin") {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const body = await req.json();

  // Validate before inserting
  const validation = validateQAPair(body);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.errors.join(" "), warnings: validation.warnings },
      { status: 400 },
    );
  }

  const maxSeq = witness.qaPairs.reduce((m, p) => Math.max(m, p.sequence), 0);

  witness.qaPairs.push({
    sequence: body.sequence ?? maxSeq + 1,
    originalQuestion: body.originalQuestion ?? "",
    originalAnswer: body.originalAnswer ?? "",
    editedQuestion: body.editedQuestion ?? "",
    editedAnswer: body.editedAnswer ?? "",
    useEditedVersion: body.useEditedVersion ?? false,

    // Enhanced fields
    questionType: body.questionType ?? "leading",
    phase: body.phase ?? "factEstablish",
    objective: body.objective ?? "",
    expectedAnswer: body.expectedAnswer ?? "",
    ifWitnessDenies: body.ifWitnessDenies ?? "",
    linkedToEvidence: body.linkedToEvidence ?? "",
    possibleObjections: body.possibleObjections ?? [],
    reviewStatus: "pending",

    strategyNote: body.strategyNote ?? "",
    evidenceNote: body.evidenceNote ?? "",
    caseLawNote: body.caseLawNote ?? "",
    internalNote: body.internalNote ?? "",
    comments: [],
    scoring: {},
    courtroomUsage: {},
  });

  await witness.save();
  const newPair = witness.qaPairs[witness.qaPairs.length - 1];

  await logActivity({
    crossExamId: exam._id,
    action: "qa_added",
    performedBy: user.id,
    after: {
      witnessId: witness._id,
      qaId: newPair._id,
      sequence: newPair.sequence,
    },
    message: `Q${newPair.sequence} added for witness "${witness.witnessName}" [${newPair.phase} / ${newPair.questionType}].`,
  });

  return NextResponse.json(
    { qaPair: newPair, warnings: validation.warnings },
    { status: 201 },
  );
});

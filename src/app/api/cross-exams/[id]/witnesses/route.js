import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity } from "@/lib/crossExamWorkflow";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id).lean();
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const witnesses = await WitnessSection.find({ crossExamId: params.id })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({ witnesses });
});

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (exam.isLocked) {
    return NextResponse.json({ error: "Document is locked." }, { status: 403 });
  }

  // Both junior  and senior  can add witnesses while in_review
  const isCreator = exam.createdBy.toString() === user.id.toString();
  const isReviewer =
    exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isCreator && !isReviewer && !isAdmin) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const {
    witnessName,
    witnessType = "prosecution",
    role = "",
  } = await req.json();
  if (!witnessName?.trim()) {
    return NextResponse.json(
      { error: "witnessName is required." },
      { status: 400 },
    );
  }

  const witness = await WitnessSection.create({
    crossExamId: exam._id,
    witnessName: witnessName.trim(),
    witnessType,
    role,
    qaPairs: [],
  });

  exam.witnessSections.push(witness._id);
  await exam.save();

  await logActivity({
    crossExamId: exam._id,
    action: "witness_added",
    performedBy: user.id,
    after: { witnessName: witness.witnessName },
    message: `Witness "${witness.witnessName}" added.`,
  });

  return NextResponse.json({ witness }, { status: 201 });
});

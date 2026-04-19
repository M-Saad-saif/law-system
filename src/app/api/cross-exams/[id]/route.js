import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import ActivityLog from "@/models/ActivityLog";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id)
    .populate("userId", "name email role")
    .populate("assignedTo", "name email role")
    .populate("caseId", "caseTitle caseNumber")
    .lean();

  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  // Access check - handle null userId (for older documents)
  const ownerId = exam.userId?._id?.toString() || exam.userId?.toString();
  const isOwner = ownerId === user.id.toString();
  const isAssigned = exam.assignedTo && exam.assignedTo._id.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  const isSenior = user.seniority === "senior";

  if (!isOwner && !isAssigned && !isAdmin && !isSenior) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // Fetch witnesses separately so we can include full QA pairs + comments
  const witnesses = await WitnessSection.find({ crossExamId: params.id })
    .sort({ createdAt: 1 })
    .lean();

  // Fetch recent activity (last 30 entries)
  const activity = await ActivityLog.find({ crossExamId: params.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("performedBy", "name email")
    .lean();

  return NextResponse.json({ exam: { ...exam, witnesses }, activity });
});

export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  if (exam.isLocked) {
    return NextResponse.json(
      { error: "This cross-examination is locked and cannot be edited." },
      { status: 403 },
    );
  }

  // Only the creator can edit basic fields
  const creatorId = exam.userId?.toString();
  if (!creatorId || creatorId !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the creator can edit this document." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const before = { title: exam.title, hearingDate: exam.hearingDate };

  if (body.title !== undefined) exam.title = body.title.trim();
  if (body.hearingDate !== undefined)
    exam.hearingDate = body.hearingDate || null;

  await exam.save();

  await ActivityLog.create({
    crossExamId: exam._id,
    action: "updated",
    performedBy: user.id,
    before,
    after: { title: exam.title, hearingDate: exam.hearingDate },
    message: "Cross-examination details updated.",
  });

  return NextResponse.json({ exam });
});

export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  const creatorId = exam.userId?.toString();
  if (!creatorId || creatorId !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the creator can delete this document." },
      { status: 403 },
    );
  }

  if (exam.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft cross-examinations can be deleted." },
      { status: 400 },
    );
  }

  // Clean up related data
  await WitnessSection.deleteMany({ crossExamId: exam._id });
  await ActivityLog.deleteMany({ crossExamId: exam._id });
  await CrossExamination.findByIdAndDelete(exam._id);

  return NextResponse.json({
    success: true,
    message: "Cross-examination deleted.",
  });
});

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id)
    .select("versionHistory version title createdBy assignedTo")
    .populate("versionHistory.createdBy", "name email")
    .lean();

  if (!exam)
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );

  const isOwner = exam.createdBy.toString() === user.id.toString();
  const isAssigned =
    exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAssigned && !isAdmin) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  // Return newest version first
  const versions = [...(exam.versionHistory || [])].reverse();

  return NextResponse.json({ versions, currentVersion: exam.version });
});

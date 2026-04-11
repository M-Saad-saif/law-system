import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import { applyTransition } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  // Only the assigned reviewer (or any senior if unassigned) can request changes
  const isSenior = user.seniority === "senior" || user.role === "admin";
  if (exam.assignedTo && exam.assignedTo.toString() !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the assigned reviewer can request changes." },
      { status: 403 },
    );
  }
  if (!exam.assignedTo && !isSenior) {
    return NextResponse.json(
      { error: "Only a senior lawyer can request changes." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const notes = body.notes || "";

  const result = await applyTransition({
    exam,
    action: "request-changes",
    userId: user.id,
    message: notes || "Changes requested by reviewer.",
    skipSnapshot: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, exam: result.exam, notes });
});

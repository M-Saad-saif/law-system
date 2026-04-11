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

  const isSenior = user.seniority === "senior" || user.role === "admin";
  if (exam.assignedTo && exam.assignedTo.toString() !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the assigned reviewer can start the review." },
      { status: 403 },
    );
  }
  if (!exam.assignedTo && !isSenior) {
    return NextResponse.json(
      { error: "Only a senior lawyer can start the review." },
      { status: 403 },
    );
  }

  // Auto-assign if no reviewer was set
  if (!exam.assignedTo) {
    exam.assignedTo = user.id;
  }

  const result = await applyTransition({
    exam,
    action: "start-review",
    userId: user.id,
    message: "Review started.",
    skipSnapshot: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, exam: result.exam });
});

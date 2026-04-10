// app/api/cross-exams/[id]/resubmit/route.js
// POST /api/cross-exams/:id/resubmit
// Transitions: changes_requested → submitted
// Creates a new version snapshot.

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

  if (exam.createdBy.toString() !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the creator can resubmit." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));

  const result = await applyTransition({
    exam,
    action: "resubmit",
    userId: user.id,
    message: body.message || `Resubmitted (v${exam.version}).`,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, exam: result.exam });
});

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import { applyTransition, logActivity } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();
  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json();
  const { courtRoom, judge, sessionNotes } = body;

  const result = await applyTransition({
    exam,
    action: "activate-courtroom",
    userId: user.id,
    message: "Courtroom mode activated.",
  });
  if (!result.ok)
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );

  exam.hearingSessions.push({
    sessionDate: new Date(),
    courtRoom: courtRoom ?? "",
    judge: judge ?? "",
    conductedBy: user.id,
    startedAt: new Date(),
    sessionNotes: sessionNotes ?? "",
  });
  await exam.save();

  return NextResponse.json({ success: true, exam });
});

export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();
  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json();
  const { outcome, postSessionReview } = body;

  const activeSession = exam.hearingSessions[exam.hearingSessions.length - 1];
  if (activeSession && !activeSession.endedAt) {
    activeSession.endedAt = new Date();
    activeSession.outcome = outcome ?? "";
    activeSession.postSessionReview = postSessionReview ?? "";
  }

  const result = await applyTransition({
    exam,
    action: "deactivate-courtroom",
    userId: user.id,
    skipSnapshot: false,
  });
  if (!result.ok)
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );

  return NextResponse.json({ success: true, exam });
});

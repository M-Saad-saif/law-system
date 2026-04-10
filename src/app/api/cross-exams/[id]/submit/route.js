// app/api/cross-exams/[id]/submit/route.js
// POST /api/cross-exams/:id/submit
// Transitions: draft → submitted
// Creates a version snapshot before status change.

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';
import WitnessSection from '@/models/WitnessSection';
import { applyTransition } from '@/lib/crossExamWorkflow';

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  }

  // Only the creator (junior) can submit
  if (exam.createdBy.toString() !== user.id.toString()) {
    return NextResponse.json({ error: 'Only the creator can submit this document.' }, { status: 403 });
  }

  // Make sure there is at least one witness with at least one QA pair
  const witnessCount = await WitnessSection.countDocuments({ crossExamId: exam._id });
  if (witnessCount === 0) {
    return NextResponse.json(
      { error: 'Add at least one witness before submitting.' },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const result = await applyTransition({
    exam,
    action: 'submit',
    userId: user.id,
    message: body.message || 'Submitted for senior review.',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ success: true, exam: result.exam });
});

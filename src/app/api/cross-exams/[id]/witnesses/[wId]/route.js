// app/api/cross-exams/[id]/witnesses/[wId]/route.js
// GET    — fetch single witness with QA pairs
// PUT    — update witnessName / witnessType / role
// DELETE — remove witness and all its QA pairs

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';
import WitnessSection from '@/models/WitnessSection';
import { logActivity } from '@/lib/crossExamWorkflow';

// ---------------------------------------------------------------------------
// Shared helper: load exam and witness, check access
// ---------------------------------------------------------------------------
async function loadAndCheck(params, user) {
  const exam = await CrossExamination.findById(params.id);
  if (!exam) return { error: 'Cross-examination not found.', status: 404 };

  const witness = await WitnessSection.findOne({ _id: params.wId, crossExamId: params.id });
  if (!witness) return { error: 'Witness section not found.', status: 404 };

  const isCreator  = exam.createdBy.toString() === user.id.toString();
  const isReviewer = exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  if (!isCreator && !isReviewer) return { error: 'Access denied.', status: 403 };

  return { exam, witness };
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();
  const result = await loadAndCheck(params, user);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ witness: result.witness });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------
export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();
  const result = await loadAndCheck(params, user);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  const { exam, witness } = result;
  if (exam.isLocked) return NextResponse.json({ error: 'Document is locked.' }, { status: 403 });

  const body = await req.json();
  if (body.witnessName !== undefined) witness.witnessName = body.witnessName.trim();
  if (body.witnessType !== undefined) witness.witnessType = body.witnessType;
  if (body.role       !== undefined) witness.role = body.role;

  await witness.save();

  return NextResponse.json({ witness });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();
  const result = await loadAndCheck(params, user);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  const { exam, witness } = result;
  if (exam.isLocked) return NextResponse.json({ error: 'Document is locked.' }, { status: 403 });

  await WitnessSection.findByIdAndDelete(witness._id);

  // Remove the reference from the parent document
  exam.witnessSections = exam.witnessSections.filter(
    (wId) => wId.toString() !== witness._id.toString()
  );
  await exam.save();

  await logActivity({
    crossExamId: exam._id,
    action: 'witness_deleted',
    performedBy: user.id,
    before: { witnessName: witness.witnessName },
    message: `Witness "${witness.witnessName}" deleted.`,
  });

  return NextResponse.json({ success: true });
});

// app/api/cross-exams/[id]/witnesses/[wId]/qa/[qaId]/flag/route.js
// POST — Toggle isFlagged / isApproved on a QA pair (reviewer only)
// Body: { isFlagged?, isApproved? }

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';
import WitnessSection from '@/models/WitnessSection';
import { logActivity } from '@/lib/crossExamWorkflow';

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  if (exam.isLocked) return NextResponse.json({ error: 'Document is locked.' }, { status: 403 });

  // Only the assigned reviewer can flag / approve individual QA pairs
  if (!exam.assignedTo || exam.assignedTo.toString() !== user.id.toString()) {
    return NextResponse.json({ error: 'Only the assigned reviewer can flag or approve QA pairs.' }, { status: 403 });
  }

  const witness = await WitnessSection.findOne({ _id: params.wId, crossExamId: params.id });
  if (!witness) return NextResponse.json({ error: 'Witness not found.' }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair) return NextResponse.json({ error: 'QA pair not found.' }, { status: 404 });

  const body   = await req.json();
  const before = { isFlagged: qaPair.isFlagged, isApproved: qaPair.isApproved };

  if (body.isFlagged  !== undefined) qaPair.isFlagged  = Boolean(body.isFlagged);
  if (body.isApproved !== undefined) qaPair.isApproved = Boolean(body.isApproved);

  // Flagged and approved are mutually exclusive
  if (qaPair.isFlagged)  qaPair.isApproved = false;
  if (qaPair.isApproved) qaPair.isFlagged  = false;

  await witness.save();

  const action = qaPair.isApproved ? 'qa_approved' : (qaPair.isFlagged ? 'flagged' : 'unflagged');

  await logActivity({
    crossExamId: exam._id,
    action,
    performedBy: user.id,
    before,
    after: { isFlagged: qaPair.isFlagged, isApproved: qaPair.isApproved },
    message: `QA pair #${qaPair.sequence} ${action.replace('_', ' ')}.`,
  });

  return NextResponse.json({ qaPair });
});

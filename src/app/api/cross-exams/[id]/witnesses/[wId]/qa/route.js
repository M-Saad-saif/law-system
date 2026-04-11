// app/api/cross-exams/[id]/witnesses/[wId]/qa/route.js
// POST /api/cross-exams/:id/witnesses/:wId/qa
// Adds a new QA pair to a witness section.
// Body: { originalQuestion, originalAnswer, sequence? }

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

  const witness = await WitnessSection.findOne({ _id: params.wId, crossExamId: params.id });
  if (!witness) return NextResponse.json({ error: 'Witness section not found.' }, { status: 404 });

  const isCreator  = exam.createdBy.toString() === user.id.toString();
  const isReviewer = exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  const isAdmin    = user.role === 'admin';
  if (!isCreator && !isReviewer && !isAdmin) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  const body = await req.json();
  const { originalQuestion = '', originalAnswer = '' } = body;

  // Auto-assign next sequence number
  const maxSeq = witness.qaPairs.reduce((m, p) => Math.max(m, p.sequence), 0);

  witness.qaPairs.push({
    sequence: body.sequence ?? maxSeq + 1,
    originalQuestion,
    originalAnswer,
    editedQuestion: '',
    editedAnswer: '',
    useEditedVersion: false,
    isApproved: false,
    isFlagged: false,
    strategyNote: '',
    evidenceNote: '',
    caseLawNote: '',
    comments: [],
  });

  await witness.save();

  const newPair = witness.qaPairs[witness.qaPairs.length - 1];

  await logActivity({
    crossExamId: exam._id,
    action: 'qa_added',
    performedBy: user.id,
    after: { witnessId: witness._id, qaId: newPair._id, sequence: newPair.sequence },
    message: `QA pair #${newPair.sequence} added for witness "${witness.witnessName}".`,
  });

  return NextResponse.json({ qaPair: newPair }, { status: 201 });
});

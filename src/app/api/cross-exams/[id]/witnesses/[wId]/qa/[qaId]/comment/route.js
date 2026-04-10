// app/api/cross-exams/[id]/witnesses/[wId]/qa/[qaId]/comment/route.js
// POST — Add a comment (or threaded reply) to a QA pair
// PUT  — Resolve / unresolve a comment   Body: { commentId, resolved }
//
// Body for POST: { text, parentComment? }

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';
import WitnessSection from '@/models/WitnessSection';
import { logActivity } from '@/lib/crossExamWorkflow';

// ---------------------------------------------------------------------------
// POST — add comment
// ---------------------------------------------------------------------------
export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  if (exam.isLocked) return NextResponse.json({ error: 'Document is locked.' }, { status: 403 });

  const witness = await WitnessSection.findOne({ _id: params.wId, crossExamId: params.id });
  if (!witness) return NextResponse.json({ error: 'Witness not found.' }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair) return NextResponse.json({ error: 'QA pair not found.' }, { status: 404 });

  const isCreator  = exam.createdBy.toString() === user.id.toString();
  const isReviewer = exam.assignedTo && exam.assignedTo.toString() === user.id.toString();
  if (!isCreator && !isReviewer) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  const { text, parentComment = null } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Comment text is required.' }, { status: 400 });

  qaPair.comments.push({ text: text.trim(), author: user.id, parentComment, resolved: false });
  await witness.save();

  const newComment = qaPair.comments[qaPair.comments.length - 1];

  await logActivity({
    crossExamId: exam._id,
    action: 'comment_added',
    performedBy: user.id,
    after: { qaId: qaPair._id, commentId: newComment._id, text: newComment.text },
    message: `Comment added to QA pair #${qaPair.sequence}.`,
  });

  return NextResponse.json({ comment: newComment }, { status: 201 });
});

// ---------------------------------------------------------------------------
// PUT — resolve or unresolve a comment
// Body: { commentId, resolved }
// ---------------------------------------------------------------------------
export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });

  const witness = await WitnessSection.findOne({ _id: params.wId, crossExamId: params.id });
  if (!witness) return NextResponse.json({ error: 'Witness not found.' }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair) return NextResponse.json({ error: 'QA pair not found.' }, { status: 404 });

  const { commentId, resolved } = await req.json();
  const comment = qaPair.comments.id(commentId);
  if (!comment) return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });

  comment.resolved = Boolean(resolved);
  await witness.save();

  await logActivity({
    crossExamId: exam._id,
    action: 'comment_resolved',
    performedBy: user.id,
    after: { commentId, resolved: comment.resolved },
    message: `Comment ${comment.resolved ? 'resolved' : 'reopened'} on QA pair #${qaPair.sequence}.`,
  });

  return NextResponse.json({ comment });
});

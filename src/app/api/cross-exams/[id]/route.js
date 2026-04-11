// app/api/cross-exams/[id]/route.js
// GET    /api/cross-exams/:id  — fetch with witnesses populated
// PUT    /api/cross-exams/:id  — update title / hearingDate (draft only)
// DELETE /api/cross-exams/:id  — soft-delete (creator + admin only, draft only)

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api';
import connectDB from '@/lib/db';
import CrossExamination from '@/models/CrossExamination';
import WitnessSection from '@/models/WitnessSection';
import ActivityLog from '@/models/ActivityLog';

// ---------------------------------------------------------------------------
// GET — return exam with witnesses and QA pairs populated
// ---------------------------------------------------------------------------
export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id)
    .populate('createdBy', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('caseId', 'caseTitle caseNumber')
    .lean();

  if (!exam) {
    return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  }

  // Access check: creator, assigned reviewer, or admin
  const isOwner    = exam.createdBy._id.toString() === user.id.toString();
  const isAssigned = exam.assignedTo && exam.assignedTo._id.toString() === user.id.toString();
  const isAdmin    = user.role === 'admin';

  if (!isOwner && !isAssigned && !isAdmin) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  // Fetch witnesses separately so we can include full QA pairs + comments
  const witnesses = await WitnessSection.find({ crossExamId: params.id })
    .sort({ createdAt: 1 })
    .lean();

  // Fetch recent activity (last 30 entries)
  const activity = await ActivityLog.find({ crossExamId: params.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('performedBy', 'name email')
    .lean();

  return NextResponse.json({ exam: { ...exam, witnesses }, activity });
});

// ---------------------------------------------------------------------------
// PUT — update mutable fields (title, hearingDate, assignedTo)
// Editing is blocked once the exam is locked (approved/archived)
// ---------------------------------------------------------------------------
export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  }

  if (exam.isLocked) {
    return NextResponse.json({ error: 'This cross-examination is locked and cannot be edited.' }, { status: 403 });
  }

  // Only the creator can edit basic fields
  if (exam.createdBy.toString() !== user.id.toString()) {
    return NextResponse.json({ error: 'Only the creator can edit this document.' }, { status: 403 });
  }

  const body = await req.json();
  const before = { title: exam.title, hearingDate: exam.hearingDate };

  if (body.title !== undefined) exam.title = body.title.trim();
  if (body.hearingDate !== undefined) exam.hearingDate = body.hearingDate || null;

  await exam.save();

  await ActivityLog.create({
    crossExamId: exam._id,
    action: 'updated',
    performedBy: user.id,
    before,
    after: { title: exam.title, hearingDate: exam.hearingDate },
    message: 'Cross-examination details updated.',
  });

  return NextResponse.json({ exam });
});

// ---------------------------------------------------------------------------
// DELETE — remove exam and all related witnesses (draft only)
// ---------------------------------------------------------------------------
export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json({ error: 'Cross-examination not found.' }, { status: 404 });
  }

  if (exam.createdBy.toString() !== user.id.toString()) {
    return NextResponse.json({ error: 'Only the creator can delete this document.' }, { status: 403 });
  }

  if (exam.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft cross-examinations can be deleted.' },
      { status: 400 }
    );
  }

  // Clean up related data
  await WitnessSection.deleteMany({ crossExamId: exam._id });
  await ActivityLog.deleteMany({ crossExamId: exam._id });
  await CrossExamination.findByIdAndDelete(exam._id);

  return NextResponse.json({ success: true, message: 'Cross-examination deleted.' });
});

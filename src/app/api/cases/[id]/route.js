import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Case from '@/models/Case';
import { withAuth } from '@/lib/api';

export const GET = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
    if (!caseDoc) {
      return NextResponse.json({ success: false, message: 'Case not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { case: caseDoc } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch case.' }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const caseDoc = await Case.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!caseDoc) {
      return NextResponse.json({ success: false, message: 'Case not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { case: caseDoc } });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, message: messages }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update case.' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const caseDoc = await Case.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!caseDoc) {
      return NextResponse.json({ success: false, message: 'Case not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Case deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete case.' }, { status: 500 });
  }
});

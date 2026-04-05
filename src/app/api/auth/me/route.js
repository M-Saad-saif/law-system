import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { withAuth } from '@/lib/api';

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const fullUser = await User.findById(user.id);
    if (!fullUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { user: fullUser } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch user.' }, { status: 500 });
  }
});

export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { name, phone, barCouncilNo } = await request.json();
    const updated = await User.findByIdAndUpdate(
      user.id,
      { $set: { name, phone, barCouncilNo } },
      { new: true }
    );
    return NextResponse.json({ success: true, data: { user: updated } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
  }
});

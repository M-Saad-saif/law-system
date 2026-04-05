import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Reminder } from '@/models/BookReminder';
import { withAuth } from '@/lib/api';

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'upcoming';

    const query = { userId: user.id };
    if (filter === 'upcoming') {
      query.isCompleted = false;
      query.dateTime = { $gte: new Date() };
    } else if (filter === 'completed') {
      query.isCompleted = true;
    } else if (filter === 'overdue') {
      query.isCompleted = false;
      query.dateTime = { $lt: new Date() };
    }

    const reminders = await Reminder.find(query)
      .sort({ dateTime: filter === 'completed' ? -1 : 1 })
      .populate('linkedCase', 'caseTitle caseNumber');

    return NextResponse.json({ success: true, data: { reminders } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch reminders.' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const reminder = await Reminder.create({ ...body, userId: user.id });
    return NextResponse.json({ success: true, data: { reminder } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create reminder.' }, { status: 500 });
  }
});

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Case from '@/models/Case';
import { withAuth } from '@/lib/api';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const tomorrowStart = startOfDay(addDays(today, 1));
    const tomorrowEnd = endOfDay(addDays(today, 1));

    const [total, active, closed, todayCases, tomorrowCases, recentCases] = await Promise.all([
      Case.countDocuments({ userId: user.id }),
      Case.countDocuments({ userId: user.id, status: 'Active' }),
      Case.countDocuments({ userId: user.id, status: 'Closed' }),
      Case.countDocuments({
        userId: user.id,
        $or: [
          { nextHearingDate: { $gte: todayStart, $lte: todayEnd } },
          { nextProceedingDate: { $gte: todayStart, $lte: todayEnd } },
        ],
      }),
      Case.countDocuments({
        userId: user.id,
        $or: [
          { nextHearingDate: { $gte: tomorrowStart, $lte: tomorrowEnd } },
          { nextProceedingDate: { $gte: tomorrowStart, $lte: tomorrowEnd } },
        ],
      }),
      Case.find({ userId: user.id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('caseTitle caseNumber courtType status updatedAt nextHearingDate clientName'),
    ]);

    return NextResponse.json({
      success: true,
      data: { total, active, closed, todayCases, tomorrowCases, recentCases },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch stats.' }, { status: 500 });
  }
});

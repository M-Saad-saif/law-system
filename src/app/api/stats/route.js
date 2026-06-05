import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import User from "@/models/User";

export const GET = async (request) => {
  try {
    await connectDB();

    // Total cases
    const casesCount = await Case.countDocuments();

    const agg = await Case.aggregate([
      {
        $project: {
          nextCount: { $cond: [{ $ifNull: ["$nextHearingDate", false] }, 1, 0] },
          proceedingCount: { $size: { $ifNull: ["$proceedings", []] } },
        },
      },
      { $group: { _id: null, total: { $sum: { $add: ["$nextCount", "$proceedingCount"] } } } },
    ]);

    const hearingsCount = agg?.[0]?.total || 0;

    const firmsCount = await User.countDocuments({ seniority: "senior" });

    return NextResponse.json({
      success: true,
      data: { casesCount, hearingsCount, firmsCount },
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ success: false, message: "Failed to fetch stats." }, { status: 500 });
  }
};

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Subscription, { ALLOWED_STATUSES } from "@/models/Subscription";
import Chamber from "@/models/Chamber";
import User from "@/models/User";

export async function GET(request) {
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ allowed: false, status: null }, { status: 401 });
  }

  const userId = request.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ allowed: false, status: null });

  try {
    await connectDB();

    const user = await User.findById(userId)
      .select("seniority createdBy")
      .lean();
    if (!user) return NextResponse.json({ allowed: false, status: null });

    let chamber = await Chamber.findOne({ owner: userId }).lean();
    if (!chamber && user.seniority === "junior" && user.createdBy) {
      chamber = await Chamber.findOne({ owner: user.createdBy }).lean();
    }
    if (!chamber) return NextResponse.json({ allowed: false, status: null });

    const sub = await Subscription.findOne({ chamber: chamber._id })
      .select("status")
      .lean();

    const status = sub?.status ?? null;
    const allowed = !!(status && ALLOWED_STATUSES.includes(status));
    return NextResponse.json({ allowed, status });
  } catch (err) {
    console.error("Subscription check failed:", err);
    return NextResponse.json({ allowed: false, status: null });
  }
}

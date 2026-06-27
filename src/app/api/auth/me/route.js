import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { withAuth, apiError } from "@/lib/api";
import { clearAuthCookie } from "@/lib/authtoken";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const fullUser = await User.findById(user.id)
      .populate("createdBy", "name email phone profilePicture")
      .lean();
    if (!fullUser) {
      const response = apiError("Unauthorized. Please login.", 401);
      clearAuthCookie(response);
      return response;
    }
    return NextResponse.json({ success: true, data: { user: fullUser } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch user." },
      { status: 500 },
    );
  }
});

export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { name, phone, barCouncilNo } = await request.json();
    const updated = await User.findByIdAndUpdate(
      user.id,
      { $set: { name, phone, barCouncilNo } },
      { new: true },
    );
    return NextResponse.json({ success: true, data: { user: updated } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 },
    );
  }
});

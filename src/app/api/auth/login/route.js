import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been deactivated. Contact support.",
        },
        { status: 403 },
      );
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      seniority: user.seniority,
      name: user.name,
    });

    const response = NextResponse.json(
      { success: true, data: { user } },
      { status: 200 },
    );
    setAuthCookie(token, response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}

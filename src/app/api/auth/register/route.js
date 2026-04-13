import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/authtoken";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, phone, barCouncilNo } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required." },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      barCouncilNo,
      seniority: body.seniority || "junior",
    });
    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
      seniority: user.seniority,
      name: user.name,
    });

    const response = NextResponse.json(
      { success: true, data: { user } },
      { status: 201 },
    );
    setAuthCookie(token, response);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}

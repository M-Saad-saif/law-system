import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Client from "@/models/Client";
import { signToken, setAuthCookie } from "@/lib/authtoken";
import { signClientToken, setClientAuthCookie } from "@/lib/clientAuth";

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

    const normalizedEmail = email.toLowerCase();

    // ---- 1. Try staff account ----
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (user) {
      if (!(await user.comparePassword(password))) {
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
        { success: true, data: { user, accountType: "staff" } },
        { status: 200 },
      );
      setAuthCookie(token, response);
      return response;
    }

    // ---- 2. Fall back to client-portal account ----
    const client = await Client.findOne({ email: normalizedEmail }).select("+password");
    if (client) {
      if (!(await client.comparePassword(password))) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password." },
          { status: 401 },
        );
      }

      if (!client.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: "Your portal access has been disabled. Contact your lawyer.",
          },
          { status: 403 },
        );
      }

      const token = signClientToken({
        id: client._id,
        email: client.email,
        name: client.name,
        chamber: client.chamber,
      });

      const response = NextResponse.json(
        { success: true, data: { client, accountType: "client" } },
        { status: 200 },
      );
      setClientAuthCookie(token, response);
      return response;
    }

    // ---- Neither matched ----
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 },
    );
  } catch (error) {
    console.error("[auth/login] POST:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
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

    const client = await Client.findOne({ email: email.toLowerCase() }).select("+password");
    if (!client || !(await client.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!client.isActive) {
      return NextResponse.json(
        { success: false, message: "Your portal access has been disabled. Contact your lawyer." },
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
      { success: true, data: { client } },
      { status: 200 },
    );
    setClientAuthCookie(token, response);
    return response;
  } catch (error) {
    console.error("[client-portal/auth/login] POST:", error);
    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 },
    );
  }
}

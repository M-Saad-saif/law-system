import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import { withClientAuth } from "@/lib/clientAuth";
import { clearClientAuthCookie } from "@/lib/clientAuth";

export const GET = withClientAuth(async (request, context, client) => {
  try {
    await connectDB();
    const fullClient = await Client.findById(client.id).lean();
    if (!fullClient || !fullClient.isActive) {
      const response = NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
      clearClientAuthCookie(response);
      return response;
    }
    return NextResponse.json({ success: true, data: { client: fullClient } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch client profile." },
      { status: 500 },
    );
  }
});

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withAuth } from "@/lib/api";

export const POST = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const caseDoc = await Case.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $push: { accused: body } },
      { new: true },
    );
    if (!caseDoc)
      return NextResponse.json(
        { success: false, message: "Case not found." },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: { case: caseDoc } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add accused." },
      { status: 500 },
    );
  }
});

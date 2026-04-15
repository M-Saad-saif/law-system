import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withAuth } from "@/lib/api";

export const PATCH = withAuth(async (request, { params }, user) => {
  await connectDB();
  const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
  if (!caseDoc)
    return NextResponse.json(
      { success: false, message: "Not found." },
      { status: 404 },
    );
  caseDoc.isFavourite = !caseDoc.isFavourite;
  await caseDoc.save();
  return NextResponse.json({
    success: true,
    data: { isFavourite: caseDoc.isFavourite },
  });
});

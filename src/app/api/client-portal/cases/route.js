import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withClientAuth } from "@/lib/clientAuth";

// GET /api/client-portal/cases
// Only cases explicitly linked to this client AND flagged isSharedWithClient.
export const GET = withClientAuth(async (request, context, client) => {
  try {
    await connectDB();

    const cases = await Case.find({
      client: client.id,
      isSharedWithClient: true,
    })
      .select(
        "caseTitle caseNumber suitNo courtType courtName caseType status nextHearingDate nextProceedingDate filingDate judgeName createdAt",
      )
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: { cases } });
  } catch (error) {
    console.error("[client-portal/cases] GET:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch your cases." },
      { status: 500 },
    );
  }
});

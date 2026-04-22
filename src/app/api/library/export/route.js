import { withAuth, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";
import { NextResponse } from "next/server";

// GET: export selected library entries as JSON download
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    let query = { userId: user.id };
    if (ids && ids !== "all") {
      query._id = { $in: ids.split(",") };
    }

    const entries = await JudgementLibrary.find(query).lean();
    const exportData = entries.map(
      ({ _id, userId, createdAt, updatedAt, ...rest }) => rest,
    );

    const json = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        count: exportData.length,
        entries: exportData,
      },
      null,
      2,
    );

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="judgement-library-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error("[library/export]", err);
    return apiError("Export failed.", 500);
  }
});

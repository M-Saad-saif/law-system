import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id)
    .populate("versionHistory.createdBy", "name email role")
    .lean();

  if (!exam) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const versions = (exam.versionHistory || []).map((v) => ({
    version: v.version,
    createdAt: v.createdAt,
    createdBy: v.createdBy,
    message: v.message,
    triggerAction: v.triggerAction,
    insights: v.insights,
    diffCount: (v.diffs || []).length,
    // Only include full diffs if explicitly requested
    diffs: undefined,
  }));

  const { searchParams } = new URL(req.url);
  const includeVersion = searchParams.get("version");

  if (includeVersion) {
    const target = exam.versionHistory.find(
      (v) => v.version === parseInt(includeVersion),
    );
    if (!target)
      return NextResponse.json(
        { error: "Version not found." },
        { status: 404 },
      );
    return NextResponse.json({ version: target });
  }

  return NextResponse.json({ versions, currentVersion: exam.version });
});

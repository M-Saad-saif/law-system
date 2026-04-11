import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import JudgmentAlert from "@/models/JudgmentAlert";
import { withAuth } from "@/lib/api";
import { seedIntelligenceFeed } from "../seed/intelligence-seed-snippet";

export const GET = withAuth(async (req) => {
  await dbConnect();

  if (process.env.NODE_ENV !== "production") {
    const total = await JudgmentAlert.countDocuments();
    if (total === 0) {
      await seedIntelligenceFeed();
    }
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const caseType = searchParams.get("caseType");
  const importance = searchParams.get("importance");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

  const filter = { isActive: { $ne: false } };
  if (section) filter.ppcSections = { $in: [section] };
  if (caseType) filter.caseType = caseType;
  if (importance) filter.importance = importance;

  const total = await JudgmentAlert.countDocuments(filter);
  const judgments = await JudgmentAlert.find(filter)
    .sort({ decisionDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    success: true,
    data: judgments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

// POST /api/intelligence  — admin can manually add alerts
export const POST = withAuth(async (req) => {
  await dbConnect();

  const body = await req.json();
  const alert = await JudgmentAlert.create(body);

  return NextResponse.json({ success: true, data: alert }, { status: 201 });
});

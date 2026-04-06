import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import JudgmentAlert from "@/models/JudgmentAlert";
import { withAuth } from "@/lib/api";
import { seedIntelligenceFeed } from "../seed/intelligence-seed-snippet";

// GET /api/intelligence?section=302&caseType=Bail&importance=High&limit=10
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
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const filter = { isActive: { $ne: false } };
  if (section) filter.ppcSections = { $in: [section] };
  if (caseType) filter.caseType = caseType;
  if (importance) filter.importance = importance;

  const judgments = await JudgmentAlert.find(filter)
    .sort({ decisionDate: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ success: true, data: judgments });
});

// POST /api/intelligence  — admin can manually add alerts
export const POST = withAuth(async (req) => {
  await dbConnect();

  const body = await req.json();
  const alert = await JudgmentAlert.create(body);

  return NextResponse.json({ success: true, data: alert }, { status: 201 });
});

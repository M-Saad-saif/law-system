import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import Judgment from "@/models/Judgment";

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let _cache = { data: null, fetchedAt: 0, courts: [] };

const ALL_COURTS = ["SCP", "LHC", "IHC", "PHC", "BHC", "SHC"];

function buildCourtSummary(judgments) {
  const map = {};
  for (const j of judgments) {
    if (!map[j.courtAbbr]) {
      map[j.courtAbbr] = {
        court: j.courtAbbr,
        courtFull: j.courtFull,
        count: 0,
        status: "live",
      };
    }
    map[j.courtAbbr].count++;
  }
  return Object.values(map);
}

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(parseInt(searchParams.get("limit") || "60"), 200);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

  const courtsParam = searchParams.get("courts");
  const legacyCourt = searchParams.get("court");
  const requestedCourts = courtsParam
    ? courtsParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
    : legacyCourt
      ? [legacyCourt.trim().toUpperCase()]
      : ALL_COURTS;

  const now = Date.now();
  if (_cache.data && now - _cache.fetchedAt < CACHE_TTL_MS) {
    const filtered = _cache.data.filter((j) =>
      requestedCourts.includes(j.courtAbbr),
    );
    const paged = filtered.slice((page - 1) * limit, page * limit);
    return NextResponse.json({
      success: true,
      source: "cache",
      data: paged,
      total: filtered.length,
      courts: _cache.courts,
      unavailable: [],
      fetchedAt: new Date(_cache.fetchedAt).toISOString(),
    });
  }

  try {
    await connectDB();

    const raw = await Judgment.find({})
      .sort({ orderDate: -1, fetchedAt: -1 })
      .limit(500)
      .lean();

    const judgments = raw.map((j) => ({
      id: j.sourceUrl || j._id.toString(),
      _id: j._id.toString(),
      title: j.title,
      court: j.courtFull,
      courtFull: j.courtFull,
      courtAbbr: j.courtAbbr,
      province: j.province,
      citation: j.citation,
      judge: j.judge,
      matter: j.matter,
      orderDate: j.orderDate ? j.orderDate.toISOString() : null,
      sourceUrl: j.sourceUrl,
      approved: j.approved,
      fetchedAt: j.fetchedAt ? j.fetchedAt.toISOString() : null,
    }));

    const courtSummary = buildCourtSummary(judgments);

    _cache = { data: judgments, fetchedAt: Date.now(), courts: courtSummary };

    const filtered = judgments.filter((j) =>
      requestedCourts.includes(j.courtAbbr),
    );
    const paged = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      source: judgments.length === 0 ? "empty" : "db",
      data: paged,
      total: filtered.length,
      courts: courtSummary,
      unavailable: [],
      fetchedAt: new Date().toISOString(),
      syncRequired: judgments.length === 0,
    });
  } catch (err) {
    console.error("[legal-updates] DB error:", err.message);

    if (_cache.data) {
      const filtered = _cache.data.filter((j) =>
        requestedCourts.includes(j.courtAbbr),
      );
      const paged = filtered.slice((page - 1) * limit, page * limit);
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        data: paged,
        total: filtered.length,
        courts: _cache.courts,
        unavailable: [],
        fetchedAt: new Date(_cache.fetchedAt).toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        source: "error",
        data: [],
        error: err.message,
        fetchedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
});

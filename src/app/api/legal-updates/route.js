import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import Judgment from "@/models/Judgment";

export const dynamic = "force-dynamic";

const ALL_COURTS = ["SCP", "LHC", "IHC", "PHC", "BHC", "SHC"];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialise(j) {
  return {
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

    caseNumber: j.caseNumber ?? null,
    summary: j.summary ?? null,
    keywords: j.keywords ?? [],
    bench: j.bench ?? null,
    qualityScore: j.qualityScore ?? null,
    status: j.status ?? null,
    source: j.source ?? "apify",
  };
}

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);

  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
    100,
  );
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

  const courtsParam = searchParams.get("courts");
  const legacyCourt = searchParams.get("court");
  const requestedCourts = courtsParam
    ? courtsParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
    : legacyCourt
      ? [legacyCourt.trim().toUpperCase()]
      : null; // null / omitted => all courts

  const search = (searchParams.get("search") || "").trim();

  try {
    await connectDB();

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: escapeRegex(search), $options: "i" } },
            { citation: { $regex: escapeRegex(search), $options: "i" } },
            { judge: { $regex: escapeRegex(search), $options: "i" } },
            { caseNumber: { $regex: escapeRegex(search), $options: "i" } },
            { keywords: { $regex: escapeRegex(search), $options: "i" } },
          ],
        }
      : {};

    const courtFilter =
      requestedCourts && requestedCourts.length
        ? { courtAbbr: { $in: requestedCourts } }
        : {};

    const filter = { ...searchFilter, ...courtFilter };

    const [total, raw, courtCountsRaw, overallTotal, latest] =
      await Promise.all([
        Judgment.countDocuments(filter),
        Judgment.find(filter)
          .sort({ orderDate: -1, fetchedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),

        Judgment.aggregate([
          { $match: searchFilter },
          {
            $group: {
              _id: "$courtAbbr",
              count: { $sum: 1 },
              courtFull: { $first: "$courtFull" },
            },
          },
        ]),
        Judgment.countDocuments(searchFilter),
        Judgment.findOne({}).sort({ fetchedAt: -1 }).lean(),
      ]);

    const courts = ALL_COURTS.map((abbr) => {
      const found = courtCountsRaw.find((c) => c._id === abbr);
      return {
        court: abbr,
        courtFull: found?.courtFull ?? abbr,
        count: found?.count ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      source: overallTotal === 0 ? "empty" : "db",
      data: raw.map(serialise),
      total,
      totalAllCourts: overallTotal,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      courts,
      fetchedAt: latest?.fetchedAt
        ? latest.fetchedAt.toISOString()
        : new Date().toISOString(),
      syncRequired: overallTotal === 0,
    });
  } catch (err) {
    console.error("[legal-updates] DB error:", err.message);
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

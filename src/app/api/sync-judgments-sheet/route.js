import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/authtoken";
import connectDB from "@/lib/db";
import { parseCSV } from "@/lib/csv";
import { fetchSheetCSV, getJudgmentsSheetConfig } from "@/lib/googleSheet";
import { resolveCourtAbbr } from "@/lib/courtMapping";
import Judgment from "@/models/Judgment";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function isAuthorised(request) {
  const cronSecret = process.env.CRON_SECRET;
  const incomingSecret = request.headers.get("x-cron-secret");
  if (cronSecret && incomingSecret === cronSecret) return true;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return false;
    const user = verifyToken(token);
    return user?.role === "admin";
  } catch {
    return false;
  }
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function extractCitationFromSummary(summary) {
  if (!summary) return null;
  const match = summary.match(/Citation:\s*([^|]+)/i);
  if (!match) return null;
  const value = match[1].trim();
  if (!value || /citation awaited/i.test(value) || value === "-") return null;
  return value;
}

function pickFirstValue(row, keys) {
  for (const key of keys) {
    const value = (row[key] || "").toString().trim();
    if (value) return value;
  }
  return "";
}

function buildFallbackSourceUrl({ caseNumber, title, orderDate, citation }) {
  const keyParts = [
    caseNumber || "",
    title || "",
    orderDate ? new Date(orderDate).toISOString().slice(0, 10) : "",
    citation || "",
  ]
    .map((part) => part.toString().trim().replace(/\s+/g, "_"))
    .join("|");

  return `sheet://${encodeURIComponent(keyParts.slice(0, 300))}`;
}

function splitKeywords(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function normaliseRow(row, diagnostics) {
  const rawCourtName = pickFirstValue(row, [
    "Court Name",
    "Court",
    "Court/Bench",
    "Court Title",
  ]);
  const courtAbbr = resolveCourtAbbr(rawCourtName) || "OTHER";

  const titleSource = pickFirstValue(row, [
    "Case Title",
    "Title",
    "Case Name",
    "Judgment Title",
    "Judgement Title",
  ]);
  const caseNumber = pickFirstValue(row, [
    "Case Number",
    "Case No.",
    "Case No",
    "Number",
  ]);
  const citation = pickFirstValue(row, ["Citations", "Citation"]) ||
    extractCitationFromSummary(row["Summary"]);
  const sourceUrl = pickFirstValue(row, [
    "Full Text Link",
    "Source URL",
    "SourceUrl",
    "URL",
  ]) || null;
  const fallbackTitle =
    titleSource ||
    caseNumber ||
    citation ||
    (sourceUrl ? `Judgment ${sourceUrl}` : "");
  const title = fallbackTitle.trim().slice(0, 500);
  if (!title) {
    if (diagnostics) diagnostics.noTitle++;
    return null;
  }

  if (diagnostics && courtAbbr === "OTHER") {
    diagnostics.unresolvedCourt++;
    const sample = (rawCourtName || "(blank)").toString().trim();
    if (
      sample &&
      diagnostics.unresolvedCourtSamples.length < 20 &&
      !diagnostics.unresolvedCourtSamples.includes(sample)
    ) {
      diagnostics.unresolvedCourtSamples.push(sample);
    }
  }

  const courtFull = rawCourtName || courtAbbr;
  const resolvedSourceUrl =
    sourceUrl ||
    buildFallbackSourceUrl({
      caseNumber,
      title,
      orderDate: row["Judgment Date"],
      citation,
    });

  return {
    title,
    court: courtAbbr,
    courtAbbr,
    courtFull,
    rawCourtName,
    province: null,
    citation: citation || null,
    judge: (row["Judges"] || "").trim() || null,
    matter: (row["Type"] || "").trim() || null,
    orderDate: toDate(row["Judgment Date"]),
    sourceUrl: resolvedSourceUrl,
    approved: false,
    fetchedAt: toDate(row["Scraped At"]) || new Date(),

    caseNumber,
    summary: (row["Summary"] || "").trim() || null,
    keywords: splitKeywords(row["Keywords"]),
    bench: (row["Bench"] || "").trim() || null,
    qualityScore: toNumber(row["Quality Score"]),
    status: (row["Status"] || "").trim() || null,
    source: "sheet",
  };
}

async function runSync({
  dryRun = false,
  requestedCourts = null,
  fullSync = false,
} = {}) {
  const stats = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    total: 0,
    rawRowCount: 0,
    dryRun,
  };
  const diagnostics = {
    noTitle: 0,
    unresolvedCourt: 0,
    unresolvedCourtSamples: [],
  };

  const { sheetId, gid } = getJudgmentsSheetConfig();
  const csvText = await fetchSheetCSV({ sheetId, gid });
  const rawRows = parseCSV(csvText);
  stats.rawRowCount = rawRows.length;

  await connectDB();

  let checkpoint = null;
  if (!fullSync) {
    const latest = await Judgment.findOne({ source: "sheet" })
      .sort({ fetchedAt: -1 })
      .select({ fetchedAt: 1 })
      .lean();
    checkpoint = latest?.fetchedAt ? new Date(latest.fetchedAt) : null;
    stats.checkpoint = checkpoint?.toISOString() ?? null;
  } else {
    stats.checkpoint = null;
  }

  const validItems = rawRows
    .map((row) => normaliseRow(row, diagnostics))
    .filter(Boolean)
    .filter((item) => !requestedCourts || requestedCourts.includes(item.court))
    .filter((item) => {
      if (!checkpoint) return true;
      const fetchedAt = item.fetchedAt ? new Date(item.fetchedAt) : null;
      return fetchedAt && fetchedAt > checkpoint;
    });
  stats.total = validItems.length;
  stats.skipped = rawRows.length - validItems.length;
  stats.skipReasons = {
    missingTitle: diagnostics.noTitle,
    unresolvedCourt: diagnostics.unresolvedCourt,
    unresolvedCourtSamples: diagnostics.unresolvedCourtSamples,
  };

  const courtBreakdown = {};
  for (const item of validItems) {
    courtBreakdown[item.court] = (courtBreakdown[item.court] || 0) + 1;
  }
  stats.courtBreakdown = courtBreakdown;

  const sourceUrlCounts = new Map();
  for (const item of validItems) {
    if (!item.sourceUrl) continue;
    sourceUrlCounts.set(
      item.sourceUrl,
      (sourceUrlCounts.get(item.sourceUrl) || 0) + 1,
    );
  }
  let duplicateSourceUrlRows = 0;
  for (const count of sourceUrlCounts.values()) {
    if (count > 1) duplicateSourceUrlRows += count;
  }
  stats.duplicateSourceUrlRows = duplicateSourceUrlRows;
  stats.duplicateSourceUrlGroups = [...sourceUrlCounts.values()].filter(
    (c) => c > 1,
  ).length;

  if (dryRun) {
    return stats;
  }

  const BATCH = 200;
  for (let i = 0; i < validItems.length; i += BATCH) {
    const batch = validItems.slice(i, i + BATCH);
    const ops = batch.map((item) => {
      let filter;
      if (item.caseNumber) {
        filter = { caseNumber: item.caseNumber, court: item.court };
      } else if (item.sourceUrl && sourceUrlCounts.get(item.sourceUrl) === 1) {
        filter = { sourceUrl: item.sourceUrl };
      } else {
        filter = {
          title: item.title,
          court: item.court,
          orderDate: item.orderDate,
        };
      }

      const update = { ...item };
      if (item.sourceUrl && sourceUrlCounts.get(item.sourceUrl) > 1) {
        delete update.sourceUrl;
      } else if (!update.sourceUrl) {
        delete update.sourceUrl;
      }

      return {
        updateOne: {
          filter,
          update: { $set: update },
          upsert: true,
        },
      };
    });

    try {
      const result = await Judgment.bulkWrite(ops, { ordered: false });
      stats.inserted += result.upsertedCount ?? 0;
      stats.updated += result.modifiedCount ?? 0;
    } catch (bulkErr) {
      console.error(
        `[sync-judgments-sheet] Bulk write error (batch ${i}):`,
        bulkErr.message,
      );
      stats.errors += batch.length;
    }
  }

  return stats;
}

export async function POST(request) {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorised." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const dryRun =
    searchParams.get("dryRun") === "1" || searchParams.get("dryRun") === "true";
  const reset =
    searchParams.get("reset") === "1" || searchParams.get("reset") === "true";
  const fullSync =
    searchParams.get("full") === "1" || searchParams.get("full") === "true";
  const courtsParam = searchParams.get("courts");
  const requestedCourts = courtsParam
    ? courtsParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
    : null;

  const start = Date.now();
  try {
    let resetCount = 0;
    if (reset && !dryRun) {
      await connectDB();

      const result = await Judgment.deleteMany({ source: "sheet" });
      resetCount = result.deletedCount ?? 0;
    }

    const stats = await runSync({ dryRun, requestedCourts, fullSync });
    stats.resetCount = resetCount;
    const durationMs = Date.now() - start;

    console.log(
      `[sync-judgments-sheet] Done in ${durationMs}ms. ` +
        `inserted=${stats.inserted} updated=${stats.updated} skipped=${stats.skipped} errors=${stats.errors}`,
    );

    return NextResponse.json({
      success: true,
      ...stats,
      durationMs,
    });
  } catch (err) {
    console.error("[sync-judgments-sheet] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorised." },
      { status: 401 },
    );
  }
  await connectDB();
  const count = await Judgment.countDocuments({ source: "sheet" });
  const latest = await Judgment.findOne({ source: "sheet" })
    .sort({ fetchedAt: -1 })
    .lean();
  return NextResponse.json({
    success: true,
    totalJudgments: count,
    lastFetchedAt: latest?.fetchedAt ?? null,
  });
}

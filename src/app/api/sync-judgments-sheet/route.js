import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/authtoken";
import connectDB from "@/lib/db";
import { parseCSV } from "@/lib/csv";
import { fetchSheetCSV, getJudgmentsSheetConfig } from "@/lib/googleSheet";
import { resolveCourtAbbr, courtFullName } from "@/lib/courtMapping";
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

function splitKeywords(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function normaliseRow(row) {
  const title = (row["Case Title"] || "").trim().slice(0, 500);
  if (!title) return null;

  const courtAbbr = resolveCourtAbbr(row["Court Name"]);
  if (!courtAbbr) return null;

  const citation =
    (row["Citations"] || "").trim() ||
    extractCitationFromSummary(row["Summary"]);

  const sourceUrl = (row["Full Text Link"] || "").trim() || null;
  const caseNumber = (row["Case Number"] || "").trim() || null;

  return {
    title,
    court: courtAbbr,
    courtAbbr,
    courtFull: courtFullName(courtAbbr),
    province: null,
    citation: citation || null,
    judge: (row["Judges"] || "").trim() || null,
    matter: (row["Type"] || "").trim() || null,
    orderDate: toDate(row["Judgment Date"]),
    sourceUrl,
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

async function runSync() {
  const stats = { inserted: 0, updated: 0, skipped: 0, errors: 0, total: 0 };

  const { sheetId, gid } = getJudgmentsSheetConfig();
  const csvText = await fetchSheetCSV({ sheetId, gid });
  const rawRows = parseCSV(csvText);

  const validItems = rawRows.map(normaliseRow).filter(Boolean);
  stats.total = validItems.length;
  stats.skipped = rawRows.length - validItems.length;

  await connectDB();

  const BATCH = 200;
  for (let i = 0; i < validItems.length; i += BATCH) {
    const batch = validItems.slice(i, i + BATCH);
    const ops = batch.map((item) => {
      let filter;
      if (item.sourceUrl) {
        filter = { sourceUrl: item.sourceUrl };
      } else if (item.caseNumber) {
        filter = { caseNumber: item.caseNumber, court: item.court };
      } else {
        filter = {
          title: item.title,
          court: item.court,
          orderDate: item.orderDate,
        };
      }

      return {
        updateOne: {
          filter,
          update: { $set: item },
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

  const start = Date.now();
  try {
    const stats = await runSync();
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

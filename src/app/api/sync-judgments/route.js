import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/authtoken";
import connectDB from "@/lib/db";
import { runActorAndWait, fetchDatasetItems } from "@/lib/apify";
import Judgment from "@/models/Judgment";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// -- Auth helpers --
/**
 * Allow access if the request carries either:
 *  a) a valid cron secret header  (for automated Vercel cron)
 *  b) a valid admin JWT cookie    (for manual admin trigger)
 */
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

function normalise(raw) {
  const VALID_COURTS = ["SCP", "LHC", "IHC", "PHC", "BHC", "SHC"];
  const abbr = (raw.courtAbbr || raw.court || "")
    .toString()
    .toUpperCase()
    .trim();

  if (!VALID_COURTS.includes(abbr)) return null;

  const title = (raw.title || "").toString().trim().slice(0, 500);
  if (!title) return null;

  return {
    title,
    court: abbr,
    courtFull: (raw.courtFull || raw.court || abbr).toString().trim(),
    courtAbbr: abbr,
    province: raw.province ? raw.province.toString().trim() : null,
    citation: raw.citation ? raw.citation.toString().trim() : null,
    judge: raw.judge ? raw.judge.toString().trim().slice(0, 300) : null,
    matter: raw.matter ? raw.matter.toString().trim().slice(0, 200) : null,
    orderDate: raw.orderDate ? new Date(raw.orderDate) : null,
    sourceUrl: raw.sourceUrl ? raw.sourceUrl.toString().trim() : null,
    approved: Boolean(raw.approved),
    fetchedAt: raw.fetchedAt ? new Date(raw.fetchedAt) : new Date(),
  };
}

export async function POST(request) {
  if (!isAuthorised(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorised." },
      { status: 401 },
    );
  }

  let actorInput = {};
  try {
    const body = await request.json().catch(() => ({}));
    if (body && typeof body === "object") actorInput = body;
  } catch {}

  const syncStart = Date.now();
  const stats = { inserted: 0, updated: 0, skipped: 0, errors: 0, total: 0 };

  try {
    //  Run Apify actor
    console.log("[sync-judgments] Starting Apify actor run…");
    let datasetId;
    try {
      datasetId = await runActorAndWait(actorInput);
    } catch (actorErr) {
      console.error("[sync-judgments] Actor run failed:", actorErr.message);
      return NextResponse.json(
        { success: false, message: `Apify actor failed: ${actorErr.message}` },
        { status: 502 },
      );
    }

    // Fetch dataset items
    console.log(`[sync-judgments] Fetching dataset ${datasetId}…`);
    const rawItems = await fetchDatasetItems(datasetId);
    if (!rawItems.length) {
      return NextResponse.json({
        success: true,
        message: "Actor returned 0 items.",
        ...stats,
        durationMs: Date.now() - syncStart,
      });
    }

    // Normalise
    const validItems = rawItems.map(normalise).filter(Boolean);

    stats.total = validItems.length;
    stats.skipped = rawItems.length - validItems.length;

    // Connect to DB
    await connectDB();

    // Bulk upsert
    const BATCH = 200;
    for (let i = 0; i < validItems.length; i += BATCH) {
      const batch = validItems.slice(i, i + BATCH);
      const ops = batch.map((item) => {
        if (item.sourceUrl) {
          // Dedup by sourceUrl
          return {
            updateOne: {
              filter: { sourceUrl: item.sourceUrl },
              update: { $set: item },
              upsert: true,
            },
          };
        } else {
          // No sourceUrl: dedup by title + court + orderDate
          const filter = { title: item.title, court: item.court };
          if (item.orderDate) filter.orderDate = item.orderDate;
          return {
            updateOne: {
              filter,
              update: { $set: item },
              upsert: true,
            },
          };
        }
      });

      try {
        const result = await Judgment.bulkWrite(ops, { ordered: false });
        stats.inserted += result.upsertedCount ?? 0;
        stats.updated += result.modifiedCount ?? 0;
      } catch (bulkErr) {
        // Log but continue – partial batch failures are non-fatal
        console.error(
          `[sync-judgments] Bulk write error (batch ${i}):`,
          bulkErr.message,
        );
        stats.errors += batch.length;
      }
    }

    const durationMs = Date.now() - syncStart;
    console.log(
      `[sync-judgments] Done in ${durationMs}ms. ` +
        `inserted=${stats.inserted} updated=${stats.updated} skipped=${stats.skipped} errors=${stats.errors}`,
    );

    return NextResponse.json({
      success: true,
      inserted: stats.inserted,
      updated: stats.updated,
      skipped: stats.skipped,
      errors: stats.errors,
      total: stats.total,
      durationMs,
    });
  } catch (err) {
    console.error("[sync-judgments] Unexpected error:", err);
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
  const count = await Judgment.countDocuments();
  const latest = await Judgment.findOne().sort({ fetchedAt: -1 }).lean();
  return NextResponse.json({
    success: true,
    totalJudgments: count,
    lastFetchedAt: latest?.fetchedAt ?? null,
  });
}

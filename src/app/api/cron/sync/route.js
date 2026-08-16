import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  //  Validate Vercel cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization") ?? "";
    const incomingSecret = authHeader.replace(/^bearer\s+/i, "").trim();
    if (incomingSecret !== cronSecret) {
      console.warn("[cron/sync] Unauthorized cron call – bad secret.");
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  console.log(`[cron/sync] Triggered at ${new Date().toISOString()}`);

  try {
    const appBase =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    let currentOffset = 0;
    let hasMore = true;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalDurationMs = 0;
    let lastResult = null;

    while (hasMore) {
      const syncUrl = `${appBase}/api/sync-judgments-sheet?offset=${currentOffset}&limit=100`;

      const response = await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret ?? "",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        const msg = result.message ?? `HTTP ${response.status}`;
        console.error(`[cron/sync] Sync failed: ${msg}`);
        return NextResponse.json(
          { success: false, message: msg, details: result },
          { status: 500 },
        );
      }

      totalInserted += result.inserted || 0;
      totalUpdated += result.updated || 0;
      totalSkipped += result.skipped || 0;
      totalDurationMs += result.durationMs || 0;
      hasMore = result.hasMore;
      currentOffset += result.processedInThisChunk || 100;
      lastResult = result;

      if (result.processedInThisChunk === 0) break;
    }

    console.log(
      `[cron/sync] Sync complete – ` +
        `inserted=${totalInserted} updated=${totalUpdated} ` +
        `skipped=${totalSkipped} duration=${totalDurationMs}ms`,
    );

    return NextResponse.json({
      success: true,
      triggeredAt: new Date().toISOString(),
      syncResult: {
        inserted: totalInserted,
        updated: totalUpdated,
        skipped: totalSkipped,
        durationMs: totalDurationMs,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message ?? "Internal error." },
      { status: 500 },
    );
  }
}

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

    const syncUrl = `${appBase}/api/sync-judgments`;

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

    console.log(
      `[cron/sync] Sync complete – ` +
        `inserted=${result.inserted} updated=${result.updated} ` +
        `skipped=${result.skipped} duration=${result.durationMs}ms`,
    );

    return NextResponse.json({
      success: true,
      triggeredAt: new Date().toISOString(),
      syncResult: result,
    });
  } catch (err) {
    console.error("[cron/sync] Unexpected error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message ?? "Internal error." },
      { status: 500 },
    );
  }
}

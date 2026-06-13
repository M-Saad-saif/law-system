import { NextResponse } from "next/server";
import { runExpiryCheck } from "@/lib/subscriptionService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization") ?? "";
    const incoming = authHeader.replace(/^bearer\s+/i, "").trim();
    if (incoming !== cronSecret) {
      console.warn("[cron/expire-subscriptions] Unauthorized – bad secret.");
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }
  }

  try {
    const { expired } = await runExpiryCheck();

    console.log(
      `[cron/expire-subscriptions] ${expired} subscription(s) expired at ${new Date().toISOString()}`,
    );

    return NextResponse.json({
      success: true,
      expiredCount: expired,
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/expire-subscriptions] Error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message ?? "Internal error." },
      { status: 500 },
    );
  }
}

import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";

export const dynamic = "force-dynamic";

// Returns the sourceUrl values the current user has already saved (used by
// the Judgements page to render the "Saved" state), plus an enriched
// `saved` array that also carries the case summary and PDF link so the
// Library UI can render them without a second round-trip.
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const rows = await JudgementLibrary.find({
      userId: user.id,
      sourceUrl: { $exists: true, $ne: "" },
    })
      .select("sourceUrl pdfUrl voiceSummary rawText -_id")
      .lean();

    return apiSuccess({
      // Backwards-compatible: existing callers keep working.
      sourceUrls: rows.map((r) => r.sourceUrl),

      // Enriched entries with summary + PDF link.
      saved: rows.map((r) => ({
        sourceUrl: r.sourceUrl,
        pdfUrl: r.pdfUrl || (isHttpUrl(r.sourceUrl) ? r.sourceUrl : ""),
        summary: r.voiceSummary || r.rawText || "",
      })),
    });
  } catch (error) {
    console.error(error);
    return apiError("Failed to fetch saved judgments.", 500);
  }
});

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}
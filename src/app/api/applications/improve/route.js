/**
 * /api/applications/improve/route.js  (NEW)
 * ─────────────────────────────────────────────────────────────────────────────
 * Dedicated endpoint to AI-improve an existing application's content.
 *
 * POST body:
 *   { applicationId: string }  — improve a saved application (fetches from DB).
 *   { content: string }        — improve arbitrary text inline (no DB write).
 *
 * If `applicationId` is provided:
 *   - Fetches the application, improves its content, persists the result,
 *     and returns the updated application.
 *
 * If only `content` is provided:
 *   - Returns the improved text without touching the DB.
 *   - Useful for previewing AI output before saving.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { improveDraft, checkAIAvailability } from "@/lib/ai/aiService";

export const POST = withAuth(async (request, context, user) => {
  try {
    // ── Check AI availability first ─────────────────────────────────────────
    const availability = await checkAIAvailability();
    if (!availability.available) {
      return apiError(`AI service unavailable: ${availability.reason}`, 503);
    }

    const body = await request.json();
    const { applicationId, content: inlineContent } = body;

    // ── Branch A: Improve a saved application ───────────────────────────────
    if (applicationId) {
      await connectDB();

      const app = await Application.findOne({
        _id: applicationId,
        userId: user.id,
      });

      if (!app) {
        return apiError("Application not found.", 404);
      }

      const contentToImprove = app.content || app.generatedText;

      if (!contentToImprove?.trim()) {
        return apiError(
          "This application has no content to improve. Generate a draft first.",
          422,
        );
      }

      const aiResult = await improveDraft(contentToImprove);

      if (!aiResult.ok) {
        return apiError(`AI improvement failed: ${aiResult.error}`, 502);
      }

      // Persist improved content + mark as AI-enhanced
      const updated = await Application.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            content: aiResult.improvedContent,
            generatedText: aiResult.improvedContent,
            aiEnhanced: true,
            aiEnhancedAt: new Date(),
            version: (app.version || 1) + 1,
          },
        },
        { new: true },
      );

      return apiSuccess({
        application: updated,
        improvedContent: aiResult.improvedContent,
      });
    }

    // ── Branch B: Improve inline content (no DB) ────────────────────────────
    if (inlineContent) {
      const aiResult = await improveDraft(inlineContent);

      if (!aiResult.ok) {
        return apiError(`AI improvement failed: ${aiResult.error}`, 502);
      }

      return apiSuccess({
        improvedContent: aiResult.improvedContent,
      });
    }

    return apiError(
      "Provide either `applicationId` (to improve a saved draft) or `content` (for inline improvement).",
      400,
    );
  } catch (err) {
    console.error("[POST /api/applications/improve]", err);
    return apiError("Failed to process AI improvement request.", 500);
  }
});

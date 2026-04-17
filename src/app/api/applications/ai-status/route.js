/**
 * /api/ai-status/route.js  (NEW)
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight endpoint the frontend calls on load to check whether the AI
 * service is configured. Used to conditionally show/hide "Improve with AI"
 * and "Generate Questions" buttons — no API key = no AI buttons shown.
 *
 * GET /api/ai-status
 * Response: { available: boolean, reason?: string }
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { withAuth, apiSuccess } from "@/lib/api";
import { checkAIAvailability } from "@/lib/ai/aiService";

export const GET = withAuth(async () => {
  const status = await checkAIAvailability();
  // Always return 200 — the frontend decides what to do with available: false
  return apiSuccess(status);
});


import { withAuth, apiSuccess, apiError } from "@/lib/api";
import {
  generateCrossQuestions,
  checkAIAvailability,
} from "@/lib/ai/aiService";

export const POST = withAuth(async (request, context, user) => {
  try {
    const availability = await checkAIAvailability();
    if (!availability.available) {
      return apiError(`AI service unavailable: ${availability.reason}`, 503);
    }

    const body = await request.json();
    const {
      facts,
      witnessType = "prosecution witness",
      caseType = "criminal",
    } = body;

    if (!facts?.trim()) {
      return apiError(
        "Please provide case facts or witness statement to generate questions from.",
        400,
      );
    }

    const result = await generateCrossQuestions(facts, {
      witnessType,
      caseType,
    });

    if (!result.ok) {
      return apiError(`Question generation failed: ${result.error}`, 502);
    }

    return apiSuccess({ questions: result.questions });
  } catch (err) {
    console.error("[POST /api/applications/generate-cross-questions]", err);
    return apiError("Failed to generate cross-examination questions.", 500);
  }
});

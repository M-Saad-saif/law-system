import { withAuth, apiSuccess, apiError } from "@/lib/api";
import { extractJudgement } from "@/lib/ai/aiService";
import JudgementLibrary from "@/models/Judgementlibrary";
import connectDB from "@/lib/db";

export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json();
    const { rawText } = body;

    if (!rawText?.trim()) {
      return apiError("No text provided.", 400);
    }

    const result = await extractJudgement(rawText);

    if (!result.ok) {
      return apiError(result.error || "Extraction failed.", 500);
    }

    return apiSuccess({ extracted: result.extracted });
  } catch (err) {
    console.error("[judgement-extractor] POST error:", err);
    return apiError("Extraction failed.", 500);
  }
});

// Save extracted judgement to library
export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();

    const entry = await JudgementLibrary.create({
      userId: user.id,
      citation: body.citation || "",
      title: body.title || "Untitled Judgement",
      courtName: body.courtName || "",
      offenceName: body.offenceName || "",
      lawsDiscussed: body.lawsDiscussed || "",
      crossExaminationQuestions: body.crossExaminationQuestions || "",
      courtExaminationOfEvidence: body.courtExaminationOfEvidence || "",
      finalDecision: body.finalDecision || "",
      voiceSummary: body.voiceSummary || "",
      rawText: body.rawText || "",
      tags: body.tags || [],
      isMostImportant: body.isMostImportant || false,
    });

    return apiSuccess({ entry }, 201);
  } catch (err) {
    console.error("[judgement-extractor] PUT error:", err);
    return apiError("Failed to save to library.", 500);
  }
});

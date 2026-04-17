/**
 * /api/cross-exams/route.js  (UPDATED)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from original:
 *  - POST now accepts optional `aiGeneratedQuestions` string.
 *    When provided, it is stored in the CrossExamination document so the
 *    UI can display it and lawyers can convert questions to formal QA pairs.
 *  - All original GET + POST behaviour is preserved.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import Case from "@/models/Case";

// ─── GET /api/cross-exams ─────────────────────────────────────────────────────
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";

    const query = { userId: user.id };
    if (status) query.status = status;

    const total = await CrossExamination.countDocuments(query);
    const exams = await CrossExamination.find(query)
      .populate("caseId", "caseTitle caseNumber")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return apiSuccess({
      exams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return apiError("Failed to fetch cross-examinations.", 500);
  }
});

// ─── POST /api/cross-exams ────────────────────────────────────────────────────
export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { title, caseId, hearingDate, aiGeneratedQuestions } = body;

    if (!title?.trim()) {
      return apiError("Title is required.", 400);
    }

    // Validate and fetch linked case
    let linkedCase = null;
    if (caseId) {
      linkedCase = await Case.findOne({ _id: caseId, userId: user.id }).lean();
      if (!linkedCase) {
        return apiError("Case not found or access denied.", 404);
      }
    }

    const examData = {
      userId: user.id,
      title: title.trim(),
      status: "draft",
      caseId: caseId || undefined,
      hearingDate: hearingDate || undefined,
    };

    // Store AI questions as a top-level field for display in the exam editor.
    // These are raw text; the lawyer will convert them to WitnessSection QA pairs.
    if (aiGeneratedQuestions?.trim()) {
      examData.aiGeneratedQuestions = aiGeneratedQuestions.trim();
    }

    const exam = await CrossExamination.create(examData);

    return apiSuccess({ exam }, 201);
  } catch (err) {
    console.error("[POST /api/cross-exams]", err);
    return apiError(err.message || "Failed to create cross-examination.", 500);
  }
});

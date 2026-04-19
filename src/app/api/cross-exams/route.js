import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import Case from "@/models/Case";

// --- GET /api/cross-exams ---
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get("page")  || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";

    const isSenior = user.seniority === "senior" || user.role === "admin";

    let query;
    if (isSenior) {
      // Senior lawyers see: their own drafts, anything submitted/in-review/etc,
      // and anything explicitly assigned to them.
      if (status) {
        query = { status };
      } else {
        query = {
          $or: [
            { userId: user.id },
            { assignedTo: user.id },
            {
              status: {
                $in: [
                  "submitted",
                  "in_review",
                  "changes_requested",
                  "approved",
                  "courtroom_active",
                  "archived",
                ],
              },
            },
          ],
        };
      }
    } else {
      // Junior lawyers only see their own exams
      query = { userId: user.id };
      if (status) query.status = status;
    }

    const total = await CrossExamination.countDocuments(query);
    const exams = await CrossExamination.find(query)
      .populate("caseId",    "caseTitle caseNumber")
      .populate("userId",    "name email")
      .populate("assignedTo","name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Return plain JSON (no apiSuccess wrapper) so the page can read
    // data.exams / data.total / data.pagination directly.
    return NextResponse.json({
      exams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      pagination: { total, pages: Math.ceil(total / limit), page },
    });
  } catch (err) {
    console.error("[GET /api/cross-exams]", err);
    return NextResponse.json(
      { error: "Failed to fetch cross-examinations." },
      { status: 500 },
    );
  }
});

// ─── POST /api/cross-exams ────────────────────────────────────────────────────
export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { title, caseId, hearingDate, aiGeneratedQuestions } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (caseId) {
      const linkedCase = await Case.findOne({ _id: caseId, userId: user.id }).lean();
      if (!linkedCase) {
        return NextResponse.json(
          { error: "Case not found or access denied." },
          { status: 404 },
        );
      }
    }

    const examData = {
      userId:      user.id,
      title:       title.trim(),
      status:      "draft",
      caseId:      caseId      || undefined,
      hearingDate: hearingDate || undefined,
    };

    if (aiGeneratedQuestions?.trim()) {
      examData.aiGeneratedQuestions = aiGeneratedQuestions.trim();
    }

    const exam = await CrossExamination.create(examData);

    return NextResponse.json({ exam }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/cross-exams]", err);
    return NextResponse.json(
      { error: err.message || "Failed to create cross-examination." },
      { status: 500 },
    );
  }
});

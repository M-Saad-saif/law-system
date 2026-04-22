import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgmentAlert from "@/models/JudgmentAlert";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const court = searchParams.get("court") || "";
    const caseType = searchParams.get("caseType") || "";
    const outcome = searchParams.get("outcome") || "";
    const section = searchParams.get("section") || "";
    const year = searchParams.get("year") || "";
    const importance = searchParams.get("importance") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { headnote: { $regex: search, $options: "i" } },
        { judgeName: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }
    if (court) query.court = court;
    if (caseType) query.caseType = caseType;
    if (outcome) query.outcome = outcome;
    if (importance) query.importance = importance;
    if (section) query.ppcSections = section;

    if (year) {
      const y = parseInt(year);
      query.decisionDate = {
        $gte: new Date(`${y}-01-01`),
        $lte: new Date(`${y}-12-31`),
      };
    }

    const total = await JudgmentAlert.countDocuments(query);
    const results = await JudgmentAlert.find(query)
      .sort({ importance: 1, decisionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Map importance to sort value for High > Medium > Low
    const importanceOrder = { High: 0, Medium: 1, Low: 2 };
    results.sort(
      (a, b) =>
        (importanceOrder[a.importance] ?? 1) -
        (importanceOrder[b.importance] ?? 1),
    );

    return apiSuccess({
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[judgement-search]", err);
    return apiError("Search failed.", 500);
  }
});

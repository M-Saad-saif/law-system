import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const courtName = searchParams.get("courtName") || "";
    const isMostImportant = searchParams.get("isMostImportant") || "";
    const isFavourite = searchParams.get("isFavourite") || "";

    const query = { userId: user.id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { citation: { $regex: search, $options: "i" } },
        { offenceName: { $regex: search, $options: "i" } },
        { courtName: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }
    if (tag) query.tags = tag;
    if (courtName) query.courtName = { $regex: courtName, $options: "i" };
    if (isMostImportant === "true") query.isMostImportant = true;
    if (isFavourite === "true") query.isFavourite = true;

    const total = await JudgementLibrary.countDocuments(query);
    const entries = await JudgementLibrary.find(query)
      .sort({ isMostImportant: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-rawText -notes");

    // Distinct tags for filter sidebar
    const allTags = await JudgementLibrary.distinct("tags", {
      userId: user.id,
    });

    return apiSuccess({
      entries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      tags: allTags,
    });
  } catch (error) {
    console.error(error);
    return apiError("Failed to fetch library.", 500);
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const entry = await JudgementLibrary.create({ ...body, userId: user.id });
    return apiSuccess({ entry }, 201);
  } catch (error) {
    console.error(error);
    return apiError("Failed to save to library.", 500);
  }
});

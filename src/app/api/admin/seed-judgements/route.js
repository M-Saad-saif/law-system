import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import { seedIntelligenceFeed } from "@/app/api/seed/intelligence-seed-snippet";

// POST: re-seed just the JudgmentAlert collection (admin only)
export const POST = withAuth(async (request, context, user) => {
  if (user.role !== "admin") return apiError("Forbidden.", 403);
  try {
    await connectDB();
    await seedIntelligenceFeed();
    return apiSuccess({ message: "Judgement alerts seeded successfully." });
  } catch (err) {
    console.error("[admin/seed-judgements]", err);
    return apiError("Seeding failed.", 500);
  }
});

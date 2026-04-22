import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";
import User from "@/models/User";
import crypto from "crypto";

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { entryId } = await request.json();

    if (!entryId) return apiError("entryId is required.", 400);

    const entry = await JudgementLibrary.findOne({
      _id: entryId,
      userId: user.id,
    });
    if (!entry) return apiError("Entry not found.", 404);

    // Generate a share token if not already present
    if (!entry.shareToken) {
      entry.shareToken = crypto.randomBytes(16).toString("hex");
      await entry.save();
    }

    const shareUrl = `/library/shared/${entry.shareToken}`;

    return apiSuccess({ shareToken: entry.shareToken, shareUrl });
  } catch (err) {
    console.error("[library/share] POST:", err);
    return apiError("Failed to create share link.", 500);
  }
});

// GET shared entry by token (public)
export const GET = async (request) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) return apiError("Token required.", 400);

    const entry = await JudgementLibrary.findOne({ shareToken: token })
      .select("-notes -rawText -userId")
      .lean();

    if (!entry) return apiError("Share link not found or expired.", 404);

    return apiSuccess({ entry });
  } catch (err) {
    return apiError("Failed to fetch shared entry.", 500);
  }
};

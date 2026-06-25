import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PUT /api/auth/welcome-seen
export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const updated = await User.findByIdAndUpdate(
      user.id,
      { $set: { hasSeenWelcome: true } },
      { new: true },
    ).lean();

    if (!updated) {
      return apiError("User not found.", 404);
    }

    return apiSuccess({ hasSeenWelcome: updated.hasSeenWelcome });
  } catch (err) {
    return apiError("Failed to update welcome status.", 500);
  }
});

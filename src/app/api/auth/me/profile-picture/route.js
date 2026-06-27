// PATCH /api/auth/me/profile-picture

import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    const { profilePicture } = await request.json();

    if (!profilePicture || typeof profilePicture !== "string") {
      return apiError("A valid profile picture URL is required.", 400);
    }

    //allwoing  cloudinary URLs for security
    if (!profilePicture.startsWith("https://res.cloudinary.com/")) {
      return apiError("Invalid image URL.", 400);
    }

    const updated = await User.findByIdAndUpdate(
      user.id,
      { $set: { profilePicture } },
      { new: true, select: "-password" },
    );

    return apiSuccess({ user: updated });
  } catch (err) {
    return apiError("Failed to update profile picture.", 500);
  }
});

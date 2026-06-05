import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PUT /api/auth/change-password
// Allows any authenticated user to change their own password.
export const PUT = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return apiError("Current password and new password are required.", 400);
    }

    if (newPassword.length < 6) {
      return apiError("New password must be at least 6 characters.", 400);
    }

    const dbUser = await User.findById(user.id).select("+password");
    if (!dbUser) {
      return apiError("User not found.", 404);
    }

    const isMatch = await dbUser.comparePassword(currentPassword);
    if (!isMatch) {
      return apiError("Current password is incorrect.", 401);
    }

    dbUser.password = newPassword;
    await dbUser.save();

    return apiSuccess({ message: "Password changed successfully." });
  } catch (err) {
    console.error("[auth/change-password] PUT:", err);
    return apiError("Failed to change password.", 500);
  }
});

import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PATCH: update a user (role, seniority, isActive)
export const PATCH = withAuth(async (request, { params }, user) => {
  if (user.role !== "admin") return apiError("Forbidden.", 403);
  try {
    await connectDB();
    const body = await request.json();
    const allowed = [
      "name",
      "role",
      "seniority",
      "isActive",
      "phone",
      "barCouncilNo",
    ];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    const updated = await User.findByIdAndUpdate(params.id, update, {
      new: true,
    }).select("-password");
    if (!updated) return apiError("User not found.", 404);
    return apiSuccess({ user: updated });
  } catch (err) {
    console.error("[admin/users/id] PATCH:", err);
    return apiError("Failed to update user.", 500);
  }
});

// DELETE: deactivate (soft delete)
export const DELETE = withAuth(async (request, { params }, user) => {
  if (user.role !== "admin") return apiError("Forbidden.", 403);
  if (params.id === user.id)
    return apiError("Cannot deactivate yourself.", 400);
  try {
    await connectDB();
    await User.findByIdAndUpdate(params.id, { isActive: false });
    return apiSuccess({ message: "User deactivated." });
  } catch (err) {
    return apiError("Failed to deactivate user.", 500);
  }
});

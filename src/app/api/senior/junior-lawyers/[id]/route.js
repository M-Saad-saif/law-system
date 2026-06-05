import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PATCH /api/senior/junior-lawyers/[id]
//only Senior lawyer can update their own junior's name / isActive status.
export const PATCH = withAuth(async (request, { params }, user) => {
  if (user.seniority !== "senior" && user.role !== "admin") {
    return apiError("Forbidden. Senior lawyers only.", 403);
  }

  try {
    await connectDB();

    // verifying if the junior belongs to that senior or not
    const junior = await User.findOne({
      _id: params.id,
      seniority: "junior",
      createdBy: user.id,
    });

    if (!junior && user.role !== "admin") {
      return apiError(
        "Junior lawyer not found or not under your supervision.",
        404,
      );
    }

    const body = await request.json();
    const allowed = ["name", "isActive"];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    const updated = await User.findByIdAndUpdate(params.id, update, {
      new: true,
    }).select("-password");
    return apiSuccess({ user: updated });
  } catch (err) {
    console.error("[senior/junior-lawyers/id] PATCH:", err);
    return apiError("Failed to update junior lawyer.", 500);
  }
});

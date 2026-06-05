import { withRole, withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET /api/senior/junior-lawyers
// Returns junior lawyers created by the currently logged-in senior lawyer.
export const GET = withAuth(async (request, context, user) => {
  if (user.seniority !== "senior" && user.role !== "admin") {
    return apiError("Forbidden. Senior lawyers only.", 403);
  }

  try {
    await connectDB();
    const juniors = await User.find({
      seniority: "junior",
      createdBy: user.id,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return apiSuccess({ juniors, total: juniors.length });
  } catch (err) {
    console.error("[senior/junior-lawyers] GET:", err);
    return apiError("Failed to fetch junior lawyers.", 500);
  }
});

// POST /api/senior/junior-lawyers
// Senior lawyer creates a new junior lawyer account.
export const POST = withAuth(async (request, context, user) => {
  if (user.seniority !== "senior" && user.role !== "admin") {
    return apiError(
      "Forbidden. Only senior lawyers can create junior accounts.",
      403,
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return apiError("Name, email, and password are required.", 400);
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters.", 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return apiError("An account with this email already exists.", 409);
    }

    const junior = await User.create({
      name,
      email,
      password,
      role: "lawyer",
      seniority: "junior",
      createdBy: user.id,
    });

    return apiSuccess({ user: junior }, 201);
  } catch (err) {
    console.error("[senior/junior-lawyers] POST:", err);
    return apiError("Failed to create junior lawyer.", 500);
  }
});

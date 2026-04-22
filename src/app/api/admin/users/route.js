import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

// GET: list all users (admin only)
export const GET = withAuth(async (request, context, user) => {
  if (user.role !== "admin") return apiError("Forbidden.", 403);
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    return apiSuccess({ users, total: users.length });
  } catch (err) {
    console.error("[admin/users] GET:", err);
    return apiError("Failed to fetch users.", 500);
  }
});

// POST: create a new user (admin only)
export const POST = withAuth(async (request, context, user) => {
  if (user.role !== "admin") return apiError("Forbidden.", 403);
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, role, seniority } = body;

    if (!name || !email || !password) {
      return apiError("Name, email, and password are required.", 400);
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return apiError("Email already in use.", 409);

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      seniority,
    });
    const { password: _, ...safe } = newUser.toObject();
    return apiSuccess({ user: safe }, 201);
  } catch (err) {
    console.error("[admin/users] POST:", err);
    return apiError("Failed to create user.", 500);
  }
});

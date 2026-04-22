import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const seniority = searchParams.get("seniority") || "";
    const role = searchParams.get("role") || "";

    const query = { isActive: true };
    if (seniority) query.seniority = seniority;
    if (role) {
      query.role = { $in: role.split(",") };
    }   

    const users = await User.find(query)
      .select("name email role seniority")
      .sort({ name: 1 })
      .lean();

    return apiSuccess({ users });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return apiError("Failed to fetch users.", 500);
  }
});

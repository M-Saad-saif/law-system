import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { withAuth, apiError } from "@/lib/api";

export const GET = withAuth(async (request, context, tokenUser) => {
  try {
    if (tokenUser.role !== "admin") {
      return apiError("Forbidden. Admin access required.", 403);
    }

    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "20")),
    );
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { barCouncilNo: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const roleFilter = { role: { $in: ["lawyer", "associate"] } };
    const filter = { ...roleFilter, ...searchFilter };

    const [totalUsers, seniors, juniors, allUsers] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments({
        ...roleFilter,
        seniority: "senior",
        ...searchFilter,
      }),
      User.countDocuments({
        ...roleFilter,
        seniority: "junior",
        ...searchFilter,
      }),
      User.find(filter)
        .populate("createdBy", "name email seniority")
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const seniorMap = {};
    const orphanJuniors = [];

    allUsers.forEach((u) => {
      if (u.seniority === "senior") {
        if (!seniorMap[u._id.toString()]) {
          seniorMap[u._id.toString()] = { senior: u, juniors: [] };
        } else {
          seniorMap[u._id.toString()].senior = u;
        }
      }
    });

    allUsers.forEach((u) => {
      if (u.seniority === "junior") {
        const parentId = u.createdBy?._id?.toString();
        if (parentId && seniorMap[parentId]) {
          seniorMap[parentId].juniors.push(u);
        } else {
          orphanJuniors.push(u);
        }
      }
    });

    const hierarchy = Object.values(seniorMap);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: totalUsers,
          seniors,
          juniors,
        },
        hierarchy,
        orphanJuniors,
        users: allUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users." },
      { status: 500 },
    );
  }
});

export const PATCH = withAuth(async (request, context, tokenUser) => {
  try {
    if (tokenUser.role !== "admin") {
      return apiError("Forbidden. Admin access required.", 403);
    }

    await connectDB();

    const { userId, isActive } = await request.json();
    if (!userId) return apiError("User ID is required.", 400);

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: Boolean(isActive) } },
      { new: true },
    ).select("-password");

    if (!updated) return apiError("User not found.", 404);

    return NextResponse.json({
      success: true,
      data: { user: updated },
      message: `User ${isActive ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error) {
    console.error("Admin users patch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user." },
      { status: 500 },
    );
  }
});

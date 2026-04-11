import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";

export const GET = withAuth(async (req, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let query = {};

    if (user.role === "senior" || user.role === "admin") {
      if (status === "draft") {
        query = {
          $or: [
            { createdBy: user.id, status: "draft" },
            {
              status: {
                $in: ["submitted", "in_review", "approved", "rejected"],
              },
            },
          ],
        };
      } else {
        query = {
          $or: [
            { createdBy: user.id, status: "draft" },
            { status: { $ne: "draft" } },
          ],
        };
      }
    } else if (user.role === "junior") {
      query = { createdBy: user.id };
    } else {
      query = { createdBy: user.id };
    }

    if (status) {
      if (user.role === "senior" || user.role === "admin") {
        query.status = status;
      } else {
        query = { createdBy: user.id, status };
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        ...(user.role === "senior" || user.role === "admin"
          ? [{ "createdBy.name": { $regex: search, $options: "i" } }]
          : []),
      ];
    }

    const total = await CrossExamination.countDocuments(query);
    const exams = await CrossExamination.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("caseId", "caseTitle caseNumber")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      exams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      userRole: user.role, // Include role in response for UI to adjust display
    });
  } catch (error) {
    console.error("Failed to fetch cross-exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cross-exams." },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (req, context, user) => {
  try {
    await connectDB();
    const body = await req.json();

    // Auto-assign status based on role?
    // Juniors create drafts, Seniors can create directly as submitted?
    let initialStatus = "draft";
    if (user.role === "senior" || user.role === "admin") {
      // Seniors/admins might want to create exams directly as 'in_review' or 'approved'
      initialStatus = body.status || "draft";
    }

    const newExam = await CrossExamination.create({
      ...body,
      createdBy: user.id,
      status: initialStatus,
    });

    await newExam.populate("createdBy", "name email role");

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error("Failed to create cross-exam:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create cross-exam." },
      { status: 500 },
    );
  }
});

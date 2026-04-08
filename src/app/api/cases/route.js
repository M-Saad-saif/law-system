import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { withAuth } from "@/lib/api";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const caseType = searchParams.get("caseType") || "";

    const query = { userId: user.id };
    if (status) query.status = status;
    if (caseType) query.caseType = caseType;
    if (search) {
      query.$or = [
        { caseTitle: { $regex: search, $options: "i" } },
        { caseNumber: { $regex: search, $options: "i" } },
        { suitNo: { $regex: search, $options: "i" } },
        { firNo: { $regex: search, $options: "i" } },
        { courtName: { $regex: search, $options: "i" } },
        { clientName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-proceedings -citations -documents -notes");

    return NextResponse.json({
      success: true,
      data: { cases, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch cases." },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const newCase = await Case.create({ ...body, userId: user.id });
    return NextResponse.json(
      { success: true, data: { case: newCase } },
      { status: 201 },
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { success: false, message: messages },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to create case." },
      { status: 500 },
    );
  }
});

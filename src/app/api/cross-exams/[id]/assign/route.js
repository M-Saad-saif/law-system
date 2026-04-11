import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import { logActivity } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  if (!["submitted", "in_review"].includes(exam.status)) {
    return NextResponse.json(
      {
        error:
          "Can only assign a reviewer to submitted or in-review documents.",
      },
      { status: 409 },
    );
  }

  const { assignedTo } = await req.json();
  if (!assignedTo) {
    return NextResponse.json(
      { error: "assignedTo (userId) is required." },
      { status: 400 },
    );
  }

  const prevAssigned = exam.assignedTo;
  exam.assignedTo = assignedTo;
  await exam.save();

  await logActivity({
    crossExamId: exam._id,
    action: "assigned",
    performedBy: user.id,
    before: { assignedTo: prevAssigned },
    after: { assignedTo },
    message: `Document assigned to reviewer.`,
  });

  return NextResponse.json({ success: true, exam });
});

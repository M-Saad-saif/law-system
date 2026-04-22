import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import User from "@/models/User";
import { applyTransition } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam) {
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  }

  const creatorId = exam.userId?.toString();
  if (!creatorId || creatorId !== user.id.toString()) {
    return NextResponse.json(
      { error: "Only the creator can resubmit." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const assignedTo = body.assignedTo;

  if (assignedTo !== undefined) {
    if (!assignedTo) {
      exam.assignedTo = undefined;
    } else {
      const reviewer = await User.findOne({
        _id: assignedTo,
        isActive: true,
        $or: [{ seniority: "senior" }, { role: "admin" }],
      }).select("_id");

      if (!reviewer) {
        return NextResponse.json(
          { error: "Selected reviewer must be an active senior lawyer." },
          { status: 400 },
        );
      }

      exam.assignedTo = reviewer._id;
    }
  }

  exam.revisionNote = "";

  const result = await applyTransition({
    exam,
    action: "resubmit",
    userId: user.id,
    message: body.message || `Resubmitted (v${exam.version}).`,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({ success: true, exam: result.exam });
});

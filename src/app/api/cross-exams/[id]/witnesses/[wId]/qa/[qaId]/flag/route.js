

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { logActivity } from "@/lib/crossExamWorkflow";

export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id);
  if (!exam)
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );
  if (exam.isLocked)
    return NextResponse.json({ error: "Document is locked." }, { status: 403 });

  // Only a senior reviewer or the assigned reviewer
  const userId = (user.id || user._id || user.userId || "").toString();
  const userRole = user.role || "";
  const userSeniority = user.seniority || "";
  const isSenior = userSeniority === "senior" || userRole === "senior" || userRole === "admin";
  const isAssignedReviewer = exam.assignedTo && exam.assignedTo.toString() === userId;
  if (!isAssignedReviewer && !isSenior) {
    return NextResponse.json(
      { error: "Only a senior reviewer can flag or approve QA pairs." },
      { status: 403 },
    );
  }

  const witness = await WitnessSection.findOne({
    _id: params.wId,
    crossExamId: params.id,
  });
  if (!witness)
    return NextResponse.json({ error: "Witness not found." }, { status: 404 });

  const qaPair = witness.qaPairs.id(params.qaId);
  if (!qaPair)
    return NextResponse.json({ error: "QA pair not found." }, { status: 404 });

  const body = await req.json();
  const before = {
    reviewStatus: qaPair.reviewStatus,
    isFlagged: qaPair.isFlagged,
    isApproved: qaPair.isApproved,
  };

  // `reviewStatus` is the source of truth. Keep supporting legacy boolean
  // payloads from the current UI so old clients continue to work.
  const hasLegacyFlag = body.isFlagged !== undefined;
  const hasLegacyApprove = body.isApproved !== undefined;
  const hasStatusUpdate = body.reviewStatus !== undefined;

  if (hasLegacyFlag && hasLegacyApprove) {
    const wantsFlag = Boolean(body.isFlagged);
    const wantsApprove = Boolean(body.isApproved);
    if (wantsFlag && wantsApprove) {
      return NextResponse.json(
        { error: "QA pair cannot be both flagged and approved." },
        { status: 400 },
      );
    }
  }

  if (hasStatusUpdate) {
    const allowed = ["pending", "approved", "needsRevision", "risky", "withdrawn"];
    if (!allowed.includes(body.reviewStatus)) {
      return NextResponse.json(
        { error: "Invalid review status." },
        { status: 400 },
      );
    }
    qaPair.reviewStatus = body.reviewStatus;
  }

  if (hasLegacyFlag) {
    const wantsFlag = Boolean(body.isFlagged);
    if (wantsFlag) {
      qaPair.reviewStatus = "risky";
    } else if (qaPair.reviewStatus === "risky") {
      qaPair.reviewStatus = "pending";
    }
  }

  if (hasLegacyApprove) {
    const wantsApprove = Boolean(body.isApproved);
    if (wantsApprove) {
      qaPair.reviewStatus = "approved";
    } else if (qaPair.reviewStatus === "approved") {
      qaPair.reviewStatus = "pending";
    }
  }

  await witness.save();

  const action = qaPair.isApproved
    ? "qa_approved"
    : qaPair.isFlagged
      ? "flagged"
      : "unflagged";

  await logActivity({
    crossExamId: exam._id,
    action,
    performedBy: user.id,
    before,
    after: {
      reviewStatus: qaPair.reviewStatus,
      isFlagged: qaPair.isFlagged,
      isApproved: qaPair.isApproved,
    },
    message: `QA pair #${qaPair.sequence} ${action.replace("_", " ")}.`,
  });

  return NextResponse.json({ qaPair });
});

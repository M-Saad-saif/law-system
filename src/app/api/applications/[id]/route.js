import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import User from "@/models/User";

// ---- GET /api/applications/[id] ----
export const GET = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const isSenior = user.seniority === "senior" || user.role === "admin";

    const juniorIds = isSenior
      ? await User.find({ seniority: "junior", createdBy: user.id }).distinct("_id")
      : [];

    const query = isSenior
      ? {
          _id: params.id,
          $or: [
            { assignedTo: user.id },
            { userId: user.id },
            { userId: { $in: juniorIds } },
          ],
        }
      : { _id: params.id, userId: user.id };

    const app = await Application.findOne(query)
      .populate("caseId", "caseTitle caseNumber courtName clientName")
      .populate("reviewedBy", "name email")
      .populate("assignedTo", "name email");

    if (!app) return apiError("Application not found.", 404);
    return apiSuccess({ application: app });
  } catch {
    return apiError("Failed to fetch application.", 500);
  }
});

// ---- PUT /api/applications/[id] ----
export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { action, ...updateData } = body;

    const isSenior = user.seniority === "senior" || user.role === "admin";

    let existing;
    if (action === "submitForReview") {
      // Junior submitting their own draft
      existing = await Application.findOne({ _id: params.id, userId: user.id });
    } else if (isSenior) {
      const juniorIds = await User.find({ seniority: "junior", createdBy: user.id }).distinct("_id");
      existing = await Application.findOne({
        _id: params.id,
        $or: [
          { assignedTo: user.id },
          { userId: user.id },
          { userId: { $in: juniorIds } },
        ],
      });
    } else {
      // Junior editing their own draft
      existing = await Application.findOne({ _id: params.id, userId: user.id });
    }

    if (!existing) return apiError("Application not found.", 404);

    if ((action === "approve" || action === "requestChanges") && !isSenior) {
      return apiError("Only senior lawyers can perform this action.", 403);
    }

    const patch = { ...updateData };

    // -- Status action: submitForReview --
    if (action === "submitForReview") {
      if (!["draft", "generated"].includes(existing.status)) {
        return apiError(
          `Cannot submit: application is in status "${existing.status}".`,
          409,
        );
      }
      
      if (!existing.assignedTo) {
        const juniorRecord = await User.findById(user.id).select("createdBy").lean();
        if (juniorRecord?.createdBy) {
          patch.assignedTo = juniorRecord.createdBy;
        } else {
          return apiError(
            "Your account is not linked to a senior lawyer. Please contact your administrator.",
            422,
          );
        }
      }

      patch.status = "review";
    }

    // ---- Status action: approve (senior lawyer) ----
    if (action === "approve") {
      if (existing.status !== "review") {
        return apiError(
          `Cannot approve: application must be in "review" status.`,
          409,
        );
      }
      patch.status     = "approved";
      patch.reviewedBy = user.id;
      patch.reviewedAt = new Date();
    }

    // ---- Status action: requestChanges (senior lawyer) ----
    if (action === "requestChanges") {
      if (existing.status !== "review") {
        return apiError(
          `Cannot request changes: application must be in "review" status.`,
          409,
        );
      }
      patch.status = "generated";
      if (body.reviewNote) patch.reviewNote = body.reviewNote;
    }

    if (patch.content !== undefined) {
      patch.generatedText = patch.content;
      patch.version       = (existing.version || 1) + 1;
    } else if (patch.generatedText !== undefined) {
      patch.content = patch.generatedText;
      patch.version = (existing.version || 1) + 1;
    }

    const app = await Application.findByIdAndUpdate(
      params.id,
      { $set: patch },
      { new: true },
    );

    return apiSuccess({ application: app });
  } catch (err) {
    console.error("[PUT /api/applications/[id]]", err);
    return apiError("Failed to update application.", 500);
  }
});

// --- DELETE /api/applications/[id] ---
export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const app = await Application.findOneAndDelete({
      _id:    params.id,
      userId: user.id,
    });
    if (!app) return apiError("Application not found.", 404);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete application.", 500);
  }
});
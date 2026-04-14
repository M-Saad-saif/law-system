import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Application from "@/models/Application";

export const GET = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const app = await Application.findOne({
      _id: params.id,
      userId: user.id,
    }).populate("caseId", "caseTitle caseNumber courtName clientName");
    if (!app) return apiError("Application not found.", 404);
    return apiSuccess({ application: app });
  } catch {
    return apiError("Failed to fetch application.", 500);
  }
});

export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const app = await Application.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: body },
      { new: true },
    );
    if (!app) return apiError("Application not found.", 404);
    return apiSuccess({ application: app });
  } catch {
    return apiError("Failed to update application.", 500);
  }
});

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const app = await Application.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });
    if (!app) return apiError("Application not found.", 404);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete application.", 500);
  }
});

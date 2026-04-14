import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";

export const GET = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const entry = await JudgementLibrary.findOne({
      _id: params.id,
      userId: user.id,
    });
    if (!entry) return apiError("Entry not found.", 404);
    return apiSuccess({ entry });
  } catch {
    return apiError("Failed to fetch entry.", 500);
  }
});

export const PUT = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const body = await request.json();
    const entry = await JudgementLibrary.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: body },
      { new: true, runValidators: true },
    );
    if (!entry) return apiError("Entry not found.", 404);
    return apiSuccess({ entry });
  } catch {
    return apiError("Failed to update entry.", 500);
  }
});

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const entry = await JudgementLibrary.findOneAndDelete({
      _id: params.id,
      userId: user.id,
    });
    if (!entry) return apiError("Entry not found.", 404);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError("Failed to delete entry.", 500);
  }
});

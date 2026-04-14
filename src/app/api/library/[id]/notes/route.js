import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import JudgementLibrary from "@/models/Judgementlibrary";

// POST  /api/library/:id/notes  — add a note
export const POST = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const { content } = await request.json();
    if (!content?.trim()) return apiError("Note content required.", 400);

    const entry = await JudgementLibrary.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $push: { notes: { content: content.trim() } } },
      { new: true },
    );
    if (!entry) return apiError("Entry not found.", 404);
    return apiSuccess({ notes: entry.notes });
  } catch {
    return apiError("Failed to add note.", 500);
  }
});

// DELETE  /api/library/:id/notes?noteId=xxx  — delete a note
export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");
    if (!noteId) return apiError("noteId required.", 400);

    const entry = await JudgementLibrary.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $pull: { notes: { _id: noteId } } },
      { new: true },
    );
    if (!entry) return apiError("Entry not found.", 404);
    return apiSuccess({ notes: entry.notes });
  } catch {
    return apiError("Failed to delete note.", 500);
  }
});

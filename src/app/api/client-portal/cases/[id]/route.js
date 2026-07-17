import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import CalendarEvent from "@/models/CalendarEvent";
import { withClientAuth } from "@/lib/clientAuth";

// GET /api/client-portal/cases/[id]
export const GET = withClientAuth(async (request, { params }, client) => {
  try {
    await connectDB();

    const caseDoc = await Case.findOne({
      _id: params.id,
      client: client.id,
      isSharedWithClient: true,
    }).lean();

    if (!caseDoc) {
      return NextResponse.json(
        { success: false, message: "Case not found." },
        { status: 404 },
      );
    }

    const sharedDocuments = (caseDoc.documents || []).filter(
      (d) => d.sharedWithClient,
    );

    const upcomingEvents = await CalendarEvent.find({
      linkedCase: caseDoc._id,
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })
      .sort({ date: 1 })
      .select("title date time type notes")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        case: {
          ...caseDoc,
          documents: sharedDocuments,
          notes: undefined, // internal firm notes stay internal
          citations: undefined,
        },
        upcomingEvents,
      },
    });
  } catch (error) {
    console.error("[client-portal/cases/id] GET:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch case." },
      { status: 500 },
    );
  }
});

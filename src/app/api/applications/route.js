import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import Case from "@/models/Case";

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "";

    const query = { userId: user.id };
    if (type) query.applicationType = type;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate("caseId", "caseTitle caseNumber courtName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return apiSuccess({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return apiError("Failed to fetch applications.", 500);
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const body = await request.json();

    // If caseId provided, auto-fill fields from the case
    let caseData = {};
    if (body.caseId) {
      const foundCase = await Case.findOne({
        _id: body.caseId,
        userId: user.id,
      });
      if (foundCase) {
        caseData = {
          caseTitle: foundCase.caseTitle,
          caseNumber: foundCase.caseNumber || foundCase.suitNo,
          firNo: foundCase.firNo,
          courtName: foundCase.courtName,
          courtType: foundCase.courtType,
          ppcSections: foundCase.provisions || [],
          judgeName: foundCase.judgeName,
          applicantName: foundCase.clientName,
        };
      }
    }

    const application = await Application.create({
      ...caseData,
      ...body,
      userId: user.id,
    });

    return apiSuccess({ application }, 201);
  } catch (error) {
    return apiError(error.message || "Failed to create application.", 500);
  }
});

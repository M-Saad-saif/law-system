import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import Client from "@/models/Client";
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import { resolveChamberOwnerId } from "@/lib/chamberScope";
import { getChamberForUser } from "@/lib/subscriptionService";

function isPartnerOrAdmin(user) {
  return user.seniority === "senior" || user.seniority === "junior";
}

async function findAccessibleCase(caseId, user) {
  const ownerId = await resolveChamberOwnerId(user);
  const candidateIds = [user.id];

  if (ownerId && ownerId !== user.id) {
    candidateIds.push(ownerId);
  }

  return Case.findOne({
    _id: caseId,
    $or: [{ userId: { $in: candidateIds } }, { createdBy: { $in: candidateIds } }],
  });
}

export const POST = withAuth(async (request, { params }, user) => {
  try {
    if (!isPartnerOrAdmin(user)) {
      return apiError(
        "Only your lawyer can manage client portal.",
        403,
      );
    }

    await connectDB();
    const caseDoc = await findAccessibleCase(params.id, user);
    if (!caseDoc) return apiError("Case not found.", 404);

    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientPassword,
      isSharedWithClient,
    } = body;

    if (!clientEmail) return apiError("Client email is required.", 400);
    const normalizedEmail = clientEmail.toLowerCase().trim();

    const chamber = await getChamberForUser(user.id);
    if (!chamber) return apiError("No chamber found for your account.", 404);

    let client = await Client.findOne({ email: normalizedEmail });

    // Block granting access again to a client who already has access to
    // this specific case.
    if (
      client &&
      caseDoc.isSharedWithClient &&
      caseDoc.client &&
      String(caseDoc.client) === String(client._id)
    ) {
      return apiError(
        `${client.name} (${client.email}) already has access to this case.`,
        409,
      );
    }

    let generatedPassword = null;

    if (!client) {
      if (!clientName)
        return apiError("Client name is required for a new client.", 400);
      generatedPassword =
        clientPassword && clientPassword.length >= 6
          ? clientPassword
          : Math.random().toString(36).slice(-10);

      client = await Client.create({
        name: clientName,
        email: normalizedEmail,
        phone: clientPhone || undefined,
        password: generatedPassword,
        chamber: chamber._id,
        grantedBy: user.id,
      });
    } else if (clientPhone && !client.phone) {
      // Backfill contact number if it wasn't captured previously.
      client.phone = clientPhone;
      await client.save();
    }

    caseDoc.client = client._id;
    caseDoc.isSharedWithClient =
      typeof isSharedWithClient === "boolean" ? isSharedWithClient : true;
    await caseDoc.save();

    return apiSuccess({
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone || null,
      },
      temporaryPassword: generatedPassword,
      case: { id: caseDoc._id, isSharedWithClient: caseDoc.isSharedWithClient },
    });
  } catch (error) {
    console.error("[cases/id/client-access] POST:", error);
    return apiError("Failed to grant client access.", 500);
  }
});

// DELETE /api/cases/[id]/client-access
export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    if (!isPartnerOrAdmin(user)) {
      return apiError(
        "Only partners/admins can manage client portal access.",
        403,
      );
    }

    await connectDB();
    const caseDoc = await findAccessibleCase(params.id, user);
    if (!caseDoc) return apiError("Case not found.", 404);

    caseDoc.isSharedWithClient = false;
    await caseDoc.save();

    return apiSuccess({ case: { id: caseDoc._id, isSharedWithClient: false } });
  } catch (error) {
    return apiError("Failed to revoke client access.", 500);
  }
});

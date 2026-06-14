import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/subscriptionService";

export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (request, context, user) => {
  if (user.role !== "admin") {
    return apiError("Forbidden. Admin access required.", 403);
  }

  try {
    await connectDB();

    const { id } = context.params;
    const body = await request.json().catch(() => ({}));
    const { action, admin_notes } = body;

    if (!["approve", "reject"].includes(action)) {
      return apiError('Invalid action. Use "approve" or "reject".', 400);
    }

    let result;
    if (action === "approve") {
      result = await approvePaymentRequest(id);
    } else {
      result = await rejectPaymentRequest(id, admin_notes || "");
    }

    return apiSuccess({
      paymentRequest: result,
      message: action === "approve" ? "Payment approved. Subscription activated." : "Payment rejected.",
    });
  } catch (err) {
    console.error("[admin/payments/:id] PATCH:", err);
    return apiError(err.message || "Failed to process payment request.", 500);
  }
});

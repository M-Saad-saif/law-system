import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Chamber from "@/models/Chamber";
import Subscription from "@/models/Subscription";
import PaymentRequest, {
  PAYMENT_STATUS,
  PLAN_TYPE,
} from "@/models/PaymentRequest";
import {
  getChamberForUser,
  createPaymentRequest,
} from "@/lib/subscriptionService";

export const dynamic = "force-dynamic";

// GET /api/billing
export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    if (user.role === "admin") {
      return apiSuccess({ isAdmin: true });
    }

    const chamber = await getChamberForUser(user.id);
    if (!chamber) {
      return apiError("No chamber found for your account.", 404);
    }

    const subscription = await Subscription.findOne({
      chamber: chamber._id,
    }).lean();

    const payments = await PaymentRequest.find({ chamber: chamber._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const pendingRequest =
      payments.find((p) => p.status === PAYMENT_STATUS.PENDING) || null;

    return apiSuccess({ chamber, subscription, payments, pendingRequest });
  } catch (err) {
    console.error("[billing] GET:", err);
    return apiError("Failed to load billing information.", 500);
  }
});

// POST /api/billing
export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();

    if (user.role === "admin") {
      return apiError("Admins do not submit payment requests.", 400);
    }

    if (user.seniority !== "senior") {
      return apiError(
        "Only the senior lawyer of your chamber can submit a payment.",
        403,
      );
    }

    const chamber = await getChamberForUser(user.id);
    if (!chamber) {
      return apiError("No chamber found for your account.", 404);
    }

    const subscription = await Subscription.findOne({
      chamber: chamber._id,
    }).lean();
    if (!subscription) {
      return apiError("No subscription record found.", 404);
    }

    if (
      ["trialing", "active", "temporary_active"].includes(subscription.status)
    ) {
      return apiError(
        "Your subscription is still active. Payment requests are only accepted when the subscription is expired, blocked, or cancelled.",
        400,
      );
    }

    const existing = await PaymentRequest.findOne({
      chamber: chamber._id,
      status: PAYMENT_STATUS.PENDING,
    });
    if (existing) {
      return apiError(
        "You already have a pending payment request. Please wait for admin verification.",
        409,
      );
    }

    const body = await request.json().catch(() => ({}));
    const { plan_type, payment_method, reference_id, screenshot_url } = body;

    // Validate plan_type
    if (plan_type && !Object.values(PLAN_TYPE).includes(plan_type)) {
      return apiError("Invalid plan type. Choose 'monthly' or 'yearly'.", 400);
    }

    const pr = await createPaymentRequest(chamber._id, {
      plan_type: plan_type || PLAN_TYPE.MONTHLY,
      payment_method,
      reference_id,
      screenshot_url,
    });

    return apiSuccess({ paymentRequest: pr }, 201);
  } catch (err) {
    console.error("[billing] POST:", err);
    return apiError("Failed to submit payment request.", 500);
  }
});

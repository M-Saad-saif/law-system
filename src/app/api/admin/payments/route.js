// GET /api/admin/payments
// // Lists all PaymentRequests and Subscription-status chambers. Admin only.
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import PaymentRequest, { PAYMENT_STATUS } from "@/models/PaymentRequest";
import Chamber from "@/models/Chamber";
import User from "@/models/User";
import Subscription, { SUBSCRIPTION_STATUS } from "@/models/Subscription";

export const dynamic = "force-dynamic";

// Build a PaymentRequest-shaped item enriched with chamber/owner/subscription
async function buildPaymentItem(pr) {
  const chamber = await Chamber.findById(pr.chamber).lean();
  const owner = chamber
    ? await User.findById(chamber.owner).select("name email phone").lean()
    : null;

  const subscription = chamber
    ? await Subscription.findOne({ chamber: chamber._id }).lean()
    : null;

  return {
    ...pr,
    source: "paymentRequest",
    chamber,
    owner,
    subscription,
  };
}

// Build a Subscription-shaped item enriched with chamber/owner
async function buildSubscriptionItem(subscription) {
  const chamber = await Chamber.findById(subscription.chamber).lean();
  const owner = chamber
    ? await User.findById(chamber.owner).select("name email phone").lean()
    : null;

  return {
    _id: subscription._id,
    source: "subscription",
    status: subscription.status,
    chamber,
    owner,
    subscription,
    submitted_at: subscription.trial_started_at,
  };
}

export const GET = withAuth(async (request, context, user) => {
  if (user.role !== "admin") {
    return apiError("Forbidden. Admin access required.", 403);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    let statusFilter = searchParams.get("status");

    if (!statusFilter || statusFilter === "all") {
      statusFilter = null;
    }

    const subscriptionStatuses = Object.values(SUBSCRIPTION_STATUS);
    const paymentStatuses = Object.values(PAYMENT_STATUS);

    let payments;

    if (statusFilter === null) {
      // "All" -> merge PaymentRequest items AND Subscription-status items.
      // Avoid duplicating a chamber that already has its current
      // subscription status reflected via a payment request entry by
      // excluding subscriptions whose chamber has a pending PaymentRequest
      // (the pending request is the more relevant/actionable item there).

      const paymentRequests = await PaymentRequest.find({})
        .sort({ createdAt: -1 })
        .lean();

      const paymentItems = await Promise.all(
        paymentRequests.map((pr) => buildPaymentItem(pr)),
      );

      const chambersWithPaymentRequest = new Set(
        paymentRequests
          .filter((pr) => pr.chamber)
          .map((pr) => String(pr.chamber)),
      );

      const subscriptions = await Subscription.find({})
        .sort({
          trial_ends_at: 1,
          subscription_ends_at: 1,
          temp_access_ends_at: 1,
        })
        .lean();

      const subscriptionItems = await Promise.all(
        subscriptions
          .filter((s) => !chambersWithPaymentRequest.has(String(s.chamber)))
          .map((s) => buildSubscriptionItem(s)),
      );

      payments = [...paymentItems, ...subscriptionItems];
    } else if (subscriptionStatuses.includes(statusFilter)) {
      const subscriptions = await Subscription.find({ status: statusFilter })
        .sort({
          trial_ends_at: 1,
          subscription_ends_at: 1,
          temp_access_ends_at: 1,
        })
        .lean();
      payments = await Promise.all(
        subscriptions.map((subscription) =>
          buildSubscriptionItem(subscription),
        ),
      );
    } else if (paymentStatuses.includes(statusFilter)) {
      const paymentRequests = await PaymentRequest.find({
        status: statusFilter,
      })
        .sort({ createdAt: -1 })
        .lean();

      payments = await Promise.all(
        paymentRequests.map((pr) => buildPaymentItem(pr)),
      );
    } else {
      // Unknown status value -> no results, but don't error out.
      payments = [];
    }

    return apiSuccess({
      payments,
      total: payments.length,
    });
  } catch (err) {
    console.error("[admin/payments] GET:", err);
    return apiError("Failed to load payment requests.", 500);
  }
});
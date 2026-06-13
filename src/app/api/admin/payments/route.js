// GET /api/admin/payments
// // Lists all PaymentRequests.  Admin only.
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import PaymentRequest from "@/models/PaymentRequest";
import Chamber from "@/models/Chamber";
import User from "@/models/User";
import Subscription, { SUBSCRIPTION_STATUS } from "@/models/Subscription";

export const dynamic = "force-dynamic";

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

    let payments;

    if (statusFilter && subscriptionStatuses.includes(statusFilter)) {
      const subscriptions = await Subscription.find({ status: statusFilter })
        .sort({
          trial_ends_at: 1,
          subscription_ends_at: 1,
          temp_access_ends_at: 1,
        })
        .lean();

      payments = await Promise.all(
        subscriptions.map(async (subscription) => {
          const chamber = await Chamber.findById(subscription.chamber).lean();
          const owner = chamber
            ? await User.findById(chamber.owner)
                .select("name email phone")
                .lean()
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
        }),
      );
    } else {
      const query = statusFilter ? { status: statusFilter } : {};

      const paymentRequests = await PaymentRequest.find(query)
        .sort({ createdAt: -1 })
        .lean();

      payments = await Promise.all(
        paymentRequests.map(async (pr) => {
          const chamber = await Chamber.findById(pr.chamber).lean();
          const owner = chamber
            ? await User.findById(chamber.owner)
                .select("name email phone")
                .lean()
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
        }),
      );
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

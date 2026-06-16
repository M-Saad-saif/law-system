// Lists all PaymentRequests and Subscription-status chambers to Admin only.
import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import PaymentRequest, { PAYMENT_STATUS } from "@/models/PaymentRequest";
import Chamber from "@/models/Chamber";
import User from "@/models/User";
import Subscription, { SUBSCRIPTION_STATUS } from "@/models/Subscription";

export const dynamic = "force-dynamic";

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
      const allPaymentRequests = await PaymentRequest.find({})
        .sort({ createdAt: -1 })
        .lean();
      const latestPRByChamber = new Map();
      for (const pr of allPaymentRequests) {
        const key = String(pr.chamber);
        if (!latestPRByChamber.has(key)) {
          latestPRByChamber.set(key, pr);
        }
      }

      const pendingChamberIds = new Set();
      const pendingItems = [];
      for (const [chamberId, pr] of latestPRByChamber.entries()) {
        if (pr.status === PAYMENT_STATUS.PENDING) {
          pendingChamberIds.add(chamberId);
          pendingItems.push(pr);
        }
      }

      const pendingPaymentItems = await Promise.all(
        pendingItems.map((pr) => buildPaymentItem(pr)),
      );

      const allSubscriptions = await Subscription.find({})
        .sort({
          trial_ends_at: 1,
          subscription_ends_at: 1,
          temp_access_ends_at: 1,
        })
        .lean();

      const subscriptionItems = await Promise.all(
        allSubscriptions
          .filter((s) => !pendingChamberIds.has(String(s.chamber)))
          .map((s) => buildSubscriptionItem(s)),
      );

      payments = [...pendingPaymentItems, ...subscriptionItems];
    } else if (subscriptionStatuses.includes(statusFilter)) {
      // Filter by subscription status (trialing, active, expired, etc.)
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
      const allMatchingPRs = await PaymentRequest.find({
        status: statusFilter,
      })
        .sort({ createdAt: -1 })
        .lean();

      // Deduplicate: keep only the latest PR per chamber
      const seenChambers = new Set();
      const dedupedPRs = [];
      for (const pr of allMatchingPRs) {
        const key = String(pr.chamber);
        if (!seenChambers.has(key)) {
          seenChambers.add(key);
          dedupedPRs.push(pr);
        }
      }

      payments = await Promise.all(
        dedupedPRs.map((pr) => buildPaymentItem(pr)),
      );
    } else {
      payments = [];
    }

    const [allTimeAgg, thisMonthAgg] = await Promise.all([
      PaymentRequest.aggregate([
        { $match: { status: PAYMENT_STATUS.APPROVED } },
        {
          $group: {
            _id: null,
            total: { $sum: "$payable_amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      PaymentRequest.aggregate([
        {
          $match: {
            status: PAYMENT_STATUS.APPROVED,
            verified_at: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$payable_amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenue = {
      total: allTimeAgg[0]?.total || 0,
      totalCount: allTimeAgg[0]?.count || 0,
      thisMonth: thisMonthAgg[0]?.total || 0,
      thisMonthCount: thisMonthAgg[0]?.count || 0,
    };

    return apiSuccess({
      payments,
      total: payments.length,
      revenue,
    });
  } catch (err) {
    console.error("[admin/payments] GET:", err);
    return apiError("Failed to load payment requests.", 500);
  }
});

import { withAuth, apiSuccess, apiError } from "@/lib/api";
import connectDB from "@/lib/db";
import Subscription, { SUBSCRIPTION_STATUS } from "@/models/Subscription";
import { grantTemporaryAccess } from "@/lib/subscriptionService";

export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (request, context, user) => {
  if (user.role !== "admin") {
    return apiError("Forbidden. Admin access required.", 403);
  }

  try {
    await connectDB();

    const { chamberId } = context.params;

    const body = await request.json().catch(() => ({}));
    const { action, days } = body;

    const subscription = await Subscription.findOne({ chamber: chamberId });
    if (!subscription) {
      return apiError("Subscription not found for this chamber.", 404);
    }

    switch (action) {
      case "grant_temp": {
        const numDays = parseInt(days, 10) || 3;
        const updated = await grantTemporaryAccess(chamberId, numDays);

        return apiSuccess({
          subscription: updated,
          message: `Temporary access granted for ${numDays} days.`,
        });
      }

      case "block": {
        subscription.status = SUBSCRIPTION_STATUS.BLOCKED;
        await subscription.save();
        return apiSuccess({ subscription, message: "Chamber blocked." });
      }

      case "cancel": {
        subscription.status = SUBSCRIPTION_STATUS.CANCELLED;
        await subscription.save();
        return apiSuccess({ subscription, message: "Subscription cancelled." });
      }

      case "reactivate": {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 30);

        subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
        subscription.subscription_starts_at = now;
        subscription.subscription_ends_at = end;

        await subscription.save();

        return apiSuccess({
          subscription,
          message: "Subscription reactivated for 30 days.",
        });
      }

      default:
        return apiError("Invalid action.", 400);
    }
  } catch (err) {
    console.error("[admin/subscriptions/:id] PATCH:", err);
    return apiError(err.message || "Failed to update subscription.", 500);
  }
});

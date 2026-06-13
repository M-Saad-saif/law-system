import { withAuth, apiError } from "@/lib/api";
import { checkAccess } from "@/lib/subscriptionService";
import { SUBSCRIPTION_STATUS } from "@/models/Subscription";

export function withSubscription(handler) {
  return withAuth(async (request, context, user) => {
    // Admins bypass subscription checks
    if (user.role === "admin") {
      return handler(request, context, user);
    }

    const { allowed, status } = await checkAccess(user.id);

    if (!allowed) {
      const messages = {
        [SUBSCRIPTION_STATUS.EXPIRED]:
          "Your subscription has expired. Please complete payment to restore access.",
        [SUBSCRIPTION_STATUS.BLOCKED]:
          "Your account has been blocked. Please contact support.",
        [SUBSCRIPTION_STATUS.CANCELLED]:
          "Your subscription has been cancelled. Please contact support.",
        no_subscription:
          "No active subscription found. Please contact support.",
      };

      return apiError(
        messages[status] || "Access denied. Invalid subscription status.",
        403,
      );
    }

    return handler(request, context, user);
  });
}

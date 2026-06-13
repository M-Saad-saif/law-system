import mongoose from "mongoose";

export const SUBSCRIPTION_STATUS = Object.freeze({
  TRIALING: "trialing",
  ACTIVE: "active",
  EXPIRED: "expired",
  TEMPORARY_ACTIVE: "temporary_active",
  BLOCKED: "blocked",
  CANCELLED: "cancelled",
});

export const ALLOWED_STATUSES = [
  SUBSCRIPTION_STATUS.TRIALING,
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.TEMPORARY_ACTIVE,
];

const subscriptionSchema = new mongoose.Schema(
  {
    chamber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chamber",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.TRIALING,
    },

    trial_started_at: { type: Date, default: Date.now },
    trial_ends_at: { type: Date },

    subscription_starts_at: { type: Date },
    subscription_ends_at: { type: Date },

    temp_access_ends_at: { type: Date },
  },
  { timestamps: true },
);

subscriptionSchema.methods.isAccessAllowed = function () {
  return ALLOWED_STATUSES.includes(this.status);
};

const Subscription =
  mongoose?.models?.Subscription ||
  mongoose?.model("Subscription", subscriptionSchema);

export default Subscription;

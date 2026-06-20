import mongoose from "mongoose";

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const PLAN_TYPE = Object.freeze({
  MONTHLY: "monthly",
  YEARLY: "yearly",
});

// Plan pricing and duration config — single source of truth
export const PLAN_CONFIG = Object.freeze({
  monthly: { price: 10000, durationDays: 30, label: "Monthly Plan" },
  yearly: { price: 50000, durationDays: 365, label: "Yearly Plan" },
});

const paymentRequestSchema = new mongoose.Schema(
  {
    chamber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chamber",
      required: true,
    },

    invoice_id: { type: String, required: true, unique: true },
    plan_type: {
      type: String,
      enum: Object.values(PLAN_TYPE),
      default: PLAN_TYPE.MONTHLY,
    },
    payment_method: {
      type: String,
      enum: ["raast", "easypaisa", "jazzcash", "bank_transfer", "other"],
      default: "easypaisa",
    },
    reference_id: { type: String, trim: true },
    screenshot_url: { type: String, trim: true },

    payable_amount: { type: Number, required: true },

    submitted_at: { type: Date, default: Date.now },
    verified_at: { type: Date },

    admin_notes: { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

const PaymentRequest =
  mongoose?.models?.PaymentRequest ||
  mongoose?.model("PaymentRequest", paymentRequestSchema);

export default PaymentRequest;

// Central place for all subscription-related business logic
import connectDB from "@/lib/db";
import User from "@/models/User";
import Chamber from "@/models/Chamber";
import Subscription, {
  SUBSCRIPTION_STATUS,
  ALLOWED_STATUSES,
} from "@/models/Subscription";
import PaymentRequest, {
  BASE_PLAN_PRICE,
  PAYMENT_STATUS,
} from "@/models/PaymentRequest";

// ---- Chamber helpers ----
export async function getChamberForUser(userId) {
  await connectDB();

  const user = await User.findById(userId).lean();
  if (!user) return null;

  if (user.role === "admin") return null;

  // First try to find a chamber owned by this user.
  const ownedChamber = await Chamber.findOne({ owner: userId }).lean();
  if (ownedChamber) return ownedChamber;

  // For junior lawyers, fall back to the senior's chamber.
  if (user.seniority === "junior" && user.createdBy) {
    return Chamber.findOne({ owner: user.createdBy }).lean();
  }

  return null;
}

export async function bootstrapChamberForSenior(userId, chamberName) {
  await connectDB();

  const trialStart = new Date();
  const trialEnd = new Date(trialStart);
  trialEnd.setDate(trialEnd.getDate() + 7);

  const chamber = await Chamber.create({
    name: chamberName,
    owner: userId,
  });

  await Subscription.create({
    chamber: chamber._id,
    status: SUBSCRIPTION_STATUS.TRIALING,
    trial_started_at: trialStart,
    trial_ends_at: trialEnd,
  });

  return chamber;
}

// ---- Subscription helpers ----
export async function getSubscriptionByChamber(chamberId) {
  await connectDB();
  return Subscription.findOne({ chamber: chamberId }).lean();
}

export async function getSubscriptionForUser(userId) {
  await connectDB();
  const chamber = await getChamberForUser(userId);
  if (!chamber) return null;
  return getSubscriptionByChamber(chamber._id);
}

export async function checkAccess(userId) {
  await connectDB();

  const subscription = await getSubscriptionForUser(userId);

  if (!subscription) {
    return { allowed: false, status: "no_subscription", subscription: null };
  }

  const allowed = ALLOWED_STATUSES.includes(subscription.status);
  return { allowed, status: subscription.status, subscription };
}

// --- Invoice & payment helpers ---
async function generateInvoiceId() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const count = await PaymentRequest.countDocuments({
    invoice_id: { $regex: `^${prefix}` },
  });

  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}${seq}`;
}

async function generateUniqueAmount() {
  const totalRequests = await PaymentRequest.countDocuments();
  const offset = (totalRequests % 9999) + 1;
  return BASE_PLAN_PRICE + offset;
}

export async function createPaymentRequest(
  chamberId,
  { payment_method = "raast", reference_id, screenshot_url } = {},
) {
  await connectDB();

  await PaymentRequest.deleteMany({
    chamber: chamberId,
    status: { $in: [PAYMENT_STATUS.REJECTED, PAYMENT_STATUS.APPROVED] },
  });

  const invoice_id = await generateInvoiceId();
  const payable_amount = await generateUniqueAmount();

  const pr = await PaymentRequest.create({
    chamber: chamberId,
    invoice_id,
    payable_amount,
    payment_method,
    reference_id,
    screenshot_url,
    status: PAYMENT_STATUS.PENDING,
    submitted_at: new Date(),
  });

  return pr;
}

export async function approvePaymentRequest(paymentRequestId) {
  await connectDB();

  const pr = await PaymentRequest.findById(paymentRequestId);
  if (!pr) throw new Error("Payment request not found.");
  if (pr.status !== PAYMENT_STATUS.PENDING) {
    throw new Error(`Cannot approve a request with status: ${pr.status}`);
  }

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 30);

  pr.status = PAYMENT_STATUS.APPROVED;
  pr.verified_at = now;
  await pr.save();

  await Subscription.findOneAndUpdate(
    { chamber: pr.chamber },
    {
      $set: {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        subscription_starts_at: now,
        subscription_ends_at: end,
        // Clear temp access field if it was set
        temp_access_ends_at: null,
      },
    },
    { new: true },
  );

  return pr;
}

export async function rejectPaymentRequest(paymentRequestId, admin_notes = "") {
  await connectDB();

  const pr = await PaymentRequest.findById(paymentRequestId);
  if (!pr) throw new Error("Payment request not found.");
  if (pr.status !== PAYMENT_STATUS.PENDING) {
    throw new Error(`Cannot reject a request with status: ${pr.status}`);
  }

  pr.status = PAYMENT_STATUS.REJECTED;
  pr.admin_notes = admin_notes;
  pr.verified_at = new Date();
  await pr.save();

  return pr;
}

export async function grantTemporaryAccess(chamberId, days = 3) {
  await connectDB();

  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  const sub = await Subscription.findOneAndUpdate(
    { chamber: chamberId },
    {
      status: SUBSCRIPTION_STATUS.TEMPORARY_ACTIVE,
      temp_access_ends_at: end,
    },
    { new: true },
  );

  return sub;
}

// --- Cron for automatic expiry ---
export async function runExpiryCheck() {
  await connectDB();

  const now = new Date();

  const result = await Subscription.updateMany(
    {
      $or: [
        { status: SUBSCRIPTION_STATUS.TRIALING, trial_ends_at: { $lt: now } },
        {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          subscription_ends_at: { $lt: now },
        },
        {
          status: SUBSCRIPTION_STATUS.TEMPORARY_ACTIVE,
          temp_access_ends_at: { $lt: now },
        },
      ],
    },
    { $set: { status: SUBSCRIPTION_STATUS.EXPIRED } },
  );

  return { expired: result.modifiedCount };
}

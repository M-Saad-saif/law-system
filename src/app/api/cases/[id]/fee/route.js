import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { apiError, apiSuccess, withAuth } from "@/lib/api";

// GET /api/cases/[id]/fee — return the fee object for this case
export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();
  const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
  if (!caseDoc) return apiError("Case not found.", 404);

  // Ensure fee object exists for older records
  if (!caseDoc.fee) {
    caseDoc.fee = {};
    await caseDoc.save();
  }

  return apiSuccess({ fee: caseDoc.fee });
});

// PUT /api/cases/[id]/fee — update agreedAmount and/or notes
export const PUT = withAuth(async (req, { params }, user) => {
  await connectDB();
  const { agreedAmount, notes } = await req.json();

  const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
  if (!caseDoc) return apiError("Case not found.", 404);

  if (!caseDoc.fee) caseDoc.fee = {};

  if (agreedAmount !== undefined) {
    if (typeof agreedAmount !== "number" || agreedAmount < 0)
      return apiError("agreedAmount must be a non-negative number.", 400);
    caseDoc.fee.agreedAmount = agreedAmount;
  }
  if (notes !== undefined) caseDoc.fee.notes = notes;

  await caseDoc.save();

  return apiSuccess({ fee: caseDoc.fee });
});

// POST /api/cases/[id]/fee — add a payment entry
export const POST = withAuth(async (req, { params }, user) => {
  await connectDB();
  const { amount, date, method, note } = await req.json();

  if (!amount || typeof amount !== "number" || amount <= 0)
    return apiError("amount must be a positive number.", 400);

  const payment = {
    amount,
    date: date ? new Date(date) : new Date(),
    method: method || "cash",
    note: note || "",
  };

  const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
  if (!caseDoc) return apiError("Case not found.", 404);

  if (!caseDoc.fee) caseDoc.fee = {};
  if (!Array.isArray(caseDoc.fee.payments)) caseDoc.fee.payments = [];

  caseDoc.fee.payments.push(payment);
  await caseDoc.save();

  return apiSuccess({ fee: caseDoc.fee });
});

// DELETE /api/cases/[id]/fee — remove a payment by its _id
// Body: { paymentId }
export const DELETE = withAuth(async (req, { params }, user) => {
  await connectDB();
  const { paymentId } = await req.json();
  if (!paymentId) return apiError("paymentId is required.", 400);

  const caseDoc = await Case.findOne({ _id: params.id, userId: user.id });
  if (!caseDoc) return apiError("Case not found.", 404);

  if (!caseDoc.fee) caseDoc.fee = {};
  if (!Array.isArray(caseDoc.fee.payments)) caseDoc.fee.payments = [];

  caseDoc.fee.payments = caseDoc.fee.payments.filter(
    (p) => p._id?.toString() !== paymentId,
  );

  await caseDoc.save();

  return apiSuccess({ fee: caseDoc.fee });
});

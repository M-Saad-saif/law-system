"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { api, uploadFile } from "@/utils/api";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  RefreshCw,
  Banknote,
  Info,
  Shield,
  FileText,
  ArrowRight,
  Calendar,
  Zap,
} from "lucide-react";

const PLAN_OPTIONS = [
  {
    type: "monthly",
    label: "Monthly Plan",
    price: 10000,
    duration: "30 days",
    icon: Calendar,
    description: "Pay month-to-month. Renew every 30 days.",
  },
  {
    type: "yearly",
    label: "Yearly Plan",
    price: 50000,
    duration: "365 days",
    icon: Zap,
    description: "Best value. Save PKR 70,000 vs monthly.",
    badge: "Best Value",
  },
];

const STATUS_CONFIG = {
  trialing: {
    label: "Free Trial",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    description: "You are currently on a 7-day free trial.",
  },
  active: {
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
    description: "Your subscription is active.",
  },
  temporary_active: {
    label: "Temporary Access",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    description: "You have been granted temporary access.",
  },
  expired: {
    label: "Expired",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    description:
      "Your subscription has expired. Please complete payment to restore access.",
  },
  blocked: {
    label: "Blocked",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    description: "Your account has been blocked. Please contact support.",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: XCircle,
    description:
      "Your subscription has been cancelled. Please contact support.",
  },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Under Review", color: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700" },
};

function getPaymentAmount(payment) {
  return payment?.payable_amount ?? payment?.amount ?? null;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.expired;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-[#027675]" : "text-gray-800"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PlanSelector({ selected, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-[#027675]/10">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#027675]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#027675]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-xs text-gray-500">
              Select the subscription that works best for you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLAN_OPTIONS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.type;
            return (
              <button
                key={plan.type}
                type="button"
                onClick={() => onChange(plan.type)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#027675] bg-[#027675]/5 shadow-sm"
                    : "border-gray-200 hover:border-[#027675]/40 hover:bg-gray-50"
                }`}
              >
                {plan.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-[#027675] text-white rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-[#027675] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-gray-900">
                    {plan.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  PKR {plan.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.duration}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {plan.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ chamber, selectedPlan, onSuccess }) {
  const [form, setForm] = useState({
    payment_method: "easypaisa",
    reference_id: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const plan =
    PLAN_OPTIONS.find((p) => p.type === selectedPlan) || PLAN_OPTIONS[0];

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reference_id.trim()) {
      toast.error("Please enter your payment reference ID.");
      return;
    }

    setLoading(true);
    try {
      let screenshot_url = "";

      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await uploadFile("/api/upload", fd).catch(() => null);
        screenshot_url = uploadRes?.url || "";
      }

      await api.post("/api/billing", {
        plan_type: selectedPlan,
        payment_method: form.payment_method,
        reference_id: form.reference_id.trim(),
        screenshot_url,
      });

      toast.success("Payment request submitted! Admin will verify shortly.");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Failed to submit payment.");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: "raast", label: "Raast" },
    { value: "easypaisa", label: "Easypaisa" },
    { value: "jazzcash", label: "JazzCash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-[#027675]/10">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#027675] to-[#019d8e] rounded-t-2xl" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#027675]/10 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-[#027675]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">Submit Payment</h2>
            <p className="text-xs text-gray-500">
              Transfer the exact amount and fill in your payment details
            </p>
          </div>
        </div>

        {/* Selected plan summary */}
        <div className="bg-[#027675]/5 border border-[#027675]/15 rounded-xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Selected Plan</p>
            <p className="text-sm font-bold text-gray-900">{plan.label}</p>
            <p className="text-xs text-gray-400">{plan.duration}</p>
          </div>
          <p className="text-xl font-bold text-[#027675]">
            PKR {plan.price.toLocaleString()}
          </p>
        </div>

        {/* Payment instructions */}
        <div className="bg-[#027675]/5 border border-[#027675]/10 rounded-xl p-4 mb-4 text-sm text-gray-700 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5 text-[#027675]">
            <Info className="w-4 h-4" /> Payment Instructions
          </p>
          <p className="text-xs">
            Send <strong>PKR {plan.price.toLocaleString()}</strong> (exact
            amount) to:
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-xs bg-white rounded-lg p-3 border border-[#027675]/10">
            <p>
              <strong>Raast ID:</strong>{" "}
              {process.env.NEXT_PUBLIC_RAAST_ID || "03XX-XXXXXXX"}
            </p>
            <p>
              <strong>EasyPaisa / JazzCash:</strong>{" "}
              {process.env.NEXT_PUBLIC_MOBILE_WALLET}
            </p>
            <p>
              <strong>Account Name:</strong>{" "}
              {process.env.NEXT_PUBLIC_ACCOUNT_NAME || "LawPortal"}
            </p>
          </div>
          <p className="text-xs text-[#027675] mt-1">
            ⚠ Use the <em>unique amount</em> from your invoice — it helps
            identify your payment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Payment Method
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all text-sm"
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Transaction / Reference ID <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all text-sm"
              placeholder="e.g. TXN-123456789"
              value={form.reference_id}
              onChange={(e) =>
                setForm({ ...form, reference_id: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Payment Screenshot (optional)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#027675] transition-colors bg-gray-50/50">
              {preview ? (
                <img
                  src={preview}
                  alt="proof"
                  className="h-full object-contain rounded-xl p-1"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Click to upload screenshot</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-[#027675] text-white font-semibold rounded-xl shadow-lg shadow-[#027675]/20 hover:bg-[#015f5d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Payment Request — PKR {plan.price.toLocaleString()}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Payment History ──────────────────────────────────────────────────────────

function PaymentHistory({ payments }) {
  if (!payments?.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-[#027675]/10">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-[#027675]" />
          <h2 className="font-bold text-lg text-gray-900">Payment History</h2>
        </div>
        <div className="space-y-2">
          {payments.map((p) => {
            const cfg =
              PAYMENT_STATUS_CONFIG[p.status] || PAYMENT_STATUS_CONFIG.pending;
            const planLabel = PLAN_OPTIONS.find(
              (o) => o.type === p.plan_type,
            )?.label;
            return (
              <div
                key={p._id}
                className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 hover:border-[#027675]/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {p.invoice_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    PKR {getPaymentAmount(p)?.toLocaleString()} ·{" "}
                    {p.payment_method}
                    {planLabel && ` · ${planLabel}`}
                  </p>
                  {p.admin_notes && (
                    <p className="text-xs text-red-500 mt-0.5">
                      Note: {p.admin_notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(p.submitted_at || p.createdAt).toLocaleDateString(
                      "en-PK",
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/billing");
      setData(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load billing information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-[#027675] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { chamber, subscription, payments, pendingRequest } = data;
  const subStatus = subscription?.status || "expired";
  const statusCfg = STATUS_CONFIG[subStatus] || STATUS_CONFIG.expired;
  const isExpired = !["trialing", "active", "temporary_active"].includes(
    subStatus,
  );
  const isSenior = user?.seniority === "senior";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#027675]/5">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center shadow-lg shadow-[#027675]/20">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">
              Billing & Subscription
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{chamber?.name}</p>
          </div>
        </div>

        {/* Expired banner */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800 text-sm">
                {statusCfg.description}
              </p>
              {isSenior && !pendingRequest && (
                <p className="text-xs text-red-600 mt-1">
                  Choose a plan below and complete payment to restore access for
                  your entire team.
                </p>
              )}
              {pendingRequest && (
                <p className="text-xs text-red-600 mt-1">
                  Your payment is under review. Access will be restored once
                  approved.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Subscription status card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-[#027675]/10">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#027675]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#027675]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  Subscription Status
                </h2>
                <p className="text-xs text-gray-500">
                  Current plan and validity details
                </p>
              </div>
            </div>

            <div className="mb-4">
              <StatusBadge status={subStatus} />
            </div>

            <div className="divide-y divide-gray-100">
              <InfoRow label="Chamber" value={chamber?.name} />
              <InfoRow
                label="Status"
                value={subStatus.replace("_", " ").toUpperCase()}
              />
              {subscription?.trial_ends_at && (
                <InfoRow
                  label="Trial Expires"
                  value={formatDate(subscription.trial_ends_at)}
                />
              )}
              {subscription?.subscription_ends_at && (
                <InfoRow
                  label="Subscription Expires"
                  value={formatDate(subscription.subscription_ends_at)}
                  highlight
                />
              )}
              {subscription?.temp_access_ends_at &&
                subStatus === "temporary_active" && (
                  <InfoRow
                    label="Temporary Access Until"
                    value={formatDate(subscription.temp_access_ends_at)}
                    highlight
                  />
                )}
            </div>
          </div>
        </div>

        {/* Latest pending request info */}
        {pendingRequest && (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-amber-200">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-lg text-gray-900">
                  Payment Under Review
                </h2>
              </div>
              <InfoRow
                label="Invoice ID"
                value={pendingRequest.invoice_id}
                highlight
              />
              <InfoRow
                label="Plan"
                value={
                  PLAN_OPTIONS.find((p) => p.type === pendingRequest.plan_type)
                    ?.label || pendingRequest.plan_type
                }
              />
              <InfoRow
                label="Amount"
                value={`PKR ${getPaymentAmount(pendingRequest)?.toLocaleString()}`}
              />
              <InfoRow label="Method" value={pendingRequest.payment_method} />
              <InfoRow
                label="Submitted"
                value={formatDate(pendingRequest.submitted_at)}
              />
              <InfoRow
                label="Reference ID"
                value={pendingRequest.reference_id || "—"}
              />
            </div>
          </div>
        )}

        {isSenior && isExpired && !pendingRequest && (
          <>
            <PlanSelector selected={selectedPlan} onChange={setSelectedPlan} />
            <PaymentForm
              chamber={chamber}
              selectedPlan={selectedPlan}
              onSuccess={load}
            />
          </>
        )}

        {/* Junior lawyer message */}
        {!isSenior && isExpired && (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,103,117,0.06)] border border-[#027675]/10 p-5 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#027675]/5 flex items-center justify-center">
              <Info className="w-7 h-7 text-[#027675]/40" />
            </div>
            <p className="text-sm text-gray-500">
              Please ask your Senior Lawyer to submit a payment to restore
              access.
            </p>
          </div>
        )}

        {/* Payment history */}
        <PaymentHistory payments={payments} />
      </div>
    </div>
  );
}

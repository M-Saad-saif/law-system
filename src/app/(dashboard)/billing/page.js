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
  ChevronRight,
  Banknote,
  Info,
} from "lucide-react";

const STATUS_CONFIG = {
  trialing: {
    label: "Free Trial",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    description: "You are currently on a 7-day free trial.",
  },
  active: {
    label: "Active",
    color: "bg-green-50 text-green-700 border-green-200",
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
  approved: { label: "Approved", color: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700" },
};

// --- Sub-components ---
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.expired;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-primary-600" : "text-slate-800"}`}
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

// --- Payment submission form ---
function PaymentForm({ chamber, onSuccess }) {
  const [form, setForm] = useState({
    payment_method: "easypaisa",
    reference_id: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

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

      // Upload screenshot first if provided
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await uploadFile("/api/upload", fd).catch(() => null);
        screenshot_url = uploadRes?.url || "";
      }

      await api.post("/api/billing", {
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
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
          <Banknote className="w-4 h-4 text-primary-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 font-display">
            Submit Payment
          </h2>
          <p className="text-xs text-slate-500">
            Transfer the exact amount below and fill in your payment details.
          </p>
        </div>
      </div>

      {/* Payment instructions banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 text-sm text-blue-800 space-y-1">
        <p className="font-semibold flex items-center gap-1.5">
          <Info className="w-4 h-4" /> Payment Instructions
        </p>
        <p>
          Send the <strong>exact amount</strong> shown on your invoice to:
        </p>
        <div className="mt-2 space-y-1 font-mono text-xs bg-blue-100 rounded p-3">
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
        <p className="text-xs text-blue-600 mt-1">
          ⚠ Use the <em>unique amount</em> from your invoice — it helps us
          identify your payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="label">Payment Method</label>
          <select
            className="select"
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

        <div className="form-group">
          <label className="label">
            Transaction / Reference ID <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. TXN-123456789"
            value={form.reference_id}
            onChange={(e) => setForm({ ...form, reference_id: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Payment Screenshot (optional)</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors bg-slate-50">
            {preview ? (
              <img
                src={preview}
                alt="proof"
                className="h-full object-contain rounded-lg p-1"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <Upload className="w-6 h-6 mb-1" />
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

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Submitting…
            </span>
          ) : (
            "Submit Payment Request"
          )}
        </button>
      </form>
    </div>
  );
}

// --- Payment history ---
function PaymentHistory({ payments }) {
  if (!payments?.length) return null;

  return (
    <div className="card p-6">
      <h2 className="font-bold text-slate-800 font-display mb-4">
        Payment History
      </h2>
      <div className="space-y-3">
        {payments.map((p) => {
          const cfg =
            PAYMENT_STATUS_CONFIG[p.status] || PAYMENT_STATUS_CONFIG.pending;
          return (
            <div
              key={p._id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {p.invoice_id}
                </p>
                <p className="text-xs text-slate-500">
                  PKR {p.payable_amount?.toLocaleString()} · {p.payment_method}
                </p>
                {p.admin_notes && (
                  <p className="text-xs text-red-600 mt-0.5">
                    Note: {p.admin_notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}
                >
                  {cfg.label}
                </span>
                <p className="text-xs text-slate-400 mt-1">
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
  );
}

// --- Main page ---
export default function BillingPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">
          Billing & Subscription
        </h1>
        <p className="text-sm text-slate-500 mt-1">{chamber?.name}</p>
      </div>

      {/* Expired banner */}
      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              {statusCfg.description}
            </p>
            {isSenior && !pendingRequest && (
              <p className="text-xs text-red-600 mt-1">
                Complete payment using the form below to restore access for your
                entire team.
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
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary-600" />
          </div>
          <h2 className="font-bold text-slate-800 font-display">
            Subscription Status
          </h2>
        </div>

        <div className="mb-4">
          <StatusBadge status={subStatus} />
        </div>

        <div className="divide-y divide-slate-100">
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

      {/* Latest pending request info */}
      {pendingRequest && (
        <div className="card p-6 border-amber-200 bg-amber-50/30">
          <h2 className="font-bold text-slate-800 font-display mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Payment Under Review
          </h2>
          <InfoRow
            label="Invoice ID"
            value={pendingRequest.invoice_id}
            highlight
          />
          <InfoRow
            label="Amount"
            value={`PKR ${pendingRequest.payable_amount?.toLocaleString()}`}
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
      )}

      {/* Payment submission — only for senior lawyers when expired and no pending request */}
      {isSenior && isExpired && !pendingRequest && (
        <PaymentForm chamber={chamber} onSuccess={load} />
      )}

      {/* Junior lawyer message */}
      {!isSenior && isExpired && (
        <div className="card p-6 text-center text-slate-500 text-sm">
          <p>
            Please ask your Senior Lawyer to submit a payment to restore access.
          </p>
        </div>
      )}

      {/* Payment history */}
      <PaymentHistory payments={payments} />
    </div>
  );
}

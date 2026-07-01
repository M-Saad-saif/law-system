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
  Info,
  ArrowRight,
  Calendar,
  Zap,
  Mail,
  Phone,
  Layers,
  History,
  LayoutDashboard,
  ShoppingBag,
  Send,
  ChevronRight,
  Sparkles,
  Crown,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border shadow-sm animate-in fade-in zoom-in-95 duration-300 ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, highlight, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 transition-colors duration-200 hover:bg-[#026665]/[0.02] rounded-lg px-1.5 -mx-1.5">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
      </span>
      <span
        className={`text-sm font-semibold transition-colors duration-200 ${highlight ? "text-[#026665]" : "text-gray-800"}`}
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

// Modern Tab Component with animations
function ModernTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="relative">
      {/* Tab Bar Background */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10">
        {/* Animated Sliding Background */}
        <div
          className="absolute top-1.5 bottom-1.5 left-1.5 bg-gradient-to-r from-[#026665] to-[#0d8c81] rounded-xl shadow-lg shadow-[#026665]/25 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeTab * 100}%)`,
          }}
        />

        {/* Tab Buttons */}
        <div className="relative flex">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={index}
                onClick={() => onChange(index)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-white scale-[1.02]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className={`relative z-10 flex items-center gap-2`}>
                  {/* Step Number with Animation */}
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 rotate-0"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </span>

                  {/* Icon with Animation */}
                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                  />

                  {/* Label */}
                  <span className="hidden sm:inline">{tab.label}</span>

                  {/* Active Indicator Arrow */}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70 animate-in slide-in-from-left-2 duration-200" />
                  )}
                </div>

                {/* Ripple Effect on Hover */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    !isActive ? "group-hover:bg-gray-100/50" : ""
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mt-3 px-2">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 text-xs transition-all duration-300 ${
              index <= activeTab
                ? "text-[#026665] font-medium"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < activeTab
                  ? "bg-[#026665] scale-100"
                  : index === activeTab
                    ? "bg-[#026665] scale-125 animate-pulse"
                    : "bg-gray-300"
              }`}
            />
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanSelector({ selected, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10 transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(2,102,101,0.1)]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#026665]/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#026665]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-xs text-gray-500">
              Select the subscription that works best for you
            </p>
            <button
              onClick={() => setActiveTab(1)}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#026665] transition-colors duration-300 hover:text-[#0d8c81]"
            >
              Submit Payment
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAN_OPTIONS.map((plan, idx) => {
            const Icon = plan.icon;
            const isSelected = selected === plan.type;
            return (
              <button
                key={plan.type}
                type="button"
                onClick={() => onChange(plan.type)}
                style={{ animationDelay: `${idx * 80}ms` }}
                className={`relative text-left p-5 rounded-xl border-2 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-1 will-change-transform hover:-translate-y-0.5 active:scale-[0.98] ${
                  isSelected
                    ? "border-[#026665] bg-[#026665]/5 shadow-md shadow-[#026665]/10 scale-[1.02]"
                    : "border-gray-200 hover:border-[#026665]/40 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 bg-[#026665] text-white rounded-full shadow-sm shadow-[#026665]/30">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "bg-[#026665] text-white shadow-sm shadow-[#026665]/30 scale-105"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-semibold text-sm text-gray-900">
                    {plan.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-[#026665] ml-auto animate-in zoom-in-50 duration-200" />
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  PKR {plan.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.duration}</p>
                <p className="text-xs text-gray-400 mt-2">{plan.description}</p>
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
    <div className="relative bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10 overflow-hidden transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(2,102,101,0.1)]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#026665] via-[#0d8c81] to-[#026665] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#026665]/10 flex items-center justify-center">
            <Send className="w-5 h-5 text-[#026665]" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">Submit Payment</h2>
            <p className="text-xs text-gray-500">
              Transfer the exact amount and fill in your payment details
            </p>
          </div>
        </div>

        <div className="bg-[#026665]/5 border border-[#026665]/15 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Selected Plan</p>
            <p className="text-sm font-bold text-gray-900">{plan.label}</p>
            <p className="text-xs text-gray-400">{plan.duration}</p>
          </div>
          <p className="text-xl font-bold text-[#026665]">
            PKR {plan.price.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#026665]/5 border border-[#026665]/10 rounded-xl p-4 mb-5 text-sm text-gray-700 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5 text-[#026665]">
            <Info className="w-4 h-4" /> Payment Instructions
          </p>
          <p className="text-xs">
            Send <strong>PKR {plan.price.toLocaleString()}</strong> (exact
            amount) to:
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-xs bg-white rounded-lg p-3 border border-[#026665]/10">
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
          <p className="text-xs text-[#026665] mt-1">
            ⚠ Use the <em>unique amount</em> from your invoice
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Payment Method
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:border-[#026665] focus:ring-4 focus:ring-[#026665]/10 transition-all duration-200 text-sm"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-[#026665] focus:ring-4 focus:ring-[#026665]/10 transition-all duration-200 text-sm"
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
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#026665] hover:bg-[#026665]/[0.03] transition-all duration-300 bg-gray-50/50 group">
              {preview ? (
                <img
                  src={preview}
                  alt="proof"
                  className="h-full object-contain rounded-xl p-1 transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400 transition-colors duration-300 group-hover:text-[#026665]">
                  <Upload className="w-5 h-5 mb-1 transition-transform duration-300 group-hover:-translate-y-0.5" />
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
            className="w-full px-4 py-3 bg-gradient-to-r from-[#026665] to-[#0d8c81] text-white font-semibold rounded-xl shadow-lg shadow-[#026665]/20 hover:shadow-xl hover:shadow-[#026665]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                Submit Payment Request — PKR {plan.price.toLocaleString()}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaymentHistory({ payments }) {
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  if (!payments?.length) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
          <History className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-sm font-semibold text-gray-600">No Payments Yet</h3>
        <p className="text-xs text-gray-400 mt-1">
          Your payment history will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#026665]/10 rounded-lg">
              <History className="w-4 h-4 text-[#026665]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">
                Payment History
              </h2>
              <p className="text-xs text-gray-500">
                {payments.length} transaction{payments.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {payments.map((p, idx) => {
              const cfg =
                PAYMENT_STATUS_CONFIG[p.status] ||
                PAYMENT_STATUS_CONFIG.pending;
              const planLabel = PLAN_OPTIONS.find(
                (o) => o.type === p.plan_type,
              )?.label;

              return (
                <div
                  key={p._id}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="group p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-[#026665]/20 hover:shadow-md hover:shadow-[#026665]/5 hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-1"
                >
                  <div className="flex gap-4">
                    {p.screenshot_url && (
                      <button
                        onClick={() => setSelectedScreenshot(p.screenshot_url)}
                        className="shrink-0 group/thumb"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group-hover/thumb:border-[#026665]/40 transition-colors">
                          <img
                            src={p.screenshot_url}
                            alt="Payment proof"
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-all flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {p.invoice_id}
                            </p>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 transition-transform duration-200 group-hover:scale-105 ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-sm text-gray-700 font-medium">
                              PKR {getPaymentAmount(p)?.toLocaleString()}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-sm text-gray-500 capitalize">
                              {p.payment_method}
                            </span>
                            {planLabel && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-sm text-gray-500">
                                  {planLabel}
                                </span>
                              </>
                            )}
                          </div>

                          {p.admin_notes && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              <p className="text-xs text-red-600 leading-relaxed">
                                {p.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(
                              p.submitted_at || p.createdAt,
                            ).toLocaleDateString("en-PK", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Payment Proof</h3>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:rotate-90"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={selectedScreenshot}
                alt="Payment proof full size"
                className="w-full rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <a
                href={selectedScreenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-[#026665] hover:bg-[#026665]/5 rounded-lg transition-colors font-medium"
              >
                Open in new tab
              </a>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="px-4 py-2 text-sm bg-[#026665] text-white rounded-lg hover:bg-[#014f4e] hover:shadow-md transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Subscription Status Component
function SubscriptionStatusContent({
  chamber,
  subscription,
  subStatus,
  statusCfg,
  pendingRequest,
}) {
  const isSenior = chamber?.seniority === "senior";
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#026665]/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[#026665]" />
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

        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#026665]/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#026665]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Chamber</p>
              <p className="text-sm font-semibold text-gray-800">
                {chamber?.name || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <StatusBadge status={subStatus} />
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            {statusCfg.description}
          </p>
        </div>

        <div className="space-y-0.5">
          {subscription?.trial_ends_at && (
            <InfoRow
              label="Trial Expires"
              value={formatDate(subscription.trial_ends_at)}
              icon={Clock}
            />
          )}
          {subscription?.subscription_ends_at && (
            <InfoRow
              label="Subscription Expires"
              value={formatDate(subscription.subscription_ends_at)}
              highlight
              icon={Calendar}
            />
          )}
          {subscription?.temp_access_ends_at &&
            subStatus === "temporary_active" && (
              <InfoRow
                label="Temporary Access Until"
                value={formatDate(subscription.temp_access_ends_at)}
                highlight
                icon={Clock}
              />
            )}
        </div>

        {subscription?.plan_type && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Current Plan</span>
              <span className="text-sm font-semibold text-[#026665]">
                {PLAN_OPTIONS.find((p) => p.type === subscription.plan_type)
                  ?.label || subscription.plan_type}
              </span>
            </div>
          </div>
        )}

        {!isSenior && pendingRequest && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600 animate-[spin_4s_linear_infinite]" />
              <span className="text-sm font-semibold text-amber-800">
                Payment Under Review
              </span>
            </div>
            <div className="space-y-1">
              <InfoRow
                label="Invoice"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [activeTab, setActiveTab] = useState(0);

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

  // Custom scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #02666540;
        border-radius: 20px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #02666560;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 animate-in fade-in duration-300">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-3 border-[#026665]/15" />
          <div className="absolute inset-0 rounded-full border-3 border-[#026665] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">
          Loading billing details...
        </p>
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
  const isActive = !isExpired;

  const showTabs = isSenior && isExpired && !pendingRequest;

  const tabs = [
    { label: "Status", icon: LayoutDashboard, content: "status" },
    { label: "Choose Plan", icon: ShoppingBag, content: "plan" },
    { label: "Submit Payment", icon: Send, content: "payment" },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br bg-[#eef5f3] overflow-hidden">
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
        @keyframes float-blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }
      `}</style>

      {/* Ambient background accents */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#026665]/10 blur-3xl"
        style={{ animation: "float-blob 12s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-[#0d8c81]/10 blur-3xl"
        style={{ animation: "float-blob 14s ease-in-out infinite reverse" }}
      />

      <div className="relative max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#026665] to-[#014f4e] flex items-center justify-center shadow-lg shadow-[#026665]/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display tracking-tight">
              Billing & Subscription
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isActive
                ? "Manage your chamber's subscription"
                : "Renew your subscription to restore access"}
            </p>
          </div>
        </div>

        {/* Expired Banner */}
        {isExpired && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800 text-sm">
                {statusCfg.description}
              </p>
              {isSenior && !pendingRequest && (
                <p className="text-xs text-red-600 mt-1">
                  Follow the steps below to renew your subscription.
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

        {isSenior && isExpired && !pendingRequest ? (
          <div className="space-y-6">
            {/* Modern Tabs */}
            <ModernTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* Content Area - Left/Right Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Left Side - Context/Info */}
              <div className="lg:col-span-1">
                <SubscriptionStatusContent
                  chamber={chamber}
                  subscription={subscription}
                  subStatus={subStatus}
                  statusCfg={statusCfg}
                  pendingRequest={pendingRequest}
                  user={user}
                />
              </div>

              {/* Right Side - Main Content */}
              <div className="lg:col-span-2">
                {activeTab === 0 && (
                  <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10 p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#026665]/5 flex items-center justify-center">
                      <LayoutDashboard className="w-10 h-10 text-[#026665]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Review Your Plans
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Your subscription Plans are shown on the left. Please
                      proceed to select a plan and make payment.
                    </p>
                    <button
                      onClick={() => setActiveTab(1)}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-[#026665] transition-colors duration-300 hover:text-[#0d8c81]"
                    >
                      Continue to Payment
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {activeTab === 1 && (
                  <PlanSelector
                    selected={selectedPlan}
                    onChange={setSelectedPlan}
                  />
                )}

                {activeTab === 2 && (
                  <PaymentForm
                    chamber={chamber}
                    selectedPlan={selectedPlan}
                    onSuccess={load}
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <PaymentHistory payments={payments} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SubscriptionStatusContent
                chamber={chamber}
                subscription={subscription}
                subStatus={subStatus}
                statusCfg={statusCfg}
                pendingRequest={pendingRequest}
                user={user}
              />

              {!isSenior && isExpired && (
                <div className="mt-4 bg-white rounded-2xl shadow-[0_2px_16px_rgba(2,102,101,0.06)] border border-[#026665]/10 p-6 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-[#026665]/5 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-[#026665]/5 flex items-center justify-center ring-2 ring-[#026665]/10">
                      <Info className="w-7 h-7 text-[#026665]/40" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Access Expired
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
                      Please ask your Senior Lawyer to submit a payment to
                      restore access.
                    </p>
                  </div>

                  {user?.createdBy && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#026665]/5 to-transparent rounded-2xl" />
                      <div className="relative inline-flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-[#026665]/5 border border-[#026665]/10 w-full">
                        <UserAvatar
                          user={user.createdBy}
                          size="xl"
                          className="shadow-lg shadow-[#026665]/20 ring-2 ring-white transition-transform duration-300 hover:scale-105"
                        />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-[#026665]/70 uppercase tracking-widest mb-1">
                            Your Senior Lawyer
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {user.createdBy.name}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full pt-1 border-t border-[#026665]/10">
                          {user.createdBy.email && (
                            <a
                              href={`mailto:${user.createdBy.email}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-all duration-200 group w-full justify-center"
                            >
                              <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#026665] transition-colors" />
                              <span className="text-[15px] text-gray-500 group-hover:text-[#026665] transition-colors">
                                {user.createdBy.email}
                              </span>
                            </a>
                          )}
                          {user.createdBy.phone && (
                            <a
                              href={`tel:${user.createdBy.phone}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/50 transition-all duration-200 group w-full justify-center"
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#026665] transition-colors" />
                              <span className="text-[15px] text-gray-500 group-hover:text-[#026665] transition-colors">
                                {user.createdBy.phone}
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {isSenior && pendingRequest && (
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(217,119,6,0.06)] border border-amber-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600 animate-[spin_4s_linear_infinite]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Payment Under Review
                      </h3>
                      <p className="text-xs text-gray-500">
                        Awaiting admin verification
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <InfoRow
                      label="Invoice"
                      value={pendingRequest.invoice_id}
                      highlight
                    />
                    <InfoRow
                      label="Plan"
                      value={
                        PLAN_OPTIONS.find(
                          (p) => p.type === pendingRequest.plan_type,
                        )?.label || pendingRequest.plan_type
                      }
                    />
                    <InfoRow
                      label="Amount"
                      value={`PKR ${getPaymentAmount(pendingRequest)?.toLocaleString()}`}
                    />
                    <InfoRow
                      label="Submitted"
                      value={formatDate(pendingRequest.submitted_at)}
                      icon={Calendar}
                    />
                  </div>
                </div>
              )}

              <PaymentHistory payments={payments} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

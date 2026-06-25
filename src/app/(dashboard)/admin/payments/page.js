"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Search,
  Building2,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Shield,
  Banknote,
  ArrowUpDown,
  DollarSign,
  LayoutGrid,
  List,
  BadgeCheck,
  Ban,
  Eye,
  Timer,
} from "lucide-react";

// ---------- Constants ----------
const TABS = [
  { value: "all", label: "All Payments", icon: LayoutGrid },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: BadgeCheck },
  { value: "rejected", label: "Rejected", icon: Ban },
  { value: "trialing", label: "Trialing", icon: Timer },
  { value: "active", label: "Active", icon: CheckCircle },
  { value: "temporary_active", label: "Temp Access", icon: Clock },
  { value: "expired", label: "Expired", icon: XCircle },
  { value: "blocked", label: "Blocked", icon: AlertCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
  rejected: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
  trialing: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
  active:
    "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
  temporary_active:
    "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
  expired: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
  blocked: "bg-red-100 text-red-800 border-red-200 ring-red-500/10",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10",
};

const STATUS_DOT_COLORS = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  trialing: "bg-blue-500",
  active: "bg-emerald-500",
  temporary_active: "bg-amber-500",
  expired: "bg-rose-500",
  blocked: "bg-red-500",
  cancelled: "bg-slate-400",
};

const SUB_STATUS_STYLES = {
  trialing: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
  temporary_active: "bg-amber-50 text-amber-700 border-amber-200",
  blocked: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};
// Plan display labels — mirrors PLAN_CONFIG in PaymentRequest model
const PLAN_LABELS = {
  monthly: "Monthly Plan (30 days)",
  yearly: "Yearly Plan (365 days)",
};

function getPaymentAmount(payment) {
  return payment?.payable_amount ?? payment?.amount ?? null;
}

// ---------- Helpers ----------
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtPKR(n) {
  return `PKR ${Number(n || 0).toLocaleString("en-PK")}`;
}

// ---------- Sub-components ----------
function InfoRow({ label, value, highlight, icon }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm font-medium ${highlight ? "text-emerald-600" : "text-slate-800"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function DetailItem({ icon, label, value, highlight }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-slate-500">{label}:</span>
      <span
        className={`font-medium truncate ${highlight ? "text-emerald-600" : "text-slate-700"}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border rounded-xl p-5 transition-all duration-200 ${
        isActive
          ? "border-primary-500 ring-2 ring-primary-500/20 shadow-md"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={`${bg} rounded-lg p-1.5`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </button>
  );
}

function ActionModal({ payment, onClose, onDone }) {
  const [action, setAction] = useState("approve");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/admin/payments/${payment._id}`, {
        action,
        admin_notes: notes,
      });
      toast.success(
        action === "approve"
          ? "Payment approved. Subscription activated."
          : "Payment rejected.",
      );
      onDone();
    } catch (err) {
      toast.error(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-[50%] h-full  p-5 md:p-8 flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header - Fixed at top */}
        <div className="flex items-start justify-between shrink-0 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Payment Verification
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                {payment.invoice_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl p-2 transition-all duration-200 hover:rotate-90"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {/* Payment details */}
          <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 space-y-5 border border-slate-200 shadow-sm">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#027675]/5 to-transparent rounded-bl-3xl -mr-2 -mt-2" />

            <div className="relative grid grid-cols-2 gap-4">
              <InfoRow
                label="Company"
                value={payment.chamber?.name || payment.owner?.name}
                icon={<Building2 className="w-4 h-4" />}
              />
              <InfoRow
                label="Email"
                value={payment.owner?.email}
                icon={<User className="w-4 h-4" />}
              />
              <InfoRow
                label="Amount"
                value={
                  getPaymentAmount(payment) != null
                    ? `PKR ${Number(getPaymentAmount(payment)).toLocaleString()}`
                    : "—"
                }
                highlight
                icon={<DollarSign className="w-4 h-4" />}
              />
              <InfoRow
                label="Plan"
                value={
                  PLAN_LABELS[payment.plan_type] || payment.plan_type || "—"
                }
                icon={<CreditCard className="w-4 h-4" />}
              />
              <InfoRow
                label="Method"
                value={payment.payment_method}
                icon={<CreditCard className="w-4 h-4" />}
              />
              <InfoRow
                label="Reference"
                value={payment.reference_id || "—"}
                icon={<FileText className="w-4 h-4" />}
              />
              <InfoRow
                label="Submitted"
                value={fmtDateTime(payment.submitted_at)}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Screenshot */}
          {payment.screenshot_url && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                Proof of Payment
              </label>
              <a
                href={payment.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-[#027675]/20 hover:border-[#027675]/30 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={payment.screenshot_url}
                    alt="Payment proof"
                    className="w-full object-cover max-h-64 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 shadow-sm">
                    Click to expand
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-[#027675] bg-[#027675]/5 group-hover:bg-[#027675]/10 transition-colors font-medium">
                  <ExternalLink className="w-3.5 h-3.5" /> View Full Image
                </div>
              </a>
            </div>
          )}

          {/* Decision */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
              <div className="w-1 h-1 rounded-full bg-slate-400" />
              Decision
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAction("approve")}
                className={`relative flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-semibold transition-all duration-300 ${
                  action === "approve"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                    : "border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50 hover:scale-[1.02]"
                }`}
              >
                <CheckCircle
                  className={`w-4 h-4 transition-transform duration-300 ${action === "approve" ? "scale-110" : ""}`}
                />
                Approve
                {action === "approve" && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setAction("reject")}
                className={`relative flex items-center justify-center gap-2 rounded-xl border-2 py-4 text-sm font-semibold transition-all duration-300 ${
                  action === "reject"
                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-lg shadow-rose-500/20 scale-[1.02]"
                    : "border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50/50 hover:scale-[1.02]"
                }`}
              >
                <XCircle
                  className={`w-4 h-4 transition-transform duration-300 ${action === "reject" ? "scale-110" : ""}`}
                />
                Reject
                {action === "reject" && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* Notes for rejection */}
          {action === "reject" && (
            <div className="animate-in slide-in-from-top-2 duration-300 space-y-2">
              <label className="text-xs font-semibold text-rose-600 flex items-center gap-2 uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Rejection Reason
              </label>
              <textarea
                className="w-full rounded-xl border border-rose-200 bg-rose-50/30 px-4 py-3.5 text-sm resize-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-rose-300"
                rows={4}
                placeholder="Provide a clear reason for rejection..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {!notes && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Required for rejection
                </p>
              )}
            </div>
          )}

          {/* Approval confirmation */}
          {action === "approve" && (
            <div className="relative bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-700 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">
                  Confirm Approval
                </p>
                <p className="text-emerald-600 mt-1 leading-relaxed">
                  This will activate a 30-day subscription and restore access
                  for all users in this chamber.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Subscription renews automatically
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex gap-4 pt-6 shrink-0 border-t border-slate-100 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-md"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || (action === "reject" && !notes)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold text-white transition-all duration-300 ${
              action === "approve"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
                : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:-translate-y-0.5 active:translate-y-0`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="relative">
                  Processing
                  <span className="absolute -right-1">...</span>
                </span>
              </>
            ) : action === "approve" ? (
              <>
                <CheckCircle className="w-4 h-4" /> Confirm Approval
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Confirm Rejection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TempAccessModal({ payment, onClose, onDone }) {
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.patch(`/api/admin/subscriptions/${payment.chamber?._id}`, {
        action: "grant_temp",
        days: Number(days),
      });
      toast.success(`Temporary access granted for ${days} day(s).`);
      onDone();
    } catch (err) {
      toast.error(err.message || "Failed to grant access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Grant Temporary Access
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {payment.chamber?.name || payment.owner?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 p-1"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-700 flex items-start gap-3">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Temporary Access</p>
            <p className="text-amber-600 mt-0.5">
              Grants platform access for a limited duration while payment
              verification is pending.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
            Duration (Days)
          </label>
          <div className="flex gap-2 mb-4">
            {[1, 3, 7, 14].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  days === d
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-amber-300"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={30}
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              value={days}
              onChange={(e) =>
                setDays(Math.max(1, Math.min(30, e.target.value)))
              }
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
              days
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Granting...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" /> Grant {days} Day
                {days > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ payment, onAction, onTempAccess }) {
  const subStatus = payment.subscription?.status;
  const isSubscriptionItem = payment.source === "subscription";
  const statusColor = STATUS_DOT_COLORS[payment.status] || "bg-slate-400";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1 min-w-0 space-y-5">
          {/* Header row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`w-2 h-2 rounded-full ${statusColor} shrink-0`} />
            <span className="font-semibold text-slate-800 text-sm">
              {isSubscriptionItem
                ? `${payment.chamber?.name || "Chamber"} Trial`
                : payment.invoice_id}
            </span>
            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ring-1 ${
                STATUS_STYLES[payment.status] ||
                "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10"
              }`}
            >
              {payment.status?.replace(/_/g, " ")}
            </span>
            {subStatus && (
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                  SUB_STATUS_STYLES[subStatus] ||
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {subStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem
              icon={<Building2 className="w-3.5 h-3.5" />}
              label="Company"
              value={payment.chamber?.name}
            />
            <DetailItem
              icon={<User className="w-3.5 h-3.5" />}
              label="Owner"
              value={payment.owner?.name}
            />
            {isSubscriptionItem ? (
              <>
                <DetailItem
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label="Trial Ends"
                  value={fmt(payment.subscription?.trial_ends_at)}
                />
                <DetailItem
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Started"
                  value={fmt(payment.subscription?.trial_started_at)}
                />
              </>
            ) : (
              <>
                <DetailItem
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  label="Amount"
                  value={
                    getPaymentAmount(payment) != null
                      ? `PKR ${Number(getPaymentAmount(payment)).toLocaleString()}`
                      : "—"
                  }
                  highlight
                />
                <DetailItem
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  label="Method"
                  value={payment.payment_method}
                />
              </>
            )}
            <DetailItem
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Submitted"
              value={fmt(payment.submitted_at || payment.createdAt)}
            />
          </div>

          {/* Reference & Notes */}
          <div className="flex flex-wrap items-center gap-3">
            {payment.reference_id && !isSubscriptionItem && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
                <FileText className="w-3 h-3 text-slate-400" />
                {payment.reference_id}
              </span>
            )}
            {payment.admin_notes && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-3 h-3" />
                {payment.admin_notes}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 shrink-0">
          {payment.status === "pending" && (
            <button
              onClick={() => onAction(payment)}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-5 py-3 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Review
            </button>
          )}
          {payment.screenshot_url && (
            <a
              href={payment.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Proof
            </a>
          )}
          {payment.chamber?._id && (
            <button
              onClick={() => onTempAccess(payment)}
              className="border border-amber-300 text-amber-700 hover:bg-amber-100 text-xs font-medium px-5 py-3 rounded-lg flex items-center gap-2 transition-all hover:border-amber-400 bg-amber-300/20
              "
            >
              <Clock className="w-3.5 h-3.5" />
              Temp Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function AdminPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState({
    total: 0,
    totalCount: 0,
    thisMonth: 0,
    thisMonthCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tempTarget, setTempTarget] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [viewMode, setViewMode] = useState("list");

  // Admin-only guard
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = activeTab && activeTab !== "all" ? `?status=${activeTab}` : "";
      const res = await api.get(`/api/admin/payments${qs}`);
      setPayments(res.data?.payments || []);
      if (res.data?.revenue) setRevenue(res.data.revenue);
    } catch (err) {
      toast.error(err.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtered & sorted data
  const filtered = useMemo(() => {
    return payments
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          p.invoice_id?.toLowerCase().includes(q) ||
          p.chamber?.name?.toLowerCase().includes(q) ||
          p.owner?.name?.toLowerCase().includes(q) ||
          p.owner?.email?.toLowerCase().includes(q) ||
          p.reference_id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.submitted_at || a.createdAt);
        const dateB = new Date(b.submitted_at || b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [payments, search, sortOrder]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach((tab) => {
      counts[tab.value] =
        tab.value === "all"
          ? payments.length
          : payments.filter((p) => p.status === tab.value).length;
    });
    return counts;
  }, [payments]);

  // Stats
  const stats = useMemo(
    () => [
      {
        label: "Total",
        value: filtered.length,
        icon: FileText,
        color: "text-slate-600",
        bg: "bg-slate-100",
      },
      {
        label: "Pending",
        value: filtered.filter((p) => p.status === "pending").length,
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-100",
      },
      {
        label: "Approved",
        value: filtered.filter((p) => p.status === "approved").length,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      },
      {
        label: "Rejected",
        value: filtered.filter((p) => p.status === "rejected").length,
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-100",
      },
      {
        label: "Active",
        value: filtered.filter((p) => p.status === "active").length,
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
    ],
    [filtered],
  );

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  if (authLoading || (user && user.role !== "admin")) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-8 p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Payment Verification
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Review and verify manual payment requests from chambers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "compact" : "list")
                }
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl p-3 transition-all"
                title={`Switch to ${viewMode === "list" ? "compact" : "list"} view`}
              >
                {viewMode === "list" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </button>
              <button
                onClick={load}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 transition-all"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 shadow-sm text-white">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Total Revenue
              </span>
              <div className="bg-white/15 rounded-lg p-2">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              {fmtPKR(revenue.total)}
            </span>
            <p className="text-xs text-emerald-100 mt-2">
              From {revenue.totalCount} approved payment
              {revenue.totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                This Month
              </span>
              <div className="bg-emerald-100 rounded-lg p-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {fmtPKR(revenue.thisMonth)}
            </span>
            <p className="text-xs text-slate-500 mt-2">
              From {revenue.thisMonthCount} approved payment
              {revenue.thisMonthCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Alert */}
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-5 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-amber-100 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {pendingCount} Payment{pendingCount > 1 ? "s" : ""} Awaiting
                Verification
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Prompt review ensures uninterrupted service for chambers
              </p>
            </div>
            <button
              onClick={() => setActiveTab("pending")}
              className="text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-5 py-2.5 rounded-lg transition-colors"
            >
              View Pending
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.value];
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 pl-12 pr-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
            placeholder="Search by invoice, company, email, or reference ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              onClick={() => setActiveTab(stat.label.toLowerCase())}
              isActive={activeTab === stat.label.toLowerCase()}
            />
          ))}
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              payment{filtered.length !== 1 ? "s" : ""}
              {activeTab !== "all" && (
                <span className="ml-1">
                  with status{" "}
                  <span className="font-medium capitalize">
                    {activeTab.replace(/_/g, " ")}
                  </span>
                </span>
              )}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Clear search
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-slate-200 rounded-full" />
                <div className="absolute top-0 left-0 w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Loading payments...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="bg-slate-100 rounded-2xl p-6 mb-6">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No payments found
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-sm">
                {search
                  ? "No results match your search criteria. Try different keywords."
                  : activeTab !== "all"
                    ? `No payments with "${activeTab.replace(/_/g, " ")}" status.`
                    : "No payment requests available at this time."}
              </p>
            </div>
          ) : (
            <div
              className={`p-6 ${viewMode === "compact" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}`}
            >
              {filtered.map((p, index) => (
                <div
                  key={p._id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <PaymentCard
                    payment={p}
                    onAction={setSelected}
                    onTempAccess={setTempTarget}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selected && (
        <ActionModal
          payment={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            load();
          }}
        />
      )}
      {tempTarget && (
        <TempAccessModal
          payment={tempTarget}
          onClose={() => setTempTarget(null)}
          onDone={() => {
            setTempTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

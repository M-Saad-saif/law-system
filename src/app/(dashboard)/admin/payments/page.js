"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
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
  ChevronDown,
  Building2,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Shield,
  Banknote,
  Filter,
  ArrowUpDown,
  DollarSign,
} from "lucide-react";

const TABS = [
  { value: "all", label: "All", icon: FileText },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle },
  { value: "rejected", label: "Rejected", icon: XCircle },
  { value: "trialing", label: "Trialing", icon: Clock },
  { value: "active", label: "Active", icon: CheckCircle },
  { value: "temporary_active", label: "Temp Access", icon: Clock },
  { value: "expired", label: "Expired", icon: XCircle },
  { value: "blocked", label: "Blocked", icon: AlertCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

const STATUS_STYLES = {
  pending: "bg-amber-50  text-amber-700  border-amber-200",
  approved: "bg-green-50  text-green-700  border-green-200",
  rejected: "bg-red-50    text-red-700    border-red-200",
  trialing: "bg-blue-50   text-blue-700   border-blue-200",
  active: "bg-green-50  text-green-700  border-green-200",
  temporary_active: "bg-amber-50  text-amber-700  border-amber-200",
  expired: "bg-red-50    text-red-700    border-red-200",
  blocked: "bg-red-100   text-red-800    border-red-200",
  cancelled: "bg-slate-100 text-slate-600  border-slate-200",
};

const SUB_STATUS_STYLES = {
  trialing: "bg-blue-50   text-blue-700",
  active: "bg-green-50  text-green-700",
  expired: "bg-red-50    text-red-700",
  temporary_active: "bg-amber-50  text-amber-700",
  blocked: "bg-red-100   text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
          ? "Payment approved — subscription activated."
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 transform transition-all">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Verify Payment
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {payment.invoice_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors hover:rotate-90 duration-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Payment details summary */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm border border-slate-100">
          <InfoRow
            label="Company"
            value={payment.chamber?.name || payment.owner?.name}
            icon={<Building2 className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="Email"
            value={payment.owner?.email}
            icon={<User className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="Amount"
            value={`PKR ${payment.payable_amount?.toLocaleString()}`}
            highlight
            icon={<DollarSign className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="Method"
            value={payment.payment_method}
            icon={<CreditCard className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="Reference"
            value={payment.reference_id || "—"}
            icon={<FileText className="w-3.5 h-3.5" />}
          />
          <InfoRow
            label="Submitted"
            value={fmt(payment.submitted_at)}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Screenshot */}
        {payment.screenshot_url && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              Proof of Payment
            </p>
            <a
              href={payment.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={payment.screenshot_url}
                  alt="Payment proof"
                  className="w-full object-cover max-h-48"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-primary-600 bg-primary-50 group-hover:bg-primary-100 transition-colors">
                <ExternalLink className="w-3 h-3" /> View full image
              </div>
            </a>
          </div>
        )}

        {/* Action selector */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Decision
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction("approve")}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                action === "approve"
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                  : "border-slate-200 text-slate-500 hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setAction("reject")}
              className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                action === "reject"
                  ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                  : "border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50/50"
              }`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>

        {action === "reject" && (
          <div className="form-group animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">
              Rejection Note (shown to user)
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
              rows={3}
              placeholder="e.g. Reference ID not found in our records."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {action === "approve" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-start gap-2 animate-in slide-in-from-top-2 duration-200">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Approving will activate the subscription for 30 days and restore
              access for all users in this chamber.
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md"
                : "bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : action === "approve" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {loading
              ? "Processing…"
              : action === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Temp access modal ---
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Grant Temporary Access
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Chamber:{" "}
              <strong>{payment.chamber?.name || payment.owner?.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors hover:rotate-90 duration-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Temporary access will allow the chamber to use the platform for the
            specified number of days.
          </span>
        </div>

        <div className="form-group">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">
            Number of Days
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={30}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              days
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Grant Access
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Shared InfoRow ---
function InfoRow({ label, value, highlight, icon }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 flex items-center gap-2 min-w-0">
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={`font-semibold text-right truncate ${
          highlight ? "text-primary-600" : "text-slate-800"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// --- Payment card ---
function PaymentCard({ payment, onAction, onTempAccess }) {
  const subStatus = payment.subscription?.status;
  const isSubscriptionItem = payment.source === "subscription";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-bold text-slate-800 font-display text-sm">
              {isSubscriptionItem
                ? `${payment.chamber?.name || "Chamber"} Trial`
                : payment.invoice_id}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[payment.status]}`}
            >
              {payment.status.replace("_", " ")}
            </span>
            {subStatus && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${SUB_STATUS_STYLES[subStatus] || "bg-slate-100 text-slate-600"}`}
              >
                sub: {subStatus.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{payment.chamber?.name || "—"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{payment.owner?.name || "—"}</span>
            </span>
            {isSubscriptionItem ? (
              <>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Trial ends{" "}
                  {fmt(payment.subscription?.trial_ends_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Started{" "}
                  {fmt(payment.subscription?.trial_started_at)}
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-green-600" /> PKR{" "}
                  {payment.payable_amount?.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />{" "}
                  {payment.payment_method}
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 col-span-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
              {fmt(payment.submitted_at || payment.createdAt)}
            </span>
          </div>

          {payment.reference_id && !isSubscriptionItem && (
            <div className="mt-2 flex items-center gap-1.5">
              <p className="text-xs text-slate-500">
                Ref:{" "}
                <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {payment.reference_id}
                </span>
              </p>
            </div>
          )}

          {payment.admin_notes && (
            <div className="mt-2 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600 italic">
                {payment.admin_notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {payment.status === "pending" && (
            <button
              onClick={() => onAction(payment)}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Review
            </button>
          )}
          {payment.screenshot_url && (
            <a
              href={payment.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Proof
            </a>
          )}
          {payment.chamber?._id && (
            <button
              onClick={() => onTempAccess(payment)}
              className="border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Clock className="w-3.5 h-3.5" /> Temp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tempTarget, setTempTarget] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest");

  // Admin-only guard
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = activeTab ? `?status=${activeTab}` : "";
      const res = await api.get(`/api/admin/payments${qs}`);
      setPayments(res.data?.payments || []);
    } catch (err) {
      toast.error(err.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = payments
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

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  if (authLoading || (user && user.role !== "admin")) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
            Payment Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Review and verify manual payment requests from chambers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
            }
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === "newest" ? "Newest First" : "Oldest First"}
          </button>
          <button
            onClick={load}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-all"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-amber-100 rounded-lg p-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {pendingCount} payment{pendingCount > 1 ? "s" : ""} awaiting
              verification
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Please review and process pending payments promptly
            </p>
          </div>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1.5 overflow-x-auto w-full lg:w-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total",
            value: payments.length,
            icon: FileText,
            color: "text-slate-600",
            bg: "bg-slate-100",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Approved",
            value: payments.filter((p) => p.status === "approved").length,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Rejected",
            value: payments.filter((p) => p.status === "rejected").length,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-100",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className={`${stat.bg} rounded-lg p-1.5`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Payment list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading payments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="bg-slate-100 rounded-full p-4 w-fit mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            No payments found
          </h3>
          <p className="text-sm text-slate-500">
            {search
              ? "Try adjusting your search terms"
              : "No payment requests match the selected filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, index) => (
            <div
              key={p._id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
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

      {/* Action modal */}
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

      {/* Temp access modal */}
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

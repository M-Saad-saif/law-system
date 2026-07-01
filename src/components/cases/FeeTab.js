"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { format } from "date-fns";
import {
  Banknote,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar as CalendarIcon,
  Receipt,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  FileText,
  Clock,
  CircleDollarSign,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---- Helpers ----

const METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { value: "cheque", label: "Cheque", icon: FileText },
  { value: "online", label: "Online", icon: CreditCard },
  { value: "other", label: "Other", icon: Receipt },
];

function fmt(n) {
  return Number(n || 0).toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  });
}

function pct(paid, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((paid / total) * 100));
}

// ---- Fee Progress Bar ----

function FeeProgressBar({ paid, agreed }) {
  const p = pct(paid, agreed);
  const isFullyPaid = p >= 100;
  const progressGradient = isFullyPaid
    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
    : p >= 60
      ? "bg-gradient-to-r from-amber-400 to-amber-500"
      : "bg-gradient-to-r from-rose-400 to-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Amount Paid
          </p>
          <motion.p
            key={paid}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent"
          >
            {fmt(paid)}
          </motion.p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1.5">
            <CircleDollarSign className="w-3.5 h-3.5" />
            Agreed Fee
          </p>
          <p className="text-xl font-semibold text-slate-600">{fmt(agreed)}</p>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-2.5">
        <div className="relative h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${p}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${progressGradient}`}
          />

          {/* Percentage label inside bar */}
          {p > 15 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/90 drop-shadow-sm">
                {p}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold ${isFullyPaid ? "text-emerald-600" : "text-slate-500"}`}
            >
              {p}% paid
            </span>
            {isFullyPaid && (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
              </motion.span>
            )}
          </div>
          {!isFullyPaid && agreed > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              {fmt(Math.max(0, agreed - paid))} remaining
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---- Payment Slider Input ----

function PaymentSlider({ agreedAmount, paidSoFar, onQuickAdd }) {
  const remaining = Math.max(0, agreedAmount - paidSoFar);
  const [sliderValue, setSliderValue] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSliderValue(0);
  }, [paidSoFar]);

  if (agreedAmount <= 0 || remaining <= 0) return null;

  const handleAdd = async () => {
    if (sliderValue <= 0) {
      toast.error("Slide to set an amount first.");
      return;
    }
    setAdding(true);
    try {
      await onQuickAdd(sliderValue);
      setSliderValue(0);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-blue-50">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Payment — drag to amount received
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={remaining}
            step={Math.max(1, Math.round(remaining / 100))}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-slate-200 to-slate-300 accent-slate-800"
            style={{
              background: `linear-gradient(to right, #1e293b 0%, #1e293b ${(sliderValue / remaining) * 100}%, #e2e8f0 ${(sliderValue / remaining) * 100}%, #e2e8f0 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>0</span>
            <span>{fmt(remaining / 2)}</span>
            <span>{fmt(remaining)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/60">
        <div>
          <p className="text-xs text-slate-400 font-medium">Selected amount</p>
          <p className="text-2xl font-bold text-slate-800">
            {fmt(sliderValue)}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          disabled={adding || sliderValue <= 0}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-lg hover:shadow-slate-900/20 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50 transition-all duration-300"
        >
          {adding ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Record Payment
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// --- Add Payment Form ---

function AddPaymentForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    method: "cash",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      await onAdd({ ...form, amount });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const MethodIcon =
    METHODS.find((m) => m.value === form.method)?.icon || Banknote;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border border-slate-200/60 rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm space-y-5"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50">
          <Receipt className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-slate-700">Add Payment Entry</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Amount (PKR) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              Rs.
            </span>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="25,000"
              className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-5 gap-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isActive = form.method === m.value;
            return (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => set("method", m.value)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-slate-800 bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`}
                />
                <span className="text-[10px] font-medium">{m.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Note (optional)
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="e.g. Advance for hearing on 15 Jan"
            className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-lg hover:shadow-slate-900/20 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <>
              <Plus className="w-4 h-4 inline mr-2" />
              Add Payment
            </>
          )}
        </motion.button>
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// --- Agreed Fee Editor ---

function AgreedFeeEditor({ current, notes, onSave }) {
  const [amount, setAmount] = useState(current?.toString() || "");
  const [feeNotes, setFeeNotes] = useState(notes || "");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ agreedAmount: val, notes: feeNotes });
      setOpen(false);
      toast.success("Fee updated.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
      >
        <PiggyBank className="w-3.5 h-3.5" />
        {current > 0 ? "Edit agreed fee" : "Set agreed fee"}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-slate-200/60 rounded-2xl bg-white p-5 space-y-4 shadow-sm"
    >
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <CircleDollarSign className="w-4 h-4" />
        Agreed Fee Settings
      </p>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1.5">
          Total Agreed Amount (PKR)
        </label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="150,000"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1.5">
          Fee Notes (optional)
        </label>
        <textarea
          rows={2}
          value={feeNotes}
          onChange={(e) => setFeeNotes(e.target.value)}
          placeholder="e.g. Includes court filing fees. Monthly installments agreed."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
        />
      </div>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-lg hover:shadow-slate-900/20 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            "Save"
          )}
        </motion.button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-slate-400 hover:text-slate-600 px-4 font-medium"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ---- Payment History Row ----

function PaymentRow({ payment, onDelete, runningTotal }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(payment._id);
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  };

  const methodData = METHODS.find((m) => m.value === payment.method);
  const MethodIcon = methodData?.icon || Banknote;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
        <Banknote className="w-4.5 h-4.5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-bold text-slate-800">
            {fmt(payment.amount)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            <MethodIcon className="w-3 h-3" />
            {methodData?.label || payment.method}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {payment.date ? format(new Date(payment.date), "dd MMM yyyy") : "—"}
          </span>
          {payment.note && (
            <>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400 truncate max-w-[200px] flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {payment.note}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
          Running total
        </p>
        <p className="text-xs font-bold text-slate-600">{fmt(runningTotal)}</p>
      </div>
      {!confirm ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setConfirm(true)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-slate-400 font-medium">
            Delete?
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-semibold disabled:opacity-60 transition-colors"
          >
            {deleting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Yes"
            )}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="text-[11px] text-slate-400 hover:text-slate-600 px-1.5 font-medium"
          >
            No
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ---- Main FeeTab ----

export default function FeeTab({ caseId, onUpdate }) {
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchFee = useCallback(async () => {
    try {
      const data = await api.get(`/api/cases/${caseId}/fee`);
      const feeData =
        data?.fee ?? data?.data?.fee ?? data?.data?.case?.fee ?? null;
      setFee(feeData);
    } catch {
      toast.error("Failed to load fee data.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  const handleUpdateFee = async (payload) => {
    try {
      const data = await api.put(`/api/cases/${caseId}/fee`, payload);
      const feeData =
        data?.fee ?? data?.data?.fee ?? data?.data?.case?.fee ?? null;
      setFee(feeData);
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to update fee.");
      throw err;
    }
  };

  const handleAddPayment = async (payload) => {
    try {
      const data = await api.post(`/api/cases/${caseId}/fee`, payload);
      const feeData =
        data?.fee ?? data?.data?.fee ?? data?.data?.case?.fee ?? null;
      setFee(feeData);
      toast.success("Payment recorded.");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to record payment.");
      throw err;
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      const data = await api.delete(`/api/cases/${caseId}/fee`, { paymentId });
      const feeData =
        data?.fee ?? data?.data?.fee ?? data?.data?.case?.fee ?? null;
      setFee(feeData);
      toast.success("Payment removed.");
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to remove payment.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const agreed = fee?.agreedAmount || 0;
  const payments = fee?.payments || [];
  const sorted = [...payments].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  let running = 0;
  const withRunning = sorted.map((p) => {
    running += p.amount;
    return { ...p, runningTotal: running };
  });
  const totalPaid = running;
  const isFullyPaid = agreed > 0 && totalPaid >= agreed;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CircleDollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Fee Status
                </h3>
                <p className="text-xs text-slate-400">
                  Payment overview & progress
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isFullyPaid && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                </motion.span>
              )}
              {!isFullyPaid && agreed > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> Outstanding
                </span>
              )}
            </div>
          </div>

          {agreed > 0 ? (
            <FeeProgressBar paid={totalPaid} agreed={agreed} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl"
            >
              <Banknote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">
                No agreed fee set yet
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Set the agreed amount to track payments
              </p>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <AgreedFeeEditor
              current={agreed}
              notes={fee?.notes}
              onSave={handleUpdateFee}
            />
            {fee?.notes && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {fee.notes.length > 40
                  ? `${fee.notes.slice(0, 40)}...`
                  : fee.notes}
              </span>
            )}
          </div>
        </motion.div>

        {/* Quick Payment Slider */}
        <PaymentSlider
          agreedAmount={agreed}
          paidSoFar={totalPaid}
          onQuickAdd={(amount) =>
            handleAddPayment({
              amount,
              date: format(new Date(), "yyyy-MM-dd"),
              method: "cash",
              note: "Quick entry",
            })
          }
        />

        {/* Add Payment Form */}
        <AnimatePresence>
          {showAddForm ? (
            <AddPaymentForm
              onAdd={handleAddPayment}
              onClose={() => setShowAddForm(false)}
            />
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all font-medium"
            >
              <Plus className="w-4 h-4" /> Add Payment Entry
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column - Payment History */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Receipt className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">
                Payment History
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {payments.length} entries
            </span>
          </div>

          {withRunning.length === 0 ? (
            <div className="text-center py-10">
              <Banknote className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                No payments yet
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Record the first payment
              </p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[...withRunning].reverse().map((p) => (
                <PaymentRow
                  key={p._id}
                  payment={p}
                  runningTotal={p.runningTotal}
                  onDelete={handleDeletePayment}
                />
              ))}
            </div>
          )}

          {/* Summary Footer */}
          {withRunning.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Total Paid</span>
                <span className="font-bold text-slate-700">
                  {fmt(totalPaid)}
                </span>
              </div>
              {agreed > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Balance Due
                  </span>
                  <span
                    className={`font-bold ${isFullyPaid ? "text-emerald-600" : "text-rose-500"}`}
                  >
                    {isFullyPaid ? "Nil" : fmt(agreed - totalPaid)}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

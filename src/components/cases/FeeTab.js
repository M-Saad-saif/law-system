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
  Building2,
  FileText,
  CircleDollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Sparkles,
  History,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---- Constants ----

const METHODS = [
  { value: "cash", label: "Cash", icon: Banknote, color: "emerald" },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: Building2,
    color: "blue",
  },
  { value: "cheque", label: "Cheque", icon: FileText, color: "purple" },
  { value: "online", label: "Online", icon: CreditCard, color: "indigo" },
  { value: "other", label: "Other", icon: Receipt, color: "slate" },
];

const colorMap = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  slate: "bg-slate-50 text-slate-600 border-slate-200",
};

// ---- Helpers ----

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

// ---- Animated Number ----

function AnimatedNumber({ value, className }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// ---- Stat Card ----

function StatCard({ icon: Icon, label, value, subtext, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// ---- Fee Progress Bar ----

function FeeProgressBar({ paid, agreed }) {
  const p = pct(paid, agreed);
  const isFullyPaid = p >= 100;

  const statusConfig = isFullyPaid
    ? {
        gradient:
          "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600",
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "Fully Paid",
        icon: CheckCircle2,
      }
    : p >= 75
      ? {
          gradient: "bg-gradient-to-r from-emerald-400 to-blue-500",
          text: "text-blue-600",
          bg: "bg-blue-50",
          label: "Near Complete",
          icon: TrendingUp,
        }
      : p >= 50
        ? {
            gradient: "bg-gradient-to-r from-amber-400 to-amber-500",
            text: "text-amber-600",
            bg: "bg-amber-50",
            label: "Halfway There",
            icon: Clock,
          }
        : p >= 25
          ? {
              gradient: "bg-gradient-to-r from-orange-400 to-orange-500",
              text: "text-orange-600",
              bg: "bg-orange-50",
              label: "In Progress",
              icon: TrendingUp,
            }
          : {
              gradient: "bg-gradient-to-r from-rose-400 to-rose-500",
              text: "text-rose-600",
              bg: "bg-rose-50",
              label: "Just Started",
              icon: AlertCircle,
            };

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Paid
          </p>
          <p className="text-lg font-bold text-slate-800">
            <AnimatedNumber value={fmt(paid)} />
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3 h-3" /> Agreed
          </p>
          <p className="text-lg font-bold text-slate-800">{fmt(agreed)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${statusConfig.text}`}>
              {p}% Complete
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {statusConfig.label}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {isFullyPaid ? "✓" : `${fmt(Math.max(0, agreed - paid))} remaining`}
          </span>
        </div>

        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${p}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${statusConfig.gradient} relative`}
          >
            {/* Animated shimmer effect */}
            {p < 100 && p > 0 && (
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Quick Payment Slider ----

function PaymentSlider({ agreedAmount, paidSoFar, onQuickAdd }) {
  const remaining = Math.max(0, agreedAmount - paidSoFar);
  const [sliderValue, setSliderValue] = useState(0);
  const [adding, setAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
      toast.success(`Payment of ${fmt(sliderValue)} recorded`);
    } finally {
      setAdding(false);
    }
  };

  // Presets
  const presets = [
    { label: "25%", value: Math.round(remaining * 0.25) },
    { label: "50%", value: Math.round(remaining * 0.5) },
    { label: "75%", value: Math.round(remaining * 0.75) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">Quick Payment</p>
          <p className="text-xs text-slate-400">Drag to set amount</p>
        </div>
      </div>

      {/* Amount Display */}
      <div className="text-center mb-4">
        <p className="text-xs text-slate-400 font-medium">Amount to record</p>
        <motion.p
          key={sliderValue}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-slate-800 mt-1"
        >
          {fmt(sliderValue)}
        </motion.p>
        <p className="text-xs text-slate-400 mt-0.5">
          of {fmt(remaining)} remaining
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={remaining}
            step={Math.max(1, Math.round(remaining / 100))}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #0f766e ${(sliderValue / remaining) * 100}%, #e2e8f0 ${(sliderValue / remaining) * 100}%)`,
            }}
          />
          {/* Custom thumb styling via style tag */}
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #0f766e;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
              transition: all 0.2s;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(15, 118, 110, 0.4);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #0f766e;
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 8px rgba(15, 118, 110, 0.3);
            }
          `}</style>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSliderValue(preset.value)}
              className="flex-1 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setSliderValue(remaining)}
            className="flex-1 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Full
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={adding || sliderValue <= 0}
        className="w-full mt-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg hover:shadow-teal-500/20 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {adding ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Record Payment
          </>
        )}
      </button>
    </motion.div>
  );
}

// ---- Add Payment Form ----

function AddPaymentForm({ onAdd, onClose, remaining }) {
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
    if (amount > remaining) {
      toast.error(`Amount exceeds remaining balance of ${fmt(remaining)}`);
      return;
    }
    setSaving(true);
    try {
      await onAdd({ ...form, amount });
      toast.success("Payment recorded successfully");
    } catch {
      setSaving(false);
    }
  };

  const MethodIcon =
    METHODS.find((m) => m.value === form.method)?.icon || Banknote;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="border border-slate-200/60 rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Receipt className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">New Payment</p>
            <p className="text-xs text-slate-400">
              Remaining: {fmt(remaining)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm text-slate-400">✕</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Amount (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                Rs.
              </span>
              <input
                type="number"
                min={1}
                max={remaining}
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="25,000"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-5 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const isActive = form.method === m.value;
              const color = colorMap[m.color] || colorMap.slate;
              return (
                <motion.button
                  key={m.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => set("method", m.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                    isActive
                      ? `border-teal-500 bg-teal-50 text-teal-700`
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{m.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Note <span className="font-normal lowercase">(optional)</span>
          </label>
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="e.g. Advance for hearing on 15 Jan"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg hover:shadow-teal-500/20 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all"
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
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Agreed Fee Editor ----

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
      toast.success("Fee updated successfully");
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
        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
      >
        <PiggyBank className="w-3.5 h-3.5 " />
        {current > 0 ? "Edit agreed fee" : "Set agreed fee"}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-teal-200/60 rounded-2xl bg-gradient-to-br from-teal-50/50 to-white p-5 space-y-4 shadow-sm"
    >
      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center gap-2">
        <CircleDollarSign className="w-4 h-4" />
        Agreed Fee Settings
      </p>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1.5">
          Total Agreed Amount (PKR)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            Rs.
          </span>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="150,000"
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1.5">
          Fee Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={feeNotes}
          onChange={(e) => setFeeNotes(e.target.value)}
          placeholder="e.g. Includes court filing fees. Monthly installments agreed."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg hover:shadow-teal-500/20 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            "Save Fee"
          )}
        </button>
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

// ---- Payment Row ----

function PaymentRow({ payment, onDelete, runningTotal, index }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(payment._id);
      toast.success("Payment removed");
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  };

  const methodData = METHODS.find((m) => m.value === payment.method);
  const MethodIcon = methodData?.icon || Banknote;
  const color = colorMap[methodData?.color] || colorMap.slate;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-4 py-3 px-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <MethodIcon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-bold text-slate-800">
            {fmt(payment.amount)}
          </span>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {methodData?.label || payment.method}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {payment.date ? format(new Date(payment.date), "dd MMM yyyy") : "—"}
          </span>
          {payment.note && (
            <>
              <span>·</span>
              <span className="truncate max-w-[150px]">{payment.note}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-slate-400 font-medium">Balance</p>
        <p className="text-xs font-bold text-slate-600">{fmt(runningTotal)}</p>
      </div>

      <AnimatePresence>
        {confirm ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1.5 flex-shrink-0"
          >
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-semibold rounded-lg transition-colors"
            >
              {deleting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Yes"
              )}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-600 font-medium"
            >
              No
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </AnimatePresence>
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
      onUpdate?.();
    } catch (err) {
      toast.error(err.message || "Failed to remove payment.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-400 mt-4 font-medium">
          Loading fee data...
        </p>
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
  const remaining = Math.max(0, agreed - totalPaid);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          icon={Wallet}
          label="Total Paid"
          value={fmt(totalPaid)}
          subtext={`${payments.length} payments`}
          color="emerald"
        />
        <StatCard
          icon={Target}
          label="Agreed Fee"
          value={fmt(agreed)}
          subtext={agreed > 0 ? "Total contract" : "Not set"}
          color="blue"
        />
        <StatCard
          icon={TrendingDown}
          label="Remaining"
          value={isFullyPaid ? "Nil" : fmt(remaining)}
          subtext={isFullyPaid ? "Fully settled ✓" : "Balance due"}
          color={isFullyPaid ? "emerald" : "amber"}
        />
        <StatCard
          icon={Percent}
          label="Progress"
          value={agreed > 0 ? `${pct(totalPaid, agreed)}%` : "—"}
          subtext={
            agreed > 0 ? `${fmt(totalPaid)} of ${fmt(agreed)}` : "Set fee first"
          }
          color="purple"
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Fee Progress
                  </h3>
                  <p className="text-xs text-slate-400">Track payment status</p>
                </div>
              </div>
              <AgreedFeeEditor
                current={agreed}
                notes={fee?.notes}
                onSave={handleUpdateFee}
              />
            </div>

            {agreed > 0 ? (
              <FeeProgressBar paid={totalPaid} agreed={agreed} />
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  No agreed fee set
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Click "Set agreed fee" to start tracking
                </p>
              </div>
            )}
          </motion.div>

          {/* Quick Payment */}
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
                remaining={remaining}
              />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                disabled={agreed <= 0}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Payment Entry
                {agreed <= 0 && (
                  <span className="text-xs">(Set fee first)</span>
                )}
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Payment History */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100">
                  <History className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">
                  Payment History
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {payments.length}
              </span>
            </div>

            {withRunning.length === 0 ? (
              <div className="text-center py-12">
                <Banknote className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  No payments yet
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Record your first payment
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                {[...withRunning].reverse().map((p, idx) => (
                  <PaymentRow
                    key={p._id}
                    payment={p}
                    runningTotal={p.runningTotal}
                    onDelete={handleDeletePayment}
                    index={idx}
                  />
                ))}
              </div>
            )}

            {/* Summary */}
            {withRunning.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Paid</span>
                  <span className="font-bold text-slate-800">
                    {fmt(totalPaid)}
                  </span>
                </div>
                {agreed > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">
                      Balance Due
                    </span>
                    <span
                      className={`font-bold ${isFullyPaid ? "text-emerald-600" : "text-rose-500"}`}
                    >
                      {isFullyPaid ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Nil
                        </span>
                      ) : (
                        fmt(remaining)
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Summary Card */}
          {agreed > 0 && withRunning.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-2xl border ${isFullyPaid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
            >
              <div className="flex items-center gap-3">
                {isFullyPaid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                )}
                <div>
                  <p
                    className={`text-sm font-bold ${isFullyPaid ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {isFullyPaid
                      ? "All payments complete!"
                      : "Payment in progress"}
                  </p>
                  <p
                    className={`text-xs ${isFullyPaid ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {isFullyPaid
                      ? `Total of ${payments.length} payments received`
                      : `${fmt(remaining)} remaining to be paid`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

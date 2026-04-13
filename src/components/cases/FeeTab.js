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
} from "lucide-react";

// ---- Helpers ----

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online" },
  { value: "other", label: "Other" },
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
  const barColor = isFullyPaid
    ? "bg-emerald-500"
    : p >= 60
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
            Amount Paid
          </p>
          <p className="text-2xl font-bold text-slate-800">{fmt(paid)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
            Agreed Fee
          </p>
          <p className="text-lg font-semibold text-slate-600">{fmt(agreed)}</p>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${p}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs font-bold ${
            isFullyPaid ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          {p}% paid
        </span>
        {isFullyPaid ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            {fmt(Math.max(0, agreed - paid))} remaining
          </span>
        )}
      </div>
    </div>
  );
}

// ---- Payment Slider Input ----
// Lets lawyer drag to record a partial payment quickly

function PaymentSlider({ agreedAmount, paidSoFar, onQuickAdd }) {
  const remaining = Math.max(0, agreedAmount - paidSoFar);
  const [sliderValue, setSliderValue] = useState(0);
  const [adding, setAdding] = useState(false);

  // Reset when remaining changes
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
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
        Quick Payment — drag to amount received
      </p>

      {/* Slider */}
      <div className="relative mb-3">
        <input
          type="range"
          min={0}
          max={remaining}
          step={Math.max(1, Math.round(remaining / 100))}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0</span>
          <span>{fmt(remaining / 2)}</span>
          <span>{fmt(remaining)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Selected amount</p>
          <p className="text-xl font-bold text-slate-800">{fmt(sliderValue)}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding || sliderValue <= 0}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors"
        >
          {adding ? "Adding…" : "Record Payment"}
        </button>
      </div>
    </div>
  );
}

// --- Add Payment Form (full manual entry) ---

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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl bg-white p-5 space-y-4">
      <p className="text-sm font-bold text-slate-700">Add Payment Entry</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Amount (PKR) *
          </label>
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="e.g. 25000"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Date *
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
          Payment Method
        </label>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => set("method", m.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                form.method === m.value
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
          Note (optional)
        </label>
        <input
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="e.g. Advance for hearing on 15 Jan"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Add Payment"}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
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
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
      >
        {current > 0 ? "Edit agreed fee" : "Set agreed fee"}
      </button>
    );
  }

  return (
    <div className="mt-4 border border-slate-200 rounded-2xl bg-white p-4 space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        Agreed Fee Settings
      </p>
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Total Agreed Amount (PKR)
        </label>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 150000"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Fee Notes (optional)
        </label>
        <textarea
          rows={2}
          value={feeNotes}
          onChange={(e) => setFeeNotes(e.target.value)}
          placeholder="e.g. Includes court filing fees. Monthly installments agreed."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-slate-400 hover:text-slate-600 px-3"
        >
          Cancel
        </button>
      </div>
    </div>
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

  const methodLabel =
    METHODS.find((m) => m.value === payment.method)?.label || payment.method;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Banknote className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-800">
            {fmt(payment.amount)}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
            {methodLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">
            {payment.date ? format(new Date(payment.date), "dd MMM yyyy") : "—"}
          </span>
          {payment.note && (
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              · {payment.note}
            </span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-400">Running total</p>
        <p className="text-xs font-semibold text-slate-600">
          {fmt(runningTotal)}
        </p>
      </div>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[11px] bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-semibold disabled:opacity-60"
          >
            {deleting ? "…" : "Yes"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="text-[11px] text-slate-400 hover:text-slate-600 px-1"
          >
            No
          </button>
        </div>
      )}
    </div>
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
        data?.fee ??
        data?.data?.fee ??
        data?.data?.case?.fee ??
        null;
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
        data?.fee ??
        data?.data?.fee ??
        data?.data?.case?.fee ??
        null;
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
        data?.fee ??
        data?.data?.fee ??
        data?.data?.case?.fee ??
        null;
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
        data?.fee ??
        data?.data?.fee ??
        data?.data?.case?.fee ??
        null;
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
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const agreed = fee?.agreedAmount || 0;
  const payments = fee?.payments || [];
  // Sort by date ascending to compute running totals
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left — progress + controls */}
      <div className="lg:col-span-2 space-y-5">
        {/* Progress card */}
        <div className="card p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="section-title">Fee Status</h3>
            {isFullyPaid && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Fully Paid
              </span>
            )}
            {!isFullyPaid && agreed > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> Outstanding
              </span>
            )}
          </div>

          {agreed > 0 ? (
            <FeeProgressBar paid={totalPaid} agreed={agreed} />
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Banknote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                No agreed fee set yet
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Set the agreed amount to track payments
              </p>
            </div>
          )}

          <AgreedFeeEditor
            current={agreed}
            notes={fee?.notes}
            onSave={handleUpdateFee}
          />

          {fee?.notes && (
            <p className="text-xs text-slate-400 italic border-l-2 border-slate-200 pl-3">
              {fee.notes}
            </p>
          )}
        </div>

        {/* Slider quick-pay card */}
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

        {/* Add payment form */}
        {showAddForm ? (
          <AddPaymentForm
            onAdd={handleAddPayment}
            onClose={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add Payment Entry
          </button>
        )}
      </div>

      {/* Right — payment history */}
      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Payment History</h3>
            <span className="text-xs text-slate-400 font-medium">
              {payments.length} entries
            </span>
          </div>

          {withRunning.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No payments recorded yet.
            </div>
          ) : (
            <div>
              {/* Show newest first for readability */}
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

          {/* Summary footer */}
          {withRunning.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Total paid</span>
                <span className="font-bold text-slate-700">
                  {fmt(totalPaid)}
                </span>
              </div>
              {agreed > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Balance due</span>
                  <span
                    className={`font-bold ${isFullyPaid ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {isFullyPaid ? "Nil" : fmt(agreed - totalPaid)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

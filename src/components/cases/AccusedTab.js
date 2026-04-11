"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { formatDate } from "@/utils/helpers";
import { EmptyState, Modal, Spinner, ConfirmDialog } from "@/components/ui";
import { Plus, User, Trash2 } from "lucide-react";

const BAIL_STATUSES = ["not_applicable", "pending", "granted", "refused"];

const bailLabel = (s) =>
  ({
    granted: {
      label: "Granted",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    refused: { label: "Refused", cls: "bg-red-50 text-red-700 border-red-100" },
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 border-amber-100",
    },
    not_applicable: {
      label: "N/A",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
  })[s] || { label: s, cls: "bg-slate-100 text-slate-500 border-slate-200" };

const defaultForm = {
  name: "",
  bailStatus: "not_applicable",
  bailAmount: "",
  bailApplicationDate: "",
  notes: "",
};

export default function AccusedTab({ caseId, accused, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Accused name is required.");
    setSaving(true);
    try {
      await api.post(`/api/cases/${caseId}/accused`, form);
      toast.success("Accused added.");
      setForm(defaultForm);
      setShowForm(false);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const updated = accused
        .filter((a) => a._id !== deleteTarget._id)
        .map(
          ({ name, bailStatus, bailAmount, bailApplicationDate, notes }) => ({
            name,
            bailStatus,
            bailAmount,
            bailApplicationDate,
            notes,
          }),
        );
      await api.put(`/api/cases/${caseId}`, { accused: updated });
      toast.success("Removed.");
      setDeleteTarget(null);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700">Accused / Bail Information</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Accused
        </button>
      </div>

      {accused.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={User}
            title="No accused added"
            description="Add accused persons and their bail status."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {accused.map((a) => {
            const bail = bailLabel(a.bailStatus);
            return (
              <div key={a._id} className="card p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-800">{a.name}</h4>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`badge border ${bail.cls}`}>
                      Bail: {bail.label}
                    </span>
                    {a.bailAmount && (
                      <span className="text-xs text-slate-500">
                        Amount: PKR {Number(a.bailAmount).toLocaleString()}
                      </span>
                    )}
                    {a.bailApplicationDate && (
                      <span className="text-xs text-slate-500">
                        Applied: {formatDate(a.bailApplicationDate)}
                      </span>
                    )}
                  </div>
                  {a.notes && (
                    <p className="text-sm text-slate-600 mt-1.5">{a.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Accused Person"
        size="sm"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="form-group">
            <label className="label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="Full name of accused"
              value={form.name}
              onChange={set("name")}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Bail Status</label>
            <select
              className="select"
              value={form.bailStatus}
              onChange={set("bailStatus")}
            >
              {BAIL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {bailLabel(s).label}
                </option>
              ))}
            </select>
          </div>
          {(form.bailStatus === "granted" || form.bailStatus === "pending") && (
            <>
              <div className="form-group">
                <label className="label">Bail Amount (PKR)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={form.bailAmount}
                  onChange={set("bailAmount")}
                />
              </div>
              <div className="form-group">
                <label className="label">Application Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.bailApplicationDate}
                  onChange={set("bailApplicationDate")}
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Additional notes..."
              value={form.notes}
              onChange={set("notes")}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                "Add Accused"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Accused"
        message={`Remove "${deleteTarget?.name}"?`}
        loading={deleting}
      />
    </div>
  );
}

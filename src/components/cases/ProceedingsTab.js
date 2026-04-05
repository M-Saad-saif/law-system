'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { formatDate } from '@/utils/helpers';
import { EmptyState, Modal, Spinner, ConfirmDialog } from '@/components/ui';
import { Plus, Calendar, Trash2, Clock } from 'lucide-react';

export default function ProceedingsTab({ caseId, proceedings, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', notes: '', nextDate: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...proceedings].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.date || !form.notes) return toast.error('Date and notes are required.');
    setSaving(true);
    try {
      await api.post(`/api/cases/${caseId}/proceedings`, form);
      toast.success('Proceeding added.');
      setForm({ date: '', notes: '', nextDate: '' });
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
      await api.delete(`/api/cases/${caseId}/proceedings`, { proceedingId: deleteTarget._id });
      toast.success('Proceeding removed.');
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
        <h3 className="font-bold text-slate-700">Proceeding History</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Proceeding
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title="No proceedings yet"
            description="Add the first proceeding entry to start building the case timeline."
          />
        </div>
      ) : (
        <div className="card p-5">
          <div className="relative">
            {sorted.map((p, i) => (
              <div key={p._id} className="flex gap-4 pb-6 last:pb-0 relative">
                {i < sorted.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100" />
                )}
                <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center shrink-0 z-10">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{formatDate(p.date)}</div>
                      {p.addedBy && <div className="text-xs text-slate-400">Added by {p.addedBy}</div>}
                    </div>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{p.notes}</p>
                  {p.nextDate && (
                    <div className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                      <Calendar className="w-3 h-3" />
                      Next date: {formatDate(p.nextDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Proceeding" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="form-group">
            <label className="label">Date <span className="text-red-500">*</span></label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">Proceeding Notes <span className="text-red-500">*</span></label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Describe what happened in this proceeding..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Next Date (optional)</label>
            <input type="date" className="input" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" className="text-white" /> : 'Add Proceeding'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Proceeding"
        message="Remove this proceeding entry? This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}

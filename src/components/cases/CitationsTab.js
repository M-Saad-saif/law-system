'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { EmptyState, Modal, Spinner, ConfirmDialog } from '@/components/ui';
import { Plus, BookMarked, Trash2, ExternalLink } from 'lucide-react';

export default function CitationsTab({ caseId, citations, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', text: '', documentUrl: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Citation title is required.');
    setSaving(true);
    try {
      await api.post(`/api/cases/${caseId}/citations`, form);
      toast.success('Citation added.');
      setForm({ title: '', text: '', documentUrl: '' });
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
      await api.delete(`/api/cases/${caseId}/citations`, { citationId: deleteTarget._id });
      toast.success('Citation removed.');
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
        <h3 className="font-bold text-slate-700">Case Citations</h3>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Citation
        </button>
      </div>

      {citations.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookMarked} title="No citations added" description="Add relevant legal citations for this case." />
        </div>
      ) : (
        <div className="space-y-3">
          {citations.map((c) => (
            <div key={c._id} className="card p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <BookMarked className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-800 text-sm">{c.title}</h4>
                  <button onClick={() => setDeleteTarget(c)} className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {c.text && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{c.text}</p>}
                {c.documentUrl && (
                  <a href={c.documentUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">
                    <ExternalLink className="w-3 h-3" /> View Document
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Citation" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="form-group">
            <label className="label">Citation Title <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. 2015 SCMR 1002" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="label">Citation Text / Summary</label>
            <textarea className="textarea" rows={3} placeholder="Key legal principle or holding..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label">Document URL (optional)</label>
            <input className="input" type="url" placeholder="https://..." value={form.documentUrl} onChange={(e) => setForm({ ...form, documentUrl: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" className="text-white" /> : 'Add Citation'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Citation"
        message={`Remove "${deleteTarget?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}

// app/(dashboard)/cross-exams/[id]/compare/page.js
// Version history & diff view

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { apiFetch } from '@/utils/api';

const DIFF_COLOURS = {
  unchanged: 'bg-white',
  added:     'bg-green-50 border-green-300',
  removed:   'bg-red-50 border-red-300',
  modified:  'bg-yellow-50 border-yellow-300',
};

const DIFF_LABELS = {
  unchanged: null,
  added:     <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Added</span>,
  removed:   <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Removed</span>,
  modified:  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Modified</span>,
};

const FIELD_LABELS = {
  originalQuestion: 'Original Question',
  originalAnswer:   'Original Answer',
  editedQuestion:   'Edited Question',
  editedAnswer:     'Edited Answer',
  useEditedVersion: 'Use Edited Version',
  isFlagged:        'Flagged',
  isApproved:       'Approved',
  strategyNote:     'Strategy Note',
  evidenceNote:     'Evidence Note',
  caseLawNote:      'Case Law Note',
};

export default function ComparePage() {
  const { id } = useParams();

  const [versions, setVersions] = useState([]);
  const [vA, setVA] = useState('');
  const [vB, setVB] = useState('');
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(true);

  // Fetch version list
  useEffect(() => {
    apiFetch(`/api/cross-exams/${id}/versions`)
      .then((d) => {
        setVersions(d.versions || []);
        // Auto-select the two most recent
        if (d.versions?.length >= 2) {
          setVA(String(d.versions[1].version));
          setVB(String(d.versions[0].version));
        } else if (d.versions?.length === 1) {
          setVA(String(d.versions[0].version));
        }
      })
      .catch(() => toast.error('Failed to load version history.'))
      .finally(() => setVersionsLoading(false));
  }, [id]);

  const handleCompare = async () => {
    if (!vA || !vB) { toast.error('Select two versions.'); return; }
    if (vA === vB)  { toast.error('Select different versions.'); return; }
    setLoading(true);
    try {
      const data = await apiFetch(`/api/cross-exams/${id}/compare?versionA=${vA}&versionB=${vB}`);
      setDiff(data);
    } catch (err) {
      toast.error(err.message || 'Failed to compare.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => (d ? format(new Date(d), 'dd MMM yyyy HH:mm') : '—');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cross-exams" className="hover:text-indigo-600">Cross-Examinations</Link>
        <span>/</span>
        <Link href={`/cross-exams/${id}`} className="hover:text-indigo-600">Edit</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Version History</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Version History & Compare</h1>

      {/* Version list */}
      {versionsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No version snapshots yet. Submit the document to create the first snapshot.</p>
        </div>
      ) : (
        <>
          {/* Version timeline */}
          <div className="mb-6 space-y-2">
            {versions.map((v) => (
              <div key={v.version} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  v{v.version}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{v.message || 'Version snapshot'}</p>
                  <p className="text-xs text-gray-400">{formatDate(v.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Compare selector */}
          {versions.length >= 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-700 mb-4">Compare Versions</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Version A</span>
                  <select
                    value={vA}
                    onChange={(e) => setVA(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— select —</option>
                    {versions.map((v) => (
                      <option key={v.version} value={String(v.version)}>v{v.version}</option>
                    ))}
                  </select>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Version B</span>
                  <select
                    value={vB}
                    onChange={(e) => setVB(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— select —</option>
                    {versions.map((v) => (
                      <option key={v.version} value={String(v.version)}>v{v.version}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {loading ? 'Comparing…' : 'Compare'}
                </button>
              </div>
            </div>
          )}

          {/* Diff results */}
          {diff && (
            <div>
              <div className="flex gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Added</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> Removed</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-200 inline-block" /> Modified</span>
              </div>
              {diff.diff.map((witness) => (
                <div key={witness.witnessId} className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">{witness.witnessName}</h3>
                    {DIFF_LABELS[witness.status]}
                  </div>
                  {witness.qaDiffs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {witness.qaDiffs.map((qa) => (
                        <div key={qa.qaId} className={`p-4 border-l-4 ${DIFF_COLOURS[qa.status]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500">Q{qa.sequence}</span>
                            {DIFF_LABELS[qa.status]}
                          </div>
                          {qa.changes.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {qa.changes.map((ch) => (
                                <div key={ch.field} className="text-sm">
                                  <span className="font-medium text-gray-600 text-xs uppercase">
                                    {FIELD_LABELS[ch.field] || ch.field}
                                  </span>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
                                      <span className="font-bold text-red-500">Before: </span>
                                      {String(ch.before) || <em>empty</em>}
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                                      <span className="font-bold text-green-600">After: </span>
                                      {String(ch.after) || <em>empty</em>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-400 italic">No QA pairs in this witness.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

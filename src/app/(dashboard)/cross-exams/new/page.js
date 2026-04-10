// app/(dashboard)/cross-exams/new/page.js
// Create a new cross-examination

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/utils/api';

export default function NewCrossExamPage() {
  const router = useRouter();
  const [cases,    setCases]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({
    title:       '',
    caseId:      '',
    hearingDate: '',
  });

  // Load existing cases so the user can link the cross-exam
  useEffect(() => {
    apiFetch('/api/cases?limit=100')
      .then((d) => setCases(d.cases || []))
      .catch(() => {}); // non-critical
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch('/api/cross-exams', {
        method: 'POST',
        body: JSON.stringify({
          title:       form.title.trim(),
          caseId:      form.caseId  || undefined,
          hearingDate: form.hearingDate || undefined,
        }),
      });
      toast.success('Cross-examination created!');
      router.push(`/cross-exams/${data.exam._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/cross-exams" className="hover:text-indigo-600">Cross-Examinations</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">New</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Cross-Examination</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Cross-examination of PW-3 (Eyewitness)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Linked case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Linked Case <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            name="caseId"
            value={form.caseId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Select a case —</option>
            {cases.map((c) => (
              <option key={c._id} value={c._id}>
                {c.caseTitle} {c.caseNumber ? `(${c.caseNumber})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Hearing date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hearing Date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            name="hearingDate"
            value={form.hearingDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Creating…' : 'Create Draft'}
          </button>
          <Link
            href="/cross-exams"
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

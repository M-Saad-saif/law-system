// ─────────────────────────────────────────────────────────────────────────────
// /cross-exams/new — Create a new cross-examination draft
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";

export default function NewCrossExamPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", caseId: "", hearingDate: "" });

  useEffect(() => {
    apiFetch("/api/cases?limit=100")
      .then((d) => setCases(d.cases || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/cross-exams", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          caseId: form.caseId || undefined,
          hearingDate: form.hearingDate || undefined,
        }),
      });
      toast.success("Draft created!");
      router.push(`/cross-exams/${data.exam._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link
            href="/cross-exams"
            className="hover:text-slate-800 transition-colors"
          >
            Cross-Examinations
          </Link>
          <svg
            className="w-3 h-3 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-800 font-medium">New Draft</span>
        </nav>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h1
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              New Cross-Examination
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the basic details. You'll add witnesses and Q&amp;A pairs
              on the next screen.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Cross-examination of PW-3 (Eyewitness)"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Linked case */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                Linked Case{" "}
                <span className="text-slate-400 font-normal normal-case">
                  (optional)
                </span>
              </label>
              <select
                name="caseId"
                value={form.caseId}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white appearance-none"
              >
                <option value="">— Select a case —</option>
                {cases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.caseTitle}
                    {c.caseNumber ? ` (${c.caseNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Hearing date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                Hearing Date{" "}
                <span className="text-slate-400 font-normal normal-case">
                  (optional)
                </span>
              </label>
              <input
                type="date"
                name="hearingDate"
                value={form.hearingDate}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {form.hearingDate && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Hearing date set — this document will be marked as
                  time-sensitive.
                </p>
              )}
            </div>

            {/* Workflow explanation */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                What happens next
              </p>
              <ol className="space-y-1.5">
                {[
                  "You draft → add witnesses + Q&A pairs",
                  "Submit → senior lawyer gets notified",
                  "Senior reviews inline, flags or approves each question",
                  "If changes needed → you revise and resubmit",
                  "Final approval → PDF export unlocked",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-500"
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating…
                  </span>
                ) : (
                  "Create Draft →"
                )}
              </button>
              <Link
                href="/cross-exams"
                className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

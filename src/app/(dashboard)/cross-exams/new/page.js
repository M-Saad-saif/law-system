"use client";

/**
 * /app/(dashboard)/cross-exams/new/page.js  (UPGRADED)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes vs original:
 *  - Added "Generate AI Questions" panel: lawyer provides case facts /
 *    witness info and AI produces structured cross-examination questions.
 *  - AI questions are shown in a preview textarea before the exam is created.
 *  - Questions can be edited, then the exam is created with them pre-loaded
 *    as initial witness section content (stored in additionalNotes for now,
 *    fully integrated with WitnessSection model if needed).
 *  - All original form behaviour preserved (title, case, hearing date).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const WITNESS_TYPES = [
  "Prosecution Witness (General)",
  "Eyewitness",
  "Investigating Officer (IO)",
  "Medical Expert / Doctor",
  "Forensic Expert",
  "Complainant",
  "Character Witness",
  "Expert Witness",
];

const CASE_TYPES = [
  "Murder / Qatl (302 PPC)",
  "Drug Trafficking (CNSA)",
  "Theft / Robbery (392/394 PPC)",
  "Fraud / Cheating (420 PPC)",
  "Assault / Bodily Harm",
  "Rape / Sexual Assault",
  "Kidnapping / Abduction",
  "Terrorism / ATA",
  "Civil Dispute",
  "Corruption / NAB",
  "Other",
];

export default function NewCrossExamPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Basic exam info ────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: "",
    caseId: "",
    hearingDate: "",
  });

  // ── Step 2: AI Question Generation ────────────────────────────────────────
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiFacts, setAiFacts] = useState("");
  const [aiWitnessType, setAiWitnessType] = useState(WITNESS_TYPES[0]);
  const [aiCaseType, setAiCaseType] = useState(CASE_TYPES[0]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState("");
  const [includeQuestions, setIncludeQuestions] = useState(true);

  useEffect(() => {
    apiFetch("/api/cases?limit=100")
      .then((d) => setCases(d.cases || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── AI: Generate questions from facts ─────────────────────────────────────
  const handleGenerateQuestions = async () => {
    if (!aiFacts.trim()) {
      toast.error("Please enter case facts or a witness statement first.");
      return;
    }
    setAiGenerating(true);
    try {
      const data = await apiFetch(
        "/api/applications/generate-cross-questions",
        {
          method: "POST",
          body: JSON.stringify({
            facts: aiFacts,
            witnessType: aiWitnessType,
            caseType: aiCaseType,
          }),
        },
      );
      setAiQuestions(data.questions || "");
      setIncludeQuestions(true);
      toast.success("Cross-examination questions generated!");
    } catch (err) {
      if (err.message?.includes("AI service unavailable")) {
        toast.error(
          "AI service not configured. Set OPENAI_API_KEY in .env.local.",
        );
      } else {
        toast.error(err.message || "Generation failed.");
      }
    } finally {
      setAiGenerating(false);
    }
  };

  // ── Create the cross-examination ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        title: form.title.trim(),
        caseId: form.caseId || undefined,
        hearingDate: form.hearingDate || undefined,
      };

      // Attach AI questions as initial content if generated and checkbox ticked
      if (aiQuestions && includeQuestions) {
        body.aiGeneratedQuestions = aiQuestions;
      }

      const data = await apiFetch("/api/cross-exams", {
        method: "POST",
        body: JSON.stringify(body),
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
      <div className="w-full max-w-2xl space-y-5">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
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

        {/* ── Basic Info Card ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
            <h1
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              New Cross-Examination
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the basic details, then optionally generate AI-powered
              questions.
            </p>
          </div>

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
            </div>

            {/* Workflow steps */}
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

        {/* ── AI Question Generator Panel ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAIPanel((v) => !v)}
            className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  AI Cross-Examination Generator
                </p>
                <p className="text-xs text-slate-500">
                  Paste case facts → get structured, court-ready questions
                </p>
              </div>
            </div>
            {showAIPanel ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAIPanel && (
            <div className="px-8 pb-6 space-y-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 pt-4">
                Provide the case facts, FIR contents, or witness statement
                below. The AI will generate 15–25 strategic questions grouped by
                theme (credibility, identification, procedural lapses, etc.)
                using Pakistani court conventions.
              </p>

              {/* Witness + Case Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Witness Type
                  </label>
                  <select
                    value={aiWitnessType}
                    onChange={(e) => setAiWitnessType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    {WITNESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Case Type
                  </label>
                  <select
                    value={aiCaseType}
                    onChange={(e) => setAiCaseType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    {CASE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Facts textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  Case Facts / Witness Statement
                </label>
                <textarea
                  value={aiFacts}
                  onChange={(e) => setAiFacts(e.target.value)}
                  rows={6}
                  placeholder={
                    "Paste the FIR text, witness statement, or a summary of the case facts here...\n\nExample:\nThe complainant states that on 15-03-2024 at 11pm he witnessed the accused at the scene. The IO arrived 2 hours later. The complainant did not know the accused prior to this incident."
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={aiGenerating || !aiFacts.trim()}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating
                    questions…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Cross-Examination
                    Questions
                  </>
                )}
              </button>

              {/* Generated questions output */}
              {aiQuestions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Generated Questions
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeQuestions}
                        onChange={(e) => setIncludeQuestions(e.target.checked)}
                        className="w-3.5 h-3.5 accent-violet-600"
                      />
                      <span className="text-xs text-slate-600">
                        Include when creating exam
                      </span>
                    </label>
                  </div>
                  <textarea
                    value={aiQuestions}
                    onChange={(e) => setAiQuestions(e.target.value)}
                    rows={14}
                    className="w-full border border-violet-200 rounded-xl px-4 py-3 text-xs text-slate-800 bg-violet-50/30 focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono resize-y"
                  />
                  <p className="text-xs text-slate-400">
                    You can edit the questions above before creating the exam.
                    They will be attached as initial content.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

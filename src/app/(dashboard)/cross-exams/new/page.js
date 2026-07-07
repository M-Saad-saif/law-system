"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Calendar,
  Layers,
} from "lucide-react";

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

  // ----- Step 1: Basic exam info -----
  const [form, setForm] = useState({
    title: "",
    caseId: "",
    hearingDate: "",
  });

  // ----- Step 2: AI Question Generation -----
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiFacts, setAiFacts] = useState("");
  const [aiWitnessType, setAiWitnessType] = useState(WITNESS_TYPES[0]);
  const [aiCaseType, setAiCaseType] = useState(CASE_TYPES[0]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiQuestions, setAiQuestions] = useState("");
  const [includeQuestions, setIncludeQuestions] = useState(true);

  useEffect(() => {
    apiFetch("/api/cases?limit=100")
      .then((d) => setCases(d.data?.cases || []))
      .catch((err) => {
        console.error("Failed to fetch cases:", err);
        toast.error("Failed to load cases");
      });
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ---- AI: Generate questions from facts ----
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
      setAiQuestions(data?.data?.questions || "");
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

  // --- Create the cross-examination ---
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
      const examId = data?.exam?._id || data?.data?.exam?._id;
      router.push(`/cross-exams/${examId}`);
    } catch (err) {
      toast.error(err.message || "Failed to create.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef5f3] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-6">
        {/* ------ Breadcrumb ------ */}
        <nav className="flex items-center gap-2 text-sm text-[#026665]">
          <Link
            href="/cross-exams"
            className="hover:text-[#0e9185] transition-colors font-medium"
          >
            Cross-Examinations
          </Link>
          <svg
            className="w-3 h-3 text-[#9fd8d1]"
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
          <span className="text-[#026665] font-bold">New Draft</span>
        </nav>

        {/* ---- Basic Info Card ---- */}
        <div className="bg-white rounded-3xl border border-[#9fd8d1]/30 shadow-xl overflow-hidden transition-all duration-200 hover:shadow-2xl">
          <div className="px-8 py-6 border-b border-[#eef5f3] bg-gradient-to-r from-[#eef5f3] to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#026665] flex items-center justify-center shadow-md shadow-[#026665]/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-[#000a0a]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  New Cross-Examination
                </h1>
                <p className="text-sm text-[#000000] mt-0.5">
                  Fill in the basic details, then optionally generate AI-powered
                  questions.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Cross-examination of PW-3 (Eyewitness)"
                className="w-full border border-[#9fd8d1]/40 rounded-2xl px-5 py-3.5 text-sm text-[#026665] placeholder-[#9fd8d1] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent transition-all duration-200 bg-[#eef5f3]/30"
                required
              />
            </div>

            {/* Linked case */}
            <div>
              <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-2">
                Linked Case{" "}
                <span className="text-[#9fd8d1] font-normal normal-case">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <select
                  name="caseId"
                  value={form.caseId}
                  onChange={handleChange}
                  className="w-full border border-[#9fd8d1]/40 rounded-2xl px-5 py-3.5 text-sm text-[#026665] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent bg-[#eef5f3]/30 appearance-none transition-all duration-200"
                >
                  <option value="">— Select a case —</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseTitle}
                      {c.caseNumber ? ` (${c.caseNumber})` : ""}
                    </option>
                  ))}
                </select>
                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9fd8d1] pointer-events-none" />
              </div>
            </div>

            {/* Hearing date */}
            <div>
              <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-2">
                Hearing Date{" "}
                <span className="text-[#9fd8d1] font-normal normal-case">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="hearingDate"
                  value={form.hearingDate}
                  onChange={handleChange}
                  className="w-full border border-[#9fd8d1]/40 rounded-2xl px-5 py-3.5 text-sm text-[#026665] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent bg-[#eef5f3]/30 transition-all duration-200"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9fd8d1] pointer-events-none" />
              </div>
            </div>

            {/* Workflow steps */}
            <div className="bg-gradient-to-br from-[#eef5f3] to-white rounded-2xl p-5 border border-[#9fd8d1]/30">
              <p className="text-xs font-bold text-[#026665] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e9185]"></span>
                What happens next
              </p>
              <ol className="space-y-2">
                {[
                  "You draft → add witnesses + Q&A pairs",
                  "Submit → senior lawyer gets notified",
                  "Senior reviews inline, flags or approves each question",
                  "If changes needed → you revise and resubmit",
                  "Final approval → PDF export unlocked",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-[#026665]/80"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#026665] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 shadow-sm shadow-[#026665]/20">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#026665] hover:bg-[#0e9185] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-[#026665]/20 hover:shadow-lg hover:shadow-[#026665]/30 flex items-center justify-center"
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
                className="flex-1 text-center bg-[#eef5f3] hover:bg-[#9fd8d1]/30 text-[#026665] font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 border border-[#9fd8d1]/30"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* ------ AI Question Generator Panel ------ */}
        <div className="bg-white rounded-3xl border border-[#9fd8d1]/30 shadow-xl overflow-hidden transition-all duration-200 hover:shadow-2xl">
          <button
            type="button"
            onClick={() => setShowAIPanel((v) => !v)}
            className="w-full flex items-center justify-between px-8 py-5 text-left hover:bg-[#eef5f3]/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#026665] to-[#0e9185] flex items-center justify-center shadow-md shadow-[#026665]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#026665]">
                  AI Cross-Examination Generator
                </p>
                <p className="text-xs text-[#0e9185]">
                  Paste case facts → get structured, court-ready questions
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#eef5f3] flex items-center justify-center">
              {showAIPanel ? (
                <ChevronUp className="w-4 h-4 text-[#026665]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#026665]" />
              )}
            </div>
          </button>

          {showAIPanel && (
            <div className="px-8 pb-7 space-y-5 border-t border-[#eef5f3]">
              <p className="text-sm text-[#026665]/70 pt-5 leading-relaxed">
                Provide the case facts, FIR contents, or witness statement
                below. The AI will generate 15–25 strategic questions grouped by
                theme (credibility, identification, procedural lapses, etc.)
                using Pakistani court conventions.
              </p>

              {/* Witness + Case Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-1.5">
                    Witness Type
                  </label>
                  <select
                    value={aiWitnessType}
                    onChange={(e) => setAiWitnessType(e.target.value)}
                    className="w-full border border-[#9fd8d1]/40 rounded-2xl px-4 py-3 text-sm text-[#026665] bg-[#eef5f3]/30 focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent transition-all duration-200"
                  >
                    {WITNESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-1.5">
                    Case Type
                  </label>
                  <select
                    value={aiCaseType}
                    onChange={(e) => setAiCaseType(e.target.value)}
                    className="w-full border border-[#9fd8d1]/40 rounded-2xl px-4 py-3 text-sm text-[#026665] bg-[#eef5f3]/30 focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent transition-all duration-200"
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
                <label className="block text-xs font-bold text-[#026665] uppercase tracking-wider mb-1.5">
                  Case Facts / Witness Statement
                </label>
                <textarea
                  value={aiFacts}
                  onChange={(e) => setAiFacts(e.target.value)}
                  rows={6}
                  placeholder={
                    "Paste the FIR text, witness statement, or a summary of the case facts here...\n\nExample:\nThe complainant states that on 15-03-2024 at 11pm he witnessed the accused at the scene. The IO arrived 2 hours later. The complainant did not know the accused prior to this incident."
                  }
                  className="w-full border border-[#9fd8d1]/40 rounded-2xl px-5 py-3.5 text-sm text-[#026665] placeholder-[#9fd8d1] focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent bg-[#eef5f3]/30 resize-none transition-all duration-200"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={aiGenerating || !aiFacts.trim()}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#026665] to-[#0e9185] hover:shadow-lg hover:shadow-[#026665]/30 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200"
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
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#026665] uppercase tracking-wider">
                      Generated Questions
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#eef5f3] px-3 py-1.5 rounded-full">
                      <input
                        type="checkbox"
                        checked={includeQuestions}
                        onChange={(e) => setIncludeQuestions(e.target.checked)}
                        className="w-4 h-4 accent-[#026665]"
                      />
                      <span className="text-xs text-[#026665] font-medium">
                        Include when creating exam
                      </span>
                    </label>
                  </div>
                  <textarea
                    value={aiQuestions}
                    onChange={(e) => setAiQuestions(e.target.value)}
                    rows={14}
                    className="w-full border-2 border-[#9fd8d1]/50 rounded-2xl px-5 py-3.5 text-xs text-[#026665] bg-[#eef5f3]/20 focus:outline-none focus:ring-2 focus:ring-[#0e9185] focus:border-transparent font-mono resize-y transition-all duration-200"
                  />
                  <p className="text-xs text-[#0e9185]">
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

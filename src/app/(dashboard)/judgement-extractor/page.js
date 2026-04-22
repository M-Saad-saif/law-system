"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import {
  Sparkles,
  Upload,
  FileText,
  RefreshCw,
  Save,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Scale,
  Gavel,
  AlertCircle,
  Check,
  X,
  Tag,
  Trophy,
} from "lucide-react";

const SECTIONS = [
  {
    key: "offenceName",
    label: "1. Offence Name",
    color: "bg-red-50 border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  {
    key: "courtName",
    label: "2. Court Name",
    color: "bg-blue-50 border-blue-200",
    icon: Scale,
    iconColor: "text-blue-500",
  },
  {
    key: "lawsDiscussed",
    label: "3. Laws Discussed",
    color: "bg-purple-50 border-purple-200",
    icon: BookOpen,
    iconColor: "text-purple-500",
  },
  {
    key: "crossExaminationQuestions",
    label: "4. Cross-Examination Questions",
    color: "bg-amber-50 border-amber-200",
    icon: Gavel,
    iconColor: "text-amber-500",
  },
  {
    key: "courtExaminationOfEvidence",
    label: "5. Court Examination of Evidence",
    color: "bg-orange-50 border-orange-200",
    icon: FileText,
    iconColor: "text-orange-500",
  },
  {
    key: "finalDecision",
    label: "6. Final Decision",
    color: "bg-green-50 border-green-200",
    icon: Check,
    iconColor: "text-green-600",
  },
  {
    key: "voiceSummary",
    label: "7. Comprehensive Voice Summary",
    color: "bg-teal-50 border-teal-200",
    icon: Sparkles,
    iconColor: "text-teal-600",
  },
];

function SectionCard({ section, value, onChange, isEditing }) {
  const Icon = section.icon;
  return (
    <div className={`rounded-xl border p-4 ${section.color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${section.iconColor} shrink-0`} />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {section.label}
        </p>
      </div>
      {isEditing ? (
        <textarea
          className="w-full text-sm text-slate-800 bg-white/70 border border-white/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none min-h-[80px]"
          value={value || ""}
          onChange={(e) => onChange(section.key, e.target.value)}
        />
      ) : (
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {value || (
            <span className="text-slate-400 italic">
              Not found in judgement text
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default function JudgementExtractorPage() {
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isMostImportant, setIsMostImportant] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => setRawText(ev.target.result);
      reader.readAsText(file);
    } else {
      toast.error(
        "Please upload a .txt file. For PDF/DOCX, paste the copied text.",
      );
    }
  };

  const handleExtract = async () => {
    if (!rawText.trim()) {
      toast.error("Please paste judgement text first.");
      return;
    }
    setExtracting(true);
    setExtracted(null);
    try {
      const res = await api.post("/api/judgement-extractor", { rawText });
      const data = res?.data?.extracted;
      setExtracted(data);
      setEditData(data);
      toast.success("Judgement extracted successfully!");
    } catch (err) {
      toast.error(err?.message || "Extraction failed. Check AI configuration.");
    } finally {
      setExtracting(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const handleSaveToLibrary = async () => {
    const payload = isEditing ? editData : extracted;
    if (!payload?.title && !payload?.citation) {
      toast.error("Extracted data has no title or citation.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/judgement-extractor", {
        ...payload,
        rawText,
        tags,
        isMostImportant,
      });
      toast.success("Saved to Judgement Library!");
    } catch {
      toast.error("Failed to save to library.");
    } finally {
      setSaving(false);
    }
  };

  const displayData = isEditing ? editData : extracted;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            AI Judgement Extractor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Paste raw judgement text — AI extracts the 7 structured sections
            instantly
          </p>
        </div>
        {extracted && (
          <button
            onClick={handleSaveToLibrary}
            disabled={saving}
            className="btn-primary shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save to Library"}
          </button>
        )}
      </div>

      {/* Input panel */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Judgement Text Input
            {showRaw ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="btn-secondary text-xs gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .txt
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {(showRaw || !extracted) && (
          <textarea
            className="textarea h-52 font-mono text-xs"
            placeholder={`Paste the full raw judgement text here...\n\nExample:\nIN THE SUPREME COURT OF PAKISTAN\n(Appellate Jurisdiction)\nPresent: Mr. Justice ...\nCriminal Appeal No. ... of ...\n\nState vs Ahmed Ali\n...\nORDER: The appeal is allowed. The accused is acquitted...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        )}

        {rawText && !showRaw && extracted && (
          <p className="text-xs text-slate-400 italic">
            {rawText.length.toLocaleString()} characters loaded. Click above to
            view/edit.
          </p>
        )}

        <button
          onClick={handleExtract}
          disabled={extracting || !rawText.trim()}
          className="btn-primary w-full"
        >
          {extracting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Extracting & Analysing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Extract & Analyse
            </>
          )}
        </button>
      </div>

      {/* Results panel */}
      {extracted && (
        <div className="space-y-4">
          {/* Citation + controls */}
          <div className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {displayData?.citation && (
                  <p className="text-xs font-mono text-teal-600 font-bold mb-0.5">
                    {displayData.citation}
                  </p>
                )}
                <h2 className="text-lg font-bold text-slate-800">
                  {displayData?.title || "Extracted Judgement"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing((v) => !v);
                    if (!isEditing) setEditData({ ...extracted });
                  }}
                  className="btn-secondary text-xs gap-1.5"
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Done Editing
                    </>
                  ) : (
                    "Edit Sections"
                  )}
                </button>
                <button
                  onClick={() => {
                    setExtracted(null);
                    setEditData({});
                    setTags([]);
                    setIsEditing(false);
                  }}
                  className="btn-ghost text-xs text-slate-400"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </div>

          {/* 7 Section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTIONS.map((section) => (
              <SectionCard
                key={section.key}
                section={section}
                value={displayData?.[section.key]}
                onChange={handleFieldChange}
                isEditing={isEditing}
              />
            ))}
          </div>

          {/* Tags + Most Important + Save */}
          <div className="card p-5 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Before saving to library
            </p>

            {/* Tags */}
            <div>
              <label className="label">Tags</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="e.g. Criminal, Bail, High Court..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button onClick={handleAddTag} className="btn-secondary px-3">
                  <Tag className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                      <button
                        onClick={() =>
                          setTags((prev) => prev.filter((x) => x !== t))
                        }
                        className="ml-0.5 hover:text-red-500"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Most Important */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMostImportant}
                onChange={(e) => setIsMostImportant(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Mark as Most Important
              </span>
            </label>

            <button
              onClick={handleSaveToLibrary}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save to Judgement Library"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

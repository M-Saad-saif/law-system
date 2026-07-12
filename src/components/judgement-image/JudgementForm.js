"use client";

import { useState } from "react";
import {
  Scale,
  FileText,
  Hash,
  Building2,
  Calendar,
  Gavel,
  User,
  Users,
  AlertCircle,
  Search,
  Plus,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";


const FormField = ({
  icon: Icon,
  label,
  required,
  children,
  className = "",
}) => (
  <div
    className={`bg-white shadow-[4px_4px_23px_-13px_rgba(0,0,0,0.25)] rounded-xl border border-[#b7e3dd]/20  p-4 ${className}`}
  >
    <label className="flex items-center gap-1.5 text-[15px] font-semibold text-gray-700 mb-2">
      <Icon className="w-3.5 h-3.5 text-[#0d9286]" />
      {label}
      {required && <span className="text-[#026e6d]">*</span>}
    </label>
    {children}
  </div>
);

const ErrorMessage = ({ message }) => (
  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" />
    {message}
  </p>
);

const JudgementForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    judgementTitle: initialData.judgementTitle || "",
    caseNumber: initialData.caseNumber || "",
    courtName: initialData.courtName || "",
    logoUrl: initialData.logoUrl || "",
    judgementDate: initialData.judgementDate || "",
    judgeName: initialData.judgeName || "",
    keyFindings: initialData.keyFindings || "",
    finalDecision: initialData.finalDecision || "",
    relevantSections: initialData.relevantSections || [],
    petitioner: initialData.petitioner || "",
    respondent: initialData.respondent || "",
    sectionInput: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoadingCase, setIsLoadingCase] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addSection = () => {
    if (formData.sectionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        relevantSections: [...prev.relevantSections, prev.sectionInput.trim()],
        sectionInput: "",
      }));
    }
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      relevantSections: prev.relevantSections.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.judgementTitle)
      newErrors.judgementTitle = "Judgement title is required";
    if (!formData.caseNumber) newErrors.caseNumber = "Case number is required";
    if (!formData.courtName) newErrors.courtName = "Court name is required";
    if (!formData.finalDecision)
      newErrors.finalDecision = "Final decision is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const loadFromCase = async (caseId) => {
    if (!caseId.trim()) return;

    setIsLoadingCase(true);
    try {
      const response = await fetch(
        `/api/cases?search=${encodeURIComponent(caseId)}&limit=1`,
      );
      const payload = await response.json();
      const caseDoc = payload?.data?.cases?.[0];

      if (!caseDoc) {
        console.warn("No case found for:", caseId);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        judgementTitle: caseDoc.caseTitle,
        caseNumber: caseDoc.caseNumber || caseDoc.firNo,
        courtName: caseDoc.courtName,
        petitioner: caseDoc.counselFor,
        respondent: caseDoc.oppositeCounsel?.name,
      }));
    } catch (error) {
      console.error("Failed to load case:", error);
    } finally {
      setIsLoadingCase(false);
    }
  };

  const getInputClasses = (fieldName) => `
    w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0d9286] 
    focus:border-[#0d9286] outline-none transition-all duration-200 bg-white text-sm
    ${
      errors[fieldName]
        ? "border-red-400 bg-red-50"
        : "border-[#b7e3dd]/50 hover:border-[#0d9286]/50"
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171a2a] to-[#026e6d] text-white px-6 py-5 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0d9286]/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="bg-white/15 rounded-xl p-2.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Generate Judgement Image</h2>
            <p className="text-white/70 text-xs mt-0.5">
              Fill in the case details to create a professional legal document
            </p>
          </div>
        </div>
      </div>

      {/* Quick Load */}
      <div className="bg-white rounded-xl border border-[#b7e3dd]/30 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <Search className="w-4 h-4 text-[#026e6d]" />
          <label className="text-sm font-semibold text-[#171a2a]">
            Quick Load from Existing Case
          </label>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter Case ID or FIR Number"
              className="w-full pl-9 pr-3 py-2.5 border border-[#b7e3dd]/40 rounded-lg focus:ring-2 focus:ring-[#0d9286] focus:border-[#0d9286] outline-none text-sm bg-[#eef5f3]/20"
              id="caseSearch"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  loadFromCase(e.target.value);
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() =>
              loadFromCase(document.getElementById("caseSearch").value)
            }
            disabled={isLoadingCase}
            className="px-4 py-2.5 bg-[#026e6d] text-white rounded-lg hover:bg-[#0d9286] transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingCase ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {isLoadingCase ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <FormField icon={FileText} label="Judgement Title" required>
            <input
              type="text"
              name="judgementTitle"
              value={formData.judgementTitle}
              onChange={handleChange}
              onInput={handleChange}
              placeholder="State vs. Accused Name"
              className={getInputClasses("judgementTitle")}
            />
            {errors.judgementTitle && (
              <ErrorMessage message={errors.judgementTitle} />
            )}
          </FormField>

          <FormField icon={Hash} label="Case Number" required>
            <input
              type="text"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              onInput={handleChange}
              placeholder="2024 SCMR 1002"
              className={getInputClasses("caseNumber")}
            />
            {errors.caseNumber && <ErrorMessage message={errors.caseNumber} />}
          </FormField>

          <FormField icon={Building2} label="Court Name" required>
            <select
              name="courtName"
              value={formData.courtName}
              onChange={handleChange}
              onInput={handleChange}
              className={getInputClasses("courtName")}
            >
              <option value="">Select Court</option>
              <option>Supreme Court of Pakistan</option>
              <option>Lahore High Court</option>
              <option>Sindh High Court</option>
              <option>Islamabad High Court</option>
              <option>Peshawar High Court</option>
              <option>Balochistan High Court</option>
              <option>Sessions Court</option>
              <option>Special Court (Anti-Terrorism)</option>
            </select>
            {errors.courtName && <ErrorMessage message={errors.courtName} />}
          </FormField>

          <FormField icon={Calendar} label="Judgement Date">
            <input
              type="date"
              name="judgementDate"
              value={formData.judgementDate}
              onChange={handleChange}
              onInput={handleChange}
              className={getInputClasses("judgementDate")}
            />
          </FormField>

          <FormField icon={Gavel} label="Judge Name">
            <input
              type="text"
              name="judgeName"
              value={formData.judgeName}
              onChange={handleChange}
              onInput={handleChange}
              placeholder="Justice Qazi Faez Isa"
              className={getInputClasses("judgeName")}
            />
          </FormField>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <FormField icon={User} label="Petitioner / Appellant">
            <input
              type="text"
              name="petitioner"
              value={formData.petitioner}
              onChange={handleChange}
              onInput={handleChange}
              placeholder="Muhammad Ali"
              className={getInputClasses("petitioner")}
            />
          </FormField>

          <FormField icon={Users} label="Respondent / State">
            <input
              type="text"
              name="respondent"
              value={formData.respondent}
              onChange={handleChange}
              onInput={handleChange}
              placeholder="The State"
              className={getInputClasses("respondent")}
            />
          </FormField>

          <FormField icon={BookOpen} label="Key Findings">
            <textarea
              name="keyFindings"
              value={formData.keyFindings}
              onChange={handleChange}
              onInput={handleChange}
              rows="3"
              placeholder="Summarize the key legal principles..."
              className={`${getInputClasses("keyFindings")} resize-none`}
            />
          </FormField>

          <FormField icon={Scale} label="Final Decision" required>
            <textarea
              name="finalDecision"
              value={formData.finalDecision}
              onChange={handleChange}
              onInput={handleChange}
              rows="2"
              placeholder="Bail granted, Appeal allowed..."
              className={`${getInputClasses("finalDecision")} resize-none`}
            />
            {errors.finalDecision && (
              <ErrorMessage message={errors.finalDecision} />
            )}
          </FormField>

          <FormField icon={BookOpen} label="Relevant Laws / Sections">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="sectionInput"
                value={formData.sectionInput}
                onChange={handleChange}
                onInput={handleChange}
                placeholder="Section 302 PPC"
                className="flex-1 px-3.5 py-2.5 border border-[#b7e3dd]/40 rounded-lg focus:ring-2 focus:ring-[#0d9286] focus:border-[#0d9286] outline-none text-sm bg-white"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSection())
                }
              />
              <button
                type="button"
                onClick={addSection}
                className="px-3 py-2.5 bg-[#026e6d] text-white rounded-lg hover:bg-[#0d9286] transition-all text-sm font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {formData.relevantSections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.relevantSections.map((section, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eef5f3] text-[#026e6d] text-xs rounded-md border border-[#0d9286]/20"
                  >
                    {section}
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#171a2a] to-[#026e6d] text-white rounded-xl hover:shadow-lg hover:shadow-[#026e6d]/20 transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Generate Judgement Image
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border-2 border-[#b7e3dd]/40 rounded-xl hover:bg-[#eef5f3] transition-all duration-200 font-medium text-sm text-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default JudgementForm;

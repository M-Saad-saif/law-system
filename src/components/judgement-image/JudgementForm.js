"use client";

import { useState } from "react";

const JudgementForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    judgementTitle: initialData.judgementTitle || "",
    caseNumber: initialData.caseNumber || "",
    courtName: initialData.courtName || "",
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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto p-6">
      {/* Header with new color theme */}
      <div className="bg-gradient-to-br from-[#171a2a] via-[#1e2235] to-[#026665] text-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Auto Judgement Image Generator
          </h2>
        </div>
        <p className="text-white/80 text-sm ml-13">
          Fill in the details below to generate a professional, branded
          judgement image
        </p>
      </div>

      {/* Quick Load Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-[#171a2a] mb-3">
          Quick Load from Existing Case
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Case ID or FIR Number"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
            id="caseSearch"
          />
          <button
            type="button"
            onClick={() =>
              loadFromCase(document.getElementById("caseSearch").value)
            }
            className="px-6 py-2.5 bg-[#171a2a] text-white rounded-lg hover:bg-[#026665] transition-all duration-200 font-medium"
          >
            Load Case
          </button>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Judgement Title */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Judgement Title / Case Name{" "}
              <span className="text-[#026665]">*</span>
            </label>
            <input
              type="text"
              name="judgementTitle"
              value={formData.judgementTitle}
              onChange={handleChange}
              placeholder="e.g., State vs. Accused Name"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all ${
                errors.judgementTitle
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {errors.judgementTitle && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.judgementTitle}
              </p>
            )}
          </div>

          {/* Case Number */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Case Number / Citation <span className="text-[#026665]">*</span>
            </label>
            <input
              type="text"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              placeholder="e.g., 2024 SCMR 1002"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all ${
                errors.caseNumber
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {errors.caseNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.caseNumber}
              </p>
            )}
          </div>

          {/* Court Name */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Court Name <span className="text-[#026665]">*</span>
            </label>
            <select
              name="courtName"
              value={formData.courtName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all bg-white ${
                errors.courtName
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
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
            {errors.courtName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.courtName}
              </p>
            )}
          </div>

          {/* Judgement Date */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Judgement Date
            </label>
            <input
              type="date"
              name="judgementDate"
              value={formData.judgementDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
            />
          </div>

          {/* Judge Name */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Judge Name
            </label>
            <input
              type="text"
              name="judgeName"
              value={formData.judgeName}
              onChange={handleChange}
              placeholder="e.g., Justice Qazi Faez Isa"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Petitioner */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Petitioner / Appellant
            </label>
            <input
              type="text"
              name="petitioner"
              value={formData.petitioner}
              onChange={handleChange}
              placeholder="e.g., Muhammad Ali"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
            />
          </div>

          {/* Respondent */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Respondent / State
            </label>
            <input
              type="text"
              name="respondent"
              value={formData.respondent}
              onChange={handleChange}
              placeholder="e.g., The State"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
            />
          </div>

          {/* Key Findings */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Key Findings / Observations
            </label>
            <textarea
              name="keyFindings"
              value={formData.keyFindings}
              onChange={handleChange}
              rows="3"
              placeholder="Summarize the key legal principles established..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all resize-none"
            />
          </div>

          {/* Final Decision */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Final Decision <span className="text-[#026665]">*</span>
            </label>
            <textarea
              name="finalDecision"
              value={formData.finalDecision}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., Bail granted, Appeal allowed, Conviction upheld..."
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all resize-none ${
                errors.finalDecision
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
            />
            {errors.finalDecision && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.finalDecision}
              </p>
            )}
          </div>

          {/* Relevant Sections */}
          <div>
            <label className="block text-sm font-semibold text-[#171a2a] mb-2">
              Relevant Laws / Sections
            </label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                name="sectionInput"
                value={formData.sectionInput}
                onChange={handleChange}
                placeholder="e.g., Section 302 PPC"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#026665] focus:border-[#026665] outline-none transition-all"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSection())
                }
              />
              <button
                type="button"
                onClick={addSection}
                className="px-5 py-2.5 bg-[#026665] text-white rounded-lg hover:bg-[#048b8a] transition-all duration-200 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.relevantSections.map((section, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-[#026665]/10 text-[#026665] text-sm rounded-lg flex items-center gap-2 border border-[#026665]/20"
                >
                  {section}
                  <button
                    type="button"
                    onClick={() => removeSection(idx)}
                    className="text-[#171a2a] hover:text-red-600 transition-colors ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#171a2a] via-[#1e2235] to-[#026665] text-white rounded-xl hover:shadow-lg hover:shadow-[#026665]/20 transition-all duration-300 font-semibold text-lg"
        >
          Generate Judgement Image
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default JudgementForm;

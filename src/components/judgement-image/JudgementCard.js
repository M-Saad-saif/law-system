"use client";

import { useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { saveAs } from "file-saver";

const JudgementCard = ({ data, onImageGenerated }) => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const safeData = data || {};

  // Formal legal brand colors
  const brandColors = {
    primary: "#171a2a", // Dark navy - authoritative
    secondary: "#026665", // Teal - trustworthy
    accent: "#0a4d4c", // Darker teal for accents
    textDark: "#1e1e1e",
    textLight: "#ffffff",
    background: "#f5f5f5",
    border: "#d4d4d4",
    gold: "#9b7b3c", // Subtle gold for hierarchy
  };

  const generateImage = async (format = "png") => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      let dataUrl;
      if (format === "png") {
        dataUrl = await toPng(cardRef.current, {
          quality: 1.0,
          pixelRatio: 2.5,
          backgroundColor: brandColors.background,
        });
      } else {
        dataUrl = await toJpeg(cardRef.current, {
          quality: 0.98,
          pixelRatio: 2.5,
          backgroundColor: brandColors.background,
        });
      }

      setPreviewUrl(dataUrl);

      if (onImageGenerated) {
        onImageGenerated(dataUrl, format);
      }

      return dataUrl;
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (format = "png") => {
    const dataUrl = await generateImage(format);
    if (dataUrl) {
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      saveAs(
        dataUrl,
        `judgement_${safeData.caseNumber || timestamp}.${format}`,
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Preview Area with subtle background */}
      <div className="bg-[#f0f0f0] p-10 rounded-xl flex justify-center overflow-x-auto shadow-inner">
        <div
          ref={cardRef}
          className="relative w-[850px] bg-white shadow-2xl overflow-hidden"
          style={{ fontFamily: "'Times New Roman', 'Georgia', 'Serif'" }}
        >
          {/* Top Border - Formal */}
          <div className="h-1 bg-gradient-to-r from-[#171a2a] via-[#026665] to-[#171a2a]" />

          {/* Main Content */}
          <div className="p-10">
            {/* Court Emblem Placeholder & Header */}
            <div className="text-center mb-8 border-b-2 border-[#171a2a]/20 pb-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-[#171a2a]/5 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#026665]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#171a2a] tracking-wide">
                ADV. SANAAULLAH LAW ASSOCIATES
              </div>
              <div className="text-xs text-[#026665] uppercase tracking-wider mt-1">
                Advocates & Legal Consultants
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                Supreme Court of Pakistan | High Courts | Sessions Courts
              </div>
            </div>

            {/* Document Type */}
            <div className="text-center mb-6">
              <div className="inline-block px-6 py-1 bg-[#171a2a]/5 border-l-2 border-r-2 border-[#026665]">
                <span className="text-xs font-semibold text-[#026665] uppercase tracking-widest">
                  Certified Judgement Summary
                </span>
              </div>
            </div>

            {/* Case Citation - Formal */}
            <div className="mb-6 text-center">
              <div className="text-xs font-semibold text-[#171a2a] uppercase tracking-wider mb-2">
                Before the Hon'ble Court
              </div>
              <div className="text-2xl font-bold text-[#171a2a] leading-tight">
                {safeData.judgementTitle ||
                  safeData.caseNumber ||
                  "Important Legal Precedent"}
              </div>
              {safeData.caseNumber &&
                safeData.caseNumber !== safeData.judgementTitle && (
                  <div className="text-sm text-gray-500 mt-1 font-mono">
                    {safeData.caseNumber}
                  </div>
                )}
            </div>

            {/* Court Info Grid - Formal Layout */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 p-4 border border-gray-200 bg-gray-50/30">
              <div className="flex">
                <span className="text-xs font-semibold text-[#171a2a] w-24">
                  Court:
                </span>
                <span className="text-sm text-gray-700">
                  {safeData.courtName || "Supreme Court of Pakistan"}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs font-semibold text-[#171a2a] w-24">
                  Judge(s):
                </span>
                <span className="text-sm text-gray-700">
                  {safeData.judgeName || "Hon'ble Chief Justice"}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs font-semibold text-[#171a2a] w-24">
                  Judgement Date:
                </span>
                <span className="text-sm text-gray-700">
                  {formatDate(safeData.judgementDate)}
                </span>
              </div>
              <div className="flex">
                <span className="text-xs font-semibold text-[#171a2a] w-24">
                  Parties:
                </span>
                <span className="text-sm text-gray-700">
                  {safeData.petitioner || "Petitioner"}{" "}
                  <span className="text-[#026665]">vs</span>{" "}
                  {safeData.respondent || "Respondent"}
                </span>
              </div>
            </div>

            {/* Key Findings */}
            {safeData.keyFindings && (
              <div className="mb-6">
                <div className="text-sm font-bold text-[#171a2a] mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#026665]"></span>
                  <span>OBSERVATIONS & FINDINGS</span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-[#026665]/30">
                  {safeData.keyFindings}
                </div>
              </div>
            )}

            {/* Relevant Laws */}
            {safeData.relevantSections &&
              safeData.relevantSections.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-bold text-[#171a2a] mb-2">
                    PROVISIONS REFERRED
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {safeData.relevantSections.map((section, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#171a2a]/5 text-[#171a2a] text-xs border border-[#171a2a]/20 font-mono"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Final Decision - Prominent */}
            {safeData.finalDecision && (
              <div className="mb-6 mt-8 p-5 bg-[#171a2a]/5 border-l-4 border-[#026665]">
                <div className="text-xs font-semibold text-[#026665] uppercase tracking-wider mb-1">
                  Judgement Delivered
                </div>
                <div className="text-base font-bold text-[#171a2a] leading-relaxed">
                  {safeData.finalDecision}
                </div>
              </div>
            )}

            {/* Registrar's Seal Placeholder */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
              <div className="flex gap-4">
                <span>Certified True Copy</span>
                <span>•</span>
                <span>For information purposes only</span>
              </div>
              <div className="text-right">
                <div>www.sanaullahlaw.com</div>
                <div>info@sanaullahlaw.com</div>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="h-1 bg-gradient-to-r from-[#171a2a] via-[#026665] to-[#171a2a]" />
        </div>
      </div>

      {/* Controls - Formal Style */}
      <div className="flex gap-4 justify-center pt-4">
        <button
          onClick={() => downloadImage("png")}
          disabled={isGenerating}
          className="px-8 py-2.5 bg-[#171a2a] text-white text-sm font-medium tracking-wide hover:bg-[#026665] disabled:opacity-50 transition-all duration-200 shadow-sm"
        >
          {isGenerating ? "PROCESSING..." : "DOWNLOAD PNG"}
        </button>
        <button
          onClick={() => downloadImage("jpeg")}
          disabled={isGenerating}
          className="px-8 py-2.5 border border-[#171a2a] text-[#171a2a] text-sm font-medium tracking-wide hover:bg-[#171a2a]/5 transition-all duration-200"
        >
          DOWNLOAD JPEG
        </button>
      </div>

      {/* Share Options */}
      {previewUrl && (
        <div className="flex gap-6 justify-center pt-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(previewUrl);
              alert("Image URL copied to clipboard!");
            }}
            className="text-xs text-gray-400 hover:text-[#026665] uppercase tracking-wide"
          >
            Copy URL
          </button>
          {navigator.share && (
            <button
              onClick={() => {
                navigator.share({
                  title: "Legal Judgement Summary",
                  text: safeData.judgementTitle || safeData.caseNumber,
                  url: previewUrl,
                });
              }}
              className="text-xs text-gray-400 hover:text-[#026665] uppercase tracking-wide"
            >
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgementCard;

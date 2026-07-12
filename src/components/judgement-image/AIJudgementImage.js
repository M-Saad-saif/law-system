"use client";

import { useState } from "react";
import toast from "react-hot-toast";

// Calls the AI image generator and shows the resulting artwork.
// Unlike JudgementCard (which screenshots a styled DOM node), this component
// asks the server to generate a brand-new image via a text-to-image model,
// with the case details rendered directly into the picture.
const AIJudgementImage = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const safeData = data || {};

  const generate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/judgement-images/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate AI image");
      }

      setImageUrl(result.imageUrl);
      toast.success("AI image generated and saved");
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to generate AI image");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `judgement_ai_${safeData.caseNumber || Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <h3 className="text-lg font-semibold text-[#171a2a] mb-1">
          AI Generated Judgement Image
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Generates a unique piece of artwork with your case details rendered
          into the image itself (not a screenshot of the template above).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-left">
            {error}
          </div>
        )}

        {imageUrl ? (
          <div className="space-y-4">
            <img
              src={imageUrl}
              alt="AI generated judgement summary"
              className="w-full rounded-lg border border-gray-200 shadow-md"
            />
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={downloadImage}
                className="px-6 py-2.5 bg-[#171a2a] text-white text-sm font-medium rounded-lg hover:bg-[#026665] transition-all"
              >
                Download Image
              </button>
              <button
                onClick={generate}
                disabled={isGenerating}
                className="px-6 py-2.5 border border-[#171a2a] text-[#171a2a] text-sm font-medium rounded-lg hover:bg-[#171a2a]/5 disabled:opacity-50 transition-all"
              >
                {isGenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={generate}
            disabled={isGenerating}
            className="px-8 py-3 bg-gradient-to-r from-[#171a2a] via-[#1e2235] to-[#026665] text-white rounded-xl hover:shadow-lg hover:shadow-[#026665]/20 disabled:opacity-50 transition-all duration-300 font-semibold"
          >
            {isGenerating ? "Generating AI Image..." : "Generate AI Image"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIJudgementImage;

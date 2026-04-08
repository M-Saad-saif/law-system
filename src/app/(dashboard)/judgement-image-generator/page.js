"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import JudgementForm from "@/components/judgement-image/JudgementForm";
import JudgementCard from "@/components/judgement-image/JudgementCard";

export default function JudgementImageGenerator() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (data) => {
    setFormData(data);
    setShowPreview(true);
    setError(null);

    // Auto-scroll to preview
    setTimeout(() => {
      document.getElementById("preview-section")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleImageGenerated = async (imageDataUrl, format) => {
    setIsSaving(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("image", blob, `judgement_${Date.now()}.${format}`);
      uploadFormData.append("inputData", JSON.stringify(formData));

      console.log("Uploading image...", {
        format,
        blobSize: blob.size,
        formData: formData,
      });

      // Save to server
      const uploadResponse = await fetch("/api/judgement-images", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error("Upload failed:", result);
        throw new Error(result.error || "Failed to save image");
      }

      toast.success("Image generated and saved successfully");
    } catch (error) {
      setError(error.message);
      toast.error("Failend to save image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setFormData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!showPreview ? (
          <>
            <JudgementForm onSubmit={handleFormSubmit} />

            {/* Recent Images Gallery */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recently Generated Images
              </h3>
              <RecentImagesGallery />
            </div>
          </>
        ) : (
          <div id="preview-section">
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={handleBackToForm}
                className="text-[#171a2a] hover:text-[#026665] flex items-center gap-2"
              >
                ← Back to Form
              </button>
              {isSaving && (
                <span className="text-sm text-gray-500">Saving image...</span>
              )}
            </div>
            <JudgementCard
              data={formData}
              onImageGenerated={handleImageGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Recent Images Gallery Component
function RecentImagesGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    fetchRecentImages();
  }, []);

  const fetchRecentImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/judgement-images?limit=6");

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading recent images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Failed to load images: {error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images generated yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Fill out the form above to create your first judgement image
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div
          key={image._id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <img
            src={image.imageUrl}
            alt={image.inputData?.judgementTitle || "Judgement image"}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          <div className="p-3">
            <p className="font-medium text-sm truncate">
              {image.inputData?.judgementTitle || "Untitled"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(image.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Add React import at the top if not already there
import React from "react";

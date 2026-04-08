"use client";

import { useEffect, useState } from "react";
import JudgementForm from "@/components/judgement-image/JudgementForm";
import JudgementCard from "@/components/judgement-image/JudgementCard";

export default function JudgementImageGenerator() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async (data) => {
    setFormData(data);
    setShowPreview(true);

    // Auto-scroll to preview
    setTimeout(() => {
      document.getElementById("preview-section")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleImageGenerated = async (imageDataUrl, format) => {
    setIsSaving(true);

    try {
      // Convert data URL to blob
      const blob = await fetch(imageDataUrl).then((res) => res.blob());

      // Create form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("image", blob, `judgement_${Date.now()}.${format}`);
      uploadFormData.append("inputData", JSON.stringify(formData));

      const response = await fetch("/api/judgement-images", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Image saved:", result);

        toast.success("Image generated and saved!");
      }
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToForm = () => {
    setShowPreview(false);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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
            <div className="mb-4">
              <button
                onClick={handleBackToForm}
                className="text-[#1a3e6f] hover:underline flex items-center gap-2"
              ></button>
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

  useEffect(() => {
    fetchRecentImages();
  }, []);

  const fetchRecentImages = async () => {
    try {
      const response = await fetch("/api/judgement-images?limit=6");
      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

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
            alt={image.inputData.judgementTitle}
            className="w-full h-48 object-cover"
          />
          <div className="p-3">
            <p className="font-medium text-sm truncate">
              {image.inputData.judgementTitle}
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

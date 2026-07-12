"use client";

import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { 
  Scale, 
  Palette, 
  Bot, 
  Zap, 
  Cloud, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle, 
  X, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Wifi,
  FileText,
  Eye,
  ChevronLeft
} from "lucide-react";
import JudgementForm from "@/components/judgement-image/JudgementForm";
import JudgementCard from "@/components/judgement-image/JudgementCard";
import AIJudgementImage from "@/components/judgement-image/AIJudgementImage";
import Image from "next/image";

export default function JudgementImageGenerator() {
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("template");
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const handleFormSubmit = async (data) => {
    setFormData(data);
    setShowPreview(true);
    setError(null);

    setTimeout(() => {
      document.getElementById("preview-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleImageGenerated = async (imageDataUrl, format) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      const uploadFormData = new FormData();
      uploadFormData.append("image", blob, `judgement_${Date.now()}.${format}`);
      uploadFormData.append("inputData", JSON.stringify(formData));

      const uploadResponse = await fetch("/api/judgement-images", {
        method: "POST",
        body: uploadFormData,
      });

      const result = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(result.error || "Failed to save image");
      }

      toast.success("Image generated and saved successfully!");
      setGalleryRefreshKey((k) => k + 1);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to save image");
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
    <div className="min-h-screen bg-gradient-to-br from-[#eef5f3] via-white to-[#b7e3dd]/20 relative">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#0d9286]/10 to-[#026e6d]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#b7e3dd]/20 to-[#0d9286]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 relative">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#0d9286]/5 to-[#b7e3dd]/10 rounded-full blur-3xl -z-10"></div>

          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 rounded-2xl shadow-lg border border-[#b7e3dd]/40 mb-8 hover:shadow-xl transition-shadow duration-300">
              <Image src="/Monogram.png" alt="Image Studio" width={50} height={50} />
            <span className="text-[10px] font-semibold text-[#026e6d] tracking-wide uppercase">
              Image generation studio
            </span>
            <div className="w-1.5 h-1.5 bg-[#0d9286] rounded-full animate-pulse"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-5xl font-extrabold mb-6 leading-tight">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#026e6d] via-[#0d9286] to-[#026e6d] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Craft Professional
              </span>
            </span>
            <br />
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-[#171a2a] to-[#026e6d] bg-clip-text text-transparent">
                Legal Documents
              </span>
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C40 1.16667 160 1.16667 199 5.5"
                  stroke="url(#underline-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="underline-gradient"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#026e6d" />
                    <stop offset="50%" stopColor="#0d9286" />
                    <stop offset="100%" stopColor="#b7e3dd" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading with decorative elements */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent to-[#b7e3dd] hidden md:block"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-[1px] bg-gradient-to-l from-transparent to-[#b7e3dd] hidden md:block"></div>
            <p className="text-lg md:text-[15px] text-gray-600 leading-relaxed px-4">
              Transform legal information into
              <span className="relative inline-block mx-2">
                <span className="relative z-10 font-semibold text-[#026e6d]">
                  stunning visuals
                </span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-[#b7e3dd]/40 rounded-full -z-0"></span>
              </span>
              with our intelligent generator - choose from professional
              templates or let AI craft something
              <span className="font-semibold text-[#0d9286]">
                {" "}
                uniquely yours
              </span>
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-[#b7e3dd]/30 hover:shadow-lg transition-all cursor-default">
              <Palette className="w-4 h-4 text-[#0d9286]" />
              <span className="text-sm font-medium text-gray-700">
                Professional Templates
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-[#b7e3dd]/30 hover:shadow-lg transition-all cursor-default">
              <Bot className="w-4 h-4 text-[#0d9286]" />
              <span className="text-sm font-medium text-gray-700">
                AI-Powered Generation
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-[#b7e3dd]/30 hover:shadow-lg transition-all cursor-default">
              <Zap className="w-4 h-4 text-[#0d9286]" />
              <span className="text-sm font-medium text-gray-700">
                Instant Download
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-[#b7e3dd]/30 hover:shadow-lg transition-all cursor-default">
              <Cloud className="w-4 h-4 text-[#0d9286]" />
              <span className="text-sm font-medium text-gray-700">
                Auto-Save to Cloud
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto animate-slideIn">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="text-red-700 block mb-1">
                    Error Occurred
                  </strong>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!showPreview ? (
          <>
            {/* Form Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-[#026e6d]/5 border border-[#b7e3dd]/30 p-8 mb-8 hover:shadow-2xl transition-shadow duration-300">
                <JudgementForm onSubmit={handleFormSubmit} />
              </div>
            </div>

            {/* Recent Images Gallery */}
            <div className="mt-16 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#171a2a]">
                    Recent Generations
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Your previously created judgement images
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-gray-400 bg-white/80 px-4 py-2 rounded-full border border-[#b7e3dd]/30 flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    Auto-saved to cloud
                  </span>
                </div>
              </div>
              <RecentImagesGallery refreshKey={galleryRefreshKey} />
            </div>
          </>
        ) : (
          <div id="preview-section" className="max-w-5xl mx-auto">
            {/* Navigation Bar */}
            <div className="mb-8 flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#b7e3dd]/30">
              <button
                onClick={handleBackToForm}
                className="group flex items-center gap-2 px-4 py-2 text-[#026e6d] hover:bg-[#eef5f3] rounded-xl transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Editor</span>
              </button>

              {isSaving && (
                <div className="flex items-center gap-2 text-[#0d9286]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Saving your image...
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Tab Switcher */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-[#b7e3dd]/30">
                <button
                  onClick={() => setActiveTab("template")}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === "template"
                      ? "bg-gradient-to-r from-[#026e6d] to-[#0d9286] text-white shadow-lg shadow-[#0d9286]/25"
                      : "text-gray-600 hover:text-[#026e6d] hover:bg-[#eef5f3]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Branded Template
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`relative px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === "ai"
                      ? "bg-gradient-to-r from-[#026e6d] to-[#0d9286] text-white shadow-lg shadow-[#0d9286]/25"
                      : "text-gray-600 hover:text-[#026e6d] hover:bg-[#eef5f3]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Generated
                  </span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-[#026e6d]/5 border border-[#b7e3dd]/30 p-8">
              {activeTab === "template" ? (
                <JudgementCard
                  data={formData}
                  onImageGenerated={handleImageGenerated}
                />
              ) : (
                <AIJudgementImage
                  data={formData}
                  onSaved={() => setGalleryRefreshKey((k) => k + 1)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

// Enhanced Recent Images Gallery Component
function RecentImagesGallery({ refreshKey }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  React.useEffect(() => {
    fetchRecentImages();
  }, [refreshKey]);

  const fetchRecentImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/judgement-images?limit=12");

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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/judgement-images/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img._id !== id));
      setViewImage((prev) => (prev?._id === id ? null : prev));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error(error.message || "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-4 animate-pulse"
          >
            <div className="bg-gradient-to-br from-[#eef5f3] to-[#b7e3dd]/30 rounded-xl h-48 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#b7e3dd]/30">
        <Wifi className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Connection Error
        </h3>
        <p className="text-gray-500">Failed to load images: {error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#b7e3dd]/30">
        <div className="bg-gradient-to-br from-[#eef5f3] to-[#b7e3dd]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-12 h-12 text-[#0d9286]" />
        </div>
        <h3 className="text-xl font-semibold text-[#171a2a] mb-2">
          No Images Yet
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Start by filling out the form above to create your first professional
          judgement image
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image._id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-transparent hover:border-[#b7e3dd]/50"
            onMouseEnter={() => setHoveredId(image._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image Container */}
            <div
              className="relative overflow-hidden cursor-pointer"
              onClick={() => setViewImage(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.inputData?.judgementTitle || "Judgement image"}
                className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = "/Monogram.png";
                }}
              />

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-[#026e6d]/80 to-transparent transition-opacity duration-300 ${
                  hoveredId === image._id ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewImage(image);
                    }}
                    className="flex-1 bg-white text-[#026e6d] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#eef5f3] transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image._id);
                    }}
                    disabled={deletingId === image._id}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[#171a2a] truncate group-hover:text-[#026e6d] transition-colors">
                    {image.inputData?.judgementTitle || "Untitled Judgement"}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="bg-[#eef5f3] rounded-full p-2 group-hover:bg-[#0d9286] transition-colors flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-[#026e6d] group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Lightbox Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-br from-[#171a2a]/95 to-[#026e6d]/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewImage(null)}
        >
          <div
            className="max-w-5xl w-full animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {viewImage.inputData?.judgementTitle ||
                      "Untitled Judgement"}
                  </h3>
                  <p className="text-white/60 text-sm">
                    Generated on{" "}
                    {new Date(viewImage.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewImage(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <img
                src={viewImage.imageUrl}
                alt={viewImage.inputData?.judgementTitle || "Judgement image"}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <a
                href={viewImage.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-8 py-3 bg-white text-[#026e6d] font-semibold rounded-xl hover:bg-[#eef5f3] transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download Image
              </a>
              <button
                type="button"
                onClick={() => handleDelete(viewImage._id)}
                disabled={deletingId === viewImage._id}
                className="group flex items-center gap-2 px-8 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                {deletingId === viewImage._id ? "Deleting..." : "Delete Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
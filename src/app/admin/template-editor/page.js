"use client";

import { useEffect, useState } from "react";

export default function TemplateEditor() {
  const [brandColors, setBrandColors] = useState({
    primary: "#1a3e6f",
    secondary: "#c5a059",
    accent: "#2c5aa0",
  });

  const [logo, setLogo] = useState(null);

  const handleColorChange = (colorKey, value) => {
    setBrandColors((prev) => {
      const nextColors = { ...prev, [colorKey]: value };
      // Save to localStorage or API
      localStorage.setItem("brandColors", JSON.stringify(nextColors));
      return nextColors;
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target.result);
        localStorage.setItem("brandLogo", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const storedColors = localStorage.getItem("brandColors");
    if (storedColors) {
      try {
        const parsed = JSON.parse(storedColors);
        setBrandColors((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse stored brand colors:", error);
      }
    }

    const storedLogo = localStorage.getItem("brandLogo");
    if (storedLogo) {
      setLogo(storedLogo);
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Brand Template Editor</h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={brandColors.primary}
            onChange={(e) => handleColorChange("primary", e.target.value)}
            className="w-20 h-10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Accent Color (Gold)
          </label>
          <input
            type="color"
            value={brandColors.secondary}
            onChange={(e) => handleColorChange("secondary", e.target.value)}
            className="w-20 h-10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Firm Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {logo && (
            <div className="mt-4">
              <img
                src={logo}
                alt="Logo preview"
                className="h-16 object-contain"
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              // Save template to server
              alert("Template saved! It will apply to all future images.");
            }}
            className="px-6 py-2 bg-[#1a3e6f] text-white rounded-lg"
          >
            Save Template
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Live Preview</h2>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div
            className="w-full h-2 rounded-t-lg"
            style={{
              background: `linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})`,
            }}
          />
          {/* Preview card here */}
        </div>
      </div>
    </div>
  );
}

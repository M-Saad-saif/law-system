"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e2235",
          color: "#f1f3f9",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#1e2235" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#1e2235" } },
      }}
    />
  );
}

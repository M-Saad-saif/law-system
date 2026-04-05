"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fc",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "bold", color: "#4c4de8" }}>
          404
        </h1>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Page not found
        </p>
        <Link
          href="/dashboard"
          style={{
            background: "#4c4de8",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

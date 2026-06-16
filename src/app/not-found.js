"use client";

import Link from "next/link";
import { Scale, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] via-white to-[#f0f4fa] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/3 rounded-full blur-2xl" />
      </div>

      <div className="text-center max-w-sm relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-teal-50 border-2 border-teal-100 mb-8 shadow-lg shadow-teal-500/10 ">
          <Scale className="w-10 h-10 text-teal-600" />
        </div>

        <h1
          className="text-8xl font-bold bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          404
        </h1>

        <div className="mb-2">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Page Not Found
          </h2>
        </div>

        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved to a
          different location.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-medium text-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-500 bg-teal-500 text-white font-medium text-sm hover:bg-teal-600 hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200 active:scale-95"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          If you believe this is an error, please contact support
        </p>
      </div>
    </div>
  );
}

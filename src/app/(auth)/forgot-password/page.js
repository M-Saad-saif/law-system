"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/utils/api";
import {
  Logo,
  ForgotPasswordIllustration,
} from "@/components/auth/forgetPassSide";
import BackgroundPattern from "@/components/auth/BackgroundPattern";


function FormField({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  rightElement = null,
}) {
  return (
    <div className="form-group transform transition-all duration-300 hover:translate-x-1">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-[#0d9488] group-focus-within:scale-110">
          {Icon && (
            <Icon
              size={14}
              className="opacity-50 group-focus-within:opacity-100 transition-opacity"
            />
          )}
        </span>
        <input
          type={type}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5f9]/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300 text-xs shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
        {rightElement}
      </div>
    </div>
  );
}

function LoadingSpinner({ className = "" }) {
  return (
    <div
      className={`w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto ${className}`}
    />
  );
}



export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden font-sans relative">
      <style jsx global>{`
        @keyframes floatDevice {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes slideUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-sweep-1 {
          animation: sweepIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-sweep-2 {
          animation: sweepIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) 100ms forwards;
        }
        .animate-sweep-3 {
          animation: sweepIn 1.6s cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(13, 148, 136, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <BackgroundPattern />

      <div className="w-full max-w-7xl min-h-screen grid grid-cols-1 lg:grid-cols-12 items-center px-8 lg:px-24 py-12 relative z-10">
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Logo />

          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-3xl lg:text-4xl font-normal tracking-tight text-slate-800 mb-2">
              {submitted ? "Check your email" : "Reset your password"}
            </h1>
            <p className="text-slate-400 text-xs mb-8">
              {submitted
                ? "We've sent you instructions to reset your password"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {submitted ? (
            <div
              className="animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="bg-[#f1f5f9]/50 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0d9488]/10 mb-4">
                  <CheckCircle className="w-7 h-7 text-[#0d9488]" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Check your Email Inbox
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  If an account exists for{" "}
                  <span className="text-slate-700 font-medium">{email}</span>,
                  we've sent a password reset link. It expires in 1 hour.
                </p>
                <p className="text-slate-400 text-xs mb-6">
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                      setError("");
                    }}
                    className="text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors underline"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div
                className="animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                <FormField
                  type="email"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                />
              </div>

              {error && (
                <div
                  className="animate-slide-up"
                  style={{ animationDelay: "400ms" }}
                >
                  <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-full px-4 py-2">
                    {error}
                  </p>
                </div>
              )}

              <div
                className="flex items-center gap-8 pt-4 pl-1 animate-slide-up"
                style={{ animationDelay: "600ms" }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="relative px-10 py-2.5 rounded-full bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white font-medium text-xs hover:shadow-lg hover:opacity-95 transform active:scale-95 shadow-md shadow-[#0f766e]/30 disabled:opacity-50 transition-all duration-300 min-w-[140px] animate-gradient-shift overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? <LoadingSpinner /> : "Send Reset Link"}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                  )}
                </button>

                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-all duration-300 relative group"
                >
                  <span className="relative">
                    Back to sign in
                    <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-slate-800 group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>

        <ForgotPasswordIllustration />
      </div>
    </main>
  );
}

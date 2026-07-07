"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Scale } from "lucide-react";
import { api } from "@/utils/api";
import { LaptopMockup } from "@/components/auth/LaptopMockup";
import BackgroundPattern from "@/components/auth/BackgroundPattern";
import { FormField } from "@/components/auth/Field";

function LoadingSpinner({ className = "" }) {
  return (
    <div
      className={`w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto ${className}`}
    />
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 mb-16 group cursor-pointer animate-scale-in">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0f766e] to-[#0d9488] flex items-center justify-center shadow-lg transform group-hover:rotate-180 transition-all duration-700 animate-gradient-shift">
        <Scale className="text-white w-5 h-5" />
      </div>
      <span className="text-[25px] font-bold tracking-wide text-slate-700 group-hover:text-[#0d9488] transition-colors duration-300">
        LegalPortal
      </span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/auth/login", form);
      toast.success("Welcome back!");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
            <h1 className="text-2xl lg:text-4xl font-normal tracking-tight text-slate-800 mb-2">
              Welcome to LegalPortal
            </h1>
            <p className="text-slate-400 text-xs mb-8">
              Login to the legal network
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div
              className="animate-slide-up"
              style={{ animationDelay: "300ms" }}
            >
              <FormField
                type="email"
                placeholder="your email"
                value={form.email}
                onChange={handleChange("email")}
                icon={Mail}
                required
              />
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: "400ms" }}
            >
              <FormField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={14}
                        className="transition-transform duration-300"
                      />
                    ) : (
                      <Eye
                        size={14}
                        className="transition-transform duration-300"
                      />
                    )}
                  </button>
                }
              />
            </div>

            <div
              className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-2 select-none animate-slide-up"
              style={{ animationDelay: "700ms" }}
            >
              <Link
                href="/forgot-password"
                className="hover:text-slate-600 transition-colors hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div
              className="flex items-center gap-8 pt-4 pl-1 animate-slide-up"
              style={{ animationDelay: "800ms" }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="relative px-10 py-2.5 rounded-full bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white font-medium text-xs hover:shadow-lg hover:opacity-95 transform active:scale-95 shadow-md shadow-[#0f766e]/30 disabled:opacity-50 transition-all duration-300 min-w-[140px] animate-gradient-shift overflow-hidden group"
              >
                <span className="relative z-10">
                  {isLoading ? <LoadingSpinner /> : "Login"}
                </span>
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                )}
              </button>

              <Link
                href="/register"
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-all duration-300 relative group"
              >
                <span className="relative">
                  Don't have an account? Register
                  <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-slate-800 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </div>
          </form>
        </div>

        <LaptopMockup />
      </div>
    </main>
  );
}

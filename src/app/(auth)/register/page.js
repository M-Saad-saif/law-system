"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, ShieldCheck, Eye, EyeOff, User, Lock, Mail, Phone, Gavel, Menu } from "lucide-react";
import { api } from "@/utils/api";

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  icon: Icon,
}) {
  return (
    <div className="form-group transform transition-all duration-300 hover:translate-x-1">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-[#0d9488] group-focus-within:scale-110">
          {Icon && <Icon size={14} className="opacity-50 group-focus-within:opacity-100 transition-opacity" />}
        </span>
        <input
          type={type}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5f9]/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300 text-xs shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    barCouncilNo: "",
  });
  const [loading, setLoading] = useState(false);
  const [showpass, setShowpass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const set =
    (field) => (e) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await api.post("/api/auth/register", { ...form, seniority: "senior" });
      toast.success("Senior Lawyer account created! Welcome to LawPortal.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden font-sans relative">
      
      {/* Animations */}
      <style jsx global>{`
        @keyframes floatDevice {
          0%, 100% { transform: translateZ(35px) translateY(-15px); }
          50% { transform: translateZ(48px) translateY(-25px); }
        }
        @keyframes sweepIn {
          0% { transform: translateX(80px) opacity: 0; }
          100% { transform: translateX(0) opacity: 1; }
        }
        @keyframes floatShadow {
          0%, 100% { transform: translateY(12px) translateX(8px) scale(1); opacity: 0.1; }
          50% { transform: translateY(20px) translateX(12px) scale(0.95); opacity: 0.07; }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(13, 148, 136, 0.1); }
          50% { border-color: rgba(13, 148, 136, 0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes rotate3d {
          0% { transform: rotateX(54deg) rotateZ(-40deg) skewX(4deg); }
          50% { transform: rotateX(52deg) rotateZ(-41deg) skewX(3deg); }
          100% { transform: rotateX(54deg) rotateZ(-40deg) skewX(4deg); }
        }
        .animate-float-device {
          animation: floatDevice 6s ease-in-out infinite;
        }
        .animate-float-shadow {
          animation: floatShadow 6s ease-in-out infinite;
        }
        .animate-sweep-1 {
          animation: sweepIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-sweep-2 {
          animation: sweepIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 100ms;
        }
        .animate-sweep-3 {
          animation: sweepIn 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 200ms;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-icon-float {
          animation: iconFloat 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        .animate-border-glow {
          animation: borderGlow 2s ease-in-out infinite;
        }
        .animate-rotate-3d {
          animation: rotate3d 8s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* BACKGROUND VECTOR GRAPHIC PANEL */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block">
        <svg
          className="absolute right-0 top-0 h-full w-[60%] object-cover"
          viewBox="0 0 800 900"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
            fill="#042f2e"
            className="opacity-0 animate-sweep-1"
            style={{ opacity: 0.2 }}
            transform="translate(-40, 20)"
          />
          <path
            d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
            fill="#0d9488"
            className="opacity-0 animate-sweep-2"
            style={{ opacity: 0.4 }}
            transform="translate(-20, 10)"
          />
          <path
            d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
            fill="url(#tealGradient)"
            className="animate-sweep-3"
          />
          <defs>
            <linearGradient id="tealGradient" x1="180" y1="0" x2="800" y2="900" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0d9488" />
              <stop offset="0.6" stopColor="#0f766e" />
              <stop offset="1" stopColor="#042f2e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="w-full max-w-7xl min-h-screen lg:min-h-screen grid grid-cols-1 lg:grid-cols-12 items-center px-8 lg:px-24 py-12 relative z-10">
        
        {/* LEFT SIDE: REGISTRATION FORM */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          
          {/* Logo with Animation */}
          <div className="flex items-center gap-2.5 mb-16 group cursor-pointer animate-scale-in">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0f766e] to-[#0d9488] flex items-center justify-center shadow-lg transform group-hover:rotate-180 transition-all duration-700 animate-gradient-shift">
              <Scale className="text-white w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-wide text-slate-700 group-hover:text-[#0d9488] transition-colors duration-300">
              LawPortal
            </span>
          </div>

          {/* Header with Slide Up Animation */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-3xl lg:text-4xl font-normal tracking-tight text-slate-800 mb-2">
              Create Senior Account
            </h1>
            <p className="text-slate-400 text-xs mb-8">
              Join the legal network by completing your registration
            </p>
          </div>

          {/* Info Alert with Border Glow Animation */}
          <div className="flex items-start gap-2 bg-[#0d9488]/5 border border-[#0d9488]/10 rounded-xl p-3 mb-6 transform transition-transform duration-300 animate-border-glow">
            <ShieldCheck className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5 animate-pulse-slow" />
            <p className="text-[11px] text-[#042f2e]/80 leading-normal">
              Registering a <span className="font-semibold text-[#0f766e]">Senior Lawyer</span> . Junior profiles are integrated exclusively inside the secure management console dashboard.
            </p>
          </div>

          {/* Form with Staggered Animation */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Field
                label="Full Name"
                placeholder="Full name"
                required
                value={form.name}
                onChange={set("name")}
                icon={User}
              />
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <Field
                label="Email Address"
                type="email"
                placeholder="john@lawfirm.com"
                required
                value={form.email}
                onChange={set("email")}
                icon={Mail}
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
              <div className="form-group transform transition-all duration-300 hover:translate-x-1">
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-[#0d9488] group-focus-within:scale-110">
                    <Lock size={14} className="opacity-50 group-focus-within:opacity-100 transition-opacity" />
                  </span>
                  <input
                    type={showpass ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-2.5 bg-[#f1f5f9]/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300 text-xs shadow-sm"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowpass(!showpass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    {showpass ? (
                      <EyeOff size={14} className="transition-transform duration-300" />
                    ) : (
                      <Eye size={14} className="transition-transform duration-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
                <Field
                  label="Phone"
                  placeholder="+92-300-0000000"
                  value={form.phone}
                  onChange={set("phone")}
                  icon={Phone}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
                <Field
                  label="Bar Council No."
                  placeholder="LHC-XXXX-XXXX"
                  value={form.barCouncilNo}
                  onChange={set("barCouncilNo")}
                  icon={Scale}
                />
              </div>
            </div>

                    {/* Submit Buttons with Enhanced Animations */}
            <div className="flex items-center gap-8 pt-4 pl-1 animate-slide-up" style={{ animationDelay: "800ms" }}>
              <button
                type="submit"
                disabled={loading}
                className="relative px-10 py-2.5 rounded-full bg-gradient-to-r from-[#0f766e] to-[#0d9488] text-white font-medium text-xs hover:shadow-lg hover:opacity-95 transform active:scale-95 shadow-md shadow-[#0f766e]/30 disabled:opacity-50 transition-all duration-300 min-w-[140px] animate-gradient-shift overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Register"
                  )}
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
                  Already registered? Sign in
                  <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-slate-800 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: 3D DEVICE MOCKUP */}
        <div className="hidden lg:block lg:col-span-7 h-full w-full relative">
          <div 
            className="absolute right-[-10%] top-[28%] w-[580px] h-[360px] preserve-3d transition-all duration-1000 ease-out animate-scale-in"
            style={{
              transform: "rotateX(54deg) rotateZ(-40deg) skewX(4deg)",
              transformStyle: "preserve-3d",
              animation: "rotate3d 8s ease-in-out infinite"
            }}
          >
            {/* Floating Shadow */}
            <div className="absolute inset-0 bg-black rounded-2xl blur-xl animate-float-shadow" />
            <div className="absolute inset-0 bg-[#042f2e]/30 rounded-2xl blur-md transform translate-y-6" />

            {/* Laptop Base */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl border-b-[6px] border-slate-400/80 shadow-inner overflow-hidden">
              {/* Keyboard Area */}
              <div className="absolute bottom-4 left-6 right-6 top-24 bg-gradient-to-br from-[#0f766e]/40 to-[#042f2e]/20 rounded-lg p-2 grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-sm border border-white/5 hover:bg-white/20 transition-colors duration-300" />
                ))}
              </div>
              {/* Trackpad */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-slate-300/60 rounded-full" />
            </div>

            {/* Floating Display Screen */}
            <div 
              className="absolute inset-x-0 top-0 h-full bg-white/95 rounded-xl shadow-2xl border border-white flex flex-col justify-between p-6 animate-float-device backdrop-blur-sm"
            >
              {/* Window Controls */}
              <div className="flex justify-between items-center opacity-80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 animate-pulse-slow" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 animate-pulse-slow" style={{ animationDelay: "1s" }} />
                </div>
                <div className="w-24 h-1.5 bg-slate-200 rounded-full" />
              </div>

              {/* App Content Preview */}
              <div className="my-auto space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0f766e] to-[#0d9488] flex items-center justify-center text-white shadow-lg shadow-[#0d9488]/30 animate-icon-float">
                    <Scale className="w-7 h-7" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-slate-800 rounded-md" />
                    <div className="h-2 w-1/2 bg-[#0d9488]/60 rounded-md" />
                  </div>
                </div>
                
                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Profile Completion</span>
                    <span>85%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0f766e] to-[#0d9488] rounded-full animate-shimmer"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="h-2 w-3/4 bg-slate-300 rounded mb-1" />
                    <div className="h-3 w-1/2 bg-slate-800 rounded" />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="h-2 w-3/4 bg-slate-300 rounded mb-1" />
                    <div className="h-3 w-1/2 bg-slate-800 rounded" />
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
                  <span className="text-[10px] text-slate-400">System Online</span>
                </div>
                <div className="w-8 h-2 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
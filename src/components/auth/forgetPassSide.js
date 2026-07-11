"use client";

import { Scale, Key, Shield, Mail } from "lucide-react";

export function ForgotPasswordIllustration() {
  return (
    <div className="hidden lg:flex lg:col-span-7 items-center justify-center relative">
      <div className="relative animate-float-device">
        <div className="relative w-[450px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488]/5 via-transparent to-[#0f766e]/5 rounded-3xl blur-7xl" />

          <div className="absolute inset-0 bg-white/40 backdrop-blur-[9px] border border-white/20 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#0d9488]/20 rounded-full blur-2xl animate-pulse-slow" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#0d9488] to-[#0f766e] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Key className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              Forgot Password?
            </h3>
            <p className="text-slate-500 text-sm text-center max-w-xs mb-8">
              We'll help you regain access to your account quickly and securely
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="bg-green backdrop-blur-sm rounded-xl p-3 text-center border border-white/30 hover:border-[#0d9488]/30 transition-all duration-300 hover:shadow-lg">
                <Shield className="w-5 h-5 text-[#0d9488] mx-auto mb-1" />
                <p className="text-[10px] font-medium text-slate-600">
                  Secure Link
                </p>
                <p className="text-[9px] text-slate-400">256-bit encrypted</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30 hover:border-[#0d9488]/30 transition-all duration-300 hover:shadow-lg">
                <Mail className="w-5 h-5 text-[#0d9488] mx-auto mb-1" />
                <p className="text-[10px] font-medium text-slate-600">
                  Email Sent
                </p>
                <p className="text-[9px] text-slate-400">Instant delivery</p>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 w-16 h-16 opacity-20">
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#0d9488] rounded-full" />
              <div className="absolute top-4 right-4 w-3 h-3 bg-[#0d9488] rounded-full" />
              <div className="absolute top-8 right-8 w-3 h-3 bg-[#0d9488] rounded-full" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 opacity-20">
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#0f766e] rounded-full" />
              <div className="absolute bottom-4 left-4 w-3 h-3 bg-[#0f766e] rounded-full" />
              <div className="absolute bottom-8 left-8 w-3 h-3 bg-[#0f766e] rounded-full" />
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-32 h-32 border border-[#0d9488]/10 rounded-full animate-spin-slow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 border border-[#0f766e]/10 rounded-full animate-spin-slow-reverse" />
        </div>
      </div>
    </div>
  );
}



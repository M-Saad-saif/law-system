"use client";

import { useState } from "react";
import {
  Scale,
  ShieldCheck,
  UserCircle2,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  Lock,
  FolderOpen,
  BookOpenText,
  Sparkles,
} from "lucide-react";
import { api } from "@/utils/api";

const PERMISSIONS = [
  {
    icon: FolderOpen,
    label: "Case Access",
    detail: "View and work on cases assigned to you within the chamber.",
  },
  {
    icon: BookOpenText,
    label: "Cross-Examinations & Applications",
    detail: "Draft cross-examinations and applications for senior review.",
  },
  {
    icon: Lock,
    label: "Billing - View Only",
    detail:
      "Only your Senior Lawyer can manage the chamber's subscription and payments.",
  },
];

export default function WelcomeModal({ user, onDismiss }) {
  const [closing, setClosing] = useState(false);

  const senior = user?.createdBy;

  const handleDismiss = async () => {
    if (closing) return;
    setClosing(true);
    try {
      await api.put("/api/auth/welcome-seen");
    } catch {
    } finally {
      onDismiss?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#027675] px-6 py-8 text-center shrink-0 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
              <Scale className="w-8 h-8 text-white" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#027675]" />
              <h2 className="text-xl font-bold text-white font-display tracking-tight">
                Welcome to LawPortal
              </h2>
              <Sparkles className="w-4 h-4 text-[#027675]" />
            </div>

            <h3 className="text-2xl font-bold text-white mt-1">
              {user?.name?.split(" ")[0] || "there"}
            </h3>

            <p className="text-sm text-slate-300 mt-2 opacity-90">
              Here's a quick orientation before you get started.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
          {/* Role Section */}
          <div className="group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#027675]" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Your Role
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm text-slate-600 leading-relaxed hover:border-[#027675]/20 transition-all duration-300">
              You've been added as a{" "}
              <span className="font-semibold text-slate-800 bg-[#027675]/10 px-2 py-0.5 rounded-md">
                Junior Lawyer
              </span>{" "}
              under your Senior Lawyer's chamber. Your chamber's subscription is
              managed by your Senior Lawyer, so you don't need to set anything
              up yourself
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#027675]" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                What You Can Do
              </p>
            </div>
            <div className="space-y-3">
              {PERMISSIONS.map((perm, index) => (
                <div
                  key={perm.label}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:translate-x-1"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#027675]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#027675]/20 transition-colors">
                    <perm.icon className="w-5 h-5 text-[#027675]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {perm.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {perm.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Senior Lawyer Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                <UserCircle2 className="w-4 h-4 text-[#027675]" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Your Senior Lawyer
              </p>
            </div>
            {senior ? (
              <div className="bg-gradient-to-br from-[#027675]/5 to-[#027675]/10 rounded-xl border border-[#027675]/10 p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg shadow-[#027675]/20">
                    {senior.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {senior.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reach out if you have any questions
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {senior.email && (
                    <a
                      href={`mailto:${senior.email}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors text-xs text-slate-600 hover:text-[#027675] group"
                    >
                      <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#027675] transition-colors" />
                      {senior.email}
                    </a>
                  )}
                  {senior.phone && (
                    <a
                      href={`tel:${senior.phone}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors text-xs text-slate-600 hover:text-[#027675] group"
                    >
                      <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#027675] transition-colors" />
                      {senior.phone}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 rounded-lg p-3">
                Senior contact details aren't available right now.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={handleDismiss}
            disabled={closing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#027675] to-[#015f5d] hover:from-[#028583] hover:to-[#016b69] transition-all duration-300 disabled:opacity-60 shadow-lg shadow-[#027675]/20 hover:shadow-xl hover:shadow-[#027675]/30 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {closing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Getting things ready...
              </>
            ) : (
              <>
                Got it, let's go
                <ArrowRight className="w-4 h-4 animate-bounce-x" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

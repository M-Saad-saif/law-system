"use client";

import { useState, useCallback } from "react";
import {
  Scale,
  ShieldCheck,
  UserCircle2,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  FolderOpen,
  BookOpenText,
  Sparkles,
  ChevronRight,
  Calendar,
  Search,
  Bell,
  Camera,
  KeyRound,
  CreditCard,
  AlertTriangle,
  Library,
  FileText,
} from "lucide-react";
import { api } from "@/utils/api";

const STEPS = [
  {
    id: "welcome",
    badge: "Welcome aboard",
    title: (name) => `Hello, ${name}!`,
    subtitle:
      "You've been added as a Junior Lawyer under your senior's chamber. Here's everything you need to know before you get started.",
  },
  {
    id: "features",
    badge: "What you can do",
    title: () => "Your Tools & Access",
    subtitle:
      "As a Junior Lawyer you have access to a powerful set of tools for managing cases and legal research.",
  },
  {
    id: "billing",
    badge: "Subscription",
    title: () => "About Billing & Subscriptions",
    subtitle:
      "One important thing to know — subscription and payment management is handled entirely by your Senior Lawyer.",
  },
  {
    id: "account",
    badge: "Your account",
    title: () => "Personalise Your Account",
    subtitle:
      "A few things you can manage yourself from the Settings page at any time.",
  },
];

const PERMISSIONS = [
  {
    icon: FolderOpen,
    color: "text-teal-600 bg-teal-50 border-teal-100",
    label: "Case Management",
    detail:
      "View, create, and work on cases inside your senior's chamber. Track hearings, attach documents, and monitor deadlines.",
  },
  {
    icon: BookOpenText,
    color: "text-violet-600 bg-violet-50 border-violet-100",
    label: "Cross-Examinations",
    detail:
      "Draft cross-examination questions with AI assistance. Submit them to your Senior Lawyer for review before finalising.",
  },
  {
    icon: FileText,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    label: "Applications",
    detail:
      "Generate court applications using AI. Your Senior Lawyer reviews and approves drafts before they're used.",
  },
  {
    icon: Search,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    label: "Judgement Search & AI Extractor",
    detail:
      "Search Pakistani court judgements, extract key legal points with AI, generate citation images, and save to your library.",
  },
  {
    icon: Library,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    label: "Law Books & Library",
    detail:
      "Access your chamber's law book collection and personal judgement library for research and reference.",
  },
  {
    icon: Calendar,
    color: "text-orange-600 bg-orange-50 border-orange-100",
    label: "Calendar & Reminders",
    detail:
      "Manage your personal hearing calendar and set reminders so you never miss a deadline or court date.",
  },
  {
    icon: Bell,
    color: "text-rose-600 bg-rose-50 border-rose-100",
    label: "Reminders",
    detail:
      "Create reminders for upcoming hearings, filing deadlines, and important case milestones.",
  },
];

const BILLING_POINTS = [
  {
    icon: Lock,
    color: "text-rose-600 bg-rose-50 border-rose-100",
    label: "You cannot subscribe",
    detail:
      "Subscription and billing is managed exclusively by your Senior Lawyer. You will not see a Pay or Subscribe button — this is by design.",
  },
  {
    icon: CreditCard,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    label: "Billing page is view-only for you",
    detail:
      "You can visit the Billing page to check your chamber's subscription status, but you cannot submit payments or change plans.",
  },
  {
    icon: AlertTriangle,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    label: "If access is locked",
    detail:
      "If your chamber's subscription expires, your access will be restricted. Contact your Senior Lawyer — only they can renew the subscription and restore your access.",
  },
];

const ACCOUNT_POINTS = [
  {
    icon: Camera,
    color: "text-teal-600 bg-teal-50 border-teal-100",
    label: "Profile Picture (DP)",
    detail:
      "Go to Settings and click the camera icon on your avatar to upload a photo. It will appear in your sidebar, topbar, and your Senior Lawyer can see it.",
  },
  {
    icon: KeyRound,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    label: "Forgot your password?",
    detail:
      "On the login page, click 'Forgot Password', enter your email, and follow the reset link sent to your inbox. Your senior does not manage your password.",
  },
  {
    icon: ShieldCheck,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    label: "Update your profile",
    detail:
      "You can update your name, phone number, and bar council number from Settings → Profile Information at any time.",
  },
];

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-5 h-2 bg-[#027675]"
              : i < current
                ? "w-2 h-2 bg-[#027675]/40"
                : "w-2 h-2 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, color, label, detail }) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-[#027675]/10 hover:shadow-sm transition-all duration-200">
      <div
        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          {detail}
        </p>
      </div>
    </div>
  );
}

export default function WelcomeModal({ user, onDismiss }) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const senior = user?.createdBy;
  const firstName = user?.name?.split(" ")[0] || "Counselor";
  const currentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const navigateToStep = useCallback(
    (newStep) => {
      if (isAnimating) return;

      setDirection(newStep > step ? 1 : -1);
      setIsAnimating(true);
      setStep(newStep);

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    },
    [step, isAnimating],
  );

  const handleNext = () => {
    navigateToStep(step + 1);
  };

  const handleBack = () => {
    navigateToStep(step - 1);
  };

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
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-500">
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0f1e2e] to-[#013a39] px-6 pt-6 pb-5">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#027675]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

          <div className="relative flex items-start gap-4">
            {/* Hero icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center shadow-lg shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 mb-2">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">
                  {currentStep.badge}
                </span>
              </div>

              <div className="relative overflow-hidden">
                <div
                  key={step}
                  className={`transition-all duration-300 ease-in-out ${
                    direction === 1
                      ? "animate-in slide-in-from-right-4 fade-in"
                      : "animate-in slide-in-from-left-4 fade-in"
                  }`}
                >
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {currentStep.title(firstName)}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {currentStep.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-500 tabular-nums">
            {step + 1} / {STEPS.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
          <div
            className={`px-6 py-5 space-y-3 transition-all duration-300 ease-in-out ${
              isAnimating
                ? direction === 1
                  ? "animate-in slide-in-from-right-8 fade-in"
                  : "animate-in slide-in-from-left-8 fade-in"
                : ""
            }`}
            key={step}
          >
            {step === 0 && (
              <>
                <div
                  className="bg-white rounded-xl border border-[#027675]/10 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: "0ms" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#027675]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Your Role
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You're a{" "}
                    <span className="font-semibold text-[#027675] bg-[#027675]/5 px-1.5 py-0.5 rounded">
                      Junior Lawyer
                    </span>{" "}
                    under your Senior Lawyer's chamber. Your subscription is
                    managed by them — you don't need to set up anything.
                  </p>
                </div>

                <div
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                      <UserCircle2 className="w-3.5 h-3.5 text-[#027675]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Your Senior Lawyer
                    </span>
                  </div>
                  {senior ? (
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {senior.profilePicture ? (
                          <img
                            src={senior.profilePicture}
                            alt={senior.name || "Senior Lawyer"}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#027675]/20 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md shadow-[#027675]/20">
                            {senior.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {senior.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Your point of contact
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {senior.email && (
                          <a
                            href={`mailto:${senior.email}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#027675] transition-colors shrink-0" />
                            <span className="text-xs text-slate-600 group-hover:text-[#027675] transition-colors truncate">
                              {senior.email}
                            </span>
                          </a>
                        )}
                        {senior.phone && (
                          <a
                            href={`tel:${senior.phone}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                          >
                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#027675] transition-colors shrink-0" />
                            <span className="text-xs text-slate-600 group-hover:text-[#027675] transition-colors">
                              {senior.phone}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100/50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400">
                        Senior contact details aren't available right now.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 1 && (
              <div className="space-y-2">
                {PERMISSIONS.map((perm, index) => (
                  <div
                    key={perm.label}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <FeatureCard {...perm} />
                  </div>
                ))}
              </div>
            )}
            {step === 2 && (
              <>
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-700">
                      You cannot subscribe or make payments
                    </p>
                    <p className="text-xs text-rose-600 mt-0.5 leading-relaxed">
                      Only your Senior Lawyer has the ability to manage the
                      chamber's subscription and submit payment proof to the
                      admin. This cannot be changed.
                    </p>
                  </div>
                </div>

                {/* Billing detail cards */}
                <div className="space-y-2">
                  {BILLING_POINTS.map((point, index) => (
                    <div
                      key={point.label}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <FeatureCard {...point} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-2">
                {ACCOUNT_POINTS.map((point, index) => (
                  <div
                    key={point.label}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <FeatureCard {...point} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
          <div className="mb-4">
            <ProgressDots total={STEPS.length} current={step} />
          </div>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={handleBack}
                disabled={isAnimating}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {/* Next / Finish */}
            {isLast ? (
              <button
                onClick={handleDismiss}
                disabled={closing}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027675] to-[#015f5d] hover:from-[#028a7a] hover:to-[#016b69] shadow-lg shadow-[#027675]/25 hover:shadow-xl hover:shadow-[#027675]/30 transition-all duration-200 disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {closing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Getting things ready...
                  </>
                ) : (
                  <>
                    Got it, let's go
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027675] to-[#015f5d] hover:from-[#028a7a] hover:to-[#016b69] shadow-lg shadow-[#027675]/25 hover:shadow-xl hover:shadow-[#027675]/30 transition-all duration-200 disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {!isLast && (
              <button
                onClick={handleDismiss}
                disabled={closing}
                className="px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 shrink-0"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

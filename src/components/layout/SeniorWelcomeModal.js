"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Scale,
  Clock,
  CreditCard,
  Users,
  BookOpenText,
  Camera,
  KeyRound,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Star,
} from "lucide-react";
import { api } from "@/utils/api";

const STEPS = [
  {
    id: "welcome",
    icon: Scale,
    iconBg: "from-[#027675] to-[#015f5d]",
    badge: "Welcome aboard",
    title: (name) => `Hello, ${name}!`,
    subtitle:
      "You've just created your LawPortal account. Here's a quick tour of everything at your fingertips.",
    features: [
      {
        icon: ShieldCheck,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "Senior Lawyer Account",
        desc: "You have full access to all features — case management, team controls, billing, and AI-powered tools.",
      },
      {
        icon: Star,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        title: "7-Day Free Trial",
        desc: "Your account starts with a free 7-day trial. No payment required right now — explore everything first.",
      },
      {
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        title: "Complete Control",
        desc: "Manage your chamber, add junior lawyers to your team, and review their work all from one place.",
      },
    ],
  },
  {
    id: "trial",
    icon: Clock,
    iconBg: "from-amber-500 to-amber-600",
    badge: "Your trial",
    title: () => "7-Day Free Trial",
    subtitle:
      "Start exploring LawPortal immediately — no credit card, no commitment. Here's how your trial works.",
    features: [
      {
        icon: Clock,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        title: "Trial lasts 7 days",
        desc: "From the moment you registered, your trial gives you full access to every feature for 7 days.",
      },
      {
        icon: RefreshCw,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "Easy to renew",
        desc: "When the trial ends, head to the Billing page to choose a plan and submit payment proof. Admin verifies and re-activates you — typically within hours.",
      },
      {
        icon: ShieldCheck,
        color: "text-slate-600 bg-slate-50 border-slate-200",
        title: "Nothing locked during trial",
        desc: "All features including case management, AI tools, cross-examination, and team management are fully available during your trial.",
      },
    ],
  },
  {
    id: "subscription",
    icon: CreditCard,
    iconBg: "from-violet-500 to-violet-600",
    badge: "Subscriptions",
    title: () => "Flexible Plans",
    subtitle:
      "After your trial, choose the plan that works for your practice. Simple, transparent pricing.",
    features: [
      {
        icon: CreditCard,
        color: "text-violet-600 bg-violet-50 border-violet-100",
        title: "Monthly — PKR 10,000 / month",
        desc: "Pay month to month with full flexibility. Perfect if you want to try the paid plan without committing long-term.",
      },
      {
        icon: Star,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        title: "Yearly — PKR 50,000 / year",
        desc: "Best value — save PKR 70,000 compared to monthly. Ideal for established chambers with long-term needs.",
      },
      {
        icon: RefreshCw,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "How payment works",
        desc: "Go to Billing → select your plan → upload a screenshot of your payment transfer → admin reviews and activates your subscription.",
      },
    ],
  },
  {
    id: "team",
    icon: Users,
    iconBg: "from-blue-500 to-blue-600",
    badge: "Your team",
    title: () => "Add Junior Lawyers",
    subtitle:
      "Build your team directly inside LawPortal. Junior lawyers get their own accounts under your chamber.",
    features: [
      {
        icon: Users,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        title: "Create accounts from Settings",
        desc: "Go to Settings → Junior Lawyers section → click Add Junior. Enter their name, email and a temporary password.",
      },
      {
        icon: BookOpenText,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "Review their work",
        desc: "Junior lawyers can draft cross-examinations and applications. You review and approve them before they're finalised.",
      },
      {
        icon: ShieldCheck,
        color: "text-slate-600 bg-slate-50 border-slate-200",
        title: "Shared chamber, separate logins",
        desc: "All junior lawyers operate under your chamber's subscription. They don't manage billing — only you do.",
      },
    ],
  },
  {
    id: "features",
    icon: BookOpenText,
    iconBg: "from-[#027675] to-[#015f5d]",
    badge: "Core tools",
    title: () => "Everything You Need",
    subtitle:
      "LawPortal is built for the entire lifecycle of a case. Here are the key tools available to you.",
    features: [
      {
        icon: Scale,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "Case Management",
        desc: "Create and track cases from first brief to final judgement. Attach documents, add hearings to your calendar, and monitor deadlines.",
      },
      {
        icon: BookOpenText,
        color: "text-violet-600 bg-violet-50 border-violet-100",
        title: "Cross-Examinations & Applications",
        desc: "AI-assisted drafting of cross-examination questions and court applications. Download as PDF, review junior drafts, and maintain a library.",
      },
      {
        icon: ShieldCheck,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        title: "Judgement Search & AI Extractor",
        desc: "Search Pakistani court judgements, extract key legal points with AI, generate citation images, and save to your personal library.",
      },
    ],
  },
  {
    id: "account",
    icon: Camera,
    iconBg: "from-rose-500 to-rose-600",
    badge: "Your account",
    title: () => "Personalise & Stay Secure",
    subtitle:
      "Keep your account up to date. Here's what you can manage from the Settings page anytime.",
    features: [
      {
        icon: Camera,
        color: "text-rose-600 bg-rose-50 border-rose-100",
        title: "Profile Picture (DP)",
        desc: "Go to Settings and click the camera icon on your avatar to upload a photo. It appears in the sidebar, topbar, and is visible to your junior lawyers.",
      },
      {
        icon: KeyRound,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        title: "Forgot your password?",
        desc: "On the login page, click 'Forgot Password', enter your email, and follow the reset link sent to your inbox. Your account stays secure.",
      },
      {
        icon: RefreshCw,
        color: "text-teal-600 bg-teal-50 border-teal-100",
        title: "Renewing your subscription",
        desc: "Go to Billing → choose Monthly or Yearly → upload your payment screenshot → wait for admin approval. You'll regain full access immediately on approval.",
      },
    ],
  },
];

function ProgressDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i === current
              ? "w-6 h-2 bg-[#027675]"
              : i < current
                ? "w-2 h-2 bg-[#027675]/40"
                : "w-2 h-2 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, color, title, desc, index }) {
  return (
    <div
      className="flex items-start gap-3.5 p-4 rounded-xl border bg-white hover:shadow-sm transition-all duration-200 opacity-0 animate-[fadeSlideIn_0.4s_ease-out_forwards]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function SeniorWelcomeModal({ user, onDismiss }) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const firstName = user?.name || "Counselor";
  const HeroIcon = currentStep.icon;

  const goNext = useCallback(() => {
    if (isAnimating || isLast) return;
    setIsAnimating(true);
    setDirection("forward");
    setTimeout(() => {
      setStep((s) => s + 1);
      setTimeout(() => setIsAnimating(false), 50);
    }, 200);
  }, [isAnimating, isLast]);

  const goPrev = useCallback(() => {
    if (isAnimating || isFirst) return;
    setIsAnimating(true);
    setDirection("back");
    setTimeout(() => {
      setStep((s) => s - 1);
      setTimeout(() => setIsAnimating(false), 50);
    }, 200);
  }, [isAnimating, isFirst]);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-40px);
          }
        }
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(40px);
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#0f1e2e] to-[#013a39] px-6 pt-6 pb-5">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-[#027675]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

          <div
            key={step}
            className={`relative flex items-start gap-4 ${
              direction === "forward"
                ? "animate-[slideInRight_0.3s_ease-out]"
                : "animate-[slideInLeft_0.3s_ease-out]"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentStep.iconBg} flex items-center justify-center shadow-lg shrink-0 transition-all duration-500`}
            >
              <HeroIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 mb-2">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">
                  {currentStep.badge}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white leading-tight">
                {currentStep.title(firstName)}
              </h2>

              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-500 tabular-nums">
            {step + 1} / {STEPS.length}
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-slate-50/50">
          <div key={`features-${step}`}>
            {currentStep.features.map((feat, i) => (
              <div
                key={i}
                className={
                  direction === "forward"
                    ? "animate-[slideInRight_0.3s_ease-out]"
                    : "animate-[slideInLeft_0.3s_ease-out]"
                }
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <FeatureCard {...feat} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
          <div className="mb-4">
            <ProgressDots total={STEPS.length} current={step} />
          </div>

          <div className="flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={goPrev}
                disabled={isAnimating}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all duration-200 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {isLast ? (
              <button
                onClick={handleDismiss}
                disabled={closing}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027675] to-[#015f5d] hover:from-[#028a7a] hover:to-[#016b69] shadow-lg shadow-[#027675]/25 hover:shadow-xl hover:shadow-[#027675]/30 transition-all duration-200 disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {closing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Getting ready…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Let's get started
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={isAnimating}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#027675] to-[#015f5d] hover:from-[#028a7a] hover:to-[#016b69] shadow-lg shadow-[#027675]/25 hover:shadow-xl hover:shadow-[#027675]/30 transition-all duration-200 disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0"
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

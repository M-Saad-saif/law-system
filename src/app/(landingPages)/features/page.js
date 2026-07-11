"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  FolderOpen,
  FileSignature,
  BellRing,
  Rss,
  Users2,
  Sparkles,
  BookMarked,
  MessageSquareText,
  Image,
  Gavel,
  Scale,
  FileStack,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  fadeUp,
  stagger,
  DASH_MAIN,
  SHOT_SETTINGS,
  SHOT_CROSSEXAM,
  SHOT_CASES,
  SHOT_JUDGMENTS,
  SHOT_REMINDERS,
  SHOT_LIBRARY,
  SHOT_APPLICATION_GENERATOR,
} from "@/components/ui/landing/motion";
import FinalCTA from "@/components/ui/landing/FinalCTA";

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    bullets: [
      "Today's hearings + next 7 days",
      "Recent judgments + latest updates",
      "Quick links to cases and drafts",
    ],
    shot: DASH_MAIN,
  },
  {
    icon: Search,
    title: "Judgment Search & Intelligence",
    bullets: [
      "Court filters (SC + all HCs)",
      "PPC section, outcome & year filters",
      "Summary + citation + PDF download",
    ],
    shot: SHOT_JUDGMENTS,
  },
  {
    icon: FolderOpen,
    title: "My Cases",
    bullets: [
      "FIR, sections, parties, advocate",
      "Status + next hearing + notes",
      "Upload and attach documents",
    ],
    shot: SHOT_CASES,
  },
  {
    icon: FileSignature,
    title: "Application Generator",
    bullets: [
      "Select case + application type",
      "Auto-filled heading, cause title, FIR",
      "Copy, download and finalize",
    ],
    shot: SHOT_APPLICATION_GENERATOR,
  },
  {
    icon: BellRing,
    title: "Reminders & Notifications",
    bullets: [
      "Tomorrow alerts + upcoming schedule",
      "Deadline reminders",
      "Email / WhatsApp preferences",
    ],
    shot: SHOT_REMINDERS,
  },
  {
    icon: Rss,
    title: "Legal Updates & Alerts",
    bullets: [
      "Section-based judgment alerts",
      "Legislative updates (Acts, amendments, rules)",
    ],
  },
  {
    icon: Users2,
    title: "Multi-User Access & Settings",
    bullets: [
      "Admin + Associate roles",
      "Permission checkboxes",
      "Activate / deactivate users",
    ],
    shot: SHOT_SETTINGS,
  },
];

const advanced = [
  {
    icon: Sparkles,
    title: "AI Judgment Extractor",
    d: "7-section structured summary from any judgment.",
  },
  {
    icon: BookMarked,
    title: "Judgment Library",
    d: "Tags, notes, pins, and team sharing.",
  },
  {
    icon: MessageSquareText,
    title: "Cross-Exam Review",
    d: "Submit → review → approve, with version history.",
  },
  {
    icon: Image,
    title: "Judgment Image Generator",
    d: "Branded cards, PNG/JPG export.",
  },
];

const useCases = [
  {
    icon: Gavel,
    t: "Bail matters",
    d: "Quick 497 CrPC drafting + latest bail judgments.",
  },
  {
    icon: Scale,
    t: "Criminal trials",
    d: "Case records, hearings, cross-exam prep.",
  },
  {
    icon: FileStack,
    t: "Appeals & revisions",
    d: "Organized notes + important judgments.",
  },
  {
    icon: Briefcase,
    t: "Chamber management",
    d: "Team roles and task clarity.",
  },
];

function WaveDivider({ className = "", fillColor = "currentColor" }) {
  return (
    <div className={`absolute left-0 right-0 ${className}`}>
      <svg 
        viewBox="0 0 1440 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path 
          d="M0 50C240 80 480 20 720 50C960 80 1200 20 1440 50V100H0V50Z" 
          fill={fillColor} 
        />
      </svg>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <main data-testid="features-page" className="overflow-hidden">
      <section className="relative bg-[#eef5f3] pt-36 md:pt-44 pb-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#053433]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0c9c8f]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#053433]/5 to-transparent rounded-full blur-3xl" />
          
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: `radial-gradient(circle, #053433 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm"
          >
            <Star className="w-4 h-4 text-[#0c9c8f] fill-[#0c9c8f]" />
            <span className="text-sm font-medium text-[#053433]">Powerful Legal Tools</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#053433] tracking-tight mb-6"
            data-testid="features-page-heading"
          >
            Everything you need for{" "}
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                daily legal work.
              </span>
              <motion.svg 
                className="absolute -bottom-5 left-0 w-full"
                viewBox="0 0 100 10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <path 
                  d="M0 5 Q 50 10 100 5" 
                  fill="none" 
                  stroke="#0c9c8f" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-base md:text-lg text-[#053433]/60 max-w-2xl mx-auto mb-8"
          >
            Cases, hearings, judgments, drafting, updates, and team workflow — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/register">
              <button
                data-testid="features-trial-btn"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#053433] to-[#0c9c8f] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#0c9c8f]/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/login">
              <button
                data-testid="features-signin-btn"
                className="px-8 py-4 bg-white text-[#053433] font-semibold rounded-full border-2 border-[#053433]/10 hover:border-[#053433]/20 hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </button>
            </Link>
          </motion.div>
        </div>

        <WaveDivider className="-bottom-px h-[60px]" fillColor="#ffffff" />
      </section>

      <section className="relative bg-white py-20 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#eef5f3]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {modules.map(({ icon: Icon, title, bullets, shot }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="group"
            >
              <div 
                className={`relative rounded-3xl p-8 md:p-10 transition-all duration-500 hover:shadow-2xl ${
                  shot 
                    ? "grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-[#eef5f3] to-[#eef5f3]/50 border border-[#053433]/10 hover:border-[#0c9c8f]/30" 
                    : "bg-white border border-[#053433]/8 hover:border-[#053433]/20 hover:shadow-[#053433]/5"
                }`}
                data-testid={`module-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              >
                {/* Top accent line for cards with screenshots */}
                {shot && (
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                <div className={i % 2 === 1 && shot ? "md:order-2" : ""}>
                  {/* Icon */}
                  <div className="relative inline-flex mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#053433] to-[#0c9c8f] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-[#0c9c8f]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#053433] mb-5 group-hover:text-[#0c9c8f] transition-colors duration-300">
                    {title}
                  </h3>

                  {/* Bullets */}
                  <ul className="space-y-3">
                    {bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-3 text-sm md:text-base text-[#053433]/70 group-hover:text-[#053433]/80 transition-colors duration-300"
                      >
                        <span className="flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4 text-[#0c9c8f]" />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Screenshot */}
                {shot && (
                  <div className={`${i % 2 === 1 ? "md:order-1" : ""}`}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white group-hover:border-[#0c9c8f]/20 transition-all duration-500 group-hover:shadow-[#0c9c8f]/20 group-hover:-translate-y-1">
                      <img
                        src={shot}
                        alt={title}
                        className="w-full block"
                        loading="lazy"
                      />
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  </div>
                )}

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Tools Section */}
      <section className="relative bg-[#053433] py-20 md:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0c9c8f]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8fe3d8]/5 rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{
              backgroundImage: `radial-gradient(circle, #8fe3d8 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Wave from previous section - Green color for dark section transition */}
        <WaveDivider className="-top-px h-[100px] bg-white"  fillColor="#053433" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
              <Zap className="w-4 h-4 text-[#8fe3d8]" />
              <span className="text-sm font-medium text-white/80">Advanced Capabilities</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Advanced{" "}
              <span className="relative inline-block">
                <span className="italic text-[#8fe3d8]">Tools</span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fe3d8]/50 to-transparent rounded-full" />
              </span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Powerful features to supercharge your legal workflow
            </p>
          </motion.div>

          {/* Advanced Tools Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          >
            {advanced.map(({ icon: Icon, title, d }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-7 border border-white/10 hover:border-[#8fe3d8]/30 transition-all duration-500 hover:bg-white/10"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#8fe3d8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c9c8f] to-[#8fe3d8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover:text-[#8fe3d8] transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                    {d}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Screenshots */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            <div className="group relative">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-3 border border-white/10 overflow-hidden group-hover:border-[#8fe3d8]/30 transition-all duration-500">
                <img
                  src={SHOT_CROSSEXAM}
                  alt="Cross-examination workflow"
                  className="w-full rounded-2xl block"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#053433]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl flex items-end justify-center p-6">
                  <span className="text-white font-semibold">Cross-Exam Workflow</span>
                </div>
              </div>
            </div>
            <div className="group relative">
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-3 border border-white/10 overflow-hidden group-hover:border-[#8fe3d8]/30 transition-all duration-500">
                <img
                  src={SHOT_LIBRARY}
                  alt="Judgment library"
                  className="w-full rounded-2xl block"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#053433]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl flex items-end justify-center p-6">
                  <span className="text-white font-semibold">Judgment Library</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave to next section */}
        <WaveDivider className="-bottom-px h-[60px]" fillColor="#eef5f3" />
      </section>

      {/* Use Cases Section */}
      <section className="relative bg-[#eef5f3] py-20 md:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#053433]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm">
              <Briefcase className="w-4 h-4 text-[#0c9c8f]" />
              <span className="text-sm font-medium text-[#053433]">Use Cases</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#053433] mb-4">
              Built for{" "}
              <span className="relative inline-block">
                <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                  real practice.
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent rounded-full" />
              </span>
            </h2>
          </motion.div>

          {/* Use Cases Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {useCases.map(({ icon: Icon, t, d }) => (
              <motion.div
                key={t}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative bg-white rounded-3xl p-7 border border-[#053433]/10 hover:border-[#0c9c8f]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#0c9c8f]/10"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eef5f3] to-[#eef5f3]/50 flex items-center justify-center mb-4 group-hover:from-[#053433] group-hover:to-[#0c9c8f] transition-all duration-500">
                    <Icon size={22} className="text-[#053433] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#053433] mb-2 group-hover:text-[#0c9c8f] transition-colors duration-300">
                    {t}
                  </h3>
                  <p className="text-sm text-[#053433]/60 group-hover:text-[#053433]/80 transition-colors duration-300">
                    {d}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-[#0c9c8f]" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}
"use client"

import { motion } from "framer-motion";
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

export default function FeaturesPage() {
  return (
    <main data-testid="features-page">
      <section className="bg-[#eef5f3] pt-36 md:pt-44 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#053433] tracking-tight"
            data-testid="features-page-heading"
          >
            Everything you need for{" "}
            <span className="italic gradient-text">daily legal work.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-base md:text-lg text-[#053433]/60"
          >
            Cases, hearings, judgments, drafting, updates, and team workflow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex justify-center gap-3.5"
          >
            <button
              data-testid="features-trial-btn"
              className="btn-glow px-8 py-3.5 bg-gradient-to-r from-[#0f7e75] to-[#0c9c8f] text-white font-semibold rounded-full"
            >
              Start Free Trial
            </button>
            <button
              data-testid="features-signin-btn"
              className="px-8 py-3.5 bg-white text-[#053433] font-semibold rounded-full border border-[#053433]/10"
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {modules.map(({ icon: Icon, title, bullets, shot }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`card-lift rounded-3xl p-8 md:p-10 ${shot ? "grid md:grid-cols-2 gap-8 items-center bg-[#eef5f3]" : "bg-white border border-[#053433]/8"}`}
              data-testid={`module-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              <div className={i % 2 === 1 && shot ? "md:order-2" : ""}>
                <span className="inline-flex h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0f7e75] to-[#0c9c8f] items-center justify-center mb-4">
                  <Icon size={19} className="text-white" />
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#053433] mb-4">
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-sm text-[#053433]/70"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0c9c8f] shrink-0" />{" "}
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {shot && (
                <div
                  className={`rounded-2xl overflow-hidden shadow-xl border border-white ${i % 2 === 1 ? "md:order-1" : ""}`}
                >
                  <img
                    src={shot}
                    alt={title}
                    className="w-full block"
                    loading="lazy"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#053433] py-20 md:py-24 noise-overlay relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-4xl font-bold text-white text-center mb-12"
          >
            Advanced <span className="italic text-[#8fe3d8]">Tools</span>
          </motion.h2>
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
                className="glass-dark rounded-3xl p-7"
              >
                <Icon size={22} className="text-[#8fe3d8] mb-4" />
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-white/60">{d}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            <div className="glass-dark rounded-3xl p-2.5">
              <img
                src={SHOT_CROSSEXAM}
                alt="Cross-examination workflow"
                className="w-full rounded-2xl block"
                loading="lazy"
              />
            </div>
            <div className="glass-dark rounded-3xl p-2.5">
              <img
                src={SHOT_LIBRARY}
                alt="Judgment library"
                className="w-full rounded-2xl block"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#eef5f3] py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-4xl font-bold text-[#053433] text-center mb-12"
          >
            Built for{" "}
            <span className="italic gradient-text">real practice.</span>
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {useCases.map(({ icon: Icon, t, d }) => (
              <motion.div
                key={t}
                variants={fadeUp}
                className="card-lift bg-white rounded-3xl p-7"
              >
                <Icon size={22} className="text-[#0f7e75] mb-4" />
                <h3 className="font-heading text-lg font-bold text-[#053433] mb-2">
                  {t}
                </h3>
                <p className="text-sm text-[#053433]/60">{d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}

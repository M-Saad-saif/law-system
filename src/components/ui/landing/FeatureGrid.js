import { motion } from "framer-motion";
import {
  LayoutDashboard, Search, FolderOpen, FileSignature, BellRing, Rss, Users2,
} from "lucide-react";
import { fadeUp, stagger, SHOT_CALENDAR, SHOT_SETTINGS, SHOT_CASES, SHOT_JUDGMENTS, SHOT_REMINDERS } from "./motion";

const chips = ["Post arrest bail", "Pre arrest bail", "Adjournment", "Exemption", "Placement of documents", "Substitute witness", "Misc."];

function ShotCard({ icon: Icon, title, desc, shot, alt, testid }) {
  return (
    <motion.div variants={fadeUp} className="card-lift bg-[#eef5f3] rounded-3xl p-8 overflow-hidden" data-testid={testid}>
      <div className="flex items-center gap-3 mb-3">
        <span className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <Icon size={18} className="text-[#0f7e75]" />
        </span>
        <h3 className="font-heading text-xl font-bold text-[#053433]">{title}</h3>
      </div>
      <p className="text-sm text-[#053433]/60 mb-6">{desc}</p>
      <div className="rounded-2xl overflow-hidden shadow-lg border border-white -mb-16">
        <img src={shot} alt={alt} className="w-full block" loading="lazy" />
      </div>
    </motion.div>
  );
}

export default function FeatureGrid() {
  return (
    <section className="bg-white py-24 md:py-28" data-testid="feature-grid-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f7e75] mb-4">What's Included</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight" data-testid="feature-grid-heading">
            One system. <span className="italic gradient-text">Every legal workflow.</span>
          </h2>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
          <ShotCard
            icon={LayoutDashboard}
            title="Dashboard & Calendar"
            desc="One screen for your whole day — hearings, deadlines, and updates."
            shot={SHOT_CALENDAR}
            alt="Legal Portal calendar"
            testid="feature-card-dashboard"
          />

          {/* Application generator */}
          <motion.div variants={fadeUp} className="card-lift bg-[#053433] rounded-3xl p-8 text-left relative overflow-hidden noise-overlay" data-testid="feature-card-generator">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <FileSignature size={18} className="text-[#8fe3d8]" />
                </span>
                <h3 className="font-heading text-xl font-bold text-white">Application Generator</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">Select case → choose type → get a complete, auto-filled draft.</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span key={c} className="text-xs font-medium text-white/85 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">{c}</span>
                ))}
              </div>
              <div className="mt-6 glass-dark rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/45 font-semibold mb-1.5">Generated Draft</p>
                <p className="text-xs text-white/80 font-mono leading-relaxed">IN THE COURT OF SESSIONS JUDGE, LAHORE<br />Application for Post-Arrest Bail u/s 497 CrPC<br />FIR No. 442/2025 · PS Model Town…</p>
              </div>
            </div>
          </motion.div>

          <ShotCard
            icon={FolderOpen}
            title="My Cases"
            desc="Your full chamber case record — FIR, court, client, status, next hearing."
            shot={SHOT_CASES}
            alt="Case management list"
            testid="feature-card-cases"
          />

          <ShotCard
            icon={Search}
            title="Judgment Search"
            desc="Search Pakistani superior courts — filter by court, sections, type, year."
            shot={SHOT_JUDGMENTS}
            alt="Court judgments search"
            testid="feature-card-search"
          />

          <ShotCard
            icon={BellRing}
            title="Hearing Reminders"
            desc="Alerts before hearings, deadlines, and urgent dates."
            shot={SHOT_REMINDERS}
            alt="Reminders panel"
            testid="feature-card-reminders"
          />

          {/* Legal updates text card */}
          <motion.div variants={fadeUp} className="card-lift bg-white border border-[#053433]/8 rounded-3xl p-8" data-testid="feature-card-updates">
            <span className="h-10 w-10 rounded-xl bg-[#eef5f3] flex items-center justify-center mb-4">
              <Rss size={18} className="text-[#0f7e75]" />
            </span>
            <h3 className="font-heading text-xl font-bold text-[#053433] mb-2">Legal Updates</h3>
            <p className="text-sm text-[#053433]/60 mb-5">Judgment alerts by PPC section + legislative updates.</p>
            <div className="space-y-2">
              {["SCP — 2,615 judgments synced", "LHC — 9,311 judgments synced", "IHC — 11,386 judgments synced"].map((u) => (
                <div key={u} className="flex items-center gap-2.5 bg-[#eef5f3] rounded-xl px-4 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0c9c8f] shrink-0" />
                  <span className="text-xs font-semibold text-[#053433]">{u}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Multi-user with settings screenshot */}
          <motion.div variants={fadeUp} className="card-lift bg-[#eef5f3] rounded-3xl p-8 md:col-span-2 grid md:grid-cols-2 gap-8 items-center overflow-hidden" data-testid="feature-card-team">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Users2 size={18} className="text-[#0f7e75]" />
                </span>
                <h3 className="font-heading text-xl font-bold text-[#053433]">Multi-User Access & Roles</h3>
              </div>
              <p className="text-sm text-[#053433]/60">Admin + Associates. Permission-based access. Activate or deactivate users anytime.</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-white md:-mb-20 md:-mr-2">
              <img src={SHOT_SETTINGS} alt="Users and roles settings" className="w-full block" loading="lazy" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

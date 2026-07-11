import { motion } from "framer-motion";
import { Sparkles, BookMarked, MessageSquareText, Image } from "lucide-react";
import { fadeUp, stagger, SHOT_CROSSEXAM, SHOT_LIBRARY } from "./motion";

const tools = [
  { icon: Sparkles, title: "AI Judgment Extractor", desc: "Paste a judgment → get a clean 7-section summary.", cta: "Try Extractor" },
  { icon: BookMarked, title: "Judgment Library", desc: "Save, tag and pin important judgments. Share with your team.", cta: "View Library" },
  { icon: MessageSquareText, title: "Cross-Exam Review", desc: "Junior drafts. Senior reviews. Everything tracked.", cta: "Explore Workflow" },
  { icon: Image, title: "Judgment Image Generator", desc: "Branded judgment cards. Export PNG / JPG.", cta: "Generate Image" },
];

export default function AdvancedTools() {
  return (
    <section className="bg-[#053433] py-24 md:py-28 relative overflow-hidden noise-overlay" data-testid="advanced-tools-section">
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0c9c8f]/20 blur-[140px] rounded-full" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8fe3d8] mb-4">Advanced Tools</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight" data-testid="advanced-tools-heading">
            Work smarter, <span className="italic text-[#8fe3d8]">not longer.</span>
          </h2>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {tools.map(({ icon: Icon, title, desc, cta }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="glass-dark rounded-3xl p-7 flex flex-col"
              data-testid={`tool-card-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0f7e75] to-[#0c9c8f] flex items-center justify-center mb-5 shadow-lg shadow-[#0c9c8f]/30">
                <Icon size={19} className="text-white" />
              </span>
              <h3 className="font-heading text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/60 flex-1">{desc}</p>
              <span className="mt-5 text-sm font-semibold text-[#8fe3d8]">{cta} →</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="glass-dark rounded-3xl p-2.5 shadow-2xl shadow-black/40">
            <img src={SHOT_CROSSEXAM} alt="Cross-examination review workflow" className="w-full rounded-2xl block" loading="lazy" data-testid="crossexam-screenshot" />
          </div>
          <div className="glass-dark rounded-3xl p-2.5 shadow-2xl shadow-black/40">
            <img src={SHOT_LIBRARY} alt="Judgment library" className="w-full rounded-2xl block" loading="lazy" data-testid="library-screenshot" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

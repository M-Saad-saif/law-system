"use client"

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BellRing, Search, FileSignature, Sparkles } from "lucide-react";
import { DASH_MAIN } from "./motion";
import LawParticles from "./LawParticles";

const strip = [
  { icon: BellRing, text: "Never miss a hearing" },
  { icon: Search, text: "Find judgments in seconds" },
  { icon: FileSignature, text: "Draft applications faster" },
];

export default function Hero() {
  const shotRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: shotRef,
    offset: ["start 95%", "start 35%"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.75, 1]);

  return (
    <section className="relative overflow-hidden hero-dark pt-36 md:pt-44 pb-0" data-testid="hero-section">
      {/* Law-themed background particles */}
      <LawParticles />
      
      {/* Light beams & structure lines */}
      <span className="hero-beam hero-beam-l" />
      <span className="hero-beam hero-beam-r" />
      <span className="hero-hline top-[46%] opacity-60" />
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#0c9c8f]/20 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-[13px] font-semibold text-[#053433] bg-white rounded-full px-5 py-2 shadow-lg shadow-black/20 mb-8"
          data-testid="hero-badge"
        >
          Manage your chamber in one place
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.04]"
          data-testid="hero-heading"
        >
          Run your law chamber{" "}
          <br className="hidden sm:block" />
          on <span className="font-heading italic font-semibold text-[#8fe3d8]">one portal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-7 text-base md:text-lg text-white/70 max-w-md mx-auto leading-relaxed"
          data-testid="hero-subtitle"
        >
          Cases, hearings, judgments, drafting, and updates — all in one clean system.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-9 flex flex-col items-center gap-4"
        >
          <button
            data-testid="hero-trial-btn"
            className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-white text-[#053433] font-semibold rounded-full shadow-xl shadow-black/25"
          >
            <Sparkles size={16} className="text-[#0f7e75]" />
            Start Your Free Trial
          </button>
          <button data-testid="hero-signin-btn" className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-300">
            Already a member? Sign In →
          </button>
        </motion.div>

        {/* Screenshot with Apple-style scroll tilt */}
        <div ref={shotRef} className="mt-8 md:mt-12 perspective-1200 relative" data-testid="hero-dashboard-frame">
          <div className="absolute inset-x-0 bottom-0 top-1/4 bg-[#8fe3d8]/30 blur-[150px] rounded-full pointer-events-none" />
          <motion.div
            style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
            className="relative max-w-6xl mx-auto origin-bottom will-change-transform"
          >
            <div className="bg-[#021513] rounded-t-2xl md:rounded-t-3xl border border-white/15 border-b-0 shadow-[0_-20px_120px_-20px_rgba(1,13,12,0.9)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 bg-[#032220] border-b border-white/8">
                <span className="h-3 w-3 rounded-full bg-white/15" />
                <span className="h-3 w-3 rounded-full bg-[#0f7e75]/60" />
                <span className="h-3 w-3 rounded-full bg-[#0c9c8f]/70" />
                <span className="ml-4 text-xs text-white/50 bg-white/8 border border-white/10 rounded-full px-4 py-1">app.legalportal.pk/dashboard</span>
              </div>
              <img src={DASH_MAIN} alt="Legal Portal dashboard" className="w-full block" loading="eager" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick value strip — floating glass card bridging the seam */}
      <div className="bg-white relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="glass-light -mt-10 md:-mt-14 rounded-3xl shadow-[0_24px_60px_-20px_rgba(5,52,51,0.25)] px-6 py-8 md:py-9 grid sm:grid-cols-3 gap-6 relative"
            data-testid="value-strip"
          >
            {strip.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center justify-center gap-3"
              >
                <span className="h-11 w-11 rounded-2xl bg-[#eef5f3] flex items-center justify-center shrink-0">
                  <Icon size={19} className="text-[#0f7e75]" />
                </span>
                <span className="font-semibold text-[#053433]">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="h-10" />
      </div>
    </section>
  );
}

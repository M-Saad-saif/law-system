import { motion } from "framer-motion";
import { fadeUp } from "./motion";

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-28 bg-white" data-testid="final-cta-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="gradient-cta rounded-[2.5rem] px-8 py-16 md:px-16 md:py-24 text-center relative overflow-hidden noise-overlay"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight" data-testid="final-cta-heading">
              Start your <span className="italic text-[#8fe3d8]">7-day free trial.</span>
            </h2>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button data-testid="cta-trial-btn" className="btn-glow w-full sm:w-auto px-9 py-4 bg-white text-[#053433] font-semibold rounded-full">
                Start Free Trial
              </button>
              <button data-testid="cta-signin-btn" className="w-full sm:w-auto px-9 py-4 glass-dark text-white font-semibold rounded-full hover:bg-white/15 transition-all duration-300">
                Sign In
              </button>
            </div>
            <p className="mt-7 text-sm text-white/55">
              Need help onboarding? Email:{" "}
              <a href="mailto:genzomate@gmail.com" className="text-[#8fe3d8] font-semibold" data-testid="cta-email-link">genzomate@gmail.com</a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

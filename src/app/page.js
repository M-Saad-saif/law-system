"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import Hero from "@/components/ui/landing/Hero";
import FeatureGrid from "@/components/ui/landing/FeatureGrid";
import AdvancedTools from "@/components/ui/landing/AdvancedTools";
import HowItWorks from "@/components/ui/landing/HowItWorks";
import PricingTeaser from "@/components/ui/landing/PricingTeaser";
import FAQList from "@/components/ui/landing/FAQList";
import FinalCTA from "@/components/ui/landing/FinalCTA";
import { fadeUp } from "@/components/ui/landing/motion";

export default function Home() {
  return (
    <main data-testid="home-page">
      <Hero />
      <FeatureGrid />
      <AdvancedTools />
      <HowItWorks />
      <PricingTeaser />

      <section className="bg-[#eef5f3] py-24 md:py-28" data-testid="home-faq-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f7e75] mb-4">FAQs</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight">
              Questions, <span className="italic gradient-text">answered.</span>
            </h2>
          </motion.div>
          <FAQList limit={6} />
          <div className="text-center mt-8">
            <Link href="/faqs" data-testid="view-all-faqs-btn" className="text-sm font-semibold text-[#0f7e75] hover:underline">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}

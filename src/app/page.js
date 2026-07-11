"use client";

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
import Navbar from "@/components/ui/landing/Navbar";
import { Star, ChevronRight } from "lucide-react";

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

export default function Home() {
  return (
    <>
      <Navbar />
      <main data-testid="home-page" className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative bg-[#eef5f3] overflow-hidden">
          <Hero />
          <WaveDivider className="-bottom-px h-[60px]" fillColor="#ffffff" />
        </section>

        {/* Feature Grid Section */}
        <section className="relative bg-white overflow-hidden">
          <FeatureGrid />
          <WaveDivider className="-bottom-px h-[60px]" fillColor="#053433" />
        </section>

        {/* Advanced Tools Section */}
        <section className="relative bg-[#053433] overflow-hidden">
          <AdvancedTools />
          <WaveDivider className="-bottom-px h-[60px]" fillColor="#eef5f3" />
        </section>

        {/* How It Works Section */}
        <section className="relative bg-[#eef5f3] overflow-hidden">
          <HowItWorks />
          <WaveDivider className="-bottom-px h-[60px]" fillColor="#ffffff" />
        </section>

        {/* Pricing Teaser Section */}
        <section className="relative bg-white overflow-hidden">
          <PricingTeaser />
          <WaveDivider className="-bottom-px h-[60px]" fillColor="#eef5f3" />
        </section>

        {/* FAQ Section */}
        <section
          className="relative bg-[#eef5f3] py-24 md:py-28 overflow-hidden"
          data-testid="home-faq-section"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#053433]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm">
                <Star className="w-4 h-4 text-[#0c9c8f] fill-[#0c9c8f]" />
                <span className="text-sm font-medium text-[#053433]">FAQs</span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight">
                Questions,{" "}
                <span className="relative inline-block">
                  <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                    answered.
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent rounded-full" />
                </span>
              </h2>
            </motion.div>

            <FAQList limit={6} />
            
            <motion.div 
              className="text-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/faqs"
                data-testid="view-all-faqs-btn"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#053433] hover:text-[#0c9c8f] transition-colors duration-300 bg-white rounded-full px-6 py-3 shadow-sm border border-[#053433]/10 hover:border-[#0c9c8f]/30 hover:shadow-md"
              >
                View all FAQs
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative bg-white">
          <FinalCTA />
        </section>
      </main>
    </>
  );
}
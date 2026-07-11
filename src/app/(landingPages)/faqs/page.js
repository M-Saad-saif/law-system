"use client";
import { motion } from "framer-motion";
import FAQList from "@/components/ui/landing/FAQList";
import FinalCTA from "@/components/ui/landing/FinalCTA";

export default function FAQsPage() {
  return (
    <main data-testid="faqs-page">
      <section className="bg-[#eef5f3] pt-36 md:pt-44 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center mb-14">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#053433] tracking-tight" data-testid="faqs-page-heading">
            Frequently asked <span className="italic gradient-text">questions.</span>
          </motion.h1>
        </div>
        <div className="px-4">
          <FAQList />
        </div>
      </section>
      <FinalCTA />
    </main>
  );
}

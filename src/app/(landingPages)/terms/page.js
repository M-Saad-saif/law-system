"use client"

import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/landing/motion";

const keyPoints = [
  "Use the Service legally and professionally",
  "You are responsible for your account users",
  "Drafts and AI outputs must be reviewed before use",
  "Payments are strictly non-refundable",
  "We may suspend accounts for misuse",
];

const sections = [
  {
    t: "1. Accounts & Roles",
    d: "Admins are responsible for all users invited under their account, including Associates and their permissions.",
  },
  {
    t: "2. Acceptable Use",
    d: "The Service must be used only for lawful, professional legal work. Misuse, scraping, or resale is prohibited.",
  },
  {
    t: "3. Customer Content Ownership",
    d: "You own your case data, documents, and notes. We only process them to provide the Service.",
  },
  {
    t: "4. Trial & Subscriptions",
    d: "A 7-day free trial is offered. Paid access continues per your selected plan (monthly, yearly, or lifetime).",
  },
  {
    t: "5. Payments by Bank Transfer",
    d: "Payments are made by bank transfer with proof sent to genzomate@gmail.com. Activation follows verification, usually within 24 hours.",
  },
  { t: "6. No Refunds", d: "All paid plans are strictly non-refundable." },
  {
    t: "7. Suspension & Termination",
    d: "Accounts may be suspended for non-payment or misuse. Access resumes after resolution and verification.",
  },
  {
    t: "8. Liability Limits",
    d: "The Service is provided as-is. AI outputs and drafts are assistive only — final legal responsibility rests with the advocate.",
  },
  {
    t: "9. Governing Law",
    d: "These terms are governed by the laws of Pakistan.",
  },
  {
    t: "10. Changes to Terms",
    d: "We may update these terms; continued use means acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main data-testid="terms-page">
      <section className="bg-[#eef5f3] pt-36 md:pt-44 pb-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-heading text-4xl sm:text-5xl font-bold text-[#053433] tracking-tight"
          data-testid="terms-page-heading"
        >
          Terms of <span className="italic gradient-text">Service</span>
        </motion.h1>
        <p className="mt-4 text-sm text-[#053433]/50">
          Last updated: 08 July 2026 · Contact: genzomate@gmail.com
        </p>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#eef5f3] rounded-3xl p-8 mb-10"
            data-testid="terms-key-points"
          >
            <h2 className="font-heading text-xl font-bold text-[#053433] mb-4">
              Key points
            </h2>
            <ul className="space-y-2.5">
              {keyPoints.map((k) => (
                <li
                  key={k}
                  className="flex items-center gap-2.5 text-sm text-[#053433]/70"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0c9c8f] shrink-0" />{" "}
                  {k}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="space-y-7">
            {sections.map((s) => (
              <div key={s.t}>
                <h3 className="font-heading text-lg font-bold text-[#053433] mb-1.5">
                  {s.t}
                </h3>
                <p className="text-sm text-[#053433]/60 leading-relaxed">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

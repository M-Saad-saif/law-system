"use client"

import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/landing/motion";

const blocks = [
  {
    t: "What data we collect",
    items: ["Account info (name, email, role)", "Case data you enter (FIR, sections, notes, documents)", "Basic usage logs for security and performance", "Billing / payment proof if you send it"],
  },
  {
    t: "How we use data",
    items: ["To run features (cases, reminders, drafting, judgment tools)", "To provide support", "To secure and improve the Service", "To comply with legal requirements"],
  },
  {
    t: "Security summary",
    items: ["HTTPS/TLS in transit", "Encryption at rest for stored data", "Password hashing (we can't read your password)", "Role-based access control", "Backups"],
  },
  {
    t: "Data retention",
    items: ["After cancellation, data is typically retained up to 30 days for recovery/export, then deleted or anonymized (subject to backup rotation and legal requirements)."],
  },
  {
    t: "Your choices",
    items: ["Request export or deletion by emailing genzomate@gmail.com"],
  },
];

export default function PrivacyPage() {
  return (
    <main data-testid="privacy-page">
      <section className="bg-[#eef5f3] pt-36 md:pt-44 pb-14 text-center">
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="font-heading text-4xl sm:text-5xl font-bold text-[#053433] tracking-tight" data-testid="privacy-page-heading">
          Privacy <span className="italic gradient-text">Policy</span>
        </motion.h1>
        <p className="mt-4 text-sm text-[#053433]/50">Last updated: 08 July 2026 · Contact: genzomate@gmail.com</p>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          {blocks.map((b) => (
            <motion.div key={b.t} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-[#eef5f3] rounded-3xl p-8" data-testid={`privacy-block-${b.t.toLowerCase().replace(/\s+/g, "-")}`}>
              <h2 className="font-heading text-xl font-bold text-[#053433] mb-4">{b.t}</h2>
              <ul className="space-y-2.5">
                {b.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#053433]/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c9c8f] shrink-0 mt-1.5" /> {i}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

"use client"

import { motion } from "framer-motion";
import { Banknote, Mail, Clock, RefreshCcw, ShieldX } from "lucide-react";
import { fadeUp, stagger } from "@/components/ui/landing/motion";
import { plans, PlanCard } from "@/components/ui/landing/PricingTeaser";
import FAQList from "@/components/ui/landing/FAQList";
import FinalCTA from "@/components/ui/landing/FinalCTA";

const badges = [
  "7-day free trial",
  "Bank transfer payment",
  "Activation within 24 hours",
];

const paySteps = [
  {
    icon: Banknote,
    t: "Pay via bank transfer",
    d: "Bank details shared on request / invoice.",
  },
  {
    icon: Mail,
    t: "Send payment proof",
    d: "Email screenshot or receipt to genzomate@gmail.com.",
  },
  {
    icon: Clock,
    t: "Activated within 24 hours",
    d: "We verify and activate your plan.",
  },
];

const pricingFaqs = [
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrade or downgrade anytime — the new plan applies from your next billing cycle.",
  },
  {
    q: "How many users are allowed in Chamber?",
    a: "The Chamber plan supports your full team with Admin and Associate roles.",
  },
  {
    q: "Do you give invoice/receipt confirmation?",
    a: "Yes, we confirm every verified payment by email.",
  },
  {
    q: "How fast is activation?",
    a: "Usually within 24 hours after payment verification.",
  },
];

export default function PricingPage() {
  return (
    <main data-testid="pricing-page">
      <section className="bg-[#eef5f3] pt-36 md:pt-44 pb-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#053433] tracking-tight"
            data-testid="pricing-page-heading"
          >
            Simple pricing for{" "}
            <span className="italic gradient-text">every chamber.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-5 text-[#053433]/60"
          >
            Start free. Upgrade when you're ready.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-7 flex flex-wrap justify-center gap-2.5"
          >
            {badges.map((b) => (
              <span
                key={b}
                className="text-xs font-semibold text-[#0f7e75] bg-white rounded-full px-4 py-2 shadow-sm"
              >
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6 items-stretch"
          >
            {plans.map((p) => (
              <PlanCard key={p.name} p={p} />
            ))}
          </motion.div>
        </div>
      </section>

      <section
        className="bg-[#eef5f3] py-20 md:py-24"
        data-testid="payment-section"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-4xl font-bold text-[#053433] text-center mb-12"
          >
            How payment works{" "}
            <span className="italic gradient-text">(no gateway)</span>
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5 mb-8"
          >
            {paySteps.map(({ icon: Icon, t, d }, i) => (
              <motion.div
                key={t}
                variants={fadeUp}
                className="card-lift bg-white rounded-3xl p-8 text-center"
              >
                <span className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0f7e75] to-[#0c9c8f] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" />
                </span>
                <span className="font-heading text-sm font-bold text-[#0c9c8f]">
                  Step {i + 1}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#053433] mt-1 mb-2">
                  {t}
                </h3>
                <p className="text-sm text-[#053433]/60">{d}</p>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-center text-xs text-[#053433]/45">
            Bank charges (if any) are paid by the customer.
          </p>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#eef5f3] rounded-3xl p-8"
            data-testid="renewal-card"
          >
            <RefreshCcw size={22} className="text-[#0f7e75] mb-4" />
            <h3 className="font-heading text-xl font-bold text-[#053433] mb-3">
              Expiry & Renewal
            </h3>
            <ul className="space-y-2 text-sm text-[#053433]/70">
              <li>• Access is suspended if renewal is not received.</li>
              <li>• Renew anytime by bank transfer + payment proof.</li>
              <li>• Access restores within 24 hours after verification.</li>
            </ul>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#053433] rounded-3xl p-8 noise-overlay relative overflow-hidden"
            data-testid="refund-card"
          >
            <div className="relative z-10">
              <ShieldX size={22} className="text-[#8fe3d8] mb-4" />
              <h3 className="font-heading text-xl font-bold text-white mb-3">
                Refund Policy
              </h3>
              <p className="text-sm text-white/70">
                Paid plans are strictly non-refundable. We provide a 7-day free
                trial so you can test before paying.
              </p>
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
            className="font-heading text-3xl md:text-4xl font-bold text-[#053433] text-center mb-10"
          >
            Pricing <span className="italic gradient-text">FAQs</span>
          </motion.h2>
          <FAQList items={pricingFaqs} />
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}

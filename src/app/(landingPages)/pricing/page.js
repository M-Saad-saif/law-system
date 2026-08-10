"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Mail,
  Clock,
  RefreshCcw,
  ShieldX,
  Star,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Zap,
} from "lucide-react";
import { fadeUp, stagger } from "@/components/ui/landing/motion";
import { plans, PlanCard } from "@/components/ui/landing/PricingTeaser";
import FAQList from "@/components/ui/landing/FAQList";
import FinalCTA from "@/components/ui/landing/FinalCTA";
import Link from "next/link";
import { notFound } from "next/navigation";

const badges = [
  "7-day free trial",
  "Bank transfer payment",
  "EasyPaisa, Rasst (Recommended)",
  "Activation within 24 hours",
];

const paySteps = [
  {
    icon: Banknote,
    t: "Pay via bank transfer, Easypaisa, Rasst",
    d: "Bank details shared on request / invoiceID",
  },
  {
    icon: Mail,
    t: "Send payment proof",
    d: "After payment attach payment screenshot and invoice ID for confirmation",
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
    a: "The Chamber plan supports your full team with roles.",
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

export default function PricingPage() {
  const showNotFound = true;

  if (showNotFound) {
    notFound();
  }
  
  return (
    <main data-testid="pricing-page" className="overflow-hidden">
      <section className="relative bg-[#eef5f3] pt-36 md:pt-44 pb-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#053433]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0c9c8f]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#053433]/5 to-transparent rounded-full blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #053433 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm"
          >
            <CreditCard className="w-4 h-4 text-[#0c9c8f]" />
            <span className="text-sm font-medium text-[#053433]">
              Simple & Transparent
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#053433] tracking-tight mb-6"
            data-testid="pricing-page-heading"
          >
            Simple pricing for{" "}
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                every chamber.
              </span>
              <motion.svg
                className="absolute -bottom-5 h-8 left-0 w-full"
                viewBox="0 0 100 10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  fill="none"
                  stroke="#0c9c8f"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-[#053433]/60 max-w-2xl mx-auto mb-8"
          >
            Start free. Upgrade when you're ready.
          </motion.p>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#053433] bg-white rounded-full px-4 py-2 shadow-sm border border-[#053433]/10 hover:border-[#0c9c8f]/30 hover:shadow-md transition-all duration-300"
              >
                <CheckCircle2 className="w-3 h-3 text-[#0c9c8f]" />
                {b}
              </span>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <Link href="#pricing-plans">
              <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#053433] to-[#0c9c8f] text-white font-semibold rounded-full hover:shadow-xl hover:shadow-[#0c9c8f]/25 transition-all duration-300 hover:-translate-y-0.5">
                View Plans
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Wave to next section */}
        <WaveDivider className="-bottom-px h-[100px]" fillColor="#ffffff" />
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing-plans" className="relative bg-white py-20 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#eef5f3]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#eef5f3] rounded-full px-4 py-2 mb-6 border border-[#053433]/10">
              <Zap className="w-4 h-4 text-[#0c9c8f]" />
              <span className="text-sm font-medium text-[#053433]">
                Choose Your Plan
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#053433]">
              Pick the perfect plan for{" "}
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                your practice
              </span>
            </h2>
          </motion.div>

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

        {/* Wave to next section */}
        <WaveDivider className="-bottom-px h-[100px]" fillColor="#eef5f3" />
      </section>

      {/* How Payment Works Section */}
      <section
        className="relative bg-[#eef5f3] py-20 md:py-24"
        data-testid="payment-section"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#053433]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm">
              <Banknote className="w-4 h-4 text-[#0c9c8f]" />
              <span className="text-sm font-medium text-[#053433]">
                Payment Process
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#053433] mb-4">
              How payment works{" "}
              <span className="relative inline-block">
                <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                  (no gateway)
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent rounded-full" />
              </span>
            </h2>
          </motion.div>

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
                whileHover={{ y: -6 }}
                className="group relative bg-white rounded-3xl p-8 text-center border border-[#053433]/10 hover:border-[#0c9c8f]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#0c9c8f]/10"
              >
                {/* Step number badge */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-[#053433] to-[#0c9c8f] text-white flex items-center justify-center text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {i + 1}
                </div>

                {/* Icon */}
                <div className="relative inline-flex mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#053433] to-[#0c9c8f] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-[#0c9c8f]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Step label */}
                <span className="inline-block font-heading text-xs font-bold text-[#0c9c8f] bg-[#eef5f3] rounded-full px-3 py-1 mb-3">
                  Step {i + 1}
                </span>

                <h3 className="font-heading text-lg font-bold text-[#053433] mt-1 mb-2 group-hover:text-[#0c9c8f] transition-colors duration-300">
                  {t}
                </h3>
                <p className="text-sm text-[#053433]/60 group-hover:text-[#053433]/80 transition-colors duration-300">
                  {d}
                </p>

                {/* Arrow between steps */}
                {i < paySteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#0c9c8f]/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-xs text-[#053433]/45">
            Bank charges (if any) are paid by the customer.
          </p>
        </div>

        {/* Wave to next section */}
        <WaveDivider className="-bottom-px h-[100px]" fillColor="#ffffff" />
      </section>

      {/* Expiry & Refund Section */}
      <section className="relative bg-white py-20 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#eef5f3]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-[#eef5f3] rounded-full px-4 py-2 mb-6 border border-[#053433]/10">
              <ShieldX className="w-4 h-4 text-[#0c9c8f]" />
              <span className="text-sm font-medium text-[#053433]">
                Important Policies
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#053433]">
              Renewal &{" "}
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                Refunds
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group relative bg-gradient-to-br from-[#eef5f3] to-[#eef5f3]/50 rounded-3xl p-8 md:p-10 border border-[#053433]/10 hover:border-[#0c9c8f]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#0c9c8f]/10"
              data-testid="renewal-card"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#053433] to-[#0c9c8f] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCcw size={22} className="text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-[#053433] mb-4 group-hover:text-[#0c9c8f] transition-colors duration-300">
                  Expiry & Renewal
                </h3>
                <ul className="space-y-3">
                  {[
                    "Access is suspended if renewal is not received.",
                    "Renew anytime by bank transfer + payment proof.",
                    "Access restores within 24 hours after verification.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-[#053433]/70 group-hover:text-[#053433]/80 transition-colors duration-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#0c9c8f] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group relative bg-gradient-to-br from-[#053433] to-[#0a2a29] rounded-3xl p-8 md:p-10 border border-white/10 hover:border-[#8fe3d8]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#053433]/25 overflow-hidden"
              data-testid="refund-card"
            >
              {/* Background effects */}
              <div className="absolute inset-0 noise-overlay opacity-20" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0c9c8f]/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c9c8f] to-[#8fe3d8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ShieldX size={22} className="text-white" />
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-4 group-hover:text-[#8fe3d8] transition-colors duration-300">
                  Refund Policy
                </h3>
                <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 leading-relaxed">
                  Paid plans are strictly non-refundable. We provide a 7-day
                  free trial so you can test before paying.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave to next section */}
        <WaveDivider className="-bottom-px h-[100px]" fillColor="#eef5f3" />
      </section>

      {/* FAQs Section */}
      <section className="relative bg-[#eef5f3] py-20 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#053433]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm">
              <Star className="w-4 h-4 text-[#0c9c8f] fill-[#0c9c8f]" />
              <span className="text-sm font-medium text-[#053433]">
                Common Questions
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#053433]">
              Pricing{" "}
              <span className="relative inline-block">
                <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                  FAQs
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent rounded-full" />
              </span>
            </h2>
          </motion.div>

          <FAQList items={pricingFaqs} />
        </div>
      </section>

      <FinalCTA />
    </main>
  );
}

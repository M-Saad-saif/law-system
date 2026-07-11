"use client"

import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/landing/motion";
import { 
  Scale, 
  Shield, 
  AlertTriangle, 
  FileText,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Gavel,
  Users,
  Ban,
  Crown,
  CreditCard,
  AlertCircle,
  PauseCircle,
  AlertOctagon,
  Globe,
  RefreshCw
} from "lucide-react";

const keyPoints = [
  { text: "Use the Service legally and professionally", icon: Scale },
  { text: "You are responsible for your account users", icon: Users },
  { text: "Drafts and AI outputs must be reviewed before use", icon: AlertTriangle },
  { text: "Payments are strictly non-refundable", icon: Ban },
  { text: "We may suspend accounts for misuse", icon: AlertOctagon },
];

const sections = [
  {
    t: "1. Accounts & Roles",
    d: "Admins are responsible for all users invited under their account, including Associates and their permissions.",
    icon: Users,
  },
  {
    t: "2. Acceptable Use",
    d: "The Service must be used only for lawful, professional legal work. Misuse, scraping, or resale is prohibited.",
    icon: Shield,
  },
  {
    t: "3. Customer Content Ownership",
    d: "You own your case data, documents, and notes. We only process them to provide the Service.",
    icon: Crown,
  },
  {
    t: "4. Trial & Subscriptions",
    d: "A 7-day free trial is offered. Paid access continues per your selected plan (monthly, yearly, or lifetime).",
    icon: FileText,
  },
  {
    t: "5. Payments by Bank Transfer",
    d: "Payments are made by bank transfer with proof sent to genzomate@gmail.com. Activation follows verification, usually within 24 hours.",
    icon: CreditCard,
  },
  { 
    t: "6. No Refunds", 
    d: "All paid plans are strictly non-refundable.",
    icon: Ban,
  },
  {
    t: "7. Suspension & Termination",
    d: "Accounts may be suspended for non-payment or misuse. Access resumes after resolution and verification.",
    icon: PauseCircle,
  },
  {
    t: "8. Liability Limits",
    d: "The Service is provided as-is. AI outputs and drafts are assistive only — final legal responsibility rests with the advocate.",
    icon: AlertTriangle,
  },
  {
    t: "9. Governing Law",
    d: "These terms are governed by the laws of Pakistan.",
    icon: Globe,
  },
  {
    t: "10. Changes to Terms",
    d: "We may update these terms; continued use means acceptance of the updated terms.",
    icon: RefreshCw,
  },
];

export default function TermsPage() {
  return (
    <main data-testid="terms-page" className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#eef5f3] pt-36 md:pt-44 pb-20 md:pb-24 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#053433]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0c9c8f]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#053433]/5 to-transparent rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: `radial-gradient(circle, #053433 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#053433]/10 shadow-sm"
          >
            <Gavel className="w-4 h-4 text-[#0c9c8f]" />
            <span className="text-sm font-medium text-[#053433]">Last updated: 08 July 2026</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[#053433] tracking-tight mb-6"
            data-testid="terms-page-heading"
          >
            Terms of{" "}
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                Service
              </span>
              <motion.svg 
                className="absolute -bottom-2 left-0 w-full"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[#053433]/60 max-w-2xl mx-auto"
          >
            Please read these terms carefully before using our legal portal services.
          </motion.p>

          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-md border border-[#053433]/10"
          >
            <div className="w-8 h-8 rounded-full bg-[#eef5f3] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#053433]" />
            </div>
            <span className="text-sm text-[#053433]/70">
              Contact:{" "}
              <a href="mailto:genzomate@gmail.com" className="font-semibold text-[#053433] hover:text-[#0c9c8f] transition-colors">
                genzomate@gmail.com
              </a>
            </span>
          </motion.div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50C240 80 480 20 720 50C960 80 1200 20 1440 50V100H0V50Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-white py-16 md:py-24 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#eef5f3]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0c9c8f]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Key Points Section */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative mb-16"
            data-testid="terms-key-points"
          >
            {/* Card */}
            <div className="relative bg-white rounded-3xl p-8 md:p-10 border-2 border-[#053433]/10 overflow-hidden group hover:border-[#0c9c8f]/30 hover:shadow-2xl hover:shadow-[#0c9c8f]/10 transition-all duration-500">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#053433] via-[#0c9c8f] to-[#053433] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #053433 0, #053433 1px, transparent 0, transparent 50%)`,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#053433] to-[#0c9c8f] flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-[#053433]">
                    Key Points
                  </h2>
                </div>

                <ul className="grid sm:grid-cols-2 gap-4">
                  {keyPoints.map((point, index) => {
                    const Icon = point.icon;
                    return (
                      <motion.li
                        key={point.text}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#eef5f3]/50 transition-colors duration-300 group/item bg-[#eef5f3]"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#eef5f3] flex items-center justify-center group-hover/item:bg-[#0c9c8f]/10 transition-colors duration-300">
                          <Icon className="w-4 h-4 text-[#0c9c8f]" />
                        </div>
                        <span className="text-sm text-[#053433]/70 group-hover/item:text-[#053433] transition-colors duration-300 pt-1">
                          {point.text}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Detailed Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.t}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  custom={index}
                  className="group"
                >
                  <div className="relative bg-[#eef5f3] rounded-2xl p-6 md:p-8 border border-[#053433]/10 transition-all duration-500 hover:border-[#053433]/20 hover:shadow-xl hover:shadow-[#053433]/5 hover:-translate-y-1">
                    {/* Section number badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-[#053433] text-white flex items-center justify-center text-xs font-bold shadow-lg group-hover:bg-[#0c9c8f] transition-colors duration-300">
                      {index + 1}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eef5f3] to-[#eef5f3]/50 flex items-center justify-center group-hover:from-[#053433] group-hover:to-[#0c9c8f] transition-all duration-500">
                          <Icon className="w-5 h-5 text-[#053433] group-hover:text-white transition-colors duration-500" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <h3 className="font-heading text-lg font-bold text-[#053433] mb-2 group-hover:text-[#0c9c8f] transition-colors duration-300">
                          {section.t}
                        </h3>
                        <p className="text-sm text-[#053433]/60 leading-relaxed group-hover:text-[#053433]/70 transition-colors duration-300">
                          {section.d}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="w-5 h-5 text-[#0c9c8f]" />
                      </div>
                    </div>

                    {/* Hover gradient line */}
                    <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#eef5f3] to-[#eef5f3]/50 rounded-2xl px-8 py-6 border border-[#053433]/10">
              <Scale className="w-6 h-6 text-[#0c9c8f]" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#053433]">
                  Questions about these terms?
                </p>
                <p className="text-sm text-[#053433]/60">
                  We're here to clarify — reach out anytime
                </p>
              </div>
              <a 
                href="mailto:genzomate@gmail.com"
                className="flex-shrink-0 group inline-flex items-center gap-2 bg-[#053433] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0c9c8f] transition-all duration-300 hover:shadow-lg hover:shadow-[#0c9c8f]/25"
              >
                Contact Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
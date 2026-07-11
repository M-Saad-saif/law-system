"use client"

import { motion } from "framer-motion";
import { fadeUp } from "@/components/ui/landing/motion";
import { 
  Shield, 
  Database, 
  Eye, 
  Clock, 
  UserCheck, 
  Lock, 
  FileText,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const blocks = [
  {
    t: "What data we collect",
    icon: Database,
    items: ["Account info (name, email, role)", "Case data you enter (FIR, sections, notes, documents)", "Basic usage logs for security and performance", "Billing / payment proof if you send it"],
  },
  {
    t: "How we use data",
    icon: Eye,
    items: ["To run features (cases, reminders, drafting, judgment tools)", "To provide support", "To secure and improve the Service", "To comply with legal requirements"],
  },
  {
    t: "Security summary",
    icon: Lock,
    items: ["HTTPS/TLS in transit", "Encryption at rest for stored data", "Password hashing (we can't read your password)", "Role-based access control", "Backups"],
  },
  {
    t: "Data retention",
    icon: Clock,
    items: ["After cancellation, data is typically retained up to 30 days for recovery/export, then deleted or anonymized (subject to backup rotation and legal requirements)."],
  },
  {
    t: "Your choices",
    icon: UserCheck,
    items: ["Request export or deletion by emailing genzomate@gmail.com"],
  },
];

export default function PrivacyPage() {
  return (
    <main data-testid="privacy-page" className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#eef5f3] pt-36 md:pt-44 pb-20 md:pb-24 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#053433]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0c9c8f]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#053433]/5 to-transparent rounded-full blur-3xl" />
          
          {/* Grid pattern overlay */}
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
            <Shield className="w-4 h-4 text-[#0c9c8f]" />
            <span className="text-sm font-medium text-[#053433]">Last updated: 08 July 2026</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-[#053433] tracking-tight mb-6"
            data-testid="privacy-page-heading"
          >
            Privacy{" "}
            <span className="relative inline-block">
              <span className="italic bg-gradient-to-r from-[#0c9c8f] to-[#053433] bg-clip-text text-transparent">
                Policy
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
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
          </motion.p>

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-md border border-[#053433]/10"
          >
            <div className="w-8 h-8 rounded-full bg-[#eef5f3] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#053433]" />
            </div>
            <span className="text-sm text-[#053433]/70">
              Contact:{" "}
              <a href="mailto:genzomate@gmail.com" className="font-semibold text-[#053433] hover:text-[#0c9c8f] transition-colors">
                genzomate@gmail.com
              </a>
            </span>
          </motion.div>
        </div>

        {/* Bottom wave */}
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {blocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <motion.div 
                key={block.t} 
                variants={fadeUp} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, margin: "-50px" }}
                custom={index}
                className="group relative bg "
                data-testid={`privacy-block-${block.t.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Card */}
                <div className="relative bg-[#eef5f3] rounded-3xl p-8 md:p-10 border border-[#053433]/10 transition-all duration-500 hover:border-[#053433]/20 hover:shadow-2xl hover:shadow-[#053433]/5 group-hover:-translate-y-1">
                  {/* Decorative gradient line */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#0c9c8f]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eef5f3] to-[#eef5f3]/50 flex items-center justify-center group-hover:from-[#053433] group-hover:to-[#0c9c8f] transition-all duration-500">
                          <Icon className="w-6 h-6 text-[#053433] group-hover:text-white transition-colors duration-500" />
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-[#0c9c8f]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <h2 className="font-heading text-xl md:text-2xl font-bold text-[#053433] group-hover:text-[#0c9c8f] transition-colors duration-300">
                        {block.t}
                      </h2>
                      {/* Step indicator */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-medium text-[#053433]/40">
                          Section {String(index + 1).padStart(2, '0')}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[#053433]/40" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <ul className="space-y-3 pl-16">
                    {block.items.map((item, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-3 text-sm md:text-base text-[#053433]/70 group-hover:text-[#053433]/80 transition-colors duration-300"
                      >
                        <span className="flex-shrink-0 mt-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0c9c8f]" />
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Bottom decorative element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#eef5f3]/50 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.div>
            );
          })}

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-[#eef5f3] to-[#eef5f3]/50 rounded-2xl px-8 py-6 border border-[#053433]/10">
              <Shield className="w-6 h-6 text-[#0c9c8f]" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#053433]">
                  Have questions about your privacy?
                </p>
                <p className="text-sm text-[#053433]/60">
                  We're here to help — reach out anytime
                </p>
              </div>
              <a 
                href="mailto:genzomate@gmail.com"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-[#053433] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0c9c8f] transition-all duration-300 hover:shadow-lg hover:shadow-[#0c9c8f]/25"
              >
                Contact Us
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
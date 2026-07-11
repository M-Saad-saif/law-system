import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { fadeUp, stagger } from "./motion";

export const plans = [
  {
    name: "Starter",
    tag: "Solo",
    price: "Rs 2,500",
    period: "/month",
    desc: "For individual advocates.",
    features: [
      "My Cases",
      "Hearing reminders",
      "Draft generator",
      "Judgment search (basic)",
      "Legal updates",
    ],
    cta: "Start Free Trial",
    href:"/register",
    highlighted: false,
  },
  {
    name: "Chamber",
    tag: "Team",
    price: "Rs 7,500",
    period: "/month",
    desc: "For chambers with associates.",
    features: [
      "Everything in Starter",
      "Multi-user roles & permissions",
      "Judgment library & favourites",
      "Cross-exam review workflow",
    ],
    cta: "Start Free Trial",
    href:"/register",
    highlighted: true,
  },
  {
    name: "Lifetime",
    tag: "One-time",
    price: "One-Time",
    period: "",
    desc: "Pay once. Use forever.",
    features: [
      "Everything in Chamber",
      "Priority onboarding support",
      "All future updates",
    ],
    cta: "Contact to Purchase",
    href:"/register",
    highlighted: false,
  },
];

export function PlanCard({ p, mini = false }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className={`rounded-3xl flex flex-col ${mini ? "p-7" : "p-8"} ${
        p.highlighted
          ? "bg-[#053433] text-white shadow-2xl shadow-[#053433]/25 relative overflow-hidden noise-overlay"
          : "bg-white border border-[#053433]/8 shadow-xl shadow-[#0f7e75]/5"
      }`}
      data-testid={`plan-card-${p.name.toLowerCase()}`}
    >
      {p.highlighted && (
        <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-wider text-[#053433] bg-[#8fe3d8] rounded-full px-3 py-1">
          Popular
        </span>
      )}
      <span
        className={`text-[10px] font-bold uppercase tracking-wider w-fit rounded-full px-3 py-1 mb-4 ${p.highlighted ? "bg-white/10 text-[#8fe3d8]" : "bg-[#eef5f3] text-[#0f7e75]"}`}
      >
        {p.tag}
      </span>
      <h3
        className={`font-heading text-2xl font-bold ${p.highlighted ? "text-white" : "text-[#053433]"}`}
      >
        {p.name}
      </h3>
      <p
        className={`text-sm mt-1 mb-5 ${p.highlighted ? "text-white/60" : "text-[#053433]/50"}`}
      >
        {p.desc}
      </p>
      <div className="mb-6">
        <span
          className={`font-heading text-3xl md:text-4xl font-bold ${p.highlighted ? "text-white" : "text-[#053433]"}`}
        >
          {p.price}
        </span>
        <span
          className={`text-sm ${p.highlighted ? "text-white/60" : "text-[#053433]/50"}`}
        >
          {p.period}
        </span>
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {p.features.map((f) => (
          <li
            key={f}
            className={`flex items-center gap-2.5 text-sm ${p.highlighted ? "text-white/85" : "text-[#053433]/70"}`}
          >
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${p.highlighted ? "bg-[#0c9c8f]" : "bg-[#eef5f3]"}`}
            >
              <Check
                size={11}
                className={p.highlighted ? "text-white" : "text-[#0f7e75]"}
              />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={p.href}>
      <button
        data-testid={`plan-cta-${p.name.toLowerCase()}`}
        className={`btn-glow w-full py-3.5 rounded-full font-semibold text-sm ${
          p.highlighted
          ? "bg-gradient-to-r from-[#0f7e75] to-[#0c9c8f] text-white"
          : "bg-[#053433] text-white hover:bg-[#0f7e75]"
          } transition-colors duration-300`}
          >
        {p.cta}
      </button>
        </Link>
    </motion.div>
  );
}

export default function PricingTeaser() {
  return (
    <section
      className="bg-white py-24 md:py-28"
      data-testid="pricing-teaser-section"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0f7e75] mb-4">
            Pricing
          </p>
          <h2
            className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight"
            data-testid="pricing-teaser-heading"
          >
            Simple plans for{" "}
            <span className="italic gradient-text">every chamber.</span>
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
            <PlanCard key={p.name} p={p} mini />
          ))}
        </motion.div>
        <div className="text-center mt-10">
          <Link
            href="/pricing"
            data-testid="view-pricing-btn"
            className="inline-block px-8 py-3.5 bg-[#eef5f3] text-[#0f7e75] font-semibold rounded-full hover:bg-[#0f7e75] hover:text-white transition-all duration-300"
          >
            View Full Pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}

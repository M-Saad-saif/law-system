"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LOGO_HORIZONTAL } from "./motion";

const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  // { label: "Pricing", to: "/pricing" },
  { label: "FAQs", to: "/faqs" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 md:top-5 inset-x-0 z-50 px-3 sm:px-6"
      data-testid="main-navbar"
    >
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl border border-[#053433]/8 rounded-full shadow-[0_8px_40px_-12px_rgba(5,52,51,0.25)] px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center shrink-0"
            data-testid="navbar-logo"
          >
            <img
              src={LOGO_HORIZONTAL}
              alt="Legal Portal — Your Digital Chamber"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>

          <nav
            className="hidden lg:flex items-center gap-0.5"
            data-testid="navbar-links"
          >
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                className={`px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  pathname === l.to
                    ? "text-[#0f7e75] bg-[#eef5f3]"
                    : "text-[#053433]/70 hover:text-[#053433] hover:bg-[#eef5f3]/70"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <Link href="/login">
              <button
                data-testid="navbar-signin-btn"
                className="px-5 py-2.5 text-sm font-semibold text-[#053433] rounded-full border border-[#053433]/15 hover:bg-[#eef5f3] transition-all duration-300"
              >
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button
                data-testid="navbar-trial-btn"
                className="btn-glow px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0f7e75] to-[#0c9c8f] rounded-full whitespace-nowrap"
              >
                Start Free Trial
              </button>
            </Link>
          </div>

          <button
            className="lg:hidden text-[#053433] p-2"
            onClick={() => setOpen(!open)}
            data-testid="navbar-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="lg:hidden max-w-6xl mx-auto mt-2 bg-white rounded-3xl shadow-xl border border-[#053433]/8 px-6 py-4"
          data-testid="navbar-mobile-menu"
        >
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.to}
              className="block py-3 text-[#053433] font-medium border-b border-gray-100 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link href="/login" className="flex-1">
              <button
                className="w-full py-3 text-sm font-semibold text-[#053433] rounded-full border border-[#053433]/15"
                data-testid="mobile-signin-btn"
              >
                Sign In
              </button>
            </Link>
            <Link href="/register" className="flex-1">
              <button
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#0f7e75] to-[#0c9c8f] rounded-full"
                data-testid="mobile-trial-btn"
              >
                Start Free Trial
              </button>
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}

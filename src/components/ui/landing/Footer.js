import Link from "next/link";
import { Mail } from "lucide-react";
import { LOGO_MONOGRAM } from "./motion";

const links = [
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "FAQs", to: "/faqs" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="bg-[#053433] pt-16 pb-8 noise-overlay relative" data-testid="main-footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 pb-12 border-b border-white/10">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <img src={LOGO_MONOGRAM} alt="Legal Portal" className="h-12 w-12 object-contain" />
              <div>
                <span className="font-heading text-xl font-bold text-white">Legal Portal</span>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#7fd6cc]">Your Digital Chamber</p>
              </div>
            </div>
            <a href="mailto:genzomate@gmail.com" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#8fe3d8] transition-colors" data-testid="footer-contact-email">
              <Mail size={14} /> genzomate@gmail.com
            </a>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3" data-testid="footer-links">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.to}
                data-testid={`footer-link-${l.label.toLowerCase()}`}
                className="text-sm text-white/60 hover:text-[#8fe3d8] transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">© 2026 Legal Portal. All rights reserved.</p>
          <p className="text-xs text-white/40">Built for Pakistan. Ready for international teams.</p>
        </div>
      </div>
    </footer>
  );
}

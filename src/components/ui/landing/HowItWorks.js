import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Users2,
  DatabaseBackup,
} from "lucide-react";
import { fadeUp, stagger } from "./motion";
const productTourVideo = "/videos/product-tour.mp4";
import CustomVideoPlayer from "./CustomVideoPlayer";

const steps = [
  { n: "01", t: "Add your cases", d: "Or start with just one case." },
  { n: "02", t: "Track hearings", d: "Get reminders before every date." },
  { n: "03", t: "Search & draft", d: "Judgments and applications, instantly." },
];

const security = [
  { icon: Lock, t: "Encryption in transit (HTTPS/TLS)" },
  { icon: DatabaseBackup, t: "Encryption at rest + backups" },
  { icon: KeyRound, t: "Passwords stored as hashed values" },
  { icon: Users2, t: "Role-based access control" },
];

export default function HowItWorks() {
  return (
    <>
      {/* How it works */}
      <section
        className="bg-white py-24 md:py-28"
        data-testid="how-it-works-section"
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
              How It Works
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight">
              Up and running in{" "}
              <span className="italic gradient-text">3 steps.</span>
            </h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {steps.map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                className="card-lift bg-[#eef5f3] rounded-3xl p-8 text-center"
                data-testid={`step-${s.n}`}
              >
                <span className="font-heading text-5xl font-bold gradient-text">
                  {s.n}
                </span>
                <h3 className="font-heading text-xl font-bold text-[#053433] mt-4 mb-2">
                  {s.t}
                </h3>
                <p className="text-sm text-[#053433]/60">{s.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product tour video */}
      <section
        className="bg-white pb-24 md:pb-28"
        data-testid="product-tour-section"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-video"
            data-testid="product-tour-video"
          >
            <CustomVideoPlayer
              src={productTourVideo}
              poster="/opengrapgImg.png"
            />
            <p className="sr-only">Product tour video</p>
          </motion.div>
        </div>
      </section>

      {/* Security */}
      <section
        className="bg-[#eef5f3] py-24 md:py-28"
        data-testid="security-section"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0f7e75] to-[#0c9c8f] items-center justify-center mb-6">
              <ShieldCheck size={22} className="text-white" />
            </span>
            <h2
              className="font-heading text-4xl md:text-5xl font-bold text-[#053433] tracking-tight mb-4"
              data-testid="security-heading"
            >
              Your data stays{" "}
              <span className="italic gradient-text">protected.</span>
            </h2>
            <Link
              href="/privacy"
              className="inline-block mt-4 px-6 py-3 bg-[#053433] text-white text-sm font-semibold rounded-full hover:bg-[#0f7e75] transition-colors duration-300"
              data-testid="security-privacy-btn"
            >
              Read Privacy & Security
            </Link>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {security.map(({ icon: Icon, t }) => (
              <motion.div
                key={t}
                variants={fadeUp}
                className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm"
              >
                <Icon size={18} className="text-[#0f7e75] shrink-0" />
                <span className="font-medium text-[#053433]">{t}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}

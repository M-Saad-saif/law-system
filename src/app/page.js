"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Scale,
  ArrowRight,
  CalendarCheck,
  FolderOpen,
  BookOpen,
  Bell,
  Shield,
  Users,
  TrendingUp,
  ChevronRight,
  Zap,
  Globe,
  Lock,
  Sparkles,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  UserCheck,
  StickyNote,
  Settings,
  Database,
  Cpu,
  Gavel,
  Upload,
  Search,
  CheckCircle2,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

function AnimatedCounter({ value, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function FloatingElement({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    casesCount: null,
    hearingsCount: null,
    firmsCount: null,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!isMounted) return;
        setIsLoggedIn(res.ok);
      } catch {
        if (!isMounted) return;
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const j = await res.json();
        if (!mounted) return;
        if (j?.success && j.data) {
          setStats({
            casesCount: j.data.casesCount || 0,
            hearingsCount: j.data.hearingsCount || 0,
            firmsCount: j.data.firmsCount || 0,
          });
        } else {
          setStats({ casesCount: 0, hearingsCount: 0, firmsCount: 0 });
        }
      } catch (err) {
        if (!mounted) return;
        setStats({ casesCount: 0, hearingsCount: 0, firmsCount: 0 });
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  const ctaHref = isLoggedIn ? "/dashboard" : "/register";
  const ctaLabel = isLoggedIn ? "Dashboard" : "Create account";

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-[#027f7e]/30">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(2,127,126,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(2,127,126,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Enhanced glow effects */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#103168]/20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#027f7e]/15 blur-[120px] pointer-events-none animate-pulse delay-1000" />
      <div className="absolute top-[40%] left-[50%] w-[50%] h-[50%] rounded-full bg-[#027f7e]/5 blur-[100px] pointer-events-none" />

      {/* Mouse-following gradient */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[#027f7e]/10 to-[#103168]/10 blur-[100px] pointer-events-none transition-transform duration-1000"
        style={{
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
        }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 inset-x-0 z-50 bg-[#000203]/60 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center shadow-lg shadow-[#027f7e]/30 group-hover:shadow-xl group-hover:shadow-[#027f7e]/40 transition-all"
            >
              <Scale className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-white">
              Law<span className="text-[#027f7e]">Portal</span>
            </span>
          </motion.div>

          {/* NEW: Section links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a
              href="#features"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Workflow
            </a>
            <a
              href="#tech"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Tech Stack
            </a>
            <a
              href="#cta"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Get Started
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors relative group"
            >
              Log in
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#027f7e] group-hover:w-full transition-all duration-300" />
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={ctaHref}
                className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-[#027f7e] to-[#03605e] text-white rounded-xl hover:shadow-lg hover:shadow-[#027f7e]/30 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">{ctaLabel}</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section (UNCHANGED) */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 lg:pt-40 lg:pb-24"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-[#027f7e]/10 border border-[#027f7e]/30 rounded-full px-4 py-1.5 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-[#027f7e] animate-pulse" />
              <span className="text-xs font-semibold text-[#027f7e] tracking-wider">
                AI-POWERED LEGAL MANAGEMENT
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Manage your law practice with{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#027f7e] via-[#33adad] to-[#027f7e] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  precision
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#027f7e] to-transparent rounded-full" />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-lg max-w-lg leading-relaxed"
            >
              Cases, hearings, proceedings, citations, PDF law books, reminders,
              an AI image generator and live courtroom Q&A — built specifically
              for Pakistani lawyers.
            </motion.p>

            {/* NEW: Quick stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { label: "Next.js 14", color: "#027f7e" },
                { label: "MongoDB", color: "#4a90e2" },
                { label: "JWT Secured", color: "#33adad" },
                { label: "AI-enabled", color: "#103168" },
              ].map((t, i) => (
                <span
                  key={i}
                  className="text-[11px] tracking-wider font-semibold px-3 py-1 rounded-full border backdrop-blur-sm"
                  style={{
                    color: t.color,
                    borderColor: `${t.color}55`,
                    backgroundColor: `${t.color}15`,
                  }}
                >
                  {t.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={ctaHref}
                  className="group px-8 py-4 bg-gradient-to-r from-[#027f7e] to-[#03605e] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#027f7e]/30 transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
                >
                  <span className="relative z-10">{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#038f8d] to-[#027f7e] translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#features"
                  className="group px-8 py-4 border-2 border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-white/5 hover:border-[#027f7e]/50 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                >
                  See features
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right content — UNCHANGED hero card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:ml-auto"
          >
            <FloatingElement delay={0}>
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-32 h-32 border-t-2 border-r-2 border-[#027f7e]/40 rounded-tr-3xl hidden lg:block" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 border-b-2 border-l-2 border-[#103168]/40 rounded-bl-3xl hidden lg:block" />

                <div className="relative z-10 bg-gradient-to-br from-[#11161F] to-[#0A0F1A] border border-gray-800/50 rounded-3xl p-8 shadow-2xl shadow-black/50 backdrop-blur-xl transform hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#027f7e] to-[#025a58] flex items-center justify-center shadow-lg shadow-[#027f7e]/30"
                    >
                      <CalendarCheck className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Today's Hearings
                      </p>
                      <p className="text-sm text-gray-400">
                        3 matters scheduled
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        title: "State v. Rahman",
                        time: "10:30 AM",
                        court: "Session Court",
                        type: "Criminal",
                        priority: "high",
                      },
                      {
                        title: "Khan Family Petition",
                        time: "11:45 AM",
                        court: "Family Court",
                        type: "Civil",
                        priority: "medium",
                      },
                      {
                        title: "Bail Application #234",
                        time: "2:00 PM",
                        court: "High Court",
                        type: "Criminal",
                        priority: "urgent",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-gray-800/50 hover:border-[#027f7e]/30 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white group-hover:text-[#027f7e] transition-colors">
                              {item.title}
                            </p>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                                item.priority === "urgent"
                                  ? "bg-red-500/20 text-red-400"
                                  : item.priority === "high"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.court} • {item.type}
                          </p>
                        </div>
                        <span className="text-xs text-[#027f7e] font-mono font-semibold bg-[#027f7e]/10 px-3 py-1 rounded-lg">
                          {item.time}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="absolute -bottom-6 -left-6 z-20 bg-gradient-to-br from-[#0D1220] to-[#080C15] border border-gray-800 rounded-2xl p-5 w-56 shadow-2xl shadow-black/50 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#103168]/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#4a90e2]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-300">
                        Active Cases
                      </span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter value={24} duration={2} />
                  </p>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">+5 this month</span>
                  </div>
                </motion.div>
              </div>
            </FloatingElement>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* EXPANDED FEATURES SECTION — every real codebase feature      */}
      {/* ============================================================ */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-6 py-32"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#103168]/20 border border-[#103168]/40 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 text-[#4a90e2] animate-pulse" />
            <span className="text-xs font-semibold text-[#4a90e2] tracking-wider">
              POWERFUL FEATURES
            </span>
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Built for modern legal practice
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to manage cases, track hearings, run live
            courtroom Q&A and stay organized.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: LayoutDashboard,
              title: "Dashboard & Analytics",
              desc: "Stats overview for total, active, today's and tomorrow's hearings, with a recent cases table and quick actions.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: FolderOpen,
              title: "Case Management",
              desc: "Full CRUD with case title, suit no., court type, provisions, counsel info, FIR number, judge name and hearing dates.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
            {
              icon: Layers,
              title: "Tabbed Case Detail",
              desc: "Overview, Proceedings timeline, Accused/Bail info, Citations and Quick Notes — all in one tabbed view.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: CalendarCheck,
              title: "Hearing Calendar",
              desc: "Monthly calendar with hearing & proceeding date highlights, day-click modal, and an upcoming events sidebar.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
            {
              icon: BookOpen,
              title: "Law Books Library",
              desc: "Upload PDF law books with drag & drop, inline iframe viewer, tagging, search and quick delete.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Priority-based reminders with upcoming, overdue and completed filters, linked directly to a case.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
            {
              icon: MessageSquare,
              title: "Live Courtroom Q&A",
              desc: "Real-time courtroom question & answer module to capture and resolve queries during proceedings.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: ImageIcon,
              title: "AI Image Generator",
              desc: "Generate visuals and case-related illustrations directly inside the portal, powered by AI.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
            {
              icon: Users,
              title: "Client Management",
              desc: "Store client name, contact, phone and case associations — all linked to the lawyer's account.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: Shield,
              title: "JWT Auth & Roles",
              desc: "JWT via httpOnly cookies with middleware-protected routes and admin / lawyer / associate roles.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
            {
              icon: Settings,
              title: "Profile & Settings",
              desc: "Manage profile, Bar Council number, phone and seed demo data with one click from settings.",
              gradient: "from-[#027f7e] to-[#025a58]",
              color: "#027f7e",
            },
            {
              icon: FileText,
              title: "Proceedings & Citations",
              desc: "Add or remove proceedings, citations, accused entries and notes against any case via dedicated APIs.",
              gradient: "from-[#103168] to-[#0d2855]",
              color: "#103168",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative bg-gradient-to-br from-[#11161F]/80 to-[#0A0F1A]/80 border border-gray-800/50 rounded-3xl p-8 hover:border-[#027f7e]/40 transition-all duration-500 backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#027f7e]/5 to-[#103168]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg transition-all duration-300`}
                  style={{ boxShadow: `0 10px 30px -10px ${feature.color}55` }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#027f7e] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* NEW: CASE DETAIL TABS SHOWCASE                                */}
      {/* ============================================================ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#027f7e]/10 border border-[#027f7e]/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Gavel className="w-4 h-4 text-[#027f7e]" />
            <span className="text-xs font-semibold text-[#027f7e] tracking-wider">
              CASE DETAIL VIEW
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Every detail, one tabbed interface
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Switch between Overview, Proceedings, Accused, Citations and Notes
            without ever leaving the case page.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: FolderOpen, label: "Overview", color: "#027f7e" },
            { icon: ClipboardList, label: "Proceedings", color: "#33adad" },
            { icon: UserCheck, label: "Accused / Bail", color: "#4a90e2" },
            { icon: FileText, label: "Citations", color: "#103168" },
            { icon: StickyNote, label: "Quick Notes", color: "#027f7e" },
          ].map((tab, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-gradient-to-br from-[#11161F]/80 to-[#0A0F1A]/80 border border-gray-800/50 rounded-2xl p-6 hover:border-[#027f7e]/40 transition-all duration-300 backdrop-blur-sm text-center"
            >
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border"
                style={{
                  backgroundColor: `${tab.color}20`,
                  borderColor: `${tab.color}40`,
                }}
              >
                <tab.icon className="w-7 h-7" style={{ color: tab.color }} />
              </div>
              <p className="text-sm font-semibold text-white">{tab.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* NEW: WORKFLOW / HOW IT WORKS                                  */}
      {/* ============================================================ */}
      <section
        id="workflow"
        className="relative z-10 max-w-7xl mx-auto px-6 py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#103168]/20 border border-[#103168]/40 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-[#4a90e2]" />
            <span className="text-xs font-semibold text-[#4a90e2] tracking-wider">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            From registration to verdict in 4 steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#027f7e]/40 to-transparent" />

          {[
            {
              icon: UserPlus,
              step: "01",
              title: "Register",
              desc: "Create your lawyer account and add your Bar Council details.",
            },
            {
              icon: FolderOpen,
              step: "02",
              title: "Add Cases",
              desc: "Enter case details, provisions, counsel and hearing dates.",
            },
            {
              icon: CalendarCheck,
              step: "03",
              title: "Track Hearings",
              desc: "Use the calendar and reminders to stay ahead of every date.",
            },
            {
              icon: CheckCircle2,
              step: "04",
              title: "Manage & Win",
              desc: "Log proceedings, citations and notes from one dashboard.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-gradient-to-br from-[#11161F]/80 to-[#0A0F1A]/80 border border-gray-800/50 rounded-3xl p-6 backdrop-blur-sm text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center shadow-lg shadow-[#027f7e]/30 relative z-10">
                <s.icon className="w-9 h-9 text-white" />
              </div>
              <p className="text-xs font-mono font-semibold text-[#027f7e] mb-2">
                STEP {s.step}
              </p>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* NEW: TECH STACK                                               */}
      {/* ============================================================ */}
      <section id="tech" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#027f7e]/10 border border-[#027f7e]/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <Cpu className="w-4 h-4 text-[#027f7e]" />
            <span className="text-xs font-semibold text-[#027f7e] tracking-wider">
              TECH STACK
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Production-ready foundation
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Built with battle-tested tools loved by modern web teams.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: Cpu, label: "Next.js 14", sub: "App Router" },
            { icon: Database, label: "MongoDB", sub: "via Mongoose" },
            { icon: Shield, label: "JWT + bcrypt", sub: "httpOnly cookies" },
            { icon: Sparkles, label: "Tailwind CSS", sub: "Utility-first" },
            { icon: BookOpen, label: "Playfair + DM Sans", sub: "Typography" },
            { icon: Bell, label: "react-hot-toast", sub: "Notifications" },
            { icon: Upload, label: "FormData + fs", sub: "PDF uploads" },
            { icon: CalendarCheck, label: "date-fns", sub: "Date utils" },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-gradient-to-br from-[#11161F]/80 to-[#0A0F1A]/80 border border-gray-800/50 rounded-2xl p-5 hover:border-[#027f7e]/40 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027f7e]/20 to-[#103168]/20 border border-[#027f7e]/20 flex items-center justify-center mb-3">
                <t.icon className="w-5 h-5 text-[#027f7e]" />
              </div>
              <p className="text-sm font-bold text-white">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section (UNCHANGED) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-16"
      >
        <div className="relative bg-gradient-to-r from-[#103168]/20 via-[#027f7e]/10 to-transparent border border-gray-800/50 rounded-3xl p-12 md:p-16 overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#027f7e]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#103168]/10 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
            {[
              {
                value: stats.casesCount,
                label: "Cases Managed",
                icon: FolderOpen,
              },
              {
                value: stats.hearingsCount,
                label: "Hearings Tracked",
                icon: CalendarCheck,
              },
              { value: stats.firmsCount, label: "Law Firms", icon: Shield },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#027f7e]/20 to-[#103168]/20 flex items-center justify-center border border-[#027f7e]/20">
                  <stat.icon className="w-8 h-8 text-[#027f7e]" />
                </div>
                <p className="text-5xl font-bold text-white mb-2">
                  {statsLoading ? (
                    <span className="animate-pulse">—</span>
                  ) : (
                    <AnimatedCounter value={stat.value ?? 0} duration={2.5} />
                  )}
                  <span className="text-[#027f7e]">+</span>
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section (UNCHANGED) */}
      <motion.section
        id="cta"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0F1A] via-[#080C15] to-[#05080F] border border-gray-800/50 p-12 md:p-20 text-center backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-96 h-96 bg-[#027f7e]/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-[#103168]/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#027f7e]/10 border border-[#027f7e]/30 rounded-full px-4 py-1.5 mb-6"
            >
              <Globe className="w-4 h-4 text-[#027f7e]" />
              <span className="text-xs font-semibold text-[#027f7e]">
                JOIN THE COMMUNITY
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to streamline{" "}
              <span className="bg-gradient-to-r from-[#027f7e] to-[#33adad] bg-clip-text text-transparent">
                your practice
              </span>
              ?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
              Join dozens of law firms already using LawPortal to manage cases
              and hearings efficiently.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={ctaHref}
                  className="group px-10 py-4 bg-gradient-to-r from-[#027f7e] to-[#03605e] text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#027f7e]/30 transition-all duration-300 flex items-center gap-2 relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#038f8d] to-[#027f7e] translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="px-10 py-4 border-2 border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-white/5 hover:border-[#027f7e]/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Sign in
                </Link>
              </motion.div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>No credit card required • Free trial available</span>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center shadow-lg shadow-[#027f7e]/20"
                >
                  <Scale className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-white">
                  Law<span className="text-[#027f7e]">Portal</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 max-w-xs">
                Complete legal practice management platform for Pakistani
                lawyers. Built with Next.js 14, MongoDB, and JWT authentication.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: "JWT Secured", icon: Shield },
                  { label: "SSL Encrypted", icon: Lock },
                  { label: "GDPR Ready", icon: Globe },
                ].map((badge, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium text-gray-500 flex items-center gap-1 bg-white/5 rounded-full px-3 py-1 border border-gray-800"
                  >
                    <badge.icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Features column */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Core Features
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Case Management", path: "/cases" },
                  { label: "Hearing Calendar", path: "/hearings" },
                  { label: "Law Books Library", path: "/law-books" },
                  { label: "Smart Reminders", path: "/reminders" },
                  { label: "Client Management", path: "/clients" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-sm text-gray-500 hover:text-[#027f7e] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Advanced features column */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Advanced Tools
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: "Live Court Q&A", path: "/court-qa" },
                  { label: "AI Image Generator", path: "/image-generator" },
                  { label: "Proceedings Timeline", path: "/cases" },
                  { label: "Citations Manager", path: "/cases" },
                  { label: "Quick Notes", path: "/cases" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-sm text-gray-500 hover:text-[#027f7e] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Account column */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Register", path: "/register" },
                  { label: "Login", path: "/login" },
                  { label: "Dashboard", path: "/dashboard" },
                  { label: "Profile Settings", path: "/profile" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="block text-sm text-gray-500 hover:text-[#027f7e] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-800/50">
                  <Link
                    href="#"
                    className="block text-sm text-gray-500 hover:text-[#027f7e] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    className="block text-sm text-gray-500 hover:text-[#027f7e] transition-colors mt-2"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-500">
                  © {new Date().getFullYear()} LawPortal — Legal Management
                  Platform
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  All systems operational
                </span>
                <span>•</span>
                <span>Made for Pakistani Lawyers</span>
                <span>•</span>
                <a href="#" className="hover:text-gray-400 transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center shadow-lg shadow-[#027f7e]/20 hover:shadow-xl hover:shadow-[#027f7e]/30 transition-all duration-300 group"
      >
        <ArrowRight className="w-5 h-5 text-white rotate-[-90deg] group-hover:-translate-y-1 transition-transform" />
      </motion.button>

      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

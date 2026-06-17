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
  Star,
  TrendingUp,
  ChevronRight,
  Zap,
  Globe,
  Lock,
  Sparkles,
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

      {/* Hero Section */}
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
              Case management, hearing calendar, law books library, and
              reminders — built specifically for Pakistani lawyers.
            </motion.p>

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

          {/* Right content - Enhanced */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:ml-auto"
          >
            <FloatingElement delay={0}>
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 border-t-2 border-r-2 border-[#027f7e]/40 rounded-tr-3xl hidden lg:block" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 border-b-2 border-l-2 border-[#103168]/40 rounded-bl-3xl hidden lg:block" />

                {/* Main card */}
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

                {/* Floating smaller card */}
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

      {/* Features Section */}
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
            Everything you need to manage cases, track hearings, and stay
            organized.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FolderOpen,
              title: "Case Management",
              desc: "Full CRUD with case details, provisions, counsel info, FIR number, and hearing dates.",
              color: "#027f7e",
              gradient: "from-[#027f7e] to-[#025a58]",
            },
            {
              icon: CalendarCheck,
              title: "Hearing Calendar",
              desc: "Monthly calendar view with hearing/proceeding dates, day-click modal, and upcoming events.",
              color: "#103168",
              gradient: "from-[#103168] to-[#0d2855]",
            },
            {
              icon: BookOpen,
              title: "Law Books Library",
              desc: "Upload and manage PDF law books with inline viewer and search.",
              color: "#027f7e",
              gradient: "from-[#027f7e] to-[#025a58]",
            },
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Priority-based reminders with upcoming, overdue, and completed filters.",
              color: "#103168",
              gradient: "from-[#103168] to-[#0d2855]",
            },
            {
              icon: Users,
              title: "Client Management",
              desc: "Store client details, communication history, and case associations.",
              color: "#027f7e",
              gradient: "from-[#027f7e] to-[#025a58]",
            },
            {
              icon: Shield,
              title: "Secure & Role-based",
              desc: "JWT authentication with httpOnly cookies and middleware-protected routes.",
              color: "#103168",
              gradient: "from-[#103168] to-[#0d2855]",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative bg-gradient-to-br from-[#11161F]/80 to-[#0A0F1A]/80 border border-gray-800/50 rounded-3xl p-8 hover:border-[#027f7e]/40 transition-all duration-500 backdrop-blur-sm"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#027f7e]/5 to-[#103168]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg shadow-${feature.color}/20 group-hover:shadow-xl group-hover:shadow-${feature.color}/30 transition-all duration-300`}
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

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-16"
      >
        <div className="relative bg-gradient-to-r from-[#103168]/20 via-[#027f7e]/10 to-transparent border border-gray-800/50 rounded-3xl p-12 md:p-16 overflow-hidden backdrop-blur-sm">
          {/* Decorative elements */}
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

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0F1A] via-[#080C15] to-[#05080F] border border-gray-800/50 p-12 md:p-20 text-center backdrop-blur-sm">
          {/* Animated background */}
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
      <footer className="relative z-10 border-t border-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#027f7e] to-[#103168] flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-500">
                © 2026 LawPortal — Legal Management Platform
              </span>
            </div>
            {/* <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Contact
              </a>
            </div> */}
          </div>
        </div>
      </footer>

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
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scale } from "lucide-react";
import {
  subscribeLogoutOverlay,
  getLogoutOverlaySnapshot,
  resolveLogoutOverlay,
} from "@/lib/logoutOverlayStore";

const MESSAGES = [
  "Securing your session...",
  "Signing you out...",
  "See you again soon...",
];

const TOTAL_MS = 3000; 
const EXIT_START_MS = TOTAL_MS - 280;
const MESSAGE_INTERVAL = TOTAL_MS / MESSAGES.length;

export default function LogoutOverlay() {
  const { visible, requestId } = useSyncExternalStore(
    subscribeLogoutOverlay,
    getLogoutOverlaySnapshot,
    () => ({ visible: false, requestId: 0 }),
  );

  const [messageIndex, setMessageIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      setExiting(false);
      return;
    }

    const timers = [];
    MESSAGES.forEach((_, i) => {
      if (i === 0) return;
      timers.push(
        setTimeout(() => setMessageIndex(i), MESSAGE_INTERVAL * i),
      );
    });
    timers.push(setTimeout(() => setExiting(true), EXIT_START_MS));
    timers.push(setTimeout(() => resolveLogoutOverlay(), TOTAL_MS));

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, requestId]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="logout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: exiting ? 0.28 : 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            pointerEvents: "auto",
            background:
              "linear-gradient(160deg, #0b0e1a 0%, #141726 55%, #0b0e1a 100%)",
          }}
          role="alert"
          aria-live="assertive"
        >
         
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-20%",
              left: "-10%",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "rgba(2, 127, 126, 0.18)",
              filter: "blur(100px)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-10%",
              width: "55%",
              height: "55%",
              borderRadius: "50%",
              background: "rgba(16, 49, 104, 0.22)",
              filter: "blur(100px)",
            }}
          />
          <div className="grain-overlay" />

          <div className="relative z-10 flex flex-col items-center gap-7 px-6 text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-2xl bg-teal-500/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-2xl border border-teal-400/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-14 h-14 rounded-2xl bg-[#026665] flex items-center justify-center shadow-lg shadow-black/30"
              >
                <Scale className="w-7 h-7 text-white" />
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2 min-h-[3.5rem]">
              <p
                className="text-white text-lg font-semibold tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                LawPortal
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-300 text-sm"
                >
                  {MESSAGES[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-primary-400 to-teal-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

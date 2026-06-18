"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Scale } from "lucide-react";
import { useRouteTransition } from "@/hooks/useRouteTransition";
import { Skeleton } from "@/components/ui";

export default function RouteLoaderOverlay() {
  const { isLoading } = useRouteTransition();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-white/75 backdrop-blur-md"
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-teal-400 to-primary-500 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 0.35, 0.68, 0.92] }}
            transition={{
              duration: 1.8,
              times: [0, 0.3, 0.65, 1],
              ease: "easeOut",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <span className="absolute inset-0 rounded-2xl border-2 border-teal-400/40 animate-ping" />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-12 h-12 rounded-2xl bg-[#026665] flex items-center justify-center shadow-lg shadow-teal-900/15"
              >
                <Scale className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-2.5 w-32" />
              <Skeleton className="h-2 w-20" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

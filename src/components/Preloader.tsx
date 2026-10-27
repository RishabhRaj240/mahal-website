"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete: () => void;
  videoLoaded: boolean;
  loadProgress: number; // 0 to 100
}

export default function Preloader({ onComplete, videoLoaded, loadProgress }: PreloaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = videoLoaded ? 100 : Math.max(prev, Math.min(loadProgress, 94));
        if (prev < target) {
          const step = Math.max(1, Math.round((target - prev) * 0.2));
          return Math.min(prev + step, 100);
        }
        return prev;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [videoLoaded, loadProgress]);

  // Safety fallback for mobile or throttled networks: ensure preloader completes smoothly
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setDisplayProgress(100);
    }, 2400);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timeout = setTimeout(() => {
        setIsReadyToEnter(true);
        setTimeout(() => {
          setHasExited(true);
          onComplete();
        }, 800);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [displayProgress, onComplete]);

  return (
    <AnimatePresence>
      {!hasExited && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: "-100%",
            transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#060608] px-6 py-12 text-[#F9F8F5] select-none"
        >
          {/* Top metadata bar */}
          <div className="w-full max-w-6xl flex justify-between items-center text-[10px] uppercase font-sans tracking-[0.3em] text-[#A3A199]/70 border-b border-white/[0.06] pb-4">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              ARCHITECTURAL ARCHIVE
            </span>
            <span className="tracking-[0.4em]">LAT 27° 10&apos; 30&quot; N</span>
            <span>EDITION MMXXVI</span>
          </div>

          {/* Central Monogram & Sacred Geometry */}
          <div className="flex flex-col items-center justify-center text-center max-w-lg my-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative mb-8"
            >
              {/* Rotating golden geometric rings */}
              <svg className="w-28 h-28 mx-auto" viewBox="0 0 120 120" fill="none">
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  stroke="rgba(212, 175, 55, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="44"
                  stroke="rgba(249, 248, 245, 0.15)"
                  strokeWidth="0.75"
                />
                {/* Royal Mughal Arch Monogram */}
                <path
                  d="M40 78V48C40 37 49 28 60 28C71 28 80 37 80 48V78"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M50 78V54C50 48.5 54.5 44 60 44C65.5 44 70 48.5 70 54V78"
                  stroke="rgba(249, 248, 245, 0.6)"
                  strokeWidth="1"
                />
                <line x1="34" y1="78" x2="86" y2="78" stroke="#D4AF37" strokeWidth="1.5" />
                <circle cx="60" cy="22" r="2.5" fill="#D4AF37" />
              </svg>
            </motion.div>

            {/* Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-cinzel text-3xl sm:text-4xl tracking-[0.35em] text-[#F9F8F5] uppercase mb-3 font-medium"
            >
              MAHAL
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-serif italic text-lg sm:text-xl text-[#EFE7DA]/80 tracking-widest font-light mb-8"
            >
              The Palace at the Edge of Sky
            </motion.p>

            {/* Progress counter */}
            <div className="flex flex-col items-center">
              <div className="font-sans text-xs tracking-[0.4em] text-[#D4AF37] mb-2 font-mono">
                {String(displayProgress).padStart(3, "0")}%
              </div>
              {/* Ultra-thin luxury gold bar */}
              <div className="w-48 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#FFF6E0]"
                  style={{ width: `${displayProgress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom subtle message */}
          <div className="w-full max-w-6xl flex justify-between items-center text-[10px] uppercase font-sans tracking-[0.25em] text-[#A3A199]/60 border-t border-white/[0.06] pt-4">
            <span>SCROLL TO TRAVERSE TIME & SPACE</span>
            <span>{isReadyToEnter ? "ENTER THE SANCTUARY" : "PRELOADING 80-SECOND CINEMA"}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

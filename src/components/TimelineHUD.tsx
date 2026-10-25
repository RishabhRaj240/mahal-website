"use client";

import React from "react";
import { MILESTONES } from "@/types";

interface TimelineHUDProps {
  progress: number;
  currentTime: number;
  duration: number;
  onJumpToProgress: (progress: number) => void;
}

export default function TimelineHUD({
  progress,
  currentTime,
  duration,
  onJumpToProgress,
}: TimelineHUDProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-4 select-none">
      {/* Timecode badge */}
      <div className="glass-pill px-2.5 py-1 text-[9px] font-mono text-[#D4AF37] tracking-widest whitespace-nowrap border border-white/[0.08]">
        {formatTime(currentTime)}
      </div>

      {/* Vertical scrub track */}
      <div className="relative w-1 h-64 bg-white/10 rounded-full overflow-hidden flex flex-col justify-end">
        {/* Filled gold progress */}
        <div
          className="w-full bg-gradient-to-t from-[#AA820A] via-[#D4AF37] to-[#FFF6E0] rounded-full transition-all duration-75"
          style={{ height: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>

      {/* Milestone markers */}
      <div className="flex flex-col gap-2">
        {MILESTONES.map((m) => {
          const isPassed = progress >= m.range[0];
          const isCurrent = progress >= m.range[0] && progress < m.range[1];

          return (
            <button
              key={m.id}
              onClick={() => onJumpToProgress(m.range[0])}
              title={`${m.roman}: ${m.title}`}
              className="group relative flex items-center justify-center cursor-pointer p-1"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? "w-3 h-3 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] scale-125"
                    : isPassed
                    ? "bg-[#D4AF37]/60"
                    : "bg-white/20 group-hover:bg-white/60"
                }`}
              />

              {/* Tooltip on hover */}
              <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-3 py-1 rounded-md glass-panel whitespace-nowrap text-[10px] font-cinzel text-[#F9F8F5] tracking-wider border border-white/10 shadow-xl">
                <span className="text-[#D4AF37] font-bold mr-1.5">{m.roman}</span>
                {m.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Total duration label */}
      <div className="text-[8px] font-mono tracking-widest text-[#A3A199]/60">
        {formatTime(duration)}
      </div>
    </div>
  );
}

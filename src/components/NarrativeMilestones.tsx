"use client";

import React, { useMemo } from "react";
import { MILESTONES, Milestone } from "@/types";
import { ChevronDown, Compass, Sparkles } from "lucide-react";

interface NarrativeMilestonesProps {
  progress: number; // 0 to 1
  onRequestViewing: () => void;
  onExploreClick: () => void;
}

export default function NarrativeMilestones({
  progress,
  onRequestViewing,
  onExploreClick,
}: NarrativeMilestonesProps) {
  // Calculate visibility factor (0 to 1) and blur for each milestone
  const milestonesWithState = useMemo(() => {
    return MILESTONES.map((m) => {
      const [start, end] = m.range;
      const duration = end - start;
      const fadeDuration = duration * 0.22; // 22% of chapter duration for transition

      let opacity = 0;
      let blur = 12;
      let translateY = 24;
      let letterSpacing = "0.22em";
      let isActive = false;

      if (progress >= start && progress <= end) {
        isActive = true;
        const progressInChapter = progress - start;

        if (progressInChapter < fadeDuration) {
          // Entering
          const factor = progressInChapter / fadeDuration;
          opacity = factor;
          blur = (1 - factor) * 12;
          translateY = (1 - factor) * 20;
          letterSpacing = `${0.28 - factor * 0.12}em`;
        } else if (progressInChapter > duration - fadeDuration) {
          // Exiting
          const factor = (end - progress) / fadeDuration;
          opacity = factor;
          blur = (1 - factor) * 12;
          translateY = (1 - factor) * -16;
          letterSpacing = `${0.16 + (1 - factor) * 0.1}em`;
        } else {
          // Fully active plateau
          opacity = 1;
          blur = 0;
          translateY = 0;
          letterSpacing = "0.16em";
        }
      }

      return {
        ...m,
        opacity,
        blur,
        translateY,
        letterSpacing,
        isActive,
      };
    });
  }, [progress]);

  const activeMilestone = milestonesWithState.find((m) => m.isActive) || milestonesWithState[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-12 md:p-16">
      {/* Top telemetry HUD (subtle luxury data overlay) */}
      <div className="flex justify-between items-start text-[10px] tracking-[0.25em] text-[#EFE7DA]/60 uppercase font-sans">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="font-mono text-[#D4AF37]">{activeMilestone.coordinates}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>{activeMilestone.elevation}</span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-[#F9F8F5]/70">
            PROG: {(progress * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Kinetic Typography Stages */}
      <div className="relative w-full max-w-5xl mx-auto my-auto flex flex-col items-center text-center">
        {milestonesWithState.map((m) => {
          if (m.opacity <= 0.01) return null;

          return (
            <div
              key={m.id}
              style={{
                opacity: m.opacity,
                filter: `blur(${m.blur}px)`,
                transform: `translateY(${m.translateY}px)`,
                transition: "filter 0.15s ease-out, transform 0.15s ease-out",
              }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Roman numeral / Chapter Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill mb-4 border border-white/[0.08]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="font-cinzel text-[11px] tracking-[0.3em] text-[#D4AF37]">
                  {m.tagline}
                </span>
              </div>

              {/* Massive Luxury Serif Headline */}
              <h2
                style={{ letterSpacing: m.letterSpacing }}
                className="font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold uppercase text-[#F9F8F5] mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
              >
                {m.title}
              </h2>

              {/* Poetic Subtitle */}
              <p className="font-serif italic text-lg sm:text-2xl md:text-3xl text-[#EFE7DA] font-light max-w-2xl mb-6 drop-shadow-md">
                &ldquo;{m.subtitle}&rdquo;
              </p>

              {/* Descriptive Paragraph (visible on medium+ screens) */}
              <p className="hidden md:block font-sans text-sm md:text-base text-[#A3A199] max-w-xl font-light leading-relaxed mb-8">
                {m.description}
              </p>

              {/* Architectural Spec Badges */}
              <div className="hidden sm:flex items-center gap-6 md:gap-10 pt-2 border-t border-white/[0.08]">
                {m.specs.map((spec, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <span className="text-[9px] font-sans tracking-[0.25em] text-[#A3A199]/70 uppercase">
                      {spec.label}
                    </span>
                    <span className="font-cinzel text-xs md:text-sm text-[#F9F8F5] tracking-wider mt-0.5 font-medium">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Primary Call to Action on Final Chapter (Night Reveal) */}
              {m.id === 8 && (
                <div className="mt-8 pointer-events-auto">
                  <button
                    onClick={onRequestViewing}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F7D070] text-[#060608] font-cinzel font-bold text-xs sm:text-sm tracking-[0.25em] uppercase shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:shadow-[0_0_55px_rgba(212,175,55,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <span>REQUEST A PRIVATE RESIDENCE VIEWING</span>
                    <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Milestone Footer Indicators */}
      <div className="flex justify-between items-end">
        {/* Left: Chapter name & Roman identifier */}
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xl sm:text-2xl text-[#D4AF37] font-semibold">
            {activeMilestone.roman}
          </span>
          <div className="h-6 w-[1px] bg-white/20" />
          <div className="flex flex-col">
            <span className="text-[9px] font-sans tracking-[0.25em] text-[#A3A199] uppercase">
              CURRENT ODYSSEY
            </span>
            <span className="font-cinzel text-xs text-[#F9F8F5] tracking-widest uppercase">
              {activeMilestone.title}
            </span>
          </div>
        </div>

        {/* Center: Scroll cue on Milestone 1 */}
        {progress < 0.08 && (
          <button
            onClick={onExploreClick}
            className="pointer-events-auto flex flex-col items-center gap-2 group cursor-pointer"
          >
            <span className="text-[10px] font-sans tracking-[0.3em] text-[#EFE7DA]/80 uppercase transition-colors group-hover:text-[#D4AF37]">
              SCROLL TO FLY THROUGH THE PALACE
            </span>
            <ChevronDown className="w-4 h-4 text-[#D4AF37] animate-bounce" />
          </button>
        )}

        {/* Right: Ambient sound & cinema status */}
        <div className="text-right">
          <span className="text-[9px] font-sans tracking-[0.25em] text-[#A3A199] uppercase block">
            CINEMATIC DURATION
          </span>
          <span className="font-mono text-xs text-[#D4AF37] tracking-wider">
            68.00s // 4K 60FPS MASTER
          </span>
        </div>
      </div>
    </div>
  );
}

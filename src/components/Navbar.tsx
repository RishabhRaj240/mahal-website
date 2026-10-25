"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Menu, X, Play, Pause, Compass } from "lucide-react";
import { MILESTONES } from "@/types";
import { luxuryAudio } from "@/utils/audio";

interface NavbarProps {
  currentProgress: number;
  onJumpToProgress: (progress: number) => void;
  onRequestViewing: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

export default function Navbar({
  currentProgress,
  onJumpToProgress,
  onRequestViewing,
  isAutoPlaying,
  onToggleAutoPlay,
}: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const lastScrollYRef = useRef(0);

  // Auto-hide on downward scroll, show on upward scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current + 15 && currentScrollY > 120) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 10 || currentScrollY <= 80) {
        // Scrolling up or at very top
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSound = () => {
    const playing = luxuryAudio.toggle();
    setIsAudioActive(playing);
  };

  const handleSelectChapter = (startProgress: number) => {
    onJumpToProgress(startProgress);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 px-4 sm:px-8 py-4 transition-all duration-500 transform ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-full px-6 py-3 border border-white/[0.08]">
          {/* Left: Brand Monogram */}
          <div
            onClick={() => onJumpToProgress(0)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 flex items-center justify-center transition-colors group-hover:border-[#D4AF37]">
              <span className="font-cinzel text-xs text-[#D4AF37] font-bold">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm sm:text-base tracking-[0.3em] font-semibold text-[#F9F8F5]">
                MAHAL
              </span>
              <span className="text-[8px] font-sans tracking-[0.25em] text-[#A3A199] hidden sm:block uppercase">
                The Sovereign Residence
              </span>
            </div>
          </div>

          {/* Center: Quick chapter breadcrumb (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {MILESTONES.map((m) => {
              const isCurrent =
                currentProgress >= m.range[0] && currentProgress < m.range[1];
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectChapter(m.range[0])}
                  className={`px-3 py-1 text-[10px] font-cinzel tracking-[0.2em] uppercase transition-all duration-300 rounded-full cursor-pointer ${
                    isCurrent
                      ? "text-[#D4AF37] bg-white/[0.06] font-bold"
                      : "text-[#A3A199]/70 hover:text-[#F9F8F5]"
                  }`}
                >
                  {m.roman}
                </button>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Auto-cruise / Drone Flight toggle */}
            <button
              onClick={onToggleAutoPlay}
              title={isAutoPlaying ? "Pause Drone Cruise" : "Start Drone Cruise"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-sans tracking-[0.2em] glass-pill hover:border-[#D4AF37]/50 text-[#F9F8F5] transition-all cursor-pointer"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#D4AF37]" />
                  <span className="hidden sm:inline">CRUISE PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#D4AF37]" />
                  <span className="hidden sm:inline">AUTOPLAY TOUR</span>
                </>
              )}
            </button>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={toggleSound}
              title={isAudioActive ? "Mute Palace Soundscape" : "Enable Palace Soundscape"}
              className={`p-2 rounded-full glass-pill transition-all cursor-pointer ${
                isAudioActive
                  ? "border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                  : "border-white/10 text-[#A3A199] hover:text-[#F9F8F5]"
              }`}
            >
              {isAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Chapters Drawer Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-full glass-pill border-white/10 text-[#F9F8F5] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>

            {/* Primary CTA */}
            <button
              onClick={onRequestViewing}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F7D070] text-[#060608] font-cinzel font-semibold text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <span>PRIVATE VIEWING</span>
              <Compass className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Chapters Overlay / Fullscreen Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#060608]/95 backdrop-blur-2xl flex flex-col justify-between p-8 sm:p-14 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-3">
              <span className="font-cinzel text-xl text-[#D4AF37] tracking-[0.3em] font-semibold">
                MAHAL
              </span>
              <span className="text-xs font-sans tracking-[0.25em] text-[#A3A199] uppercase">
                // ARCHITECTURAL CHAPTER INDEX
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-3 rounded-full glass-pill hover:border-[#D4AF37] transition-all text-[#F9F8F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-auto max-w-6xl mx-auto w-full">
            {MILESTONES.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectChapter(m.range[0])}
                className="group p-6 rounded-2xl glass-panel border border-white/[0.06] hover:border-[#D4AF37]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-cinzel text-2xl text-[#D4AF37] font-bold">
                      {m.roman}
                    </span>
                    <span className="text-[10px] font-mono text-[#A3A199]">
                      {(m.range[0] * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="font-cinzel text-base text-[#F9F8F5] tracking-wider mb-1 group-hover:text-[#D4AF37] transition-colors">
                    {m.title}
                  </h3>
                  <p className="font-serif italic text-xs text-[#EFE7DA]/70 font-light mb-4">
                    {m.subtitle}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-[10px] text-[#A3A199]/60 font-sans tracking-widest uppercase">
                  <span>{m.lightingTone}</span>
                  <span className="group-hover:translate-x-1 transition-transform text-[#D4AF37]">
                    FLY TO &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-white/[0.08] pt-6 text-[11px] font-sans tracking-[0.25em] text-[#A3A199]">
            <span>SELECT A MILESTONE TO SCRUB DIRECTLY</span>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onRequestViewing();
              }}
              className="text-[#D4AF37] hover:underline cursor-pointer"
            >
              REQUEST PRIVATE VIEWING INQUIRY &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

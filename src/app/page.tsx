"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import VideoScrubber from "@/components/VideoScrubber";
import NarrativeMilestones from "@/components/NarrativeMilestones";
import Navbar from "@/components/Navbar";
import TimelineHUD from "@/components/TimelineHUD";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import PrivateViewingModal from "@/components/PrivateViewingModal";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(68);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const autoPlayRafRef = useRef<number | null>(null);

  // Initialize Lenis smooth scroll and coordinate with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Track scroll progress along the virtual height
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const rawProgress = window.scrollY / maxScroll;
        const clamped = Math.max(0, Math.min(1, rawProgress));
        setScrollProgress(clamped);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle jump to specific progress
  const handleJumpToProgress = useCallback((targetProgress: number) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = targetProgress * maxScroll;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, {
        duration: 2.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  // Cruise / Auto-tour mode
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayRafRef.current) cancelAnimationFrame(autoPlayRafRef.current);
      return;
    }

    const cruiseSpeed = 0.00028; // Glides comfortably through the 80s cinema
    const loop = () => {
      setScrollProgress((prev) => {
        const next = prev + cruiseSpeed;
        if (next >= 1) {
          setIsAutoPlaying(false);
          return 1;
        }
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, next * maxScroll);
        return next;
      });
      autoPlayRafRef.current = requestAnimationFrame(loop);
    };

    autoPlayRafRef.current = requestAnimationFrame(loop);

    return () => {
      if (autoPlayRafRef.current) cancelAnimationFrame(autoPlayRafRef.current);
    };
  }, [isAutoPlaying]);

  // Video ready callback
  const handleVideoReady = useCallback((duration: number) => {
    setVideoDuration(duration);
    setVideoLoaded(true);
  }, []);

  // Time update callback from video scrubber
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  return (
    <main className="relative bg-[#060608] min-h-screen text-[#F9F8F5] selection:bg-[#D4AF37]/30">
      {/* Luxury Custom Ring Cursor */}
      <CustomCursor />

      {/* Cinematic Entrance Preloader */}
      <Preloader
        videoLoaded={videoLoaded}
        loadProgress={98}
        onComplete={() => setIsPreloaded(true)}
      />

      {/* Floating Glass Navbar */}
      <Navbar
        currentProgress={scrollProgress}
        onJumpToProgress={handleJumpToProgress}
        onRequestViewing={() => setIsViewingModalOpen(true)}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
      />

      {/* Interactive Timeline HUD (Right Vertical Bar) */}
      <TimelineHUD
        progress={scrollProgress}
        currentTime={currentTime}
        duration={videoDuration}
        onJumpToProgress={handleJumpToProgress}
      />

      {/* Sticky Fullscreen Video Player & Dynamic Lighting */}
      <VideoScrubber
        progress={scrollProgress}
        onVideoReady={handleVideoReady}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Floating Kinetic Typography & Narrative Milestones */}
      <NarrativeMilestones
        progress={scrollProgress}
        onRequestViewing={() => setIsViewingModalOpen(true)}
        onExploreClick={() => handleJumpToProgress(0.14)}
      />

      {/* Virtual Scroll Height Track (10,500px enables silk-smooth scroll scrub control) */}
      <div
        ref={containerRef}
        className="relative w-full pointer-events-none"
        style={{ height: "10500px" }}
      />

      {/* Private Residence Viewing VIP Modal */}
      <PrivateViewingModal
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
      />
    </main>
  );
}

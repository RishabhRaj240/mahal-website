"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface VideoScrubberProps {
  progress: number; // 0 to 1
  onVideoReady?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function VideoScrubber({
  progress,
  onVideoReady,
  onTimeUpdate,
}: VideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState<number>(68);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  // Animation / lerp references
  const targetTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const lastSampleTimeRef = useRef<number>(0);

  // Update target time when scroll progress changes
  useEffect(() => {
    if (duration > 0) {
      targetTimeRef.current = Math.min(Math.max(progress * duration, 0), duration - 0.05);
    }
  }, [progress, duration]);

  // Video metadata & ready handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 68;
    setDuration(dur);
    setIsLoaded(true);
    video.currentTime = 0.01;
    onVideoReady?.(dur);
  }, [onVideoReady]);

  // Dynamic frame lighting sampler
  const sampleFrameLighting = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      ctx.drawImage(video, 0, 0, 16, 9);
      const frame = ctx.getImageData(0, 0, 16, 9);
      const data = frame.data;
      let r = 0, g = 0, b = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      r = Math.round(r / totalPixels);
      g = Math.round(g / totalPixels);
      b = Math.round(b / totalPixels);

      // Relative luminance (standard Rec. 709)
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      // Warmth ratio: high red/amber vs blue
      const warmth = (r + 1) / (b + 1);

      const root = document.documentElement;
      root.style.setProperty("--scene-r", `${r}`);
      root.style.setProperty("--scene-g", `${g}`);
      root.style.setProperty("--scene-b", `${b}`);
      root.style.setProperty("--scene-luminance", `${luminance.toFixed(3)}`);
      root.style.setProperty("--scene-warmth", `${Math.min(warmth, 2.2).toFixed(2)}`);
    } catch {
      // Ignore cross-origin security errors if any
    }
  }, []);

  // Inertial smooth scrub loop via requestAnimationFrame
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const renderLoop = (time: number) => {
      if (video && video.readyState >= 1) {
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const diff = target - current;

        // Smooth damping lerp (0.12 provides snappy yet cinematic fluid motion)
        if (Math.abs(diff) > 0.005) {
          const next = current + diff * 0.12;
          currentTimeRef.current = next;

          if (!isSeekingRef.current) {
            isSeekingRef.current = true;
            
            // Check for fastSeek support (macOS Safari & WebKit provide hardware fastSeek)
            if ("fastSeek" in video && typeof (video as unknown as { fastSeek: (t: number) => void }).fastSeek === "function") {
              try {
                (video as unknown as { fastSeek: (t: number) => void }).fastSeek(next);
              } catch {
                video.currentTime = next;
              }
            } else {
              video.currentTime = next;
            }
          }
        }

        // Periodically sample frame lighting every 120ms
        if (time - lastSampleTimeRef.current > 120) {
          lastSampleTimeRef.current = time;
          sampleFrameLighting(video);
          onTimeUpdate?.(currentTimeRef.current, duration);
        }
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [duration, sampleFrameLighting, onTimeUpdate]);

  // Handle seeking release
  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#060608] select-none pointer-events-none">
      {/* Offscreen canvas for real-time Dynamic Frame Lighting */}
      <canvas
        ref={canvasRef}
        width={16}
        height={9}
        className="hidden"
        aria-hidden="true"
      />

      {/* Fullscreen Master Video */}
      <video
        ref={videoRef}
        src="/video.mp4"
        preload="auto"
        muted
        playsInline
        webkit-playsinline="true"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Cinematic Vignette & Ambient Aura */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(6,6,8,0.7)_90%,rgba(6,6,8,0.95)_100%] pointer-events-none" />

      {/* Dynamic Ambient Scene Glow that warms / cools dynamically */}
      <div className="ambient-scene-glow absolute inset-0 pointer-events-none" />

      {/* Top & bottom architectural cinema letterbox fades */}
      <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#060608] via-[#060608]/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#060608] via-[#060608]/70 to-transparent pointer-events-none" />

      {/* 35mm Subtle Film Grain */}
      <div className="film-grain absolute inset-0 pointer-events-none" />
    </div>
  );
}

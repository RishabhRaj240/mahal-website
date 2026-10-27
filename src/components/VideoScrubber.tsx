"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface VideoScrubberProps {
  progress: number; // 0 to 1
  onVideoReady?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const VIDEO_SOURCES = {
  mobile: "/video-mobile.mp4",
  tablet: "/video-tablet.mp4",
  desktop: "/video.mp4",
} as const;

type DeviceTier = "mobile" | "tablet" | "desktop";

export default function VideoScrubber({
  progress,
  onVideoReady,
  onTimeUpdate,
}: VideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState<number>(68);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [deviceTier, setDeviceTier] = useState<DeviceTier>("desktop");
  const [activeSrc, setActiveSrc] = useState<string>(VIDEO_SOURCES.desktop);

  // Animation / lerp references
  const targetTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const lastSampleTimeRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Responsive device tier detection
  const getDeviceTier = useCallback((): DeviceTier => {
    if (typeof window === "undefined") return "desktop";
    const width = window.innerWidth;
    if (width <= 640) return "mobile";
    if (width <= 1024) return "tablet";
    return "desktop";
  }, []);

  // Initialize and handle responsive viewport changes
  useEffect(() => {
    prefersReducedMotionRef.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initialTier = getDeviceTier();
    setDeviceTier(initialTier);
    setActiveSrc(VIDEO_SOURCES[initialTier]);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      // Debounce resize to prevent video reload churning during mobile scroll or address bar toggle
      resizeTimer = setTimeout(() => {
        const newTier = getDeviceTier();
        if (newTier !== deviceTier) {
          const video = videoRef.current;
          const currentRatio =
            video && video.duration > 0 ? video.currentTime / video.duration : 0;

          setDeviceTier(newTier);
          setActiveSrc(VIDEO_SOURCES[newTier]);

          if (video) {
            const handleMetadataOnTierChange = () => {
              if (video.duration) {
                video.currentTime = Math.max(0.01, currentRatio * video.duration);
              }
              video.removeEventListener("loadedmetadata", handleMetadataOnTierChange);
            };
            video.addEventListener("loadedmetadata", handleMetadataOnTierChange);
          }
        }
      }, 300);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [deviceTier, getDeviceTier]);

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
    // Seek to first frame so decoder primes immediately
    video.currentTime = 0.01;
    onVideoReady?.(dur);
  }, [onVideoReady]);

  // Dynamic frame lighting sampler (throttled responsively to save mobile GPU/CPU)
  const sampleFrameLighting = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    try {
      ctx.drawImage(video, 0, 0, 16, 9);
      const frame = ctx.getImageData(0, 0, 16, 9);
      const data = frame.data;
      let r = 0,
        g = 0,
        b = 0;
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

    // Responsive lighting sample interval: 120ms desktop, 350ms tablet, 600ms mobile
    const sampleInterval =
      deviceTier === "mobile" ? 600 : deviceTier === "tablet" ? 350 : 120;
    const lerpFactor = prefersReducedMotionRef.current
      ? 1.0
      : deviceTier === "mobile"
      ? 0.18 // Snappier on touch devices
      : 0.12;

    const renderLoop = (time: number) => {
      if (video && video.readyState >= 1) {
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const diff = target - current;

        // Damping lerp
        if (Math.abs(diff) > 0.005) {
          const next =
            lerpFactor === 1.0 ? target : current + diff * lerpFactor;
          currentTimeRef.current = next;

          if (!isSeekingRef.current) {
            isSeekingRef.current = true;

            // Check for fastSeek support (macOS Safari & WebKit provide hardware fastSeek)
            if (
              "fastSeek" in video &&
              typeof (video as unknown as { fastSeek: (t: number) => void })
                .fastSeek === "function"
            ) {
              try {
                (
                  video as unknown as { fastSeek: (t: number) => void }
                ).fastSeek(next);
              } catch {
                video.currentTime = next;
              }
            } else {
              video.currentTime = next;
            }
          }
        }

        // Periodically sample frame lighting according to device tier
        if (time - lastSampleTimeRef.current > sampleInterval) {
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
  }, [duration, deviceTier, sampleFrameLighting, onTimeUpdate]);

  // Handle seeking release
  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false;
  }, []);

  // Graceful fallback if any specific video stream fails
  const handleVideoError = useCallback(() => {
    console.warn("Video failed to load source, falling back to desktop master:", activeSrc);
    if (activeSrc !== VIDEO_SOURCES.desktop) {
      setActiveSrc(VIDEO_SOURCES.desktop);
    }
  }, [activeSrc]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#060608] select-none pointer-events-none">
      {/* Instant visual poster backdrop to prevent any layout shifts or black flashes */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: "url('/poster.jpg')" }}
        aria-hidden="true"
      />

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
        src={activeSrc}
        poster="/poster.jpg"
        preload="metadata"
        muted
        playsInline
        webkit-playsinline="true"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onError={handleVideoError}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
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

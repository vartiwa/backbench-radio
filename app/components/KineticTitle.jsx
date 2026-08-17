"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function KineticTitle({ title, tagline, theme, isPlaying }) {
  const containerRef = useRef(null);
  const taglineRef = useRef(null);
  const waveAnimRef = useRef(null);

  const isHiphop    = theme === "hiphop";
  const isStreet    = theme === "street";
  const isClassroom = theme === "classroom";

  // Per-theme text gradients
  const gradient = isHiphop
    ? "linear-gradient(175deg, #fff9ee 0%, #ffd580 55%, #f59030 100%)"
    : isStreet
    ? "linear-gradient(175deg, #ffffff 0%, #e0f8ff 35%, #a0d8ef 70%, #7ec8e3 100%)"
    : isClassroom
    ? "linear-gradient(175deg, #fffef8 0%, #ffeebb 60%, #f5ce60 100%)"
    : "linear-gradient(175deg, #ffffff 0%, #ffedd5 35%, #fecdd3 70%, #fda4af 100%)";

  // Per-theme soft drop-shadow glow
  const glowFilter = isHiphop
    ? "drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 28px rgba(245,160,60,0.45))"
    : isStreet
    ? "drop-shadow(0 4px 24px rgba(0,0,0,0.8)) drop-shadow(0 0 30px rgba(126,200,227,0.5)) drop-shadow(0 0 14px rgba(56,189,248,0.4))"
    : isClassroom
    ? "drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 24px rgba(230,180,60,0.38))"
    : "drop-shadow(0 4px 20px rgba(0,0,0,0.65)) drop-shadow(0 0 28px rgba(251,113,133,0.4)) drop-shadow(0 0 12px rgba(251,146,60,0.25))";

  const titleClass = isHiphop
    ? "font-anton uppercase"
    : "font-display italic";

  const sizeClass = isHiphop
    ? "text-[3.2rem] sm:text-8xl lg:text-[10rem] leading-none tracking-widest"
    : "text-[3.2rem] sm:text-8xl lg:text-9xl leading-none tracking-tight";

  const taglineColor = isHiphop
    ? "rgba(255,160,80,0.65)"
    : isStreet
    ? "rgba(180,230,255,0.8)"
    : isClassroom
    ? "rgba(245,190,90,0.6)"
    : "rgba(254,205,211,0.75)";

  // 1. Anime.js Letter Entrance & Theme Transition
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char-span");
    if (!chars.length) return;

    animate(chars, {
      translateY: [28, 0],
      opacity: [0, 1],
      scale: [0.93, 1],
      rotateZ: isHiphop ? [-3, 0] : [-1, 0],
      delay: stagger(30, { start: 40 }),
      duration: 800,
      ease: "outExpo",
    });

    // Tagline morph animation
    if (taglineRef.current) {
      animate(taglineRef.current, {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 600,
        ease: "outCubic",
        delay: 180,
      });
    }
  }, [title, theme, isHiphop]);

  // 2. Audio-reactive Gentle Acoustic Wave when playing
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char-span");

    if (isPlaying && chars.length > 0) {
      waveAnimRef.current = animate(chars, {
        translateY: [-2.5, 2.5],
        scale: [0.99, 1.01],
        delay: stagger(70),
        duration: 1600,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    } else {
      if (waveAnimRef.current) {
        waveAnimRef.current.pause();
      }
      animate(chars, {
        translateY: 0,
        scale: 1,
        duration: 350,
        ease: "outQuad",
      });
    }

    return () => {
      if (waveAnimRef.current) waveAnimRef.current.pause();
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center text-center px-6 z-10 my-auto select-none">
      {/* Glow wrapper */}
      <div
        style={{ filter: glowFilter }}
        className="transition-all duration-700"
      >
        <h1
          ref={containerRef}
          className={`${titleClass} ${sizeClass} inline-flex flex-wrap justify-center overflow-hidden py-2`}
          style={{
            backgroundImage: gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {title.split("").map((char, index) => (
            <span
              key={`${theme}-${char}-${index}`}
              className="char-span inline-block will-change-transform"
              style={{
                display: char === " " ? "inline" : "inline-block",
                width: char === " " ? "0.25em" : "auto",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>

      {/* Dynamic Animated Separator */}
      <div className="mt-5 flex items-center gap-3">
        <div
          className={`h-px bg-paper/25 transition-all duration-700 ${
            isPlaying ? "w-12 bg-amber/50 shadow-[0_0_8px_rgba(232,163,74,0.4)]" : "w-6"
          }`}
        />
        <div
          className={`h-[5px] w-[5px] rounded-full transition-all duration-700 ${
            isPlaying ? "bg-amber scale-125 shadow-[0_0_8px_rgba(232,163,74,0.6)]" : "bg-paper/30"
          }`}
        />
        <div
          className={`h-px bg-paper/25 transition-all duration-700 ${
            isPlaying ? "w-12 bg-amber/50 shadow-[0_0_8px_rgba(232,163,74,0.4)]" : "w-6"
          }`}
        />
      </div>

      {/* Cinematic Tagline */}
      <p
        ref={taglineRef}
        className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] mt-5"
        style={{ color: taglineColor }}
      >
        {tagline}
      </p>
    </div>
  );
}

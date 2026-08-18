"use client";

import { useEffect, useState, useRef } from "react";
import { animate, stagger } from "animejs";

const GLITCH_CHARS = "░▒▓█#$%&!?01X*+⚔†";

export default function KineticTitle({ title, tagline, theme, isPlaying, isExhausted }) {
  const containerRef = useRef(null);
  const taglineRef = useRef(null);
  const waveAnimRef = useRef(null);
  const [displayText, setDisplayText] = useState(title);
  const [isGlitchingText, setIsGlitchingText] = useState(false);

  const isEx        = isExhausted && theme === "campus";
  const isHiphop    = theme === "hiphop";
  const isStreet    = theme === "street";

  // Per-theme tailored color gradients that harmonize with the visual art
  const gradient = isEx
    ? "linear-gradient(175deg, #ffffff 0%, #ccfbf1 28%, #5eead4 60%, #0d9488 100%)"
    : isHiphop
    ? "linear-gradient(175deg, #ffffff 0%, #f3e8ff 25%, #d8b4fe 55%, #a855f7 85%, #7e22ce 100%)"
    : isStreet
    ? "linear-gradient(175deg, #ffffff 0%, #e0f2fe 28%, #7dd3fc 62%, #38bdf8 100%)"
    : "linear-gradient(175deg, #ffffff 0%, #fef3c7 30%, #fde68a 60%, #f59e0b 100%)";

  // Retained refined Playfair display typography
  const titleClass = "font-display italic tracking-tight font-normal";
  const sizeClass = "text-[2.25rem] min-[390px]:text-[2.75rem] sm:text-8xl lg:text-9xl leading-none";

  const taglineColor = isEx
    ? "#5eead4"
    : isHiphop
    ? "#e9d5ff"
    : isStreet
    ? "#bae6fd"
    : "#fef08a";

  // Fast Glitch Scramble Reveal on Sanctuary Switch
  useEffect(() => {
    if (isEx) {
      setIsGlitchingText(true);
      const target = "Backbench Sanctuary";
      let iteration = 0;
      const maxIterations = 10;

      const interval = setInterval(() => {
        setDisplayText(
          target
            .split("")
            .map((char, idx) => {
              if (char === " ") return " ";
              if (idx < (iteration / maxIterations) * target.length) {
                return target[idx];
              }
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(target);
          setIsGlitchingText(false);
        }
      }, 35);

      return () => clearInterval(interval);
    } else {
      setDisplayText(title);
      setIsGlitchingText(false);
    }
  }, [isEx, title]);

  // Anime.js Letter Entrance on Theme Switch
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char-span");
    if (!chars.length) return;

    if (isEx) {
      animate(chars, {
        translateY: [16, 0],
        opacity: [0, 1],
        scale: [1.08, 1],
        delay: stagger(16),
        duration: 450,
        ease: "outExpo",
      });
    } else {
      animate(chars, {
        translateY: [24, 0],
        opacity: [0, 1],
        scale: [0.95, 1],
        delay: stagger(22, { start: 20 }),
        duration: 650,
        ease: "outExpo",
      });
    }

    if (taglineRef.current) {
      animate(taglineRef.current, {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 500,
        ease: "outCubic",
        delay: 150,
      });
    }
  }, [theme, isHiphop, isEx]);

  // Audio-reactive Smooth Acoustic Float when Playing
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char-span");

    if (isPlaying && chars.length > 0) {
      waveAnimRef.current = animate(chars, {
        translateY: [-3, 3],
        delay: stagger(60, { from: "center" }),
        duration: 1400,
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
        duration: 300,
        ease: "outQuad",
      });
    }

    return () => {
      if (waveAnimRef.current) waveAnimRef.current.pause();
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center text-center px-6 z-10 my-auto select-none transition-all duration-500">
      {/* Main Title Wrapper */}
      <div className="gemini-aura-container relative select-none">
        {/* Mood-Matched Pure Breathing Glow Aura */}
        <div className={`gemini-aura-halo ${isPlaying ? "gemini-aura-active" : ""}`} />

        <h1
          ref={containerRef}
          className={`${titleClass} ${sizeClass} inline-flex flex-wrap justify-center overflow-hidden py-2 relative z-10`}
          style={{
            backgroundImage: gradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            WebkitTextStroke: isEx
              ? "1px rgba(94, 234, 212, 0.45)"
              : isHiphop
              ? "1px rgba(192, 132, 252, 0.45)"
              : isStreet
              ? "1px rgba(125, 211, 252, 0.45)"
              : "1px rgba(254, 215, 170, 0.45)",
            filter: isEx
              ? "drop-shadow(0 6px 20px rgba(0,0,0,0.75)) drop-shadow(0 2px 6px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(45,212,191,0.35))"
              : isHiphop
              ? "drop-shadow(0 6px 20px rgba(0,0,0,0.75)) drop-shadow(0 2px 6px rgba(0,0,0,0.85)) drop-shadow(0 0 16px rgba(168,85,247,0.45))"
              : isStreet
              ? "drop-shadow(0 6px 20px rgba(0,0,0,0.75)) drop-shadow(0 2px 6px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(56,189,248,0.35))"
              : "drop-shadow(0 6px 20px rgba(0,0,0,0.75)) drop-shadow(0 2px 6px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(245,158,11,0.3))",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {displayText.split("").map((char, index) => (
            <span
              key={`${theme}-${isEx}-${char}-${index}`}
              className="char-span inline-block will-change-transform transform-gpu"
              style={{
                display: char === " " ? "inline" : "inline-block",
                width: char === " " ? "0.25em" : "auto",
                backfaceVisibility: "hidden",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>

      {/* Dynamic Mood-Matched Animated Separator with Highlight Sweep */}
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`h-px transition-all duration-700 ${
            isEx
              ? isPlaying ? "w-16 bg-teal-400 shadow-[0_0_12px_#2dd4bf]" : "w-10 bg-teal-400/60"
              : isHiphop
              ? isPlaying ? "w-16 bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]" : "w-8 bg-purple-400/60"
              : isStreet
              ? isPlaying ? "w-16 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" : "w-8 bg-sky-400/60"
              : isPlaying ? "w-14 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]" : "w-7 bg-amber-400/50"
          }`}
        />
        <div
          className={`rounded-full transition-all duration-700 ${
            isEx
              ? isPlaying ? "h-2 w-2 bg-teal-300 shadow-[0_0_10px_#2dd4bf] scale-125" : "h-1.5 w-1.5 bg-teal-400/70"
              : isHiphop
              ? isPlaying ? "h-2 w-2 bg-purple-300 shadow-[0_0_10px_#c084fc] scale-125" : "h-1.5 w-1.5 bg-purple-400/70"
              : isStreet
              ? isPlaying ? "h-2 w-2 bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.9)] scale-125" : "h-1.5 w-1.5 bg-sky-400/70"
              : isPlaying ? "h-2 w-2 bg-amber-300 scale-125 shadow-[0_0_10px_rgba(245,158,11,0.7)]" : "h-1.5 w-1.5 bg-amber-400/60"
          }`}
        />
        <div
          className={`h-px transition-all duration-700 ${
            isEx
              ? isPlaying ? "w-16 bg-teal-400 shadow-[0_0_12px_#2dd4bf]" : "w-10 bg-teal-400/60"
              : isHiphop
              ? isPlaying ? "w-16 bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]" : "w-8 bg-purple-400/60"
              : isStreet
              ? isPlaying ? "w-16 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]" : "w-8 bg-sky-400/60"
              : isPlaying ? "w-14 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]" : "w-7 bg-amber-400/50"
          }`}
        />
      </div>

      {/* Cinematic Mood-Matched Tagline */}
      <p
        ref={taglineRef}
        className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.32em] font-normal mt-3.5 sm:mt-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-center px-3"
        style={{ color: taglineColor }}
      >
        {tagline}
      </p>
    </div>
  );
}

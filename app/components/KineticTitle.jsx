"use client";

import { useEffect, useState, useRef } from "react";
import { animate, stagger } from "animejs";
import { Radio } from "lucide-react";

const GLITCH_CHARS = "░▒▓█#$%&!?01X*+⚔†";

// 28 Dynamic Audio Spectrum Frequency Bars (Inspired by Swishy Audio Visualizer)
const BAR_COUNT = 28;
const BARS_CONFIG = Array.from({ length: BAR_COUNT }, (_, i) => ({
  frequency: 0.08 + (i % 7) * 0.025,
  phase: i * 0.28,
  amplitude: 0.35 + Math.sin(i * 0.22) * 0.25,
}));

export default function KineticTitle({ title, tagline, theme, isPlaying, isExhausted }) {
  const containerRef = useRef(null);
  const taglineRef = useRef(null);
  const waveAnimRef = useRef(null);
  const barsCanvasRef = useRef(null);
  const [displayText, setDisplayText] = useState(title);
  const [isGlitchingText, setIsGlitchingText] = useState(false);

  const isEx     = isExhausted && theme === "campus";
  const isHiphop = theme === "hiphop";
  const isStreet = theme === "street";

  // Mood color schemes & gradients
  const gradient = isEx
    ? "linear-gradient(175deg, #ffffff 0%, #ccfbf1 28%, #5eead4 60%, #0d9488 100%)"
    : isHiphop
    ? "linear-gradient(175deg, #ffffff 0%, #f3e8ff 25%, #d8b4fe 55%, #a855f7 85%, #7e22ce 100%)"
    : isStreet
    ? "linear-gradient(175deg, #ffffff 0%, #e0f2fe 28%, #7dd3fc 62%, #38bdf8 100%)"
    : "linear-gradient(175deg, #ffffff 0%, #fef3c7 30%, #fde68a 60%, #f59e0b 100%)";

  const themeHue = isEx ? 172 : isHiphop ? 275 : isStreet ? 200 : 38;
  const themeGlow = isEx
    ? "rgba(45, 212, 191, 0.45)"
    : isHiphop
    ? "rgba(168, 85, 247, 0.55)"
    : isStreet
    ? "rgba(56, 189, 248, 0.45)"
    : "rgba(245, 158, 11, 0.45)";

  const titleClass = "font-display italic tracking-tight font-normal";
  const sizeClass = "text-[2.25rem] min-[390px]:text-[2.75rem] sm:text-8xl lg:text-9xl leading-none";

  const taglineColor = isEx
    ? "#5eead4"
    : isHiphop
    ? "#e9d5ff"
    : isStreet
    ? "#bae6fd"
    : "#fef08a";

  const moodLabel = isEx
    ? "SANCTUARY • CALM FREQUENCY"
    : isHiphop
    ? "BOOM BAP • 90s CYPHER"
    : isStreet
    ? "RAINY ROUTE • MIDNIGHT LO-FI"
    : "CAMPUS VIBES • GOLDEN HOUR";

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
        translateY: [-4, 4],
        delay: stagger(55, { from: "center" }),
        duration: 1300,
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

  // 60FPS Swishy Audio Visualizer Canvas Spectrum Bars
  useEffect(() => {
    const canvas = barsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animId;

    const renderBars = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const totalBars = BAR_COUNT;
      const gap = 4;
      const barW = (width - (totalBars - 1) * gap) / totalBars;
      const maxHeight = height * 0.85;

      for (let i = 0; i < totalBars; i++) {
        const config = BARS_CONFIG[i];
        const wave = isPlaying
          ? Math.sin(frame * config.frequency + config.phase) * config.amplitude + 0.55
          : 0.12 + Math.sin(frame * 0.02 + config.phase) * 0.05;

        const currentBarH = Math.max(3, maxHeight * wave);
        const x = i * (barW + gap);
        const y = height - currentBarH;

        // Dynamic Swishy HSL Hue Gradient Glow
        const hueShift = themeHue + (isPlaying ? Math.sin(frame * 0.04 + i * 0.1) * 15 : 0);
        const lightness = isPlaying ? 65 : 45;

        ctx.fillStyle = `hsl(${hueShift}, 85%, ${lightness}%)`;
        ctx.shadowColor = `hsla(${hueShift}, 90%, 50%, ${isPlaying ? 0.75 : 0.3})`;
        ctx.shadowBlur = isPlaying ? 8 : 2;

        // Rounded pill bar
        ctx.beginPath();
        const r = barW * 0.4;
        ctx.roundRect(x, y, barW, currentBarH, [r, r, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderBars);
    };

    animId = requestAnimationFrame(renderBars);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, themeHue]);

  return (
    <div className="flex flex-col items-center text-center px-6 z-10 my-auto select-none transition-all duration-500">
      
      {/* ── 1. SWISHY TOP STATUS PILL: NOW PLAYING ── */}
      <div className="mb-2 flex items-center gap-2 font-mono text-[9px] sm:text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/70 bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-xl shadow-lg animate-fade-in">
        <Radio size={11} className={isPlaying ? "text-amber-300 animate-pulse" : "text-white/40"} />
        <span style={{ color: taglineColor }}>{isPlaying ? "NOW PLAYING" : "LIVE RADIO"}</span>
        <span className="text-white/20">•</span>
        <span className="text-white/60 tracking-widest">{moodLabel}</span>
      </div>

      {/* ── 2. MAIN TITLE WITH SWISHY RADIAL AURA BLOOM ── */}
      <div className="gemini-aura-container relative select-none">
        
        {/* Dynamic Swishy Radial Glow Ellipse */}
        <div
          className="pointer-events-none absolute -inset-8 rounded-full blur-[40px] opacity-40 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at center, ${themeGlow} 0%, transparent 70%)`,
            transform: isPlaying ? "scale(1.15)" : "scale(0.95)",
          }}
        />

        <h1
          ref={containerRef}
          className={`${titleClass} ${sizeClass} inline-flex flex-wrap justify-center overflow-hidden py-2 relative z-10`}
          style={{
            filter: isEx
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(45,212,191,0.5))"
              : isHiphop
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(168,85,247,0.6))"
              : isStreet
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(56,189,248,0.5))"
              : "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(245,158,11,0.45))",
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
                backgroundImage: gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "#ffffff",
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>

      {/* ── 3. SWISHY AUDIO VISUALIZER FREQUENCY BARS ── */}
      <div className="mt-3 flex flex-col items-center">
        <canvas
          ref={barsCanvasRef}
          width={280}
          height={26}
          className="h-[22px] w-[240px] sm:w-[280px] drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
        />
      </div>

      {/* ── 4. CINEMATIC MOOD-MATCHED TAGLINE ── */}
      <p
        ref={taglineRef}
        className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.32em] font-normal mt-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-center px-3"
        style={{ color: taglineColor }}
      >
        {tagline}
      </p>
    </div>
  );
}

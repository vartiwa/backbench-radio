"use client";

import { useEffect, useState, useRef } from "react";
import { animate, stagger } from "animejs";
import { Radio } from "lucide-react";

const GLITCH_CHARS = "░▒▓█#$%&!?01X*+⚔†";

export default function KineticTitle({ title, tagline, theme, isPlaying, isExhausted }) {
  const containerRef = useRef(null);
  const taglineRef = useRef(null);
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
    ? "rgba(45, 212, 191, 0.55)"
    : isHiphop
    ? "rgba(168, 85, 247, 0.65)"
    : isStreet
    ? "rgba(56, 189, 248, 0.55)"
    : "rgba(245, 158, 11, 0.55)";

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

  // 60FPS Slow, Serene & Calm Liquid Harmonic Traveling Soundwave Flow
  useEffect(() => {
    if (!containerRef.current) return;
    const chars = containerRef.current.querySelectorAll(".char-span");
    if (!chars.length) return;

    let frame = 0;
    let animId;

    const renderLiquidFlow = () => {
      frame += 0.016; // Super slow, dreamy, calm pace

      chars.forEach((span, i) => {
        if (span.dataset.isSpace === "true") return;

        if (isPlaying) {
          // Slow, tranquil dual harmonic wave
          const wave1 = Math.sin(frame * 1.1 - i * 0.26);
          const wave2 = Math.sin(frame * 0.55 - i * 0.13) * 0.35;
          const combinedWave = wave1 + wave2; // smooth serene undulating wave

          const waveCos = Math.cos(frame * 1.1 - i * 0.26);
          const jumpY = combinedWave * -4.5; // gentle, relaxing vertical drift
          const rotZ = waveCos * 1.2; // soft subtle tilt
          const scaleY = 1 + combinedWave * 0.045; // soft breathing stretch
          const scaleX = 1 - combinedWave * 0.018;

          // Soft, gentle ambient glow pulse
          const shimmer = Math.pow(Math.max(0, Math.cos(frame * 0.9 - i * 0.22)), 3);
          const glowRadius = 10 + shimmer * 14;
          const brightness = 1 + shimmer * 0.18;

          span.style.transform = `translate3d(0, ${jumpY.toFixed(2)}px, 0) rotateZ(${rotZ.toFixed(2)}deg) scale3d(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}, 1)`;
          span.style.filter = `drop-shadow(0 0 ${glowRadius.toFixed(1)}px ${themeGlow}) brightness(${brightness.toFixed(2)})`;
        } else {
          // Serene resting state
          span.style.transform = "translate3d(0, 0, 0) rotateZ(0deg) scale3d(1, 1, 1)";
          span.style.filter = "none";
        }
      });

      animId = requestAnimationFrame(renderLiquidFlow);
    };

    animId = requestAnimationFrame(renderLiquidFlow);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, displayText, themeGlow]);

  return (
    <div className="flex flex-col items-center text-center px-6 z-10 my-auto select-none transition-all duration-500">
      {/* ── MAIN TEXT WITH DIRECT AUDIO VISUALIZER SPECTRUM ANIMATION ── */}
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
          className={`${titleClass} ${sizeClass} inline-flex flex-wrap justify-center overflow-hidden py-3 relative z-10`}
          style={{
            filter: isEx
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9))"
              : isHiphop
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9))"
              : isStreet
              ? "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9))"
              : "drop-shadow(0 6px 22px rgba(0,0,0,0.85)) drop-shadow(0 2px 6px rgba(0,0,0,0.9))",
            backfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {displayText.split("").map((char, index) => {
            const isSpace = char === " ";
            return (
              <span
                key={`${theme}-${isEx}-${char}-${index}`}
                data-is-space={isSpace ? "true" : "false"}
                className="char-span inline-block will-change-transform transform-gpu"
                style={{
                  display: isSpace ? "inline" : "inline-block",
                  width: isSpace ? "0.25em" : "auto",
                  backgroundImage: gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "#ffffff",
                  backfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                  transformOrigin: "bottom center",
                }}
              >
                {isSpace ? "\u00A0" : char}
              </span>
            );
          })}
        </h1>
      </div>

      {/* ── 3. CINEMATIC MOOD-MATCHED TAGLINE ── */}
      <p
        ref={taglineRef}
        className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.32em] font-normal mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-center px-3"
        style={{ color: taglineColor }}
      >
        {tagline}
      </p>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Headphones, AlarmClock, Timer } from "lucide-react";
import { formatListeningDuration } from "../lib/listeningStats";

export default function Clock({
  todaySeconds = 0,
  isPlaying = false,
  theme = "campus",
  isExhausted = false,
  onOpenStats,
  onOpenTimer,
  onClick,
}) {
  const [time, setTime] = useState({
    hours: 8,
    minutes: 54,
    seconds: 0,
    formattedHour: "08",
    formattedMinute: "54",
    dayName: "WEDNESDAY",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      const days = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];

      setTime({
        hours: h,
        minutes: m,
        seconds: s,
        formattedHour: String(h).padStart(2, "0"),
        formattedMinute: String(m).padStart(2, "0"),
        dayName: days[now.getDay()],
      });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hand rotation degrees
  const hourDeg = ((time.hours % 12) + time.minutes / 60) * 30;
  const minuteDeg = (time.minutes + time.seconds / 60) * 6;
  const secondDeg = time.seconds * 6;

  // Natural theme mood second hand color blending (No AI Slop neon shifts)
  const secondHandColor =
    theme === "street"
      ? "#38bdf8"
      : theme === "hiphop"
      ? "#e9d5ff"
      : isExhausted
      ? "#2dd4bf"
      : "#f43f5e"; // Natural coral red accent matching the reference image

  const dayAccentColor =
    theme === "street"
      ? "text-sky-300"
      : theme === "hiphop"
      ? "text-purple-300"
      : isExhausted
      ? "text-teal-300"
      : "text-rose-400";

  const handleStatsClick = (e) => {
    e?.stopPropagation?.();
    if (onOpenStats) onOpenStats();
    else if (onClick) onClick();
  };

  const handleTimerClick = (e) => {
    e?.stopPropagation?.();
    if (onOpenTimer) onOpenTimer();
    else if (onClick) onClick();
  };

  const listeningGlowStyle = isPlaying
    ? isExhausted
      ? "bg-teal-500/15 border-teal-400/50 text-teal-100 shadow-[0_0_12px_rgba(45,212,191,0.45)]"
      : theme === "hiphop"
      ? "bg-purple-500/15 border-purple-400/50 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.45)]"
      : theme === "street"
      ? "bg-sky-500/15 border-sky-400/50 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,0.45)]"
      : "bg-amber-400/15 border-amber-400/50 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.45)]"
    : "bg-white/10 hover:bg-white/20 border-white/10 text-white";

  const headphoneIconColor = isPlaying
    ? isExhausted
      ? "text-teal-300 animate-pulse"
      : theme === "hiphop"
      ? "text-purple-300 animate-pulse"
      : theme === "street"
      ? "text-sky-300 animate-pulse"
      : "text-amber-300 animate-pulse"
    : "text-white/70";

  return (
    <div
      className="group relative flex items-center gap-3 rounded-[1.8rem] border border-white/15 bg-black/50 p-2 sm:px-3 sm:py-2 backdrop-blur-2xl transition-all duration-300 hover:border-white/30 hover:bg-black/70 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] select-none"
    >
      {/* ══ 1. ANALOG MINIMALIST CLOCK FACE (Matching Reference Image) ══ */}
      <button
        type="button"
        onClick={handleStatsClick}
        title="View Personal Listening Journal"
        className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
      >
        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-inner">
          {/* Cardinal Tick Marks (12, 3, 6, 9) */}
          <span className="absolute top-1 h-1 w-0.5 rounded-full bg-paper/50" />
          <span className="absolute bottom-1 h-1 w-0.5 rounded-full bg-paper/50" />
          <span className="absolute left-1 h-0.5 w-1 rounded-full bg-paper/50" />
          <span className="absolute right-1 h-0.5 w-1 rounded-full bg-paper/50" />

          {/* Hour Hand (Broad frosted pill needle) */}
          <div
            style={{ transform: `rotate(${mounted ? hourDeg : 270}deg)` }}
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 will-change-transform"
          >
            <div className="h-3.5 sm:h-4 w-1.5 -translate-y-1.5 rounded-full bg-gradient-to-t from-white/90 to-white/40 shadow-sm" />
          </div>

          {/* Minute Hand (Crisp slender needle) */}
          <div
            style={{ transform: `rotate(${mounted ? minuteDeg : 340}deg)` }}
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 will-change-transform"
          >
            <div className="h-5 sm:h-6 w-0.5 -translate-y-2.5 rounded-full bg-white/90 shadow-sm" />
          </div>

          {/* Second Hand (Delicate sweeping coral/accent needle) */}
          <div
            style={{ transform: `rotate(${mounted ? secondDeg : 140}deg)` }}
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 will-change-transform"
          >
            <div
              style={{ backgroundColor: secondHandColor }}
              className="h-6 sm:h-7 w-px -translate-y-3 shadow-sm"
            />
          </div>

          {/* Elevated Center Disc Hub */}
          <div className="relative z-20 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border border-white/20 bg-white/20 backdrop-blur-md shadow-sm" />
        </div>

        {/* Stacked Digital Hours & Minutes + Day */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1 font-mono tracking-tight leading-none">
            <span className="text-base sm:text-lg font-extrabold text-white">
              {mounted ? time.formattedHour : "08"}
            </span>
            <span className="text-base sm:text-lg font-light text-white/70">
              {mounted ? time.formattedMinute : "54"}
            </span>
          </div>

          <span className={`mt-1 font-mono text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider leading-none ${dayAccentColor}`}>
            {time.dayName}
          </span>
        </div>
      </button>

      {/* ══ 2. SUBTLE VERTICAL SEPARATOR LINE / COLOR BLEND ══ */}
      <div className="h-9 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent shrink-0 mx-0.5" />

      {/* ══ 3. RIGHT SECTION: SVG ALARM LAUNCHER (ABOVE) + LISTENING TIME (BELOW) ══ */}
      <div className="flex flex-col items-start justify-center gap-1.5 pl-0.5">
        
        {/* Above: Normal Looking SVG Alarm Button */}
        <button
          type="button"
          onClick={handleTimerClick}
          title="Open Focus Timer & Song Alarm"
          aria-label="Open Focus Timer & Alarm"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/20 px-2 py-0.5 text-[10px] font-mono font-medium text-white/75 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <AlarmClock size={11} className="text-white/70" />
          <span>Alarm</span>
        </button>

        {/* Below: Prominent Listening Time Badge with Subtle Mood Glow when Playing */}
        <button
          type="button"
          onClick={handleStatsClick}
          title="Personal Listening Telemetry & Journal"
          aria-label="Personal Listening Stats"
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-extrabold transition-all cursor-pointer active:scale-95 ${listeningGlowStyle}`}
        >
          <Headphones size={11} className={headphoneIconColor} />
          <span className="tabular-nums">{formatListeningDuration(todaySeconds)}</span>
        </button>
      </div>
    </div>
  );
}

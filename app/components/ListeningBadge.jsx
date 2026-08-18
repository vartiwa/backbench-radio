"use client";

import React from "react";
import { formatListeningDuration } from "../lib/listeningStats";

export default function ListeningBadge({
  todaySeconds = 0,
  isPlaying = false,
  onClick,
}) {
  const formatted = formatListeningDuration(todaySeconds);

  return (
    <button
      onClick={onClick}
      type="button"
      title="System Telemetry & Listening Journal (S)"
      aria-label="System Telemetry & Listening Journal"
      className="group relative flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1 font-mono backdrop-blur-xl transition-all duration-300 hover:border-amber-400/60 hover:bg-black/80 hover:shadow-[0_0_18px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 cursor-pointer select-none"
    >
      {/* Live Status LED */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        {isPlaying && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            isPlaying
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : "bg-paper/40"
          }`}
        />
      </span>

      {/* Metric Display */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-[0.2em] text-paper/40 group-hover:text-amber-400/80 transition-colors">
          LOG
        </span>
        <span className="font-mono text-[11px] font-bold tracking-tight text-paper/95">
          {formatted}
        </span>
      </div>
    </button>
  );
}

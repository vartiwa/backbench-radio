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
      title="Personal Listening Stats & History"
      aria-label="Personal Listening Stats & History"
      className="group relative flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-mono backdrop-blur-md transition-all duration-300 hover:border-amber-400/50 hover:bg-black/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 cursor-pointer select-none"
    >
      {/* Active Pulse / Equalizer indicator */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        {isPlaying && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-500 ${
            isPlaying
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : "bg-paper/40"
          }`}
        />
      </span>

      {/* Time Display */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-paper/60 group-hover:text-paper/90 transition-colors">
          🎧
        </span>
        <span className="font-mono text-[11px] text-paper/90 font-medium tracking-tight">
          {formatted}
        </span>
      </div>

      {/* Subtle hover tooltip hint */}
      <span className="hidden sm:inline-block text-[9px] text-amber-400/0 group-hover:text-amber-400/80 transition-all duration-300 font-sans tracking-wide">
        • Stats
      </span>
    </button>
  );
}

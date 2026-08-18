"use client";

import React from "react";
import { Headphones } from "lucide-react";
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
      title="Personal Listening Stats & History (S)"
      aria-label="Personal Listening Stats & History"
      className="group relative flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1 text-xs font-mono backdrop-blur-xl transition-all duration-300 hover:border-amber-400/60 hover:bg-black/80 hover:shadow-[0_0_18px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 cursor-pointer select-none"
    >
      {/* Prominent Listening Time with SVG Icon */}
      <div className="flex items-center gap-1.5">
        <Headphones size={13} className="text-paper/60 group-hover:text-amber-400 transition-colors" />
        <span className="font-mono text-xs font-bold tracking-tight text-paper group-hover:text-amber-300 transition-colors">
          {formatted}
        </span>
      </div>
    </button>
  );
}

"use client";

import { THEMES } from "../lib/theme";

export default function ThemeToggle({ theme, onChange, isExhausted, onToggleExhausted }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md">
      {Object.values(THEMES).map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-pressed={theme === t.id}
          className={`rounded-full px-3 py-1 transition-all duration-300 ${
            theme === t.id
              ? "bg-paper/90 text-ink font-semibold shadow-md"
              : "text-paper/50 hover:text-paper/80"
          }`}
        >
          {t.label}
        </button>
      ))}

      {/* Direct Quick Sanctuary Mode Toggle in Campus Mode */}
      {theme === "campus" && (
        <button
          onClick={onToggleExhausted}
          title="Toggle Sanctuary Mode"
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider transition-all duration-300 ${
            isExhausted
              ? "border border-teal-400/60 bg-teal-900/80 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.5)] scale-105"
              : "border border-white/15 bg-black/50 text-paper/60 hover:text-teal-300 hover:border-teal-500/40"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isExhausted ? "bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf]" : "bg-paper/40"}`} />
          <span>{isExhausted ? "SANCTUARY" : "SANCTUARY"}</span>
        </button>
      )}
    </div>
  );
}

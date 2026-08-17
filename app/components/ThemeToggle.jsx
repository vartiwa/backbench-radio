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
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            isExhausted
              ? "border border-teal-400/70 bg-teal-900/90 text-teal-100 shadow-[0_0_16px_rgba(45,212,191,0.55)] scale-105"
              : "border border-teal-400/35 bg-teal-950/40 text-teal-200/80 shadow-[0_0_10px_rgba(45,212,191,0.2)] hover:text-teal-100 hover:border-teal-400 hover:shadow-[0_0_15px_rgba(45,212,191,0.4)]"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf]" />
          <span>SANCTUARY</span>
        </button>
      )}
    </div>
  );
}

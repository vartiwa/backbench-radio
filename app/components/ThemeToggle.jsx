"use client";

import { THEMES } from "../lib/theme";

export default function ThemeToggle({ theme, onChange }) {
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-0.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md">
      {Object.values(THEMES).map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          aria-pressed={theme === t.id}
          className={`rounded-full px-3 py-1 transition-all duration-300 ${
            theme === t.id
              ? "bg-paper/90 text-ink font-semibold"
              : "text-paper/50 hover:text-paper/80"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const BASE_COUNT = 214;

export default function ListenerCount() {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setCount((prev) => {
        const drift = Math.floor(Math.random() * 5) - 2;
        return Math.max(11, prev + drift);
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-paper/60 tracking-wide" suppressHydrationWarning>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
      <span>{mounted ? count : BASE_COUNT} listening</span>
    </div>
  );
}

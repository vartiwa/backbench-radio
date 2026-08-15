"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function Clock() {
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState({ time: "12:00", period: "AM" });

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const formatted = formatter.format(new Date());
      const [time, period] = formatted.split(" ");
      setParts({ time, period: period ?? "" });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [hour, minute] = parts.time.split(":");

  return (
    <div className="flex items-baseline gap-0.5 font-mono text-sm text-paper/80 tracking-wide" suppressHydrationWarning>
      <span className="tabular-nums">{mounted ? hour : "12"}</span>
      <span className="blink text-paper/50">:</span>
      <span className="tabular-nums">{mounted ? minute : "00"}</span>
      <span className="text-[9px] uppercase text-paper/40 ml-0.5">{mounted ? parts.period : "IST"}</span>
    </div>
  );
}

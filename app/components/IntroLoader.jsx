"use client";

import React, { useState, useEffect, useRef } from "react";
import { Disc, Heart } from "lucide-react";

export default function IntroLoader({ duration = 3000, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = useRef(() => {});
  handleFinish.current = () => {
    setFading(true);
    setTimeout(() => {
      setLoading(false);
      onCompleteRef.current?.();
    }, 500);
  };

  useEffect(() => {
    // 1. Fill progress bar
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 50);

    // 2. Start fade out before end
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(0, duration - 600));

    // 3. Complete and unmount
    const endTimer = setTimeout(() => {
      setLoading(false);
      onCompleteRef.current?.();
    }, duration);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [duration]);

  if (!loading) return null;

  return (
    <div
      onClick={() => handleFinish.current()}
      onTouchStart={() => handleFinish.current()}
      onPointerDown={() => handleFinish.current()}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07070b] text-paper select-none transition-opacity duration-700 ease-out cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Deep Ambient Background Diffuse Halos */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative flex flex-col items-center text-center px-6 max-w-md mx-auto">
        
        {/* Animated Spinning Vinyl Turntable Disc */}
        <div
          className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1c1815] to-[#0c0b0a] border border-white/20 shadow-[0_0_40px_rgba(245,158,11,0.25)] animate-spin"
          style={{ animationDuration: "2.8s", animationTimingFunction: "linear" }}
        >
          {/* Concentric turntable grooves */}
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute inset-3.5 rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute inset-[22px] rounded-full border border-white/[0.06] pointer-events-none" />
          
          <Disc size={36} className="text-white/80" />
          
          {/* Center Spindle & Radiant Core */}
          <div className="absolute h-3.5 w-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_12px_#f59e0b] ring-2 ring-white/60" />
        </div>

        {/* Brand Title */}
        <h1 className="font-display italic text-3xl sm:text-4xl text-white tracking-tight leading-none mb-2">
          Backbench Radio
        </h1>

        {/* Exact Requested Line */}
        <p className="font-display italic text-sm sm:text-base text-amber-200/90 tracking-wide mb-6">
          “click the things and find out”
        </p>

        {/* 3-Second Hairline Progress Track */}
        <div className="w-56 h-[3px] rounded-full bg-white/10 overflow-hidden shadow-inner mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-white shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            style={{
              width: `${progress}%`,
              transition: `width ${duration - 150}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          />
        </div>

        {/* Sub-telemetry status */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
          <Heart size={11} className="text-rose-400 animate-pulse fill-rose-400/50" />
          <span>Tuning Frequency • Our Heart Beat</span>
        </div>

      </div>
    </div>
  );
}

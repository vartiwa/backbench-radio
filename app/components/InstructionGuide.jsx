"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowUpLeft, ArrowDown, X, Headphones, AlarmClock, UploadCloud, Sliders } from "lucide-react";

export default function InstructionGuide({ duration = 5000, isVisible, onDismiss }) {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setFading(false);

      // Start fade out before duration ends
      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, Math.max(0, duration - 600));

      // Dismiss completely at duration
      const dismissTimer = setTimeout(() => {
        setShow(false);
        onDismissRef.current?.();
      }, duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(dismissTimer);
      };
    } else {
      setShow(false);
    }
  }, [isVisible, duration]);

  if (!show) return null;

  const handleManualDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setShow(false);
      onDismissRef.current?.();
    }, 300);
  };

  return (
    <div
      onClick={handleManualDismiss}
      className={`fixed inset-0 z-40 pointer-events-auto cursor-pointer select-none transition-opacity duration-700 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* ── 1. TOP-LEFT POINTER: CLOCK, ALARM & STATS ── */}
      <div className="absolute top-20 left-4 sm:top-24 sm:left-8 z-50 flex flex-col items-start gap-2 animate-bounce-subtle pointer-events-none max-w-[280px]">
        <div className="flex items-center gap-1.5 text-amber-300">
          <ArrowUpLeft size={22} className="animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            Explore Studio Tools
          </span>
        </div>

        <div className="rounded-2xl border border-white/20 bg-black/85 p-3.5 backdrop-blur-2xl text-paper shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <AlarmClock size={13} className="text-amber-400 shrink-0" />
            <span>Alarm & Focus Timer</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <Headphones size={13} className="text-teal-300 shrink-0" />
            <span>Live Listening Stats & Journal</span>
          </div>
          <p className="text-[10px] text-white/50 font-mono mt-0.5 leading-tight">
            Click the top pill to set alarms or check your stats.
          </p>
        </div>
      </div>

      {/* ── 2. BOTTOM POINTER: MUSIC UPLOAD, AMBIENT & MIXER ── */}
      <div className="absolute bottom-28 sm:bottom-24 inset-x-0 mx-auto z-50 flex flex-col items-center gap-2 animate-bounce-subtle pointer-events-none max-w-sm px-4">
        <div className="rounded-2xl border border-purple-500/30 bg-black/85 p-3.5 backdrop-blur-2xl text-paper shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-200">
              <UploadCloud size={13} className="text-[#dcf87a] shrink-0" />
              <span>Upload Your Music</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-200">
              <Sliders size={13} className="text-purple-400 shrink-0" />
              <span>Ambient Sounds</span>
            </div>
          </div>
          <p className="text-[10px] text-white/50 font-mono leading-tight">
            Drag & drop personal MP3s or blend rain, fire & cafe soundscapes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-purple-300">
          <span className="font-mono text-[10px] uppercase tracking-widest font-extrabold bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            Bottom Player Bar
          </span>
          <ArrowDown size={18} className="animate-pulse" />
        </div>
      </div>

      {/* ── 3. TOP-RIGHT DISMISS FLOATING PILL ── */}
      <div className="absolute top-6 right-6 z-50 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleManualDismiss();
          }}
          className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-1 text-[11px] font-mono font-bold text-white/80 hover:text-white backdrop-blur-xl transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <span>Dismiss Guide</span>
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

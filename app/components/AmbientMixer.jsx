"use client";

import React, { useEffect, useState } from "react";
import {
  CloudRain,
  Flame,
  Wind,
  Coffee,
  X,
  VolumeX,
  Sliders,
  Sparkles,
  RotateCcw,
  Volume2,
  Waves,
  Headphones,
  Timer,
  ListMusic,
} from "lucide-react";
import { ambientEngine } from "../lib/ambient";

const SOUNDS = [
  {
    id: "rain",
    name: "Rainstorm",
    subtitle: "Gentle drizzle & drops",
    icon: CloudRain,
    colorHex: "#38bdf8",
    gradFrom: "from-sky-400",
    gradTo: "to-blue-600",
    shadow: "shadow-[0_0_10px_rgba(56,189,248,0.3)]",
  },
  {
    id: "crackle",
    name: "Campfire",
    subtitle: "Warm timber crackle",
    icon: Flame,
    colorHex: "#d97706",
    gradFrom: "from-amber-500",
    gradTo: "to-amber-700",
    shadow: "shadow-[0_0_10px_rgba(217,119,6,0.3)]",
  },
  {
    id: "wind",
    name: "Forest Wind",
    subtitle: "Deep whispering breeze",
    icon: Wind,
    colorHex: "#10b981",
    gradFrom: "from-emerald-400",
    gradTo: "to-teal-700",
    shadow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]",
  },
  {
    id: "cafe",
    name: "Midnight Cafe",
    subtitle: "Subtle espresso murmur",
    icon: Coffee,
    colorHex: "#a78bfa",
    gradFrom: "from-purple-400",
    gradTo: "to-indigo-600",
    shadow: "shadow-[0_0_10px_rgba(167,139,250,0.3)]",
  },
];

export default function AmbientMixer({ isOpen, onClose, onSwitchModal, volumes = {}, onVolumeChange }) {
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (id, val) => {
    setActivePreset(null);
    onVolumeChange(id, val);
    ambientEngine.setVolume(id, val);
  };

  const handleMuteAll = () => {
    setActivePreset(null);
    ambientEngine.stopAll();
    Object.keys(volumes).forEach((id) => onVolumeChange(id, 0));
  };

  const applyPreset = (presetName, levels) => {
    setActivePreset(presetName);
    Object.entries(levels).forEach(([id, val]) => {
      onVolumeChange(id, val);
      ambientEngine.setVolume(id, val);
    });
  };

  const activeSoundsCount = Object.values(volumes).filter((v) => v > 0).length;
  const avgVolumePct = Math.round(
    (Object.values(volumes).reduce((a, b) => a + (b || 0), 0) / Math.max(1, SOUNDS.length)) * 100
  );

  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none"
      onClick={handleBackdropClick}
    >
      {/* Outer Modal Frame with Ambient Purple Glass Glow */}
      <div className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-[2.8rem] border border-purple-500/25 bg-gradient-to-b from-[#13111e]/95 via-[#0e0f16]/95 to-[#0b0b10]/98 p-6 sm:p-9 text-paper shadow-[0_30px_100px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(216,180,254,0.12)]">
        
        {/* Subtle Ambient Outer Diffuse Halos */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcf87a] text-black font-extrabold shadow-[0_0_15px_rgba(220,248,122,0.4)]">
              <Sliders size={16} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Atmosphere & Soundscape Mixer
              </h2>
              <p className="text-xs text-white/50 font-mono">Layered Natural Stems & Binaural Environments</p>
            </div>
          </div>

          {/* Quick Jump Buttons & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Jump to Stats */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("stats")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Headphones size={13} className="text-white/60" />
              <span>Stats & Journal</span>
            </button>

            {/* Jump to Alarm */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("timer")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Timer size={13} className="text-white/60" />
              <span>Alarm & Timer</span>
            </button>

            {/* Jump to Playlists */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("playlist")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ListMusic size={13} className="text-white/60" />
              <span>My Library</span>
            </button>

            <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 font-mono">
              <span>{activeSoundsCount > 0 ? `${activeSoundsCount} Stems Active` : "Muted"}</span>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-paper/80 hover:text-paper transition-all cursor-pointer shadow-sm"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ════ BENTO GRID DASHBOARD ════ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ══ 1. LEFT TALL CARD: AMBIENT PURPLE GLOW & MASTER BLEND GAUGE (Col 1-5) ══ */}
          <div className="lg:col-span-5 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-7 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
            
            {/* Subtle Diffuse Purple Ambient Auras */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-indigo-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/4 h-48 w-48 rounded-full bg-violet-800/15 blur-3xl" />

            <div className="relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#dcf87a] text-[#0f1117] px-3.5 py-1 text-xs font-bold tracking-tight shadow-sm">
                  ATMOSPHERE
                </span>
                <span className="text-xs text-purple-200/50 font-medium">Master Blend Output</span>
              </div>

              {/* Master Output Donut Gauge */}
              <div className="relative my-7 flex items-center justify-center">
                <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 180 180">
                  <defs>
                    <filter id="ambientGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodOpacity="0.35" />
                    </filter>
                    <linearGradient id="ambientGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#dcf87a" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="18"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="url(#ambientGrad)"
                    strokeWidth="18"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * Math.min(100, Math.max(8, avgVolumePct * 2))) / 100}
                    strokeLinecap="round"
                    filter="url(#ambientGlow)"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Big Center Total Duration */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-extrabold text-4xl sm:text-5xl tracking-tight text-white drop-shadow-lg">
                    {activeSoundsCount > 0 ? `${avgVolumePct}%` : "0%"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-purple-200/60 font-mono mt-1 font-semibold">
                    {activeSoundsCount > 0 ? `${activeSoundsCount} ACTIVE STEMS` : "ALL MUTED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Master Action Button */}
            <div className="relative z-10 w-full flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMuteAll}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 py-3 text-xs font-extrabold uppercase tracking-wider text-rose-200 transition-all cursor-pointer shadow-md"
              >
                <VolumeX size={14} />
                <span>Mute All</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("Balanced", { rain: 0.35, crackle: 0.25, wind: 0.2, cafe: 0.15 })}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#dcf87a] text-black hover:bg-[#cbf25b] py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Sparkles size={14} />
                <span>Auto Balance</span>
              </button>
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN BENTO SUB-GRID (Col 6-12) ══ */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Top Sub-Grid: [Neon Mode + White Progress + Purple Streak] & [Channel Sliders Card] */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* 2A. LEFT SUB-COLUMN: Atmosphere Presets */}
              <div className="sm:col-span-5 flex flex-col gap-4">
                
                {/* Electric Lime Preset Card */}
                <div
                  onClick={() => applyPreset("Rainstorm", { rain: 0.75, crackle: 0, wind: 0.45, cafe: 0 })}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activePreset === "Rainstorm"
                      ? "bg-[#dcf87a] text-[#0f1117] ring-2 ring-white/50 scale-[1.02]"
                      : "bg-[#dcf87a] text-[#0f1117] hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                      <CloudRain size={16} />
                    </div>
                    <span className="bg-black/10 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-black">
                      PRESET
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold">Deep Rainstorm</div>
                    <div className="text-xs text-black/70 mt-0.5">Heavy Rain + Wind</div>
                  </div>
                </div>

                {/* Clean White Fireside Preset Card */}
                <div
                  onClick={() => applyPreset("Fireside", { rain: 0, crackle: 0.8, wind: 0.15, cafe: 0.3 })}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activePreset === "Fireside"
                      ? "bg-white text-black ring-2 ring-amber-400 scale-[1.02]"
                      : "bg-white text-black hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-black/70">Cozy Fireside</div>
                    <span className="bg-[#d97706] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Warmth
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-extrabold text-black">Timber Fire</div>
                    <div className="text-xs text-black/60 mt-0.5">Crackle & Cafe Buzz</div>
                  </div>
                </div>

                {/* Purple Zen Sanctuary Card */}
                <div
                  onClick={() => applyPreset("Zen", { rain: 0.25, crackle: 0.1, wind: 0.6, cafe: 0 })}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activePreset === "Zen"
                      ? "bg-[#818cf8] text-white ring-2 ring-white/50 scale-[1.02]"
                      : "bg-[#818cf8] text-white hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80">Sanctuary</span>
                    <Wind size={14} className="text-white/80" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-extrabold text-white">Forest Breeze</div>
                    <div className="text-xs text-white/70 mt-0.5">Deep Wind & Soft Rain</div>
                  </div>
                </div>

              </div>

              {/* 2B. RIGHT SUB-COLUMN: INDIVIDUAL SOUND CHANNELS WITH SUBTLE PURPLE AMBIENT GLOW */}
              <div className="sm:col-span-7 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
                
                {/* Subtle Diffuse Purple Ambient Auras */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full bg-purple-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl" />

                <div className="relative z-10">
                  <span className="rounded-full bg-[#fed7aa] text-black px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-tight shadow-sm">
                    CHANNELS
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-2">Sound Stems</h3>
                  <p className="text-xs text-purple-200/50 mt-0.5">Adjust individual volume levels</p>
                </div>

                {/* Sound Sliders Array */}
                <div className="relative z-10 my-4 space-y-4">
                  {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const volume = volumes[sound.id] || 0;
                    const isActive = volume > 0;

                    return (
                      <div key={sound.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ color: sound.colorHex }}
                              className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${
                                isActive ? sound.shadow : ""
                              }`}
                            >
                              <Icon size={14} />
                            </span>
                            <span className="font-extrabold text-white">{sound.name}</span>
                          </div>

                          <span className="font-mono text-xs font-bold text-white/70">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>

                        {/* Custom Slider Track */}
                        <div className="relative flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => handleChange(sound.id, parseFloat(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none bg-black/50 outline-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${sound.colorHex} 0%, ${sound.colorHex} ${
                                volume * 100
                              }%, rgba(255,255,255,0.08) ${volume * 100}%, rgba(255,255,255,0.08) 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 pt-2 border-t border-purple-400/20 flex items-center justify-between text-xs text-purple-200/60 font-mono">
                  <span>3D BINAURAL FIELD</span>
                  <span className="text-white font-bold">STEREO MATRIX</span>
                </div>
              </div>

            </div>

            {/* ══ BOTTOM ROW: ELECTRIC LIME SOUNDSCAPE FREQUENCY WAVE CARD ══ */}
            <div className="rounded-[2.5rem] bg-[#dcf87a] text-[#0f1117] p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-black">Acoustic Immersion Wave</h4>
                  <p className="text-xs text-black/70 font-medium">Binaural Natural Noise Field</p>
                </div>

                <span className="bg-black text-[#dcf87a] font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                  LIVE SYNTHESIS
                </span>
              </div>

              {/* Wave Visualizer */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-5xl sm:text-6xl font-extrabold text-black leading-none">
                  {activeSoundsCount}<span className="text-2xl font-bold">/4</span>
                </div>

                <div className="flex-1 relative">
                  <svg className="w-full h-14" viewBox="0 0 300 50" fill="none">
                    <path
                      d="M0 35 C 50 40, 100 20, 150 35 C 200 45, 250 15, 300 25"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      fill="transparent"
                    />
                    <path
                      d="M0 30 C 40 32, 80 10, 120 22 C 160 38, 200 8, 250 12 C 280 15, 290 5, 300 2"
                      stroke="#0f1117"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-extrabold text-black/60 uppercase px-1">
                    <span>20Hz</span>
                    <span>100Hz</span>
                    <span>1kHz</span>
                    <span>5kHz</span>
                    <span>20kHz</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ══ BOTTOM ACTION BAR ══ */}
        <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between font-mono">
          <span className="text-xs text-white/50 flex items-center gap-2">
            <Volume2 size={14} className="text-[#dcf87a]" />
            <span>{activeSoundsCount > 0 ? "Atmosphere active with radio stream" : "Ambient engine standby"}</span>
          </span>

          <button
            onClick={onClose}
            type="button"
            className="rounded-full bg-white text-black hover:bg-white/90 px-8 py-2.5 text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer shadow-lg"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

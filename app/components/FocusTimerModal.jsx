"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Timer,
  Moon,
  Coffee,
  Volume2,
  Clock,
  ArrowUpRight,
  Headphones,
  Sliders,
  ListMusic,
} from "lucide-react";
import { ALARM_SOUND_OPTIONS, playAlarmSound, stopAlarmPreview } from "../lib/alarmEngine";

export default function FocusTimerModal({
  isOpen,
  onClose,
  onSwitchModal,
  timerState, // { mode, timeLeft, totalDuration, isRunning, round, selectedAlarmId }
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onUpdateAlarmSound,
}) {
  const [activeTab, setActiveTab] = useState("pomo"); // 'pomo' | 'custom' | 'sleep'
  const [customMinutes, setCustomMinutes] = useState(30);
  const [selectedAlarm, setSelectedAlarm] = useState("chime-bell");
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (timerState?.selectedAlarmId) {
      setSelectedAlarm(timerState.selectedAlarmId);
    }
  }, [timerState?.selectedAlarmId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        stopAlarmPreview();
        setIsPreviewing(false);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDigital = (totalSec = 0) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleTestAlarm = () => {
    if (isPreviewing) {
      stopAlarmPreview();
      setIsPreviewing(false);
    } else {
      setIsPreviewing(true);
      playAlarmSound(selectedAlarm);
      setTimeout(() => setIsPreviewing(false), 5000);
    }
  };

  const handleAlarmChange = (e) => {
    const id = e.target.value;
    setSelectedAlarm(id);
    onUpdateAlarmSound?.(id);
    if (isPreviewing) {
      stopAlarmPreview();
      setIsPreviewing(false);
    }
  };

  const currentDuration = timerState?.totalDuration || 25 * 60;
  const currentLeft = timerState?.timeLeft || 0;
  const progressPercent = currentDuration > 0 ? (currentLeft / currentDuration) * 100 : 0;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAlarmPreview();
          setIsPreviewing(false);
          onClose();
        }
      }}
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
              <Timer size={16} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Focus Engine & Song Alarm Hub
              </h2>
              <p className="text-xs text-white/50 font-mono">Pomodoro Cycles & Transitions</p>
            </div>
          </div>

          {/* Quick Jump Buttons & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Jump to Stats */}
            <button
              type="button"
              onClick={() => {
                stopAlarmPreview();
                setIsPreviewing(false);
                onSwitchModal?.("stats");
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Headphones size={13} className="text-white/60" />
              <span>Stats & Journal</span>
            </button>

            {/* Jump to Ambient */}
            <button
              type="button"
              onClick={() => {
                stopAlarmPreview();
                setIsPreviewing(false);
                onSwitchModal?.("ambient");
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Sliders size={13} className="text-white/60" />
              <span>Ambient Sound</span>
            </button>

            {/* Jump to Playlists */}
            <button
              type="button"
              onClick={() => {
                stopAlarmPreview();
                setIsPreviewing(false);
                onSwitchModal?.("playlist");
              }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ListMusic size={13} className="text-white/60" />
              <span>My Library</span>
            </button>

            <div className="hidden md:flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 font-mono">
              <span>{timerState?.isRunning ? "Timer Active" : "Idle"}</span>
            </div>

            <button
              onClick={() => {
                stopAlarmPreview();
                setIsPreviewing(false);
                onClose();
              }}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-paper/80 hover:text-paper transition-all cursor-pointer shadow-sm"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ════ EXACT BENTO GRID LAYOUT ════ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* ══ 1. LEFT TALL CARD: SUBTLE PURPLE AMBIENT GLOW & COUNTDOWN DONUT (Col 1-5) ══ */}
          <div className="lg:col-span-5 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-7 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
            
            {/* Subtle Diffuse Purple Ambient Auras */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-indigo-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/4 h-48 w-48 rounded-full bg-violet-800/15 blur-3xl" />

            <div className="relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#dcf87a] text-[#0f1117] px-3.5 py-1 text-xs font-bold tracking-tight shadow-sm">
                  {activeTab === "pomo" ? `ROUND 0${timerState?.round || 1}/04` : "PRECISION TIMER"}
                </span>
                <span className="text-xs text-purple-200/50 font-medium">Focus Mode</span>
              </div>

              {/* Segmented Countdown Ring */}
              <div className="relative my-7 flex items-center justify-center">
                <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 180 180">
                  <defs>
                    <filter id="timerGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodOpacity="0.35" />
                    </filter>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
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
                    stroke={timerState?.mode === "break" ? "#2dd4bf" : "url(#timerGrad)"}
                    strokeWidth="18"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (circumference * progressPercent) / 100}
                    strokeLinecap="round"
                    filter="url(#timerGlow)"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Big Center Countdown */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-extrabold text-4xl sm:text-5xl tracking-tight text-white drop-shadow-lg">
                    {timerState?.isRunning || timerState?.timeLeft > 0
                      ? formatDigital(timerState.timeLeft)
                      : activeTab === "pomo"
                      ? "25:00"
                      : activeTab === "custom"
                      ? `${String(customMinutes).padStart(2, "0")}:00`
                      : "30:00"}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-purple-200/60 font-mono mt-1 font-semibold">
                    {timerState?.isRunning
                      ? timerState.mode === "break"
                        ? "Break Session"
                        : "Deep Focus Active"
                      : "Ready to Start"}
                  </span>
                </div>
              </div>
            </div>

            {/* Master Action Button */}
            <div className="relative z-10 w-full">
              {!timerState?.isRunning ? (
                <button
                  type="button"
                  onClick={() => {
                    const seconds =
                      activeTab === "pomo"
                        ? 25 * 60
                        : activeTab === "custom"
                        ? customMinutes * 60
                        : 30 * 60;
                    onStartTimer(seconds, activeTab === "pomo" ? "focus" : activeTab, selectedAlarm);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#dcf87a] text-black hover:bg-[#cbf25b] py-3.5 text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer shadow-[0_0_20px_rgba(220,248,122,0.3)] hover:scale-[1.02] active:scale-95"
                >
                  <Play size={15} />
                  <span>Start {activeTab === "pomo" ? "Focus Session" : activeTab === "custom" ? "Custom Alarm" : "Sleep Timer"}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onPauseTimer}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Pause size={14} />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopTimer}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-6 py-3 text-xs font-extrabold uppercase tracking-wider hover:bg-rose-500/30 transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN BENTO SUB-GRID (Col 6-12) ══ */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Top Sub-Grid: [Neon Mode Card + White Preset + Purple Streak] & [Dark Presets] */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* 2A. LEFT SUB-COLUMN: Mode Switches */}
              <div className="sm:col-span-5 flex flex-col gap-4">
                
                {/* Electric Lime Mode Card */}
                <div
                  onClick={() => setActiveTab("pomo")}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activeTab === "pomo"
                      ? "bg-[#dcf87a] text-[#0f1117] ring-2 ring-white/50"
                      : "bg-[#1d1f27] text-white hover:bg-[#252833]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${activeTab === "pomo" ? "bg-black text-white" : "bg-white/10 text-white"}`}>
                      <Timer size={16} />
                    </div>
                    <span className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 ${activeTab === "pomo" ? "bg-black/10 text-black" : "bg-white/10 text-white/70"}`}>
                      25/5 MIN
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold">Pomodoro</div>
                    <div className={`text-xs mt-0.5 ${activeTab === "pomo" ? "text-black/70" : "text-white/50"}`}>
                      Classic Focus Cycles
                    </div>
                  </div>
                </div>

                {/* Clean White Alarm Card */}
                <div
                  onClick={() => setActiveTab("custom")}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activeTab === "custom"
                      ? "bg-white text-black ring-2 ring-teal-400"
                      : "bg-[#1d1f27] text-white hover:bg-[#252833]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-black/70">Custom Timer</div>
                    <span className="bg-[#2dd4bf] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Any Time
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-extrabold text-black">Song Alarm</div>
                    <div className="text-xs text-black/60 mt-0.5">Rings With Selected Track</div>
                  </div>
                </div>

                {/* Purple Sleep Card */}
                <div
                  onClick={() => setActiveTab("sleep")}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                    activeTab === "sleep"
                      ? "bg-[#818cf8] text-white ring-2 ring-white/50"
                      : "bg-[#1d1f27] text-white hover:bg-[#252833]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80">Sleep Mode</span>
                    <Moon size={14} className="text-white/80" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-extrabold text-white">Auto Fadeout</div>
                    <div className="text-xs text-white/70 mt-0.5">Pauses When You Sleep</div>
                  </div>
                </div>

              </div>

              {/* 2B. RIGHT SUB-COLUMN: INTERVAL PRESETS CARD WITH SUBTLE PURPLE AMBIENT GLOW */}
              <div className="sm:col-span-7 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
                
                {/* Subtle Diffuse Purple Ambient Auras */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full bg-purple-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl" />

                <div className="relative z-10">
                  <span className="rounded-full bg-[#fed7aa] text-black px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-tight shadow-sm">
                    INTERVALS
                  </span>
                  <h3 className="text-2xl font-extrabold text-white mt-2">Quick Presets</h3>
                  <p className="text-xs text-purple-200/50 mt-0.5">Tap to select interval duration</p>
                </div>

                {/* Presets Array */}
                <div className="relative z-10 my-4 grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onStartTimer(25 * 60, "focus", selectedAlarm)}
                    className="p-3.5 rounded-2xl bg-[#818cf8] text-white hover:bg-[#a5b4fc] transition-all cursor-pointer flex flex-col items-center shadow-lg"
                  >
                    <Timer size={16} className="mb-1 text-white" />
                    <div className="font-extrabold text-base">25m</div>
                    <div className="text-[10px] text-white/80">Focus</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(5 * 60, "break", selectedAlarm)}
                    className="p-3.5 rounded-2xl bg-[#2dd4bf] text-black hover:bg-[#5eead4] transition-all cursor-pointer flex flex-col items-center shadow-lg"
                  >
                    <Coffee size={16} className="mb-1 text-black" />
                    <div className="font-extrabold text-base">5m</div>
                    <div className="text-[10px] text-black/80">Break</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(15 * 60, "break", selectedAlarm)}
                    className="p-3.5 rounded-2xl bg-[#fed7aa] text-black hover:bg-[#fde68a] transition-all cursor-pointer flex flex-col items-center shadow-lg"
                  >
                    <Moon size={16} className="mb-1 text-black" />
                    <div className="font-extrabold text-base">15m</div>
                    <div className="text-[10px] text-black/80">Long</div>
                  </button>
                </div>

                {/* Custom Time Picker */}
                <div className="relative z-10 pt-3 border-t border-purple-400/20">
                  <div className="flex items-center justify-between text-xs text-purple-200/60 mb-2 font-medium">
                    <span>Custom Sprint</span>
                    <span className="font-bold text-[#dcf87a]">{customMinutes} Minutes</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[10, 20, 30, 45, 60, 90].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMinutes(m)}
                        className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          customMinutes === m
                            ? "bg-[#dcf87a] text-black shadow-md"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ══ BOTTOM ROW: ELECTRIC LIME ALARM SONG SELECTOR CARD ══ */}
            <div className="rounded-[2.5rem] bg-[#dcf87a] text-[#0f1117] p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
                    <Bell size={14} />
                  </span>
                  <h4 className="text-base font-extrabold text-black">Alarm Song & Chime Trigger</h4>
                </div>

                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isPreviewing
                      ? "bg-black text-[#dcf87a] shadow-lg animate-pulse"
                      : "bg-black/10 text-black hover:bg-black/20"
                  }`}
                >
                  <Volume2 size={13} />
                  <span>{isPreviewing ? "Playing..." : "Test Audio"}</span>
                </button>
              </div>

              {/* Dropdown Select */}
              <select
                value={selectedAlarm}
                onChange={handleAlarmChange}
                className="w-full rounded-2xl border border-black/15 bg-black text-white px-4 py-3.5 text-xs font-semibold focus:outline-none cursor-pointer shadow-lg"
              >
                <optgroup label="Acoustic Chimes">
                  {ALARM_SOUND_OPTIONS.filter((o) => o.isChime).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Backbench Radio Songs">
                  {ALARM_SOUND_OPTIONS.filter((o) => !o.isChime).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

          </div>

        </div>

        {/* ══ BOTTOM ACTION BAR ══ */}
        <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between font-mono">
          <span className="text-xs text-white/50 flex items-center gap-2">
            <Clock size={14} className="text-[#dcf87a]" />
            <span>{timerState?.isRunning ? "Timing in background" : "Engine ready"}</span>
          </span>

          <button
            onClick={() => {
              stopAlarmPreview();
              setIsPreviewing(false);
              onClose();
            }}
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

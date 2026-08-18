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
  Music,
  Power,
  Layers,
  ChevronRight,
} from "lucide-react";
import { ALARM_SOUND_OPTIONS, playAlarmSound, stopAlarmPreview } from "../lib/alarmEngine";

export default function FocusTimerModal({
  isOpen,
  onClose,
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
  const gaugeArcLength = 220;
  const gaugeOffset = gaugeArcLength - (gaugeArcLength * progressPercent) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAlarmPreview();
          setIsPreviewing(false);
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-[2.5rem] border border-white/15 bg-[#17181f]/85 p-6 sm:p-8 text-paper shadow-[0_30px_100px_rgba(0,0,0,0.9)] backdrop-blur-3xl font-sans">
        
        {/* ══ TOP FLOATING VISIONOS CAPSULE NAVIGATION BAR ══ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          {/* Mode Selector Capsule Tabs */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveTab("pomo")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "pomo"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Timer size={13} className={activeTab === "pomo" ? "text-amber-300" : "opacity-60"} />
              <span>Pomodoro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "custom"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Bell size={13} className={activeTab === "custom" ? "text-teal-300" : "opacity-60"} />
              <span>Alarm</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sleep")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "sleep"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Moon size={13} className={activeTab === "sleep" ? "text-sky-300" : "opacity-60"} />
              <span>Sleep</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-paper/60">
              <span
                className={`h-2 w-2 rounded-full ${
                  timerState?.isRunning ? "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" : "bg-paper/30"
                }`}
              />
              <span className="font-mono text-[11px]">{timerState?.isRunning ? "Active Timer" : "Idle"}</span>
            </div>

            <button
              onClick={() => {
                stopAlarmPreview();
                setIsPreviewing(false);
                onClose();
              }}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-paper/80 hover:text-paper transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ══ BENTO GRID SPATIAL INTERFACE ══ */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* ════ LEFT COLUMN: VISIONOS RADIAL DIAL GAUGE CARD (Col 1-6) ════ */}
          <div className="md:col-span-6 rounded-[2.5rem] bg-[#1d1e26]/90 border border-white/15 p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden backdrop-blur-2xl">
            
            <div className="w-full flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold">
                Timing Engine
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-paper/60 font-mono">
                {activeTab === "pomo" ? `Round 0${timerState?.round || 1} / 04` : "Precision Countdown"}
              </span>
            </div>

            {/* VisionOS Arc Gauge Dial */}
            <div className="relative my-4 flex items-center justify-center h-48 w-48">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="timerArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                  strokeDasharray="280"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                />

                {/* Active Gradient Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="url(#timerArcGrad)"
                  strokeWidth="12"
                  strokeDasharray="280"
                  strokeDashoffset={280 - (220 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>

              {/* Inner Center Digital Time & Power Readout */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/15 text-paper mb-1 shadow-inner">
                  <Power size={16} className={timerState?.isRunning ? "text-amber-400" : "text-paper/60"} />
                </div>
                <span className="font-mono text-3xl font-extrabold tracking-tight text-paper drop-shadow-md">
                  {timerState?.isRunning || timerState?.timeLeft > 0
                    ? formatDigital(timerState.timeLeft)
                    : activeTab === "pomo"
                    ? "25:00"
                    : activeTab === "custom"
                    ? `${String(customMinutes).padStart(2, "0")}:00`
                    : "30:00"}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-paper/40 mt-0.5">
                  {timerState?.isRunning
                    ? timerState.mode === "break"
                      ? "Break Time"
                      : "Focus Session"
                    : "Ready to Launch"}
                </span>
              </div>
            </div>

            {/* Master Action Buttons */}
            <div className="w-full flex items-center gap-2.5 mt-2">
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
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 py-2.5 text-xs font-bold uppercase tracking-wider text-paper transition-all cursor-pointer shadow-lg"
                >
                  <Play size={13} />
                  <span>Start {activeTab === "pomo" ? "Focus" : activeTab === "custom" ? "Alarm" : "Sleep"}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onPauseTimer}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-paper hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <Pause size={13} />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopTimer}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* ════ RIGHT COLUMN: PRESETS & SONG ALARM SELECTOR (Col 7-12) ════ */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* 1. Presets Card (Matching Reference Movie Time / Smart TV Bento Cards) */}
            {activeTab === "pomo" && (
              <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl">
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold block mb-3">
                  Interval Presets
                </span>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => onStartTimer(25 * 60, "focus", selectedAlarm)}
                    className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center shadow-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/15 text-amber-300 mb-1.5">
                      <Timer size={14} />
                    </div>
                    <div className="font-bold text-paper">25 Min</div>
                    <div className="text-[10px] text-paper/40 mt-0.5">Focus Mode</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(5 * 60, "break", selectedAlarm)}
                    className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-teal-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center shadow-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400/15 text-teal-300 mb-1.5">
                      <Coffee size={14} />
                    </div>
                    <div className="font-bold text-paper">05 Min</div>
                    <div className="text-[10px] text-paper/40 mt-0.5">Short Break</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(15 * 60, "break", selectedAlarm)}
                    className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center shadow-sm"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-sky-300 mb-1.5">
                      <Moon size={14} />
                    </div>
                    <div className="font-bold text-paper">15 Min</div>
                    <div className="text-[10px] text-paper/40 mt-0.5">Long Break</div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl">
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold block mb-3">
                  Select Custom Duration
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[10, 20, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMinutes(m)}
                      className={`py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        customMinutes === m
                          ? "border-teal-400/60 bg-teal-400/20 text-teal-200 shadow-sm"
                          : "border-white/10 bg-white/5 text-paper/60 hover:text-paper hover:bg-white/10"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sleep" && (
              <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl">
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold block mb-3">
                  Auto Fadeout Interval
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {[15, 30, 45, 60, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onStartTimer(m * 60, "sleep", selectedAlarm)}
                      className="py-3 rounded-2xl border border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-white/10 transition-all cursor-pointer font-bold text-paper/80"
                    >
                      {m >= 60 ? `${m / 60}h` : `${m}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Alarm Song Trigger Selector Card */}
            <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl font-mono">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[11px] uppercase tracking-wider text-paper/50 font-semibold flex items-center gap-1.5">
                  <Bell size={13} className="text-amber-400" />
                  <span>Alarm Audio Trigger</span>
                </span>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                    isPreviewing
                      ? "border-amber-400 bg-amber-400/25 text-amber-300 font-bold animate-pulse"
                      : "border-white/15 bg-white/5 text-paper/70 hover:border-white/30 hover:text-paper"
                  }`}
                >
                  <Volume2 size={11} />
                  <span>{isPreviewing ? "Playing..." : "Test Audio"}</span>
                </button>
              </div>

              {/* Clean Dropdown */}
              <select
                value={selectedAlarm}
                onChange={handleAlarmChange}
                className="w-full rounded-2xl border border-white/15 bg-[#12131a] px-4 py-3 text-xs text-paper/90 focus:border-amber-400/60 focus:outline-none cursor-pointer"
              >
                <optgroup label="Acoustic Chimes">
                  {ALARM_SOUND_OPTIONS.filter((o) => o.isChime).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Radio Tracks">
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

        {/* ══ BOTTOM CONTROLS ══ */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
          <span className="text-[11px] text-paper/40 flex items-center gap-1.5">
            <Clock size={12} />
            <span>{timerState?.isRunning ? "Timing active in background" : "System ready"}</span>
          </span>

          <button
            onClick={() => {
              stopAlarmPreview();
              setIsPreviewing(false);
              onClose();
            }}
            type="button"
            className="rounded-full bg-white/15 hover:bg-white/25 px-7 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-all cursor-pointer font-bold border border-white/10"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

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
  CheckCircle2,
  Layers,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAlarmPreview();
          setIsPreviewing(false);
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0f15] p-5 sm:p-8 text-paper shadow-[0_25px_70px_rgba(0,0,0,0.9)] font-mono">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-paper/70">
              <Timer size={15} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-paper/40 font-semibold block">
                TIMING & TRANSITIONS
              </span>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-paper/90">
                Focus Timer & Song Alarm Hub
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopAlarmPreview();
              setIsPreviewing(false);
              onClose();
            }}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-paper/70 hover:text-paper transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mode Selector Tabs (Clean Muted SVGs) */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-1 rounded-xl border border-white/10 bg-black/40 text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("pomo")}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-semibold ${
              activeTab === "pomo"
                ? "bg-white/10 border border-white/15 text-paper shadow-sm"
                : "text-paper/40 hover:text-paper hover:bg-white/5"
            }`}
          >
            <Timer size={13} className={activeTab === "pomo" ? "text-amber-400" : "opacity-60"} />
            <span>Pomodoro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-semibold ${
              activeTab === "custom"
                ? "bg-white/10 border border-white/15 text-paper shadow-sm"
                : "text-paper/40 hover:text-paper hover:bg-white/5"
            }`}
          >
            <Bell size={13} className={activeTab === "custom" ? "text-teal-400" : "opacity-60"} />
            <span>Alarm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sleep")}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-semibold ${
              activeTab === "sleep"
                ? "bg-white/10 border border-white/15 text-paper shadow-sm"
                : "text-paper/40 hover:text-paper hover:bg-white/5"
            }`}
          >
            <Moon size={13} className={activeTab === "sleep" ? "text-sky-400" : "opacity-60"} />
            <span>Sleep</span>
          </button>
        </div>

        {/* ── BENTO GRID LAYOUT ── */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* ══ 1. LEFT CARD: COUNTDOWN RING & CONTROLS (Col 1-6) ══ */}
          <div className="md:col-span-6 rounded-2xl bg-[#13151e] border border-white/10 p-6 flex flex-col items-center justify-center relative shadow-lg">
            
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center h-44 w-44 my-1">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-white/5"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-1000 ${
                    timerState?.mode === "break"
                      ? "stroke-teal-500 opacity-85"
                      : "stroke-amber-500 opacity-90"
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Digital Readout */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-paper">
                  {timerState?.isRunning || timerState?.timeLeft > 0
                    ? formatDigital(timerState.timeLeft)
                    : activeTab === "pomo"
                    ? "25:00"
                    : activeTab === "custom"
                    ? `${String(customMinutes).padStart(2, "0")}:00`
                    : "30:00"}
                </span>

                <span className="mt-1 text-[9px] uppercase tracking-widest text-paper/40 flex items-center gap-1">
                  {timerState?.isRunning ? (
                    timerState.mode === "break" ? (
                      <>
                        <Coffee size={10} className="text-teal-400" />
                        <span>Break Time</span>
                      </>
                    ) : (
                      <>
                        <Timer size={10} className="text-amber-400" />
                        <span>Focus Active</span>
                      </>
                    )
                  ) : (
                    <span>Standby</span>
                  )}
                </span>

                {activeTab === "pomo" && (
                  <span className="mt-1 text-[9px] text-paper/50 font-medium">
                    Round 0{timerState?.round || 1} / 04
                  </span>
                )}
              </div>
            </div>

            {/* Master Action Buttons */}
            <div className="mt-4 flex items-center gap-2.5 w-full">
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
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-200 hover:bg-amber-500/25 transition-all cursor-pointer"
                >
                  <Play size={13} />
                  <span>Start {activeTab === "pomo" ? "Focus" : activeTab === "custom" ? "Alarm" : "Sleep"}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onPauseTimer}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-paper hover:bg-white/15 transition-all cursor-pointer"
                  >
                    <Pause size={13} />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={onStopTimer}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ══ 2. RIGHT CARD: PRESETS & SONG ALARM SELECTOR (Col 7-12) ══ */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* Presets Sub-Card */}
            {activeTab === "pomo" && (
              <div className="rounded-2xl bg-[#13151e] border border-white/10 p-4 shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-paper/40 font-semibold block mb-2.5">
                  Pomodoro Intervals
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => onStartTimer(25 * 60, "focus", selectedAlarm)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center"
                  >
                    <Timer size={14} className="text-amber-400/80 mb-1" />
                    <div className="font-bold text-paper">25 Min</div>
                    <div className="text-[9px] text-paper/40 mt-0.5">Focus</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(5 * 60, "break", selectedAlarm)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:border-teal-400/40 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center"
                  >
                    <Coffee size={14} className="text-teal-400/80 mb-1" />
                    <div className="font-bold text-paper">05 Min</div>
                    <div className="text-[9px] text-paper/40 mt-0.5">Short Break</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStartTimer(15 * 60, "break", selectedAlarm)}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:border-sky-400/40 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center"
                  >
                    <Moon size={14} className="text-sky-400/80 mb-1" />
                    <div className="font-bold text-paper">15 Min</div>
                    <div className="text-[9px] text-paper/40 mt-0.5">Long Break</div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "custom" && (
              <div className="rounded-2xl bg-[#13151e] border border-white/10 p-4 shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-paper/40 font-semibold block mb-2.5">
                  Alarm Durations
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[10, 20, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCustomMinutes(m)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        customMinutes === m
                          ? "border-teal-500/50 bg-teal-500/15 text-teal-200"
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
              <div className="rounded-2xl bg-[#13151e] border border-white/10 p-4 shadow-lg">
                <span className="text-[10px] uppercase tracking-widest text-paper/40 font-semibold block mb-2.5">
                  Auto-Fade Intervals
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {[15, 30, 45, 60, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onStartTimer(m * 60, "sleep", selectedAlarm)}
                      className="py-2.5 rounded-lg border border-white/10 bg-white/5 hover:border-sky-400/40 hover:bg-white/10 transition-all cursor-pointer font-bold text-paper/80"
                    >
                      {m >= 60 ? `${m / 60}h` : `${m}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alarm Audio / Song Trigger Selector Card */}
            <div className="rounded-2xl bg-[#13151e] border border-white/10 p-4 shadow-lg">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-paper/50 mb-2">
                <span className="flex items-center gap-1.5">
                  <Bell size={12} className="text-amber-400/80" />
                  <span>Alarm Song / Chime</span>
                </span>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                    isPreviewing
                      ? "border-amber-400 bg-amber-400/20 text-amber-300 font-bold animate-pulse"
                      : "border-white/10 bg-white/5 text-paper/60 hover:border-white/20 hover:text-paper"
                  }`}
                >
                  <Volume2 size={10} />
                  <span>{isPreviewing ? "Playing..." : "Test Audio"}</span>
                </button>
              </div>

              {/* Clean Dropdown */}
              <select
                value={selectedAlarm}
                onChange={handleAlarmChange}
                className="w-full rounded-xl border border-white/15 bg-[#0e1017] px-3 py-2.5 text-xs text-paper/90 focus:border-amber-400/60 focus:outline-none cursor-pointer"
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

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-paper/40 flex items-center gap-1.5">
            <Clock size={11} />
            <span>{timerState?.isRunning ? "Timing in background" : "Ready"}</span>
          </span>

          <button
            onClick={() => {
              stopAlarmPreview();
              setIsPreviewing(false);
              onClose();
            }}
            type="button"
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-6 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-all cursor-pointer font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

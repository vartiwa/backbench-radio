"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Bell, Timer, Moon, Coffee, Volume2, Sparkles } from "lucide-react";
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

  // Sync selected alarm from prop if available
  useEffect(() => {
    if (timerState?.selectedAlarmId) {
      setSelectedAlarm(timerState.selectedAlarmId);
    }
  }, [timerState?.selectedAlarmId]);

  // Handle ESC to close
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAlarmPreview();
          setIsPreviewing(false);
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0a0c10]/95 text-paper shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-6 sm:p-8 transition-all font-mono">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-400">
              <Timer size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                  TIMING // ALARM CORE
                </span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="text-[10px] text-paper/40 tracking-wider uppercase">
                  DECK v2.4
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-paper/95">
                Focus Engine & Song Alarm Hub
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-paper/60 hover:text-paper hover:bg-white/15 hover:border-white/25 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-2 p-1 rounded-xl border border-white/10 bg-black/50 text-[11px] uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab("pomo")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "pomo"
                ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "text-paper/50 hover:text-paper hover:bg-white/5"
            }`}
          >
            <span>🍅 POMODORO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "custom"
                ? "bg-teal-400/15 border border-teal-400/40 text-teal-300 font-bold shadow-[0_0_12px_rgba(45,212,191,0.2)]"
                : "text-paper/50 hover:text-paper hover:bg-white/5"
            }`}
          >
            <Bell size={12} />
            <span>ALARM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sleep")}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sleep"
                ? "bg-sky-400/15 border border-sky-400/40 text-sky-300 font-bold shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                : "text-paper/50 hover:text-paper hover:bg-white/5"
            }`}
          >
            <Moon size={12} />
            <span>SLEEP</span>
          </button>
        </div>

        {/* Active Countdown & Visual Ring Display */}
        <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Circular Progress Meter */}
          <div className="relative flex items-center justify-center h-48 w-48 my-2">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-white/10"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-all duration-1000 ${
                  timerState?.mode === "break"
                    ? "stroke-teal-400 shadow-[0_0_10px_#2dd4bf]"
                    : "stroke-amber-400 shadow-[0_0_12px_#f59e0b]"
                }`}
                strokeWidth="4"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Digital Readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-paper drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                {timerState?.isRunning || timerState?.timeLeft > 0
                  ? formatDigital(timerState.timeLeft)
                  : activeTab === "pomo"
                  ? "25:00"
                  : activeTab === "custom"
                  ? `${String(customMinutes).padStart(2, "0")}:00`
                  : "30:00"}
              </span>

              <span className="mt-1 text-[9px] uppercase tracking-[0.2em] text-paper/50">
                {timerState?.isRunning
                  ? timerState.mode === "break"
                    ? "☕ BREAK TIME"
                    : "⚡ FOCUS ACTIVE"
                  : "READY TO START"}
              </span>

              {activeTab === "pomo" && (
                <span className="mt-0.5 text-[9px] text-amber-400/80 font-bold">
                  ROUND [0{timerState?.round || 1}/04]
                </span>
              )}
            </div>
          </div>

          {/* Master Control Buttons */}
          <div className="mt-4 flex items-center gap-3">
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
                className="flex items-center gap-2 rounded-lg border border-amber-400/60 bg-amber-500/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-amber-300 hover:bg-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
              >
                <Play size={13} />
                <span>START {activeTab === "pomo" ? "FOCUS" : activeTab === "custom" ? "ALARM" : "TIMER"}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onPauseTimer}
                  className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-paper hover:bg-white/20 transition-all cursor-pointer"
                >
                  <Pause size={13} />
                  <span>PAUSE</span>
                </button>
                <button
                  type="button"
                  onClick={onStopTimer}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-rose-300 hover:bg-rose-500/25 transition-all cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>ABORT</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Specific Preset Configurations */}
        {activeTab === "pomo" && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-widest text-paper/50 mb-3">
              PRESET POMODORO INTERVALS
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => onStartTimer(25 * 60, "focus", selectedAlarm)}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-950/20 transition-all cursor-pointer"
              >
                <div className="text-amber-300 font-bold">25 MIN</div>
                <div className="text-[9px] text-paper/40 mt-0.5">Focus Session</div>
              </button>

              <button
                type="button"
                onClick={() => onStartTimer(5 * 60, "break", selectedAlarm)}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-teal-400/50 hover:bg-teal-950/20 transition-all cursor-pointer"
              >
                <div className="text-teal-300 font-bold">05 MIN</div>
                <div className="text-[9px] text-paper/40 mt-0.5">Short Break</div>
              </button>

              <button
                type="button"
                onClick={() => onStartTimer(15 * 60, "break", selectedAlarm)}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-sky-950/20 transition-all cursor-pointer"
              >
                <div className="text-sky-300 font-bold">15 MIN</div>
                <div className="text-[9px] text-paper/40 mt-0.5">Long Break</div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "custom" && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-widest text-paper/50 mb-3">
              CUSTOM TIMER DURATION
            </div>
            <div className="flex items-center gap-2 mb-3">
              {[10, 20, 30, 45, 60, 90].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomMinutes(m)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    customMinutes === m
                      ? "border-teal-400/60 bg-teal-950/40 text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.2)]"
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
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-widest text-paper/50 mb-3">
              SLEEP TIMER FADEOUT INTERVALS
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[15, 30, 45, 60, 120].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onStartTimer(m * 60, "sleep", selectedAlarm)}
                  className="py-2.5 rounded-lg border border-white/10 bg-white/5 hover:border-sky-400/50 hover:bg-sky-950/20 transition-all cursor-pointer font-bold text-sky-200"
                >
                  {m >= 60 ? `${m / 60}h` : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Alarm Song / Chime Selector */}
        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-paper/60 mb-2">
            <span className="flex items-center gap-1.5">
              <Bell size={12} className="text-amber-400" />
              <span>Alarm Sound / Chime Trigger</span>
            </span>
            <button
              type="button"
              onClick={handleTestAlarm}
              className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                isPreviewing
                  ? "border-amber-400 bg-amber-400 text-ink font-bold animate-pulse"
                  : "border-white/15 bg-white/5 text-paper/70 hover:border-amber-400/50 hover:text-amber-300"
              }`}
            >
              {isPreviewing ? "PLAYING PREVIEW..." : "TEST ALARM SOUND"}
            </button>
          </div>

          {/* Select Dropdown */}
          <select
            value={selectedAlarm}
            onChange={handleAlarmChange}
            className="w-full rounded-lg border border-white/15 bg-[#12151c] px-3.5 py-2.5 text-xs text-paper/90 focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <optgroup label="Acoustic Chimes & Bells">
              {ALARM_SOUND_OPTIONS.filter((o) => o.isChime).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Backbench Radio Songs (Full Tracks)">
              {ALARM_SOUND_OPTIONS.filter((o) => !o.isChime).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-paper/40">
            {timerState?.isRunning ? "TIMING IN BACKGROUND" : "SYSTEM READY"}
          </span>

          <button
            onClick={() => {
              stopAlarmPreview();
              setIsPreviewing(false);
              onClose();
            }}
            type="button"
            className="rounded-lg border border-white/20 bg-white/10 px-5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-white/20 transition-all cursor-pointer font-semibold"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

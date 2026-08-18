"use client";

import React, { useEffect, useState } from "react";
import { X, RotateCcw, Activity, Disc3, Radio, ShieldCheck } from "lucide-react";
import {
  getListeningStats,
  formatListeningDuration,
  getLast7DaysHistory,
  getListeningMilestones,
} from "../lib/listeningStats";

export default function ListeningStatsModal({
  isOpen,
  onClose,
  todaySeconds = 0,
  isPlaying = false,
  currentTheme = "campus",
}) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Refresh stats whenever modal opens or todaySeconds updates
  useEffect(() => {
    if (isOpen) {
      const data = getListeningStats();
      setStats(data);
      setHistory(getLast7DaysHistory());
      setMilestones(getListeningMilestones(data.totalSeconds));
    }
  }, [isOpen, todaySeconds]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stats) return null;

  // Format today's seconds into digital clock format HH:MM:SS
  const formatDigital = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Compute daily average from active days
  const activeDays = Object.values(stats.days || {}).filter((s) => s > 0);
  const avgSeconds =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((a, b) => a + b, 0) / activeDays.length)
      : 0;

  // Theme distribution breakdown
  const themes = stats.themes || { campus: 0, street: 0, hiphop: 0 };
  const totalThemeSec = Math.max(1, (themes.campus || 0) + (themes.street || 0) + (themes.hiphop || 0));
  const campusPct = Math.round(((themes.campus || 0) / totalThemeSec) * 100);
  const streetPct = Math.round(((themes.street || 0) / totalThemeSec) * 100);
  const hiphopPct = Math.max(0, 100 - campusPct - streetPct);

  // Chart scaling
  const maxBarSeconds = Math.max(...history.map((h) => h.seconds), 3600);

  const handleResetData = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("backbench-listening-stats-v1");
      const fresh = getListeningStats();
      setStats(fresh);
      setHistory(getLast7DaysHistory());
      setMilestones(getListeningMilestones(0));
      setShowResetConfirm(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0a0c10]/95 text-paper shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-6 sm:p-8 transition-all">
        
        {/* Studio Console Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-400">
              <Activity size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                  SYSTEM // TELEMETRY
                </span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span className="font-mono text-[10px] text-paper/40 tracking-wider uppercase">
                  DECK v2.4
                </span>
              </div>
              <h2 className="font-mono text-base sm:text-lg font-bold uppercase tracking-wider text-paper/95">
                Acoustic Activity Journal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPlaying
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                    : "bg-paper/30"
                }`}
              />
              <span className="font-mono text-[9px] uppercase tracking-widest text-paper/60">
                {isPlaying ? "REC • LIVE" : "STANDBY"}
              </span>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-paper/60 hover:text-paper hover:bg-white/15 hover:border-white/25 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Master Session Display (Hardware Meter Style) */}
        <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
                TODAY'S SESSION DURATION
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  {formatDigital(todaySeconds)}
                </span>
                <span className="font-mono text-xs text-paper/40 uppercase tracking-widest">
                  [{formatListeningDuration(todaySeconds, false)}]
                </span>
              </div>
            </div>

            {/* Hardware Streak Block */}
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
              <div className="text-left font-mono">
                <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
                  SEQUENCE STREAK
                </div>
                <div className="text-lg font-bold text-orange-400 tracking-wider">
                  {String(stats.currentStreak || 1).padStart(2, "0")}{" "}
                  <span className="text-xs font-normal text-paper/60">DAYS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Status Bar */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-paper/40">
            <span>BITRATE: 320 KBPS / STEREO</span>
            <span className="text-emerald-400/90 font-medium">
              {isPlaying ? "AUDIO ENGINE STREAMING" : "AUDIO ENGINE PAUSED"}
            </span>
          </div>
        </div>

        {/* 7-Day Precision Histogram / Spectrogram Bar Array */}
        <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Disc3 size={14} className="text-amber-400" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/80 font-semibold">
                7-Day Chronological Spectrum
              </span>
            </div>
            <span className="font-mono text-[10px] text-paper/40 tracking-wider">
              TOTAL: {formatListeningDuration(stats.totalSeconds)}
            </span>
          </div>

          {/* Bar Visualizer Deck */}
          <div className="relative flex items-end justify-between gap-2.5 h-32 pt-6 pb-2 px-3 border-b border-white/10 bg-black/40 rounded-lg">
            {/* Horizontal Grid Baseline Indicators */}
            <div className="absolute inset-x-3 top-4 border-b border-white/5" />
            <div className="absolute inset-x-3 top-16 border-b border-white/5" />

            {history.map((day, idx) => {
              const heightPercent = Math.max(
                4,
                Math.min(100, Math.round((day.seconds / maxBarSeconds) * 100))
              );
              const isHovered = hoveredDay === idx;

              return (
                <div
                  key={day.dateKey}
                  onMouseEnter={() => setHoveredDay(idx)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                >
                  {/* Floating Telemetry readout */}
                  {isHovered && (
                    <div className="absolute -top-10 z-30 whitespace-nowrap rounded border border-amber-400/40 bg-black/95 px-2 py-0.5 text-center shadow-2xl backdrop-blur-md">
                      <span className="font-mono text-[9px] text-amber-300 font-bold tracking-tight">
                        {day.fullDate} // {formatListeningDuration(day.seconds, true)}
                      </span>
                    </div>
                  )}

                  {/* High-tech Hairline Top Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[24px] rounded-t transition-all duration-300 relative ${
                      day.isToday
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                        : day.seconds > 0
                        ? "bg-teal-400/80 group-hover:bg-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.4)]"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  >
                    {day.seconds > 0 && (
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-white shadow-sm" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center justify-between gap-2.5 mt-2 px-3">
            {history.map((day) => (
              <div key={day.dateKey} className="flex-1 text-center font-mono">
                <span
                  className={`text-[9px] tracking-wider uppercase block ${
                    day.isToday
                      ? "text-amber-400 font-bold"
                      : "text-paper/40"
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4-Corner Telemetry Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
              [01] DAILY AVG
            </div>
            <div className="text-sm sm:text-base font-bold text-paper mt-1">
              {formatListeningDuration(avgSeconds)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
              [02] TOTAL TIME
            </div>
            <div className="text-sm sm:text-base font-bold text-paper mt-1">
              {formatListeningDuration(stats.totalSeconds)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
              [03] ACTIVE LOGS
            </div>
            <div className="text-sm sm:text-base font-bold text-teal-300 mt-1">
              {activeDays.length} DAYS
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
              [04] STREAK
            </div>
            <div className="text-sm sm:text-base font-bold text-orange-400 mt-1">
              {stats.currentStreak || 1} DAYS
            </div>
          </div>
        </div>

        {/* Station Affinity Spectrum */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 font-mono">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-paper/50 mb-2">
            <span className="flex items-center gap-1.5">
              <Radio size={12} className="text-amber-400" />
              <span>Station Affinity Spectrum</span>
            </span>
            <span className="text-paper/40">100% TELEMETRY</span>
          </div>

          {/* Segmented multi-color bar */}
          <div className="h-2 w-full rounded-full bg-white/10 flex overflow-hidden">
            <div
              style={{ width: `${campusPct}%` }}
              className="h-full bg-amber-400 transition-all duration-500"
              title={`Campus: ${campusPct}%`}
            />
            <div
              style={{ width: `${streetPct}%` }}
              className="h-full bg-sky-400 transition-all duration-500"
              title={`Rainy Night: ${streetPct}%`}
            />
            <div
              style={{ width: `${hiphopPct}%` }}
              className="h-full bg-orange-500 transition-all duration-500"
              title={`Hip Hop: ${hiphopPct}%`}
            />
          </div>

          {/* Legends */}
          <div className="flex items-center justify-between text-[9px] text-paper/60 mt-2">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Campus {campusPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Rainy Night {streetPct}%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Hip Hop {hiphopPct}%
            </span>
          </div>
        </div>

        {/* Acoustic Clearance Tiers */}
        <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4 font-mono">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-paper/60 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-teal-400" />
              <span>Acoustic Clearance Tiers</span>
            </span>
            <span className="text-[9px] text-paper/40 uppercase">
              {milestones.filter((m) => m.unlocked).length} / {milestones.length} CLEARED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border p-2.5 transition-all text-left ${
                  m.unlocked
                    ? "border-amber-400/40 bg-amber-950/20 text-paper shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "border-white/5 bg-white/[0.02] text-paper/40"
                }`}
              >
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider mb-1">
                  <span className={m.unlocked ? "text-amber-400 font-bold" : "text-paper/40"}>
                    {m.title}
                  </span>
                  <span>{m.unlocked ? "✓ PASS" : `${Math.round(m.progress * 100)}%`}</span>
                </div>
                <p className="text-[8px] text-paper/50 tracking-tight truncate">{m.desc}</p>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${m.progress * 100}%` }}
                    className={`h-full rounded-full ${
                      m.unlocked ? "bg-amber-400 shadow-[0_0_4px_#fbbf24]" : "bg-teal-500/70"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-paper/30 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>PURGE LOCAL TELEMETRY</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-rose-400 tracking-wider uppercase">
                Confirm Purge?
              </span>
              <button
                onClick={handleResetData}
                type="button"
                className="px-2 py-0.5 rounded border border-rose-500/40 bg-rose-500/20 text-rose-300 text-[9px] uppercase tracking-wider hover:bg-rose-500/40 transition-colors cursor-pointer font-bold"
              >
                EXECUTE
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                type="button"
                className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-paper/60 text-[9px] uppercase tracking-wider hover:bg-white/15 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            type="button"
            className="rounded-lg border border-white/20 bg-white/10 px-5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer font-semibold"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}

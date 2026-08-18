"use client";

import React, { useEffect, useState } from "react";
import { X, ArrowUpRight, Flame, RotateCcw, Sparkles, TrendingUp } from "lucide-react";
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
  const [hoveredBar, setHoveredBar] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const data = getListeningStats();
      setStats(data);
      setHistory(getLast7DaysHistory());
      setMilestones(getListeningMilestones(data.totalSeconds));
    }
  }, [isOpen, todaySeconds]);

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

  // Active days and calculations
  const activeDays = Object.values(stats.days || {}).filter((s) => s > 0);
  const avgSeconds =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((a, b) => a + b, 0) / activeDays.length)
      : 0;

  // Theme distribution
  const themes = stats.themes || { campus: 0, street: 0, hiphop: 0 };
  const totalThemeSec = Math.max(1, (themes.campus || 0) + (themes.street || 0) + (themes.hiphop || 0));
  const campusPct = Math.round(((themes.campus || 0) / totalThemeSec) * 100) || 50;
  const streetPct = Math.round(((themes.street || 0) / totalThemeSec) * 100) || 30;
  const hiphopPct = Math.max(0, 100 - campusPct - streetPct);

  // Daily target completion (e.g. 60 min goal)
  const targetSeconds = 60 * 60;
  const targetPct = Math.min(100, Math.round((todaySeconds / targetSeconds) * 100));

  // Max seconds for bar chart scaling
  const maxBarSeconds = Math.max(...history.map((h) => h.seconds), 1800);

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

  // Donut circumference and strokes
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const campusOffset = 0;
  const campusLength = (circumference * campusPct) / 100;
  const streetOffset = campusLength;
  const streetLength = (circumference * streetPct) / 100;
  const hiphopOffset = campusLength + streetLength;
  const hiphopLength = (circumference * hiphopPct) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] border border-white/15 bg-[#0f1117] p-5 sm:p-8 text-paper shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        
        {/* Top Floating Action Bar */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/70 font-semibold">
              LISTENING STATS & JOURNAL
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-paper/80 hover:text-paper transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── BENTO GRID LAYOUT ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          
          {/* ══ 1. LEFT COLUMN: DONUT DISTRIBUTION CARD (Col 1-5) ══ */}
          <div className="md:col-span-5 rounded-[2rem] bg-[#161822] border border-white/10 p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-paper/70">
                  DISTRIBUTION
                </span>
                <span className="text-[11px] text-paper/40 font-mono">Past 7 days</span>
              </div>

              {/* Multi-Segment Donut Ring Chart */}
              <div className="relative my-6 flex items-center justify-center">
                <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="18"
                  />
                  {/* Campus Segment (Amber) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="18"
                    strokeDasharray={`${campusLength - 4} ${circumference}`}
                    strokeDashoffset={-campusOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Rainy Night Segment (Cyan/Sky) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#38bdf8"
                    strokeWidth="18"
                    strokeDasharray={`${streetLength - 4} ${circumference}`}
                    strokeDashoffset={-streetOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  {/* Hip Hop Segment (Purple/Violet) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#a855f7"
                    strokeWidth="18"
                    strokeDasharray={`${hiphopLength - 4} ${circumference}`}
                    strokeDashoffset={-hiphopOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Big Center Total Stat */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                    {formatListeningDuration(stats.totalSeconds)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-paper/40 mt-0.5">
                    ALL-TIME FOCUS
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Breakdown List with Colored Dots */}
            <div className="space-y-2.5 pt-2 border-t border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  <span>Campus Chill</span>
                </span>
                <span className="font-bold text-amber-400">{campusPct}%</span>
              </div>

              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                  <span>Rainy Night</span>
                </span>
                <span className="font-bold text-sky-400">{streetPct}%</span>
              </div>

              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                  <span>Hip Hop Cypher</span>
                </span>
                <span className="font-bold text-purple-400">{hiphopPct}%</span>
              </div>
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN: BENTO CARDS & BAR CHART (Col 6-12) ══ */}
          <div className="md:col-span-7 flex flex-col gap-4 sm:gap-5">
            
            {/* Top Sub-Grid: Electric Lime Accent Card & Progress Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Electric Lime Accent Card */}
              <div className="rounded-[2rem] bg-[#d9f99d] text-[#0f172a] p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10">
                    <ArrowUpRight size={16} />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-tight bg-black/10 rounded-full px-2 py-0.5">
                    TODAY
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-3xl font-extrabold tracking-tight">
                    {formatListeningDuration(todaySeconds)}
                  </div>
                  <div className="font-mono text-[10px] uppercase font-semibold tracking-wider opacity-70 mt-0.5">
                    Active Session Time
                  </div>
                </div>
              </div>

              {/* Progress Card (Daily Target) */}
              <div className="rounded-[2rem] bg-[#161822] border border-white/10 p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50 font-semibold">
                    Daily Goal
                  </span>
                  <span className="rounded-full bg-teal-400/20 text-teal-300 px-2 py-0.5 font-mono text-[10px] font-bold">
                    ↑ {targetPct}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="font-mono text-2xl font-bold text-white">
                    {Math.round(todaySeconds / 60)} / 60 <span className="text-xs font-normal text-paper/50">min</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${targetPct}%` }}
                      className="h-full rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] transition-all duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ Chunky 7-Day Performance Bar Chart ══ */}
            <div className="rounded-[2rem] bg-[#161822] border border-white/10 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-500/20 text-purple-300 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">
                    ACTIVITY
                  </span>
                  <span className="font-mono text-xs font-bold text-paper/90">
                    7-Day Trend
                  </span>
                </div>
                <span className="font-mono text-[10px] text-paper/40">
                  Avg: {formatListeningDuration(avgSeconds)}/day
                </span>
              </div>

              {/* Chunky Rounded Bar Array */}
              <div className="flex items-end justify-between gap-2.5 h-36 pt-6 pb-2 px-2 bg-[#0e1017] rounded-2xl border border-white/5">
                {history.map((day, idx) => {
                  const heightPercent = Math.max(
                    12,
                    Math.min(100, Math.round((day.seconds / maxBarSeconds) * 100))
                  );
                  const isHovered = hoveredBar === idx;

                  return (
                    <div
                      key={day.dateKey}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                    >
                      {/* Floating percentage/duration chip floating above bar */}
                      <span
                        className={`absolute -top-5 font-mono text-[9px] font-bold transition-all ${
                          day.isToday
                            ? "text-amber-400 scale-105"
                            : isHovered
                            ? "text-purple-300 scale-110"
                            : "text-paper/40"
                        }`}
                      >
                        {day.seconds > 0 ? `${Math.round(day.seconds / 60)}m` : "0m"}
                      </span>

                      {/* Chunky Rounded Pill Bar (matching reference image) */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-xl transition-all duration-300 relative ${
                          day.isToday
                            ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                            : day.seconds > 0
                            ? "bg-gradient-to-t from-purple-600 to-indigo-400 group-hover:from-purple-500 group-hover:to-indigo-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                            : "bg-white/10 group-hover:bg-white/20"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Days of Week (M, T, W, T, F, S, S) */}
              <div className="flex items-center justify-between gap-2.5 mt-3 px-2 font-mono text-[10px]">
                {history.map((day) => (
                  <div key={day.dateKey} className="flex-1 text-center">
                    <span
                      className={`uppercase tracking-wider block ${
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

            {/* ══ Bottom Row: Violet Streak Card & Milestones ══ */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Violet Streak Card (Col 1-5) */}
              <div className="sm:col-span-5 rounded-[2rem] bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-white p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-80">
                    STREAK
                  </span>
                  <Flame size={16} className="text-amber-300 animate-bounce-short" />
                </div>
                <div className="mt-3">
                  <div className="font-mono text-3xl font-extrabold">
                    {String(stats.currentStreak || 1).padStart(2, "0")}{" "}
                    <span className="text-sm font-normal opacity-80">Days</span>
                  </div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">
                    Consecutive Listening
                  </div>
                </div>
              </div>

              {/* Milestones Card (Col 6-12) */}
              <div className="sm:col-span-7 rounded-[2rem] bg-[#161822] border border-white/10 p-5 flex flex-col justify-between shadow-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-paper/60 uppercase font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Unlocked Badges</span>
                  </span>
                  <span className="text-amber-400 font-bold">
                    {milestones.filter((m) => m.unlocked).length} / {milestones.length}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      title={`${m.title}: ${m.desc}`}
                      className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        m.unlocked
                          ? "border border-amber-400/50 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border border-white/5 bg-white/5 text-paper/30 opacity-60"
                      }`}
                    >
                      {m.unlocked ? "🏆" : "🔒"} {m.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-paper/30 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-rose-400 font-bold">Confirm Reset?</span>
              <button
                onClick={handleResetData}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                type="button"
                className="px-2.5 py-1 rounded-lg bg-white/10 text-paper/60 text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            type="button"
            className="rounded-full bg-white/10 hover:bg-white/20 px-6 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-all cursor-pointer font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

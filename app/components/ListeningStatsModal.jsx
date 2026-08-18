"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Headphones,
  Flame,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
  Radio,
  CloudRain,
  Mic2,
  Clock,
  Target,
  BarChart2,
} from "lucide-react";
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

  // Daily target completion (60 min goal)
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0f15] p-5 sm:p-8 text-paper shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-paper/70">
              <Headphones size={15} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 font-semibold block">
                ANALYTICS & JOURNAL
              </span>
              <h2 className="font-mono text-sm sm:text-base font-bold uppercase tracking-wider text-paper/90">
                Listening Statistics
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-paper/60">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPlaying ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-paper/30"
                }`}
              />
              <span>{isPlaying ? "STREAMING" : "STANDBY"}</span>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-paper/70 hover:text-paper transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── BENTO GRID LAYOUT (Muted, Dark Aesthetic) ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          
          {/* ══ 1. LEFT COLUMN: DONUT DISTRIBUTION CARD (Col 1-5) ══ */}
          <div className="md:col-span-5 rounded-2xl bg-[#13151e] border border-white/10 p-6 flex flex-col justify-between shadow-lg relative">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/5 border border-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-paper/60 font-semibold">
                  DISTRIBUTION
                </span>
                <span className="text-[10px] text-paper/40 font-mono">7-Day Overview</span>
              </div>

              {/* Multi-Segment Donut Ring Chart */}
              <div className="relative my-6 flex items-center justify-center">
                <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="16"
                  />
                  {/* Campus Segment (Muted Amber) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#d97706"
                    strokeWidth="16"
                    strokeDasharray={`${campusLength - 4} ${circumference}`}
                    strokeDashoffset={-campusOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 opacity-90"
                  />
                  {/* Rainy Night Segment (Muted Sky) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#0284c7"
                    strokeWidth="16"
                    strokeDasharray={`${streetLength - 4} ${circumference}`}
                    strokeDashoffset={-streetOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 opacity-90"
                  />
                  {/* Hip Hop Segment (Muted Indigo/Violet) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#7c3aed"
                    strokeWidth="16"
                    strokeDasharray={`${hiphopLength - 4} ${circumference}`}
                    strokeDashoffset={-hiphopOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 opacity-90"
                  />
                </svg>

                {/* Big Center Total Stat */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-paper drop-shadow-sm">
                    {formatListeningDuration(stats.totalSeconds)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-paper/40 mt-0.5">
                    ALL-TIME
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Breakdown List with SVG Icons */}
            <div className="space-y-2.5 pt-3 border-t border-white/5 font-mono text-xs">
              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <Radio size={13} className="text-amber-500/80" />
                  <span>Campus</span>
                </span>
                <span className="font-bold text-amber-400/90">{campusPct}%</span>
              </div>

              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  <CloudRain size={13} className="text-sky-400/80" />
                  <span>Rainy Night</span>
                </span>
                <span className="font-bold text-sky-400/90">{streetPct}%</span>
              </div>

              <div className="flex items-center justify-between text-paper/80">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  <Mic2 size={13} className="text-purple-400/80" />
                  <span>Hip Hop</span>
                </span>
                <span className="font-bold text-purple-400/90">{hiphopPct}%</span>
              </div>
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN: BENTO CARDS & BAR CHART (Col 6-12) ══ */}
          <div className="md:col-span-7 flex flex-col gap-4 sm:gap-5">
            
            {/* Top Sub-Grid: Today's Focus Card & Goal Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Today's Focus Card (Muted Dark Glass with subtle Amber highlight) */}
              <div className="rounded-2xl bg-[#13151e] border border-white/10 p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-semibold tracking-wider text-paper/50 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400/80" />
                    <span>Today's Focus</span>
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-md px-2 py-0.5 font-bold">
                    SESSION
                  </span>
                </div>

                <div className="mt-3">
                  <div className="font-mono text-3xl font-bold tracking-tight text-paper">
                    {formatListeningDuration(todaySeconds)}
                  </div>
                  <div className="font-mono text-[10px] text-paper/40 mt-0.5">
                    Active listening recorded
                  </div>
                </div>
              </div>

              {/* Goal Progress Card */}
              <div className="rounded-2xl bg-[#13151e] border border-white/10 p-5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50 font-semibold flex items-center gap-1.5">
                    <Target size={13} className="text-teal-400/80" />
                    <span>Daily Goal</span>
                  </span>
                  <span className="rounded-md bg-teal-400/10 border border-teal-400/20 text-teal-300 px-2 py-0.5 font-mono text-[10px] font-bold">
                    {targetPct}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="font-mono text-2xl font-bold text-paper">
                    {Math.round(todaySeconds / 60)} / 60 <span className="text-xs font-normal text-paper/40">min</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${targetPct}%` }}
                      className="h-full rounded-full bg-teal-500/80 transition-all duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ Chunky 7-Day Performance Bar Chart ══ */}
            <div className="rounded-2xl bg-[#13151e] border border-white/10 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={14} className="text-paper/60" />
                  <span className="font-mono text-xs font-bold text-paper/80 uppercase tracking-wider">
                    7-Day Activity Trend
                  </span>
                </div>
                <span className="font-mono text-[10px] text-paper/40">
                  Avg: {formatListeningDuration(avgSeconds)}/day
                </span>
              </div>

              {/* Chunky Rounded Bar Array */}
              <div className="flex items-end justify-between gap-2.5 h-32 pt-6 pb-2 px-2 bg-black/40 rounded-xl border border-white/5">
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
                        className={`absolute -top-5 font-mono text-[9px] font-semibold transition-all ${
                          day.isToday
                            ? "text-amber-400 font-bold"
                            : isHovered
                            ? "text-paper"
                            : "text-paper/40"
                        }`}
                      >
                        {day.seconds > 0 ? `${Math.round(day.seconds / 60)}m` : "0m"}
                      </span>

                      {/* Chunky Rounded Pill Bar (Muted Tones) */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-lg transition-all duration-300 relative ${
                          day.isToday
                            ? "bg-amber-500/90 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            : day.seconds > 0
                            ? "bg-slate-600 hover:bg-slate-500"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Days of Week (M, T, W, T, F, S, S) */}
              <div className="flex items-center justify-between gap-2.5 mt-2.5 px-2 font-mono text-[10px]">
                {history.map((day) => (
                  <div key={day.dateKey} className="flex-1 text-center">
                    <span
                      className={`uppercase tracking-wider block ${
                        day.isToday ? "text-amber-400 font-bold" : "text-paper/40"
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ Bottom Row: Muted Streak Card & Milestones ══ */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Streak Card (Col 1-5) */}
              <div className="sm:col-span-5 rounded-2xl bg-[#13151e] border border-white/10 p-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-semibold tracking-wider text-paper/50 flex items-center gap-1.5">
                    <Flame size={13} className="text-orange-400/90" />
                    <span>Streak</span>
                  </span>
                  <span className="font-mono text-[9px] text-orange-400/80 bg-orange-400/10 border border-orange-400/20 rounded px-1.5 py-0.5 font-bold uppercase">
                    ACTIVE
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-mono text-2xl font-bold text-paper">
                    {String(stats.currentStreak || 1).padStart(2, "0")}{" "}
                    <span className="text-xs font-normal text-paper/50">Days</span>
                  </div>
                  <div className="text-[9px] font-mono text-paper/40 mt-0.5">
                    Consecutive listening
                  </div>
                </div>
              </div>

              {/* Milestones Card (Col 6-12) */}
              <div className="sm:col-span-7 rounded-2xl bg-[#13151e] border border-white/10 p-4 flex flex-col justify-between shadow-lg font-mono">
                <div className="flex items-center justify-between text-[10px] text-paper/50 uppercase font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Award size={13} className="text-amber-400/80" />
                    <span>Milestones</span>
                  </span>
                  <span className="text-paper/60 font-bold">
                    {milestones.filter((m) => m.unlocked).length} / {milestones.length}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      title={`${m.title}: ${m.desc}`}
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                        m.unlocked
                          ? "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                          : "border border-white/5 bg-white/5 text-paper/30 opacity-60"
                      }`}
                    >
                      {m.unlocked ? (
                        <Award size={11} className="text-amber-400" />
                      ) : (
                        <Lock size={10} className="text-paper/40" />
                      )}
                      <span>{m.title}</span>
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
              className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-paper/30 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={10} />
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
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-6 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-all cursor-pointer font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

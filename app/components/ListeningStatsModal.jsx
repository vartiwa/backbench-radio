"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Headphones,
  Flame,
  RotateCcw,
  Sparkles,
  Award,
  Lock,
  Radio,
  CloudRain,
  Mic2,
  Clock,
  Target,
  BarChart2,
  Power,
  ChevronRight,
  Disc3,
  Sliders,
  Shield,
  Activity,
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
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'activity' | 'stations' | 'milestones'
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

  // Active days and average
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

  // Radial gauge calculations (VisionOS arc gauge with 220 degree sweep)
  const gaugePct = Math.min(100, Math.max(8, targetPct));
  const gaugeArcLength = 190;
  const gaugeOffset = gaugeArcLength - (gaugeArcLength * gaugePct) / 100;

  const themeArtwork =
    currentTheme === "hiphop"
      ? "/bg/hiphop.jpg"
      : currentTheme === "street"
      ? "/bg/street.jpg"
      : "/bg/scene.jpg";

  const themeTitle =
    currentTheme === "hiphop"
      ? "Hip Hop & Desi Cypher"
      : currentTheme === "street"
      ? "Rainy Route Monsoon"
      : "Campus Gateway 1872";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-[2.5rem] border border-white/15 bg-[#17181f]/85 p-6 sm:p-8 text-paper shadow-[0_30px_100px_rgba(0,0,0,0.9)] backdrop-blur-3xl font-sans">
        
        {/* ══ TOP FLOATING VISIONOS CAPSULE NAVIGATION BAR ══ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          
          {/* Floating Pill Tabs */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Headphones size={13} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <BarChart2 size={13} />
              <span>7-Day Activity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stations")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "stations"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Radio size={13} />
              <span>Stations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("milestones")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                activeTab === "milestones"
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-paper/60 hover:text-paper hover:bg-white/5"
              }`}
            >
              <Award size={13} />
              <span>Milestones</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-paper/60">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPlaying ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-paper/30"
                }`}
              />
              <span className="font-mono text-[11px]">{isPlaying ? "Live Audio" : "Standby"}</span>
            </div>

            <button
              onClick={onClose}
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
          
          {/* ════ LEFT COLUMN: LIVE SCENE & ACTION CARDS (Col 1-6) ════ */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* 1. Live Visual Scene Card (Top Left) */}
            <div className="group relative h-48 w-full overflow-hidden rounded-[2rem] border border-white/15 bg-black/60 shadow-lg">
              <img
                src={themeArtwork}
                alt="Station Scene"
                className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

              {/* Floating Top-Left Tag */}
              <div className="absolute top-3.5 left-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-mono text-paper backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                <span>Live Broadcast</span>
              </div>

              {/* Bottom Scene Info */}
              <div className="absolute bottom-4 inset-x-4">
                <p className="text-xs uppercase tracking-wider text-paper/50 font-mono">Current Atmosphere</p>
                <h3 className="text-base font-bold text-paper drop-shadow-md mt-0.5">{themeTitle}</h3>
              </div>
            </div>

            {/* 2. Sub-Grid: Soft Radiant Gradient Card & Action Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Soft Radiant Gradient Card (VisionOS Peach-Lavender Glass) */}
              <div className="rounded-[2rem] bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-sky-500/10 border border-white/15 p-5 flex flex-col justify-between shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-paper">
                    <Flame size={14} className="text-amber-400" />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider rounded-full bg-white/10 px-2 py-0.5 text-paper/70 font-semibold">
                    Streak
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-paper">
                    {String(stats.currentStreak || 1).padStart(2, "0")}{" "}
                    <span className="text-xs font-normal text-paper/60">Days</span>
                  </div>
                  <div className="text-[11px] text-paper/50 mt-0.5">Consecutive Listening</div>
                </div>
              </div>

              {/* Action Pill Card 1 (Daily Target Progress) */}
              <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 flex flex-col justify-between shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-paper/70">
                    <Target size={14} className="text-teal-400" />
                  </span>
                  <span className="font-mono text-[10px] font-bold text-teal-300 bg-teal-400/15 rounded-full px-2 py-0.5">
                    {targetPct}%
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-xl font-bold text-paper">
                    {Math.round(todaySeconds / 60)} / 60 <span className="text-xs font-normal text-paper/50">min</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${targetPct}%` }}
                      className="h-full rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] transition-all duration-700"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Compact Horizontal Metric Capsule */}
            <div className="flex items-center justify-between rounded-2xl bg-[#1d1e26]/70 border border-white/10 px-5 py-3 text-xs font-mono shadow-sm">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-paper/40" />
                <span className="text-paper/60">Daily Average:</span>
                <span className="font-bold text-paper">{formatListeningDuration(avgSeconds)}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Activity size={13} className="text-paper/40" />
                <span className="text-paper/60">Total Logged:</span>
                <span className="font-bold text-amber-300">{formatListeningDuration(stats.totalSeconds)}</span>
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN: VISIONOS RADIAL DIAL GAUGE & 7-DAY BAR CARD (Col 7-12) ════ */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* 1. Large VisionOS Arc Dial Gauge Card (Matching Reference Image) */}
            <div className="rounded-[2.5rem] bg-[#1d1e26]/90 border border-white/15 p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden backdrop-blur-2xl">
              
              <div className="w-full flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold">
                  Acoustic Energy
                </span>
                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-paper/60 font-mono">
                  Today's Gauge
                </span>
              </div>

              {/* Radial Arc Gauge Visualizer with Tick Marks */}
              <div className="relative my-4 flex items-center justify-center h-48 w-48">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="visionosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="50%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#fde047" />
                    </linearGradient>
                  </defs>

                  {/* Outer Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="12"
                    strokeDasharray="280"
                    strokeDashoffset="70"
                    strokeLinecap="round"
                  />

                  {/* Active Gradient Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="url(#visionosGrad)"
                    strokeWidth="12"
                    strokeDasharray="280"
                    strokeDashoffset={280 - (210 * gaugePct) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Inner Concentric Circle & Power Readout (VisionOS Style) */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/15 text-paper mb-1 shadow-inner">
                    <Power size={16} className={isPlaying ? "text-emerald-400" : "text-paper/60"} />
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-paper drop-shadow-md">
                    {formatListeningDuration(todaySeconds)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-paper/40 mt-0.5">
                    Today's Session
                  </span>
                </div>
              </div>

              {/* Gauge Bottom Status Strip */}
              <div className="w-full pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-paper/50">
                <span className="flex items-center gap-1.5">
                  <Disc3 size={12} className="text-amber-400" />
                  <span>320 KBPS High-Fidelity</span>
                </span>
                <span className="text-paper/70 font-semibold">{todaySeconds > 0 ? "Active Log" : "Idle"}</span>
              </div>
            </div>

            {/* 2. Mini 7-Day Chunky Pill Chart Card (Matching Reference Bottom Player Strip) */}
            <div className="rounded-[2rem] bg-[#1d1e26]/80 border border-white/10 p-5 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50 font-semibold">
                  7-Day Chronological Trend
                </span>
                <span className="font-mono text-[10px] text-paper/40">
                  {history.filter((h) => h.seconds > 0).length} active days
                </span>
              </div>

              {/* Chunky Rounded Pill Bar Array */}
              <div className="flex items-end justify-between gap-2 h-24 pt-4 pb-1 px-2 bg-black/40 rounded-2xl border border-white/5">
                {history.map((day, idx) => {
                  const heightPercent = Math.max(
                    14,
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
                      {/* Floating hover chip */}
                      <span
                        className={`absolute -top-5 font-mono text-[8px] font-bold transition-all ${
                          day.isToday ? "text-amber-400 font-bold" : isHovered ? "text-paper" : "text-paper/30"
                        }`}
                      >
                        {day.seconds > 0 ? `${Math.round(day.seconds / 60)}m` : "0"}
                      </span>

                      {/* Chunky Pill Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[24px] rounded-lg transition-all duration-300 ${
                          day.isToday
                            ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : day.seconds > 0
                            ? "bg-gradient-to-t from-purple-500/80 to-indigo-400/80 group-hover:from-purple-400 group-hover:to-indigo-300"
                            : "bg-white/5 group-hover:bg-white/10"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Day Labels (M, T, W, T, F, S, S) */}
              <div className="flex items-center justify-between gap-2 mt-2 px-2 font-mono text-[9px]">
                {history.map((day) => (
                  <div key={day.dateKey} className="flex-1 text-center">
                    <span className={day.isToday ? "text-amber-400 font-bold" : "text-paper/40"}>
                      {day.dayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ══ BOTTOM CONTROLS & PURGE TELEMETRY ══ */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-paper/30 hover:text-rose-400 transition-colors cursor-pointer"
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
            className="rounded-full bg-white/15 hover:bg-white/25 px-7 py-2 font-mono text-xs uppercase tracking-wider text-paper transition-all cursor-pointer font-bold border border-white/10"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

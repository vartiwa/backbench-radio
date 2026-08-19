"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  ArrowUpRight,
  Flame,
  RotateCcw,
  Headphones,
  Timer,
  Sliders,
  ListMusic,
} from "lucide-react";
import {
  getListeningStats,
  formatListeningDuration,
  getLast7DaysHistory,
} from "../lib/listeningStats";

export default function ListeningStatsModal({
  isOpen,
  onClose,
  onSwitchModal,
  todaySeconds = 0,
  isPlaying = false,
  currentTheme = "campus",
}) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [timeframe, setTimeframe] = useState("weekly"); // 'weekly' | 'monthly'
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Live real-time stats refresh on mount and on every second of playback
  useEffect(() => {
    if (isOpen) {
      const data = getListeningStats();
      setStats(data);
      setHistory(getLast7DaysHistory());
    }
  }, [isOpen, todaySeconds]);

  // Live timer tick when modal is open and audio is actively streaming
  useEffect(() => {
    let interval;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        const data = getListeningStats();
        setStats(data);
        setHistory(getLast7DaysHistory());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute exact live mathematical percentages for moods
  const moodData = useMemo(() => {
    if (!stats) return { segments: [], totalTimeFormatted: "0m" };

    const themes = stats.themes || {};
    const campusSec = Math.max(0, themes.campus || 0);
    const streetSec = Math.max(0, themes.street || 0);
    const hiphopSec = Math.max(0, themes.hiphop || 0);
    const sanctuarySec = Math.max(0, themes.sanctuary || 0);

    const totalMoodSec = campusSec + streetSec + hiphopSec + sanctuarySec;
    const allTimeSec = Math.max(stats.totalSeconds || 0, totalMoodSec);

    const baseList = [
      { id: "campus", label: "Campus Chill", sec: campusSec, color: "#f59e0b", gradId: "grad-campus", dotClass: "bg-gradient-to-r from-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" },
      { id: "street", label: "Rainy Route", sec: streetSec, color: "#38bdf8", gradId: "grad-street", dotClass: "bg-gradient-to-r from-cyan-300 to-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.6)]" },
      { id: "hiphop", label: "Hip Hop Cypher", sec: hiphopSec, color: "#a855f7", gradId: "grad-hiphop", dotClass: "bg-gradient-to-r from-purple-300 to-violet-600 shadow-[0_0_8px_rgba(168,85,247,0.6)]" },
      { id: "sanctuary", label: "Sanctuary", sec: sanctuarySec, color: "#2dd4bf", gradId: "grad-sanctuary", dotClass: "bg-gradient-to-r from-emerald-300 to-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.6)]" },
    ];

    if (totalMoodSec === 0) {
      // If no seconds logged yet
      return {
        segments: baseList.map((m) => ({ ...m, pct: 0 })),
        activeSegments: [],
        totalTimeFormatted: formatListeningDuration(allTimeSec),
      };
    }

    // Exact percentage calculation with zero-remainder normalization
    let rawPercentages = baseList.map((m) => ({
      ...m,
      pct: totalMoodSec > 0 ? Math.round((m.sec / totalMoodSec) * 100) : 0,
    }));

    // If rounding caused sum not equal to 100, normalize the dominant category
    const activeOnes = rawPercentages.filter((m) => m.sec > 0);
    if (activeOnes.length === 1) {
      activeOnes[0].pct = 100;
      rawPercentages = rawPercentages.map((m) => (m.id === activeOnes[0].id ? { ...m, pct: 100 } : { ...m, pct: 0 }));
    } else if (activeOnes.length > 1) {
      const sum = rawPercentages.reduce((a, b) => a + b.pct, 0);
      if (sum !== 100) {
        const largest = rawPercentages.reduce((max, cur) => (cur.sec > max.sec ? cur : max), rawPercentages[0]);
        largest.pct += (100 - sum);
      }
    }

    const activeSegments = rawPercentages.filter((m) => m.pct > 0);

    return {
      segments: rawPercentages,
      activeSegments,
      totalTimeFormatted: formatListeningDuration(allTimeSec),
    };
  }, [stats]);

  // Max seconds for 7-day bar chart scaling
  const maxBarSeconds = useMemo(() => {
    return Math.max(...(history?.map((h) => h.seconds) || []), 1800);
  }, [history]);

  // Real-time acoustic rhythm metrics (Day/Night balance, 7-day spline wave, peak focus day)
  const rhythmMetrics = useMemo(() => {
    if (!stats) {
      return {
        dayPct: 50,
        nightPct: 50,
        peakDayIndex: 6,
        peakDayName: "TODAY",
        peakPoint: { x: 260, y: 35 },
        wavePath: "M 0 45 Q 150 20, 300 35",
      };
    }

    const themes = stats.themes || {};
    const campusSec = Math.max(0, themes.campus || 0);
    const nightSec =
      Math.max(0, themes.street || 0) +
      Math.max(0, themes.hiphop || 0) +
      Math.max(0, themes.sanctuary || 0);
    const totalSec = campusSec + nightSec;

    const dayPct = totalSec > 0 ? Math.round((campusSec / totalSec) * 100) : 50;
    const nightPct = totalSec > 0 ? 100 - dayPct : 50;

    // Find peak focus day index from history (0 to 6)
    let peakIndex = 0;
    let maxSec = -1;
    const safeHistory = history || [];
    safeHistory.forEach((h, idx) => {
      if (h.seconds > maxSec) {
        maxSec = h.seconds;
        peakIndex = idx;
      }
    });

    // Map 7 days to dynamic SVG curve coordinates (viewBox 0 0 300 60)
    const points = safeHistory.map((h, i) => {
      const x = (i / Math.max(1, safeHistory.length - 1)) * 280 + 10;
      const norm = maxBarSeconds > 0 ? Math.min(1, h.seconds / maxBarSeconds) : 0;
      const y = 48 - norm * 34; // between 48 (zero) and 14 (peak)
      return { x, y };
    });

    // Build smooth cubic bezier spline curve through points
    let pathD = points.length > 0 ? `M ${points[0].x} ${points[0].y}` : "M 0 45 L 300 45";
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.5;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.5;
      pathD += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const peakPoint = points[peakIndex] || { x: 260, y: 25 };

    return {
      dayPct,
      nightPct,
      peakDayIndex: peakIndex,
      peakDayName: safeHistory[peakIndex]?.dayName || "TODAY",
      peakPoint,
      wavePath: pathD,
    };
  }, [stats, history, maxBarSeconds]);

  if (!isOpen || !stats) return null;

  // Daily target completion (60 min goal)
  const targetPct = Math.min(100, Math.round((todaySeconds / (60 * 60)) * 100));

  const handleResetData = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("backbench-listening-stats-v1");
      const fresh = getListeningStats();
      setStats(fresh);
      setHistory(getLast7DaysHistory());
      setShowResetConfirm(false);
    }
  };

  // Donut geometry constants
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              <Headphones size={16} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Listening Activity & Statistics
              </h2>
              <p className="text-xs text-white/50 font-mono">Real-Time Acoustic Telemetry</p>
            </div>
          </div>

          {/* Quick Jump Buttons & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Jump to Alarm */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("timer")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Timer size={13} className="text-white/60" />
              <span>Alarm & Timer</span>
            </button>

            {/* Jump to Ambient */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("ambient")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Sliders size={13} className="text-white/60" />
              <span>Ambient Sound</span>
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
              <span>{isPlaying ? "Live Audio" : "Standby"}</span>
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
          
          {/* ══ 1. LEFT TALL CARD: SUBTLE PURPLE AMBIENT GLOW & DONUT (Col 1-5) ══ */}
          <div className="lg:col-span-5 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-7 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
            
            {/* Subtle Diffuse Purple Ambient Auras */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-indigo-600/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-1/4 h-48 w-48 rounded-full bg-violet-800/15 blur-3xl" />

            <div className="relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#dcf87a] text-[#0f1117] px-3.5 py-1 text-xs font-extrabold tracking-tight shadow-sm">
                  MOODS
                </span>
                <span className="text-xs text-purple-200/50 font-medium">In the past 7 days</span>
              </div>

              {/* Exact Non-Overlapping Donut Ring Chart with Luminous Gradient Fades & Separation */}
              <div className="relative my-7 flex items-center justify-center">
                <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 180 180">
                  <defs>
                    {/* Soft Drop Glow Filter */}
                    <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.35" />
                    </filter>

                    {/* Campus: Golden Luminous Amber to Warm Sunset Orange */}
                    <linearGradient id="grad-campus" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>

                    {/* Rainy Route: Luminous Cyan to Electric Sky Blue */}
                    <linearGradient id="grad-street" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>

                    {/* Hip Hop: Soft Lavender to Electric Purple */}
                    <linearGradient id="grad-hiphop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e9d5ff" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>

                    {/* Sanctuary: Soft Mint to Radiant Emerald Teal */}
                    <linearGradient id="grad-sanctuary" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a7f3d0" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>

                  {/* Background Track Ring */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="18"
                  />

                  {/* Dynamic Non-Overlapping Arcs with Luminous Fades & Separated Rounded Caps */}
                  {(() => {
                    let cumulativeOffset = 0;
                    const isSingleSegment = moodData.activeSegments.length === 1;

                    return moodData.activeSegments.map((segment) => {
                      const arcLength = (circumference * segment.pct) / 100;
                      const gap = isSingleSegment ? 0 : 12;
                      const strokeDasharray = `${Math.max(0, arcLength - gap)} ${circumference}`;
                      const strokeDashoffset = isSingleSegment ? 0 : -cumulativeOffset - (gap / 2);
                      cumulativeOffset += arcLength;

                      return (
                        <circle
                          key={segment.id}
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="transparent"
                          stroke={`url(#${segment.gradId})`}
                          strokeWidth="18"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          filter="url(#donutGlow)"
                          className="transition-all duration-700"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Big Center Total Duration (e.g., 13m or 2h 45m) */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-extrabold text-4xl sm:text-5xl tracking-tight text-white drop-shadow-lg">
                    {moodData.totalTimeFormatted}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-white/40 font-mono mt-1 font-semibold">
                    TOTAL TIME
                  </span>
                </div>
              </div>
            </div>

            {/* Live Mathematically Accurate Breakdown List */}
            <div className="relative z-10 space-y-3 pt-3 border-t border-purple-400/20 text-sm font-medium">
              {moodData.segments.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-white/90">
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${m.dotClass}`} />
                    <span className={m.pct > 0 ? "text-white font-semibold" : "text-white/40"}>
                      {m.label}
                    </span>
                  </span>
                  <span className={`font-bold font-mono ${m.pct > 0 ? "text-white" : "text-white/40"}`}>
                    {m.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN BENTO SUB-GRID (Col 6-12) ══ */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Top Sub-Grid: [Neon Balance + White Progress + Purple Streak] & [Performance Bar Card] */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              
              {/* 2A. LEFT SUB-COLUMN: Stat Cards */}
              <div className="sm:col-span-5 flex flex-col gap-4">
                
                {/* Electric Lime Accent Card */}
                <div className="rounded-[2.2rem] bg-[#dcf87a] text-[#0f1117] p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-md">
                      <ArrowUpRight size={18} />
                    </div>
                    <span className="bg-black/10 rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-tight text-black">
                      TODAY
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
                      {formatListeningDuration(todaySeconds)}
                    </div>
                    <div className="text-xs font-semibold text-black/70 mt-0.5">
                      Active Listening Session
                    </div>
                  </div>
                </div>

                {/* Clean White Progress Card */}
                <div className="rounded-[2.2rem] bg-white text-[#0f1117] p-5 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="text-xs font-semibold text-black/60">Daily Progress</div>
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mt-1">
                      ↑ {targetPct}%
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="inline-block bg-[#2dd4bf] text-black font-extrabold text-[11px] px-3 py-1 rounded-full shadow-sm">
                      {Math.round(todaySeconds / 60)} / 60 min goal
                    </span>
                  </div>
                </div>

                {/* Vivid Purple Streak Card */}
                <div className="rounded-[2.2rem] bg-[#818cf8] text-white p-5 flex flex-col justify-between shadow-xl">
                  <div>
                    <div className="text-[11px] font-semibold text-white/80 uppercase tracking-wider flex items-center justify-between">
                      <span>SEQUENCE STREAK</span>
                      <Flame size={14} className="text-amber-300 animate-pulse" />
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight text-white mt-1">
                      {String(stats.currentStreak || 1).padStart(2, "0")} <span className="text-sm font-normal text-white/80">Days</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-white/70 font-medium">
                    Daily consistency tracker
                  </div>
                </div>

              </div>

              {/* 2B. RIGHT SUB-COLUMN: PERFORMANCE BAR CARD WITH SUBTLE PURPLE AMBIENT GLOW */}
              <div className="sm:col-span-7 rounded-[2.5rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(216,180,254,0.15)] relative overflow-hidden">
                
                {/* Subtle Diffuse Purple Ambient Auras */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full bg-purple-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-indigo-600/10 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#fed7aa] text-black px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-tight shadow-sm">
                      PERFORMANCE
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {history.filter((h) => h.seconds > 0).length} Days
                    </div>
                    <div className="text-xs text-purple-200/50 mt-0.5">Active in past 7 days</div>
                  </div>
                </div>

                {/* Chunky Rounded Purple Pill Bars with Percentage Badges */}
                <div className="relative z-10 my-5 flex items-end justify-between gap-2.5 h-44 pt-6 pb-2 px-2 bg-black/40 rounded-[1.8rem] border border-white/5">
                  {history.map((day, idx) => {
                    const heightPercent = Math.max(
                      18,
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
                        {/* Inline Badge inside / on top of the bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[34px] rounded-2xl transition-all duration-300 relative flex flex-col items-center justify-start pt-1.5 shadow-lg ${
                            day.isToday
                              ? "bg-[#dcf87a] text-black shadow-[0_0_15px_rgba(220,248,122,0.4)]"
                              : "bg-[#818cf8] text-white hover:bg-[#a5b4fc]"
                          }`}
                        >
                          <span className={`text-[9px] font-extrabold leading-none px-1 rounded ${
                            day.isToday ? "bg-black/20 text-black" : "bg-white/20 text-white"
                          }`}>
                            {day.seconds > 0 ? `${Math.round(day.seconds / 60)}m` : "0m"}
                          </span>
                        </div>

                        {/* Day Label */}
                        <span className={`mt-2 text-[10px] font-bold uppercase ${
                          day.isToday ? "text-[#dcf87a]" : "text-white/50"
                        }`}>
                          {day.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 flex items-center gap-1.5 text-xs text-purple-200/60 font-mono">
                  <span className="h-2 w-2 rounded-full bg-[#818cf8]" />
                  <span>TOTAL LOGGED: {formatListeningDuration(stats.totalSeconds)}</span>
                </div>
              </div>

            </div>

            {/* ══ BOTTOM ROW: ELECTRIC LIME BALANCE & TREND WAVE CARD ══ */}
            <div className="rounded-[2.5rem] bg-[#dcf87a] text-[#0f1117] p-6 shadow-2xl relative overflow-hidden">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-black">Acoustic Focus Rhythm</h4>
                  <div className="flex items-center gap-3 text-xs font-semibold text-black/70 mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-600 shadow-sm" />
                      <span>Campus Study ({rhythmMetrics.dayPct}%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-700 shadow-sm" />
                      <span>Night Flow ({rhythmMetrics.nightPct}%)</span>
                    </span>
                  </div>
                </div>

                {/* Capsule Switch (Weekly / Monthly) */}
                <div className="flex items-center bg-black/10 p-1 rounded-full text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setTimeframe("weekly")}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      timeframe === "weekly" ? "bg-white text-black shadow-sm" : "text-black/60"
                    }`}
                  >
                    WEEKLY
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeframe("monthly")}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      timeframe === "monthly" ? "bg-white text-black shadow-sm" : "text-black/60"
                    }`}
                  >
                    MONTHLY
                  </button>
                </div>
              </div>

              {/* Big Stat and Smooth Dynamic Trend Wave Curve */}
              <div className="mt-4 flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="text-6xl sm:text-7xl font-extrabold text-black leading-none tracking-tight">
                    {timeframe === "weekly"
                      ? `${stats.currentStreak || 1}d`
                      : `${Math.max(1, Math.round(stats.totalSeconds / 3600))}h`}
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-black/60 mt-1">
                    {timeframe === "weekly" ? "Consecutive Streak" : "Total Time Logged"}
                  </span>
                </div>

                {/* Smooth Real-Time Vector Wave Curve */}
                <div className="flex-1 w-full relative">
                  {/* Dynamic Floating Tooltip Chip for Peak Day */}
                  <div
                    className="absolute -top-3 bg-black text-[#dcf87a] rounded-md px-2.5 py-0.5 text-[9px] font-extrabold shadow-md transform -translate-x-1/2 transition-all duration-300"
                    style={{ left: `${(rhythmMetrics.peakPoint.x / 300) * 100}%` }}
                  >
                    PEAK: {rhythmMetrics.peakDayName}
                  </div>

                  <svg className="w-full h-16" viewBox="0 0 300 60" fill="none">
                    {/* Dotted Baseline Reference Curve */}
                    <path
                      d="M 0 46 Q 75 48, 150 44 T 300 46"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      fill="transparent"
                      opacity="0.6"
                    />

                    {/* Real-Time Mathematical Dynamic Spline Curve */}
                    <path
                      d={rhythmMetrics.wavePath}
                      stroke="#0f1117"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                    />

                    {/* Peak Focus Point Glow Marker */}
                    <circle
                      cx={rhythmMetrics.peakPoint.x}
                      cy={rhythmMetrics.peakPoint.y}
                      r="5"
                      fill="#818cf8"
                      stroke="#0f1117"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Dynamic X-Axis 7-Day Labels from History */}
                  <div className="flex items-center justify-between text-[9px] font-extrabold text-black/70 uppercase px-1">
                    {history.map((h) => (
                      <span
                        key={h.dateKey}
                        className={h.isToday ? "text-black underline font-black" : "text-black/60"}
                      >
                        {h.dayName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ══ BOTTOM CONTROLS ══ */}
        <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between font-mono">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-paper/40 hover:text-rose-400 transition-colors cursor-pointer"
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
                className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                type="button"
                className="px-3 py-1 rounded-lg bg-white/10 text-paper/60 text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

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

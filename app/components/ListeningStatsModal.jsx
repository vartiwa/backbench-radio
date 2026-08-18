"use client";

import React, { useEffect, useState } from "react";
import { X, Flame, Clock, Calendar, Trophy, RotateCcw, Sparkles } from "lucide-react";
import {
  getListeningStats,
  formatListeningDuration,
  getLast7DaysHistory,
  getListeningMilestones,
  saveListeningStats,
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

  // Compute daily average from active days
  const activeDays = Object.values(stats.days || {}).filter((s) => s > 0);
  const avgSeconds =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((a, b) => a + b, 0) / activeDays.length)
      : 0;

  // Find top mood
  const themes = stats.themes || {};
  let topMoodKey = "campus";
  let topMoodSeconds = 0;
  for (const [key, val] of Object.entries(themes)) {
    if (val > topMoodSeconds) {
      topMoodSeconds = val;
      topMoodKey = key;
    }
  }

  const moodLabels = {
    campus: "🍂 Campus",
    street: "🌧️ Rainy Night",
    hiphop: "🎤 Hip Hop",
  };

  // Find max seconds for bar chart scaling
  const maxBarSeconds = Math.max(...history.map((h) => h.seconds), 1800); // minimum 30 min scale

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-black/85 p-6 sm:p-8 text-paper shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
              🎧
            </span>
            <div>
              <h2 className="font-display italic text-xl sm:text-2xl text-paper tracking-tight">
                Listening Journal
              </h2>
              <p className="font-mono text-[10px] sm:text-xs text-paper/50 tracking-wider uppercase">
                Personal Activity & Multi-Day Track Record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-paper/60 hover:text-paper hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Today's Time Spotlight Card */}
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-950/40 via-black/60 to-black/80 p-5 sm:p-6 shadow-[0_0_25px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300/90 font-medium">
                  {isPlaying ? "Live Session Active" : "Today's Listening"}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display italic text-4xl sm:text-5xl text-paper font-semibold tracking-tight">
                  {formatListeningDuration(todaySeconds, true)}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-paper/60">
                {isPlaying
                  ? "Music is currently playing and counting your focus time."
                  : "Start playback anytime to track your listening time today."}
              </p>
            </div>

            {/* Daily Streak Pill */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center min-w-[120px]">
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame size={18} className="animate-bounce" />
                <span className="font-mono text-xl font-bold">
                  {stats.currentStreak || 1}
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-paper/50 mt-0.5">
                Day Streak
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Listening History Bar Chart */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-amber-400" />
              <h3 className="font-mono text-xs uppercase tracking-wider text-paper/80 font-medium">
                Last 7 Days Activity
              </h3>
            </div>
            <span className="font-mono text-[10px] text-paper/40">
              Total {formatListeningDuration(stats.totalSeconds)} all-time
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-1 px-2 border-b border-white/10">
            {history.map((day, idx) => {
              const heightPercent = Math.max(
                6,
                Math.round((day.seconds / maxBarSeconds) * 100)
              );
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={day.dateKey}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-10 z-20 whitespace-nowrap rounded-lg border border-white/20 bg-black/95 px-2.5 py-1 text-center shadow-xl backdrop-blur-md animate-fade-in">
                      <p className="font-mono text-[10px] text-amber-300 font-bold">
                        {formatListeningDuration(day.seconds, true)}
                      </p>
                      <p className="font-mono text-[8px] text-paper/50">
                        {day.fullDate}
                      </p>
                    </div>
                  )}

                  {/* Vertical Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                      day.isToday
                        ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                        : day.seconds > 0
                        ? "bg-gradient-to-t from-teal-700/80 to-teal-400/90 group-hover:from-teal-600 group-hover:to-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.3)]"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Day Labels */}
          <div className="flex items-center justify-between gap-2 mt-2 px-2">
            {history.map((day) => (
              <div key={day.dateKey} className="flex-1 text-center">
                <span
                  className={`font-mono text-[10px] tracking-tight block ${
                    day.isToday
                      ? "text-amber-400 font-bold"
                      : "text-paper/50"
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-paper/50 font-mono text-[10px] uppercase">
              <Clock size={12} className="text-teal-400" />
              <span>Daily Average</span>
            </div>
            <p className="font-mono text-base font-bold text-paper mt-1">
              {formatListeningDuration(avgSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-paper/50 font-mono text-[10px] uppercase">
              <Trophy size={12} className="text-amber-400" />
              <span>All-Time</span>
            </div>
            <p className="font-mono text-base font-bold text-paper mt-1">
              {formatListeningDuration(stats.totalSeconds)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-white/10 bg-white/5 p-3.5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-paper/50 font-mono text-[10px] uppercase">
              <Sparkles size={12} className="text-pink-400" />
              <span>Top Mood</span>
            </div>
            <p className="font-mono text-xs font-semibold text-paper mt-1 truncate">
              {moodLabels[topMoodKey] || "🍂 Campus"}
            </p>
          </div>
        </div>

        {/* Backbench Milestones */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} className="text-amber-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-paper/80 font-medium">
              Listening Milestones
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-2.5 transition-all ${
                  m.unlocked
                    ? "border-amber-400/40 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                    : "border-white/5 bg-black/40 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.icon}</span>
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-paper truncate">
                      {m.title}
                    </p>
                    <p className="font-mono text-[9px] text-paper/50 truncate">
                      {m.desc}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${m.progress * 100}%` }}
                    className={`h-full rounded-full ${
                      m.unlocked ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" : "bg-teal-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              type="button"
              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-paper/30 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset stats</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-rose-400">Clear all listening history?</span>
              <button
                onClick={handleResetData}
                type="button"
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-[10px] font-mono transition-colors cursor-pointer"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                type="button"
                className="px-2 py-0.5 rounded bg-white/10 text-paper/70 hover:bg-white/20 text-[10px] font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            type="button"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-1.5 font-mono text-xs uppercase tracking-wider text-paper hover:bg-white/20 transition-all cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

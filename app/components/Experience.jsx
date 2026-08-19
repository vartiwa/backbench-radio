"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import Clock from "./Clock";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import AmbientMixer from "./AmbientMixer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import FullscreenToggle from "./FullscreenToggle";
import AtmosphereCanvas from "./AtmosphereCanvas";
import KineticTitle from "./KineticTitle";
import ListeningBadge from "./ListeningBadge";
import ListeningStatsModal from "./ListeningStatsModal";
import FocusTimerModal from "./FocusTimerModal";
import PlaylistModal from "./PlaylistModal";
import IntroLoader from "./IntroLoader";
import InstructionGuide from "./InstructionGuide";
import { playAlarmSound, stopAlarmPreview } from "../lib/alarmEngine";
import { getListeningStats, recordListeningDelta, getLocalDateKey } from "../lib/listeningStats";
import { THEMES, DEFAULT_THEME } from "../lib/theme";
import { ALL_TRACKS } from "../lib/tracks";

const edge = "max(1rem,env(safe-area-inset-top))";
const edgeB = "max(1rem,env(safe-area-inset-bottom))";
const edgeL = "max(1rem,env(safe-area-inset-left))";
const edgeR = "max(1rem,env(safe-area-inset-right))";

const STORAGE_KEY = "backbench-theme";
const MOOD_KEYS = Object.keys(THEMES);

export default function Experience() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [currentTrackId, setCurrentTrackId] = useState(ALL_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [slideDirection, setSlideDirection] = useState("down");
  const [isExhausted, setIsExhausted] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  // Unified Focus & Alarm Timer State
  const [timerState, setTimerState] = useState({
    mode: "focus", // 'focus' | 'break' | 'custom' | 'sleep'
    timeLeft: 0,
    totalDuration: 0,
    isRunning: false,
    round: 1,
    selectedAlarmId: "chime-bell",
  });
  const [ringingAlarm, setRingingAlarm] = useState(null);

  // Load initial today's listening time on mount
  useEffect(() => {
    const initialStats = getListeningStats();
    const todayKey = getLocalDateKey();
    setTodaySeconds(initialStats.days?.[todayKey] || 0);

    // First user gesture autoplay unlocker (Desktop & Mobile)
    const handleFirstGesture = () => {
      hotkeyHandlersRef.current?.play?.();
    };
    window.addEventListener("click", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("pointerdown", handleFirstGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };
  }, []);

  // Real-time tracking timer when music is actively playing
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTodaySeconds(() => {
          const activeMood = theme === "campus" && isExhausted ? "sanctuary" : theme;
          const updated = recordListeningDelta(1, activeMood);
          return updated;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, theme, isExhausted]);

  // Pomodoro / Alarm Countdown ticker
  useEffect(() => {
    let interval;
    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (prev.timeLeft <= 1) {
            // Timer expired!
            if (prev.mode === "sleep") {
              hotkeyHandlersRef.current.pause?.();
            } else {
              playAlarmSound(prev.selectedAlarmId);
              setRingingAlarm({
                id: prev.selectedAlarmId,
                mode: prev.mode,
                round: prev.round,
              });
            }
            return {
              ...prev,
              timeLeft: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.timeLeft]);

  const handleDismissAlarm = () => {
    stopAlarmPreview();
    setRingingAlarm(null);
  };

  const handleStartBreak = () => {
    stopAlarmPreview();
    setRingingAlarm(null);
    setTimerState((prev) => ({
      ...prev,
      mode: "break",
      timeLeft: 5 * 60,
      totalDuration: 5 * 60,
      isRunning: true,
    }));
  };

  const handleStartTimer = (seconds, mode, alarmId) => {
    setTimerState((prev) => ({
      mode,
      timeLeft: seconds,
      totalDuration: seconds,
      isRunning: true,
      round: mode === "focus" ? (prev.mode === "break" ? prev.round + 1 : 1) : 1,
      selectedAlarmId: alarmId || prev.selectedAlarmId || "chime-bell",
    }));
    setActiveModal(null);
  };

  const handlePauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleResumeTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: true }));
  };

  const handleStopTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      timeLeft: 0,
      totalDuration: 0,
      isRunning: false,
    }));
  };

  const handleUpdateAlarmSound = (alarmId) => {
    setTimerState((prev) => ({ ...prev, selectedAlarmId: alarmId }));
  };

  const handleToggleExhausted = () => {
    setIsGlitching(true);
    setIsExhausted((prev) => !prev);
    setTimeout(() => {
      setIsGlitching(false);
    }, 550);
  };

  // Modals state (mutual exclusion)
  const [activeModal, setActiveModal] = useState(null); // 'ambient' | 'timer' | 'stats' | null

  // Lifted ambient volumes state
  const [ambientVolumes, setAmbientVolumes] = useState({});

  // Global hotkey handlers ref
  const hotkeyHandlersRef = useRef({});
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(null);

  // Load saved theme preference
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
    } catch (e) {
      console.error("Failed loading local storage preferences", e);
    }
  }, []);

  // 2.5D Interactive Mouse/Head Tilt, Living Breathing Physics & Mobile Gyroscope
  const [sceneTransform, setSceneTransform] = useState({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    transX: 0,
    transY: 0,
    scale: 1.04,
  });

  useEffect(() => {
    let frame;
    let targetRotX = 0;
    let targetRotY = 0;
    let targetRotZ = 0;
    let targetTransX = 0;
    let targetTransY = 0;

    let curRotX = 0;
    let curRotY = 0;
    let curRotZ = 0;
    let curTransX = 0;
    let curTransY = 0;

    // Desktop Mouse Position Tracking
    const handleMouseMove = (e) => {
      const normX = e.clientX / window.innerWidth - 0.5; // -0.5 to +0.5
      const normY = e.clientY / window.innerHeight - 0.5; // -0.5 to +0.5

      targetRotX = normY * -5.5; // Natural character head / perspective look up/down
      targetRotY = normX * 6.5; // Character head turn towards mouse left/right
      targetRotZ = normX * 0.9; // Subtle organic head tilt angle
      targetTransX = normX * -18; // Parallax lateral shift
      targetTransY = normY * -14; // Parallax vertical shift
    };

    // Mobile Gyroscope Tilt Tracking (Physical Phone Movement)
    const handleOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const gammaClamped = Math.max(-45, Math.min(45, e.gamma)); // Left/Right tilt
        const betaClamped = Math.max(-45, Math.min(45, e.beta - 45)); // Front/Back tilt
        const normGamma = gammaClamped / 45;
        const normBeta = betaClamped / 45;

        targetRotX = normBeta * -6;
        targetRotY = normGamma * 7;
        targetRotZ = normGamma * 1.2;
        targetTransX = normGamma * -16;
        targetTransY = normBeta * -12;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }

    const loop = (timestamp) => {
      // Smooth LERP (Linear Interpolation) damping for velvety organic motion
      curRotX += (targetRotX - curRotX) * 0.045;
      curRotY += (targetRotY - curRotY) * 0.045;
      curRotZ += (targetRotZ - curRotZ) * 0.045;
      curTransX += (targetTransX - curTransX) * 0.045;
      curTransY += (targetTransY - curTransY) * 0.045;

      // 4-Second Idle Breathing Cycle (Gently moves chest & scene up/down)
      const time = timestamp || performance.now();
      const breathY = Math.sin(time * 0.0016) * 2.2;
      const breathScale = 1.04 + Math.sin(time * 0.0012) * 0.004;

      setSceneTransform({
        rotX: curRotX,
        rotY: curRotY,
        rotZ: curRotZ,
        transX: curTransX,
        transY: curTransY + breathY,
        scale: breathScale,
      });

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      cancelAnimationFrame(frame);
    };
  }, []);

  const handleThemeChange = (next, direction = "down") => {
    setSlideDirection(direction);
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.error("Failed saving theme preference", e);
    }
  };

  const goToNextMood = useCallback(() => {
    const idx = MOOD_KEYS.indexOf(theme);
    const nextKey = MOOD_KEYS[(idx + 1) % MOOD_KEYS.length];
    handleThemeChange(nextKey, "down");
  }, [theme]);

  const goToPrevMood = useCallback(() => {
    const idx = MOOD_KEYS.indexOf(theme);
    const prevKey = MOOD_KEYS[(idx - 1 + MOOD_KEYS.length) % MOOD_KEYS.length];
    handleThemeChange(prevKey, "up");
  }, [theme]);

  // Full-screen Wheel Scroll to Slide Up/Down Moods
  useEffect(() => {
    const handleWheel = (e) => {
      if (activeModal) return;
      if (isScrollingRef.current) return;
      if (Math.abs(e.deltaY) < 25) return;

      isScrollingRef.current = true;
      if (e.deltaY > 0) {
        goToNextMood();
      } else {
        goToPrevMood();
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 750);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeModal, goToNextMood, goToPrevMood]);

  // Touch Swipe for Mobile / Tablets
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null || activeModal) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNextMood();
      } else {
        goToPrevMood();
      }
    }
    touchStartY.current = null;
  };

  const handleRegisterHandlers = useCallback((handlers) => {
    hotkeyHandlersRef.current = handlers;
  }, []);

  const handleAmbientVolumeChange = useCallback((soundId, val) => {
    setAmbientVolumes((prev) => ({ ...prev, [soundId]: val }));
  }, []);

  const active = THEMES[theme] || THEMES[DEFAULT_THEME];
  const currentMoodIndex = MOOD_KEYS.indexOf(theme);
  const beatPulse = isPlaying && theme === "hiphop" ? 0.006 : 0;
  const totalScale = sceneTransform.scale + beatPulse;
  const bgTransform = `perspective(1200px) rotateX(${sceneTransform.rotX.toFixed(2)}deg) rotateY(${sceneTransform.rotY.toFixed(2)}deg) rotateZ(${sceneTransform.rotZ.toFixed(2)}deg) translate3d(${sceneTransform.transX.toFixed(2)}px, ${sceneTransform.transY.toFixed(2)}px, 0) scale3d(${totalScale.toFixed(3)}, ${totalScale.toFixed(3)}, 1)`;

  return (
    <main
      data-theme={theme}
      suppressHydrationWarning
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fade-in relative flex min-h-dvh h-screen w-screen flex-1 flex-col items-center justify-between overflow-hidden selection:bg-amber/30 select-none"
    >
      {/* 3-Second Cinematic Preloader Overlay */}
      <IntroLoader
        duration={3000}
        onComplete={() => {
          setShowGuide(true);
          hotkeyHandlersRef.current?.play?.();
        }}
      />

      {/* 5-Second Interactive Instruction Guide pointing to tools */}
      <InstructionGuide
        isVisible={showGuide}
        duration={5000}
        onDismiss={() => {
          setShowGuide(false);
          hotkeyHandlersRef.current?.play?.();
        }}
      />

      {/* Dynamic Interactive Atmosphere Particle Canvas */}
      <AtmosphereCanvas theme={theme} isPlaying={isPlaying} isExhausted={isExhausted} />

      {/* Background images with full-screen slide transitions, 2.5D tilt & living wind sway */}
      <div
        className={`fixed -inset-10 pointer-events-none z-0 will-change-transform ${
          isPlaying ? "music-playing-flow" : ""
        }`}
        style={{
          transform: bgTransform,
          transformOrigin: "center center",
        }}
      >
        <div
          className={`hero-bg hero-bg-campus living-wind-sway pointer-events-none z-0 ${
            theme === "campus" && !isExhausted ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "campus" && !isExhausted ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-exhausted living-wind-sway pointer-events-none z-0 ${
            theme === "campus" && isExhausted ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "campus" && isExhausted ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-street living-wind-sway pointer-events-none z-0 ${
            theme === "street" ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "street" ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-hiphop living-wind-sway pointer-events-none z-0 ${
            theme === "hiphop" ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "hiphop" ? 1 : 0,
          }}
        />
      </div>

      {/* Dynamic Overlay Gradient */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage:
            theme === "campus" && isExhausted
              ? "linear-gradient(to bottom, rgba(5,25,25,0.4), transparent, rgba(5,18,20,0.85))"
              : theme === "hiphop"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent, rgba(0,0,0,0.95))"
              : theme === "street"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent, rgba(0,0,0,0.85))"
              : "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent, rgba(0,0,0,0.7))",
        }}
      />
      <div className="grain-overlay pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <div
        className="w-full flex items-start justify-between z-20"
        style={{ paddingTop: edge, paddingLeft: edgeL, paddingRight: edgeR }}
      >
        <div className="flex items-center gap-2.5">
          <Clock
            todaySeconds={todaySeconds}
            isPlaying={isPlaying}
            theme={theme}
            isExhausted={isExhausted}
            onOpenStats={() => setActiveModal((prev) => (prev === "stats" ? null : "stats"))}
            onOpenTimer={() => setActiveModal((prev) => (prev === "timer" ? null : "timer"))}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle
            theme={theme}
            onChange={(t) => handleThemeChange(t, "down")}
            isExhausted={isExhausted}
            onToggleExhausted={handleToggleExhausted}
          />
          <FullscreenToggle />
          <KeyboardShortcuts
            onTogglePlay={() => hotkeyHandlersRef.current.togglePlay?.()}
            onToggleMute={() => hotkeyHandlersRef.current.toggleMute?.()}
            onToggleStats={() => setActiveModal((prev) => (prev === "stats" ? null : "stats"))}
            onTogglePlaylist={() => setActiveModal((prev) => (prev === "playlist" ? null : "playlist"))}
            onNextTrack={() => hotkeyHandlersRef.current.nextTrack?.()}
            onPrevTrack={() => hotkeyHandlersRef.current.prevTrack?.()}
          />
        </div>
      </div>

      {/* Center Kinetic Anime.js Title & Tagline with Slide Entrance */}
      <div
        key={`${theme}-${isExhausted}`}
        className={slideDirection === "down" ? "mood-slide-down z-10 my-auto flex flex-col items-center" : "mood-slide-up z-10 my-auto flex flex-col items-center"}
      >
        <KineticTitle
          title={active.title}
          tagline={theme === "campus" && isExhausted ? "rest your tired soul, warrior • sanctuary" : active.tagline}
          theme={theme}
          isPlaying={isPlaying}
          isExhausted={isExhausted}
        />

        {/* Special 'Sanctuary' Mode Toggle for Campus Section */}
        {theme === "campus" && (
          <button
            onClick={handleToggleExhausted}
            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest backdrop-blur-md transition-all duration-300 ${
              isExhausted
                ? "border border-teal-400/60 bg-teal-950/80 text-teal-200 shadow-[0_0_20px_rgba(45,212,191,0.5)] scale-105"
                : "border border-teal-400/40 bg-teal-950/40 text-teal-200/90 shadow-[0_0_12px_rgba(45,212,191,0.25)] hover:border-teal-400 hover:text-teal-100 hover:shadow-[0_0_20px_rgba(45,212,191,0.45)] hover:scale-105"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#2dd4bf]" />
            <span>{isExhausted ? "⚔️ Sanctuary: Active" : "⚔️ Enter Sanctuary"}</span>
          </button>
        )}
      </div>

      {/* ── Left & Right Floating Carousel Chevrons ── */}
      <button
        onClick={goToPrevMood}
        title="Previous Mood (Scroll Up)"
        aria-label="Previous Mood"
        className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-paper/75 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-amber/50 hover:bg-black/60 hover:text-paper hover:scale-110 active:scale-95 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-0.5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={goToNextMood}
        title="Next Mood (Scroll Down)"
        aria-label="Next Mood"
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 text-paper/75 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-amber/50 hover:bg-black/60 hover:text-paper hover:scale-110 active:scale-95 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Bottom Player, Carousel Dots & Footer */}
      <div style={{ paddingBottom: edgeB }} className="w-full flex flex-col items-center gap-3 z-20">
        {/* Minimalist Carousel Pagination Dots */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
          {MOOD_KEYS.map((key, i) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key, i > currentMoodIndex ? "down" : "up")}
              title={THEMES[key].label}
              aria-label={`Switch to ${THEMES[key].label}`}
              className={`rounded-full transition-all duration-500 ${
                theme === key
                  ? "h-2 w-5 bg-amber shadow-[0_0_8px_rgba(232,163,74,0.8)]"
                  : "h-2 w-2 bg-paper/30 hover:bg-paper/60"
              }`}
            />
          ))}
        </div>

        <Player
          preferredPlaylistId={active.playlistId}
          onOpenAmbient={() => setActiveModal('ambient')}
          onOpenSleepTimer={() => setActiveModal('timer')}
          onOpenStats={() => setActiveModal('stats')}
          onOpenPlaylist={() => setActiveModal('playlist')}
          activeTimerSeconds={timerState.timeLeft}
          isTimerRunning={timerState.isRunning}
          currentTrackId={currentTrackId}
          setCurrentTrackId={setCurrentTrackId}
          onRegisterHandlers={handleRegisterHandlers}
          onPlayStateChange={setIsPlaying}
          theme={theme}
          isExhausted={isExhausted}
        />

        {/* Discreet Bottom Center Footer */}
        <p className="font-mono text-[10px] sm:text-[11px] tracking-wider text-paper/30 flex items-center gap-1.5 flex-wrap justify-center text-center px-4 select-none">
          <span>© {new Date().getFullYear()} Backbench Radio</span>
          <span className="opacity-30">·</span>
          <span>All rights reserved</span>
          <span className="opacity-30">·</span>
          <a
            href="https://github.com/vartiwa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper/40 hover:text-amber transition-colors hover:underline"
          >
            Varun Tiwari
          </a>
        </p>
      </div>

      {/* Live Alarm Ringing Banner Overlay */}
      {ringingAlarm && (
        <div className="fixed top-6 inset-x-4 max-w-md mx-auto z-50 rounded-2xl border border-amber-400/80 bg-black/95 p-4 text-paper shadow-[0_0_40px_rgba(245,158,11,0.6)] backdrop-blur-2xl animate-fade-in font-mono">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-ink text-xl font-bold animate-pulse shadow-[0_0_15px_#f59e0b]">
                <Bell size={18} className="text-black" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs uppercase tracking-wider text-amber-300 font-bold truncate">
                  {ringingAlarm.mode === "focus"
                    ? "FOCUS SESSION COMPLETE"
                    : ringingAlarm.mode === "break"
                    ? "BREAK TIME FINISHED"
                    : "ALARM TIME REACHED"}
                </h4>
                <p className="text-[10px] text-paper/60 truncate mt-0.5">
                  Alarm audio is actively playing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {ringingAlarm.mode === "focus" && (
                <button
                  onClick={handleStartBreak}
                  type="button"
                  className="rounded-lg border border-teal-400/60 bg-teal-500/20 px-3 py-1.5 text-[10px] uppercase tracking-wider text-teal-200 font-bold hover:bg-teal-500/40 hover:border-teal-400 cursor-pointer transition-all shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                >
                  Break 5m
                </button>
              )}
              <button
                onClick={handleDismissAlarm}
                type="button"
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-paper font-bold hover:bg-white/25 cursor-pointer transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <div className="z-50 relative">
        <PlaylistModal
          isOpen={activeModal === 'playlist'}
          onClose={() => setActiveModal(null)}
          onSwitchModal={(m) => setActiveModal(m)}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          onSelectTrack={(track) => {
            setCurrentTrackId(track.id);
            hotkeyHandlersRef.current?.playTrack?.(track);
          }}
          onPlayPauseToggle={() => hotkeyHandlersRef.current?.togglePlay?.()}
        />

        <AmbientMixer 
          isOpen={activeModal === 'ambient'} 
          onClose={() => setActiveModal(null)} 
          onSwitchModal={(m) => setActiveModal(m)}
          volumes={ambientVolumes}
          onVolumeChange={handleAmbientVolumeChange}
        />

        <FocusTimerModal
          isOpen={activeModal === 'timer'}
          onClose={() => setActiveModal(null)}
          onSwitchModal={(m) => setActiveModal(m)}
          timerState={timerState}
          onStartTimer={handleStartTimer}
          onPauseTimer={handlePauseTimer}
          onResumeTimer={handleResumeTimer}
          onStopTimer={handleStopTimer}
          onUpdateAlarmSound={handleUpdateAlarmSound}
        />

        <ListeningStatsModal
          isOpen={activeModal === 'stats'}
          onClose={() => setActiveModal(null)}
          onSwitchModal={(m) => setActiveModal(m)}
          todaySeconds={todaySeconds}
          isPlaying={isPlaying}
          currentTheme={theme}
        />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Clock from "./Clock";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import AmbientMixer from "./AmbientMixer";
import SleepTimer from "./SleepTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import FullscreenToggle from "./FullscreenToggle";
import AtmosphereCanvas from "./AtmosphereCanvas";
import KineticTitle from "./KineticTitle";
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

  const handleToggleExhausted = () => {
    setIsGlitching(true);
    setIsExhausted((prev) => !prev);
    setTimeout(() => {
      setIsGlitching(false);
    }, 550);
  };

  // Modals state (mutual exclusion)
  const [activeModal, setActiveModal] = useState(null); // 'ambient' | 'timer' | null
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

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

  // 2.5D Interactive Mouse Parallax for background artwork
  useEffect(() => {
    let frame;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * -14;
      targetY = (e.clientY / window.innerHeight - 0.5) * -10;
    };

    const loop = () => {
      curX += (targetX - curX) * 0.04;
      curY += (targetY - curY) * 0.04;
      setParallax({ x: curX, y: curY });
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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
  const bgTransform = `translate3d(${parallax.x}px, ${parallax.y}px, 0)`;

  return (
    <main
      data-theme={theme}
      suppressHydrationWarning
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fade-in relative flex min-h-dvh h-screen w-screen flex-1 flex-col items-center justify-between overflow-hidden selection:bg-amber/30 select-none"
    >
      {/* Dynamic Interactive Atmosphere Particle Canvas */}
      <AtmosphereCanvas theme={theme} isPlaying={isPlaying} isExhausted={isExhausted} />

      {/* Background images with full-screen slide transitions & cinematic zoom breathing */}
      <div
        className={`fixed -inset-8 pointer-events-none z-0 will-change-transform ${
          isPlaying ? "music-playing-flow" : ""
        }`}
        style={{
          transform: bgTransform,
        }}
      >
        <div
          className={`hero-bg hero-bg-campus pointer-events-none z-0 ${
            theme === "campus" && !isExhausted ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "campus" && !isExhausted ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-exhausted pointer-events-none z-0 ${
            theme === "campus" && isExhausted ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "campus" && isExhausted ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-street tree-sway-ghibli pointer-events-none z-0 ${
            theme === "street" ? (slideDirection === "down" ? "mood-slide-down" : "mood-slide-up") : ""
          }`}
          style={{
            opacity: theme === "street" ? 1 : 0,
          }}
        />
        <div
          className={`hero-bg hero-bg-hiphop pointer-events-none z-0 ${
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
        <Clock />
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
                ? "border border-teal-400/50 bg-teal-950/60 text-teal-200 shadow-[0_0_15px_rgba(45,212,191,0.35)] scale-105"
                : "border border-white/10 bg-black/40 text-paper/60 hover:border-teal-500/40 hover:text-teal-200 hover:scale-105"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isExhausted ? "bg-teal-400 animate-pulse shadow-[0_0_6px_#2dd4bf]" : "bg-paper/40"}`} />
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
          activeTimerSeconds={activeTimerSeconds}
          currentTrackId={currentTrackId}
          setCurrentTrackId={setCurrentTrackId}
          onRegisterHandlers={handleRegisterHandlers}
          onPlayStateChange={setIsPlaying}
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

      {/* Modals */}
      <div className="z-50 relative">
        <AmbientMixer 
          isOpen={activeModal === 'ambient'} 
          onClose={() => setActiveModal(null)} 
          volumes={ambientVolumes}
          onVolumeChange={handleAmbientVolumeChange}
        />

        <SleepTimer
          isOpen={activeModal === 'timer'}
          onClose={() => setActiveModal(null)}
          onTimerExpire={() => {
            hotkeyHandlersRef.current.pause?.();
            setActiveModal(null);
          }}
          activeTimerSeconds={activeTimerSeconds}
          setActiveTimerSeconds={setActiveTimerSeconds}
        />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Clock from "./Clock";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import AmbientMixer from "./AmbientMixer";
import SleepTimer from "./SleepTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import AtmosphereCanvas from "./AtmosphereCanvas";
import KineticTitle from "./KineticTitle";
import { THEMES, DEFAULT_THEME } from "../lib/theme";
import { ALL_TRACKS } from "../lib/tracks";

const edge = "max(1rem,env(safe-area-inset-top))";
const edgeB = "max(1rem,env(safe-area-inset-bottom))";
const edgeL = "max(1rem,env(safe-area-inset-left))";
const edgeR = "max(1rem,env(safe-area-inset-right))";

const STORAGE_KEY = "backbench-theme";

export default function Experience() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [currentTrackId, setCurrentTrackId] = useState(ALL_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Modals state (mutual exclusion)
  const [activeModal, setActiveModal] = useState(null); // 'ambient' | 'timer' | null
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  // Lifted ambient volumes state
  const [ambientVolumes, setAmbientVolumes] = useState({});

  // Global hotkey handlers ref
  const hotkeyHandlersRef = useRef({});

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

  const handleThemeChange = (next) => {
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.error("Failed saving theme preference", e);
    }
  };

  const handleRegisterHandlers = useCallback((handlers) => {
    hotkeyHandlersRef.current = handlers;
  }, []);

  const handleAmbientVolumeChange = useCallback((soundId, val) => {
    setAmbientVolumes((prev) => ({ ...prev, [soundId]: val }));
  }, []);

  const active = THEMES[theme] || THEMES[DEFAULT_THEME];
  const bgTransform = `translate3d(${parallax.x}px, ${parallax.y}px, 0)`;

  return (
    <main
      data-theme={theme}
      suppressHydrationWarning
      className="fade-in relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden selection:bg-amber/30"
    >
      {/* Dynamic Interactive Atmosphere Particle Canvas */}
      <AtmosphereCanvas theme={theme} isPlaying={isPlaying} />

      {/* Background images for different mood themes with subtle flow & 2.5D parallax */}
      <div
        className={`hero-bg hero-bg-campus pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{
          opacity: theme === "campus" ? 1 : 0,
          transform: bgTransform,
        }}
      />
      <div
        className={`hero-bg hero-bg-street pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{
          opacity: theme === "street" ? 1 : 0,
          transform: bgTransform,
        }}
      />
      <div
        className={`hero-bg hero-bg-classroom pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{
          opacity: theme === "classroom" ? 1 : 0,
          transform: bgTransform,
        }}
      />
      <div
        className={`hero-bg hero-bg-hiphop pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{
          opacity: theme === "hiphop" ? 1 : 0,
          transform: bgTransform,
        }}
      />

      {/* Dynamic Overlay Gradient */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage:
            theme === "hiphop"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent, rgba(0,0,0,0.95))"
              : theme === "street"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent, rgba(0,0,0,0.85))"
              : theme === "classroom"
              ? "linear-gradient(to bottom, rgba(0,0,0,0.35), transparent, rgba(0,0,0,0.75))"
              : "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent, rgba(0,0,0,0.7))",
        }}
      />
      <div className="grain-overlay pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <div
        className="w-full flex items-start justify-between z-10"
        style={{ paddingTop: edge, paddingLeft: edgeL, paddingRight: edgeR }}
      >
        <Clock />
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onChange={handleThemeChange} />
          <KeyboardShortcuts
            onTogglePlay={() => hotkeyHandlersRef.current.togglePlay?.()}
            onToggleMute={() => hotkeyHandlersRef.current.toggleMute?.()}
            onNextTrack={() => hotkeyHandlersRef.current.nextTrack?.()}
            onPrevTrack={() => hotkeyHandlersRef.current.prevTrack?.()}
          />
        </div>
      </div>

      {/* Kinetic Anime.js Title & Tagline */}
      <KineticTitle
        title={active.title}
        tagline={active.tagline}
        theme={theme}
        isPlaying={isPlaying}
      />

      {/* Bottom Player & Footer */}
      <div style={{ paddingBottom: edgeB }} className="w-full flex flex-col items-center gap-2.5 z-10">
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

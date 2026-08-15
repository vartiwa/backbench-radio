"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Clock from "./Clock";
import Player from "./Player";
import ThemeToggle from "./ThemeToggle";
import PlaylistDrawer from "./PlaylistDrawer";
import AmbientMixer from "./AmbientMixer";
import SleepTimer from "./SleepTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { THEMES, DEFAULT_THEME } from "../lib/theme";
import { ALL_TRACKS } from "../lib/tracks";

const edge = "max(1rem,env(safe-area-inset-top))";
const edgeB = "max(1rem,env(safe-area-inset-bottom))";
const edgeL = "max(1rem,env(safe-area-inset-left))";
const edgeR = "max(1rem,env(safe-area-inset-right))";

const STORAGE_KEY = "backbench-theme";
const LIKES_KEY = "backbench-liked-songs";

export default function Experience() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [currentTrackId, setCurrentTrackId] = useState(ALL_TRACKS[0].id);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modals state (mutual exclusion)
  const [activeModal, setActiveModal] = useState(null); // 'playlist' | 'ambient' | 'timer' | null
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);

  // Lifted ambient volumes state
  const [ambientVolumes, setAmbientVolumes] = useState({});

  // Global hotkey handlers ref
  const hotkeyHandlersRef = useRef({});

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);

      const savedLikes = window.localStorage.getItem(LIKES_KEY);
      if (savedLikes) setLikedTrackIds(JSON.parse(savedLikes));
    } catch (e) {
      console.error("Failed loading local storage preferences", e);
    }
  }, []);

  const handleThemeChange = (next) => {
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.error("Failed saving theme preference", e);
    }
  };

  const handleToggleLike = (trackId) => {
    setLikedTrackIds((prev) => {
      const next = prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId];
      try {
        window.localStorage.setItem(LIKES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed saving liked tracks", e);
      }
      return next;
    });
  };

  const handleRegisterHandlers = useCallback((handlers) => {
    hotkeyHandlersRef.current = handlers;
  }, []);

  const handleAmbientVolumeChange = useCallback((soundId, val) => {
    setAmbientVolumes((prev) => ({ ...prev, [soundId]: val }));
  }, []);

  const active = THEMES[theme] || THEMES[DEFAULT_THEME];

  return (
    <main
      data-theme={theme}
      suppressHydrationWarning
      className="fade-in relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden selection:bg-amber/30"
    >
      {/* Background images for different mood themes with subtle flow when music plays */}
      <div
        className={`hero-bg hero-bg-campus pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{ opacity: theme === "campus" ? 1 : 0 }}
      />
      <div
        className={`hero-bg hero-bg-street pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{ opacity: theme === "street" ? 1 : 0 }}
      />
      <div
        className={`hero-bg hero-bg-classroom pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{ opacity: theme === "classroom" ? 1 : 0 }}
      />
      <div
        className={`hero-bg hero-bg-hiphop pointer-events-none z-0 ${isPlaying ? "music-playing-flow" : ""}`}
        style={{ opacity: theme === "hiphop" ? 1 : 0 }}
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
            onToggleFavorite={() => hotkeyHandlersRef.current.toggleFavorite?.()}
            onTogglePlaylists={() => setActiveModal((prev) => prev === 'playlist' ? null : 'playlist')}
          />
        </div>
      </div>

      {/* Center Title — per-theme gradient text */}
      {(() => {
        const isHiphop    = theme === "hiphop";
        const isStreet    = theme === "street";
        const isClassroom = theme === "classroom";

        // Soft, soothing gradients — near-white at top, gentle theme tint at bottom
        const gradient = isHiphop
          ? "linear-gradient(175deg, #fff9ee 0%, #ffd580 55%, #f59030 100%)"  // warm white → honey → amber glow
          : isStreet
          ? "linear-gradient(175deg, #f8faff 0%, #d8e8ff 60%, #a0bce8 100%)"  // near white → soft cornflower → muted steel
          : isClassroom
          ? "linear-gradient(175deg, #fffef8 0%, #ffeebb 60%, #f5ce60 100%)"  // paper white → warm cream → soft honey
          : "linear-gradient(175deg, #ffffff 0%, #ffedd5 35%, #fecdd3 70%, #fda4af 100%)"; // crisp white → soft peach → subtle rose pink

        // Subtle glow with contrast backing for high legibility
        const glowFilter = isHiphop
          ? "drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 28px rgba(245,160,60,0.45))"
          : isStreet
          ? "drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 24px rgba(140,180,240,0.4))"
          : isClassroom
          ? "drop-shadow(0 4px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 24px rgba(230,180,60,0.38))"
          : "drop-shadow(0 4px 20px rgba(0,0,0,0.65)) drop-shadow(0 0 28px rgba(251,113,133,0.4)) drop-shadow(0 0 12px rgba(251,146,60,0.25))";

        // Title typography class
        const titleClass = isHiphop
          ? `font-anton uppercase ${isPlaying ? "title-music-beat" : ""}`
          : `font-display italic ${isPlaying ? "title-music-beat" : ""}`;

        const sizeClass = isHiphop
          ? "text-[3.2rem] sm:text-8xl lg:text-[10rem] leading-none tracking-widest"
          : "text-[3.2rem] sm:text-8xl lg:text-9xl leading-none tracking-tight";

        const taglineColor = isHiphop
          ? "rgba(255,160,80,0.6)"
          : isStreet
          ? "rgba(180,210,255,0.55)"
          : isClassroom
          ? "rgba(245,190,90,0.55)"
          : "rgba(254,205,211,0.7)";

        return (
          <div className="flex flex-col items-center text-center px-6 z-10 my-auto select-none">
            {/* Glow wrapper — must be SEPARATE from gradient clip element */}
            <div style={{ filter: glowFilter }} className={`transition-all duration-700 ${isPlaying ? "title-music-beat" : ""}`}>
              <h1
                className={`${titleClass} ${sizeClass}`}
                style={{
                  backgroundImage: gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                {active.title}
              </h1>
            </div>

            {/* Animated separator */}
            <div className="mt-5 flex items-center gap-3">
              <div className={`h-px bg-paper/20 transition-all duration-700 ${isPlaying ? "w-10" : "w-5"}`} />
              <div className="h-[5px] w-[5px] rounded-full bg-paper/25" />
              <div className={`h-px bg-paper/20 transition-all duration-700 ${isPlaying ? "w-10" : "w-5"}`} />
            </div>

            <p
              className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] mt-5"
              style={{ color: taglineColor }}
            >
              {active.tagline}
            </p>
          </div>
        );
      })()}

      {/* Player Component */}
      <div style={{ paddingBottom: edgeB }} className="w-full flex justify-center z-10">
        <Player
          preferredPlaylistId={active.playlistId}
          onOpenPlaylists={() => setActiveModal('playlist')}
          onOpenAmbient={() => setActiveModal('ambient')}
          onOpenSleepTimer={() => setActiveModal('timer')}
          activeTimerSeconds={activeTimerSeconds}
          currentTrackId={currentTrackId}
          setCurrentTrackId={setCurrentTrackId}
          likedTrackIds={likedTrackIds}
          onToggleLike={handleToggleLike}
          onRegisterHandlers={handleRegisterHandlers}
          onPlayStateChange={setIsPlaying}
        />
      </div>

      {/* Discreet Creator Credit */}
      <div
        className="fixed bottom-1.5 sm:bottom-2 right-3 sm:right-4 z-20 flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] tracking-wider text-paper/20 hover:text-paper/60 transition-colors select-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <span>vartiwa</span>
        <span className="opacity-30">·</span>
        <a
          href="mailto:varunt154@gmail.com"
          className="hover:underline hover:text-amber transition-colors text-paper/25 hover:text-paper/70"
        >
          varunt154@gmail.com
        </a>
      </div>

      {/* Modals */}
      <div className="z-50 relative">
        <PlaylistDrawer
          isOpen={activeModal === 'playlist'}
          onClose={() => setActiveModal(null)}
          currentTrackId={currentTrackId}
          onSelectTrack={(id) => {
            setCurrentTrackId(id);
            setActiveModal(null);
          }}
          likedTrackIds={likedTrackIds}
          onToggleLike={handleToggleLike}
        />

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

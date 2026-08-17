"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_TRACKS, PLAYLISTS } from "../lib/tracks";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Minimal SVG Icons ─────────────────────────────── */
const Icon = ({ d, size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className="pointer-events-none shrink-0">
    <path d={d} />
  </svg>
);
const IconPrev  = () => <Icon d="M6 6h2v12H6zM19 6L9 12l10 6V6z" />;
const IconNext  = () => <Icon d="M16 6h2v12h-2zM5 6l10 6L5 18V6z" />;
const IconPlay  = () => <Icon d="M8 5v14l11-7z" size={22} />;
const IconPause = () => <Icon d="M7 5h4v14H7zM13 5h4v14h-4z" size={22} />;
const IconShuffle = () => <Icon d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" size={14} />;
const IconRepeat  = () => <Icon d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" size={14} />;
const IconVolume = ({ level }) => {
  if (level === 0) return <Icon d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />;
  if (level < 50) return <Icon d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />;
  return <Icon d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />;
};
const IconMix   = () => <Icon d="M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z" size={14} />;
const IconTimer = () => <Icon d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" size={14} />;

/* ── Vinyl Disc ─────────────────────────────────────── */
/* ── Realistic Vinyl Turntable Disc with Animated Tonearm ── */
function Vinyl({ playing, track }) {
  const initials = track?.title
    ? track.title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "BB";

  return (
    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 select-none">
      {/* Dynamic Audio Aura Glow Ring */}
      <div
        className={`absolute -inset-1 rounded-full transition-all duration-700 pointer-events-none ${
          playing ? "scale-110 opacity-50 bg-amber/25 blur-md" : "scale-95 opacity-0"
        }`}
      />
      {/* Outer ambient glow halo when playing */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
          playing ? "opacity-100 shadow-[0_0_24px_rgba(232,163,74,0.4)]" : "opacity-0"
        }`}
      />

      {/* ── Spinning Vinyl Record ── */}
      <div
        className={`relative h-full w-full rounded-full overflow-hidden shadow-2xl ring-1 transition-all duration-500 vinyl-spin ${
          playing ? "ring-amber/40 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" : "ring-white/15"
        }`}
        data-playing={playing}
      >
        {/* Realistic Vinyl Micro-Grooves */}
        <div className="absolute inset-0 vinyl-disc-grooves" />

        {/* Concentric Vinyl Track Divider Rings */}
        <div className="pointer-events-none absolute inset-1.5 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute inset-3 rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute inset-[18px] rounded-full border border-white/[0.05]" />

        {/* Holographic Anisotropic Sheen / Conic Specular Highlight */}
        <div className="pointer-events-none absolute inset-0 vinyl-anisotropic-sheen mix-blend-screen opacity-70" />

        {/* Center Vintage Record Label */}
        <div className="absolute left-1/2 top-1/2 h-6 w-6 sm:h-7 sm:w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 shadow-md ring-1 ring-amber-400/40 flex flex-col items-center justify-center">
          {/* Label mini decorative ring */}
          <div className="absolute inset-0.5 rounded-full border border-amber-300/30" />
          
          {/* Label initials */}
          <span className="font-mono text-[7px] sm:text-[8px] font-bold text-amber-100 tracking-wider z-10 leading-none">
            {initials}
          </span>
          <span className="font-mono text-[5px] text-amber-300/80 uppercase tracking-tight scale-90 z-10">
            33 RPM
          </span>

          {/* Center Brass Spindle & Hole */}
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-[1px] ring-amber-300/70 shadow-inner z-20" />
        </div>

        {/* Outer Vinyl Bevel Rim */}
        <div className="pointer-events-none absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]" />
      </div>

      {/* ── Turntable Tonearm (Pivots onto record when playing) ── */}
      <div
        className="pointer-events-none absolute -top-1 -right-1 z-30 transition-transform duration-700 ease-out origin-top-right"
        style={{
          transform: playing ? "rotate(14deg) translateY(1px)" : "rotate(-24deg) translateY(-2px)",
        }}
      >
        {/* Pivot Base */}
        <div className="relative h-3 w-3 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-900 ring-1 ring-white/30 shadow-md">
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-400" />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/80 shadow-[0_0_4px_rgba(232,163,74,0.8)]" />
        </div>

        {/* Metallic Arm Rod */}
        <div className="absolute top-2 right-1.5 w-[2px] h-7 sm:h-8 bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-600 rounded-full shadow-sm origin-top transform rotate-[18deg]">
          {/* Cartridge & Stylus Head */}
          <div className="absolute -bottom-1.5 -left-1 h-3.5 w-2 rounded-sm bg-neutral-900 ring-[0.5px] ring-white/40 shadow-md transform rotate-[-8deg]">
            {/* Cartridge highlight */}
            <div className="h-1 w-full bg-amber-400/70 rounded-t-sm" />
            {/* Needle tip glow */}
            <div
              className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full transition-colors duration-500 ${
                playing ? "bg-amber-400 shadow-[0_0_6px_rgba(232,163,74,0.9)]" : "bg-neutral-500"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Equalizer Bars ─────────────────────────────────── */
function Equalizer({ playing }) {
  return (
    <div className="flex items-end gap-[2px] h-3.5 w-3 shrink-0">
      <div className={`w-[3px] rounded-full bg-amber/80 ${playing ? "eq-bar-1" : "h-[3px]"}`} />
      <div className={`w-[3px] rounded-full bg-amber/80 ${playing ? "eq-bar-2" : "h-[5px]"}`} />
      <div className={`w-[3px] rounded-full bg-amber/80 ${playing ? "eq-bar-3" : "h-[4px]"}`} />
    </div>
  );
}

/* ── Seek Bar ───────────────────────────────────────── */
function SeekBar({ currentTime, duration, onSeek }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime]     = useState(0);
  const pct = duration > 0 ? Math.min(100, ((isDragging ? dragTime : currentTime) / duration) * 100) : 0;

  const updateSeek = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragTime(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * duration);
  }, [duration]);

  const onDown = useCallback((e) => {
    if (!trackRef.current || duration <= 0) return;
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateSeek(e.clientX);
  }, [duration, updateSeek]);

  const onMove = useCallback((e) => { if (isDragging) updateSeek(e.clientX); }, [isDragging, updateSeek]);

  const onUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
    const el = trackRef.current;
    if (!el || duration <= 0) return;
    const rect = el.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * duration);
  }, [isDragging, duration, onSeek]);

  return (
    <div ref={trackRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      className="group relative h-5 w-full cursor-pointer touch-none flex items-center"
      role="slider" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={isDragging ? dragTime : currentTime} aria-label="Track progress">
      <div className="h-[3px] w-full rounded-full bg-white/15">
        <div className="h-full rounded-full bg-amber/90" style={{ width: `${pct}%`, transition: isDragging ? "none" : "width 0.1s linear" }} />
      </div>
      <div className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-paper shadow-sm transition-opacity ${isDragging ? "opacity-100 scale-110" : "opacity-0 group-hover:opacity-100"}`} style={{ left: `${pct}%` }} />
    </div>
  );
}

/* ── Tiny Pill Button ───────────────────────────────── */
function Pill({ onClick, active, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded-full transition-colors cursor-pointer ${active ? "text-amber" : "text-paper/40 hover:text-paper/70"}`}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   PLAYER  —  imperative Audio object, same as test page
   ═══════════════════════════════════════════════════════ */
export default function Player({
  preferredPlaylistId, onOpenAmbient, onOpenSleepTimer,
  activeTimerSeconds, currentTrackId, setCurrentTrackId,
  onRegisterHandlers, onPlayStateChange,
}) {
  const trackList  = ALL_TRACKS;
  const trackIndex = Math.max(0, trackList.findIndex((t) => t.id === currentTrackId));
  const track      = trackList[trackIndex] || trackList[0];

  /* ── React state (UI only) ─────────────────────────── */
  const [playing,         setPlaying]         = useState(false);
  const [loadError,       setLoadError]       = useState(null);
  const [currentTime,     setCurrentTime]     = useState(0);
  const [duration,        setDuration]        = useState(track.duration || 0);
  const [volume,          setVolume]          = useState(80);
  const [muted,           setMuted]           = useState(false);
  const [shuffle,         setShuffle]         = useState(false);
  const [repeat,          setRepeat]          = useState(false);
  const [showMobileVol,   setShowMobileVol]   = useState(false);

  /* ── Stable refs (never trigger re-render) ─────────── */
  const audioRef      = useRef(null);   // the Audio object
  const shuffleRef    = useRef(false);
  const repeatRef     = useRef(false);
  const volumeRef     = useRef(80);
  const playOnLoadRef = useRef(false);  // flag: play as soon as canplay fires

  shuffleRef.current = shuffle;
  repeatRef.current  = repeat;
  volumeRef.current  = volume;

  /* ── Create the Audio object ONCE on mount ─────────── */
  useEffect(() => {
    // Guard: if this effect is cleaned up (e.g. Strict Mode double-invoke),
    // the cleanup sets isAlive=false so stale callbacks don't touch a new Audio instance.
    let isAlive = true;

    const audio = new Audio();
    audio.src    = track.audioUrl;
    audio.volume = 0.8;
    audio.preload = "auto";
    audioRef.current = audio;

    /* native event → React state (only update if this instance is still live) */
    const onPlay       = () => { if (isAlive) { setPlaying(true);  onPlayStateChange?.(true);  } };
    const onPauseEvent = () => { if (isAlive) { setPlaying(false); onPlayStateChange?.(false); } };
    const onTimeUpdate = () => { if (isAlive) setCurrentTime(audio.currentTime); };
    const onDuration   = () => { if (isAlive && isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration); };
    const onEnded      = () => {
      if (!isAlive) return;
      if (repeatRef.current) { audio.currentTime = 0; audio.play().catch(() => {}); }
      else handleNextRef.current?.();
    };
    const onError    = () => { if (isAlive) { playOnLoadRef.current = false; setLoadError(audio.src); } };
    const onCanPlay  = () => {
      if (!isAlive) return;
      setLoadError(null);
      if (playOnLoadRef.current) {
        playOnLoadRef.current = false;
        audio.play().catch((e) => console.warn("canplay play failed:", e.message));
      }
    };

    audio.addEventListener("play",           onPlay);
    audio.addEventListener("pause",          onPauseEvent);
    audio.addEventListener("timeupdate",     onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended",          onEnded);
    audio.addEventListener("error",          onError);
    audio.addEventListener("canplay",        onCanPlay);

    return () => {
      isAlive = false;  // mark this instance as dead before cleanup
      audio.removeEventListener("play",           onPlay);
      audio.removeEventListener("pause",          onPauseEvent);
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("error",          onError);
      audio.removeEventListener("canplay",        onCanPlay);
      audio.pause();
      // Only null the ref if it still points to THIS audio instance
      if (audioRef.current === audio) audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Ref to avoid stale closure in onEnded ─────────── */
  const handleNextRef = useRef(null);

  /* ── Core: go to a track index ─────────────────────── */
  const goToIndex = useCallback((index, autoPlay = true) => {
    let next = index;
    if (shuffleRef.current && trackList.length > 1) {
      next = Math.floor(Math.random() * trackList.length);
    } else {
      next = (index + trackList.length) % trackList.length;
    }
    const nextTrack = trackList[next];
    setCurrentTrackId(nextTrack.id);
    setLoadError(null);

    const audio = audioRef.current;
    if (!audio) return;

    // Changing audio.src implicitly calls load() and fires canplay when ready.
    // We set a flag so the canplay handler knows to call play().
    if (autoPlay) playOnLoadRef.current = true;
    audio.src    = nextTrack.audioUrl;
    audio.volume = volumeRef.current / 100;
    audio.muted  = false;
  }, [trackList, setCurrentTrackId]);

  const handleNext = useCallback((e) => { e?.stopPropagation(); goToIndex(trackIndex + 1, true);  }, [goToIndex, trackIndex]);
  const handlePrev = useCallback((e) => { e?.stopPropagation(); goToIndex(trackIndex - 1, true);  }, [goToIndex, trackIndex]);
  handleNextRef.current = handleNext;

  /* ── Play / Pause toggle ───────────────────────────── */
  const handleToggle = useCallback((e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) { console.warn("audioRef is null"); return; }

    audio.muted  = false;
    audio.volume = volumeRef.current / 100;

    if (audio.paused) {
      audio.play().catch((err) => console.warn("play() failed:", err.name, err.message));
    } else {
      audio.pause();
    }
  }, []);

  const handlePause = useCallback(() => audioRef.current?.pause(), []);

  /* ── Mute / Volume ─────────────────────────────────── */
  const handleToggleMute = useCallback((e) => {
    e?.stopPropagation();
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  }, [muted]);

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    volumeRef.current = val;
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
      if (val === 0) { audioRef.current.muted = true;  setMuted(true);  }
      else           { audioRef.current.muted = false; setMuted(false); }
    }
  };

  /* ── Seek ──────────────────────────────────────────── */
  const handleSeek = useCallback((seconds) => {
    if (audioRef.current && isFinite(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  /* ── Register hotkey handlers ──────────────────────── */
  useEffect(() => {
    onRegisterHandlers?.({
      togglePlay:    handleToggle,
      toggleMute:    handleToggleMute,
      nextTrack:     handleNext,
      prevTrack:     handlePrev,
      pause:         handlePause,
    });
  }, [handleToggle, handleToggleMute, handleNext, handlePrev, onRegisterHandlers, handlePause]);

  /* ── Theme change → switch playlist ───────────────── */
  const firstMountRef = useRef(true);
  useEffect(() => {
    if (firstMountRef.current) { firstMountRef.current = false; return; }
    const playlist = PLAYLISTS.find((p) => p.id === preferredPlaylistId);
    if (!playlist || !playlist.tracks.length) return;
    const idx = trackList.findIndex((t) => t.id === playlist.tracks[0].id);
    if (idx !== -1) goToIndex(idx, playing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredPlaylistId]);

  const volLevel = muted ? 0 : volume;

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="relative w-full max-w-2xl mx-auto px-4">
      {/* NO <audio> JSX element — we manage it imperatively via audioRef */}

      <div className={`rounded-[24px] sm:rounded-full border transition-all duration-500 ${
        playing ? "border-amber/30 bg-black/60 shadow-[0_0_30px_rgba(232,163,74,0.15)]" : "border-white/10 bg-black/40"
      } backdrop-blur-2xl p-3 sm:p-2.5 sm:pr-4`}>

        {/* ── Desktop ── */}
        <div className="hidden sm:flex items-center gap-3">
          <Vinyl playing={playing} track={track} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Equalizer playing={playing} />
              <div className="min-w-0">
                <p className="truncate font-display italic text-[15px] text-paper leading-tight">{track.title}</p>
                {loadError
                  ? <p className="truncate text-[11px] text-rose leading-tight animate-pulse">⚠ File missing — check public/audio/</p>
                  : <p className="truncate text-[11px] text-paper/50 leading-tight">{track.artist}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tabular-nums text-paper/40 w-7">{formatTime(currentTime)}</span>
              <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
              <span className="font-mono text-[10px] tabular-nums text-paper/40 w-7 text-right">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <Pill onClick={() => setShuffle(p => !p)} active={shuffle} title="Shuffle"><IconShuffle /></Pill>
            <Pill onClick={() => setRepeat(p => !p)}  active={repeat}  title="Repeat"><IconRepeat /></Pill>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Pill onClick={onOpenAmbient}     title="Ambient Sounds"><IconMix /></Pill>
            <Pill onClick={onOpenSleepTimer}  active={activeTimerSeconds > 0} title="Sleep Timer"><IconTimer /></Pill>
          </div>

          <div className="flex items-center gap-1 pl-1">
            <button type="button" onClick={handlePrev} className="p-1.5 text-paper/50 hover:text-paper transition-colors cursor-pointer" aria-label="Previous"><IconPrev /></button>
            <button type="button" onClick={handleToggle}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all cursor-pointer shadow-lg active:scale-95 ${
                playing ? "bg-amber text-ink shadow-[0_0_20px_rgba(232,163,74,0.6)] scale-105" : "bg-paper text-ink hover:bg-white hover:scale-105"
              }`}
              aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause /> : <IconPlay />}
            </button>
            <button type="button" onClick={handleNext} className="p-1.5 text-paper/50 hover:text-paper transition-colors cursor-pointer" aria-label="Next"><IconNext /></button>
          </div>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <button type="button" onClick={handleToggleMute} className="text-paper/40 hover:text-paper/70 transition-colors cursor-pointer" aria-label="Mute">
              <IconVolume level={volLevel} />
            </button>
            <input type="range" min="0" max="100" value={volLevel} onChange={handleVolumeChange} className="w-14" aria-label="Volume" />
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center gap-3">
            <Vinyl playing={playing} track={track} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Equalizer playing={playing} />
                <p className="truncate font-display italic text-[15px] text-paper leading-tight">{track.title}</p>
              </div>
              {loadError
                ? <p className="text-rose text-[11px] truncate animate-pulse mt-0.5">⚠ File missing</p>
                : <p className="truncate text-[11px] text-paper/50 mt-0.5">{track.artist}</p>}
            </div>
          </div>

          <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tabular-nums text-paper/40">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={handlePrev} className="p-2 text-paper/60 hover:text-paper cursor-pointer" aria-label="Previous"><IconPrev /></button>
              <button type="button" onClick={handleToggle}
                className={`flex h-12 w-12 items-center justify-center rounded-full cursor-pointer transition-all active:scale-95 ${
                  playing ? "bg-amber text-ink shadow-[0_0_20px_rgba(232,163,74,0.6)] scale-105" : "bg-paper text-ink hover:bg-white"
                }`}
                aria-label={playing ? "Pause" : "Play"}>
                {playing ? <IconPause /> : <IconPlay />}
              </button>
              <button type="button" onClick={handleNext} className="p-2 text-paper/60 hover:text-paper cursor-pointer" aria-label="Next"><IconNext /></button>
            </div>
            <span className="font-mono text-[10px] tabular-nums text-paper/40">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-1 pt-1 border-t border-white/5">
            <Pill onClick={() => setShuffle(p => !p)} active={shuffle} title="Shuffle"><IconShuffle /></Pill>
            <Pill onClick={() => setRepeat(p => !p)}  active={repeat}  title="Repeat"><IconRepeat /></Pill>
            <Pill onClick={onOpenAmbient}    title="Ambient"><IconMix /></Pill>
            <Pill onClick={onOpenSleepTimer} active={activeTimerSeconds > 0} title="Timer"><IconTimer /></Pill>
            <Pill onClick={() => setShowMobileVol(v => !v)} title="Volume"><IconVolume level={volLevel} /></Pill>
          </div>

          {showMobileVol && (
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
              <IconVolume level={volLevel} />
              <input type="range" min="0" max="100" value={volLevel} onChange={handleVolumeChange} className="w-full" aria-label="Volume" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Trash2,
  Play,
  Pause,
  UploadCloud,
  Music,
  ListMusic,
  Headphones,
  Timer,
  Sliders,
  Disc,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { PLAYLISTS } from "../lib/tracks";
import {
  getCustomTracks,
  saveCustomTracks,
  saveAudioBlob,
  getAudioBlob,
  deleteAudioBlob,
  setCachedBlobUrl,
  getCachedBlobUrl,
} from "../lib/customTracks";

export default function PlaylistModal({
  isOpen,
  onClose,
  onSwitchModal,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onPlayPauseToggle,
}) {
  const [activeTab, setActiveTab] = useState("custom"); // 'custom' | playlist id
  const [customTracks, setCustomTracks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Load custom tracks from localStorage & IndexedDB
  useEffect(() => {
    if (!isOpen) return;

    const loaded = getCustomTracks();
    const hydrateBlobs = async () => {
      const hydrated = await Promise.all(
        loaded.map(async (t) => {
          // Check in-memory cache first
          const cached = getCachedBlobUrl(t.id);
          if (cached) return { ...t, audioUrl: cached };

          // Otherwise hydrate from IndexedDB
          if (t.isLocalFile) {
            const blob = await getAudioBlob(t.id);
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCachedBlobUrl(t.id, url);
              return { ...t, audioUrl: url };
            }
          }
          return t;
        })
      );
      setCustomTracks(hydrated);
    };
    hydrateBlobs();
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Robust File Handler for both Drag & Drop and File Picker
  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    const files = Array.from(fileList);
    const newTracks = [];

    for (const file of files) {
      // Broad check: audio extension or audio MIME type or any video/audio container
      const name = file.name || "Untitled Audio";
      const isAudio =
        file.type.startsWith("audio/") ||
        file.type.startsWith("video/") ||
        name.match(/\.(mp3|wav|m4a|aac|flac|ogg|opus|webm|wma|weba|m4b|aiff)$/i);

      if (!isAudio) continue;

      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const cleanName = name.replace(/\.[^/.]+$/, "");
      const parts = cleanName.split(" - ");
      const artistGuess = parts.length > 1 ? parts[0].trim() : "Personal Audio";
      const titleGuess = parts.length > 1 ? parts.slice(1).join(" - ").trim() : cleanName;

      const blobUrl = URL.createObjectURL(file);
      setCachedBlobUrl(id, blobUrl);

      // Asynchronously store to IndexedDB
      saveAudioBlob(id, file).catch((err) => console.warn(err));

      const trackObj = {
        id,
        title: titleGuess || "Custom Track",
        artist: artistGuess || "Personal Audio",
        duration: 180,
        audioUrl: blobUrl,
        isLocalFile: true,
        mood: "personal",
        addedAt: Date.now(),
      };

      // Non-blocking duration extraction
      try {
        const audio = new Audio(blobUrl);
        audio.onloadedmetadata = () => {
          if (audio.duration && Number.isFinite(audio.duration)) {
            trackObj.duration = Math.round(audio.duration);
            setCustomTracks((prev) =>
              prev.map((t) => (t.id === id ? { ...t, duration: Math.round(audio.duration) } : t))
            );
          }
        };
      } catch (_) {}

      newTracks.push(trackObj);
    }

    if (newTracks.length > 0) {
      setCustomTracks((prev) => {
        const updated = [...newTracks, ...prev];
        saveCustomTracks(
          updated.map((t) => ({
            ...t,
            audioUrl: "indexeddb",
          }))
        );
        return updated;
      });

      setActiveTab("custom");
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      // Auto-select and play the first uploaded track
      if (onSelectTrack) {
        onSelectTrack(newTracks[0]);
      }
    }

    setIsUploading(false);
  };

  // Delete Custom Track
  const handleDeleteTrack = async (e, id) => {
    e.stopPropagation();
    await deleteAudioBlob(id);
    setCustomTracks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveCustomTracks(
        updated.map((t) => ({
          ...t,
          audioUrl: "indexeddb",
        }))
      );
      return updated;
    });
  };

  // Current Playlist / Filtered Tracks
  let currentPlaylistTracks = [];
  let playlistTitle = "Personal Library";
  let playlistDescription = "Your uploaded audio files";

  if (activeTab === "custom") {
    currentPlaylistTracks = customTracks;
    playlistTitle = "My Uploaded Music";
    playlistDescription = `${customTracks.length} personal tracks saved in browser`;
  } else {
    const found = PLAYLISTS.find((p) => p.id === activeTab) || PLAYLISTS[0];
    currentPlaylistTracks = found.tracks;
    playlistTitle = found.name;
    playlistDescription = found.note;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none"
      onClick={handleBackdropClick}
    >
      {/* ── Global Invisible File Input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.opus,.webm,.wma,.m4b,.aiff"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      {/* Outer Modal Frame with Ambient Purple Glass Glow */}
      <div className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-[2.8rem] border border-purple-500/25 bg-gradient-to-b from-[#13111e]/95 via-[#0e0f16]/95 to-[#0b0b10]/98 p-6 sm:p-9 text-paper shadow-[0_30px_100px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(216,180,254,0.12)]">
        
        {/* Subtle Ambient Outer Diffuse Halos */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcf87a] text-black font-extrabold shadow-[0_0_15px_rgba(220,248,122,0.4)]">
              <ListMusic size={16} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Personal Library & Playlist Hub
              </h2>
              <p className="text-xs text-white/50 font-mono">Custom Drag & Drop Audio & Curated Radio</p>
            </div>
          </div>

          {/* Quick Jump Buttons & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Jump to Stats */}
            <button
              type="button"
              onClick={() => onSwitchModal?.("stats")}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Headphones size={13} className="text-white/60" />
              <span>Stats & Journal</span>
            </button>

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
          
          {/* ══ 1. LEFT COLUMN: PLAYLIST SELECTOR (Col 1-5) ══ */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* 1A. Personal Uploads Playlist Card */}
            <div
              onClick={() => setActiveTab("custom")}
              className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${
                activeTab === "custom"
                  ? "bg-[#dcf87a] text-[#0f1117] ring-2 ring-white/50 scale-[1.02]"
                  : "bg-[#dcf87a] text-[#0f1117] hover:scale-[1.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                  <UploadCloud size={16} />
                </div>
                <span className="bg-black/10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-black">
                  {customTracks.length} {customTracks.length === 1 ? "SONG" : "SONGS"}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-xl font-extrabold">My Personal Uploads</div>
                <div className="text-xs text-black/70 mt-0.5">Drag & Drop MP3s from your device</div>
              </div>
            </div>

            {/* 1B. Preset Curated Radio Playlists */}
            {PLAYLISTS.map((playlist, idx) => {
              const isSelected = activeTab === playlist.id;
              const cardBg =
                idx === 0
                  ? isSelected ? "bg-white text-black ring-2 ring-white scale-[1.02]" : "bg-white text-black hover:scale-[1.02]"
                  : isSelected ? "bg-[#818cf8] text-white ring-2 ring-white scale-[1.02]" : "bg-[#818cf8] text-white hover:scale-[1.02]";

              return (
                <div
                  key={playlist.id}
                  onClick={() => setActiveTab(playlist.id)}
                  className={`rounded-[2.2rem] p-5 flex flex-col justify-between shadow-xl cursor-pointer transition-all ${cardBg}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold opacity-80">Curated Radio</div>
                    <span className="bg-black/10 text-current font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                      {playlist.tracks.length} Songs
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xl font-extrabold">{playlist.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{playlist.note}</div>
                  </div>
                </div>
              );
            })}

            {/* 1C. Library Quick Action Bar */}
            <div className="rounded-[2rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Storage</span>
                <div className="text-sm font-extrabold text-white">Browser Database</div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-white text-black hover:bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <FolderOpen size={14} />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          {/* ══ 2. RIGHT COLUMN: DRAG & DROP + TRACK QUEUE (Col 6-12) ══ */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* 2A. Prominent Drag & Drop Upload Zone */}
            {activeTab === "custom" && (
              <div className="rounded-[2.2rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-6 shadow-lg relative overflow-hidden">
                
                {/* Big Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    dragOver
                      ? "border-[#dcf87a] bg-[#dcf87a]/15 scale-[1.01]"
                      : uploadSuccess
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#dcf87a] shadow-inner">
                    {uploadSuccess ? (
                      <CheckCircle2 size={24} className="text-emerald-400 animate-bounce" />
                    ) : (
                      <UploadCloud size={24} className={isUploading ? "animate-bounce" : ""} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      {isUploading
                        ? "Importing your music..."
                        : uploadSuccess
                        ? "Song imported & playing!"
                        : "Drag & Drop MP3s or Click to Browse"}
                    </p>
                    <p className="text-xs text-white/50 mt-1 font-mono">
                      Supports .mp3, .wav, .m4a, .flac, .ogg (Stored securely in browser)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2B. Track List Box */}
            <div className="rounded-[2.2rem] bg-gradient-to-b from-[#19162a]/95 via-[#13131d]/95 to-[#0e0f17]/95 border border-purple-500/25 p-5 flex flex-col shadow-lg flex-1">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white">{playlistTitle}</h3>
                  <p className="text-xs text-white/50">{playlistDescription}</p>
                </div>
                <span className="text-xs font-mono text-white/60">
                  {currentPlaylistTracks.length} {currentPlaylistTracks.length === 1 ? "track" : "tracks"}
                </span>
              </div>

              {/* Tracks Scroll Area */}
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                {currentPlaylistTracks.length === 0 ? (
                  <div className="py-14 text-center text-white/40">
                    <Music size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-extrabold text-white/70">No tracks in your library yet</p>
                    <p className="text-xs text-white/40 mt-1">Drag and drop audio files above to start listening!</p>
                  </div>
                ) : (
                  currentPlaylistTracks.map((track) => {
                    const isThisPlaying = currentTrackId === track.id && isPlaying;
                    const isSelected = currentTrackId === track.id;

                    return (
                      <div
                        key={track.id}
                        onClick={() => onSelectTrack?.(track)}
                        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white/15 border-purple-500/40 shadow-sm"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                onPlayPauseToggle?.();
                              } else {
                                onSelectTrack?.(track);
                              }
                            }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-[#dcf87a] hover:text-black text-white transition-all cursor-pointer"
                          >
                            {isThisPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                          </button>

                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-white truncate group-hover:text-amber-200 transition-colors">
                              {track.title}
                            </p>
                            <p className="text-[10px] text-white/50 truncate font-mono">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono text-white/40 tabular-nums">
                            {Math.floor(track.duration / 60)}:
                            {String(track.duration % 60).padStart(2, "0")}
                          </span>

                          {activeTab === "custom" && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTrack(e, track.id)}
                              className="p-1.5 rounded-full text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Delete Track"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2C. Bottom Immersion Bento Card */}
            <div className="rounded-[2.2rem] bg-[#dcf87a] text-[#0f1117] p-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                  <Disc size={16} className={isPlaying ? "animate-spin" : ""} />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full">
                    TURNTABLE ENGINE
                  </span>
                  <div className="text-sm font-extrabold mt-0.5">
                    {isPlaying ? "Vinyl Audio Playing" : "Standby"}
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono font-extrabold text-black/70">
                {currentPlaylistTracks.length} Tracks Ready
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

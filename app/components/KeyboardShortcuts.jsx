"use client";

import { useEffect, useState } from "react";

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "M", action: "Mute / Unmute" },
  { key: "P", action: "Playlists & Library" },
  { key: "S", action: "Listening Stats" },
  { key: "→", action: "Next Track" },
  { key: "←", action: "Previous Track" },
  { key: "?", action: "Show Shortcuts" },
];

export default function KeyboardShortcuts({
  onTogglePlay,
  onToggleMute,
  onToggleStats,
  onTogglePlaylist,
  onNextTrack,
  onPrevTrack,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "Escape") {
        if (isOpen) {
          e.stopPropagation();
          setIsOpen(false);
        }
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key.toLowerCase() === "m") {
        onToggleMute();
      } else if (e.key.toLowerCase() === "p") {
        onTogglePlaylist?.();
      } else if (e.key.toLowerCase() === "s") {
        onToggleStats?.();
      } else if (e.key === "ArrowRight") {
        onNextTrack();
      } else if (e.key === "ArrowLeft") {
        onPrevTrack();
      } else if (e.key === "?") {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onTogglePlay, onToggleMute, onToggleStats, onTogglePlaylist, onNextTrack, onPrevTrack]);

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Keyboard Shortcuts (?)"
        aria-label="Keyboard Shortcuts"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 font-mono text-xs text-paper/70 hover:text-paper hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer"
      >
        ?
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="slide-in-right h-fit w-72 rounded-2xl border border-white/15 bg-black/85 p-5 text-paper shadow-2xl backdrop-blur-2xl transition-all mt-14"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="font-display italic text-base text-paper font-medium">Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-paper/60 hover:text-paper hover:bg-white/20 transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {SHORTCUTS.map((sc) => (
                <div key={sc.key} className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-paper/70">{sc.action}</span>
                  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border border-white/20 bg-white/10 text-amber font-mono font-bold text-[10px]">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

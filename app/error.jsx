"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error for monitoring
    console.error("[Backbench Radio Error]", error);
  }, [error]);

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0b0c10]"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#0b0c10] to-black opacity-90" />

      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Broken vinyl icon */}
        <div
          className="text-6xl select-none"
          style={{ filter: "drop-shadow(0 0 20px rgba(201,119,106,0.5))" }}
        >
          💿
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1
            className="text-xl sm:text-2xl font-medium"
            style={{
              color: "#ece6da",
              fontFamily: "'Newsreader', 'Georgia', serif",
              fontStyle: "italic",
            }}
          >
            The needle skipped.
          </h1>
          <p
            className="text-sm max-w-xs"
            style={{ color: "#9aa3b5", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Something went wrong. Drop the needle again?
          </p>
          {process.env.NODE_ENV === "development" && error?.message && (
            <p
              className="mt-2 text-xs px-4 py-2 rounded-lg max-w-sm break-words"
              style={{ color: "#c9776a", background: "rgba(201,119,106,0.08)", border: "1px solid rgba(201,119,106,0.2)" }}
            >
              {error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "#e8a34a",
              color: "#12141c",
              boxShadow: "0 0 20px rgba(232,163,74,0.3)",
            }}
          >
            ↺ Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#ece6da",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            ← Home
          </a>
        </div>
      </div>
    </main>
  );
}

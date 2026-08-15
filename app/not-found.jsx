"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0b0c10]"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
    >
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#12141c] via-[#0b0c10] to-black opacity-90" />

      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* 404 number */}
        <p
          className="text-[8rem] sm:text-[12rem] leading-none font-bold tracking-tight select-none"
          style={{
            fontFamily: "'Newsreader', 'Georgia', serif",
            fontStyle: "italic",
            backgroundImage: "linear-gradient(175deg, #ffffff 0%, #fff0b0 55%, #e8a34a 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: "drop-shadow(0 0 40px rgba(232,163,74,0.35))",
          }}
        >
          404
        </p>

        {/* Message */}
        <div className="space-y-2">
          <h1
            className="text-xl sm:text-2xl font-medium"
            style={{ color: "#ece6da" }}
          >
            You wandered off the back bench.
          </h1>
          <p
            className="text-sm max-w-xs"
            style={{ color: "#9aa3b5", fontFamily: "'IBM Plex Mono', monospace" }}
          >
            This page doesn&apos;t exist — but the music still does.
          </p>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "#e8a34a",
            color: "#12141c",
            boxShadow: "0 0 20px rgba(232,163,74,0.3)",
          }}
        >
          ← Back to Radio
        </Link>
      </div>
    </main>
  );
}

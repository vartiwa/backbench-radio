"use client";

import { ALL_TRACKS } from "./tracks";

// Web Audio synthesizer for acoustic chimes when user selects a chime instead of a full song
class AlarmSoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  // Resonant Zen Singing Bowl Gong
  playSingingBowl() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const freqs = [432, 864, 1296];
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 4.5);
    });
  }

  // Cozy Lo-Fi Rhodes Bell Chime
  playBellChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.25, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 2.5);
    });
  }
}

export const synthAlarm = new AlarmSoundSynthesizer();

// Available alarm options combining synthesized chimes and full Backbench songs
export const ALARM_SOUND_OPTIONS = [
  { id: "chime-bowl", name: "🔔 Zen Singing Bowl (432Hz)", type: "synth", isChime: true },
  { id: "chime-bell", name: "✨ Lo-Fi Bell Chime", type: "synth", isChime: true },
  ...ALL_TRACKS.map((t) => ({
    id: `track-${t.id}`,
    name: `🎵 ${t.title} — ${t.artist}`,
    trackId: t.id,
    audioUrl: t.audioUrl,
    type: "song",
    isChime: false,
  })),
];

// Play a selected alarm sound (either chime or song preview)
let previewAudio = null;

export function playAlarmSound(alarmId = "chime-bell") {
  if (typeof window === "undefined") return;

  // Stop previous preview
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }

  if (alarmId === "chime-bowl") {
    synthAlarm.playSingingBowl();
    return;
  }

  if (alarmId === "chime-bell") {
    synthAlarm.playBellChime();
    return;
  }

  // Find song in library
  const selected = ALARM_SOUND_OPTIONS.find((o) => o.id === alarmId);
  if (selected && selected.audioUrl) {
    try {
      const audio = new Audio(selected.audioUrl);
      audio.volume = 0.9;
      audio.play().catch((e) => console.warn("Alarm play error:", e));
      previewAudio = audio;
    } catch (e) {
      console.error("Failed playing alarm audio", e);
    }
  }
}

export function stopAlarmPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }
}

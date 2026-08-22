"use client";

// YouTube ID extractor supporting YouTube, YouTube Music, youtu.be, shorts, embeds
export function extractYouTubeId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const str = urlOrId.trim();

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Regular expression matching YouTube / YT Music URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?\/\s]{11})/i;
  const match = str.match(regex);
  return match && match[1] ? match[1] : null;
}

// Fetch video title and author using public no-auth oEmbed (Zero API key needed)
export async function fetchYouTubeMetadata(videoId) {
  if (!videoId) return null;
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    if (!res.ok) throw new Error("Metadata fetch failed");
    const data = await res.json();
    if (data && data.title) {
      let artist = data.author_name || "YouTube Creator";
      let title = data.title;

      // Extract artist from "Artist - Title" if present in video title
      if (title.includes(" - ")) {
        const parts = title.split(" - ");
        if (parts.length >= 2) {
          artist = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        }
      }

      // Clean common YouTube suffixes
      title = title.replace(/\s*\(?(Official\s*(Music\s*)?Video|Audio|Lyric\s*Video|HD|4K|HQ)\)?\s*$/i, "").trim();

      return {
        title: title || data.title,
        artist: artist,
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn("YouTube oEmbed fetch error:", err);
  }

  return {
    title: `YouTube Track (${videoId})`,
    artist: "YouTube Stream",
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

// Singleton YouTube IFrame Player Manager
class YouTubeManager {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentVideoId = null;
    this.listeners = new Set();
    this.timeUpdateInterval = null;
    this.pendingVideoId = null;
    this.pendingPlay = false;
    this.volume = 80;
    this.muted = false;
  }

  init() {
    if (typeof window === "undefined") return;
    if (this.player || window.YT?.Player) {
      this._createPlayer();
      return;
    }

    if (!document.getElementById("yt-iframe-api-script")) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api-script";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        this._createPlayer();
      };
    }
  }

  _createPlayer() {
    if (this.player || typeof window === "undefined" || !window.YT || !window.YT.Player) return;

    let container = document.getElementById("backbench-yt-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "backbench-yt-container";
      container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";
      document.body.appendChild(container);
    }

    let mountNode = document.getElementById("backbench-yt-mount");
    if (!mountNode) {
      mountNode = document.createElement("div");
      mountNode.id = "backbench-yt-mount";
      container.appendChild(mountNode);
    }

    try {
      this.player = new window.YT.Player("backbench-yt-mount", {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            this.isReady = true;
            event.target.setVolume(this.volume);
            if (this.pendingVideoId) {
              const vid = this.pendingVideoId;
              const autoPlay = this.pendingPlay;
              this.pendingVideoId = null;
              this.pendingPlay = false;
              this.loadVideo(vid, autoPlay);
            }
          },
          onStateChange: (event) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              this._startTimeUpdates();
              this._emit("play", {
                duration: this.getDuration(),
                currentTime: this.getCurrentTime(),
              });
            } else if (state === window.YT.PlayerState.PAUSED) {
              this._stopTimeUpdates();
              this._emit("pause");
            } else if (state === window.YT.PlayerState.ENDED) {
              this._stopTimeUpdates();
              this._emit("ended");
            } else if (state === window.YT.PlayerState.BUFFERING) {
              this._emit("buffering");
            }
          },
          onError: (event) => {
            console.warn("YouTube Player error:", event.data);
            this._stopTimeUpdates();
            let msg = "Playback error occurred";
            if (event.data === 101 || event.data === 150) {
              msg = "Video embedding disabled by creator";
            } else if (event.data === 100 || event.data === 2) {
              msg = "Video not found or invalid ID";
            }
            this._emit("error", { code: event.data, message: msg });
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize YouTube Player:", err);
    }
  }

  loadVideo(videoId, autoPlay = true) {
    if (!videoId) return;
    this.currentVideoId = videoId;

    if (!this.isReady || !this.player || !this.player.loadVideoById) {
      this.pendingVideoId = videoId;
      this.pendingPlay = autoPlay;
      this.init();
      return;
    }

    try {
      if (autoPlay) {
        this.player.loadVideoById({ videoId });
      } else {
        this.player.cueVideoById({ videoId });
      }
    } catch (err) {
      console.warn("loadVideoById error:", err);
    }
  }

  play() {
    if (!this.player || !this.isReady || !this.player.playVideo) return;
    try {
      this.player.playVideo();
    } catch (err) {
      console.warn("playVideo error:", err);
    }
  }

  pause() {
    if (!this.player || !this.isReady || !this.player.pauseVideo) return;
    try {
      this.player.pauseVideo();
      this._stopTimeUpdates();
    } catch (err) {
      console.warn("pauseVideo error:", err);
    }
  }

  stop() {
    if (!this.player || !this.isReady) return;
    try {
      if (this.player.stopVideo) this.player.stopVideo();
      this._stopTimeUpdates();
    } catch (err) {
      console.warn("stopVideo error:", err);
    }
  }

  seekTo(seconds) {
    if (!this.player || !this.isReady || !this.player.seekTo) return;
    try {
      this.player.seekTo(seconds, true);
    } catch (err) {
      console.warn("seekTo error:", err);
    }
  }

  setVolume(level) {
    this.volume = Math.max(0, Math.min(100, level));
    if (!this.player || !this.isReady || !this.player.setVolume) return;
    try {
      this.player.setVolume(this.volume);
    } catch (err) {
      console.warn("setVolume error:", err);
    }
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (!this.player || !this.isReady) return;
    try {
      if (isMuted && this.player.mute) this.player.mute();
      else if (!isMuted && this.player.unMute) this.player.unMute();
    } catch (err) {
      console.warn("setMuted error:", err);
    }
  }

  getCurrentTime() {
    if (!this.player || !this.isReady || !this.player.getCurrentTime) return 0;
    try {
      return this.player.getCurrentTime() || 0;
    } catch (_) {
      return 0;
    }
  }

  getDuration() {
    if (!this.player || !this.isReady || !this.player.getDuration) return 0;
    try {
      return this.player.getDuration() || 0;
    } catch (_) {
      return 0;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  _emit(event, data = {}) {
    this.listeners.forEach((fn) => {
      try {
        fn(event, data);
      } catch (e) {
        console.warn("Listener error:", e);
      }
    });
  }

  _startTimeUpdates() {
    this._stopTimeUpdates();
    this.timeUpdateInterval = setInterval(() => {
      const currentTime = this.getCurrentTime();
      const duration = this.getDuration();
      this._emit("timeupdate", { currentTime, duration });
    }, 250);
  }

  _stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }
}

export const youtubeManager = typeof window !== "undefined" ? new YouTubeManager() : null;

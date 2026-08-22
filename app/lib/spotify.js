"use client";

// Extract Spotify track, playlist, or album info
export function extractSpotifyInfo(url) {
  if (!url || typeof url !== "string") return null;
  const str = url.trim();

  const regex = /open\.spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/i;
  const match = str.match(regex);
  if (match) {
    const type = match[1];
    const id = match[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    };
  }
  return null;
}

// Fetch Spotify title, artist, and cover using public no-auth oEmbed
export async function fetchSpotifyMetadata(url) {
  if (!url) return null;
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Spotify metadata fetch failed");
    const data = await res.json();
    if (data && data.title) {
      let title = data.title;
      let artist = "Spotify";

      // If format is "Title by Artist"
      if (title.includes(" by ")) {
        const parts = title.split(" by ");
        title = parts[0].trim();
        artist = parts[1].trim();
      }

      return {
        title: title || "Spotify Track",
        artist: artist,
        thumbnail: data.thumbnail_url || null,
      };
    }
  } catch (err) {
    console.warn("Spotify oEmbed error:", err);
  }

  const info = extractSpotifyInfo(url);
  return {
    title: info ? `Spotify ${info.type.toUpperCase()}` : "Spotify Music",
    artist: "Spotify",
    thumbnail: null,
  };
}

// Track shape: { id, title, artist, year, duration, audioUrl, mood }
// User Uploaded Full Original MP3 Audio Files in public/audio/

export const getYoutubeUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
export const getYoutubeMusicUrl = (videoId) => `https://music.youtube.com/watch?v=${videoId}`;
export const getYoutubeSearchUrl = (query) => `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;

export const PLAYLISTS = [
  {
    id: "on-the-way-in",
    name: "On the Way In",
    note: "headphones on, world on mute",
    tracks: [
      { id: "sunflower", title: "Sunflower", artist: "Post Malone, Swae Lee", year: 2018, duration: 158, audioUrl: "/audio/sunflower.mp3", mood: "upbeat" },
      { id: "sweater-weather", title: "Sweater Weather", artist: "The Neighbourhood", year: 2013, duration: 240, audioUrl: "/audio/sweater-weather.mp3", mood: "chill" },
      { id: "big-dawgs", title: "Big Dawgs", artist: "Hanumankind & Kalmi", year: 2024, duration: 232, audioUrl: "/audio/big-dawgs.mp3", mood: "hiphop-banger" },
    ],
  },
  {
    id: "rainy-route",
    name: "Rainy Route",
    note: "walking slower than you need to",
    tracks: [
      { id: "blinding-lights", title: "Blinding Lights", artist: "The Weeknd", year: 2020, duration: 200, audioUrl: "/audio/blinding-lights.mp3", mood: "synth-pop" },
      { id: "end-of-beginning", title: "End of Beginning", artist: "Djo", year: 2022, duration: 159, audioUrl: "/audio/end-of-beginning.mp3", mood: "indie-rain" },
      { id: "gata-only", title: "Gata Only", artist: "FloyyMenor, Cris MJ", year: 2024, duration: 222, audioUrl: "/audio/gata-only.mp3", mood: "reggaeton-vibe" },
    ],
  },
  {
    id: "walking-back",
    name: "Walking Back",
    note: "campus behind you, glowing lights",
    tracks: [
      { id: "night-changes", title: "Night Changes", artist: "One Direction", year: 2014, duration: 220, audioUrl: "/audio/night-changes.mp3", mood: "acoustic" },
      { id: "stay", title: "STAY", artist: "The Kid LAROI, Justin Bieber", year: 2021, duration: 141, audioUrl: "/audio/stay.mp3", mood: "upbeat" },
      { id: "century", title: "Century", artist: "EsDeeKid", year: 2024, duration: 165, audioUrl: "/audio/century.mp3", mood: "chill-drift" },
    ],
  },
  {
    id: "hiphop-hype",
    name: "Hip Hop & Desi Cypher",
    note: "desi hip hop, heavy 808s & concert energy",
    tracks: [
      { id: "fein", title: "FE!N", artist: "Travis Scott ft. Playboi Carti", year: 2023, duration: 191, audioUrl: "/audio/fein.mp3", mood: "hype-rap" },
      { id: "not-like-us", title: "Not Like Us", artist: "Kendrick Lamar", year: 2024, duration: 274, audioUrl: "/audio/not-like-us.mp3", mood: "westcoast-banger" },
      { id: "trap-praa", title: "TRAP PRAA", artist: "Raftaar x Prabh Deep", year: 2023, duration: 185, audioUrl: "/audio/trap-praa.mp3", mood: "heavy-808" },
    ],
  },
];

export const ALL_TRACKS = PLAYLISTS.flatMap((p) => p.tracks);

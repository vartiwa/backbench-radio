"use client";

const STORAGE_KEY = "backbench-listening-stats-v1";

// Helper to get formatted local date string YYYY-MM-DD
export function getLocalDateKey(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Initial empty stats structure
function getDefaultStats() {
  const today = getLocalDateKey();
  return {
    days: { [today]: 0 },
    themes: {
      campus: 0,
      street: 0,
      hiphop: 0,
      sanctuary: 0,
    },
    totalSeconds: 0,
    lastActiveDate: today,
    currentStreak: 1,
  };
}

// Load stats from localStorage
export function getListeningStats() {
  if (typeof window === "undefined") return getDefaultStats();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStats();

    const data = JSON.parse(raw);
    const today = getLocalDateKey();

    // Ensure today's entry exists
    if (!data.days) data.days = {};
    if (!data.days[today]) data.days[today] = 0;
    if (!data.themes) data.themes = { campus: 0, street: 0, hiphop: 0, sanctuary: 0 };
    if (typeof data.themes.sanctuary !== "number") data.themes.sanctuary = 0;
    if (typeof data.totalSeconds !== "number") data.totalSeconds = 0;

    // Prune days older than 45 days to keep localStorage lightweight
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 45);
    const cutoffKey = getLocalDateKey(cutoff);

    for (const dayKey of Object.keys(data.days)) {
      if (dayKey < cutoffKey) {
        delete data.days[dayKey];
      }
    }

    return data;
  } catch (e) {
    console.error("Error reading listening stats", e);
    return getDefaultStats();
  }
}

// Save stats to localStorage
export function saveListeningStats(stats) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving listening stats", e);
  }
}

// Increment listening time by deltaSeconds for today & active theme
export function recordListeningDelta(deltaSeconds = 1, currentTheme = "campus") {
  if (typeof window === "undefined" || deltaSeconds <= 0) return 0;

  const stats = getListeningStats();
  const today = getLocalDateKey();

  // Accumulate day seconds
  stats.days[today] = (stats.days[today] || 0) + deltaSeconds;
  stats.totalSeconds = (stats.totalSeconds || 0) + deltaSeconds;

  // Accumulate theme seconds
  if (currentTheme) {
    stats.themes[currentTheme] = (stats.themes[currentTheme] || 0) + deltaSeconds;
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  if (stats.lastActiveDate === today) {
    // Already active today
    if (!stats.currentStreak || stats.currentStreak < 1) stats.currentStreak = 1;
  } else if (stats.lastActiveDate === yesterdayKey) {
    // Listened yesterday, streak continues!
    stats.currentStreak = (stats.currentStreak || 1) + 1;
    stats.lastActiveDate = today;
  } else {
    // Missed more than 1 day, reset streak to 1
    stats.currentStreak = 1;
    stats.lastActiveDate = today;
  }

  saveListeningStats(stats);
  return stats.days[today];
}

// Format seconds into human readable strings like '45m', '1h 24m', '3h', '0m'
export function formatListeningDuration(seconds = 0, full = false) {
  if (!seconds || seconds <= 0) return full ? "0 minutes" : "0m";

  const totalMin = Math.floor(seconds / 60);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  if (hours > 0) {
    if (mins === 0) return full ? `${hours} hr` : `${hours}h`;
    return full ? `${hours} hr ${mins} min` : `${hours}h ${mins}m`;
  }

  if (totalMin === 0 && seconds > 0) {
    return full ? "Just started (< 1 min)" : "< 1m";
  }

  return full ? `${totalMin} min` : `${totalMin}m`;
}

// Get the last 7 days of listening data formatted for bar charts
export function getLast7DaysHistory() {
  const stats = getListeningStats();
  const result = [];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getLocalDateKey(d);
    const seconds = stats.days[key] || 0;
    const isToday = i === 0;

    result.push({
      dateKey: key,
      dayName: isToday ? "Today" : daysOfWeek[d.getDay()],
      fullDate: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      seconds,
      minutes: Math.round(seconds / 60),
      hours: +(seconds / 3600).toFixed(1),
      isToday,
    });
  }

  return result;
}

// Milestones / Achievements based on all-time listening seconds
export function getListeningMilestones(totalSeconds = 0) {
  const milestones = [
    {
      id: "first_notes",
      title: "First Bell",
      desc: "Listen for 15 minutes",
      reqSeconds: 15 * 60,
      icon: "🔔",
    },
    {
      id: "backbencher",
      title: "Backbencher",
      desc: "Accumulate 1 hour of chill beats",
      reqSeconds: 60 * 60,
      icon: "📚",
    },
    {
      id: "study_master",
      title: "Study Voyager",
      desc: "Listen for 3 total hours",
      reqSeconds: 3 * 3600,
      icon: "☕",
    },
    {
      id: "night_owl",
      title: "Night Owl",
      desc: "Reach 5 hours of midnight listening",
      reqSeconds: 5 * 3600,
      icon: "🌙",
    },
    {
      id: "sanctuary_knight",
      title: "Sanctuary Knight",
      desc: "Attain 10 hours in the safe haven",
      reqSeconds: 10 * 3600,
      icon: "⚔️",
    },
    {
      id: "legendary_lofi",
      title: "Radio Legend",
      desc: "Achieve 24 total hours of listening",
      reqSeconds: 24 * 3600,
      icon: "👑",
    },
  ];

  return milestones.map((m) => {
    const progress = Math.min(1, totalSeconds / m.reqSeconds);
    const unlocked = totalSeconds >= m.reqSeconds;
    return { ...m, progress, unlocked };
  });
}

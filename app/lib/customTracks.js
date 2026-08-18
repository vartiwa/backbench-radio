"use client";

// In-memory active blob cache for seamless instant playback
const blobCache = new Map();

export function setCachedBlobUrl(id, url) {
  blobCache.set(id, url);
}

export function getCachedBlobUrl(id) {
  return blobCache.get(id);
}

// IndexedDB database for persistent audio blobs
const DB_NAME = "backbench_audio_db";
const STORE_NAME = "audio_files";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("IndexedDB open error:", request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn("IndexedDB error:", err);
      resolve(null);
    }
  });
}

export async function saveAudioBlob(id, blob) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("Failed to save audio blob to IndexedDB:", err);
    return false;
  }
}

export async function getAudioBlob(id) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("Failed to get audio blob from IndexedDB:", err);
    return null;
  }
}

export async function deleteAudioBlob(id) {
  try {
    blobCache.delete(id);
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("Failed to delete audio blob from IndexedDB:", err);
  }
}

// Local Storage for Custom Track Metadata
const STORAGE_KEY = "backbench_custom_tracks_v1";

export function getCustomTracks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to read custom tracks:", e);
    return [];
  }
}

export function saveCustomTracks(tracks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.warn("Failed to save custom tracks:", e);
  }
}

"use client";

// IndexedDB database for persistent audio blobs
const DB_NAME = "backbench_audio_db";
const STORE_NAME = "audio_files";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(id, blob) {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to save audio blob to IndexedDB:", err);
  }
}

export async function getAudioBlob(id) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to get audio blob from IndexedDB:", err);
    return null;
  }
}

export async function deleteAudioBlob(id) {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to delete audio blob from IndexedDB:", err);
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
    console.error("Failed to read custom tracks:", e);
    return [];
  }
}

export function saveCustomTracks(tracks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch (e) {
    console.error("Failed to save custom tracks:", e);
  }
}

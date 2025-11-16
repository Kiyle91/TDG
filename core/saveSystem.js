// ============================================================
// 💾 saveSystem.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Takes a full snapshot of the *running* game
// ✦ Restores player, towers, goblins, worgs, elites, ogres
// ✦ Stores per-profile saves in localStorage (10 slots)
// ✦ Designed for in-game Save / Load overlay
// ============================================================

import { gameState, getCurrencies } from "../utils/gameState.js";
import { getEnemies } from "./goblin.js";
import { getWorg } from "./worg.js";
import { getElites, clearElites } from "./elite.js";
import { getOgres, clearOgres } from "./ogre.js";
import { getTowers } from "./towers.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🔐 STORAGE HELPERS
// ------------------------------------------------------------

const SAVE_KEY = "owck_saves_v1";   // one big object, split by profile key

function safeClone(obj) {
  if (!obj) return obj;
  // All our runtime entities are plain objects -> JSON clone is fine
  return JSON.parse(JSON.stringify(obj));
}

function loadAllSaves() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn("💾 SaveSystem: failed to parse saves:", err);
    return {};
  }
}

function persistAllSaves(all) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn("💾 SaveSystem: failed to write saves:", err);
  }
}

// Per-profile key (keeps slots separate between profiles)
function getProfileKey() {
  const idx = gameState.activeProfileIndex ?? 0;
  return `profile_${idx}`;
}

// ------------------------------------------------------------
// 📸 SNAPSHOT CREATION
// ------------------------------------------------------------

export function snapshotGame() {
  if (!gameState.profile || !gameState.player) {
    throw new Error("No active profile/player to save.");
  }

  const { gold, diamonds } = getCurrencies();
  const towers = safeClone(getTowers() || []);
  const goblins = safeClone(getEnemies() || []);
  const worgs = safeClone(getWorg() || []);
  const elites = safeClone(getElites() || []);
  const ogres = safeClone(getOgres() || []);

  const snapshot = {
    version: 1,
    savedAt: Date.now(),
    profileKey: getProfileKey(),

    // Lightweight summary used for the slot list
    meta: {
      profileName: gameState.profile.name || "Princess",
      map: gameState.progress?.currentMap ?? 1,
      wave: gameState.wave ?? 1,
      totalWaves: gameState.totalWaves ?? 1,
      gold,
      diamonds,
      level: gameState.player.level ?? 1,
      hp: gameState.player.hp ?? 0,
      maxHp: gameState.player.maxHp ?? 0,
    },

    // Core state — enough to restore the combat situation
    progress: safeClone(gameState.progress),
    player: safeClone(gameState.player),
    currencies: { gold, diamonds },

    towers,
    goblins,
    worgs,
    elites,
    ogres,
  };

  console.log("💾 snapshotGame ->", snapshot);
  return snapshot;
}

// ------------------------------------------------------------
// ♻️ SNAPSHOT APPLICATION (in-game)
// ------------------------------------------------------------

export function applySnapshot(snapshot) {
  if (!snapshot) return;
  console.log("♻️ applySnapshot", snapshot);

  // 1) Progress / player / currencies
  if (snapshot.progress) {
    gameState.progress = safeClone(snapshot.progress);
  }

  if (snapshot.player) {
    gameState.player = safeClone(snapshot.player);
  }

  if (snapshot.currencies && gameState.profile?.currencies) {
    gameState.profile.currencies.gold =
      snapshot.currencies.gold ?? gameState.profile.currencies.gold ?? 0;
    gameState.profile.currencies.diamonds =
      snapshot.currencies.diamonds ?? gameState.profile.currencies.diamonds ?? 0;
  }

  // Wave counters (high-level only; internal timers stay as-is)
  if (snapshot.meta) {
    gameState.wave = snapshot.meta.wave ?? gameState.wave;
    gameState.totalWaves = snapshot.meta.totalWaves ?? gameState.totalWaves;
  }

  // 2) Towers
  const towersArr = getTowers();
  towersArr.length = 0;
  if (Array.isArray(snapshot.towers)) {
    snapshot.towers.forEach(t => towersArr.push(safeClone(t)));
  }

  // 3) Goblins
  const gobArr = getEnemies();
  gobArr.length = 0;
  if (Array.isArray(snapshot.goblins)) {
    snapshot.goblins.forEach(g => gobArr.push(safeClone(g)));
  }

  // 4) Worgs
  const worgArr = getWorg();
  if (Array.isArray(worgArr)) {
    worgArr.length = 0;
    if (Array.isArray(snapshot.worgs)) {
      snapshot.worgs.forEach(w => worgArr.push(safeClone(w)));
    }
  }

  // 5) Elites
  clearElites();
  const eliteArr = getElites();
  if (Array.isArray(snapshot.elites)) {
    snapshot.elites.forEach(e => eliteArr.push(safeClone(e)));
  }

  // 6) Ogres
  clearOgres();
  const ogreArr = getOgres();
  if (Array.isArray(snapshot.ogres)) {
    snapshot.ogres.forEach(o => ogreArr.push(safeClone(o)));
  }

  // 7) Refresh HUD so numbers match immediately
  updateHUD();
}

// ------------------------------------------------------------
// 🧊 PUBLIC SLOT API
// ------------------------------------------------------------

export function saveToSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid save slot index");
  }

  const all = loadAllSaves();
  const key = getProfileKey();
  if (!all[key]) all[key] = [];

  const snap = snapshotGame();
  all[key][slot] = snap;
  persistAllSaves(all);

  console.log(`💾 Saved to slot ${slot} for ${key}`);
  return snap;
}

export function loadFromSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid load slot index");
  }

  const all = loadAllSaves();
  const key = getProfileKey();
  const slots = all[key] || [];
  const snap = slots[slot] || null;

  if (!snap) {
    console.warn(`⚠️ No save data in slot ${slot} for ${key}`);
    return null;
  }

  applySnapshot(snap);
  return snap;
}

export function deleteSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid delete slot index");
  }

  const all = loadAllSaves();
  const key = getProfileKey();
  if (!all[key]) return;

  all[key][slot] = null;
  persistAllSaves(all);
  console.log(`🗑️ Deleted save slot ${slot} for ${key}`);
}

export function getSlotSummaries() {
  const all = loadAllSaves();
  const key = getProfileKey();
  const slots = all[key] || [];

  return slots.map((snap, index) => {
    if (!snap) return null;
    const meta = snap.meta || {};
    return {
      index,
      savedAt: snap.savedAt,
      profileName: meta.profileName || "Princess",
      map: meta.map ?? 1,
      wave: meta.wave ?? 1,
      level: meta.level ?? 1,
      gold: meta.gold ?? 0,
      diamonds: meta.diamonds ?? 0,
    };
  });
}

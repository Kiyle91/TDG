// ============================================================
// 💾 saveSystem.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Full combat snapshot + restore system
// ✦ Up to 10 per-profile save slots
// ✦ Safe cosmetics handling + persistent diamonds
// ============================================================
/* ------------------------------------------------------------
 * MODULE: saveSystem.js
 * PURPOSE:
 *   Provides full save/load infrastructure for campaign and
 *   in-game save slots. Creates a snapshot of the *running*
 *   game including player state, map progress, spires, and
 *   all active enemies. Applies snapshots safely, preserving
 *   cosmetic unlocks and persistent currencies.
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, getCurrencies, saveProfiles } from "../utils/gameState.js";
import { getGoblins } from "../entities/goblin.js";
import { getWorg } from "../entities/worg.js";
import { getElites, clearElites } from "../entities/elite.js";
import { getOgres, clearOgres } from "../entities/ogre.js";
import { getSpires } from "../spires/spires.js";
import { updateHUD, updateBraveryBar } from "../screenManagement/ui.js";
import { getTrolls } from "../entities/troll.js";
import { getCrossbows } from "../entities/crossbow.js";
import { restoreWaveFromSnapshot, getWaveSnapshotState } from "../core/game.js";


// ------------------------------------------------------------
// 🔐 STORAGE HELPERS
// ------------------------------------------------------------

const SAVE_KEY = "owck_saves_v1";

function safeClone(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

function clampMapId(id) {
  const n = Number(id) || 1;
  return Math.min(Math.max(n, 1), 9);
}

function sanitizeProgress(prog) {
  const baseUnlocked = [true, false, false, false, false, false, false, false, false];
  const progress = prog ? JSON.parse(JSON.stringify(prog)) : {};

  // Ensure mapsUnlocked is valid length and first map unlocked
  if (!Array.isArray(progress.mapsUnlocked) || progress.mapsUnlocked.length !== 9) {
    progress.mapsUnlocked = [...baseUnlocked];
  } else if (!progress.mapsUnlocked[0]) {
    progress.mapsUnlocked[0] = true;
  }

  progress.currentMap = clampMapId(progress.currentMap || 1);
  return progress;
}

function sanitizeBravery(bravery) {
  const fallback = { current: 0, max: 100, charged: false, draining: false };
  if (!bravery) return { ...fallback };

  const max = Math.max(1, Number(bravery.max) || fallback.max);
  const currentRaw = Number(bravery.current);
  const current = Math.min(max, Math.max(0, Number.isFinite(currentRaw) ? currentRaw : 0));

  return {
    current,
    max,
    charged: bravery.charged === true && current >= max,
    draining: bravery.draining === true && current > 0,
  };
}

function loadAllSaves() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistAllSaves(all) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}

function getProfileIndex() {
  const idx = gameState.activeProfileIndex;
  return Number.isInteger(idx) ? idx : 0;
}

function getActiveProfile() {
  if (gameState.profile) return gameState.profile;
  const idx = getProfileIndex();
  return Array.isArray(gameState.profiles)
    ? gameState.profiles[idx] || null
    : null;
}

function getProfileStorageKeys() {
  const keys = [];
  const profile = getActiveProfile();
  if (profile?.id) keys.push(`profile_${profile.id}`);
  keys.push(`profile_${getProfileIndex()}`);
  return [...new Set(keys)];
}

function getPrimaryProfileKey() {
  return getProfileStorageKeys()[0];
}

function resolveProfileSlots(all, { create = false } = {}) {
  const [primary, ...fallbacks] = getProfileStorageKeys();
  let slots = all[primary];
  let migrated = false;

  if (!slots) {
    for (const key of fallbacks) {
      if (!all[key]) continue;
      slots = all[key];
      all[primary] = slots;
      if (key !== primary) delete all[key];
      migrated = true;
      break;
    }
  }

  if (!slots && create) {
    slots = [];
    all[primary] = slots;
    migrated = true;
    for (const key of fallbacks) {
      if (key !== primary) delete all[key];
    }
  }

  return { slots: slots || null, migrated, primary };
}


// ------------------------------------------------------------
// 📸 SNAPSHOT CREATION
// ------------------------------------------------------------
export function snapshotGame() {
  if (!gameState.profile || !gameState.player) {
    throw new Error("No active profile/player to save.");
  }

  const { gold, diamonds } = getCurrencies();
  const waveRuntime = typeof getWaveSnapshotState === "function"
    ? getWaveSnapshotState()
    : {};
  const normalizedWaveState = {
    firstWaveStarted: waveRuntime.firstWaveStarted === true,
    waveActive: waveRuntime.waveActive === true,
    waveCleared: waveRuntime.waveCleared === true,
    betweenWaveTimer:
      typeof waveRuntime.betweenWaveTimer === "number"
        ? Math.max(0, waveRuntime.betweenWaveTimer)
        : 0,
    betweenWaveTimerActive: waveRuntime.betweenWaveTimerActive === true,
  };

  const sanitizedProgress = sanitizeProgress(gameState.progress);

  return {
    version: 1,
    savedAt: Date.now(),
    profileKey: getPrimaryProfileKey(),
    profileId: getActiveProfile()?.id || null,

    meta: {
      profileName: gameState.profile.name || "Princess",
      map: sanitizedProgress.currentMap,
      wave: gameState.wave ?? 1,
      totalWaves: gameState.totalWaves ?? 1,
      gold,
      diamonds,
      level: gameState.player.level ?? 1,
      hp: gameState.player.hp ?? 0,
      maxHp: gameState.player.maxHp ?? 0,
      firstWaveStarted: normalizedWaveState.firstWaveStarted,
      waveState: normalizedWaveState,
    },

    progress: sanitizedProgress,
    player: safeClone(gameState.player),
    bravery: sanitizeBravery(gameState.bravery),

    spires: safeClone(getSpires() || []),
    goblins: safeClone(getGoblins() || []),
    worgs: safeClone(getWorg() || []),
    elites: safeClone(getElites() || []),
    ogres: safeClone(getOgres() || []),
    trolls: safeClone(getTrolls?.() || []),
    crossbows: safeClone(getCrossbows?.() || []),
  };
}


// ------------------------------------------------------------
// ♻️ SNAPSHOT APPLICATION — SAFE ORDER
// ------------------------------------------------------------
export function applySnapshot(snapshot) {
  if (!snapshot) return;

  // ----------------------------------------------------------
  // 1) Restore wave engine BEFORE anything else
  // ----------------------------------------------------------
  if (snapshot.meta) {
    restoreWaveFromSnapshot(snapshot.meta, snapshot);
  }

  // ----------------------------------------------------------
  // 2) Ensure core structures exist
  // ----------------------------------------------------------
  if (!gameState.progress) gameState.progress = {};
  if (!gameState.player) gameState.player = {};
  if (!gameState.profile) gameState.profile = {};

  // Always unpause
  gameState.paused = false;
  gameState.isPaused = false;
  window.gameOver = false;
  window.betweenWaveTimerActive = false;

  // ----------------------------------------------------------
  // 3) Preserve cosmetics BEFORE overwrite
  // ----------------------------------------------------------
  const currentSkin = gameState.player.skin || "glitter";
  const currentUnlocked = Array.isArray(gameState.player.unlockedSkins)
    ? [...gameState.player.unlockedSkins]
    : ["glitter"];

  // ----------------------------------------------------------
  // 4) Restore progress
  // ----------------------------------------------------------
  if (snapshot.progress) {
    gameState.progress = sanitizeProgress(snapshot.progress);
  } else {
    gameState.progress = sanitizeProgress(gameState.progress);
  }

  // ----------------------------------------------------------
  // 5) Restore bravery
  // ----------------------------------------------------------
  gameState.bravery = sanitizeBravery(snapshot.bravery || gameState.bravery);

  // ----------------------------------------------------------
  // 6) Restore player (minus cosmetics)
  // ----------------------------------------------------------
  if (snapshot.player) {
    const restored = JSON.parse(JSON.stringify(snapshot.player));
    delete restored.skin;
    delete restored.unlockedSkins;
    gameState.player = restored;
  }

  // Restore cosmetics
  gameState.player.skin = currentSkin;
  gameState.player.unlockedSkins = currentUnlocked;

  // ----------------------------------------------------------
  // 7) HUD metadata
  // ----------------------------------------------------------
  if (snapshot.meta) {
    gameState.wave = snapshot.meta.wave ?? gameState.wave;
    gameState.totalWaves = snapshot.meta.totalWaves ?? gameState.totalWaves;
  }

  // ----------------------------------------------------------
  // 8) Restore only gold (diamonds persist)
  // ----------------------------------------------------------
  if (snapshot.meta) {
    const prof = gameState.profile;
    if (prof?.currencies) {
      prof.currencies.gold = snapshot.meta.gold ?? prof.currencies.gold ?? 0;
    }
  }

  // ----------------------------------------------------------
  // 9) Restore SPIRES + ENEMIES
  // ----------------------------------------------------------
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // SPIRES
  const spArr = getSpires();
  spArr.length = 0;
  (snapshot.spires || []).forEach(s => spArr.push(clone(s)));

  // GOBLINS
  const gArr = getGoblins();
  gArr.length = 0;
  (snapshot.goblins || []).forEach(g => gArr.push(clone(g)));

  // WORG
  const wArr = getWorg();
  if (Array.isArray(wArr)) {
    wArr.length = 0;
    (snapshot.worgs || []).forEach(w => wArr.push(clone(w)));
  }

  // ELITES
  clearElites();
  const eArr = getElites();
  (snapshot.elites || []).forEach(e => eArr.push(clone(e)));

  // OGRES
  clearOgres();
  const oArr = getOgres();
  (snapshot.ogres || []).forEach(o => oArr.push(clone(o)));

  // TROLLS
  const tArr = getTrolls?.();
  if (Array.isArray(tArr)) {
    tArr.length = 0;
    (snapshot.trolls || []).forEach(t => tArr.push(clone(t)));
  }

  // CROSSBOWS
  const cArr = getCrossbows?.();
  if (Array.isArray(cArr)) {
    cArr.length = 0;
    (snapshot.crossbows || []).forEach(c => cArr.push(clone(c)));
  }

  // ----------------------------------------------------------
  // 10) Update HUD + bravery
  // ----------------------------------------------------------
  updateHUD();
  updateBraveryBar();
}



// ------------------------------------------------------------
// 🧊 PUBLIC SAVE/LOAD API
// ------------------------------------------------------------
export function saveToSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid save slot index");
  }

  const all = loadAllSaves();
  const { slots } = resolveProfileSlots(all, { create: true });
  if (!slots) {
    throw new Error("Unable to resolve save slots for active profile");
  }

  const snap = snapshotGame();
  slots[slot] = snap;
  persistAllSaves(all);

  // ??? Persist last save slot into the active profile
  const profile = gameState.profile;
  if (profile) {
    profile.lastSave = slot;
    saveProfiles(); // <- this writes it to td_profiles
  }

  return snap;
}

export function loadFromSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid load slot index");
  }

  const all = loadAllSaves();
  const { slots, migrated } = resolveProfileSlots(all);
  if (migrated) persistAllSaves(all);
  const list = slots || [];
  return list[slot] || null;
}

export function deleteSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid delete slot index");
  }

  const all = loadAllSaves();
  const { slots } = resolveProfileSlots(all, { create: true });
  if (!slots) return;

  slots[slot] = null;
  persistAllSaves(all);
}

export function getSlotSummaries() {
  const all = loadAllSaves();
  const { slots, migrated } = resolveProfileSlots(all);
  if (migrated) persistAllSaves(all);
  const list = slots || [];

  return list.map((snap, index) => {
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

export function autoSave() {
  const snap = snapshotGame();

  const all = loadAllSaves();
  const { slots } = resolveProfileSlots(all, { create: true });
  if (!slots) return snap;

  // Always use slot 0 for autosave
  slots[0] = snap;

  // Update lastSave pointer
  const profile = gameState.profile;
  if (profile) profile.lastSave = 0;

  persistAllSaves(all);
  saveProfiles();
}
// ============================================================
// 🌟 END OF FILE
// ============================================================

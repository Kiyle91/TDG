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
 *   cosmetic unlocks and persistent currencies such as diamonds.
 *
 * SUMMARY:
 *   • snapshotGame() — captures a full combat snapshot
 *   • applySnapshot() — restores player/world state after init
 *   • saveToSlot() / loadFromSlot() / deleteSlot()
 *   • getSlotSummaries() — for UI slot display
 *
 * FEATURES:
 *   • Per-profile isolated save slots (10 per profile)
 *   • Stores only mutable combat data — never overwrites
 *     persistent cosmetics or diamond currency
 *   • Safe deep-clone via JSON clone (OK for simple objects)
 *   • Robust restore order:
 *       1) progress     (map + wave metadata)
 *       2) player       (stats, hp/mana, level)
 *       3) cosmetics    (restored from current state)
 *       4) HUD metadata (wave counts)
 *       5) gold only    (never diamonds)
 *       6) spires       (array rebuilt)
 *       7) goblins      (array rebuilt)
 *       8) worgs        (array rebuilt)
 *       9) elites       (array rebuilt)
 *      10) ogres        (array rebuilt)
 *
 * TECHNICAL NOTES:
 *   • Save data stored in localStorage under a single root key
 *   • Snapshot versioning allows forward compatibility
 *   • Must call initGame() BEFORE applying snapshot
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, getCurrencies } from "../utils/gameState.js";
import { getGoblins } from "./goblin.js";
import { getWorg } from "./worg.js";
import { getElites, clearElites } from "./elite.js";
import { getOgres, clearOgres } from "./ogre.js";
import { getSpires } from "./spires.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🔐 STORAGE HELPERS
// ------------------------------------------------------------

const SAVE_KEY = "owck_saves_v1";

function safeClone(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
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
  } catch {}
}

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

  const snapshot = {
    version: 1,
    savedAt: Date.now(),
    profileKey: getProfileKey(),

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

    progress: safeClone(gameState.progress),
    player: safeClone(gameState.player),

    spires: safeClone(getSpires() || []),
    goblins: safeClone(getGoblins() || []),
    worgs: safeClone(getWorg() || []),
    elites: safeClone(getElites() || []),
    ogres: safeClone(getOgres() || []),
    trolls: safeClone(getTrolls?.() || []),
    crossbows: safeClone(getCrossbows?.() || []),
  };

  return snapshot;
}

// ------------------------------------------------------------
// ♻️ SNAPSHOT APPLICATION — SAFE ORDER
// ------------------------------------------------------------
export function applySnapshot(snapshot) {
  if (!snapshot) return;

  // 1) Preserve cosmetics
  const currentSkin = gameState.player?.skin || "glitter";
  const currentUnlocked = gameState.player?.unlockedSkins || ["glitter"];

  // 2) Restore progress
  if (snapshot.progress) {
    gameState.progress = safeClone(snapshot.progress);
  }

  // 3) Restore player (without cosmetics)
  if (snapshot.player) {
    const restored = safeClone(snapshot.player);
    delete restored.skin;
    delete restored.unlockedSkins;
    gameState.player = restored;
  }

  // Restore cosmetics
  gameState.player.skin = currentSkin;
  gameState.player.unlockedSkins = currentUnlocked;

  // 4) HUD metadata
  if (snapshot.meta) {
    gameState.wave = snapshot.meta.wave ?? gameState.wave;
    gameState.totalWaves = snapshot.meta.totalWaves ?? gameState.totalWaves;
  }

  // 5) Restore only gold (never diamonds)
  if (snapshot.meta) {
    const prof = gameState.profile;
    if (prof?.currencies) {
      prof.currencies.gold =
        snapshot.meta.gold ??
        prof.currencies.gold ??
        0;
    }
  }

  // 6) Restore spires
  const spArr = getSpires();
  spArr.length = 0;
  (snapshot.spires || []).forEach(t => spArr.push(safeClone(t)));

  // 7) Restore goblins
  const gArr = getGoblins();
  gArr.length = 0;
  (snapshot.goblins || []).forEach(g => gArr.push(safeClone(g)));

  // 8) Restore worgs
  const wArr = getWorg();
  if (Array.isArray(wArr)) {
    wArr.length = 0;
    (snapshot.worgs || []).forEach(w => wArr.push(safeClone(w)));
  }

  // 9) Restore elites
  clearElites();
  const eArr = getElites();
  (snapshot.elites || []).forEach(e => eArr.push(safeClone(e)));

  // 10) Restore ogres
  clearOgres();
  const oArr = getOgres();
  (snapshot.ogres || []).forEach(o => oArr.push(safeClone(o)));

  //  11) Restore trolls 
  const tArr = getTrolls();
  if (Array.isArray(tArr)) {
    tArr.length = 0;
    (snapshot.trolls || []).forEach(t => tArr.push(safeClone(t)));
  }

  //  12) Restore crossbows 
  const cArr = getCrossbows();
  if (Array.isArray(cArr)) {
    cArr.length = 0;
    (snapshot.crossbows || []).forEach(c => cArr.push(safeClone(c)));
  }

  // 13) Refresh HUD
  updateHUD();
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
  const key = getProfileKey();
  if (!all[key]) all[key] = [];

  const snap = snapshotGame();
  all[key][slot] = snap;
  persistAllSaves(all);

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

  if (!snap) return null;

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

// ============================================================
// 🌟 END OF FILE
// ============================================================

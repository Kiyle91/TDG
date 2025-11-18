// ============================================================
// 💾 saveSystem.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Takes a full snapshot of the *running* game
// ✦ Restores player, spires, goblins, worgs, elites, ogres
// ✦ Stores per-profile saves in localStorage (10 slots)
// ✦ Designed for in-game Save / Load overlay
// ============================================================

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
  const spires = safeClone(getSpires() || []);
  const goblins = safeClone(getGoblins() || []);
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


    spires,
    goblins,
    worgs,
    elites,
    ogres,
  };

  console.log("💾 snapshotGame ->", snapshot);
  return snapshot;
}

// ------------------------------------------------------------
// ♻️ SNAPSHOT APPLICATION (in-game) — FINAL, SAFE VERSION
// ------------------------------------------------------------
export function applySnapshot(snapshot) {
  if (!snapshot) return;
  console.log("♻️ applySnapshot", snapshot);

  // ⭐ 1) Preserve profile-wide cosmetic data BEFORE applying snapshot
  const currentSkin = gameState.player?.skin || "glitter";
  const currentUnlocked =
    gameState.player?.unlockedSkins || ["glitter"];

  // ------------------------------------------------------------
  // 2) Restore PROGRESS
  // ------------------------------------------------------------
  if (snapshot.progress) {
    gameState.progress = safeClone(snapshot.progress);
  }

  // ------------------------------------------------------------
  // 3) Restore PLAYER (but NEVER touch skin data)
  // ------------------------------------------------------------
  if (snapshot.player) {
    const restored = safeClone(snapshot.player);

    // Strip out cosmetics from snapshot
    delete restored.skin;
    delete restored.unlockedSkins;

    gameState.player = restored;
  }

  // Restore cosmetics BACK onto player
  gameState.player.skin = currentSkin;
  gameState.player.unlockedSkins = currentUnlocked;

  // ------------------------------------------------------------
  // 4) Restore HUD meta (wave, totalWaves)
  // ------------------------------------------------------------
  if (snapshot.meta) {
    gameState.wave =
      snapshot.meta.wave ?? gameState.wave;
    gameState.totalWaves =
      snapshot.meta.totalWaves ?? gameState.totalWaves;
  }

  // ------------------------------------------------------------
  // ⭐ 5) Restore ONLY GOLD (NOT diamonds)
  // ------------------------------------------------------------
  if (snapshot.meta) {
    const prof = gameState.profile;
    if (prof && prof.currencies) {
      prof.currencies.gold =
        snapshot.meta.gold ??
        prof.currencies.gold ??
        0;

      // ⭐ DO NOT RESTORE DIAMONDS.
      // Diamonds remain global & persistent.
    }
  }

  // ------------------------------------------------------------
  // 6) Restore spires
  // ------------------------------------------------------------
  const spiresArr = getSpires();
  spiresArr.length = 0;
  if (Array.isArray(snapshot.spires)) {
    snapshot.spires.forEach(t =>
      spiresArr.push(safeClone(t))
    );
  }

  // ------------------------------------------------------------
  // 7) Restore goblins
  // ------------------------------------------------------------
  const gobArr = getGoblins();
  gobArr.length = 0;
  if (Array.isArray(snapshot.goblins)) {
    snapshot.goblins.forEach(g =>
      gobArr.push(safeClone(g))
    );
  }

  // ------------------------------------------------------------
  // 8) Restore worgs
  // ------------------------------------------------------------
  const worgArr = getWorg();
  if (Array.isArray(worgArr)) {
    worgArr.length = 0;
    if (Array.isArray(snapshot.worgs)) {
      snapshot.worgs.forEach(w =>
        worgArr.push(safeClone(w))
      );
    }
  }

  // ------------------------------------------------------------
  // 9) Restore elites
  // ------------------------------------------------------------
  clearElites();
  const eliteArr = getElites();
  if (Array.isArray(snapshot.elites)) {
    snapshot.elites.forEach(e =>
      eliteArr.push(safeClone(e))
    );
  }

  // ------------------------------------------------------------
  // 🔟 Restore ogres
  // ------------------------------------------------------------
  clearOgres();
  const ogreArr = getOgres();
  if (Array.isArray(snapshot.ogres)) {
    snapshot.ogres.forEach(o =>
      ogreArr.push(safeClone(o))
    );
  }

  // ------------------------------------------------------------
  // 11) Refresh HUD immediately
  // ------------------------------------------------------------
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

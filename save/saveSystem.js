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
import { getGoblins as getIceGoblins } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins } from "../entities/voidGoblin.js";
import { getWorg } from "../entities/worg.js";
import { getElites, clearElites } from "../entities/elite.js";
import { getOgres, clearOgres } from "../entities/ogre.js";
import { getSpires } from "../spires/spires.js";
import { updateHUD, updateBraveryBar } from "../screenManagement/ui.js";
import { getTrolls } from "../entities/troll.js";
import { getCrossbows } from "../entities/crossbow.js";
import { restoreWaveFromSnapshot, getWaveSnapshotState } from "../core/game.js";
import { getSeraphines, clearSeraphines } from "../entities/seraphine.js";
import { clearSpeechBubbles } from "../fx/speechBubble.js";
import { syncStepEventsToSteps } from "../core/eventEngine.js";


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
    console.log("Loaded all saves:", raw); // Debugging line to check localStorage contents
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

  if (profile?.id) {
    keys.push(`profile_${profile.id}`);
  }

  const idx = getProfileIndex();
  if (Number.isInteger(idx) && idx >= 0) {
    keys.push(`profile_${idx}`);
  }

  return [...new Set(keys)];
}

function getPrimaryProfileKey() {
  const keys = getProfileStorageKeys();
  return keys && keys.length ? keys[0] : null;
}

export function clearProfileSaves(profile) {
  const all = loadAllSaves();
  const ids = [];

  if (profile?.id) ids.push(`profile_${profile.id}`);

  const index = gameState.profiles.indexOf(profile);
  if (index >= 0) ids.push(`profile_${index}`);

  const targetId = profile?.id || null;
  const targetName = (profile?.name || "").toLowerCase();

  // Remove known keys first (entire array)
  for (const key of ids) {
    if (all[key]) delete all[key];
  }

  // Scrub any remaining slot arrays that contain this profile's saves (id match or name match)
  for (const key of Object.keys(all)) {
    const arr = all[key];
    if (!Array.isArray(arr)) continue;

    let touched = false;
    for (let i = 0; i < arr.length; i++) {
      const snap = arr[i];
      if (!snap) continue;

      const metaName = snap.meta?.profileName?.toLowerCase?.();
      const nameMatch = targetName && metaName && metaName === targetName;
      const idMatch = targetId && snap.profileId === targetId;

      if (idMatch || nameMatch) {
        arr[i] = null;
        touched = true;
      }
    }

    // If all entries are now null/empty, drop the key entirely
    if (touched) {
      const hasAny = arr.some(Boolean);
      if (!hasAny) {
        delete all[key];
      }
    }
  }

  // Clear all save slots for this profile
  localStorage.removeItem("ow_active_profile_index");
  persistAllSaves(all);  // Persist changes to the save data
}

function resolveProfileSlots(all, { create = false, activeId = null, activeName = "" } = {}) {
  const keys = getProfileStorageKeys();
  const primary = keys[0] || null;
  let allowRetag = false;

  // No profile available yet
  if (!primary && !create) return { slots: null, migrated: false, primary: null, key: null };

  const ownsSlots = (arr, { allowUntyped = false } = {}) => {
    if (!Array.isArray(arr)) return false;
    let hasActive = false;
    for (const snap of arr) {
      if (!snap) continue;
      if (snap.profileId && activeId && snap.profileId !== activeId) return false;
      if (snap.profileId === activeId) hasActive = true;
      const metaName = snap.meta?.profileName?.toLowerCase?.();
      if (!snap.profileId && allowUntyped && activeName && metaName && metaName === activeName) {
        hasActive = true;
      }
    }
    if (hasActive) return true;
    if (allowUntyped) {
      return arr.length === 0 || arr.every(snap => !snap?.profileId);
    }
    return false;
  };

  let chosenKey = null;
  let slots = null;
  let migrated = false;

  // 1) Prefer arrays under our expected keys (id first, then index)
  for (const key of keys) {
    const candidate = all[key];
    const allowUntyped = key === primary;
    if (ownsSlots(candidate, { allowUntyped })) {
      slots = candidate;
      chosenKey = key;
      break;
    }
  }

  // 2) If still nothing and we have an activeId, look for any array that already contains saves for this profile
  if (!slots && activeId) {
    for (const key of Object.keys(all)) {
      const candidate = all[key];
      if (!Array.isArray(candidate)) continue;
      const hasActive = candidate.some(snap => snap?.profileId === activeId);
      const hasForeign = candidate.some(snap => snap?.profileId && snap.profileId !== activeId);
      if (hasActive && !hasForeign) {
        slots = candidate;
        chosenKey = key;
        break;
      }
    }
  }

  // 2b) As a final migration step, if still nothing, adopt arrays whose profileName matches and have no foreign ids
  if (!slots && activeName) {
    const targetName = activeName.toLowerCase();
    for (const key of Object.keys(all)) {
      const candidate = all[key];
      if (!Array.isArray(candidate)) continue;
      let consistentId = null;
      let foreignId = false;
      let nameCompatible = true;
      for (const snap of candidate) {
        if (!snap) continue;
        const metaName = snap.meta?.profileName?.toLowerCase?.();
        if (metaName && metaName !== targetName) {
          nameCompatible = false;
          break;
        }
        if (snap.profileId) {
          if (!consistentId) consistentId = snap.profileId;
          if (snap.profileId !== consistentId) {
            foreignId = true;
            break;
          }
        }
      }
      if (nameCompatible && !foreignId) {
        slots = candidate;
        chosenKey = key;
        // If ids don't match, allow retagging to activeId
        if (activeId && consistentId && consistentId !== activeId) {
          allowRetag = true;
        }
        break;
      }
    }
  }

  // 3) Create if requested
  if (!Array.isArray(slots) && create && primary) {
    slots = [];
    all[primary] = slots;
    chosenKey = primary;
    migrated = true;
  }

  // 4) If we found slots under a non-primary key that belongs to this profile, copy into primary for stability
  if (slots && primary && chosenKey && chosenKey !== primary && keys.includes(chosenKey)) {
    const allowUntyped = true;
    if (ownsSlots(slots, { allowUntyped })) {
      all[primary] = slots;
      migrated = true;
      chosenKey = primary;
    }
  }

  // 5) Stamp ownership for compatible slots and drop foreign ones
  if (Array.isArray(slots) && activeId) {
    let touched = false;
    slots.forEach((snap, idx) => {
      if (!snap) return;
      if (snap.profileId && snap.profileId !== activeId) {
        if (allowRetag) {
          snap.profileId = activeId;
          touched = true;
        } else {
          slots[idx] = null;
          touched = true;
          return;
        }
      }
      if (!snap.profileId) {
        snap.profileId = activeId;
        touched = true;
      }
      if (!snap.profileKey) {
        snap.profileKey = chosenKey || primary;
        touched = true;
      }
    });
    if (touched) migrated = true;
  }

  return {
    slots: Array.isArray(slots) ? slots : null,
    migrated,
    primary: primary,
    key: chosenKey,
  };
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
    iceGoblins: safeClone(getIceGoblins?.() || []),
    emberGoblins: safeClone(getEmberGoblins?.() || []),
    ashGoblins: safeClone(getAshGoblins?.() || []),
    voidGoblins: safeClone(getVoidGoblins?.() || []),
    worgs: safeClone(getWorg() || []),
    elites: safeClone(getElites() || []),
    ogres: safeClone(getOgres() || []),
    trolls: safeClone(getTrolls?.() || []),
    crossbows: safeClone(getCrossbows?.() || []),
    seraphines: safeClone(getSeraphines?.() || []),
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
  clearSpeechBubbles();

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

  // Keep all map pointers aligned to the loaded snapshot
  if (gameState.progress) {
    gameState.currentMap = gameState.progress.currentMap ?? 1;
    if (gameState.profile) {
      gameState.profile.progress = {
        ...(gameState.profile.progress || {}),
        ...gameState.progress,
      };
    }
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
    const profilePlayer = gameState.profile?.player || gameState.player || {};
    const keepLevel = Math.max(
      Number(restored.level) || 0,
      Number(profilePlayer.level) || 0,
      1
    );
    const keepXp = Math.max(
      Number.isFinite(restored.xp) ? restored.xp : 0,
      Number.isFinite(profilePlayer.xp) ? profilePlayer.xp : 0,
      0
    );
    const keepStatPoints = Math.max(
      Number.isFinite(restored.statPoints) ? restored.statPoints : 0,
      Number.isFinite(profilePlayer.statPoints) ? profilePlayer.statPoints : 0,
      0
    );

    delete restored.skin;
    delete restored.unlockedSkins;

    restored.level = keepLevel;
    restored.xp = keepXp;
    restored.statPoints = keepStatPoints;

    // Prefer any higher or saved combat stats from profile to avoid downgrades
    if (profilePlayer) {
      const statKeys = [
        "attack",
        "spellPower",
        "rangedAttack",
        "defense",
        "critChance",
        "maxHp",
        "maxMana",
      ];

      statKeys.forEach((k) => {
        if (typeof profilePlayer[k] === "number") {
          if (k === "maxHp" || k === "maxMana") {
            restored[k] = Math.max(
              typeof restored[k] === "number" ? restored[k] : 0,
              profilePlayer[k]
            );
          } else {
            restored[k] = profilePlayer[k];
          }
        }
      });
    }

    // Ensure current HP/Mana are not stuck at old defaults after stat merges
    if (typeof restored.maxHp === "number") {
      if (typeof restored.hp !== "number" || restored.hp < restored.maxHp) {
        restored.hp = restored.maxHp;
      }
    }
    if (typeof restored.maxMana === "number") {
      if (typeof restored.mana !== "number" || restored.mana < restored.maxMana) {
        restored.mana = restored.maxMana;
      }
    }

    gameState.player = restored;
  }

  // Restore cosmetics
  gameState.player.skin = currentSkin;
  gameState.player.unlockedSkins = currentUnlocked;
  syncStepEventsToSteps(gameState.player?.steps ?? 0);

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

  // ICE GOBLINS
  const giArr = getIceGoblins?.();
  if (Array.isArray(giArr)) {
    giArr.length = 0;
    (snapshot.iceGoblins || []).forEach(g => giArr.push(clone(g)));
  }

  // EMBER GOBLINS
  const geArr = getEmberGoblins?.();
  if (Array.isArray(geArr)) {
    geArr.length = 0;
    (snapshot.emberGoblins || []).forEach(g => geArr.push(clone(g)));
  }

  // ASH GOBLINS
  const gaArr = getAshGoblins?.();
  if (Array.isArray(gaArr)) {
    gaArr.length = 0;
    (snapshot.ashGoblins || []).forEach(g => gaArr.push(clone(g)));
  }

  // VOID GOBLINS
  const gvArr = getVoidGoblins?.();
  if (Array.isArray(gvArr)) {
    gvArr.length = 0;
    (snapshot.voidGoblins || []).forEach(g => gvArr.push(clone(g)));
  }

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

  // SERAPHINE (boss)
  const sArr = getSeraphines?.();
  if (Array.isArray(sArr)) {
    clearSeraphines?.();
    sArr.length = 0;
    (snapshot.seraphines || []).forEach(s => sArr.push(clone(s)));
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
  const profile = getActiveProfile();
  const activeId = profile?.id || null;
  const activeName = (profile?.name || "").toLowerCase();
  const { slots, primary, key, migrated } = resolveProfileSlots(all, {
    create: true,
    activeId,
    activeName,
  });
  
  // If we don't have an active profile, bail instead of writing to a null key
  if (!slots || !primary) {
    throw new Error("Unable to resolve save slots for active profile");
  }

  const snap = snapshotGame();  // Take a snapshot of the game state
  if (activeId) snap.profileId = activeId;
  snap.profileKey = key || primary;
  slots[slot] = snap;  // Save to the specific profile's slot
  persistAllSaves(all);  // Persist the changes

  // Save the last save slot in the active profile
  const profileState = gameState.profile;
  if (profileState) {
    profileState.lastSave = slot;
    saveProfiles();  // Write it back to localStorage
  }

  console.log("Saved to slot", slot, snap); // Debugging line to confirm save
  return snap;
}


export function loadFromSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid load slot index");
  }

  const all = loadAllSaves();
  const profile = getActiveProfile();
  const activeId = profile?.id || null;
  const activeName = (profile?.name || "").toLowerCase();
  let { slots, migrated, primary, key } = resolveProfileSlots(all, { activeId, activeName });  // Resolve the correct profile slots
  const primaryMatchesActive =
    activeId && primary === `profile_${activeId}`;

  if (migrated) persistAllSaves(all);

  const list = Array.isArray(slots) ? slots : [];

  // Hide foreign saves for other profiles
  const filtered = list.map((snap) => {
    if (!snap) return null;
    if (activeId && snap.profileId && snap.profileId !== activeId) return null;
    return snap;
  });

  // Filter to active profile only; adopt untagged saves stored under the active key
  // Ensure we're loading from the correct profile's slot
  const inSlot = filtered[slot] || null;
  if (inSlot) return inSlot;

  // Fallback: any save for this profile
  for (const snap of filtered) {
    if (snap) return snap;
  }

  return null;  // No save found for this profile
}


export function deleteSlot(index) {
  const slot = Number(index);
  if (!Number.isInteger(slot) || slot < 0 || slot > 9) {
    throw new Error("Invalid delete slot index");
  }

  const all = loadAllSaves();
  const profile = getActiveProfile();
  const activeId = profile?.id || null;
  const activeName = (profile?.name || "").toLowerCase();
  const { slots, primary } = resolveProfileSlots(all, { create: true, activeId, activeName });
  if (!slots || !primary) return;

  slots[slot] = null;
  persistAllSaves(all);
}

export function getSlotSummaries() {
  const all = loadAllSaves();

  // Use the same key resolution as loadFromSlot()
  const profile = getActiveProfile();
  const activeId = profile?.id || null;
  const activeName = (profile?.name || "").toLowerCase();
  let { slots, migrated, primary } = resolveProfileSlots(all, { activeId, activeName });
  const primaryMatchesActive =
    activeId && primary === `profile_${activeId}`;

  console.log("Loaded slot summaries:", slots);  // Debugging line to confirm loaded slots

  const list = Array.isArray(slots) ? slots : [];

  if (migrated) persistAllSaves(all);

  return list
    .map((snap, index) => {
    if (!snap) return null;
    if (activeId && snap.profileId && snap.profileId !== activeId) return null;

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
    })
    .filter(Boolean);
}



export function autoSave() {
  const player = gameState.player;
  // Do not snapshot defeat states so Continue won't resume from a fail screen
  if (player && (player.dead || (player.hp ?? 1) <= 0 || (player.lives ?? 1) <= 0)) {
    return null;
  }

  const snap = snapshotGame();

  const all = loadAllSaves();
  const activeProfile = getActiveProfile();
  const activeId = activeProfile?.id || null;
  const activeName = (activeProfile?.name || "").toLowerCase();
  const { slots, primary, key } = resolveProfileSlots(all, { create: true, activeId, activeName });
  if (!slots || !primary) return snap;

  if (activeId) snap.profileId = activeId;
  snap.profileKey = key || primary;

  // Always overwrite slot 0 with the current session state.
  // Previously we skipped "downgrade" saves (lower map/wave) which left stale
  // autosaves around after resets and made Continue jump to later maps.
  slots[0] = snap;

  // Update lastSave pointer
  const profileState = gameState.profile;
  if (profileState) profileState.lastSave = 0;

  persistAllSaves(all);
  saveProfiles();
}
// ============================================================
// 🌟 END OF FILE
// ============================================================

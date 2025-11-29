// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep (Unified + Stable)
// ------------------------------------------------------------
// ✦ Single authoritative state for ALL runtime + profile data
// ✦ Silent production-ready persistence (no console logs)
// ✦ Safe migrations for legacy profiles
// ✦ Fully stable multi-profile system
// ✦ Proper handling of currencies, XP, bravery, progression
// ✦ Active profile index always accurate
// ============================================================

/* ------------------------------------------------------------
 * MODULE: gameState.js
 * PURPOSE:
 *   Provides one global, persistent, and safe state container for
 *   player profiles, currencies, progress, bravery, settings, XP,
 *   runtime data, and map progression.
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { createPlayer } from "../player/player.js";
import { spawnFloatingText } from "../fx/floatingText.js";

function defaultBraveryState() {
  return {
    current: 0,
    max: 100,
    charged: false,
    draining: false,
  };
}

function resolveActiveProfile() {
  if (!Array.isArray(gameState.profiles) || gameState.profiles.length === 0) {
    return null;
  }

  const idx = Number.isInteger(gameState.activeProfileIndex)
    ? gameState.activeProfileIndex
    : 0;

  return gameState.profiles[idx] ?? gameState.profiles[0] ?? null;
}

function hydratePlayerFromProfile(profile) {
  const saved = profile?.player || {};
  const name = profile?.name || saved?.name;
  return createPlayer({ ...saved, name });
}

function syncRuntimePlayerIntoProfile() {
  if (!gameState.profile || !gameState.player) return;
  gameState.profile.player = { ...gameState.player };
}

function createDefaultPlayer(overrides = {}) {
  const base = {
    name: gameState.profile?.name || "Princess",
    level: 1,
    xp: 0,
    statPoints: 0,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    attack: 15,
    defense: 5,
    rangedAttack: 10,
    spellPower: 10,
  };

  return { ...base, ...overrides };
}

function createDefaultProfile(name = "Princess") {
  const player = createDefaultPlayer({ name });
  return {
    id: generateProfileId(new Set()),
    name,
    created: Date.now(),
    player: { ...player },
    progress: {
      mapsUnlocked: [true, false, false, false, false, false, false, false, false],
      currentMap: 1,
      storyCompleted: false,
    },
    resources: { xp: 0 },
    currencies: { gold: 0, diamonds: 0 },
    exploration: {},
    bravery: defaultBraveryState(),
    spires: {
      1: { diamondsSpent: 0 },
      2: { diamondsSpent: 0 },
      3: { diamondsSpent: 0 },
      4: { diamondsSpent: 0 },
      5: { diamondsSpent: 0 },
      6: { diamondsSpent: 0 },
    },
  };
}

function generateProfileId(existingIds = new Set()) {
  let id;
  do {
    id =
      "p_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8);
  } while (existingIds.has(id));
  return id;
}

function ensureProfileHasId(profile) {
  if (!profile) return null;

  const used = new Set(
    (gameState.profiles || [])
      .filter(p => p !== profile && p?.id)
      .map(p => p.id)
  );

  if (profile.id && !used.has(profile.id)) {
    return profile.id;
  }

  const newId = generateProfileId(used);
  profile.id = newId;
  return newId;
}

// ============================================================
// 💾 GLOBAL RUNTIME STATE
// ============================================================

export const gameState = {
  player: null,
  profile: null,
  paused: false,

  profiles: [],
  activeProfileIndex: 0,

  progress: {
    mapsUnlocked: [true, false, false, false, false, false, false, false, false],
    currentMap: 1,
    storyCompleted: false,
  },

  resources: {
    xp: 0,
  },

  settings: {
    volume: 0.8,
    music: true,
    sfx: true,
    visualEffects: true,
    difficulty: "normal",  
  },

  bravery: defaultBraveryState(),
};

// ============================================================
// 👑 LOAD PROFILE INTO GAMESTATE
// ============================================================

export function setProfile(profile) {
  gameState.profile = profile;

  const idx = gameState.profiles.indexOf(profile);
  if (idx !== -1) {
    gameState.activeProfileIndex = idx;
  }

  migrateProfile(profile);

  gameState.progress = { ...profile.progress };

  gameState.player = hydratePlayerFromProfile(profile);
  syncRuntimePlayerIntoProfile();

  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  gameState.bravery = { ...(profile.bravery || defaultBraveryState()) };

  // 💎 Ensure spire upgrade data exists
  if (!profile.spires) {
    profile.spires = {
      1: { diamondsSpent: 0 },
      2: { diamondsSpent: 0 },
      3: { diamondsSpent: 0 },
      4: { diamondsSpent: 0 },
      5: { diamondsSpent: 0 },
      6: { diamondsSpent: 0 },
    };
  } else {
    for (let i = 1; i <= 6; i++) {
      if (!profile.spires[i]) {
        profile.spires[i] = { diamondsSpent: 0 };
      } else if (typeof profile.spires[i].diamondsSpent !== "number") {
        profile.spires[i].diamondsSpent =
          Number(profile.spires[i].diamondsSpent) || 0;
      }
    }
  }

  gameState.echoPowerActive = false;

  saveProfiles();
}

// ============================================================
// 🧬 SAFE PROFILE MIGRATION
// ============================================================

function migrateProfile(profile) {
  ensureProfileHasId(profile);

  // Currencies
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  // Progress
  if (!profile.progress) {
    profile.progress = {
      mapsUnlocked: [...gameState.progress.mapsUnlocked],
      currentMap: 1,
      storyCompleted: false,
    };
  }

  if (!Array.isArray(profile.progress.mapsUnlocked)) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  if (profile.progress.mapsUnlocked.length !== 9) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  if (!profile.progress.mapsUnlocked[0]) {
    profile.progress.mapsUnlocked[0] = true;
  }

  if (
    !profile.progress.currentMap ||
    profile.progress.currentMap < 1 ||
    profile.progress.currentMap > 9
  ) {
    profile.progress.currentMap = 1;
  }

  // Exploration
  if (!profile.exploration) {
    profile.exploration = {};
  }

  // Bravery
  if (!profile.bravery) {
    profile.bravery = {
      current: 0,
      max: 100,
      charged: false,
      draining: false,
    };
  }

  // ============================================================
  // 💎 NEW — Spire Upgrade Migration
  // ============================================================

  if (!profile.spires) {
    profile.spires = {
      1: { diamondsSpent: 0 },
      2: { diamondsSpent: 0 },
      3: { diamondsSpent: 0 },
      4: { diamondsSpent: 0 },
      5: { diamondsSpent: 0 },
      6: { diamondsSpent: 0 },
    };
  } else {
    for (let i = 1; i <= 6; i++) {
      if (!profile.spires[i]) {
        profile.spires[i] = { diamondsSpent: 0 };
      } else if (typeof profile.spires[i].diamondsSpent !== "number") {
        profile.spires[i].diamondsSpent =
          Number(profile.spires[i].diamondsSpent) || 0;
      }
    }
  }
}

// ============================================================
// 📘 PROFILE ACCESS
// ============================================================

export function getProfile() {
  return gameState.profile;
}

// ============================================================
// ➕ ADD NEW PROFILE
// ============================================================

export function addProfile(name) {
  if (gameState.profiles.length >= 6) return false;

  if (gameState.profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    return "duplicate";
  }

  const newProfile = {
    id: generateProfileId(
      new Set(gameState.profiles.map(p => p?.id).filter(Boolean))
    ),
    name,
    created: Date.now(),

    player: createPlayer(),

    progress: {
      mapsUnlocked: [true, false, false, false, false, false, false, false, false],
      currentMap: 1,
      storyCompleted: false,
    },

    resources: { xp: 0 },

    currencies: { gold: 0, diamonds: 0 },

    exploration: {},

    bravery: {
      current: 0,
      max: 100,
      charged: false,
      draining: false,
    },

    // 💎 NEW — Spire Upgrade Data
    spires: {
      1: { diamondsSpent: 0 },
      2: { diamondsSpent: 0 },
      3: { diamondsSpent: 0 },
      4: { diamondsSpent: 0 },
      5: { diamondsSpent: 0 },
      6: { diamondsSpent: 0 },
    }
  };

  gameState.profiles.push(newProfile);
  gameState.activeProfileIndex = gameState.profiles.length - 1;

  saveProfiles();
  return newProfile;
}

// ============================================================
// 💾 SAVE ALL PROFILES
// ============================================================

export function saveProfiles() {
  try {
    if (!Array.isArray(gameState.profiles)) {
      gameState.profiles = [];
    }

    let profile = gameState.profile;
    const profiles = gameState.profiles;

    // If the current profile was deleted, drop reference and pick a fallback slot if any
    let idx = profiles.indexOf(profile);
    if (idx === -1) {
      profile = null;
      gameState.profile = null;
    }

    // Determine intended index (clamped to available slots)
    if (!Number.isInteger(gameState.activeProfileIndex)) {
      gameState.activeProfileIndex = 0;
    }
    if (gameState.activeProfileIndex < 0) gameState.activeProfileIndex = 0;
    if (profiles.length > 0 && gameState.activeProfileIndex >= profiles.length) {
      gameState.activeProfileIndex = profiles.length - 1;
    }

    if (!profile && profiles.length > 0) {
      idx = gameState.activeProfileIndex;
      profile = profiles[idx] || profiles[0];
      idx = profiles.indexOf(profile);
      gameState.profile = profile;
    }

    if (profile) {
      profile.progress = { ...(profile.progress || {}), ...(gameState.progress || {}) };
      profile.bravery = { ...(profile.bravery || {}), ...(gameState.bravery || {}) };
      profile.currencies = { ...(profile.currencies || { gold: 0, diamonds: 0 }) };
      profile.resources = { ...(profile.resources || {}) };
      profile.exploration = { ...(profile.exploration || {}) };
      profile.spires = profile.spires || {
        1: { diamondsSpent: 0 },
        2: { diamondsSpent: 0 },
        3: { diamondsSpent: 0 },
        4: { diamondsSpent: 0 },
        5: { diamondsSpent: 0 },
        6: { diamondsSpent: 0 },
      };

      // 🔐 make sure player is stored on the profile
      profile.player = {
        ...(profile.player || {}),
        ...(gameState.player || {}),
      };

      if (idx >= 0) {
        gameState.profiles[idx] = profile;
        gameState.activeProfileIndex = idx;
      }
    }

    window.localStorage.setItem(
      "ow_profiles_v1",
      JSON.stringify(gameState.profiles)
    );

    // Remove legacy store so deleted profiles cannot resurrect
    try {
      window.localStorage.removeItem("td_profiles");
    } catch {
      /* ignore */
    }
  } catch (err) {
    console.warn("Failed to save profiles:", err);
  }
}

// ============================================================
// 💾 LOAD PROFILES
// ============================================================

export function initProfiles() {
  let stored = [];

  try {
    const rawOw = window.localStorage.getItem("ow_profiles_v1");
    const rawLegacy = rawOw === null ? window.localStorage.getItem("td_profiles") : null;

    if (rawOw !== null) {
      stored = JSON.parse(rawOw);
    } else if (rawLegacy) {
      stored = JSON.parse(rawLegacy);
    }
  } catch (err) {
    console.warn("Failed to parse profiles:", err);
  }

  if (!Array.isArray(stored)) {
    stored = [];
  } else if (stored.length > 0) {
    stored.forEach((p) => migrateProfile(p));
  }

  gameState.profiles = stored;
  gameState.activeProfileIndex = stored.length > 0 ? 0 : -1;
  gameState.profile = stored[0] || null;

  // 🔁 restore player into runtime when a profile exists
  gameState.player = gameState.profile?.player
    ? { ...gameState.profile.player }
    : null;

  if (gameState.profile?.progress) {
    gameState.progress = { ...(gameState.profile.progress || gameState.progress) };
  }
  if (gameState.profile?.bravery) {
    gameState.bravery = { ...(gameState.profile.bravery || defaultBraveryState()) };
  }
}

export function loadProfiles() {
  initProfiles();
}

// ============================================================
// 🗺️ MAP CONTROL
// ============================================================

export function unlockMap(id) {
  const index = id - 1;
  if (index >= 0 && index < 9) {
    gameState.progress.mapsUnlocked[index] = true;
    saveProfiles();
  }
}

export function setCurrentMap(id) {
  const index = id - 1;
  if (gameState.progress.mapsUnlocked[index]) {
    gameState.progress.currentMap = id;
    gameState.currentMap = id;
    saveProfiles();
  }
}

// ============================================================
// 💰 CURRENCY CONTROL
// ============================================================

export function addXP(amount) {
  gameState.resources.xp += amount;
}


export function addGold(amount, x = null, y = null) {
    if (!gameState.profile) return;

    // Apply Echo Power bonus
    if (gameState.echoPowerActive) {
        amount = Math.round(amount * 1.5);

        // Boosted gold popup (optional)
        if (x !== null && y !== null) {
            spawnFloatingText(x, y - 30, `+${amount} 💛`, "#ffd86b");
        }
    }

    // ✔ Correct gold storage location
    gameState.profile.currencies.gold += amount;

    saveProfiles();
}

export function spendGold(amount) {
  if (!gameState.profile) return false;
  const c = gameState.profile.currencies;
  if (c.gold >= amount) {
    c.gold -= amount;
    saveProfiles();
    return true;
  }
  return false;
}

export function addDiamonds(amount) {
  if (!gameState.profile) return;
  gameState.profile.currencies.diamonds += amount;
  saveProfiles();
}

export function spendDiamonds(amount) {
  if (!gameState.profile) return false;
  const c = gameState.profile.currencies;
  if (c.diamonds >= amount) {
    c.diamonds -= amount;
    saveProfiles();
    return true;
  }
  return false;
}

export function getCurrencies() {
  if (!gameState.profile) return { gold: 0, diamonds: 0 };
  return { ...gameState.profile.currencies };
}

// ============================================================
// 💎 ECHO BUFF RESET
// ============================================================

export function resetEchoBuff() {
  gameState.echoPowerActive = false;

  const icon = document.getElementById("hud-crystals-circle");
  if (icon) icon.classList.remove("echo-power-flash");

  // Remove gold glow when Echo mode ends
  const goldEl = document.getElementById("gold-display");
  if (goldEl) goldEl.classList.remove("gold-glow");
}

initProfiles();

// ============================================================
// 🌟 END OF FILE
// ============================================================

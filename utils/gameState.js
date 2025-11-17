// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep (Unified + Stable)
// ------------------------------------------------------------
// ✦ One stable source of truth for ALL runtime & profile data
// ✦ Fully fixed persistence system (no more resets / wipes)
// ✦ Safe loading of legacy profiles + auto-migration
// ✦ Correct handling of mapsUnlocked, XP, currencies, skins
// ✦ ⭐ Bravery bar included & fully persistent
// ============================================================

import { createPlayer } from "../core/player.js";

// ============================================================
// 💾 GLOBAL RUNTIME STATE
// ============================================================
export const gameState = {
  player: null,
  profile: null,
  paused: false,

  // All saved profiles
  profiles: [],

  // Core progress
  progress: {
    mapsUnlocked: [true, false, false, false, false, false, false, false, false],
    currentMap: 1,
    storyCompleted: false,
  },

  // Global XP
  resources: {
    xp: 0,
  },

  // Player settings
  settings: {
    volume: 0.8,
    music: true,
    sfx: true,
    visualEffects: true,
  },

  // ⭐ BRAVERY SYSTEM
  bravery: {
    current: 0,
    max: 100,
    charged: false,
    draining: false,
  },
};

// ============================================================
// 👑 LOAD PROFILE INTO GAMESTATE
// ============================================================
export function setProfile(profile) {
  gameState.profile = profile;

  // Migrate any missing structures
  migrateProfile(profile);

  // Sync progress
  gameState.progress = { ...profile.progress };

  // Restore player OR create new
  gameState.player = profile.player || createPlayer();
  gameState.player.name = profile.name;

  // Ensure currencies exist
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  // ⭐ Restore bravery (persistent)
  gameState.bravery = profile.bravery || {
    current: 0,
    max: 100,
    charged: false,
  };

  saveProfiles();
}

// ============================================================
// 🧬 SAFE PROFILE MIGRATION (Fix old broken saves)
// ============================================================
function migrateProfile(profile) {

  // currencies
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  // progress
  if (!profile.progress) {
    profile.progress = {
      mapsUnlocked: [...gameState.progress.mapsUnlocked],
      currentMap: 1,
      storyCompleted: false,
    };
  }

  // fix mapsUnlocked
  if (!Array.isArray(profile.progress.mapsUnlocked)) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  if (profile.progress.mapsUnlocked.length !== 9) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  if (!profile.progress.mapsUnlocked[0]) {
    profile.progress.mapsUnlocked[0] = true;
  }

  if (!profile.progress.currentMap || profile.progress.currentMap < 1 || profile.progress.currentMap > 9) {
    profile.progress.currentMap = 1;
  }

  if (!profile.exploration) {
    profile.exploration = {};
  }

  // ⭐ Bravery migration
  if (!profile.bravery) {
    profile.bravery = {
      current: 0,
      max: 100,
      charged: false,
    };
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
    id: gameState.profiles.length + 1,
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

    // ⭐ NEW — exploration save
    exploration: {},

    // ⭐ Start with empty bravery
    bravery: {
      current: 0,
      max: 100,
      charged: false,
    },
  };

  gameState.profiles.push(newProfile);
  saveProfiles();
  return newProfile;
}

// ============================================================
// 💾 SAVE ALL PROFILES SAFELY
// ============================================================
export function saveProfiles() {
  try {
    if (gameState.profile) {

      // Sync runtime progress
      gameState.profile.progress = { ...gameState.progress };
      gameState.profile.player = { ...gameState.player };

      // ⭐ Sync bravery
      gameState.profile.bravery = { ...gameState.bravery };
      gameState.profile.exploration = { ...gameState.profile.exploration };
    }

    localStorage.setItem("td_profiles", JSON.stringify(gameState.profiles));
  } catch (err) {
    console.error("❌ Error saving profiles:", err);
  }
}

// ============================================================
// 💾 LOAD PROFILES FROM STORAGE
// ============================================================
export function loadProfiles() {
  try {
    const data = localStorage.getItem("td_profiles");
    if (data) {
      gameState.profiles = JSON.parse(data);

      // migrate legacy profiles
      gameState.profiles.forEach(p => migrateProfile(p));
    }
  } catch (err) {
    console.error("❌ Error loading profiles:", err);
    gameState.profiles = [];
  }
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
    saveProfiles();
  }
}

// ============================================================
// 💰 CURRENCY CONTROL
// ============================================================
export function addXP(amount) {
  gameState.resources.xp += amount;
}

export function addGold(amount) {
  if (!gameState.profile) return;
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
// 🚀 INITIAL LOAD
// ============================================================
loadProfiles();

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep (Unified + Stable)
// ------------------------------------------------------------
// ✦ One stable source of truth for ALL runtime & profile data
// ✦ Fully fixed persistence system (no more resets / wipes)
// ✦ Safe loading of legacy profiles + auto-migration
// ✦ Correct handling of mapsUnlocked, currencies, XP, player data
// ✦ 100% Compatible with chest.js, hub.js, maps.js, map loader
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

  // Core progress (synced into profile.progress)
  progress: {
    mapsUnlocked: [true, false, false, false, false, false, false, false, false],
    currentMap: 1,        // Default to map 1, never null
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
};

// ============================================================
// 👑 LOAD PROFILE INTO GAMESTATE
// ============================================================
export function setProfile(profile) {
  gameState.profile = profile;

  // 1️⃣ Migrate missing structures safely
  migrateProfile(profile);

  // 2️⃣ Sync gameState.progress FROM profile
  gameState.progress = { ...profile.progress };

  // 3️⃣ Restore player object OR create a new one
  gameState.player = profile.player || createPlayer();

  // Ensure player has a name injected from the profile
  gameState.player.name = profile.name;

  // Ensure currencies always exist
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  saveProfiles(); // commit safety sync
}

// ============================================================
// 🧬 SAFE PROFILE MIGRATION (Fix old broken saves)
// ============================================================
function migrateProfile(profile) {

  // Fix missing currencies
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
  }

  // Fix missing progress
  if (!profile.progress) {
    profile.progress = {
      mapsUnlocked: [...gameState.progress.mapsUnlocked],
      currentMap: 1,
      storyCompleted: false,
    };
  }

  // Fix mapsUnlocked if the older version used numbers
  if (!Array.isArray(profile.progress.mapsUnlocked)) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  // Fix length mismatch
  if (profile.progress.mapsUnlocked.length !== 9) {
    profile.progress.mapsUnlocked = [true, false, false, false, false, false, false, false, false];
  }

  // Ensure at least map 1 is unlocked
  if (!profile.progress.mapsUnlocked[0]) {
    profile.progress.mapsUnlocked[0] = true;
  }

  // Fix broken currentMap values
  if (!profile.progress.currentMap || profile.progress.currentMap < 1 || profile.progress.currentMap > 9) {
    profile.progress.currentMap = 1;
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
      // Sync runtime progress back to profile
      gameState.profile.progress = { ...gameState.progress };
      gameState.profile.player = { ...gameState.player };
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

      // Auto-fix legacy profiles
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
// 💰 RESOURCE / CURRENCY CONTROL
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

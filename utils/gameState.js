// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Central global state for the entire game
// ✦ Tracks active player, profiles, and persistent progress
// ✦ Integrates Glitter Guardian as the default playable hero
// ✦ Now supports per-profile gold and diamonds
// ============================================================

import { createPlayer } from "../core/player.js";

export const gameState = {
  // 🧚‍♀️ Runtime entities
  player: null,   // active player object (Glitter Guardian)
  profile: null,  // selected save profile

  // 💾 Stored save data
  profiles: [], // up to 6 profiles

  // 🗺️ Core progress and unlocks
  progress: {
    mapsUnlocked: [1],
    currentMap: null,
    storyCompleted: false
  },

  // 💰 Global resources (for the current play session)
  resources: {
    xp: 0
  },

  // 🎧 Settings
  settings: {
    volume: 0.8,
    music: true,
    sfx: true,
    visualEffects: true
  }
};

// ============================================================
// 👑 PROFILE MANAGEMENT
// ============================================================

export function setProfile(profile) {
  gameState.profile = profile;
  gameState.player = profile.player || createPlayer(); // ✅ sync player on select

  // 💎 Ensure this profile has currencies
  if (!profile.currencies) {
    profile.currencies = { gold: 0, diamonds: 0 };
    saveProfiles();
  }
}

export function getProfile() {
  return gameState.profile;
}

export function addProfile(name) {
  if (gameState.profiles.length >= 6) return false;

  // 🩷 Prevent duplicate names (case-insensitive)
  const exists = gameState.profiles.some(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    console.warn(`⚠️ Profile name "${name}" already exists.`);
    return "duplicate"; // we’ll handle this in profile.js
  }

  const newProfile = {
    id: gameState.profiles.length + 1,
    name,
    created: Date.now(),
    player: createPlayer(),
    progress: { ...gameState.progress },
    resources: { ...gameState.resources },
    currencies: { gold: 0, diamonds: 0 }
  };

  gameState.profiles.push(newProfile);
  saveProfiles();
  return newProfile;
}

// ============================================================
// 💾 PERSISTENCE
// ============================================================

export function saveProfiles() {
  try {
    localStorage.setItem("td_profiles", JSON.stringify(gameState.profiles));
  } catch (err) {
    console.error("❌ Error saving profiles:", err);
  }
}

export function loadProfiles() {
  try {
    const data = localStorage.getItem("td_profiles");
    if (data) {
      gameState.profiles = JSON.parse(data);

      // 💎 Ensure every existing profile has currencies
      gameState.profiles.forEach((p) => {
        if (!p.currencies) p.currencies = { gold: 0, diamonds: 0 };
      });
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
  if (!gameState.progress.mapsUnlocked.includes(id)) {
    gameState.progress.mapsUnlocked.push(id);
  }
}

export function setCurrentMap(id) {
  if (gameState.progress.mapsUnlocked.includes(id)) {
    gameState.progress.currentMap = id;
  }
}

// ============================================================
// 💰 RESOURCE CONTROL
// ============================================================

export function addXP(amount) {
  gameState.resources.xp += amount;
}

// ============================================================
// 💰 CURRENCY CONTROL (Per-Profile, Safe + Persistent)
// ============================================================

export function addGold(amount) {
  if (!gameState.profile) return;
  if (!gameState.profile.currencies)
    gameState.profile.currencies = { gold: 0, diamonds: 0 };

  gameState.profile.currencies.gold += amount;
  saveProfiles();
}

export function spendGold(amount) {
  if (!gameState.profile) return false;
  if (!gameState.profile.currencies)
    gameState.profile.currencies = { gold: 0, diamonds: 0 };

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
  if (!gameState.profile.currencies)
    gameState.profile.currencies = { gold: 0, diamonds: 0 };

  gameState.profile.currencies.diamonds += amount;
  saveProfiles();
}

export function spendDiamonds(amount) {
  if (!gameState.profile) return false;
  if (!gameState.profile.currencies)
    gameState.profile.currencies = { gold: 0, diamonds: 0 };

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
  if (!gameState.profile.currencies)
    gameState.profile.currencies = { gold: 0, diamonds: 0 };

  return { ...gameState.profile.currencies };
}

// ============================================================
// 🎧 SETTINGS CONTROL
// ============================================================

export function setVolume(value) {
  gameState.settings.volume = Math.max(0, Math.min(1, value));
}

export function toggleMusic(on) {
  gameState.settings.music = on;
}

export function toggleSFX(on) {
  gameState.settings.sfx = on;
}

// ============================================================
// 🚀 AUTO-LOAD PROFILES ON INIT
// ============================================================

loadProfiles();

// ============================================================
// 🌟 END OF FILE
// ============================================================

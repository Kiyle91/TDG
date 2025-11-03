// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Central global state for the entire game
// ✦ Tracks active player, profiles, and persistent progress
// ✦ Integrates Glitter Guardian as the default playable hero
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
    money: 0,
    xp: 0
  },

  // 🎧 Settings
  settings: {
    volume: 0.8,
    music: true,
    sfx: true
  }
};

// ============================================================
// 👑 PROFILE MANAGEMENT
// ============================================================

export function setProfile(profile) {
  gameState.profile = profile;
  gameState.player = profile.player || createPlayer(); // ✅ sync player on select
}

export function getProfile() {
  return gameState.profile;
}

export function addProfile(name) {
  if (gameState.profiles.length >= 6) return false;

  const newProfile = {
    id: gameState.profiles.length + 1,
    name,
    created: Date.now(),
    player: createPlayer(), // ✅ attach Glitter Guardian data
    progress: { ...gameState.progress },
    resources: { ...gameState.resources }
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

export function addMoney(amount) {
  gameState.resources.money += amount;
}

export function addXP(amount) {
  gameState.resources.xp += amount;
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

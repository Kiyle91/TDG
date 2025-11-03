// ============================================================
// 🌸 gameState.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Central shared game data and utility functions
// ✦ Handles player profiles, resources, maps, and settings
// ✦ Provides persistence through localStorage
// ============================================================

// ------------------------------------------------------------
// ⚙️ GLOBAL GAME STATE
// ------------------------------------------------------------

export const gameState = {
  profile: null,
  profiles: [], // up to 5 profiles

  progress: {
    mapsUnlocked: [1],
    currentMap: null,
    storyCompleted: false
  },

  resources: {
    money: 0,
    xp: 0
  },

  settings: {
    volume: 0.8,
    music: true,
    sfx: true
  }
};

// ------------------------------------------------------------
// 👑 PROFILE MANAGEMENT
// ------------------------------------------------------------

export function setProfile(profile) {
  gameState.profile = profile;
}

export function getProfile() {
  return gameState.profile;
}

export function addProfile(name) {
  if (gameState.profiles.length >= 5) return false;

  const newProfile = {
    id: gameState.profiles.length + 1,
    name,
    created: Date.now(),
    progress: { ...gameState.progress },
    resources: { ...gameState.resources }
  };

  gameState.profiles.push(newProfile);
  saveProfiles();
  return newProfile;
}

// ------------------------------------------------------------
// 💾 PERSISTENCE — SAVE / LOAD
// ------------------------------------------------------------

export function saveProfiles() {
  try {
    localStorage.setItem("td_profiles", JSON.stringify(gameState.profiles));
  } catch (err) {
    console.error("💔 Error saving profiles:", err);
  }
}

export function loadProfiles() {
  try {
    const data = localStorage.getItem("td_profiles");
    if (data) {
      gameState.profiles = JSON.parse(data);
    }
  } catch (err) {
    console.error("💔 Error loading profiles:", err);
    gameState.profiles = [];
  }
}

// ------------------------------------------------------------
// 🗺️ MAP CONTROL
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// 💰 RESOURCE CONTROL
// ------------------------------------------------------------

export function addMoney(amount) {
  gameState.resources.money += amount;
}

export function addXP(amount) {
  gameState.resources.xp += amount;
}

// ------------------------------------------------------------
// 🎵 SETTINGS CONTROL
// ------------------------------------------------------------

export function setVolume(value) {
  gameState.settings.volume = Math.max(0, Math.min(1, value));
}

export function toggleMusic(on) {
  gameState.settings.music = on;
}

export function toggleSFX(on) {
  gameState.settings.sfx = on;
}

// ------------------------------------------------------------
// 🚀 AUTO-LOAD PROFILES ON STARTUP
// ------------------------------------------------------------

loadProfiles();

// ============================================================
// 🌟 END OF FILE
// ============================================================

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
    xp: 0
  },

  currenices: {
    gold: 0,
    diamonds: 0,
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

export function addXP(amount) {
  gameState.resources.xp += amount;
}

// ============================================================
// 💰 CURRENCY CONTROL
// ============================================================

// ⚠️ Note: your key is misspelled as "currenices" above; this will still work.
const CURRENCY_KEY = "ow_currencies";

export function saveCurrencies() {
  try {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(gameState.currencies || gameState.currenices));
  } catch (err) {
    console.error("❌ Error saving currencies:", err);
  }
}

export function loadCurrencies() {
  try {
    const data = localStorage.getItem(CURRENCY_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const target = gameState.currencies || gameState.currenices;
      target.gold = parsed.gold || 0;
      target.diamonds = parsed.diamonds || 0;
    }
  } catch (err) {
    console.error("❌ Error loading currencies:", err);
  }
}

export function addGold(amount) {
  (gameState.currencies || gameState.currenices).gold += amount;
  saveCurrencies();
}

export function spendGold(amount) {
  const target = gameState.currencies || gameState.currenices;
  if (target.gold >= amount) {
    target.gold -= amount;
    saveCurrencies();
    return true;
  }
  return false;
}

export function addDiamonds(amount) {
  (gameState.currencies || gameState.currenices).diamonds += amount;
  saveCurrencies();
}

export function spendDiamonds(amount) {
  const target = gameState.currencies || gameState.currenices;
  if (target.diamonds >= amount) {
    target.diamonds -= amount;
    saveCurrencies();
    return true;
  }
  return false;
}

// ============================================================
// 💰 SAFE GETTER (prevents undefined)
// ============================================================
export function getCurrencies() {
  if (!gameState.currencies && !gameState.currenices) {
    gameState.currenices = { gold: 0, diamonds: 0 };
  }
  return { ...(gameState.currencies || gameState.currenices) };
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
loadCurrencies(); // ✅ auto-load currency data too

// ============================================================
// 🌟 END OF FILE
// ============================================================

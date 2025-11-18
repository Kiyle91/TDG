// ============================================================
// ⚙️ settings.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles music & SFX volume, visual & 
// ✦ Syncs with soundtrack.js + localStorage
// ============================================================
/* ------------------------------------------------------------
 * MODULE: settings.js
 * PURPOSE:
 *   Manages all user-configurable settings for Olivia’s World:
 *   Crystal Keep. This includes audio volumes, visual toggles,
 *   synced across both the Hub and
 *   the in-game settings overlays.
 *
 * SUMMARY:
 *   • initSettings()      — loads from localStorage + applies UI
 *   • initGameSettings()  — same, but for in-game overlay IDs

 * FEATURES:
 *   • Independent SFX + Music volume sliders
 *   • Visuals toggle for aesthetic/particle-heavy systems#
 *   • Difficulty selector (easy, normal, hard)
 *   • Auto-save to localStorage (persistent)
 *
 * TECHNICAL NOTES:
 *   • Uses a single SETTINGS_KEY for persistence
 *   • safe UI population even if elements aren't on-screen
 *   • settings object always kept in sync with game systems
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import {
  playFairySprinkle,
  setMusicVolume,
  setSfxVolume
} from "./soundtrack.js";

// ------------------------------------------------------------
// 🧰 SETTINGS STORAGE
// ------------------------------------------------------------

const SETTINGS_KEY = "olivia_settings";

let settings = {
  musicVolume: 0.8,
  sfxVolume: 0.8,
  visualsEnabled: true,
  difficulty: "normal",
};

// ------------------------------------------------------------
// 🌈 INITIAL LOAD
// ------------------------------------------------------------

export function initSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }

  applySettingsToUI();
  applySettingsToGame();
  setupListeners();

  console.log("⚙️ Settings initialized:", settings);
}

// ------------------------------------------------------------
// 🩵 APPLY SETTINGS TO UI
// ------------------------------------------------------------

function applySettingsToUI() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");
  const diffEasy = document.getElementById("difficulty-easy");
  const diffNormal = document.getElementById("difficulty-normal");
  const diffHard = document.getElementById("difficulty-hard");

  if (musicRange) musicRange.value = settings.musicVolume * 100;
  if (sfxRange) sfxRange.value = settings.sfxVolume * 100;
  if (visualsToggle) visualsToggle.checked = settings.visualsEnabled;
  if (diffEasy)   diffEasy.checked = settings.difficulty === "easy";
  if (diffNormal) diffNormal.checked = settings.difficulty === "normal";
  if (diffHard)   diffHard.checked = settings.difficulty === "hard";

  updateLabels();
}

// ------------------------------------------------------------
// 🎚️ APPLY SETTINGS TO SYSTEMS
// ------------------------------------------------------------

function applySettingsToGame() {
  setMusicVolume(settings.musicVolume);
  setSfxVolume(settings.sfxVolume);
}

// ------------------------------------------------------------
// 🎵 EVENT LISTENERS
// ------------------------------------------------------------

function setupListeners() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");

  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");

  // Music volume
  musicRange?.addEventListener("input", (e) => {
    const value = e.target.value / 100;
    settings.musicVolume = value;
    if (musicLabel) musicLabel.textContent = `${e.target.value}%`;
    setMusicVolume(value);
    saveSettings();
  });

  // SFX volume
  sfxRange?.addEventListener("input", (e) => {
    const value = e.target.value / 100;
    settings.sfxVolume = value;
    if (sfxLabel) sfxLabel.textContent = `${e.target.value}%`;
    setSfxVolume(value);
    saveSettings();
  });

  // Visual toggle
  visualsToggle?.addEventListener("change", (e) => {
    settings.visualsEnabled = e.target.checked;
    playFairySprinkle();
    saveSettings();
  });

  const diffRadios = document.querySelectorAll("input[name='difficulty']");
  diffRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      settings.difficulty = e.target.value;
      saveSettings();
    });
  });
}

// ------------------------------------------------------------
// 💾 PERSIST SETTINGS
// ------------------------------------------------------------

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  console.log("💾 Settings saved:", settings);
}

// ------------------------------------------------------------
// 🌸 UPDATE LABELS (e.g. "80%")
// ------------------------------------------------------------

function updateLabels() {
  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");

  if (musicLabel)
    musicLabel.textContent = `${Math.round(settings.musicVolume * 100)}%`;

  if (sfxLabel)
    sfxLabel.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
}




// ------------------------------------------------------------
// 🎮 IN-GAME SETTINGS OVERLAY
// ------------------------------------------------------------

export function initGameSettings() {
  const musicRange = document.getElementById("music-volume-game");
  if (!musicRange) return; // not on this screen

  const sfxRange = document.getElementById("sfx-volume-game");
  const visualsToggle = document.getElementById("visuals-toggle-game");

  // Sync UI from settings
  musicRange.value = settings.musicVolume * 100;
  sfxRange.value = settings.sfxVolume * 100;
  visualsToggle.checked = settings.visualsEnabled;

  document.getElementById("music-value-game").textContent =
    `${Math.round(settings.musicVolume * 100)}%`;
  document.getElementById("sfx-value-game").textContent =
    `${Math.round(settings.sfxVolume * 100)}%`;

  // Event listeners (same logic as hub)
  musicRange.oninput = (e) => {
    const val = e.target.value / 100;
    settings.musicVolume = val;
    setMusicVolume(val);
    saveSettings();
    document.getElementById("music-value-game").textContent = `${e.target.value}%`;
  };

  sfxRange.oninput = (e) => {
    const val = e.target.value / 100;
    settings.sfxVolume = val;
    setSfxVolume(val);
    saveSettings();
    document.getElementById("sfx-value-game").textContent = `${e.target.value}%`;
  };

  visualsToggle.onchange = (e) => {
    settings.visualsEnabled = e.target.checked;
    saveSettings();
    playFairySprinkle();
  };

  document.getElementById("difficulty-easy-game").checked   = settings.difficulty === "easy";
  document.getElementById("difficulty-normal-game").checked = settings.difficulty === "normal";
  document.getElementById("difficulty-hard-game").checked   = settings.difficulty === "hard";

  document.querySelectorAll("input[name='difficulty-game']").forEach(radio => {
    radio.onchange = (e) => {
      settings.difficulty = e.target.value;
      saveSettings();
    };
  });
}
  
// ------------------------------------------------------------
// 🛡️ DIFFICULTY HP MULTIPLIER
// ------------------------------------------------------------

export function getDifficultyHpMultiplier() {
  switch (settings.difficulty) {
    case "easy": return 0.5;
    case "hard": return 1.5;
    default: return 1.0;
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

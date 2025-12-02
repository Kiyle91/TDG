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
} from "../core/soundtrack.js";


import { gameState, saveProfiles } from "../utils/gameState.js";


// ------------------------------------------------------------
// 🧰 SETTINGS STORAGE
// ------------------------------------------------------------

const SETTINGS_KEY = "olivia_settings";

let settings = {
  musicVolume: 0.8,
  sfxVolume: 0.8,
  visualsEnabled: true,
  miniControlsEnabled: true,
  difficulty: "normal",
};

// ------------------------------------------------------------
//  EXPORTED ACCESSORS (single source of truth)
// ------------------------------------------------------------

export function getSettings() {
  return { ...settings };
}

export function setVisualsEnabled(enabled) {
  settings.visualsEnabled = !!enabled;
  saveSettings();
}

export function setDifficulty(diff) {
  if (!["easy", "normal", "hard"].includes(diff)) return;

  settings.difficulty = diff;
  if (gameState.settings) {
    gameState.settings.difficulty = diff;
  }

  saveSettings();
  saveProfiles?.();
  syncDifficultyRadios();
}

// ------------------------------------------------------------
// 🌈 INITIAL LOAD
// ------------------------------------------------------------

export function initSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }

  if (gameState.settings) {
    gameState.settings.difficulty = settings.difficulty;
  }

  applySettingsToUI();
  applySettingsToGame();
  setupListeners();

}

// ------------------------------------------------------------
// 🩵 APPLY SETTINGS TO UI
// ------------------------------------------------------------

function applySettingsToUI() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");
  const miniToggle = document.getElementById("mini-controls-toggle");

  if (musicRange) musicRange.value = settings.musicVolume * 100;
  if (sfxRange) sfxRange.value = settings.sfxVolume * 100;
  if (visualsToggle) visualsToggle.checked = settings.visualsEnabled;
  if (miniToggle) miniToggle.checked = settings.miniControlsEnabled;
  syncDifficultyRadios();

  updateLabels();
}

// ------------------------------------------------------------
// 🎚️ APPLY SETTINGS TO SYSTEMS
// ------------------------------------------------------------

function applySettingsToGame() {
  setMusicVolume(settings.musicVolume);
  setSfxVolume(settings.sfxVolume);
  applyMiniControlsVisibility(settings.miniControlsEnabled !== false);
}

// ------------------------------------------------------------
// 🎵 EVENT LISTENERS
// ------------------------------------------------------------

function setupListeners() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");
  const miniToggle = document.getElementById("mini-controls-toggle");

  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");
  const miniLabel = miniToggle?.nextElementSibling;

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

  miniToggle?.addEventListener("change", (e) => {
    const enabled = e.target.checked;
    settings.miniControlsEnabled = enabled;
    saveSettings();
    if (miniLabel) miniLabel.textContent = enabled ? "Enabled" : "Disabled";
    applyMiniControlsVisibility(enabled);
  });

  const diffRadios = document.querySelectorAll("input[name='difficulty']");
  diffRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      setDifficulty(e.target.value);
    });
  });
}

function applyMiniControlsVisibility(enabled) {
  const hud = document.getElementById("hud-controls-mini");
  if (hud) hud.style.display = enabled ? "flex" : "none";
}

// ------------------------------------------------------------
// 💾 PERSIST SETTINGS
// ------------------------------------------------------------

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ------------------------------------------------------------
// 🌸 UPDATE LABELS (e.g. "80%")
// ------------------------------------------------------------

function updateLabels() {
  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");
  const miniToggle = document.getElementById("mini-controls-toggle");
  const miniLabel = miniToggle?.nextElementSibling;

  if (musicLabel)
    musicLabel.textContent = `${Math.round(settings.musicVolume * 100)}%`;

  if (sfxLabel)
    sfxLabel.textContent = `${Math.round(settings.sfxVolume * 100)}%`;

  if (miniLabel)
    miniLabel.textContent = settings.miniControlsEnabled ? "Enabled" : "Disabled";
}




// ------------------------------------------------------------
// 🎮 IN-GAME SETTINGS OVERLAY
// ------------------------------------------------------------

export function initGameSettings() {
  const musicRange = document.getElementById("music-volume-game");
  if (!musicRange) return; // not on this screen

  const sfxRange = document.getElementById("sfx-volume-game");
  const visualsToggle = document.getElementById("visuals-toggle-game");
  const miniToggle = document.getElementById("mini-controls-toggle-game");

  // Sync UI from settings
  musicRange.value = settings.musicVolume * 100;
  sfxRange.value = settings.sfxVolume * 100;
  visualsToggle.checked = settings.visualsEnabled;
  if (miniToggle) miniToggle.checked = settings.miniControlsEnabled;

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

  if (miniToggle) {
    miniToggle.onchange = (e) => {
      const enabled = e.target.checked;
      settings.miniControlsEnabled = enabled;
      saveSettings();
      applyMiniControlsVisibility(enabled);
    };
  }

  syncDifficultyRadios();
  document.querySelectorAll("input[name='difficulty-game']").forEach(radio => {
    radio.onchange = (e) => {
      setDifficulty(e.target.value);
    };
  });
}

function syncDifficultyRadios() {
  const diff = settings.difficulty;
  const mapping = [
    ["difficulty-easy", "easy"],
    ["difficulty-normal", "normal"],
    ["difficulty-hard", "hard"],
    ["difficulty-easy-game", "easy"],
    ["difficulty-normal-game", "normal"],
    ["difficulty-hard-game", "hard"],
  ];

  mapping.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.checked = diff === value;
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

// ============================================================
// ⚙️ settings.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles music & SFX volume, visual & tooltip toggles
// ✦ Syncs with soundtrack.js + localStorage
// ============================================================
/* ------------------------------------------------------------
 * MODULE: settings.js
 * PURPOSE:
 *   Manages all user-configurable settings for Olivia’s World:
 *   Crystal Keep. This includes audio volumes, visual toggles,
 *   and tooltip preferences — synced across both the Hub and
 *   the in-game settings overlays.
 *
 * SUMMARY:
 *   • initSettings()      — loads from localStorage + applies UI
 *   • initGameSettings()  — same, but for in-game overlay IDs
 *   • getTooltipSetting() — used by tooltip system
 *
 * FEATURES:
 *   • Independent SFX + Music volume sliders
 *   • Visuals toggle for aesthetic/particle-heavy systems
 *   • Tooltip toggle for accessibility / clarity
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
  tooltipsEnabled: true,
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
  const tooltipsToggle = document.getElementById("tooltips-toggle");

  if (musicRange) musicRange.value = settings.musicVolume * 100;
  if (sfxRange) sfxRange.value = settings.sfxVolume * 100;
  if (visualsToggle) visualsToggle.checked = settings.visualsEnabled;
  if (tooltipsToggle) tooltipsToggle.checked = settings.tooltipsEnabled;

  updateLabels();
}

// ------------------------------------------------------------
// 🎚️ APPLY SETTINGS TO SYSTEMS
// ------------------------------------------------------------
function applySettingsToGame() {
  setMusicVolume(settings.musicVolume);
  setSfxVolume(settings.sfxVolume);
  // Visuals / tooltip toggles used by other modules
}

// ------------------------------------------------------------
// 🎵 EVENT LISTENERS
// ------------------------------------------------------------
function setupListeners() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");
  const tooltipsToggle = document.getElementById("tooltips-toggle");

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

  // Tooltip toggle
  tooltipsToggle?.addEventListener("change", (e) => {
    settings.tooltipsEnabled = e.target.checked;
    playFairySprinkle();
    saveSettings();
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
// 🔮 EXPOSE TOOLTIP SETTING
// ------------------------------------------------------------
export function getTooltipSetting() {
  return settings.tooltipsEnabled;
}

// ------------------------------------------------------------
// 🎮 IN-GAME SETTINGS OVERLAY
// ------------------------------------------------------------
export function initGameSettings() {
  const musicRange = document.getElementById("music-volume-game");
  if (!musicRange) return; // not on this screen

  const sfxRange = document.getElementById("sfx-volume-game");
  const visualsToggle = document.getElementById("visuals-toggle-game");
  const tooltipsToggle = document.getElementById("tooltips-toggle-game");

  // Sync UI from settings
  musicRange.value = settings.musicVolume * 100;
  sfxRange.value = settings.sfxVolume * 100;
  visualsToggle.checked = settings.visualsEnabled;
  tooltipsToggle.checked = settings.tooltipsEnabled;

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

  tooltipsToggle.onchange = (e) => {
    settings.tooltipsEnabled = e.target.checked;
    saveSettings();
    playFairySprinkle();
  };
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

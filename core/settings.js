// ============================================================
// ⚙️ settings.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles music & SFX volume, visual & tooltip toggles
// ✦ Syncs with soundtrack.js + localStorage
// ============================================================

import { playFairySprinkle, setMusicVolume, setSfxVolume } from "./soundtrack.js";


// Store key for saving preferences
const SETTINGS_KEY = "olivia_settings";

let settings = {
  musicVolume: 0.8,
  sfxVolume: 0.8,
  visualsEnabled: true,
  tooltipsEnabled: true,
};

// ------------------------------------------------------------
// 🌈 Initialize from saved settings
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
// 🩵 Apply settings to UI elements
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
// 🎚️ Apply settings to the game systems
// ------------------------------------------------------------
function applySettingsToGame() {
  setMusicVolume(settings.musicVolume);
  setSfxVolume(settings.sfxVolume);
  // Future: visuals & tooltip toggles
}

// ------------------------------------------------------------
// 🎵 Event listeners for live updates
// ------------------------------------------------------------
function setupListeners() {
  const musicRange = document.getElementById("music-volume");
  const sfxRange = document.getElementById("sfx-volume");
  const visualsToggle = document.getElementById("visuals-toggle");
  const tooltipsToggle = document.getElementById("tooltips-toggle");

  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");

  // Music volume
  musicRange?.addEventListener("input", e => {
    const value = e.target.value / 100;
    settings.musicVolume = value;
    musicLabel.textContent = `${e.target.value}%`;
    setMusicVolume(value);
    saveSettings();
  });

  // SFX volume
  sfxRange?.addEventListener("input", e => {
    const value = e.target.value / 100;
    settings.sfxVolume = value;
    sfxLabel.textContent = `${e.target.value}%`;
    setSfxVolume(value);
    saveSettings();
  });

  // Visual toggle
  visualsToggle?.addEventListener("change", e => {
    settings.visualsEnabled = e.target.checked;
    playFairySprinkle();
    
    saveSettings();
  });

  // Tooltip toggle
  tooltipsToggle?.addEventListener("change", e => {
    settings.tooltipsEnabled = e.target.checked;
    saveSettings();
    playFairySprinkle();
  });
}

// ------------------------------------------------------------
// 💾 Save settings
// ------------------------------------------------------------
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  console.log("💾 Settings saved:", settings);
}

// ------------------------------------------------------------
// 🌸 Update % labels
// ------------------------------------------------------------
function updateLabels() {
  const musicLabel = document.getElementById("music-value");
  const sfxLabel = document.getElementById("sfx-value");
  if (musicLabel) musicLabel.textContent = `${Math.round(settings.musicVolume * 100)}%`;
  if (sfxLabel) sfxLabel.textContent = `${Math.round(settings.sfxVolume * 100)}%`;
}


// ------------------------------------------------------------
// 🔮 Expose tooltip setting for other systems
// ------------------------------------------------------------
export function getTooltipSetting() {
  return settings.tooltipsEnabled;
}


// ------------------------------------------------------------
// 🎮 Initialize in-game settings overlay (uses game IDs)
// ------------------------------------------------------------
export function initGameSettings() {
  const musicRange = document.getElementById("music-volume-game");
  const sfxRange = document.getElementById("sfx-volume-game");
  const visualsToggle = document.getElementById("visuals-toggle-game");
  const tooltipsToggle = document.getElementById("tooltips-toggle-game");

  if (!musicRange) return; // not on this screen

  // sync from stored settings
  musicRange.value = settings.musicVolume * 100;
  sfxRange.value = settings.sfxVolume * 100;
  visualsToggle.checked = settings.visualsEnabled;
  tooltipsToggle.checked = settings.tooltipsEnabled;

  document.getElementById("music-value-game").textContent =
    `${Math.round(settings.musicVolume * 100)}%`;
  document.getElementById("sfx-value-game").textContent =
    `${Math.round(settings.sfxVolume * 100)}%`;

  // attach listeners (identical to hub overlay)
  musicRange.oninput = e => {
    const val = e.target.value / 100;
    settings.musicVolume = val;
    setMusicVolume(val);
    saveSettings();
    document.getElementById("music-value-game").textContent =
      `${e.target.value}%`;
  };

  sfxRange.oninput = e => {
    const val = e.target.value / 100;
    settings.sfxVolume = val;
    setSfxVolume(val);
    saveSettings();
    document.getElementById("sfx-value-game").textContent =
      `${e.target.value}%`;
  };

  visualsToggle.onchange = e => {
    settings.visualsEnabled = e.target.checked;
    saveSettings();
    playFairySprinkle();
  };

  tooltipsToggle.onchange = e => {
    settings.tooltipsEnabled = e.target.checked;
    saveSettings();
    playFairySprinkle();
  };
}

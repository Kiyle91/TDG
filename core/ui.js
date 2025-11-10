// ============================================================
// 🌸 ui.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Basic HUD display and stat management
// ✦ Controls wave, gold, diamond, and life counters
// ✦ Updates the in-game UI elements dynamically
// ============================================================

import { getCurrencies } from "../utils/gameState.js";
import { gameState, saveProfiles } from "../utils/gameState.js";
import { playCancelSound } from "./soundtrack.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let waveDisplay, goldDisplay, diamondDisplay, livesDisplay;

let gameStats = {
  wave: 1,
  lives: 10,
};

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initUI() {
  waveDisplay = document.getElementById("wave-display");
  goldDisplay = document.getElementById("gold-display");
  diamondDisplay = document.getElementById("diamond-display");
  livesDisplay = document.getElementById("lives-display");

  updateHUD();
}

// ------------------------------------------------------------
// 💖 UPDATE HUD
// ------------------------------------------------------------
export function updateHUD() {
  if (!waveDisplay || !goldDisplay || !diamondDisplay || !livesDisplay) return;

  const { gold, diamonds } = getCurrencies();
  const p = gameState.player || {};

  // Existing stats
  waveDisplay.textContent  = `Wave ${gameStats.wave}`;
  goldDisplay.textContent  = `Gold: ${gold}`;
  diamondDisplay.textContent = `Diamonds: ${diamonds}`;
  livesDisplay.textContent = `Lives: ${gameStats.lives}`;

  // ============================================================
  // 💖 HP + MANA BARS (via CSS variable --fill)
  // ============================================================
  const hpBar   = document.getElementById("hp-bar");
  const manaBar = document.getElementById("mana-bar");
  const hpText   = document.getElementById("hp-text");
  const manaText = document.getElementById("mana-text");

  if (gameState.player && hpBar && manaBar) {
    const hpPct   = Math.max(0, Math.min(100, (p.hp   / p.maxHp)   * 100));
    const manaPct = Math.max(0, Math.min(100, (p.mana / p.maxMana) * 100));

    // Apply CSS variable fills
    hpBar.style.setProperty("--fill", `${hpPct}%`);
    manaBar.style.setProperty("--fill", `${manaPct}%`);

    // Update text values
    if (hpText)   hpText.textContent   = `${p.hp} / ${p.maxHp}`;
    if (manaText) manaText.textContent = `${p.mana} / ${p.maxMana}`;
  }
}

// ------------------------------------------------------------
// 📜 GET GAME STATS
// ------------------------------------------------------------
export function getStats() {
  return gameStats;
}

// ============================================================
// 🌸 OVERLAY HELPERS
// ============================================================
export function showOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) {
    console.warn(`⚠️ Overlay "${id}" not found.`);
    return;
  }

  // Hide others
  document.querySelectorAll(".overlay").forEach((o) => {
    o.classList.remove("active");
    o.style.display = "none";
  });

  // Show this one
  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("active"));

  // Add close behavior
  const closeBtn = overlay.querySelector(".overlay-close");
  if (closeBtn) {
    closeBtn.onclick = () => closeOverlay(overlay);
  }
}

export function closeOverlay(overlay) {
  overlay.classList.remove("active");
  playCancelSound();
  setTimeout(() => (overlay.style.display = "none"), 600);
}

export function updateStatsOverlay() {
  const titleEl = document.getElementById("stats-title");
  if (!titleEl || !gameState.profile) return;

  titleEl.textContent = `Princess ${gameState.profile.name}`;
}

// ============================================================
// ⚙️ SETTINGS MENU INITIALIZATION
// ============================================================
export function initSettingsMenu() {
  const visualsToggle = document.getElementById("visuals-toggle");
  const visualsLabel = visualsToggle?.nextElementSibling;

  if (!visualsToggle) return;

  // 🩷 Apply saved preference
  visualsToggle.checked = gameState.settings.visualEffects;
  visualsLabel.textContent = visualsToggle.checked ? "Enabled" : "Disabled";

  // 🪄 Apply the state immediately when the menu loads
  toggleMagicSparkles(gameState.settings.visualEffects);

  // 🎧 When player changes the toggle
  visualsToggle.addEventListener("change", () => {
    const enabled = visualsToggle.checked;
    gameState.settings.visualEffects = enabled;
    visualsLabel.textContent = enabled ? "Enabled" : "Disabled";
    saveProfiles();                // persist the choice
    toggleMagicSparkles(enabled);  // apply immediately
  });
}

// ============================================================
// ✨ MAGIC SPARKLES VISIBILITY
// ============================================================
export function toggleMagicSparkles(enabled) {
  const sparkles = document.querySelectorAll(".magic-sparkle");
  if (!sparkles.length) return;

  sparkles.forEach((el) => {
    el.style.opacity = enabled ? "1" : "0";
    el.style.pointerEvents = enabled ? "auto" : "none";
  });
}

// ============================================================
// 🧪 TEMP TEST — Keyboard Controls for HUD Verification
// ------------------------------------------------------------
// Press H / J to damage / heal HP
// Press M / N to spend / restore Mana
// ============================================================
document.addEventListener("keydown", (e) => {
  const p = gameState.player;
  if (!p) return;

  switch (e.key.toLowerCase()) {
    case "h":
      p.hp = Math.max(0, p.hp - 10);
      console.log(`💔 HP -10 → ${p.hp}/${p.maxHp}`);
      updateHUD();
      break;
    case "j":
      p.hp = Math.min(p.maxHp, p.hp + 10);
      console.log(`💖 HP +10 → ${p.hp}/${p.maxHp}`);
      updateHUD();
      break;
    case "m":
      p.mana = Math.max(0, p.mana - 10);
      console.log(`🔷 Mana -10 → ${p.mana}/${p.maxMana}`);
      updateHUD();
      break;
    case "n":
      p.mana = Math.min(p.maxMana, p.mana + 10);
      console.log(`🔹 Mana +10 → ${p.mana}/${p.maxMana}`);
      updateHUD();
      break;
  }
});

// ============================================================
// 🌟 END OF FILE
// ============================================================

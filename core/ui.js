// ============================================================
// 🌸 ui.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Basic HUD display and stat management
// ✦ Controls wave, gold, diamond, and life counters
// ✦ Updates the in-game UI elements dynamically
// ============================================================

import { getCurrencies } from "../utils/gameState.js";

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
  const { gold, diamonds } = getCurrencies();
  waveDisplay.textContent = `Wave ${gameStats.wave}`;
  goldDisplay.textContent = `Gold: ${gold}`;
  diamondDisplay.textContent = `Diamonds: ${diamonds}`;
  livesDisplay.textContent = `Lives: ${gameStats.lives}`;
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
  setTimeout(() => (overlay.style.display = "none"), 600);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

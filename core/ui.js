// ============================================================
// 🌸 ui.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Basic HUD display and stat management
// ✦ Controls wave, money, and life counters
// ✦ Updates the in-game UI elements dynamically
// ============================================================

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let waveDisplay, moneyDisplay, livesDisplay;

let gameStats = {
  wave: 1,
  money: 100,
  lives: 10
};

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initUI() {
  waveDisplay = document.getElementById("wave-display");
  moneyDisplay = document.getElementById("money-display");
  livesDisplay = document.getElementById("lives-display");

  updateHUD();
}

// ------------------------------------------------------------
// 💖 UPDATE HUD
// ------------------------------------------------------------
export function updateHUD() {
  waveDisplay.textContent = `Wave ${gameStats.wave}`;
  moneyDisplay.textContent = `Money ${gameStats.money}`;
  livesDisplay.textContent = `Lives ${gameStats.lives}`;
}

// ------------------------------------------------------------
// 📜 GET GAME STATS
// ------------------------------------------------------------
export function getStats() {
  return gameStats;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

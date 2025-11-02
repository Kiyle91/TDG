// ============================================================
// 💻 ui.js — Basic HUD Controls
// ============================================================

let waveDisplay, moneyDisplay, livesDisplay;

let gameStats = {
  wave: 1,
  money: 100,
  lives: 10
};

export function initUI() {
  waveDisplay = document.getElementById("wave-display");
  moneyDisplay = document.getElementById("money-display");
  livesDisplay = document.getElementById("lives-display");
  updateHUD();
}

export function updateHUD() {
  waveDisplay.textContent = `Wave ${gameStats.wave}`;
  moneyDisplay.textContent = `💰 ${gameStats.money}`;
  livesDisplay.textContent = `❤️ ${gameStats.lives}`;
}

export function getStats() {
  return gameStats;
}

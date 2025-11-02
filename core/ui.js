// ui.js — basic HUD display and stat management

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
  moneyDisplay.textContent = `Money ${gameStats.money}`;
  livesDisplay.textContent = `Lives ${gameStats.lives}`;
}

export function getStats() {
  return gameStats;
}

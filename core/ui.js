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
// 🌸 ui.js — basic overlay helpers
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

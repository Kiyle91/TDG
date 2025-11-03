// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Entry point and main game loop
// ✦ Initializes all core screens and systems
// ✦ Controls update & render cycles at fixed FPS
// ============================================================

import { initGame, updateGame, renderGame } from "./core/game.js";
import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";

// ------------------------------------------------------------
// ⚙️ LOOP SETTINGS
// ------------------------------------------------------------
let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;

// ------------------------------------------------------------
// 🕒 MAIN GAME LOOP
// ------------------------------------------------------------
function gameLoop(timestamp) {
  const delta = timestamp - lastTime;

  if (delta >= FRAME_DURATION) {
    updateGame(delta);
    renderGame();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
initLanding();

window.addEventListener("DOMContentLoaded", () => {
  initLanding();
  initProfiles();
  initHub();

  // 🏰 Initialize main game systems
  initGame();
  requestAnimationFrame(gameLoop);
});

// ============================================================
// 🌟 END OF FILE
// ============================================================

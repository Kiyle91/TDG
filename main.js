// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Entry point and main control flow
// ✦ Game loop now starts ONLY when player begins gameplay
// ============================================================

import { initGame, updateGame, renderGame } from "./core/game.js";
import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";


let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
let gameActive = false; // 🩵 prevents loop from running during menus

// ------------------------------------------------------------
// 🕒 GAME LOOP
// ------------------------------------------------------------
function gameLoop(timestamp) {
  if (!gameActive) return; // ⛔ stop updating until gameplay starts

  const delta = timestamp - lastTime;
  if (delta >= FRAME_DURATION) {
    updateGame(delta);
    renderGame();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// ------------------------------------------------------------
// 🎬 START GAMEPLAY LOOP (called when player begins game)
// ------------------------------------------------------------
export function startGameplay() {
  if (gameActive) return;
  gameActive = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
  console.log("🎮 Gameplay loop started!");
}

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  initLanding();
  initProfiles();
  initHub();
  initGame();
  initSparkles();
  initMusic();
  initSettings();
  console.log("🌸 Olivia’s World loaded — menu systems active");
});

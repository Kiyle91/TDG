// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Entry point and main control flow
// ✦ Game loop now starts ONLY when player begins gameplay
// ✦ Adds Victory/Defeat stop system
// ============================================================

import { initGame, updateGame, renderGame } from "./core/game.js";
import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";
import { initTooltipSystem } from "./core/tooltip.js";

let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;

export let gameActive = false; // exported so game.js can stop loop externally

// ------------------------------------------------------------
// 🕒 GAME LOOP
// ------------------------------------------------------------
function gameLoop(timestamp) {
  if (!gameActive) return; // ⛔ stop updating if stopped externally

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
// 🛑 STOP GAMEPLAY LOOP (called on victory/defeat)
// ------------------------------------------------------------
export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;
  gameActive = false;
  console.log(`🛑 Gameplay stopped due to: ${reason}`);
  showEndScreen(reason);
}

// ------------------------------------------------------------
// 🖼️ END SCREEN (temporary placeholder UI)
// ------------------------------------------------------------
function showEndScreen(reason) {
  const overlay = document.createElement("div");
  overlay.id = "end-screen";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.color = "#fff";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.fontSize = "2rem";
  overlay.style.zIndex = "9999";

  if (reason === "victory") {
    overlay.innerHTML = "🏆 Victory!<br>Level Complete";
  } else if (reason === "defeat") {
    overlay.innerHTML = "💀 Game Over<br>Try Again?";
  } else {
    overlay.innerHTML = "Game Ended";
  }

  document.body.appendChild(overlay);
}

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  initMusic();
  initLanding();
  initProfiles();
  initHub();
  initGame();
  initSparkles();
  initMusic();
  initSettings();
  initTooltipSystem();
  console.log("🌸 Olivia’s World loaded — menu systems active");
});

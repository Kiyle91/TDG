// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Entry point and main control flow
// ✦ Start/stop gameplay loop
// ✦ Themed end screen with Try Again / Return to Hub
// ✦ "Try Again" resets combat state but keeps gold/diamonds
// ============================================================

import { initGame, updateGame, renderGame, resetCombatState } from "./core/game.js";
import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";
import { initTooltipSystem } from "./core/tooltip.js";
import { showScreen } from "./core/screens.js";
import { gameState } from "./utils/gameState.js";

let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;

export let gameActive = false; // exported so core/game.js can stop loop

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
// 🔁 RESET GAMEPLAY STATE (Try Again)
// ✦ Keeps currencies (gold/diamonds)
// ✦ Resets HP, lives, wave, enemies, counters
// ------------------------------------------------------------
function resetGameplay() {
  console.log("🔄 Restarting combat loop (fresh battle, keep currency).");

  // Preserve currencies
  const savedGold = gameState.player?.gold ?? 0;
  const savedDiamonds = gameState.player?.diamonds ?? 0;

  // Reset core player/battle stats
  if (!gameState.player) gameState.player = {};
  gameState.player.hp = gameState.player.maxHp ?? 100;
  gameState.player.lives = 10;
  gameState.player.wave = 1;
  gameState.player.gold = savedGold;
  gameState.player.diamonds = savedDiamonds;

  // Remove overlay
  document.getElementById("end-screen")?.remove();

  // Reset combat subsystems (enemies/towers/projectiles, counters, etc.)
  resetCombatState();

  // Resume loop
  startGameplay();
  console.log("🌸 New battle started!");
}

// ------------------------------------------------------------
// 🖼️ THEMED END SCREEN (Pastel, darkened backdrop)
// ------------------------------------------------------------
function showEndScreen(reason) {
  // Darkened backdrop
  const overlay = document.createElement("div");
  overlay.id = "end-screen";
  overlay.className = "end-overlay";
  document.body.appendChild(overlay);

  // Crystal panel
  const panel = document.createElement("div");
  panel.className = "end-panel";
  overlay.appendChild(panel);

  const title = document.createElement("h1");
  const subtitle = document.createElement("p");
  const buttons = document.createElement("div");
  buttons.className = "end-buttons";

  switch (reason) {
    case "defeat":
      title.textContent = "Sorry, Princess…";
      subtitle.textContent =
        "Your strength fades as the goblins overwhelm you. The realm weeps for its guardian.";
      break;
    case "lives":
      title.textContent = "Sorry, Princess…";
      subtitle.textContent =
        "The goblins broke through your defenses. The Crystal Keep trembles.";
      break;
    case "victory":
      title.textContent = "You have held back the goblin forces — for now…";
      subtitle.textContent =
        "You make your way back to the Crystal Keep to regroup and prepare for the next wave.";
      break;
    default:
      title.textContent = "Game Ended";
      subtitle.textContent = "";
  }

  // Buttons
  const retryBtn = document.createElement("button");
  retryBtn.textContent = reason === "victory" ? "Continue" : "Try Again";
  retryBtn.onclick = resetGameplay;

  const hubBtn = document.createElement("button");
  hubBtn.textContent = "Return to Hub";
  hubBtn.onclick = () => {
    document.getElementById("end-screen")?.remove();
    showScreen("hub"); // your in-game hub screen
  };

  buttons.append(retryBtn, hubBtn);
  panel.append(title, subtitle, buttons);

  // Soft fade-in
  requestAnimationFrame(() => overlay.classList.add("visible"));
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

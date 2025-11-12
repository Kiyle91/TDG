// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep (Final Stable Loop Edition)
// ------------------------------------------------------------
// ✦ Master control flow for Olivia’s World
// ✦ Fixes freeze when going New Game → Home → New Game
// ✦ Adds window.__gameLoopID assignments for safe restart
// ✦ Keeps safe exit path (no defeat overlay)
// ✦ Supports Continue / Try Again / Victory / Defeat flows
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
import { gameState, getCurrencies, spendDiamonds } from "./utils/gameState.js";
import { updateHUD } from "./core/ui.js";
import { startGoblinIntroStory } from "./core/story.js";
import { initNavbar } from "./core/navbar.js";


let lastTime = 0;
const FPS = 60;
const FRAME_DURATION = 1000 / FPS;
export let gameActive = false;

// ------------------------------------------------------------
// 🕒 GAME LOOP
// ------------------------------------------------------------
function gameLoop(timestamp) {
  if (!gameActive) return;
  const delta = timestamp - lastTime;
  if (delta >= FRAME_DURATION) {
    if (!gameState.paused) updateGame(delta);
    renderGame();
    lastTime = timestamp;
  }
  // ✅ Always store the loop ID for future cancel calls
  window.__gameLoopID = requestAnimationFrame(gameLoop);
}

// ------------------------------------------------------------
// 🎮 START GAMEPLAY LOOP
// ------------------------------------------------------------
export function startGameplay() {
  // 💡 Stop any lingering loop from prior session
  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;

  // 🧹 Remove old overlays
  document.getElementById("end-screen")?.remove();

  gameActive = true;
  gameState.paused = false;
  lastTime = performance.now();

  // ✅ Store new loop ID (prevents freeze after exiting/restarting)
  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🎮 Gameplay loop started!");

  // 📖 Goblin intro only once
  if (!gameState.goblinIntroPlayed) {
    gameState.goblinIntroPlayed = true;
    gameState.paused = true;
    startGoblinIntroStory().then(() => {
      gameState.paused = false;
      console.log("📖 Goblin intro finished — resuming battle!");
    });
  }
}

// ------------------------------------------------------------
// 🛑 STOP GAMEPLAY LOOP (defeat / exit / victory)
// ------------------------------------------------------------
export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;

  // 🚪 SAFE EXIT — return to hub without defeat overlay
  if (reason === "exit") {
    console.log("🏠 Graceful exit triggered — returning to Hub safely.");
    cancelAnimationFrame(window.__gameLoopID);
    gameActive = false;
    gameState.paused = true;
    gameState.session = null;

    try {
      import("./core/save.js").then((mod) => mod.manualSave?.());
    } catch {}

    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
    console.log("✨ Returned to Hub (no defeat overlay).");
    return;
  }

  // Normal defeat/victory handling
  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  console.log(`🛑 Gameplay stopped due to: ${reason}`);
  showEndScreen(reason);
}

// ------------------------------------------------------------
// 🔁 RESET GAMEPLAY (Try Again / Restart / New Game)
// ------------------------------------------------------------
export function resetGameplay() {
  console.log("🔄 Restarting combat loop (fresh battle, keep currency).");

  // 🧩 Stop any old loop safely
  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = false;

  const savedGold = gameState.player?.gold ?? 0;
  const savedDiamonds = gameState.player?.diamonds ?? 0;

  if (!gameState.player) gameState.player = {};

  gameState.player.hp = gameState.player.maxHp ?? 100;
  gameState.player.lives = 10;
  gameState.player.wave = 1;
  gameState.player.gold = savedGold;
  gameState.player.diamonds = savedDiamonds;
  gameState.player.pos = { x: 1000, y: 500 };

  document.getElementById("end-screen")?.remove();

  // 🧩 Reset combat subsystems (enemies, towers, etc.)
  resetCombatState();

  // ⏱ Reset timing and restart loop cleanly
  lastTime = performance.now();
  gameActive = true;
  gameState.paused = false;

  // ✅ New stored loop ID
  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🌸 New battle started cleanly!");
}

// ------------------------------------------------------------
// 💎 CONTINUE USING DIAMONDS
// ------------------------------------------------------------
function tryContinueWithDiamonds() {
  const player = gameState.player;
  const c = getCurrencies();

  if (c.diamonds >= 25 && spendDiamonds(25)) {
    console.log("💎 Continue purchased — restoring player!");
    document.getElementById("end-screen")?.remove();

    player.hp = player.maxHp;
    player.lives = 10;
    player.dead = false;
    updateHUD();
    gameState.paused = false;
    startGameplay();

    // ✨ Visual feedback
    const msg = document.createElement("div");
    msg.textContent = "✨ The Crystal restores your strength!";
    Object.assign(msg.style, {
      position: "fixed",
      top: "40%", width: "100%",
      textAlign: "center",
      fontSize: "24px",
      color: "#fff2b3",
      textShadow: "0 0 10px #fff",
      zIndex: 9999,
    });
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  } else {
    console.log("❌ Not enough diamonds to continue.");
    const warn = document.createElement("div");
    warn.textContent = "💎 You need 25 diamonds to continue!";
    Object.assign(warn.style, {
      position: "fixed",
      top: "40%", width: "100%",
      textAlign: "center",
      fontSize: "22px",
      color: "#ff99b9",
      textShadow: "0 0 8px #fff",
      zIndex: 9999,
    });
    document.body.appendChild(warn);
    setTimeout(() => warn.remove(), 2000);
  }
}

// ------------------------------------------------------------
// 🎭 END SCREEN OVERLAY
// ------------------------------------------------------------
function showEndScreen(reason) {
  const overlay = document.createElement("div");
  overlay.id = "end-screen";
  overlay.className = "end-overlay";
  document.body.appendChild(overlay);

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
      subtitle.textContent = "Your strength fades as the goblins overwhelm you.";
      break;
    case "lives":
      title.textContent = "Sorry, Princess…";
      subtitle.textContent = "The goblins broke through your defenses.";
      break;
    case "victory":
      title.textContent = "You have held back the goblin forces — for now…";
      subtitle.textContent = "You return to the Crystal Keep to regroup.";
      break;
    default:
      title.textContent = "Game Ended";
      subtitle.textContent = "";
  }

  const retryBtn = document.createElement("button");
  retryBtn.textContent = reason === "victory" ? "Continue" : "Try Again";
  retryBtn.onclick = resetGameplay;

  const hubBtn = document.createElement("button");
  hubBtn.textContent = "Return to Hub";
  hubBtn.onclick = () => {
    document.getElementById("end-screen")?.remove();
    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
    console.log("🏰 Returned to Hub via End Screen.");
  };

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue (25 💎)";
  continueBtn.onclick = tryContinueWithDiamonds;

  buttons.append(continueBtn, retryBtn, hubBtn);
  panel.append(title, subtitle, buttons);
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
  initSettings();
  initNavbar();
  initTooltipSystem();
  console.log("🌸 Olivia’s World loaded — menu systems active");
});

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep (Continue System + Goblin Story Integration)
// ------------------------------------------------------------
// ✦ Entry point and master control flow
// ✦ Ensures overlays are cleared on every new game
// ✦ Supports "Continue for 25 Diamonds" after defeat
// ✦ Pauses during story sequences
// ✦ Updated spawn position → x: 1000, y: 500
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
    // ⏸️ Skip updates while paused
    if (!gameState.paused) {
      updateGame(delta);
    }
    renderGame();
    lastTime = timestamp;
  }
  requestAnimationFrame(gameLoop);
}

// ------------------------------------------------------------
// 🎬 START GAMEPLAY LOOP
// ------------------------------------------------------------
export function startGameplay() {
  // 💡 Clear any lingering overlays (defeat/victory)
  const oldOverlay = document.getElementById("end-screen");
  if (oldOverlay) {
    oldOverlay.remove();
    console.log("🧹 Cleared leftover end-screen overlay before starting new game.");
  }

  if (gameActive) return;
  gameActive = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
  console.log("🎮 Gameplay loop started!");

  // 📖 Start goblin intro story (only once)
  if (!gameState.goblinIntroPlayed) {
    gameState.goblinIntroPlayed = true;
    gameState.paused = true; // pause game during dialogue
    startGoblinIntroStory().then(() => {
      gameState.paused = false;
      console.log("📖 Goblin intro finished — resuming battle!");
    });
  }
}

// ------------------------------------------------------------
// 🛑 STOP GAMEPLAY LOOP
// ------------------------------------------------------------
export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;
  gameActive = false;
  console.log(`🛑 Gameplay stopped due to: ${reason}`);
  showEndScreen(reason);
}

// ------------------------------------------------------------
// 🔁 RESET GAMEPLAY STATE (Try Again)
// ------------------------------------------------------------
function resetGameplay() {
  console.log("🔄 Restarting combat loop (fresh battle, keep currency).");

  const savedGold = gameState.player?.gold ?? 0;
  const savedDiamonds = gameState.player?.diamonds ?? 0;

  if (!gameState.player) gameState.player = {};

  gameState.player.hp = gameState.player.maxHp ?? 100;
  gameState.player.lives = 10;
  gameState.player.wave = 1;
  gameState.player.gold = savedGold;
  gameState.player.diamonds = savedDiamonds;

  // 🎯 Reset player position (fixed spawn)
  gameState.player.pos = { x: 1000, y: 500 };
  console.log(`📍 Player respawned at x:${gameState.player.pos.x}, y:${gameState.player.pos.y}`);

  // Remove overlay before resetting combat
  document.getElementById("end-screen")?.remove();

  resetCombatState();
  gameState.paused = false;
  startGameplay();
  console.log("🌸 New battle started!");
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

    // Restore player stats and resume
    player.hp = player.maxHp;
    player.lives = 10;
    player.dead = false;
    updateHUD();

    gameState.paused = false;

    // Resume gameplay immediately
    startGameplay();

    // ✨ Visual resurrection feedback
    const msg = document.createElement("div");
    msg.textContent = "✨ The Crystal restores your strength!";
    msg.style.position = "fixed";
    msg.style.top = "40%";
    msg.style.width = "100%";
    msg.style.textAlign = "center";
    msg.style.fontSize = "24px";
    msg.style.color = "#fff2b3";
    msg.style.textShadow = "0 0 10px #fff";
    msg.style.zIndex = "9999";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);

    // Sparkle revival burst
    const spark = document.createElement("div");
    spark.className = "revive-sparkle";
    spark.style.position = "fixed";
    spark.style.left = "50%";
    spark.style.top = "50%";
    spark.style.width = "100px";
    spark.style.height = "100px";
    spark.style.marginLeft = "-50px";
    spark.style.marginTop = "-50px";
    spark.style.borderRadius = "50%";
    spark.style.background = "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)";
    spark.style.zIndex = "9999";
    document.body.appendChild(spark);
    spark.animate(
      [
        { transform: "scale(0)", opacity: 1 },
        { transform: "scale(3)", opacity: 0 }
      ],
      { duration: 1200, easing: "ease-out" }
    );
    setTimeout(() => spark.remove(), 1200);
  } else {
    console.log("❌ Not enough diamonds to continue.");
    const warn = document.createElement("div");
    warn.textContent = "💎 You need 25 diamonds to continue!";
    warn.style.position = "fixed";
    warn.style.top = "40%";
    warn.style.width = "100%";
    warn.style.textAlign = "center";
    warn.style.fontSize = "22px";
    warn.style.color = "#ff99b9";
    warn.style.textShadow = "0 0 8px #fff";
    warn.style.zIndex = "9999";
    document.body.appendChild(warn);
    setTimeout(() => warn.remove(), 2000);
  }
}

// ------------------------------------------------------------
// 🖼️ THEMED END SCREEN (with Continue option)
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

  // 🔁 Try Again
  const retryBtn = document.createElement("button");
  retryBtn.textContent = reason === "victory" ? "Continue" : "Try Again";
  retryBtn.onclick = resetGameplay;

  // 🏰 Return to Hub
  const hubBtn = document.createElement("button");
  hubBtn.textContent = "Return to Hub";
  hubBtn.onclick = () => {
    document.getElementById("end-screen")?.remove();
    try {
      showScreen("hub-screen");
      setTimeout(() => initHub(), 50);
      console.log("🏰 Returned to Hub via screen manager (hub-screen).");
    } catch (err) {
      console.error("⚠️ Hub load failed:", err);
    }
  };

  // 💎 Continue Button
  const c = getCurrencies();
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

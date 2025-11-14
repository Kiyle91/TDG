// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep (Fixed Timestep + Map System)
// ------------------------------------------------------------
// ✦ Stutter-free fixed timestep game loop (60Hz update / RAF render)
// ✦ Complete multi-map support (Map One → Map Two)
// ✦ Victory Continue now unlocks Map One + moves player to Map Two
// ✦ Fully compatible with all overlays, hub, story, navbar
// ============================================================

import { 
  initGame, 
  updateGame, 
  renderGame,
  resetCombatState
} from "./core/game.js";

import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";
import { initTooltipSystem } from "./core/tooltip.js";
import { showScreen } from "./core/screens.js";
import { 
  gameState, 
  getCurrencies, 
  spendDiamonds, 
  unlockMap,
  setCurrentMap,
  saveProfiles
} from "./utils/gameState.js";
import { updateHUD } from "./core/ui.js";
import { startGoblinIntroStory } from "./core/story.js";
import { initNavbar } from "./core/navbar.js";


// ============================================================
// 🎮 GLOBAL GAME LOOP STATE
// ============================================================
export let gameActive = false;


// ============================================================
// ⏱ FIXED TIMESTEP VARIABLES
// ============================================================

let lastTimestamp = 0;
let accumulator = 0;
const FIXED_DT = 1000 / 60; // 60Hz update interval


// ============================================================
// 🎯 MAIN GAME LOOP
// ============================================================

function gameLoop(timestamp) {
  if (!gameActive) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  let delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (delta > 100) delta = 100; // avoid tab-switch jumps
  accumulator += delta;

  // 🔁 FIXED 60Hz update loop
  while (accumulator >= FIXED_DT) {
    if (!gameState.paused) updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // 🎨 Render once per RAF
  renderGame();

  window.__gameLoopID = requestAnimationFrame(gameLoop);
}


// ============================================================
// ▶️ START GAMEPLAY
// ============================================================

export function startGameplay() {
  cancelAnimationFrame(window.__gameLoopID);

  gameActive = true;
  gameState.paused = false;

  lastTimestamp = performance.now();
  accumulator = 0;

  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🎮 Gameplay loop started!");

  // Intro story once
  if (!gameState.goblinIntroPlayed) {
    gameState.goblinIntroPlayed = true;
    gameState.paused = true;
    startGoblinIntroStory().then(() => {
      gameState.paused = false;
      console.log("📖 Goblin intro finished — battle continues.");
    });
  }
}


// ============================================================
// ⛔ STOP GAMEPLAY (victory / defeat / exit)
// ============================================================

export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;

  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = true;

  console.log(`🛑 Gameplay stopped: ${reason}`);

  // Safe exit to hub
  if (reason === "exit") {
    document.getElementById("end-screen")?.remove();
    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
    console.log("🏠 Returned to Hub (safe exit).");
    return;
  }

  showEndScreen(reason);
}


// ============================================================
// 🔁 RESET GAMEPLAY (Try Again / Restart)
// ============================================================

export function resetGameplay() {
  console.log("🔄 Combat reset!");

  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = false;

  const savedGold = gameState.player?.gold ?? 0;
  const savedDiamonds = gameState.player?.diamonds ?? 0;

  const p = gameState.player || (gameState.player = {});
  p.hp = p.maxHp ?? 100;
  p.lives = 10;
  p.wave = 1;
  p.gold = savedGold;
  p.diamonds = savedDiamonds;

  // Default respawn
  p.pos = { x: 1000, y: 500 };

  document.getElementById("end-screen")?.remove();
  resetCombatState();

  lastTimestamp = performance.now();
  accumulator = 0;

  gameActive = true;
  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🌸 Restart complete.");
}


// ============================================================
// 💎 CONTINUE WITH DIAMONDS
// ============================================================

function tryContinueWithDiamonds() {
  const p = gameState.player;
  const c = getCurrencies();

  if (c.diamonds >= 25 && spendDiamonds(25)) {
    console.log("💎 Continue purchased!");

    document.getElementById("end-screen")?.remove();

    p.hp = p.maxHp;
    p.lives = 10;
    p.dead = false;

    updateHUD();
    gameState.paused = false;
    startGameplay();

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


// ============================================================
// 🕯 END SCREEN (Victory / Defeat)
// ============================================================

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

  // ---------------------------
  // Victory / Defeat messages
  // ---------------------------
  if (reason === "victory") {
    title.textContent = "You have held back the goblin forces — for now…";
    subtitle.textContent = "You return to the Crystal Keep to regroup.";
  } else if (reason === "defeat" || reason === "lives") {
    title.textContent = "Sorry, Princess…";
    subtitle.textContent = "Your strength fades as the goblins overwhelm you.";
  } else {
    title.textContent = "Game Ended";
    subtitle.textContent = "";
  }

  // ---------------------------
  // Image
  // ---------------------------
  let img = document.createElement("img");
  if (reason === "victory") {
    img.src = "./assets/images/sprites/glitter/glitter_attack_right.png";
  } else {
    img.src = "./assets/images/sprites/glitter/glitter_slain.png";
  }
  img.style.display = "block";
  img.style.margin = "20px auto 35px auto";
  img.style.width = "180px";
  img.style.filter = "drop-shadow(0 0 12px #ffffffaa)";

  // ---------------------------
  // Buttons
  // ---------------------------
  const retryBtn = document.createElement("button");
  retryBtn.textContent = reason === "victory" ? "Continue" : "Try Again";

  if (reason === "victory") {
    retryBtn.onclick = async () => {

      // Unlock Map 2
      unlockMap(2);

      // Switch to Map 2
      gameState.progress.currentMap = 2;

      // Save
      saveProfiles();

      console.log("🌍 Switching to Map Two...");

      // Remove end screen
      document.getElementById("end-screen")?.remove();

      // Load game screen
      showScreen("game-container");

      // 💥 FULL RELOAD OF GAME SYSTEMS
      await initGame();

      // Start loop
      startGameplay();
    };
  }

  const hubBtn = document.createElement("button");
  hubBtn.textContent = "Return to Hub";
  hubBtn.onclick = () => {
    document.getElementById("end-screen")?.remove();
    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
  };

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Continue (25 💎)";
  continueBtn.onclick = tryContinueWithDiamonds;

  // Victory screen = only Continue to next map
  if (reason === "victory") {
    buttons.append(retryBtn);
  } else {
    buttons.append(continueBtn, retryBtn, hubBtn);
  }

  panel.append(title, subtitle, img, buttons);

  requestAnimationFrame(() => overlay.classList.add("visible"));
}


// ============================================================
// 🌼 INITIALISATION — runs once on page load
// ============================================================

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

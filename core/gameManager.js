// ============================================================
// 🧠 gameManager.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles victory / defeat conditions and session resets
// ✦ Communicates with UI overlays and HUD
// ✦ Controls restart + return to hub flow
// ============================================================

import { gameState, saveProfiles, setCurrentMap, unlockMap } from "../utils/gameState.js";
import { updateHUD, showOverlay } from "./ui.js";
import { initEnemies } from "./enemies.js";
import { initTowers } from "./towers.js";
import { initProjectiles } from "./projectiles.js";



// ------------------------------------------------------------
// ⚙️ SESSION START
// ------------------------------------------------------------
export function startSession(mapId = 1, totalGoblins = 50) {
  console.log(`🎮 Starting session for Map ${mapId}`);

  gameState.session = {
    goblinsDefeated: 0,
    totalGoblinsThisMap: totalGoblins,
    mapActive: true,
    mapId,
  };

  if (!gameState.player.lives) gameState.player.lives = 10;
  gameState.player.hp = gameState.player.maxHp;

  initEnemies();
  initTowers();
  initProjectiles();
  updateHUD();
}

// ------------------------------------------------------------
// ⚔️ REGISTER GOBLIN KILL
// ------------------------------------------------------------
export function registerGoblinKill() {
  if (!gameState.session?.mapActive) return;
  gameState.session.goblinsDefeated++;
  console.log(`⚔️ Goblins defeated: ${gameState.session.goblinsDefeated}/${gameState.session.totalGoblinsThisMap}`);

  if (gameState.session.goblinsDefeated >= gameState.session.totalGoblinsThisMap) {
    triggerVictory();
  }
}

// ------------------------------------------------------------
// 💔 DEFEAT CONDITIONS
// ------------------------------------------------------------
export function checkDefeatConditions() {
  const p = gameState.player;
  if (!p) return;

  console.log("🧩 checkDefeatConditions running — HP:", p.hp, "Lives:", p.lives);

  // HP = 0 → defeat
  if (p.hp <= 0) {
    console.log("💀 checkDefeatConditions → HP = 0 detected");
    triggerDefeat("player");
  }

  // Lives = 0 → defeat
  if (p.lives <= 0) {
    console.log("💀 checkDefeatConditions → Lives = 0 detected");
    triggerDefeat("lives");
  }
}

// ------------------------------------------------------------
// 🏆 VICTORY
// ------------------------------------------------------------
export function triggerVictory() {
  if (!gameState.session?.mapActive) return;
  gameState.session.mapActive = false;

  console.log("🏆 Victory! Map cleared!");
  gameState.resources.xp += 100;
  gameState.profile.currencies.gold += 200;
  unlockMap(gameState.session.mapId + 1);

  saveProfiles();
  updateHUD();

  console.log("🎉 Showing victory overlay...");
  showOverlay("victory-overlay");
}

// ------------------------------------------------------------
// 💀 DEFEAT (Guaranteed 5s Delay Before Overlay)
// ------------------------------------------------------------
export function triggerDefeat(reason = "unknown") {
  if (!gameState.session) return;
  if (!gameState.session.mapActive) return; // prevent multiple triggers

  console.log("💀 Defeat triggered — reason:", reason);
  gameState.session.mapActive = false;

  // 🩸 Mark player as fallen
  if (gameState.player) {
    gameState.player.hp = 0;
    gameState.player.dead = true;
  }

  // 🛑 Stop the main game loop right away
  cancelAnimationFrame(window.__gameLoopID);

  // 🕰️ Lock out any immediate overlay display
  const overlay = document.getElementById("defeat-overlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("active");
  }

  console.log("⏳ Waiting 5 seconds before showing defeat overlay...");

  // 💫 After 5s, fade in defeat overlay
  setTimeout(() => {
    const overlay = document.getElementById("defeat-overlay");
    if (overlay) {
      overlay.style.display = "flex";
      overlay.classList.add("active");
      overlay.style.opacity = 0;
      overlay.style.transition = "opacity 1.5s ease";
      requestAnimationFrame(() => (overlay.style.opacity = 1));
      console.log("🎭 Defeat overlay displayed after delay!");
    } else {
      console.warn("⚠️ Defeat overlay not found in DOM!");
    }

    // Update and save after delay
    updateHUD();
    saveProfiles();
  }, 1500); // 5 seconds delay
}


// ------------------------------------------------------------
// 🔁 RESTART MAP
// ------------------------------------------------------------
export function restartMap() {
  const mapId = gameState.session?.mapId ?? 1;
  console.log(`🔁 Restarting Map ${mapId}...`);
  startSession(mapId);
  const overlay = document.querySelector(".overlay.active");
  if (overlay) overlay.classList.remove("active");
}

// ------------------------------------------------------------
// 🏰 RETURN TO HUB
// ------------------------------------------------------------
export function returnToHub() {
  console.log("🏰 Returning to hub...");
  if (gameState.session) gameState.session.mapActive = false;
  setCurrentMap(null);
  showOverlay("hub-screen");
}

// ------------------------------------------------------------
// 🌍 GLOBAL ACCESS (for inline HTML buttons)
// ------------------------------------------------------------
window.restartMap = restartMap;
window.returnToHub = returnToHub;

// ============================================================
// 🌟 END OF FILE
// ============================================================

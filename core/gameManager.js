// ============================================================
// 🧠 gameManager.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles victory / defeat conditions + session resets
// ✦ Manages reward flow + map progression
// ✦ Controls restart / return-to-hub behaviour
// ============================================================
/* ------------------------------------------------------------
 * MODULE: gameManager.js
 * PURPOSE:
 *   Centralizes all session-level game flow logic including
 *   victory, defeat, map restarts, and returning to the hub.
 *
 * SUMMARY:
 *   The game manager tracks the number of enemies defeated in a
 *   session, controls defeat conditions (HP or lives reaching 0),
 *   triggers the appropriate overlays, and resets player/session
 *   state when restarting or exiting to the hub.
 *
 * FEATURES:
 *   • startSession() — initializes a new gameplay run
 *   • registerGoblinKill() — updates kill counters + checks victory
 *   • checkDefeatConditions() — monitors HP/lives for defeat
 *   • triggerVictory() — handles rewards + unlocks next map
 *   • triggerDefeat() — fades defeat overlay after timed delay
 *   • restartMap() — restarts the current map cleanly
 *   • returnToHub() — exits gameplay session back to hub
 *
 * TECHNICAL NOTES:
 *   • Integrates tightly with gameState, HUD, overlays, and
 *     enemy/tower subsystems.
 *   • No rendering or movement logic lives here — only flow.
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, saveProfiles, setCurrentMap, unlockMap } from "../utils/gameState.js";
import { updateHUD, showOverlay } from "../screenManagement/ui.js";
import { initGoblins } from "../entities/goblin.js";
import { initSpires } from "../spires/spires.js";
import { initProjectiles } from "../spires/projectiles.js";

// ------------------------------------------------------------
// ⚙️ SESSION START
// ------------------------------------------------------------

export function startSession(mapId = 1, totalGoblins = 50) {
  gameState.session = {
    goblinsDefeated: 0,
    totalGoblinsThisMap: totalGoblins,
    mapActive: true,
    mapId,
  };

  if (!gameState.player.lives) gameState.player.lives = 10;
  gameState.player.hp = gameState.player.maxHp;

  initGoblins();
  initSpires();
  initProjectiles();
  updateHUD();
}

// ------------------------------------------------------------
// ⚔️ REGISTER GOBLIN KILL
// ------------------------------------------------------------

export function registerGoblinKill() {
  if (!gameState.session?.mapActive) return;
  gameState.session.goblinsDefeated++;

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

  // HP = 0 → defeat
  if (p.hp <= 0) {
    triggerDefeat("player");
  }

  // Lives = 0 → defeat
  if (p.lives <= 0) {
    triggerDefeat("lives");
  }
}

// ------------------------------------------------------------
// 🏆 VICTORY HANDLER
// ------------------------------------------------------------

export function triggerVictory() {
  if (!gameState.session?.mapActive) return;
  gameState.session.mapActive = false;

  // Rewards
  gameState.resources.xp += 100;
  gameState.profile.currencies.gold += 200;

  unlockMap(gameState.session.mapId + 1);
  saveProfiles();
  updateHUD();

  // Show overlay
  showOverlay("victory-overlay");
}

// ------------------------------------------------------------
// 💀 DEFEAT HANDLER (with delayed overlay)
// ------------------------------------------------------------

export function triggerDefeat(reason = "unknown") {
  if (!gameState.session || !gameState.session.mapActive) return;

  gameState.session.mapActive = false;

  // Mark player dead
  if (gameState.player) {
    gameState.player.hp = 0;
    gameState.player.dead = true;
  }

  // Stop main game loop immediately
  cancelAnimationFrame(window.__gameLoopID);

  // Hide overlay before fade-in
  const overlay = document.getElementById("defeat-overlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.classList.remove("active");
  }

  // Delay before showing overlay
  setTimeout(() => {
    const overlay = document.getElementById("defeat-overlay");
    if (overlay) {
      overlay.style.display = "flex";
      overlay.classList.add("active");
      overlay.style.opacity = 0;
      overlay.style.transition = "opacity 1.5s ease";
      requestAnimationFrame(() => (overlay.style.opacity = 1));
    }

    // Save after overlay
    updateHUD();
    saveProfiles();
  }, 1500);
}

// ------------------------------------------------------------
// 🔁 RESTART MAP
// ------------------------------------------------------------

export function restartMap() {
  const mapId = gameState.session?.mapId ?? 1;
  startSession(mapId);

  const overlay = document.querySelector(".overlay.active");
  if (overlay) overlay.classList.remove("active");
}

// ------------------------------------------------------------
// 🏰 RETURN TO HUB
// ------------------------------------------------------------

export function returnToHub() {
  if (gameState.session) {
    gameState.session.mapActive = false;
  }

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

// ============================================================
// 🗺️ maps.js — Map Selection Overlay Logic
// ------------------------------------------------------------
// ✦ Applies locked/unlocked visuals
// ✦ Reloads proper map + resets combat
// ✦ Starts gameplay with correct spawn point
// ============================================================

/* ------------------------------------------------------------
 * MODULE: maps.js
 * PURPOSE:
 *   Controls the Map Selection overlay, updates map-tile
 *   lock states, handles map switching, reinitializes combat
 *   systems, saves progress, and starts gameplay for the
 *   selected map.
 * ------------------------------------------------------------ */

import { gameState, setCurrentMap, saveProfiles } from "../utils/gameState.js";
import { showScreen } from "../screenManagement/screens.js";
import { startGameplay, withLoadingOverlay } from "../main.js";
import { initGame } from "../core/game.js";
import { applyMapSpawn } from "../core/game.js";
import { resetCombatState } from "../core/game.js";
import { closeOverlay } from "../screenManagement/ui.js";

// ------------------------------------------------------------
// 🔐 UPDATE TILE VISUAL STATES
// ------------------------------------------------------------
export function updateMapTiles() {
  document.querySelectorAll(".map-tile").forEach((tile) => {
    const level = parseInt(tile.dataset.level);
    const unlocked = gameState.progress.mapsUnlocked[level - 1];

    if (unlocked) {
      tile.classList.add("unlocked");
      tile.classList.remove("locked");
      tile.style.filter = "none";
      tile.style.opacity = "1";
    } else {
      tile.classList.add("locked");
      tile.classList.remove("unlocked");
      tile.style.filter = "grayscale(100%) brightness(60%)";
      tile.style.opacity = "0.4";
    }
  });
}

// ------------------------------------------------------------
// 🎮 MAP SELECT INITIALISATION (SAFE — NO STACKED LISTENERS)
// ------------------------------------------------------------
export function initMapSelect() {
  updateMapTiles();

  document.querySelectorAll(".map-tile").forEach((tile) => {

    // ⭐ Replace tile with a clean clone to remove ALL old listeners
    const fresh = tile.cloneNode(true);
    tile.replaceWith(fresh);

    // ⭐ NEW tile reference
    const level = parseInt(fresh.dataset.level);

    // ⭐ Bind ONE clean click listener per tile
    fresh.addEventListener("click", async () => {

      // Block locked maps
      if (!gameState.progress.mapsUnlocked[level - 1]) {
        return;
      }

      // 1️⃣ Update global map state
      setCurrentMap(level);
      gameState.currentMap = level;
      if (gameState.profile?.progress) {
        gameState.profile.progress.currentMap = level;
      }

      // Reset shards for the new map (gameplay reset)
      if (gameState.profile) {
        const currencies = gameState.profile.currencies || (gameState.profile.currencies = { gold: 0, diamonds: 0 });
        currencies.gold = 0;
      }

      saveProfiles();

      // 2️⃣ Clean previous map state
      resetCombatState();

      // 3️⃣ Apply spawn for the new map
      applyMapSpawn();

      // 4️⃣ Save again
      saveProfiles();

      // 5️⃣ Close overlay
      const ov = document.getElementById("overlay-maps");
      if (ov) {
        ov.style.pointerEvents = "none";
        closeOverlay(ov);
      }

      // 6️⃣ Show game + re-init under loading screen
      await withLoadingOverlay(async () => {
        showScreen("game-container");
        await initGame();
      });

      // 7️⃣ Start gameplay
      startGameplay();
    });
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

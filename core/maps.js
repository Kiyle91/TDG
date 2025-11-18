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
 *
 * SUMMARY:
 *   The Hub uses this module to allow the player to choose
 *   any unlocked campaign map. This module ensures correct
 *   progression logic, fresh map loading, proper spawn point
 *   application, and clean reset of the previous map state.
 *
 * FEATURES:
 *   • updateMapTiles() — visual lock/unlock map tiles
 *   • initMapSelect() — click listeners for each map tile
 *   • Ensures correct currentMap → saved before gameplay
 *   • Fully resets combat + reinitializes game engine
 *   • Calls initGame() + startGameplay()
 *
 * TECHNICAL NOTES:
 *   • Must be consistent with gameState.progress.mapsUnlocked[]
 *   • Fresh economy per map (gold = 0 on load)
 *   • Applies correct player spawn via applyMapSpawn()
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------ 

import { gameState, setCurrentMap, saveProfiles } from "../utils/gameState.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { initGame } from "./game.js";
import { applyMapSpawn } from "./game.js";
import { resetCombatState } from "./game.js";

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
// 🎮 MAP SELECT INITIALISATION
// ------------------------------------------------------------
export function initMapSelect() {
  updateMapTiles();

  document.querySelectorAll(".map-tile").forEach((tile) => {
    tile.addEventListener("click", async () => {
      const level = parseInt(tile.dataset.level);

      // Block locked maps
      if (!gameState.progress.mapsUnlocked[level - 1]) {
        return;
      }

      // 1️⃣ Update global map state
      setCurrentMap(level);

      // Reset gold economy for new map
      if (gameState.profile?.currencies) {
        gameState.profile.currencies.gold = 0;
      }

      saveProfiles();

      // 2️⃣ Clean previous map state
      resetCombatState();

      // 3️⃣ Apply spawn position for new map
      applyMapSpawn();

      // 4️⃣ Save map selection + spawn
      saveProfiles();

      // 5️⃣ Close overlay
      const ov = document.getElementById("overlay-maps");
      if (ov) ov.classList.remove("active");

      // 6️⃣ Display game container
      showScreen("game-container");

      // 7️⃣ Reload all combat + map systems
      await initGame();

      // 8️⃣ Start main gameplay loop
      startGameplay();
    });
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

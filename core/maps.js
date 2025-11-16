// ============================================================
// 🗺️ maps.js — Map Selection Overlay Logic (FIXED)
// ------------------------------------------------------------
// Fully reloads correct map + spawns player at correct position
// ============================================================

import { gameState, setCurrentMap, saveProfiles } from "../utils/gameState.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { initGame } from "./game.js";       // <-- REQUIRED
import { applyMapSpawn } from "./game.js";  // <-- REQUIRED
import { resetCombatState } from "./game.js"; // <-- CLEAN START

// ------------------------------------------------------------
// Apply locked/unlocked visual state
// ------------------------------------------------------------
export function updateMapTiles() {
  document.querySelectorAll(".map-tile").forEach(tile => {
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
// Click handlers — FULLY FIXED + CLOSE OVERLAY + GOLD RESET
// ------------------------------------------------------------
export function initMapSelect() {
  updateMapTiles();

  document.querySelectorAll(".map-tile").forEach(tile => {
    tile.addEventListener("click", async () => {
      const level = parseInt(tile.dataset.level);

      // BLOCK if locked
      if (!gameState.progress.mapsUnlocked[level - 1]) {
        console.log(`⛔ Map ${level} is locked.`);
        return;
      }

      console.log(`🎯 Starting map ${level} from Hub`);

      // 1️⃣ Update global map state
      setCurrentMap(level);

      // ⭐ RESET GOLD — fresh economy each map
      if (gameState.profile?.currencies) {
        gameState.profile.currencies.gold = 0;
      }

      // Save after the change
      saveProfiles();

      // 2️⃣ Reset everything from previous battle
      resetCombatState();

      // 3️⃣ Place hero at map start
      applyMapSpawn();

      // 4️⃣ Save so nothing overrides the new currentMap
      saveProfiles();

      // 5️⃣ CLOSE overlay
      document.getElementById("overlay-maps")?.classList.remove("active");

      // 6️⃣ Switch to the map screen
      showScreen("game-container");

      // 7️⃣ Reload all combat/map systems
      await initGame();

      // 8️⃣ Start loop
      startGameplay();
    });
  });
}


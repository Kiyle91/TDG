// ============================================================
// 🗺️ maps.js — Map Selection Overlay Logic
// ============================================================

import { gameState, setCurrentMap } from "../utils/gameState.js";
import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";

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
// Click handlers 
// ------------------------------------------------------------
export function initMapSelect() {
  updateMapTiles();

  document.querySelectorAll(".map-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const level = parseInt(tile.dataset.level);

      // BLOCK if locked
      if (!gameState.progress.mapsUnlocked[level - 1]) {
        console.log(`⛔ Map ${level} is locked.`);
        return;
      }

      console.log(`🎯 Starting map ${level} from Hub`);

      // Set current map
      setCurrentMap(level);

      // Hide overlay & start game
      showScreen("game-container");
      startGameplay();
    });
  });
}

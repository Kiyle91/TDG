// ============================================================
// 🌸 game.js — Olivia’s World: Crystal Keep (FULL FILE)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player dot renders BETWEEN ground and trees
// ============================================================

// ------------------------------------------------------------
// 🗺️ Map & Layers
// ------------------------------------------------------------
import {
  loadMap,
  extractPathFromMap,
  drawMap,          // kept for compatibility (no cuts)
  drawMapLayered    // new additive helper for layered rendering
} from "./map.js";

// ------------------------------------------------------------
// 👹 Enemies / Towers / Projectiles
// ------------------------------------------------------------
import {
  initEnemies,
  updateEnemies,
  drawEnemies,
  setEnemyPath
} from "./enemies.js";

import {
  initTowers,
  updateTowers,
  drawTowers
} from "./towers.js";

import {
  initProjectiles,
  updateProjectiles,
  drawProjectiles
} from "./projectiles.js";

// ------------------------------------------------------------
// 🧩 UI / HUD
// ------------------------------------------------------------
import { initUI, updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🧭 Player Controller (movable dot)
// ------------------------------------------------------------
import {
  initPlayerController,
  updatePlayer,
  drawPlayer
} from "./playerController.js";

import { gameState } from "../utils/gameState.js";
import { getMapPixelSize } from "./map.js";
// ------------------------------------------------------------
// ⚙️ LOCAL STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;


// 🎥 CAMERA (scroll offset)
let cameraX = 0;
let cameraY = 0;

// ============================================================
// 🌷 INIT — called once when entering the Game screen
// ============================================================
export async function initGame() {
  // 1) Canvas & context
  canvas = document.getElementById("game-canvas");
  if (!canvas) {
    throw new Error("game.js: #game-canvas not found in DOM");
  }
  ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("game.js: 2D context not available");
  }

  // 2) Load the Tiled map data (populates window.mapData internally)
  await loadMap();

  // 3) Extract enemy path from map (e.g., from a 'path' layer)
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // 4) Initialize subsystems
  initEnemies();
  initTowers();
  initProjectiles();
  initUI();

  // 5) Initialize player (movable dot)
  initPlayerController(canvas);

  console.log("🌸 game.js — Initialization complete.");
}

// ============================================================
// 🔁 UPDATE — now includes delta clamp for all systems
// ============================================================
export function updateGame(delta) {
  // 🛡️ Prevent warp after alt-tab / pause / throttling
  delta = Math.min(delta, 100);

  // Update world systems (safe timing)
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();

  // Update player movement (WASD/Arrow keys with delta timing)
  updatePlayer(delta);

  // 🎥 CAMERA FOLLOW (center on player)
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;
  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp to map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));
}



// ============================================================
// 🎨 RENDER — Corrected Layer Depth
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ----------------------------------------------------------
  // 🌸 DRAW ORDER:
  // 1) Ground / base tiles
  // 2) Entities (player, goblins, towers, projectiles)
  // 3) Trees / foliage (canopy above entities)
  // 4) UI overlays (handled separately by HUD/UI systems)
  // ----------------------------------------------------------

  // 1️⃣ Ground / base layer
  drawMapLayered(ctx, "ground");

  // 2️⃣ Entities — all on same plane for natural overlap
  drawEnemies(ctx);
  drawPlayer(ctx);
  drawTowers(ctx);
  drawProjectiles(ctx);

  // 3️⃣ Trees / canopy — above entities
  drawMapLayered(ctx, "trees");
  
  
}




// ============================================================
// 🌟 END OF FILE
// ============================================================

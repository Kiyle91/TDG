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

// ------------------------------------------------------------
// ⚙️ LOCAL STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

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
// 🔁 UPDATE — called each frame from main.js with `delta` (ms)
// ============================================================
export function updateGame(delta) {
  // Update world systems
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();

  // Update player movement (WASD/Arrow keys with delta timing)
  updatePlayer(delta);
}

// ============================================================
// 🎨 RENDER — called each frame from main.js
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  // Clear frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ----------------------------------------------------------
  // LAYER ORDER:
  // 1) Ground / base
  // 2) Player (dot) — BETWEEN ground & trees
  // 3) Trees / foliage (upper tiles)
  // 4) Enemies / Towers / Projectiles / UI overlays
  // ----------------------------------------------------------

  // 1) Ground layers (base terrain)
  // Uses the additive layered helper; falls back gracefully if no matches.
  drawMapLayered(ctx, "ground");

  // 2) Player dot (under trees)
  drawPlayer(ctx);

  // 3) Trees / foliage layers (above player)
  drawMapLayered(ctx, "trees");

  // 4) World entities
  drawEnemies(ctx);
  drawTowers(ctx);
  drawProjectiles(ctx);

  // If you still want the classic full map draw (all layers), you can keep:
  // drawMap(ctx, 0, 0, canvas.width, canvas.height);
  // (Left here for compatibility; not used in the layered flow.)
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

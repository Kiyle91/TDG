// ============================================================
// 🌸 game.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops in main.js
// ============================================================

import { extractPathFromMap, loadMap, drawMap } from "./map.js";
import { initEnemies, updateEnemies, drawEnemies, setEnemyPath } from "./enemies.js";
import { initTowers, updateTowers, drawTowers } from "./towers.js";
import {
  updateProjectiles,
  drawProjectiles,
  initProjectiles
} from "./projectiles.js";
import { initUI, updateHUD } from "./ui.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let canvas, ctx;

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export async function initGame() {
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  // 🗺️ Load real map from data/map_one.json
  await loadMap();

  // 🛣️ Extract path points from Tiled "path" layer
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // Initialize subsystems
  initEnemies();
  initTowers();
  initProjectiles();
  initUI();

  console.log("🌸 Tower Defense initialized successfully");
}

// ------------------------------------------------------------
// 🕒 UPDATE LOOP
// ------------------------------------------------------------
export function updateGame(delta) {
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();
}

// ------------------------------------------------------------
// 🎨 RENDER LOOP
// ------------------------------------------------------------
export function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Layered render order
  drawMap(ctx, 0, 0, canvas.width, canvas.height);
  drawEnemies(ctx);
  drawTowers(ctx);
  drawProjectiles(ctx);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

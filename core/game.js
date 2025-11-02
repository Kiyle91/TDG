// ============================================================
// 🧠 game.js — Core Game Controller
// ------------------------------------------------------------
// Handles game loop integration and orchestration of all systems
// (grid, path, enemies, towers, projectiles, UI, etc.)
// ============================================================

import { drawGrid, initGrid } from "./grid.js";
import { drawPath } from "./path.js";
import { initEnemies, updateEnemies, drawEnemies } from "./enemies.js";
import { initTowers, updateTowers, drawTowers } from "./towers.js";
import { updateProjectiles, drawProjectiles, initProjectiles } from "./projectiles.js";
import { initUI, updateHUD } from "./ui.js";

let canvas, ctx;

export function initGame() {
  canvas = document.getElementById("game-canvas");
  ctx = canvas.getContext("2d");

  // Initialize systems
  initGrid();
  initEnemies();
  initTowers();
  initProjectiles();
  initUI();

  console.log("🚀 Tower Defense initialized successfully!");
}

export function updateGame(delta) {
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();
}

export function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw world
  drawGrid(ctx);
  drawPath(ctx);
  drawEnemies(ctx);
  drawTowers(ctx);
  drawProjectiles(ctx);
}

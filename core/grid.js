// ============================================================
// 🌸 grid.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Creates and renders the base tile grid
// ✦ Used for tower placement and enemy pathing
// ✦ Grid dimensions defined in constants.js
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let grid = [];

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initGrid() {
  grid = new Array(GRID_ROWS)
    .fill(0)
    .map(() => new Array(GRID_COLS).fill(0));
}

// ------------------------------------------------------------
// 🎨 DRAW GRID
// ------------------------------------------------------------
export function drawGrid(ctx) {
  ctx.strokeStyle = "rgba(255, 182, 224, 0.25)"; // 🌸 soft pink grid lines

  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

import { TILE_SIZE, GRID_COLS, GRID_ROWS } from "../utils/constants.js";

let grid = [];

export function initGrid() {
  grid = new Array(GRID_ROWS)
    .fill(0)
    .map(() => new Array(GRID_COLS).fill(0));
}

export function drawGrid(ctx) {
  ctx.strokeStyle = "rgba(0,255,255,0.15)";
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

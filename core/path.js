// ============================================================
// 🌸 path.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Defines and draws the enemy movement path
// ✦ Used by enemies.js for navigation along tiles
// ✦ Path points are defined in grid coordinates
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";

// ------------------------------------------------------------
// 🗺️ PATH DATA
// ------------------------------------------------------------
export const pathPoints = [
  { x: 0, y: 4 },
  { x: 4, y: 4 },
  { x: 4, y: 2 },
  { x: 9, y: 2 },
  { x: 9, y: 6 },
  { x: 14, y: 6 }
];

// ------------------------------------------------------------
// 🎨 DRAW PATH
// ------------------------------------------------------------
export function drawPath(ctx) {
  ctx.strokeStyle = "rgba(255, 192, 230, 0.6)"; // 🌸 soft pastel glow
  ctx.lineWidth = 8;
  ctx.beginPath();

  for (let i = 0; i < pathPoints.length; i++) {
    const { x, y } = pathPoints[i];
    const px = x * TILE_SIZE + TILE_SIZE / 2;
    const py = y * TILE_SIZE + TILE_SIZE / 2;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

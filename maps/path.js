// ============================================================
// 🌸 path.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Defines and draws a static goblin movement path
// ✦ Uses tile coordinates converted to pixel positions
// ✦ Optional: Useful for debug visualization or fallback maps
// ============================================================
/* ------------------------------------------------------------
 * MODULE: path.js
 * PURPOSE:
 *   Provides a static goblin path definition and rendering
 *   helper for early prototype maps. Subsequent maps use
 *   dynamic polyline imports from Tiled via map.js, but this
 *   module remains available for fallback usage.
 *
 * SUMMARY:
 *   This file defines hardcoded pathPoints expressed in grid
 *   coordinates (tile units). The drawPath() helper renders
 *   the movement path in pastel colors for debugging or
 *   visual clarity when desired.
 *
 * FEATURES:
 *   • pathPoints[] — fixed path used for legacy maps
 *   • drawPath(ctx) — draws a soft pastel movement line
 *
 * TECHNICAL NOTES:
 *   • TILE_SIZE determines conversion from tile grid → pixels
 *   • Modern maps instead use extractPathFromMap() (map.js)
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { TILE_SIZE } from "../utils/constants.js";

// ------------------------------------------------------------
// 🗺️ STATIC PATH DATA (Tile-grid coordinates)
// ------------------------------------------------------------

export const pathPoints = [
  { x: 0,  y: 4 },
  { x: 4,  y: 4 },
  { x: 4,  y: 2 },
  { x: 9,  y: 2 },
  { x: 9,  y: 6 },
  { x: 14, y: 6 }
];

// ------------------------------------------------------------
// 🎨 DRAW PATH
// ------------------------------------------------------------

export function drawPath(ctx) {
  ctx.strokeStyle = "rgba(255, 192, 230, 0.6)"; 
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

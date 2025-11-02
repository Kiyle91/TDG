// path.js — defines and draws enemy movement path

import { TILE_SIZE } from "../utils/constants.js";

export const pathPoints = [
  { x: 0, y: 4 },
  { x: 4, y: 4 },
  { x: 4, y: 2 },
  { x: 9, y: 2 },
  { x: 9, y: 6 },
  { x: 14, y: 6 }
];

export function drawPath(ctx) {
  ctx.strokeStyle = "rgba(255,255,0,0.4)";
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

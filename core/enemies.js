// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles enemy spawning, movement, and drawing
// ✦ Uses tile-based path data for smooth motion
// ✦ Integrates with path.js and constants.js
// ============================================================

import { pathPoints } from "./path.js";
import { TILE_SIZE, ENEMY_SPEED } from "../utils/constants.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let enemies = [];
let ctx = null;

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------
export function initEnemies() {
  enemies = [];
  spawnEnemy();
}

// ------------------------------------------------------------
// 💀 SPAWN ENEMY
// ------------------------------------------------------------
function spawnEnemy() {
  enemies.push({
    x: pathPoints[0].x * TILE_SIZE + TILE_SIZE / 2,
    y: pathPoints[0].y * TILE_SIZE + TILE_SIZE / 2,
    hp: 100,
    targetIndex: 1
  });
}

// ------------------------------------------------------------
// 🧭 UPDATE ENEMIES — MOVEMENT + PROGRESSION
// ------------------------------------------------------------
export function updateEnemies(delta) {
  const dt = delta / 1000;

  enemies.forEach((e, index) => {
    const target = pathPoints[e.targetIndex];
    if (!target) return; // reached end of path

    const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
    const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
    const dx = targetX - e.x;
    const dy = targetY - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
      e.targetIndex++;
      if (e.targetIndex >= pathPoints.length) {
        enemies.splice(index, 1);
        console.log("Enemy reached base");
      }
      return;
    }

    e.x += (dx / dist) * ENEMY_SPEED * dt;
    e.y += (dy / dist) * ENEMY_SPEED * dt;
  });
}

// ------------------------------------------------------------
// 🎨 DRAW ENEMIES — VISUAL RENDER
// ------------------------------------------------------------
export function drawEnemies(ctx) {
  ctx.fillStyle = "#ff80bf"; // 💖 pastel pink enemy base
  enemies.forEach((e) => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#8affc1"; // 🌿 mint green HP
    ctx.fillRect(e.x - 15, e.y - 20, (e.hp / 100) * 30, 4);

    // Reset fill color
    ctx.fillStyle = "#ff80bf";
  });
}

// ------------------------------------------------------------
// 🧾 GETTERS
// ------------------------------------------------------------
export function getEnemies() {
  return enemies;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

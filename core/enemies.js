// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles enemy spawning, movement, and drawing
// ✦ Uses path data extracted from map.js (Tiled polyline layer)
// ✦ Smooth pixel-perfect motion along route
// ============================================================

import { TILE_SIZE, ENEMY_SPEED } from "../utils/constants.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let enemies = [];
let path = [];

// ------------------------------------------------------------
// 🛣️ PATH SETUP
// ------------------------------------------------------------
export function setEnemyPath(points) {
  if (!points || !points.length) {
    console.warn("⚠️ No path points provided for enemies");
    return;
  }
  path = points;
  console.log(`👣 Enemy path set with ${path.length} points`);
}

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
  if (!path.length) {
    console.warn("⚠️ Cannot spawn enemy — no path defined");
    return;
  }

  enemies.push({
    x: path[0].x,
    y: path[0].y,
    speed: ENEMY_SPEED || 80, // pixels per second
    hp: 100,
    targetIndex: 1,
  });
}

// ------------------------------------------------------------
// 🧭 UPDATE ENEMIES — MOVEMENT + PROGRESSION
// ------------------------------------------------------------
export function updateEnemies(delta) {
  const dt = delta / 1000;

  enemies.forEach((e, i) => {
    const target = path[e.targetIndex];
    if (!target) return;

    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 2) {
      e.targetIndex++;
      if (e.targetIndex >= path.length) {
        // enemy reached end
        enemies.splice(i, 1);
        console.log("💥 Enemy reached end of path!");
        return;
      }
    } else {
      e.x += (dx / dist) * e.speed * dt;
      e.y += (dy / dist) * e.speed * dt;
    }
  });
}

// ------------------------------------------------------------
// 🎨 DRAW ENEMIES — VISUAL RENDER
// ------------------------------------------------------------
export function drawEnemies(ctx) {
  ctx.fillStyle = "#ff80bf"; // 💖 pastel pink enemy base
  enemies.forEach((e) => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#8affc1"; // 🌿 mint green HP
    ctx.fillRect(e.x - 15, e.y - 20, (e.hp / 100) * 30, 4);

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

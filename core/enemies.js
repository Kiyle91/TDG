// enemies.js — handles enemy spawning, movement, and drawing

import { pathPoints } from "./path.js";
import { TILE_SIZE, ENEMY_SPEED } from "../utils/constants.js";

let enemies = [];
let ctx = null;

export function initEnemies() {
  enemies = [];
  spawnEnemy();
}

function spawnEnemy() {
  enemies.push({
    x: pathPoints[0].x * TILE_SIZE + TILE_SIZE / 2,
    y: pathPoints[0].y * TILE_SIZE + TILE_SIZE / 2,
    hp: 100,
    targetIndex: 1
  });
}

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

export function drawEnemies(ctx) {
  ctx.fillStyle = "#ff0055";
  enemies.forEach((e) => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(e.x - 15, e.y - 20, (e.hp / 100) * 30, 4);
    ctx.fillStyle = "#ff0055";
  });
}

export function getEnemies() {
  return enemies;
}

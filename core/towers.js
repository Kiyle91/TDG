// towers.js — manages tower placement, targeting, and firing

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";

let towers = [];

export function initTowers() {
  towers = [];
  towers.push({ x: 5 * 64 + 32, y: 4 * 64 + 32, cooldown: 0 }); // test tower
}

export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

  towers.forEach((tower) => {
    tower.cooldown -= dt;

    if (tower.cooldown <= 0) {
      const target = enemies.find((e) => {
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        return dist <= TOWER_RANGE;
      });

      if (target) {
        spawnProjectile(tower.x, tower.y, target);
        tower.cooldown = 0.8;
      }
    }
  });
}

export function drawTowers(ctx) {
  ctx.fillStyle = "#00ffff";
  towers.forEach((tower) => {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

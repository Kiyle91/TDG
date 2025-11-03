// ============================================================
// 🌸 towers.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Manages tower placement, targeting, and firing
// ✦ Handles cooldowns, range detection, and projectile spawning
// ✦ Core offensive system integrated with enemies.js & projectiles.js
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let towers = [];

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initTowers() {
  towers = [];

  // 🏰 Temporary test tower
  towers.push({
    x: 5 * 64 + 32,
    y: 4 * 64 + 32,
    cooldown: 0
  });
}

// ------------------------------------------------------------
// 🕒 UPDATE TOWERS — TARGETING & FIRING
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

  towers.forEach((tower) => {
    tower.cooldown -= dt;

    if (tower.cooldown <= 0) {
      // 🎯 Find nearest target in range
      const target = enemies.find((e) => {
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        return dist <= TOWER_RANGE;
      });

      // 💥 Fire projectile if target acquired
      if (target) {
        spawnProjectile(tower.x, tower.y, target);
        tower.cooldown = 0.8; // seconds
      }
    }
  });
}

// ------------------------------------------------------------
// 🎨 DRAW TOWERS — VISUAL RENDER
// ------------------------------------------------------------
export function drawTowers(ctx) {
  ctx.fillStyle = "#ffd6eb"; // 🌸 pastel pink towers

  towers.forEach((tower) => {
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles all tower projectiles
// ✦ Each projectile tracks target and applies damage on hit
// ✦ Integrated with enemies.js damage system
// ============================================================

import { damageEnemy } from "./enemies.js";

const PROJECTILE_SPEED = 480;   // px/sec
const PROJECTILE_DAMAGE = 25;   // 💥 per hit

let projectiles = [];

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------
export function initProjectiles() {
  projectiles = [];
  console.log("💫 Projectiles system initialized.");
}


// ------------------------------------------------------------
// 🌱 SPAWN PROJECTILE
// ------------------------------------------------------------
export function spawnProjectile(x, y, target) {
  if (!target || !target.alive) return;

  projectiles.push({
    x,
    y,
    target,
    alive: true
  });
}

// ------------------------------------------------------------
// 🧠 UPDATE PROJECTILES
// ------------------------------------------------------------
export function updateProjectiles(delta) {
  const dt = delta / 1000;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const t = p.target;

    // Skip invalid or dead targets
    if (!t || !t.alive) {
      projectiles.splice(i, 1);
      continue;
    }

    // Move toward target
    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = PROJECTILE_SPEED * dt;

    if (dist < 8) {
      // 💥 HIT CONFIRMED
      damageEnemy(t, PROJECTILE_DAMAGE);
      projectiles.splice(i, 1);
      continue;
    }

    // Normal motion
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }
}

// ------------------------------------------------------------
// 🎨 DRAW PROJECTILES
// ------------------------------------------------------------
export function drawProjectiles(ctx) {
  ctx.fillStyle = "#aaf"; // light blue projectiles
  for (const p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 💥 projectiles.js — Tower Defense Projectiles System
// ------------------------------------------------------------
// Handles bullets/lasers fired from towers, enemy collision, and cleanup
// ============================================================

import { PROJECTILE_SPEED } from "../utils/constants.js";

let projectiles = [];

export function initProjectiles() {
  projectiles = [];
}

export function spawnProjectile(x, y, target) {
  projectiles.push({
    x,
    y,
    target,
    radius: 4
  });
}

export function updateProjectiles(delta) {
  const dt = delta / 1000;

  projectiles.forEach((p, i) => {
    if (!p.target) return;

    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      // Impact
      p.target.hp -= 20;
      projectiles.splice(i, 1);
      return;
    }

    p.x += (dx / dist) * PROJECTILE_SPEED * dt;
    p.y += (dy / dist) * PROJECTILE_SPEED * dt;
  });
}

export function drawProjectiles(ctx) {
  ctx.fillStyle = "#00ffff";
  projectiles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

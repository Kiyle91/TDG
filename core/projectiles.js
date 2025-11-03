// ============================================================
// 🌸 projectiles.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles tower projectiles, movement, and impact
// ✦ Controls projectile updates, collisions, and rendering
// ✦ Integrates with tower targeting and enemy HP reduction
// ============================================================

import { PROJECTILE_SPEED } from "../utils/constants.js";

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let projectiles = [];

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initProjectiles() {
  projectiles = [];
}

// ------------------------------------------------------------
// 💫 SPAWN PROJECTILE
// ------------------------------------------------------------
export function spawnProjectile(x, y, target) {
  projectiles.push({ x, y, target, radius: 4 });
}

// ------------------------------------------------------------
// 🕒 UPDATE PROJECTILES — MOVEMENT & IMPACT
// ------------------------------------------------------------
export function updateProjectiles(delta) {
  const dt = delta / 1000;

  projectiles.forEach((p, i) => {
    if (!p.target) return;

    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);

    // 🎯 Impact detection
    if (dist < 8) {
      p.target.hp -= 20; // 💥 Hit damage
      projectiles.splice(i, 1);
      return;
    }

    // 🌀 Move toward target
    p.x += (dx / dist) * PROJECTILE_SPEED * dt;
    p.y += (dy / dist) * PROJECTILE_SPEED * dt;
  });
}

// ------------------------------------------------------------
// 🎨 DRAW PROJECTILES — VISUAL RENDER
// ------------------------------------------------------------
export function drawProjectiles(ctx) {
  ctx.fillStyle = "#b5e2ff"; // 🌈 soft pastel blue glow

  projectiles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

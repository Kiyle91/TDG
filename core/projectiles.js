// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep (Canvas Crystal Bolt)
// ------------------------------------------------------------
// ✦ Pure-canvas crystal projectile, no image needed
// ✦ Shimmering glow + gradient drawn directly on canvas
// ============================================================

import { damageEnemy } from "./enemies.js";

const PROJECTILE_SPEED = 480;
const PROJECTILE_DAMAGE = 25;

let projectiles = [];

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------
export function initProjectiles() {
  projectiles = [];
  console.log("💫 Projectiles initialized (canvas crystal bolts).");
}

// ------------------------------------------------------------
// 💥 SPAWN PROJECTILE
// ------------------------------------------------------------
export function spawnProjectile(x, y, target, type = "crystal") {
  if (!target || !target.alive) return;
  projectiles.push({
    x,
    y,
    target,
    type,
    alive: true,
    angle: 0,
    life: 0
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

    if (!t || !t.alive) {
      projectiles.splice(i, 1);
      continue;
    }

    const dx = t.x - p.x;
    const dy = t.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = PROJECTILE_SPEED * dt;

    p.angle = Math.atan2(dy, dx);
    p.life += delta;

    if (dist < 8) {
      damageEnemy(t, PROJECTILE_DAMAGE);
      projectiles.splice(i, 1);
      continue;
    }

    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }
}

// ------------------------------------------------------------
// 🎨 DRAW PROJECTILES — glowing crystal bolt
// ------------------------------------------------------------
export function drawProjectiles(ctx) {
  if (!ctx) return;

  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // 💎 Crystal glow gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    gradient.addColorStop(0, "rgba(190, 240, 255, 0.9)");
    gradient.addColorStop(0.5, "rgba(160, 210, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // ✨ Inner shard streak
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

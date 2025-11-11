// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep (Multi-Type Ready)
// ------------------------------------------------------------
// ✦ Handles all tower projectiles by type
// ✦ "crystal" → glowing shard projectile
// ✦ Easily extendable for future tower types
// ============================================================

import { damageEnemy } from "./enemies.js";

const PROJECTILE_SPEED = 480;
const PROJECTILE_DAMAGE = 25;

let projectiles = [];
let crystalImg = null;

// ------------------------------------------------------------
// 🌷 LOAD SPRITES
// ------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadCrystal() {
  crystalImg = await loadImage("./assets/images/turrets/crystal_projectile.png");
  console.log("💎 Crystal projectile sprite loaded.");
}

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------
export async function initProjectiles() {
  projectiles = [];
  if (!crystalImg) await loadCrystal();
  console.log("💫 Projectiles initialized (multi-type ready).");
}

// ------------------------------------------------------------
// 💥 SPAWN PROJECTILE
// ------------------------------------------------------------
export function spawnProjectile(x, y, target, type = "default") {
  if (!target || !target.alive) return;
  projectiles.push({
    x,
    y,
    target,
    type, // e.g. "crystal", "fire", "frost"
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
// 🎨 DRAW PROJECTILES
// ------------------------------------------------------------
export function drawProjectiles(ctx) {
  if (!ctx) return;

  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.type === "crystal") {
      // 💎 Crystal projectile look
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
      gradient.addColorStop(0, "rgba(173, 216, 255, 0.9)");
      gradient.addColorStop(0.5, "rgba(147, 112, 219, 0.4)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      if (crystalImg) {
        ctx.shadowColor = "rgba(200,255,255,0.8)";
        ctx.shadowBlur = 10;
        ctx.drawImage(crystalImg, -12, -12, 24, 24);
      } else {
        ctx.fillStyle = "#b3e5ff";
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(8, 0);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
      }
    }

    else {
      // 🩶 Default fallback projectile (simple pastel dot)
      ctx.fillStyle = "rgba(200,200,255,0.6)";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

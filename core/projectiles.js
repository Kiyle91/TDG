// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep (Elemental Projectiles)
// ------------------------------------------------------------
// ✦ Crystal, Frost, Flame, Arcane, Moon, Heal projectiles
// ✦ Heal bolts target player correctly (player.pos.x / pos.y)
// ✦ Flame DOT ticks once per second (non-stacking)
// ✦ Frost slow applies cleanly once
// ✦ Pure canvas glow projectiles (no images)
// ============================================================

import { damageEnemy } from "./enemies.js";
import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";

const PROJECTILE_SPEED = 480;

// Per-type damage table
const PROJECTILE_DAMAGE = {
  crystal: 25,
  frost: 15,
  flame: 12,
  arcane: 30,
  moon: 20,
  heal: 0
};

let projectiles = [];

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------
export function initProjectiles() {
  projectiles = [];
  console.log("💫 Projectiles initialized.");
}

// ------------------------------------------------------------
// 💥 SPAWN PROJECTILE
// ------------------------------------------------------------
export function spawnProjectile(x, y, target, type = "crystal") {
  if (!target) return;

  // Player targeting → convert to virtual target
  if (target === gameState.player) {
    target = {
      x: gameState.player.pos.x,
      y: gameState.player.pos.y,
      isPlayer: true
    };
  }

  // Enemy check
  if (!target.isPlayer && !target.alive) return;

  projectiles.push({
    x,
    y,
    target,
    type,
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

    // Get real target coordinates
    const tx = t.isPlayer ? gameState.player.pos.x : t.x;
    const ty = t.isPlayer ? gameState.player.pos.y : t.y;

    // If enemy died
    if (!t.isPlayer && !t.alive) {
      projectiles.splice(i, 1);
      continue;
    }

    // Movement
    const dx = tx - p.x;
    const dy = ty - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = PROJECTILE_SPEED * dt;

    p.angle = Math.atan2(dy, dx);

    // 🎯 ON HIT
    if (dist < 8) {

      // --------------------------------------------------------
      // 💛 HEAL PROJECTILE
      // --------------------------------------------------------
      if (p.type === "heal") {
        const player = gameState.player;
        if (player) {
          player.hp = Math.min(player.maxHp, player.hp + 15);
          spawnFloatingText(player.pos.x, player.pos.y - 30, "✨ +15 HP!", "#ffee88");
        }
      }

      // --------------------------------------------------------
      // ❄ FROST PROJECTILE — apply slow once, emoji-only
      // --------------------------------------------------------
      else if (p.type === "frost") {

          // Apply / refresh slow duration
          t.slowTimer = 2000;

          // Only apply speed reduction once per slow cycle
          if (!t._owFrostSlowed) {
              t.speed *= 0.5;
              t._owFrostSlowed = true;

              // Minimal one-time frost emoji
              spawnFloatingText(t.x, t.y - 20, "❄");
          }

          // Single hit damage for frost (kept)
          damageEnemy(t, PROJECTILE_DAMAGE.frost);
      }

      // --------------------------------------------------------
      // 🔥 FLAME PROJECTILE — apply burn only once, emoji-only
      // --------------------------------------------------------
      else if (p.type === "flame") {

          // First time flame hits this goblin
          if (!t.isBurning) {
              t.isBurning = true;
              t.burnTimer = 3000;   // 3s total duration
              t.burnTick = 0;       // tick immediately on next update
              t.burnDamage = 3;

              // Minimal floating text (one-time)
              spawnFloatingText(t.x, t.y - 20, "🔥");
          }

          // ❌ Removed the extra "hit" damage — burn handles damage over time
          // damageEnemy(t, PROJECTILE_DAMAGE.flame);
      }

      // --------------------------------------------------------
      // 🌙 MOON PROJECTILE — knockback + damage
      // --------------------------------------------------------
      else if (p.type === "moon") {
        t.knockback = 15;
        damageEnemy(t, PROJECTILE_DAMAGE.moon);
      }

      // --------------------------------------------------------
      // 💎 CRYSTAL + 💜 ARCANE
      // --------------------------------------------------------
      else {
        const dmg = PROJECTILE_DAMAGE[p.type] ?? 10;
        damageEnemy(t, dmg);
      }

      projectiles.splice(i, 1);
      continue;
    }

    // Move projectile
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }
}

// ------------------------------------------------------------
// 🎨 Projectile color definitions
// ------------------------------------------------------------
function getProjectileColors(type) {
  switch (type) {
    case "frost": return {
      inner: "rgba(180, 230, 255, 0.95)",
      mid:   "rgba(120, 200, 255, 0.5)",
      outer: "rgba(120, 200, 255, 0)"
    };

    case "flame": return {
      inner: "rgba(255, 150, 80, 0.95)",
      mid:   "rgba(255, 100, 50, 0.5)",
      outer: "rgba(255, 80, 40, 0)"
    };

    case "arcane": return {
      inner: "rgba(220, 160, 255, 0.95)",
      mid:   "rgba(180, 120, 255, 0.5)",
      outer: "rgba(160, 80, 255, 0)"
    };

    case "moon": return {
      inner: "rgba(200, 220, 255, 0.95)",
      mid:   "rgba(150, 180, 255, 0.5)",
      outer: "rgba(130, 160, 255, 0)"
    };

    case "heal": return {
      inner: "rgba(255, 240, 120, 0.95)",
      mid:   "rgba(255, 220, 100, 0.5)",
      outer: "rgba(255, 200, 80, 0)"
    };

    default: return {
      inner: "rgba(190, 240, 255, 0.9)",
      mid:   "rgba(160, 210, 255, 0.5)",
      outer: "rgba(255,255,255,0)"
    };
  }
}

// ------------------------------------------------------------
// 🎨 DRAW PROJECTILES
// ------------------------------------------------------------
export function drawProjectiles(ctx) {
  if (!ctx) return;

  for (const p of projectiles) {
    const col = getProjectileColors(p.type);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    gradient.addColorStop(0, col.inner);
    gradient.addColorStop(0.5, col.mid);
    gradient.addColorStop(1, col.outer);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
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

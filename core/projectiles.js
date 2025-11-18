// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Elemental projectile system (canvas-based)
// ✦ Frost / Flame / Arcane / Moon / Crystal / Heal
// ✦ Crystal Echo Power → DOUBLE DAMAGE
// ============================================================
/* ------------------------------------------------------------
 * MODULE: projectiles.js
 * PURPOSE:
 *   Implements the full elemental projectile system used by all
 *   Spire towers, including movement, collision, damage, status
 *   effects, healing bolts, and rendering.
 *
 * SUMMARY:
 *   The game uses a pure-canvas projectile system (no images).
 *   Each projectile travels toward its assigned target, applying
 *   fire burn, frost slow, arcane burst, moon stun, crystal hit,
 *   or healing to the player. Damage is routed to the appropriate
 *   enemy handler, and Crystal Echo Power can double all damage.
 *
 * FEATURES:
 *   • spawnProjectile() — creates any projectile type
 *   • updateProjectiles() — movement, hit detection, effects
 *   • drawProjectiles() — soft-glow canvas rendering
 *   • Elemental behaviours:
 *        - Frost → slow (applies once)
 *        - Flame → burn DoT (non-stacking)
 *        - Moon  → stun
 *        - Heal  → targets player.pos
 *        - Crystal / Arcane → direct hits
 *   • Fully compatible with all enemy types and loot-power systems
 *
 * TECHNICAL NOTES:
 *   • Ogres are immune to all tower projectile damage
 *   • Healing projectiles use player.pos.x/y at cast time
 *   • Projectiles auto-destroy on impact or target death
 *   • Uses radial gradients for pastel projectile glow
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { damageGoblin } from "./goblin.js";
import { damageWorg } from "./worg.js";
import { damageElite } from "./elite.js";
import { damageTroll } from "./troll.js";
import { damageOgre } from "./ogre.js";
import { damageCrossbow } from "./crossbow.js";

// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------

const PROJECTILE_SPEED = 480;

const PROJECTILE_DAMAGE = {
  crystal: 15,
  frost: 10,
  flame: 15,
  arcane: 25,
  moon: 25,
  heal: 0
};

let projectiles = [];

// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------

export function initProjectiles() {
  projectiles = [];
}

// ------------------------------------------------------------
// 💥 SPAWN PROJECTILE
// ------------------------------------------------------------

export function spawnProjectile(x, y, target, type = "crystal") {
  if (!target) return;

  // Player target adapter
  if (target === gameState.player) {
    target = {
      x: gameState.player.pos.x,
      y: gameState.player.pos.y,
      isPlayer: true
    };
  }

  if (!target.isPlayer && !target.alive) return;

  projectiles.push({
    x,
    y,
    target,
    type,
    angle: 0,
    life: 0,
  });
}

// ------------------------------------------------------------
// 🎯 DAMAGE ROUTER
// ------------------------------------------------------------

function damageFromProjectile(target, amount) {

  // Ogres are projectile-immune
  if (target.type === "ogre" || target.maxHp === 600) {
    return;
  }

  switch (target.type) {
    case "goblin":   damageGoblin(target, amount); break;
    case "worg":     damageWorg(target, amount); break;
    case "elite":    damageElite(target, amount); break;
    case "troll":    damageTroll(target, amount); break;
    case "crossbow": damageCrossbow(target, amount); break;
    default:         damageGoblin(target, amount); break;
  }
}

// ------------------------------------------------------------
// 🧠 UPDATE PROJECTILES
// ------------------------------------------------------------

export function updateProjectiles(delta) {
  const dt = delta / 1000;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const t = p.target;

    const tx = t.isPlayer ? gameState.player.pos.x : t.x;
    const ty = t.isPlayer ? gameState.player.pos.y : t.y;

    if (!t.isPlayer && !t.alive) {
      projectiles.splice(i, 1);
      continue;
    }

    // Movement vector
    const dx = tx - p.x;
    const dy = ty - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    p.angle = Math.atan2(dy, dx);

    // 🎯 IMPACT
    if (dist < 8) {
      // --------------------------------------------------------
      // 💛 HEAL PROJECTILE
      // --------------------------------------------------------

      if (p.type === "heal") {
        const pl = gameState.player;
        if (pl) {
          pl.hp = Math.min(pl.maxHp, pl.hp + 15);
          spawnFloatingText(pl.pos.x, pl.pos.y - 60, "✨");
        }
      }

      // --------------------------------------------------------
      // ❄ FROST
      // --------------------------------------------------------

      else if (p.type === "frost") {
        t.slowTimer = 2000;

        if (!t._owFrostSlowed) {
          t.speed *= 0.5;
          t._owFrostSlowed = true;
          spawnFloatingText(t.x, t.y - 60, "❄️");
        }

        let dmg = PROJECTILE_DAMAGE.frost;
        if (gameState.echoPowerActive) dmg *= 2;

        damageFromProjectile(t, dmg);
      }

      // --------------------------------------------------------
      // 🔥 FLAME
      // --------------------------------------------------------

      else if (p.type === "flame") {

        if (!t.isBurning) {
          t.isBurning = true;
          t.burnTimer = 15000;
          t.burnTick = 1;
          t.burnDamage = 3;
          spawnFloatingText(t.x, t.y - 60, "🔥");
        }

        let dmg = 20;
        if (gameState.echoPowerActive) dmg *= 2;

        damageFromProjectile(t, dmg);
      }

      // --------------------------------------------------------
      // 🌙 MOON — STUN
      // --------------------------------------------------------

      else if (p.type === "moon") {
        t.stunTimer = 1000;
        spawnFloatingText(t.x, t.y - 60, "🌙", "#ccbbff");

        let dmg = PROJECTILE_DAMAGE.moon;
        if (gameState.echoPowerActive) dmg *= 2;

        damageFromProjectile(t, dmg);
      }

      // --------------------------------------------------------
      // 💎 CRYSTAL / ARCANE
      // --------------------------------------------------------

      else {
        let dmg = PROJECTILE_DAMAGE[p.type] ?? 10;
        if (gameState.echoPowerActive) dmg *= 2;

        damageFromProjectile(t, dmg);
      }

      projectiles.splice(i, 1);
      continue;
    }

    // Continue movement toward target
    const step = PROJECTILE_SPEED * dt;
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }
}

// ------------------------------------------------------------
// 🎨 PROJECTILE COLOR THEMES
// ------------------------------------------------------------

function getProjectileColors(type) {
  switch (type) {
    case "frost": return {
      inner: "rgba(180, 230, 255, 0.95)",
      mid:   "rgba(120, 200, 255, 0.5)",
      outer: "rgba(120, 200, 255, 0)"
    };

    case "flame": return {
      inner: "rgba(255,150,80,0.95)",
      mid:   "rgba(255,100,50,0.5)",
      outer: "rgba(255,80,40,0)"
    };

    case "arcane": return {
      inner: "rgba(220,160,255,0.95)",
      mid:   "rgba(180,120,255,0.5)",
      outer: "rgba(160,80,255,0)"
    };

    case "moon": return {
      inner: "rgba(200,220,255,0.95)",
      mid:   "rgba(150,180,255,0.5)",
      outer: "rgba(130,160,255,0)"
    };

    case "heal": return {
      inner: "rgba(255,240,120,0.95)",
      mid:   "rgba(255,220,100,0.5)",
      outer: "rgba(255,200,80,0)"
    };

    default: return {
      inner: "rgba(190,240,255,0.9)",
      mid:   "rgba(160,210,255,0.5)",
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

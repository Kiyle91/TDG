// ============================================================
// 💫 projectiles.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Elemental projectile system (canvas-based)
// ✦ Frost / Flame / Arcane / Moon / Crystal / Heal
// ✦ Crystal Echo Power → DOUBLE DAMAGE
// ✦ Turret Upgrade System → DAMAGE MULTIPLIER PER SPIRE
// ============================================================
/* ------------------------------------------------------------
 * MODULE: projectiles.js
 * PURPOSE:
 *   Implements the full elemental projectile system used by all
 *   Spire towers, including movement, collision, damage, status
 *   effects, healing bolts, and rendering.
 *
 * TECHNICAL NOTES:
 *   • Ogres are immune to all tower projectile damage
 *   • Healing projectiles use player.pos.x/y at cast time
 *   • Projectiles auto-destroy on impact or target death
 *   • Radial gradients give pastel-style visuals
 *   • Spire upgrades scale PROJECTILE_DAMAGE only
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { damageGoblin } from "../entities/goblin.js";
import { damageGoblin as damageIceGoblin } from "../entities/iceGoblin.js";
import { damageGoblin as damageEmberGoblin } from "../entities/emberGoblin.js";
import { damageGoblin as damageAshGoblin } from "../entities/ashGoblin.js";
import { damageGoblin as damageVoidGoblin } from "../entities/voidGoblin.js";
import { damageWorg } from "../entities/worg.js";
import { damageElite } from "../entities/elite.js";
import { damageTroll } from "../entities/troll.js";
import { damageOgre } from "../entities/ogre.js";
import { damageCrossbow } from "../entities/crossbow.js";
import { getSpireDamageMultiplier } from "../spires/spireUpgrades.js";


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

function getEchoDamageMultiplier() {
  const mult = Number(gameState.echoDamageMultiplier) || 1;
  return mult > 0 ? mult : 1;
}


// ------------------------------------------------------------
// 🌱 INITIALIZATION
// ------------------------------------------------------------

export function initProjectiles() {
  projectiles = [];
}


// ------------------------------------------------------------
// 💥 SPAWN PROJECTILE
// ------------------------------------------------------------

export function spawnProjectile(x, y, target, type = "crystal", sourceSpireId = null) {
  if (!target) return;

  // Player target remap adapter
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
    sourceSpireId,   // 💎 NEW — turret upgrade source id
    angle: 0,
    life: 0
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
    case "goblin":       damageGoblin(target, amount); break;
    case "iceGoblin":    damageIceGoblin(target, amount); break;
    case "emberGoblin":  damageEmberGoblin(target, amount); break;
    case "ashGoblin":    damageAshGoblin(target, amount); break;
    case "voidGoblin":   damageVoidGoblin(target, amount); break;
    case "worg":         damageWorg(target, amount); break;
    case "elite":        damageElite(target, amount); break;
    case "troll":        damageTroll(target, amount); break;
    case "crossbow":     damageCrossbow(target, amount); break;
    default:
      if ((target.type || "").includes("goblin")) {
        damageGoblin(target, amount);
      }
      // Unknown enemy types are ignored to avoid misrouting sounds/logic.
      break;
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
      const echoMult = getEchoDamageMultiplier();

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
        if (t.type === "emberGoblin") dmg *= 2; // bonus vs ember
        dmg *= echoMult;

        // 💎 turret upgrade multiplier
        if (p.sourceSpireId != null) {
          dmg *= getSpireDamageMultiplier(p.sourceSpireId);
        }

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

        let dmg = 20; // flame uses fixed 20 base
        if (t.type === "iceGoblin") dmg *= 2; // bonus vs ice
        dmg *= echoMult;

        // 💎 turret upgrade multiplier
        if (p.sourceSpireId != null) {
          dmg *= getSpireDamageMultiplier(p.sourceSpireId);
        }

        damageFromProjectile(t, dmg);
      }

      // --------------------------------------------------------
      // 🌙 MOON — STUN
      // --------------------------------------------------------
      else if (p.type === "moon") {
        t.stunTimer = 1000;
        spawnFloatingText(t.x, t.y - 60, "🌙", "#ccbbff");

        let dmg = PROJECTILE_DAMAGE.moon;
        dmg *= echoMult;

        // 💎 turret upgrade multiplier
        if (p.sourceSpireId != null) {
          dmg *= getSpireDamageMultiplier(p.sourceSpireId);
        }

        damageFromProjectile(t, dmg);
      }

      // --------------------------------------------------------
      // 💎 CRYSTAL / ARCANE / DEFAULT
      // --------------------------------------------------------
      else {
        let dmg = PROJECTILE_DAMAGE[p.type] ?? 10;
        dmg *= echoMult;

        // 💎 turret upgrade multiplier
        if (p.sourceSpireId != null) {
          dmg *= getSpireDamageMultiplier(p.sourceSpireId);
        }

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

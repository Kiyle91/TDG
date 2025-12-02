// ============================================================
// 🗡️ melee.js — Modular Melee Combat System (Final v2)
// ------------------------------------------------------------
// ✦ Crits, Stuns, Knockback Perks
// ✦ Late-game melee scaling balanced to level 30
// ✦ High-risk, high-reward close combat
// ============================================================

import { spawnFloatingText } from "../fx/floatingText.js";
import { spawnDamageSparkles, spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { slideRect } from "../utils/mapCollision.js";
import { getGoblins, damageGoblin } from "../entities/goblin.js";
import { getGoblins as getIceGoblins, damageGoblin as damageIceGoblin } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins, damageGoblin as damageEmberGoblin } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins, damageGoblin as damageAshGoblin } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins, damageGoblin as damageVoidGoblin } from "../entities/voidGoblin.js";
import { getOgres, damageOgre } from "../entities/ogre.js";
import { getWorg, damageWorg } from "../entities/worg.js";
import { getElites, damageElite } from "../entities/elite.js";
import { getTrolls, damageTroll } from "../entities/troll.js";
import { getCrossbows, damageCrossbow } from "../entities/crossbow.js";
import { playMeleeSwing } from "../core/soundtrack.js";
import { gameState } from "../utils/gameState.js";
import { getSeraphines, damageSeraphine } from "../entities/seraphine.js";

const goblinSources = [
  { get: getGoblins,      damage: damageGoblin },
  { get: getIceGoblins,   damage: damageIceGoblin },
  { get: getEmberGoblins, damage: damageEmberGoblin },
  { get: getAshGoblins,   damage: damageAshGoblin },
  { get: getVoidGoblins,  damage: damageVoidGoblin },
];

function getAllGoblinTargets() {
  const result = [];
  for (const src of goblinSources) {
    const list = src.get?.();
    if (Array.isArray(list) && list.length) result.push(...list);
  }
  return result;
}

function damageGoblinVariant(target, dmg) {
  for (const src of goblinSources) {
    const list = src.get?.();
    if (list?.includes(target)) {
      src.damage(target, dmg);
      return;
    }
  }
  damageGoblin(target, dmg);
}

// ------------------------------------------------------------
// 🔥 Power Tier (strike size + knockback scaling)
// ------------------------------------------------------------
function getPowerTier(attack) {
  if (attack < 40) return 1;
  if (attack < 80) return 2;
  if (attack < 120) return 3;
  if (attack < 160) return 4;
  return 5;
}

// ------------------------------------------------------------
// 🎯 Crit + Stun Perk Logic
// ------------------------------------------------------------
function getMeleePerks(attack) {
  if (attack < 40) {
    return { critChance: 0,    critMult: 1.0, stun: 0 };
  }
  if (attack < 80) {
    return { critChance: 0.05, critMult: 1.4, stun: 0 };
  }
  if (attack < 120) {
    return { critChance: 0.08, critMult: 1.55, stun: 0.4 };
  }
  if (attack < 160) {
    return { critChance: 0.12, critMult: 1.7, stun: 0.8 };
  }
  return { critChance: 0.15, critMult: 1.9, stun: 1.1 };
}

// ------------------------------------------------------------
// 🎨 Slash Arc (unchanged)
// ------------------------------------------------------------
export function drawSlashArc(ctx, x, y, dir, tier) {
  const radius = 42 + tier * 14;
  const thickness = 4 + tier * 1.3;

  ctx.save();
  ctx.translate(x, y);

  if (dir === "left") ctx.scale(-1, 1);
  ctx.rotate(-0.4);

  const grad = ctx.createLinearGradient(0, -radius, 0, radius);
  grad.addColorStop(0.0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.5, `rgba(255,150,255,${0.25 + tier * 0.1})`);
  grad.addColorStop(1.0, "rgba(255,150,255,0)");

  ctx.strokeStyle = grad;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.arc(0, 0, radius, -1.2, 1.2);
  ctx.stroke();

  ctx.restore();
}

// ------------------------------------------------------------
// 🗡️ MAIN MELEE FUNCTION with CRITS + STUNS + BOOSTED SCALE
// ------------------------------------------------------------
export function performMelee(player) {
  const p = player;
  const atk = p.attack || 10;

  const tier = getPowerTier(atk);
  const perks = getMeleePerks(atk);
  const stunDurationMs = perks.stun > 0 ? perks.stun * 1000 : 0;

  // Base damage
  let dmg = atk * 0.7;

  // Crit roll
  const isCrit = Math.random() < perks.critChance;
  if (isCrit) dmg *= perks.critMult;

  const ox = p.pos.x;
  const oy = p.pos.y;
  const range = 120 + tier * 12;

  const targets = [
    ...getAllGoblinTargets(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
    ...getSeraphines()
  ];

  let hitSomething = false;

  for (const t of targets) {
    if (!t.alive) continue;

    if (t.stunned && (!t.stunTimer || t.stunTimer <= 0)) {
      t.stunned = false;
    }

    const dx = t.x - ox;
    const dy = t.y - oy;
    const dist = Math.hypot(dx, dy);

    if (dist > range) continue;

    // Apply stun (if unlocked)
    if (stunDurationMs > 0 && !t.stunned) {
      t.stunned = true;
      t.stunTimer = stunDurationMs;

      // Visual: little flash
      spawnCanvasSparkleBurst(t.x, t.y, 6, 40, ["#ffccff", "#ffffff"]);
    }

    // Damage routing
    switch (t.type) {
      case "elite":      damageElite(t, dmg, "player"); break;
      case "seraphine":  damageSeraphine(t, dmg); break;
      case "ogre":       damageOgre(t, dmg, "player"); break;
      case "worg":       damageWorg(t, dmg); break;
      case "troll":      damageTroll(t, dmg); break;
      case "crossbow":   damageCrossbow(t, dmg); break;
      default:
        if (t.maxHp >= 400 && t.type !== "goblin") {
          damageOgre(t, dmg, "player");
        } else {
          damageGoblinVariant(t, dmg);
        }
    }

    hitSomething = true;

    // Knockback
    if (t.type !== "ogre") {
      const push = 40 + tier * 8;
      const len = Math.max(1, dist);
      const nx = dx / len;
      const ny = dy / len;

      // Use slideRect to avoid shoving into collision
      const dims = getEnemyCollisionBox(t);
      const moved = slideRect(
        t.x - dims.w / 2,
        t.y - dims.h / 2,
        dims.w,
        dims.h,
        nx * push,
        ny * push,
        { ignoreBounds: true }
      );
      t.x = moved.x + dims.w / 2;
      t.y = moved.y + dims.h / 2;
    }

    spawnDamageSparkles(t.x, t.y);

    // Crit FX popup
    if (isCrit) {
      spawnFloatingText("CRIT!", t.x, t.y - 20, "#ff66ff");
    }
  }

  // Tier-based sparkle burst
  spawnCanvasSparkleBurst(
    ox,
    oy,
    8 + tier * 4,
    60 + tier * 20,
    ["#ffd6eb", "#ffffff", "#ffe0ff"]
  );

  playMeleeSwing();

  return {
    hit: hitSomething,
    tier,
    dmg,
    crit: isCrit,
    stun: perks.stun
  };
}

function getEnemyCollisionBox(enemy) {
  const approx = {
    goblin: 42, iceGoblin: 42, emberGoblin: 42, ashGoblin: 42, voidGoblin: 42,
    worg: 44, elite: 48, troll: 55, ogre: 64, crossbow: 44, seraphine: 96,
  };
  const w = enemy.hitbox || enemy.width || approx[enemy.type] || 48;
  const h = enemy.height || w;
  return { w, h };
}

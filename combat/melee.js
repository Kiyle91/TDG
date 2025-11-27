// ============================================================
// 🗡️ melee.js — Modular Melee Combat System
// ------------------------------------------------------------
// ✦ Handles all melee logic OUTSIDE playerController
// ✦ Power scaling visuals (Tier 1–5)
// ✦ Slash arcs, spark bursts, knockback
// ✦ Clean hit detection for all enemy types
// ✦ Returns animation data to playerController
// ============================================================

import { spawnFloatingText } from "../fx/floatingText.js";
import { spawnDamageSparkles, spawnCanvasSparkleBurst } from "../fx/sparkles.js";
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
  { get: getGoblins, damage: damageGoblin },
  { get: getIceGoblins, damage: damageIceGoblin },
  { get: getEmberGoblins, damage: damageEmberGoblin },
  { get: getAshGoblins, damage: damageAshGoblin },
  { get: getVoidGoblins, damage: damageVoidGoblin },
];

function getAllGoblinTargets() {
  const result = [];
  for (const src of goblinSources) {
    const list = src.get?.();
    if (Array.isArray(list) && list.length) {
      result.push(...list);
    }
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
// 🔥 Power Tier Calculation (based on Player Attack stat)
// ------------------------------------------------------------

function getPowerTier(attack) {
  if (attack < 20) return 1;
  if (attack < 35) return 2;
  if (attack < 55) return 3;
  if (attack < 80) return 4;
  return 5;
}

// ------------------------------------------------------------
// 🎨 Slash Arc Renderer (for game.js render loop)
// (playerController will call this when attackFrame === 0)
// ------------------------------------------------------------

export function drawSlashArc(ctx, x, y, dir, tier) {
  const radius = 42 + tier * 14;        // arc sweep size
  const thickness = 4 + tier * 1.3;     // line width

  ctx.save();
  ctx.translate(x, y);

  // Flip horizontally when facing left
  if (dir === "left") ctx.scale(-1, 1);

  // Dynamic tilt for motion feel
  ctx.rotate(-0.4);

  // Pastel glow gradient
  const grad = ctx.createLinearGradient(0, -radius, 0, radius);
  grad.addColorStop(0.0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.5, `rgba(255,150,255,${0.25 + tier * 0.1})`);
  grad.addColorStop(1.0, "rgba(255,150,255,0)");

  ctx.strokeStyle = grad;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.arc(0, 0, radius, -1.2, 1.2); // Perfect crescent slash
  ctx.stroke();

  ctx.restore();
}

// ------------------------------------------------------------
// 🗡️ Main Melee Function
// ------------------------------------------------------------

export function performMelee(player) {
  const p = player;
  const attackValue = p.attack || 10;
  const dmg = attackValue * 1.2;
  const tier = getPowerTier(attackValue);

  const range = 120 + tier * 10;
  const ox = p.pos.x;
  const oy = p.pos.y;

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

    const dx = t.x - ox;
    const dy = t.y - oy;
    const dist = Math.hypot(dx, dy);

    if (dist > range) continue;

    // Damage routing
    switch (t.type) {
      case "elite":      damageElite(t, dmg, "player"); break;
      case "seraphine":  damageSeraphine(t, dmg); break;
      case "ogre":       damageOgre(t, dmg, "player"); break;
      case "worg":       damageWorg(t, dmg); break;
      case "troll":      damageTroll(t, dmg); break;
      case "crossbow":   damageCrossbow(t, dmg); break;
      default:
        // Ogre clones or high-HP variants
        if (t.maxHp >= 400 && t.type !== "goblin") {
          damageOgre(t, dmg, "player");
        } else {
          damageGoblinVariant(t, dmg);
        }
        break;
    }

    hitSomething = true;

    // Knockback
    if (t.type !== "ogre") {
      const push = 40 + tier * 5;
      const len = Math.max(1, dist);
      t.x += (dx / len) * push;
      t.y += (dy / len) * push;
    }

    spawnDamageSparkles(t.x, t.y);
  }

  // --------------------------------------------------------
  // 🌟 Visual Power Burst (Tier-based intensity)
  // --------------------------------------------------------
  const sparkleCount = 8 + tier * 4;
  const sparkleRadius = 60 + tier * 20;

  spawnCanvasSparkleBurst(
    ox,
    oy,
    sparkleCount,
    sparkleRadius,
    ["#ffd6eb", "#ffffff", "#ffe0ff"]
  );

  playMeleeSwing();

  return {
    hit: hitSomething,
    tier,
    dmg,
  };
}

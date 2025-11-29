// ============================================================
// 🏹 arrow.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Lightweight Silver Bolt projectile
// Damage logic intact, visuals optimised for multi-arrow builds
// ============================================================

import { spawnDamageSparkles, spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { getGoblins, damageGoblin } from "../entities/goblin.js";
import { getGoblins as getIceGoblins, damageGoblin as damageIceGoblin } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins, damageGoblin as damageEmberGoblin } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins, damageGoblin as damageAshGoblin } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins, damageGoblin as damageVoidGoblin } from "../entities/voidGoblin.js";
import { getOgres, damageOgre, OGRE_HIT_RADIUS } from "../entities/ogre.js";
import { getElites, damageElite } from "../entities/elite.js";
import { getWorg, damageWorg } from "../entities/worg.js";
import { getTrolls, damageTroll } from "../entities/troll.js";
import { getCrossbows, damageCrossbow } from "../entities/crossbow.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { getSeraphines, damageSeraphine } from "../entities/seraphine.js";
import { gameState } from "../utils/gameState.js";

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
// 🗂 Projectile State
// ------------------------------------------------------------
const arrows = [];
export function getArrows() { return arrows; }

const ARROW_SPEED = 1400;
const ARROW_LIFETIME = 1400;
const BASE_LENGTH = 44;

// ------------------------------------------------------------
// ⭐ Level → Sparkle Tier
// ------------------------------------------------------------
function getArrowTier() {
  const lvl = Number(gameState.player?.level || 1);
  if (lvl < 5) return 1;
  if (lvl < 10) return 2;
  if (lvl < 15) return 3;
  if (lvl < 20) return 4;
  return 5;
}

// ------------------------------------------------------------
// 🔥 Unified Target List
// ------------------------------------------------------------
function getAllTargets() {
  return [
    ...getAllGoblinTargets(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
    ...getSeraphines()
  ];
}

// ------------------------------------------------------------
// 🏹 Spawn Arrow (lightweight visuals)
// ------------------------------------------------------------
export function spawnArrow(x, y, angle, dmg) {
  const tier = getArrowTier();

  // ★ Lightweight arrow length
  const softLen = (BASE_LENGTH + tier * 6) * 0.75;

  arrows.push({
    x,
    y,
    angle,
    dmg,
    life: 0,
    alive: true,
    tier,
    len: softLen,
    sparkleTick: 0,
  });
}

// ------------------------------------------------------------
// 🔁 Update Arrows (movement + sparkles + collision)
// ------------------------------------------------------------
export function updateArrows(delta) {
  const dt = delta / 1000;

  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];

    if (!a.alive) {
      arrows.splice(i, 1);
      continue;
    }

    a.life += delta;
    if (a.life > ARROW_LIFETIME) {
      arrows.splice(i, 1);
      continue;
    }

    // Movement
    a.x += Math.cos(a.angle) * ARROW_SPEED * dt;
    a.y += Math.sin(a.angle) * ARROW_SPEED * dt;

    // ------------------------------------------------------------
    // ✨ Lightweight Sparkle Trail
    // ------------------------------------------------------------
    a.sparkleTick += delta;

    const sparkleFreq = Math.max(60, 200 - a.tier * 30);      // less often
    const sparkleCount = Math.max(1, 1 + Math.floor(a.tier * 0.5)); // fewer sparks

    if (a.sparkleTick > sparkleFreq) {
      a.sparkleTick = 0;

      const sx = a.x - Math.cos(a.angle) * (a.len * 0.4);
      const sy = a.y - Math.sin(a.angle) * (a.len * 0.4);

      spawnCanvasSparkleBurst(
        sx,
        sy,
        sparkleCount,
        10 + a.tier * 2,
        ["#ffffff", "#e8c6ff", "#cdd7ff"]
      );
    }

    // ------------------------------------------------------------
    // 🧱 Map Collision
    // ------------------------------------------------------------
    const tipX = a.x + Math.cos(a.angle) * (a.len * 0.55);
    const tipY = a.y + Math.sin(a.angle) * (a.len * 0.55);

    if (isRectBlocked(tipX - 4, tipY - 4, 8, 8)) {
      spawnDamageSparkles(tipX, tipY);
      a.alive = false;
      continue;
    }

    // ------------------------------------------------------------
    // 🎯 Enemy Collision
    // ------------------------------------------------------------
    const targets = getAllTargets();

    for (const t of targets) {
      if (!t.alive) continue;

      const dx = t.x - a.x;
      const dy = t.y - a.y;
      const dist = Math.hypot(dx, dy);

      let hitR = 28;
      if (t.type === "elite") hitR = 50;
      else if (t.type === "ogre" || t.maxHp >= 400) hitR = OGRE_HIT_RADIUS || 60;
      else hitR = 32;

      if (dist < hitR) {
        switch (t.type) {
          case "elite":     damageElite(t, a.dmg); break;
          case "seraphine": damageSeraphine(t, a.dmg); break;
          case "ogre":      damageOgre(t, a.dmg, "player"); break;
          case "worg":      damageWorg(t, a.dmg); break;
          case "troll":     damageTroll(t, a.dmg); break;
          case "crossbow":  damageCrossbow(t, a.dmg); break;
          default:
            if (t.maxHp >= 400 && t.type !== "goblin") {
              damageOgre(t, a.dmg, "player");
            } else {
              damageGoblinVariant(t, a.dmg);
            }
            break;
        }

        spawnDamageSparkles(t.x, t.y);
        a.alive = false;
        break;
      }
    }
  }
}

// ------------------------------------------------------------
// ✨ Draw Lightweight Arrows
// ------------------------------------------------------------
export function drawArrows(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const a of arrows) {
    if (!a.alive) continue;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    // ★ Lightweight glow
    const glow = (0.25 + a.tier * 0.06);

    const grad = ctx.createLinearGradient(0, 0, a.len, 0);
    grad.addColorStop(0, `rgba(255,200,255,${glow})`);
    grad.addColorStop(1, `rgba(180,220,255,${glow * 0.5})`);

    // Trail
    ctx.fillStyle = grad;
    ctx.fillRect(-a.len * 0.4, -1.0, a.len, 2);

    // Core
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(-a.len * 0.3, -0.6, a.len * 0.9, 1.2);

    // Tip sparkle
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(a.len * 0.4, -1.0, 3, 2);

    ctx.restore();
  }

  ctx.restore();
}

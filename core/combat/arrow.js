// ============================================================
// 🏹 arrow.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Physical flying Silver Bolt projectile for player ranged combat
// Modular, lightweight, enemy-agnostic, sparkle-enhanced.
// Now includes LEVEL-BASED sparkle scaling.
// ============================================================

import { spawnDamageSparkles, spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { getGoblins, damageGoblin } from "../goblin.js";
import { getOgres, damageOgre, OGRE_HIT_RADIUS } from "../ogre.js";
import { getElites, damageElite } from "../elite.js";
import { getWorg } from "../worg.js";
import { getTrolls } from "../troll.js";
import { getCrossbows } from "../crossbow.js";
import { isRectBlocked } from "../../utils/mapCollision.js";
import { gameState } from "../../utils/gameState.js";

// ------------------------------------------------------------
// 🗂 Projectile State
// ------------------------------------------------------------
const arrows = [];
export function getArrows() { return arrows; }

const ARROW_SPEED = 1400;
const ARROW_LIFETIME = 1400; // ms
const BASE_LENGTH = 44;

// ------------------------------------------------------------
// 🌟 LEVEL → SPARKLE TIER
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
// 🧠 Unified target access
// ------------------------------------------------------------
function getAllTargets() {
  return [
    ...getGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
  ];
}

// ------------------------------------------------------------
// 🏹 Spawn a new arrow
// ------------------------------------------------------------
export function spawnArrow(x, y, angle, dmg) {
  const tier = getArrowTier();

  arrows.push({
    x,
    y,
    angle,
    dmg,
    life: 0,
    alive: true,
    tier,
    len: BASE_LENGTH + tier * 6,   // scales length
    sparkleTick: 0,
  });
}

// ------------------------------------------------------------
// 🔁 Update arrows (+ MAP COLLISION + sparkle trail)
// ------------------------------------------------------------
export function updateArrows(delta) {
  const dt = delta / 1000;

  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];

    if (!a.alive) {
      arrows.splice(i, 1);
      continue;
    }

    // Lifetime
    a.life += delta;
    if (a.life > ARROW_LIFETIME) {
      arrows.splice(i, 1);
      continue;
    }

    // Movement
    a.x += Math.cos(a.angle) * ARROW_SPEED * dt;
    a.y += Math.sin(a.angle) * ARROW_SPEED * dt;

    // ------------------------------------------------------------
    // ✨ Sparkle Trail (scaled by level)
    // ------------------------------------------------------------
    a.sparkleTick += delta;

    const sparkleFreq = Math.max(40, 140 - a.tier * 20);  
    const sparkleCount = 2 + a.tier;  

    if (a.sparkleTick > sparkleFreq) {
      a.sparkleTick = 0;

      // sparkle origin slightly behind arrow
      const sx = a.x - Math.cos(a.angle) * (a.len * 0.4);
      const sy = a.y - Math.sin(a.angle) * (a.len * 0.4);

      spawnCanvasSparkleBurst(
        sx,
        sy,
        sparkleCount,
        14 + a.tier * 2,
        ["#ffffff", "#e8c6ff", "#cdd7ff"]
      );
    }

    // ------------------------------------------------------------
    // 🧱 MAP COLLISION CHECK
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
        if (t.type === "elite") damageElite(t, a.dmg);
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, a.dmg, "player");
        else damageGoblin(t, a.dmg);

        spawnDamageSparkles(t.x, t.y);
        a.alive = false;
        break;
      }
    }
  }
}

// ------------------------------------------------------------
// ✨ Draw arrows (with glow scaling)
// ------------------------------------------------------------
export function drawArrows(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const a of arrows) {
    if (!a.alive) continue;

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    // Scaling
    const glow = 0.35 + a.tier * 0.1;

    // GLOW trail
    const grad = ctx.createLinearGradient(0, 0, a.len, 0);
    grad.addColorStop(0, `rgba(255,200,255,${glow})`);
    grad.addColorStop(1, `rgba(180,220,255,${glow * 0.7})`);

    ctx.fillStyle = grad;
    ctx.fillRect(-a.len * 0.4, -1.5, a.len, 3);

    // Thin silver core
    ctx.fillStyle = "white";
    ctx.fillRect(-a.len * 0.3, -0.8, a.len * 0.9, 1.6);

    // Tip sparkle
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(a.len * 0.4, -1.2, 4, 2.4);

    ctx.restore();
  }

  ctx.restore();
}

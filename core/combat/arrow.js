// ============================================================
// 🏹 arrow.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Physical flying Silver Bolt projectile for player ranged combat
// Modular, lightweight, enemy-agnostic, sparkle-enhanced.
// ============================================================

import { spawnDamageSparkles } from "../fx/sparkles.js";
import { getGoblins, damageGoblin } from "../goblin.js";
import { getOgres, damageOgre, OGRE_HIT_RADIUS } from "../ogre.js";
import { getElites, damageElite } from "../elite.js";
import { getWorg } from "../worg.js";
import { getTrolls } from "../troll.js";
import { getCrossbows } from "../crossbow.js";
import { isRectBlocked } from "../../utils/mapCollision.js";

// ------------------------------------------------------------
// 🗂 Projectile State
// ------------------------------------------------------------
const arrows = [];
export function getArrows() { return arrows; }

const ARROW_SPEED = 1400;
const ARROW_LIFETIME = 1400; // ms
const ARROW_LENGTH = 46;

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
  arrows.push({
    x,
    y,
    angle,
    dmg,
    life: 0,
    alive: true
  });
}

// ------------------------------------------------------------
// 🔁 Update arrows (now includes MAP COLLISION)
// ------------------------------------------------------------
export function updateArrows(delta) {
  const dt = delta / 1000;

  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];

    if (!a.alive) {
      arrows.splice(i, 1);
      continue;
    }

    // Lifetime expire
    a.life += delta;
    if (a.life > ARROW_LIFETIME) {
      arrows.splice(i, 1);
      continue;
    }

    // Movement
    a.x += Math.cos(a.angle) * ARROW_SPEED * dt;
    a.y += Math.sin(a.angle) * ARROW_SPEED * dt;

    // ------------------------------------------------------------
    // 🧱 MAP COLLISION CHECK
    // ------------------------------------------------------------
    // A small hitbox for the arrow tip
    const tipX = a.x + Math.cos(a.angle) * (ARROW_LENGTH * 0.5);
    const tipY = a.y + Math.sin(a.angle) * (ARROW_LENGTH * 0.5);

    if (isRectBlocked(tipX - 4, tipY - 4, 8, 8)) {
      // Burst sparkles on map hit (soft silver/pink)
      spawnDamageSparkles(tipX, tipY);
      a.alive = false;
      continue;
    }

    // Enemy collision
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
// ✨ Draw arrows (called from drawGame)
// ------------------------------------------------------------
export function drawArrows(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const a of arrows) {
    if (!a.alive) continue;

    ctx.save();

    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);

    // Silver bolt body
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(0,2, ARROW_LENGTH, 2);

    // Glow
    const grad = ctx.createLinearGradient(0, 0, ARROW_LENGTH, 0);
    grad.addColorStop(0, "rgba(255, 180, 255, 0.6)");
    grad.addColorStop(1, "rgba(180, 220, 255, 0.4)");

// thin magical silver bolt
    ctx.fillStyle = "rgba(240,240,255,0.95)";
    ctx.fillRect(-14, -1.2, 28, 2.4);   // very thin line

    // subtle glowing tip
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(12, -1.5, 4, 3);        // tiny point

    ctx.restore();
  }

  ctx.restore();
}

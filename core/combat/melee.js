// ============================================================
// 🗡️ melee.js — Modular Melee Combat System
// ------------------------------------------------------------
// ✦ Handles all melee logic OUTSIDE playerController
// ✦ Power scaling visuals (Tier 1–5)
// ✦ Slash arcs, spark bursts, knockback
// ✦ Clean hit detection for all enemy types
// ✦ Returns animation data to playerController
// ============================================================

import { spawnFloatingText } from "../floatingText.js";
import { spawnDamageSparkles } from "../fx/sparkles.js";
import { getGoblins, damageGoblin } from "../goblin.js";
import { getOgres, damageOgre } from "../ogre.js";
import { getWorg } from "../worg.js";
import { getElites, damageElite } from "../elite.js";
import { getTrolls } from "../troll.js";
import { getCrossbows } from "../crossbow.js";
import { playMeleeSwing } from "../soundtrack.js";
import { gameState } from "../../utils/gameState.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";
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
  const base = 50 + tier * 20;
  const width = 6 + tier * 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(dir === "left" ? Math.PI : 0);

  const grad = ctx.createLinearGradient(0, 0, base, 0);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, `rgba(255,150,255,${0.15 + tier * 0.15})`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(base, 0);
  ctx.lineTo(0, 20);
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
    ...getGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
  ];

  let hitSomething = false;

  for (const t of targets) {
    if (!t.alive) continue;

    const dx = t.x - ox;
    const dy = t.y - oy;
    const dist = Math.hypot(dx, dy);

    if (dist > range) continue;

    // Damage routing
    if (t.type === "elite") damageElite(t, dmg, "player");
    else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "player");
    else damageGoblin(t, dmg);

    hitSomething = true;

    // Knockback
    if (t.type !== "ogre") {
      const push = 40 + tier * 5;
      const len = Math.max(1, dist);
      t.x += (dx / len) * push;
      t.y += (dy / len) * push;
    }

    // Visual damage sparkles
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

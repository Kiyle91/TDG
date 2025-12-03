// ============================================================
// heal.js — Healing ability + calm green visuals (Tier-scaled)
// ------------------------------------------------------------
//  • Heal ability (mana cost, HUD updates, floating text)
//  • Soft pulsing heal ring + inward motes FX
//  • Visuals scale every 5 levels (Tier 1–5)
// ============================================================

import { updateHUD } from "../screenManagement/ui.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { playFairySprinkle } from "../core/soundtrack.js";
import { gameState } from "../utils/gameState.js";

const COST_HEAL = 15;
const HEAL_ANIM_TIME = 1000;

// ------------------------------------------------------------
// ⭐ Tier calculation (matches melee/ranged/spell tiers)
// ------------------------------------------------------------
function getHealTier() {
  const lvl = Number(gameState.player?.level || 1);

  if (lvl < 5) return 1;
  if (lvl < 10) return 2;
  if (lvl < 15) return 3;
  if (lvl < 20) return 4;
  return 5; // level 20+
}

// ------------------------------------------------------------
// Heal ability
// ------------------------------------------------------------
export function performHeal(player) {
  if (!player) return { ok: false };

  if (player.mana < COST_HEAL) {
    return { ok: false, reason: "mana" };
  }

  const tier = getHealTier();

  player.mana -= COST_HEAL;
  updateHUD();

  // Healing math
  const healPower = Number(player.healPower) || Number(player.spellPower) || 0;
  const mh = Number(player.maxHp) || 0;
  const rawHeal = healPower * 1.2 + mh * 0.08 + 10;
  const amount = Math.max(1, Math.round(rawHeal));

  const prevHp = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const actual = Math.max(0, Math.round(player.hp - prevHp));

  playFairySprinkle();
  spawnFloatingText(player.pos.x, player.pos.y - 40, `+${actual}`, "#7aff7a");

  // ------------------------------------------------------------
  // Tier-scaled FX
  // ------------------------------------------------------------
  const moteCount = 16 + tier * 8; // 16 → 24 → 32 → 40 → 48
  const pulseEndR = 80 + tier * 16;

  spawnHealPulse(player.pos.x, player.pos.y, pulseEndR);
  spawnHealMotes(player.pos.x, player.pos.y, moteCount);

  // Stronger sparkle burst
  spawnCanvasSparkleBurst(
    player.pos.x,
    player.pos.y,
    18 + tier * 4,
    90 + tier * 20,
    ["#b3ffb3", "#99ffcc", "#ccffcc", "#e6ffe6", "#d4ffea"]
  );

  updateHUD();

  return {
    ok: true,
    anim: { type: "heal", totalTime: HEAL_ANIM_TIME },
  };
}

// ------------------------------------------------------------
// FX store helpers
// ------------------------------------------------------------
function ensureHealFxStore() {
  if (!gameState.fx) gameState.fx = {};
  if (!gameState.fx.healPulses) gameState.fx.healPulses = [];
  if (!gameState.fx.healMotes) gameState.fx.healMotes = [];
  return gameState.fx;
}

// ------------------------------------------------------------
// 🌿 Pulse Ring (tier-scaled)
// ------------------------------------------------------------
export function spawnHealPulse(x, y, endRadius = 80) {
  const fx = ensureHealFxStore();
  fx.healPulses.push({
    x,
    y,
    age: 0,
    life: 600,
    startR: 12,
    endR: endRadius,
    color: "rgba(120, 255, 150, 0.75)",
  });
}

// ------------------------------------------------------------
// 🌿 Inward Motes (tier-scaled)
// ------------------------------------------------------------
export function spawnHealMotes(x, y, count = 16) {
  const fx = ensureHealFxStore();

  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 80;
    fx.healMotes.push({
      x: x + Math.cos(ang) * dist,
      y: y + Math.sin(ang) * dist,
      tx: x,
      ty: y,
      age: 0,
      life: 450 + Math.random() * 300,
      size: 3 + Math.random() * 2,
      color: "rgba(150,255,150,0.9)",
    });
  }
}

// ------------------------------------------------------------
// Update FX
// ------------------------------------------------------------
export function updateHealFX(delta) {
  const fx = ensureHealFxStore();

  // Pulses
  for (let i = fx.healPulses.length - 1; i >= 0; i--) {
    const p = fx.healPulses[i];
    p.age += delta;
    if (p.age >= p.life) fx.healPulses.splice(i, 1);
  }

  // Motes
  for (let i = fx.healMotes.length - 1; i >= 0; i--) {
    const m = fx.healMotes[i];
    m.age += delta;
    if (m.age >= m.life) {
      fx.healMotes.splice(i, 1);
      continue;
    }
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;
  }
}

// ------------------------------------------------------------
// Render FX
// ------------------------------------------------------------
export function renderHealFX(ctx) {
  const fx = ensureHealFxStore();

  // Pulses
  for (const p of fx.healPulses) {
    const t = p.age / p.life;
    const r = p.startR + (p.endR - p.startR) * t;
    const alpha = 1 - t;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = p.color.replace("0.75", alpha.toFixed(2));
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Motes
  for (const m of fx.healMotes) {
    const t = m.age / m.life;
    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================
// heal.js — Healing ability + calm green visuals
// ------------------------------------------------------------
//  • Heal ability (mana cost, HUD updates, floating text)
//  • Soft pulsing heal ring + inward motes FX
// ============================================================

import { updateHUD } from "../ui.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { spawnFloatingText } from "../floatingText.js";
import { playFairySprinkle } from "../soundtrack.js";
import { gameState } from "../../utils/gameState.js";

const COST_HEAL = 15;
const HEAL_ANIM_TIME = 1000; // ms

// ------------------------------------------------------------------
// Heal ability
// ------------------------------------------------------------------
export function performHeal(player) {
  if (!player) return { ok: false };

  if (player.mana < COST_HEAL) {
    return { ok: false, reason: "mana" };
  }

  player.mana -= COST_HEAL;
  updateHUD();

  const sp = Number(player.spellPower) || 0;
  const mh = Number(player.maxHp) || 0;
  const rawHeal = sp * 1.2 + mh * 0.08 + 10;
  const amount = Math.max(1, Math.round(rawHeal));

  const prevHp = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const actual = Math.max(0, Math.round(player.hp - prevHp));

  playFairySprinkle();
  spawnFloatingText(player.pos.x, player.pos.y - 40, `+${actual}`, "#7aff7a");

  // FX
  spawnHealPulse(player.pos.x, player.pos.y);
  spawnHealMotes(player.pos.x, player.pos.y);
  spawnCanvasSparkleBurst(
    player.pos.x,
    player.pos.y,
    18,
    90,
    ["#b3ffb3", "#99ffcc", "#ccffcc"]
  );

  updateHUD();

  return {
    ok: true,
    anim: { type: "heal", totalTime: HEAL_ANIM_TIME },
  };
}

// ------------------------------------------------------------------
// Heal FX helpers
// ------------------------------------------------------------------
function ensureHealFxStore() {
  if (!gameState.fx) gameState.fx = {};
  if (!gameState.fx.healPulses) gameState.fx.healPulses = [];
  if (!gameState.fx.healMotes) gameState.fx.healMotes = [];
  return gameState.fx;
}

export function spawnHealPulse(x, y) {
  const fx = ensureHealFxStore();
  fx.healPulses.push({
    x,
    y,
    age: 0,
    life: 600,
    startR: 10,
    endR: 80,
    color: "rgba(120, 255, 150, 0.7)",
  });
}

export function spawnHealMotes(x, y) {
  const fx = ensureHealFxStore();
  for (let i = 0; i < 16; i++) {
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
      color: "rgba(150,255,150,0.85)",
    });
  }
}

export function updateHealFX(delta) {
  const fx = ensureHealFxStore();
  const dt = delta;

  for (let i = fx.healPulses.length - 1; i >= 0; i--) {
    const p = fx.healPulses[i];
    p.age += dt;
    if (p.age >= p.life) fx.healPulses.splice(i, 1);
  }

  for (let i = fx.healMotes.length - 1; i >= 0; i--) {
    const m = fx.healMotes[i];
    m.age += dt;
    const t = m.age / m.life;
    if (t >= 1) {
      fx.healMotes.splice(i, 1);
      continue;
    }
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;
  }
}

export function renderHealFX(ctx) {
  const fx = ensureHealFxStore();

  for (const p of fx.healPulses) {
    const t = p.age / p.life;
    const r = p.startR + (p.endR - p.startR) * t;
    const alpha = 1 - t;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = p.color.replace("0.7", alpha.toFixed(2));
    ctx.lineWidth = 4;
    ctx.stroke();
  }

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


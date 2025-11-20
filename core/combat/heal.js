// ============================================================
// 💖 heal.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Modular pastel healing spell / ability
// Extracted from playerController.js
// ------------------------------------------------------------

import { updateHUD } from "../ui.js";
import { spawnCanvasSparkleBurst } from "../fx/sparkles.js";
import { spawnFloatingText } from "../floatingText.js";
import { playFairySprinkle } from "../soundtrack.js";

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------
const COST_HEAL = 15;
const HEAL_ANIM_TIME = 1000;

// ------------------------------------------------------------
// 💖 PERFORM HEAL
// ------------------------------------------------------------
export function performHeal(player) {
  if (!player) return { ok: false };

  // Not enough mana
  if (player.mana < COST_HEAL) {
    return { ok: false, reason: "mana" };
  }

  player.mana -= COST_HEAL;
  updateHUD();

  // --------------------------------------------------------
  // HEAL CALCULATION
  // --------------------------------------------------------
  const sp = Number(player.spellPower) || 0;
  const mh = Number(player.maxHp) || 0;
  const rawHeal = sp * 1.2 + mh * 0.08 + 10;
  const amount = Math.max(1, Math.round(rawHeal));

  const previousHP = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const actual = Math.max(0, Math.round(player.hp - previousHP));

  // --------------------------------------------------------
  // VISUAL & AUDIO FEEDBACK
  // --------------------------------------------------------
  playFairySprinkle();
  spawnFloatingText(player.pos.x, player.pos.y - 40, `+${actual}`, "#7aff7a");

  spawnCanvasSparkleBurst(
    player.pos.x,
    player.pos.y,
    18,
    90,
    ["#b3ffb3", "#99ffcc", "#ccffcc"]
  );

  updateHUD();

  // Animation info for controller
  return {
    ok: true,
    anim: {
      type: "heal",
      totalTime: HEAL_ANIM_TIME,
    },
  };
}

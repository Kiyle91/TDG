// ============================================================
// 💖 HUD — Health & Mana Bars (Fixed Exports)
// ------------------------------------------------------------
// ✦ initHUD()   → links DOM elements for HP & Mana
// ✦ updateBarsHUD() → refreshes fill width + text from player stats
// ✦ Safe alongside ui.js’s updateTopHUD()
// ============================================================

import { gameState } from "../utils/gameState.js";

// Cached DOM elements
let hpFill, manaFill, hpText, manaText;

// ------------------------------------------------------------
// 🚀 initHUD — locate existing DOM elements once
// ------------------------------------------------------------
export function initHUD() {
  hpFill = document.getElementById("hp-fill");
  manaFill = document.getElementById("mana-fill");
  hpText = document.getElementById("hp-text");
  manaText = document.getElementById("mana-text");

  if (!hpFill || !manaFill) {
    console.warn("⚠️ HUD elements not found in DOM.");
    return;
  }

  updateBarsHUD(); // initial draw
}

// ------------------------------------------------------------
// 🔄 updateBarsHUD — reflect current player HP / Mana
// ------------------------------------------------------------
export function updateBarsHUD() {
  if (!hpFill || !manaFill) return;

  const p = gameState.player;
  if (!p) return;

  const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
  const manaPct = Math.max(0, Math.min(100, (p.mana / p.maxMana) * 100));

  hpFill.style.width = `${hpPct}%`;
  manaFill.style.width = `${manaPct}%`;

  if (hpText) hpText.textContent = `${Math.round(p.hp)} / ${Math.round(p.maxHp)}`;
  if (manaText) manaText.textContent = `${Math.round(p.mana)} / ${Math.round(p.maxMana)}`;
}

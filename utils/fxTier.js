// ============================================================
// 🌟 fxTier.js — Global FX Power Scaling Helper
// ------------------------------------------------------------
// Every 5 player levels increases VFX intensity.
// Tier range: 1–6 (Lv1 → Lv30+)
// ============================================================

import { gameState } from "../utils/gameState.js";

export function getFxTier() {
  const lvl = gameState.player?.level || 1;
  return Math.min(6, Math.floor((lvl - 1) / 5) + 1);
}

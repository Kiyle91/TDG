// ============================================================
// 💎 crystalEchoes.js — Exploration Collectibles System
// ------------------------------------------------------------
// • Spawns fixed “Crystal Echoes” on each map
// • Player collects them → XP + Diamonds (if all found)
// • Updates HUD live
// • Pastel glow + floating text
// ============================================================

import { gameState, addDiamonds } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { awardXP } from "./levelSystem.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

let echoes = [];
let totalEchoes = 0;

// ------------------------------------------------------------
// 🔄 RESET for new map
// ------------------------------------------------------------
export function initCrystalEchoes(mapData) {
  echoes = [];

  if (mapData.crystalEchoes && Array.isArray(mapData.crystalEchoes)) {
    echoes = structuredClone(mapData.crystalEchoes);
  }

  totalEchoes = echoes.length;

  // Store in global state for HUD
  gameState.exploration = {
    found: 0,
    total: totalEchoes,
    bonusGiven: false
  };

  updateHUD();
  console.log(`💎 Loaded ${totalEchoes} Crystal Echoes.`);
}

// ------------------------------------------------------------
// 🎨 DRAW + CHECK COLLECTION
// ------------------------------------------------------------
export function updateCrystalEchoes(ctx, player) {
  for (let i = echoes.length - 1; i >= 0; i--) {
    const c = echoes[i];
    const px = player.x;
    const py = player.y;

    const dx = px - c.x;
    const dy = py - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 🌟 Draw glowing pastel crystal
    const pulse = 0.7 + Math.sin(Date.now() / 300) * 0.3;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "rgba(195, 165, 255, 0.90)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ✨ Collect when near
    if (dist < 48) {
      collectCrystalEcho(c, i);
    }
  }
}

// ------------------------------------------------------------
// ✨ COLLECTION HANDLER
// ------------------------------------------------------------
function collectCrystalEcho(crystal, index) {
  echoes.splice(index, 1);
  gameState.exploration.found++;

  // XP reward (small)
  awardXP(20);

  // Visual feedback
  spawnFloatingText("+20 XP", crystal.x, crystal.y - 10, "#DAB4FF");
  playFairySprinkle();

  updateHUD();

  console.log(`💎 Crystal Echo found (${gameState.exploration.found}/${totalEchoes})`);

  // Award final bonus
  if (
    gameState.exploration.found === totalEchoes &&
    !gameState.exploration.bonusGiven
  ) {
    awardCrystalBonus(crystal);
  }
}

// ------------------------------------------------------------
// 💰 AWARD DIAMOND BONUS
// ------------------------------------------------------------
function awardCrystalBonus(lastCrystal) {
  gameState.exploration.bonusGiven = true;

  addDiamonds(10);
  updateHUD();

  spawnFloatingText(
    "✨ Exploration Complete! +100 Diamonds ✨",
    lastCrystal.x,
    lastCrystal.y - 40,
    "#FFFFFF"
  );

  console.log("🏆 Exploration bonus awarded: +100 Diamonds");
}

export function getRemainingEchoes() {
  return echoes.length;
}

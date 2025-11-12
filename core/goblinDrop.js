// ============================================================
// 🪙 goblinDrop.js — Olivia’s World: Crystal Keep (Golden Sparkle Edition)
// ------------------------------------------------------------
// ✦ 10% chance for goblins to drop glowing gold coins
// ✦ Radiant gold–pink aura + subtle sparkle shimmer
// ✦ Collect → +25 Gold + Fairy Sprinkle + Floating Text
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

let ctx = null;
let coinImg = null;
const drops = [];

const DROP_CHANCE = 0.10; // 10%
const GOLD_AMOUNT = 25;
const LIFETIME = 15000;   // 15s

// ------------------------------------------------------------
// ✨ INIT (called from game.js with canvas context)
// ------------------------------------------------------------
export function initGoblinDrops(canvasContext) {
  ctx = canvasContext;
  coinImg = new Image();
  coinImg.src = "./assets/images/characters/loot.png";
  console.log("🪙 Goblin drop system initialized (10% chance, gold sparkle).");
}

// ------------------------------------------------------------
// 💥 TRY SPAWN DROP (called on goblin death)
// ------------------------------------------------------------
export function trySpawnGoblinDrop(x, y) {
  if (Math.random() > DROP_CHANCE) return;
  drops.push({
    x,
    y,
    opacity: 1,
    life: 0,
    collected: false,
  });
  console.log("🪙 Goblin dropped shimmering gold!");
}

// ------------------------------------------------------------
// 🔁 UPDATE
// ------------------------------------------------------------
export function updateGoblinDrops(delta = 16) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += delta;

    // gentle bob motion
    if (d.life < 1000) d.y += 0.04 * delta;
    if (d.life > LIFETIME - 2000)
      d.opacity = Math.max(0, 1 - (d.life - (LIFETIME - 2000)) / 2000);

    if (d.life >= LIFETIME) drops.splice(i, 1);
  }

  checkPlayerCollection();
}

// ------------------------------------------------------------
// 🎨 DRAW — pastel-gold aura + subtle sparkle shimmer
// ------------------------------------------------------------
export function drawGoblinDrops(ctx) {
  if (!ctx || !coinImg) return;
  const time = Date.now() / 1000;

  for (const d of drops) {
    ctx.save();

    const pulse = 1 + Math.sin(time * 3) * 0.08;
    const float = Math.sin(time * 2 + d.x * 0.1) * 4;
    const glow = (Math.sin(time * 6) + 1) * 0.5;
    const size = 56 * pulse;
    const x = d.x;
    const y = d.y + float;

    ctx.globalAlpha = d.opacity;

    // 🌈 Multilayered aura — golden core → pink crystal rim
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.6);
    gradient.addColorStop(0, `rgba(255, 240, 180, ${0.4 + glow * 0.3})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 220, ${0.25 + glow * 0.2})`);
    gradient.addColorStop(1, `rgba(255, 180, 255, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // ✨ Inner sparkle flicker
    const sparkleCount = 5;
    for (let i = 0; i < sparkleCount; i++) {
      const ang = (time * 2 + i) * Math.PI * 0.6;
      const sx = x + Math.cos(ang) * 12;
      const sy = y + Math.sin(ang) * 12;
      const sAlpha = 0.5 + Math.sin(time * 5 + i) * 0.4;
      ctx.globalAlpha = d.opacity * sAlpha;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(time * 8 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 💎 Coin sprite with soft glow
    ctx.globalAlpha = d.opacity;
    ctx.shadowColor = "#ffd966";
    ctx.shadowBlur = 25 + 10 * glow;
    ctx.drawImage(coinImg, x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💰 COLLECTION HANDLING
// ------------------------------------------------------------
function checkPlayerCollection() {
  const player = gameState.player;
  if (!player) return;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    const dx = d.x - player.pos.x;
    const dy = d.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 42 && !d.collected) {
      d.collected = true;
      drops.splice(i, 1);

      // Reward
      addGold(GOLD_AMOUNT);
      spawnFloatingText(player.pos.x, player.pos.y - 40, `🪙 +${GOLD_AMOUNT} Gold!`, "#fff2b3", 22);
      playFairySprinkle();
      updateHUD();
      console.log(`💰 Player collected +${GOLD_AMOUNT} gold.`);
    }
  }
}

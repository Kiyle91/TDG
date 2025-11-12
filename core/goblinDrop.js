// ============================================================
// 🎁 goblinDrop.js — Olivia’s World: Crystal Keep (Mystery Chest Edition)
// ------------------------------------------------------------
// ✦ 20% chance for goblins to drop a glowing treasure chest
// ✦ On collect: 90% → +25 Gold | 10% → +25 Diamonds
// ✦ Soft pink-gold aura + sparkle shimmer
// ✦ Plays Fairy Sprinkle & floating text feedback
// ============================================================

import { gameState, addGold, addDiamonds } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

let ctx = null;
let chestImg = null;
const drops = [];

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const DROP_CHANCE = 0.2; // 20% chance to drop chest
const GOLD_REWARD = 25;
const DIAMOND_REWARD = 25;
const LIFETIME = 15000; // ms
const DIAMOND_CHANCE = 0.10; // 10% diamonds, 90% gold

// ------------------------------------------------------------
// ✨ INIT (called once from game.js with canvas context)
// ------------------------------------------------------------
export function initGoblinDrops(canvasContext) {
  ctx = canvasContext;
  chestImg = new Image();
  chestImg.src = "./assets/images/characters/loot.png"; // using your loot.png as chest sprite
  console.log("🎁 Goblin drop system initialized (20% Mystery Chest chance).");
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

  console.log("🎁 Goblin dropped a mystery chest!");
}

// ------------------------------------------------------------
// 🔁 UPDATE
// ------------------------------------------------------------
export function updateGoblinDrops(delta = 16) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += delta;

    // soft float + fade-out
    if (d.life < 1000) d.y += 0.04 * delta;
    if (d.life > LIFETIME - 2000)
      d.opacity = Math.max(0, 1 - (d.life - (LIFETIME - 2000)) / 2000);

    if (d.life >= LIFETIME) drops.splice(i, 1);
  }

  checkPlayerCollection();
}

// ------------------------------------------------------------
// 🎨 DRAW — glowing chest + pastel gold-pink aura
// ------------------------------------------------------------
export function drawGoblinDrops(ctx) {
  if (!ctx || !chestImg) return;
  const time = Date.now() / 1000;

  for (const d of drops) {
    ctx.save();

    const pulse = 1 + Math.sin(time * 3) * 0.08;
    const float = Math.sin(time * 2 + d.x * 0.1) * 4;
    const glow = (Math.sin(time * 5) + 1) * 0.5;
    const size = 64 * pulse;
    const x = d.x;
    const y = d.y + float;

    ctx.globalAlpha = d.opacity;

    // 🌈 Golden–pink crystal aura
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.8);
    gradient.addColorStop(0, `rgba(255, 230, 180, ${0.4 + glow * 0.3})`);
    gradient.addColorStop(0.4, `rgba(255, 200, 220, ${0.25 + glow * 0.2})`);
    gradient.addColorStop(1, "rgba(255, 180, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.1, 0, Math.PI * 2);
    ctx.fill();

    // ✨ Gentle sparkle shimmer
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const ang = (time * 2 + i) * Math.PI * 0.6;
      const sx = x + Math.cos(ang) * 14;
      const sy = y + Math.sin(ang) * 14;
      const sAlpha = 0.5 + Math.sin(time * 6 + i) * 0.4;
      ctx.globalAlpha = d.opacity * sAlpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(time * 8 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 💎 Draw chest with glow
    ctx.globalAlpha = d.opacity;
    ctx.shadowColor = "#ffe066";
    ctx.shadowBlur = 25 + 10 * glow;
    ctx.drawImage(chestImg, x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💰 COLLECTION HANDLING (Gold or Diamond reward)
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

      // 🪙 Determine reward
      const diamondDrop = Math.random() < DIAMOND_CHANCE;
      if (diamondDrop) {
        addDiamonds(DIAMOND_REWARD);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `💎 +${DIAMOND_REWARD} Diamonds!`, "#b3f7ff", 22);
        console.log(`💎 Chest reward: ${DIAMOND_REWARD} Diamonds`);
      } else {
        addGold(GOLD_REWARD);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `🪙 +${GOLD_REWARD} Gold!`, "#fff2b3", 22);
        console.log(`🪙 Chest reward: ${GOLD_REWARD} Gold`);
      }

      playFairySprinkle();
      updateHUD();
    }
  }
}

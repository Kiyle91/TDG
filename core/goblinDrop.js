// ============================================================
// 🎁 goblinDrop.js — Olivia’s World: Crystal Keep (Chest OR Diamond Edition)
// ------------------------------------------------------------
// ✦ 20% chance for goblins to drop loot
// ✦ 90% = Chest → +25 Gold
// ✦ 10% = Diamond icon → +25 Diamonds
// ✦ No double spawn (diamond no longer shows chest)
// ✦ Pink-gold aura, sparkles, floating reward text
// ============================================================

import { gameState, addGold, addDiamonds } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

let ctx = null;
let chestImg = null;
let diamondImg = null;

const drops = [];

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const DROP_CHANCE = 0.1;
const GOLD_REWARD = 25;
const DIAMOND_REWARD = 25;
const LIFETIME = 15000;
const DIAMOND_CHANCE = 0.10;

// ------------------------------------------------------------
// ✨ INIT
// ------------------------------------------------------------
export function initGoblinDrops(canvasContext) {
  ctx = canvasContext;

  chestImg = new Image();
  chestImg.src = "./assets/images/characters/loot.png";

  diamondImg = new Image();
  diamondImg.src = "./assets/images/characters/gem_diamond.png";

  console.log("🎁 Goblin drop system initialized (Chest OR Diamond).");
}

// ------------------------------------------------------------
// 💥 TRY SPAWN DROP
// ------------------------------------------------------------
export function trySpawnGoblinDrop(x, y) {
  if (Math.random() > DROP_CHANCE) return;

  // Decide drop type
  const isDiamond = Math.random() < DIAMOND_CHANCE;

  drops.push({
    x,
    y,
    opacity: 1,
    life: 0,
    collected: false,
    type: isDiamond ? "diamond" : "chest"
  });

  console.log(`🎁 Goblin dropped: ${isDiamond ? "💎 Diamond" : "🪙 Chest"}`);
}

// ------------------------------------------------------------
// 🔁 UPDATE
// ------------------------------------------------------------
export function updateGoblinDrops(delta = 16) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += delta;

    if (d.life < 1000) d.y += 0.04 * delta;
    if (d.life > LIFETIME - 2000)
      d.opacity = Math.max(0, 1 - (d.life - (LIFETIME - 2000)) / 2000);

    if (d.life >= LIFETIME) drops.splice(i, 1);
  }

  checkPlayerCollection();
}

// ------------------------------------------------------------
// 🎨 DRAW DROPS (Chest OR Diamond)
// ------------------------------------------------------------
export function drawGoblinDrops(ctx) {
  if (!ctx) return;
  const time = Date.now() / 1000;

  for (const d of drops) {
    const img = d.type === "diamond" ? diamondImg : chestImg;
    if (!img) continue;

    ctx.save();

    const pulse = 1 + Math.sin(time * 3) * 0.08;
    const float = Math.sin(time * 2 + d.x * 0.1) * 4;
    const glow = (Math.sin(time * 5) + 1) * 0.5;
    const size = (d.type === "diamond" ? 48 : 64) * pulse;
    const x = d.x;
    const y = d.y + float;

    ctx.globalAlpha = d.opacity;

    // 🌈 Aura (same for both)
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.6);
    gradient.addColorStop(0, `rgba(255, 220, 180, ${0.4 + glow * 0.3})`);
    gradient.addColorStop(0.4, `rgba(255, 180, 220, ${0.25 + glow * 0.2})`);
    gradient.addColorStop(1, "rgba(255, 160, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.0, 0, Math.PI * 2);
    ctx.fill();

    // ✨ Sparkle shimmer (same)
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

    // 🖼️ Draw chest or diamond
    ctx.globalAlpha = d.opacity;
    ctx.shadowColor = "#ffe066";
    ctx.shadowBlur = 25 + 10 * glow;

    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💰 COLLECTION (Gold or Diamonds)
// ------------------------------------------------------------
function checkPlayerCollection() {
  const player = gameState.player;
  if (!player) return;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];

    if (d.collected) continue;

    const dx = d.x - player.pos.x;
    const dy = d.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 42) {
      d.collected = true;
      drops.splice(i, 1);

      if (d.type === "diamond") {
        addDiamonds(DIAMOND_REWARD);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `💎 +${DIAMOND_REWARD}`, "#b3f7ff", 22);
        console.log(`💎 Diamond reward: ${DIAMOND_REWARD}`);
      } else {
        addGold(GOLD_REWARD);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `🪙 +${GOLD_REWARD}`, "#fff2b3", 22);
        console.log(`🪙 Gold reward: ${GOLD_REWARD}`);
      }

      playFairySprinkle();
      updateHUD();
    }
  }
}

// ------------------------------------------------------------
// 🧹 Reset / Clear all goblin drops (used on new map/load)
// ------------------------------------------------------------
export function resetGoblinDrops() {
  drops.length = 0;
  console.log("🧹 Goblin drops cleared.");
}
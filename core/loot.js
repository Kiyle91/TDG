// ============================================================
// 🎁 loot.js — Olivia’s World: Crystal Keep (Unified Loot System)
// ------------------------------------------------------------
// ✦ Single, global loot engine for ALL drops
// ✦ Used by: Goblins, Trolls, Ogres, Pegasus (and others later)
// ✦ Handles spawn → float → fade → collect → reward
// ✦ Shares icons, visuals and logic across all sources
// ============================================================

import { gameState, addGold, addDiamonds } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🖼️ ASSETS
// ------------------------------------------------------------
let lootImg = null;        // Chest / generic loot
let diamondImg = null;
let heartImg = null;
let manaPotionImg = null;

const lootImages = {};

// Simple local loader (no external dependency)
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}



// ------------------------------------------------------------
// 🎲 LOOT TABLE (data-driven drops)
// ------------------------------------------------------------
//
// chance: 0–1 roll per source (enemy / Pegasus)
// rolls: how many items to spawn when triggered (default 1)
// items: weighted table of possible items for that source
//
// type:
//   "chest"  → +gold (uses amount)
//   "diamond"→ +diamonds
//   "heart"  → +HP heal
//   "mana"   → +mana (amount or "full")
//
const LOOT_TABLE = {
  goblin: {
    chance: 0.20,  // 20% chance
    rolls: 1,
    items: [
      { type: "chest", amount: 25, weight: 9 },    // +25 gold
      { type: "diamond", amount: 25, weight: 1 },  // +25 diamonds
    ],
  },

  troll: {
    // Trolls were using goblin drops; keep similar but a bit tweaked
    chance: 0.12,
    rolls: 1,
    items: [
      { type: "chest", amount: 15, weight: 6 },
      { type: "diamond", amount: 10, weight: 2 },
      { type: "heart", amount: 15, weight: 2 },
    ],
  },

  ogre: {
    // Ogres always dropped 4 mixed items
    chance: 1,
    rolls: 4,
    items: [
      { type: "chest", amount: 100, weight: 6 },     // +100 gold
      { type: "diamond", amount: 25, weight: 2 },    // +25 diamonds
      { type: "heart", amount: 100, weight: 3 },     // +100 HP
      { type: "mana", amount: "full", weight: 3 },   // full mana
    ],
  },

  pegasus: {
    // Pegasus always drops SOMETHING when it flies past
    chance: 1,
    rolls: 1,
    items: [
      { type: "heart", amount: 25, weight: 3 },      // +25 HP
      { type: "mana", amount: 50, weight: 3 },       // +50 Mana
      { type: "diamond", amount: 10, weight: 1 },    // +10 diamonds
    ],
  },
};

// ------------------------------------------------------------
// 💾 RUNTIME STATE
// ------------------------------------------------------------
const drops = [];

// Shape:
// {
//   type: "chest" | "diamond" | "heart" | "mana",
//   amount: number | "full",
//   x, y,
//   life: ms,
//   opacity: 0–1,
// }

// Tweaks for behaviour
const DROP_LIFETIME = 15000;      // 15s
const FADEOUT_TIME = 3000;        // last 3s fade
const COLLECT_RADIUS = 80;

// ------------------------------------------------------------
// 🔁 PUBLIC INITIALIZATION
// ------------------------------------------------------------
export async function loadLootImages() {
  // Only load once
  if (lootImg && diamondImg && heartImg && manaPotionImg) {
    return;
  }

  try {
    lootImg = await loadImage("./assets/images/characters/loot.png");
    diamondImg = await loadImage("./assets/images/characters/gem_diamond.png");
    manaPotionImg = await loadImage("./assets/images/characters/mana_potion.png");
    heartImg = await loadImage("./assets/images/characters/gem_heart.png");

    lootImages.chest = lootImg;
    lootImages.diamond = diamondImg;
    lootImages.heart = heartImg;
    lootImages.mana = manaPotionImg;

    console.log("🎁 Loot images loaded (unified loot system).");
  } catch (err) {
    console.warn("⚠️ Failed to load loot images:", err);
  }
}

export function clearLoot() {
  drops.length = 0;
  console.log("🧹 All loot cleared.");
}

// ------------------------------------------------------------
// 🎲 LOOT SPAWN HELPERS
// ------------------------------------------------------------
function pickWeightedItem(items) {
  if (!items || !items.length) return null;
  let total = 0;
  for (const it of items) total += it.weight ?? 1;

  let r = Math.random() * total;
  for (const it of items) {
    const w = it.weight ?? 1;
    if (r < w) return it;
    r -= w;
  }
  return items[items.length - 1];
}

function scatterPosition(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 20 + Math.random() * 40;
  return {
    x: x + Math.cos(angle) * dist,
    y: y + Math.sin(angle) * dist,
  };
}

/**
 * Spawn loot for a given source.
 * `source` should be a key from LOOT_TABLE, e.g. "goblin", "ogre", "pegasus".
 */
export function spawnLoot(source, x, y) {
  const table = LOOT_TABLE[source];
  if (!table) return;

  // Roll chance
  if (Math.random() > table.chance) return;

  const rolls = table.rolls ?? 1;
  for (let i = 0; i < rolls; i++) {
    const item = pickWeightedItem(table.items);
    if (!item) continue;

    const pos =
      rolls > 1 ? scatterPosition(x, y) : { x, y };

    drops.push({
      type: item.type,
      amount: item.amount,
      x: pos.x,
      y: pos.y,
      life: 0,
      opacity: 1,
    });
  }
}

// ------------------------------------------------------------
// 🧮 UPDATE
// ------------------------------------------------------------
export function updateLoot(delta) {
  if (!drops.length) return;

  const player = gameState.player;
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];

    d.life += delta;

    // Initial gentle fall for the first second, then hover
    if (d.life < 1000) {
      d.y += 0.04 * delta;
    }

    // Fade out near the end of life
    if (d.life > DROP_LIFETIME - FADEOUT_TIME) {
      const t = (d.life - (DROP_LIFETIME - FADEOUT_TIME)) / FADEOUT_TIME;
      d.opacity = Math.max(0, 1 - t);
    }

    // Remove when expired
    if (d.life >= DROP_LIFETIME || d.opacity <= 0) {
      drops.splice(i, 1);
      continue;
    }

    // Collection check
    if (player && player.pos) {
      const dx = d.x - player.pos.x;
      const dy = d.y - player.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= COLLECT_RADIUS * COLLECT_RADIUS) {
        applyLootReward(d);
        drops.splice(i, 1);
      }
    }
  }
}

// ------------------------------------------------------------
// 💝 APPLY REWARDS
// ------------------------------------------------------------
function applyLootReward(d) {
  const player = gameState.player;
  playFairySprinkle?.();

  switch (d.type) {
    case "chest": {
      const amount = Number(d.amount) || 0;
      addGold(amount);
      spawnFloatingText(d.x, d.y - 40, `+${amount} Gold`, "#ffd966");
      break;
    }

    case "diamond": {
      const amount = Number(d.amount) || 0;
      addDiamonds(amount);
      spawnFloatingText(d.x, d.y - 40, `+${amount} 💎`, "#d9b3ff");
      break;
    }

    case "heart": {
      if (player) {
        const amount = Number(d.amount) || 0;
        player.hp = Math.min(player.maxHp ?? 100, player.hp + amount);
        spawnFloatingText(d.x, d.y - 40, `+${amount} HP`, "#ff99bb");
      }
      break;
    }

    case "mana": {
      if (player) {
        if (d.amount === "full") {
          player.mana = player.maxMana ?? 100;
          spawnFloatingText(d.x, d.y - 40, `Mana Restored!`, "#99ddff");
        } else {
          const amount = Number(d.amount) || 0;
          player.mana = Math.min(player.maxMana ?? 100, player.mana + amount);
          spawnFloatingText(d.x, d.y - 40, `+${amount} Mana`, "#99ddff");
        }
      }
      break;
    }

    default:
      break;
  }

  updateHUD();
}

// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------
export function drawLoot(ctx) {
  

  if (!ctx || !drops.length) return;

  const time = Date.now() / 1000;

  for (const d of drops) {
    const img = lootImages[d.type];
    if (!img) continue;

    const pulse = 1 + Math.sin(time * 2) * 0.08;
    const float = Math.sin(time * 3 + d.x * 0.01) * 4;
    const glowPulse = (Math.sin(time * 4) + 1) * 0.5;

    // Base size tweaks per type
    const baseSize =
      d.type === "heart" ? 65 :
      d.type === "mana" ? 60 :
      48;

    const size = baseSize * pulse;

    const x = d.x;
    const y = d.y + float;

    ctx.save();

    // Soft aura
    const gradient = ctx.createRadialGradient(
      x, y, size * 0.2,
      x, y, size * 0.9
    );
    if (d.type === "diamond") {
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(180, 200, 255, ${0.0 * d.opacity})`);
    } else if (d.type === "heart") {
      gradient.addColorStop(0, `rgba(255, 170, 200, ${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(255, 120, 180, ${0.0 * d.opacity})`);
    } else if (d.type === "mana") {
      gradient.addColorStop(0, `rgba(150, 220, 255, ${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(80, 180, 255, ${0.0 * d.opacity})`);
    } else {
      // chest / generic
      gradient.addColorStop(0, `rgba(255, 230, 170, ${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(255, 200, 120, ${0.0 * d.opacity})`);
    }

    ctx.globalAlpha = d.opacity * (0.7 + glowPulse * 0.3);
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.globalAlpha = d.opacity;
    ctx.drawImage(
      img,
      x - size / 2,
      y - size / 2,
      size,
      size
    );

    ctx.restore();
  }
}

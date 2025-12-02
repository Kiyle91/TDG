// ============================================================
// 🎁 loot.js — Olivia’s World: Crystal Keep (Unified Loot System)
// ------------------------------------------------------------
// ✦ Single global loot engine for all drops
// ✦ Weighted item pool + per-enemy drop chances
// ✦ Float, fade, glow, pulse animations
// ✦ Collect → reward → floating text + SFX
// ============================================================
/* ------------------------------------------------------------
 * MODULE: loot.js
 * PURPOSE:
 *   Provides a unified, global loot-drop system for all enemy,
 *   event, and special drops used across the entire game.
 *
 * SUMMARY:
 *   Loot drops are spawned from enemies or special creatures
 *   (Goblins, Trolls, Ogres, Worgs, Elites, Pegasus). Each drop
 *   floats, pulses, fades, and can be collected by the player
 *   within a radius. Reward types include gold, diamonds, HP,
 *   and mana restorations.
 *
 * FEATURES:
 *   • Weighted universal loot table
 *   • Per-enemy drop configurations
 *   • Shared image pool (chest, diamond, heart, mana potion)
 *   • Soft glow aura + floating animation
 *   • Auto fade-out + lifetime expiration
 *   • Player reward application (HP, Mana, Gold, Diamonds)
 *
 * TECHNICAL NOTES:
 *   • Zero gameplay assumptions; purely visual + reward logic
 *   • Integrated with floatingText + HUD updates
 *   • All drop items stored in a simple runtime array
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold, addDiamonds, getDifficultyEconomyMultiplier } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { playFairySprinkle } from "../core/soundtrack.js";
import { updateHUD } from "../screenManagement/ui.js";
import { addBravery } from "../player/bravery.js";

// ------------------------------------------------------------
// 🖼️ ASSETS (loaded once)
// ------------------------------------------------------------

let lootImg = null;
let diamondImg = null;
let heartImg = null;
let manaPotionImg = null;
let braveryImg = null;

const lootImages = {};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ------------------------------------------------------------
// 🎲 UNIVERSAL ITEM POOL
// ------------------------------------------------------------

const LOOT_ITEMS = [
  { type: "chest",   amount: 15,  weight: 6 },
  { type: "diamond", amount: 5,  weight: 2 },
  { type: "heart",   amount: 500, weight: 2 },
  { type: "mana",    amount: 500, weight: 2 },
  { type: "bravery", amount: 25, weight: 2 },
];

// ------------------------------------------------------------
// 🎲 PER-ENEMY DROP RATES
// ------------------------------------------------------------

const LOOT_TABLE = {
  goblin:   { chance: 0.05, rolls: 1 },
  troll:    { chance: 0.05, rolls: 1 },
  worg:     { chance: 0.05, rolls: 1 },
  elite:    { chance: 0.07, rolls: 1 },
  crossbow: { chance: 0.1, rolls: 1 },
  ogre:     { chance: 1.0,  rolls: 3 },
  pegasus:  { chance: 1.0,  rolls: 1 },
};

// ------------------------------------------------------------
// 💾 RUNTIME DROP STORAGE
// ------------------------------------------------------------

const drops = [];

// ------------------------------------------------------------
// 🎤 ONE-TIME PICKUP SPEECH FLAGS
// ------------------------------------------------------------
let saidDiamond = false;
let saidGold = false;
let saidHeart = false;
let saidMana = false;
let saidBravery = false;

function pickupSpeech(line) {
  // We cannot import speechBubble here because loot.js is engine-level.
  // So we emit a story event instead:
  import("../core/eventEngine.js").then(({ Events }) => {
    Events.emit("tutorialSpeech", line);
  });
}

const DROP_LIFETIME = 15000;     // 15 seconds
const FADEOUT_TIME = 3000;       // last 3 seconds fade
const COLLECT_RADIUS = 80;

// ------------------------------------------------------------
// 🔁 LOAD LOOT IMAGES (called once)
// ------------------------------------------------------------

export async function loadLootImages() {
  if (lootImg) return;

  try {
    lootImg = await loadImage("./assets/images/characters/loot.png");
    diamondImg = await loadImage("./assets/images/characters/gem_diamond.png");
    manaPotionImg = await loadImage("./assets/images/characters/mana_potion.png");
    heartImg = await loadImage("./assets/images/characters/gem_heart.png");
    braveryImg = await loadImage ("./assets/images/characters/bravery.png");

    lootImages.bravery = braveryImg;
    lootImages.chest = lootImg;
    lootImages.diamond = diamondImg;
    lootImages.heart = heartImg;
    lootImages.mana = manaPotionImg;

  } catch (_) {
    // Images failed — silently skip, game continues safely
  }
}

export function clearLoot() {
  drops.length = 0;
}

// ------------------------------------------------------------
// 🎲 WEIGHTED PICK
// ------------------------------------------------------------

function pickWeightedItem(items) {
  if (!items?.length) return null;

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

// ------------------------------------------------------------
// 💠 SPAWN LOOT
// ------------------------------------------------------------

export function spawnLoot(source, x, y) {
  const table = LOOT_TABLE[source];
  if (!table) return;
  if (!isFinite(x) || !isFinite(y)) return;

  const lootMult = getDifficultyEconomyMultiplier();
  const effectiveChance = Math.min(1, table.chance * lootMult);
  if (Math.random() > effectiveChance) return;

  const rolls = table.rolls ?? 1;

  for (let i = 0; i < rolls; i++) {
    const item = pickWeightedItem(LOOT_ITEMS);
    if (!item) continue;

    const pos = rolls > 1 ? scatterPosition(x, y) : { x, y };

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
// 🔄 UPDATE LOOT
// ------------------------------------------------------------

export function updateLoot(delta) {
  if (!drops.length) return;

  const player = gameState.player;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];

    d.life += delta;

    // Gentle fall
    if (d.life < 1000) {
      d.y += 0.04 * delta;
    }

    // Fade out at end
    if (d.life > DROP_LIFETIME - FADEOUT_TIME) {
      const t = (d.life - (DROP_LIFETIME - FADEOUT_TIME)) / FADEOUT_TIME;
      d.opacity = Math.max(0, 1 - t);
    }

    // Expired
    if (d.life >= DROP_LIFETIME || d.opacity <= 0) {
      drops.splice(i, 1);
      continue;
    }

    // Collection
    if (player?.pos) {
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
// 💝 APPLY REWARD
// ------------------------------------------------------------

function applyLootReward(d) {
  const player = gameState.player;
  playFairySprinkle?.();

  switch (d.type) {
    case "chest": {
      const amount = Number(d.amount) || 0;
      addGold(amount);
      spawnFloatingText(d.x, d.y - 40, `+${amount} Shards`, "#ffffffff");

      if (!saidGold) {
        saidGold = true;
        pickupSpeech("Shards! I need to collect these to build new Spires!.");
      }
      break;
    }

    case "diamond": {
      const amount = Number(d.amount) || 0;
      addDiamonds(amount);
      spawnFloatingText(d.x, d.y - 40, `+${amount} 💎`, "#d9b3ff");

      if (!saidDiamond) {
        saidDiamond = true;
        pickupSpeech("Diamonds! I can use these to upgrade my Spires!");
      }
      break;
    }

    case "heart": {
      if (player) {
        const amount = Number(d.amount) || 0;
        player.hp = Math.min(player.maxHp ?? 100, player.hp + amount);
        spawnFloatingText(d.x, d.y - 40, `+${amount} HP`, "#ff99bb");

        if (!saidHeart) {
          saidHeart = true;
          pickupSpeech("A Heart! That’ll heal me if I get hurt.");
        }
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

        if (!saidMana) {
          saidMana = true;
          pickupSpeech("Mana essence… this lets me cast my spells and use my bow more often.");
        }
      }
      break;
    }

    case "bravery": {
      const amount = Number(d.amount) || 0;
      addBravery(amount);
      spawnFloatingText(d.x, d.y - 40, `+${amount} Bravery`, "#ff99ff");

      if (!saidBravery) {
        saidBravery = true;
        pickupSpeech("Bravery shards… these charge my Bravery Aura! I can do this!");
      }
      break;
    }
  }

  updateHUD();
}


// ------------------------------------------------------------
// 🎨 DRAW LOOT WITH GLOWS + FLOATS
// ------------------------------------------------------------

export function drawLoot(ctx) {
  if (!ctx || drops.length === 0) return;

  const time = Date.now() / 1000;

  for (const d of drops) {
    if (!isFinite(d.x) || !isFinite(d.y)) continue;

    const img = lootImages[d.type];
    if (!img) return;

    const pulse = 1 + Math.sin(time * 2) * 0.08;
    const float = Math.sin(time * 3 + d.x * 0.01) * 4;
    const glowPulse = (Math.sin(time * 4) + 1) * 0.5;

    let baseSize = 48;
    if (d.type === "heart") baseSize = 65;
    else if (d.type === "mana") baseSize = 60;

    const size = baseSize * pulse;
    const x = d.x;
    const y = d.y + float;

    if (!isFinite(size) || size <= 0) continue;

    ctx.save();

    // Aura glow
    let gradient;
    try {
      gradient = ctx.createRadialGradient(
        x, y, size * 0.2,
        x, y, size * 0.9
      );
    } catch (_) {
      ctx.restore();
      continue;
    }

    if (d.type === "diamond") {
      gradient.addColorStop(0, `rgba(255,255,255,${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(180,200,255,0)`);
    } else if (d.type === "heart") {
      gradient.addColorStop(0, `rgba(255,170,200,${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(255,120,180,0)`);
    } else if (d.type === "mana") {
      gradient.addColorStop(0, `rgba(150,220,255,${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(80,180,255,0)`);
    } else {
      gradient.addColorStop(0, `rgba(255,230,170,${0.7 * d.opacity})`);
      gradient.addColorStop(1, `rgba(255,200,120,0)`);
    }

    ctx.globalAlpha = d.opacity * (0.7 + glowPulse * 0.3);
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Draw icon
    ctx.globalAlpha = d.opacity;
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================ 

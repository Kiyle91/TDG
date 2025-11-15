// ============================================================
// 🎁 ogreLoot.js — Olivia’s World: Crystal Keep (Chest + Heart + Mana + Diamond)
// ------------------------------------------------------------
// ✦ Matches goblinDrop.js behaviour 1:1
// ✦ 4 drops scatter when an Ogre dies
// ✦ Chest: +100 Gold
// ✦ Diamond: +25 Diamonds
// ✦ Heart: +100 HP
// ✦ Mana Potion: Restore Mana to FULL
// ✦ Lifetime fade, float, collect, cleanup identical to goblin drops
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// 🖼️ ASSETS
// ------------------------------------------------------------
const lootImages = {};
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

export async function loadLootImages() {
  lootImages.chest   = await loadImage("./assets/images/characters/loot.png");
  lootImages.mana    = await loadImage("./assets/images/characters/mana_potion.png");
  lootImages.diamond = await loadImage("./assets/images/characters/gem_diamond.png");
  lootImages.heart   = await loadImage("./assets/images/characters/gem_heart.png");

  console.log("🎁 Ogre loot images loaded.");
}

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let lootDrops = [];

export function clearLoot() {
  lootDrops.length = 0;
  console.log("🧹 Ogre loot cleared.");
}

export function getLoot() {
  return lootDrops;
}

// ------------------------------------------------------------
// 💎 SPAWN DROPS (called when ogre is slain)
// ------------------------------------------------------------
export function spawnOgreLoot(x, y) {
  const spread = 60;
  const offsets = [
    { type: "chest",   dx: -spread,      dy: -spread },
    { type: "mana",    dx:  spread,      dy: -spread / 2 },
    { type: "heart",   dx: -spread / 2,  dy:  spread },
    { type: "diamond", dx:  spread * .7, dy:  spread * .8 },
  ];

  for (const o of offsets) {
    lootDrops.push({
      type: o.type,
      x: x + o.dx + (Math.random() * 20 - 10),
      y: y + o.dy + (Math.random() * 20 - 10),

      // Goblin drop matching vars:
      opacity: 1,
      collected: false,
      life: 0,              // lifetime timer
      floatT: 0,            // bobbing
      size: 60,
    });
  }

  console.log("💎 Ogre loot spawned.");
}

// ------------------------------------------------------------
// 🔁 UPDATE — identical behaviour to goblin drops
// ------------------------------------------------------------
export function updateLoot(delta = 16) {
  const p = gameState.player;
  if (!p) return;

  for (let i = lootDrops.length - 1; i >= 0; i--) {
    const d = lootDrops[i];

    d.life += delta;
    d.floatT += delta;

    // float up for first second (matches goblin)
    if (d.life < 1000) d.y += 0.04 * delta;

    // fade in final 2 seconds (matches goblin)
    const LIFETIME = 15000;
    if (d.life > LIFETIME - 2000)
      d.opacity = Math.max(0, 1 - (d.life - (LIFETIME - 2000)) / 2000);

    // despawn
    if (d.life >= LIFETIME) {
      lootDrops.splice(i, 1);
      continue;
    }
  }

  checkPlayerCollection();
}

// ------------------------------------------------------------
// 💰 COLLECTION (Gold / Diamond / Heart / Mana)
// ------------------------------------------------------------
function checkPlayerCollection() {
  const player = gameState.player;
  if (!player) return;

  for (let i = lootDrops.length - 1; i >= 0; i--) {
    const d = lootDrops[i];
    if (d.collected) continue;

    const dx = d.x - player.pos.x;
    const dy = d.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 45) {
      d.collected = true;
      lootDrops.splice(i, 1);

      playFairySprinkle();

      switch (d.type) {
        case "chest":
          addGold(100);
          spawnFloatingText(player.pos.x, player.pos.y - 40, "+100 Gold", "#ffd966", 22);
          break;

        case "diamond":
          player.diamonds = (player.diamonds || 0) + 25;
          spawnFloatingText(player.pos.x, player.pos.y - 40, "+25 💎", "#b3ecff", 22);
          break;

        case "heart":
          player.hp = Math.min(player.maxHp || 0, (player.hp || 0) + 100);
          spawnFloatingText(player.pos.x, player.pos.y - 40, "+100 ❤️", "#ff99b9", 22);
          break;

        case "mana":
          player.mana = player.maxMana || player.mana;
          spawnFloatingText(player.pos.x, player.pos.y - 40, "🔮 Mana Full!", "#99ccff", 22);
          break;
      }

      updateHUD();
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW — same fade logic as goblin drops
// ------------------------------------------------------------
export function drawLoot(ctx) {
  if (!ctx) return;

  const time = Date.now() / 1000;

  for (const d of lootDrops) {
    const img = lootImages[d.type];
    if (!img) continue;

    const bob = Math.sin(d.floatT / 250) * 4;
    const size = d.size;

    ctx.save();
    ctx.globalAlpha = d.opacity;

    // tiny shadow (similar to goblin, colour adjusted)
    ctx.beginPath();
    ctx.ellipse(d.x, d.y + bob + size * 0.42, size * 0.28, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    // sprite
    ctx.drawImage(
      img,
      d.x - size / 2,
      d.y + bob - size / 2,
      size,
      size
    );

    ctx.restore();
  }
}

// ============================================================
// 🎁 ogreLoot.js — Olivia’s World: Crystal Keep (Ogre Drops)
// ------------------------------------------------------------
// ✦ Spawns/scatters loot when an Ogre dies
// ✦ Chest: +100 Gold
// ✦ Diamond: +25 Diamonds
// ✦ Heart: +100 HP
// ✦ Mana Potion: Restore Mana to FULL
// ✦ Float animation, collect-on-contact, soft fade-out
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// 🖼️ ASSETS (current temp location)
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
  // NOTE: using assets/images/characters (as requested)
  lootImages.chest   = await loadImage("./assets/images/characters/loot.png");
  lootImages.mana    = await loadImage("./assets/images/characters/mana_potion.png");
  lootImages.diamond = await loadImage("./assets/images/characters/gem_diamond.png");
  lootImages.heart   = await loadImage("./assets/images/characters/gem_heart.png");
  console.log("🎁 Ogre loot images loaded (characters/).");
}

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let lootDrops = [];
export function getLoot() { return lootDrops; }
export function clearLoot() { lootDrops = []; }

// ------------------------------------------------------------
// 💎 SPAWN DROPS (called when ogre is slain)
// ------------------------------------------------------------
export function spawnOgreLoot(x, y) {
  // spread the 4 items roughly around the corpse
  const spread = 60;
  const offsets = [
    { type: "chest",   dx: -spread,        dy: -spread },          // top-left
    { type: "mana",    dx:  spread,        dy: -spread / 2 },      // top-right
    { type: "heart",   dx: -spread / 2,    dy:  spread },          // bottom-left
    { type: "diamond", dx:  spread * 0.7,  dy:  spread * 0.8 },    // bottom-right
  ];

  for (const o of offsets) {
    lootDrops.push({
      type: o.type,
      x: x + o.dx + (Math.random() * 20 - 10),
      y: y + o.dy + (Math.random() * 20 - 10),
      collected: false,
      floatT: 0,       // for idle bobbing
      fadeT: 0,        // fade after collected
      size: 60,        // draw size
    });
  }

  console.log(`💎 Spawned ${offsets.length} ogre loot items at ${x},${y}.`);
}

// ------------------------------------------------------------
// 🧠 UPDATE — float & collect
// ------------------------------------------------------------
export function updateLoot(delta = 16) {
  const p = gameState.player;
  if (!p) return;

  const px = p.pos?.x ?? p.x ?? 0;
  const py = p.pos?.y ?? p.y ?? 0;

  for (const it of lootDrops) {
    // gentle float
    it.floatT += delta;
    const bob = Math.sin(it.floatT / 250) * 4;

    // collection check (skip if already fading)
    if (!it.collected) {
      const dist = Math.hypot((it.x) - px, (it.y + bob) - py);
      if (dist < 45) {
        collect(it, p);
      }
    } else {
      it.fadeT += delta;
    }
  }

  // remove finished fades
  lootDrops = lootDrops.filter(it => it.fadeT === 0 || it.fadeT < 500);
}

// ------------------------------------------------------------
// ✨ COLLECT
// ------------------------------------------------------------
function collect(item, player) {
  if (item.collected) return;
  item.collected = true;
  item.fadeT = 1;
  playFairySprinkle();

  switch (item.type) {
    case "chest":
      addGold(100);
      spawnFloatingText(item.x, item.y - 20, "+100 Gold", "#ffd966");
      break;
    case "diamond":
      player.diamonds = (player.diamonds || 0) + 25;
      spawnFloatingText(item.x, item.y - 20, "+25 💎", "#b3ecff");
      break;
    case "heart":
      player.hp = Math.min(player.maxHp || 0, (player.hp || 0) + 100);
      spawnFloatingText(item.x, item.y - 20, "+100 ❤️", "#ff99b9");
      break;
    case "mana":
      player.mana = player.maxMana || player.mana;
      spawnFloatingText(item.x, item.y - 20, "🔮 Mana Full!", "#99ccff");
      break;
  }

  updateHUD();
}

// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------
export function drawLoot(ctx) {
  if (!ctx || lootDrops.length === 0) return;

  for (const it of lootDrops) {
    const img = lootImages[it.type];
    if (!img) continue;

    // opacity fades after collection
    const alpha = it.collected ? Math.max(0, 1 - it.fadeT / 500) : 1;
    const bob = Math.sin(it.floatT / 250) * 4;

    ctx.save();
    ctx.globalAlpha = alpha;

    // tiny shadow
    ctx.beginPath();
    ctx.ellipse(it.x, it.y + bob + it.size * 0.42, it.size * 0.28, it.size * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();

    // sprite
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      it.x - it.size / 2,
      it.y + bob - it.size / 2,
      it.size, it.size
    );

    ctx.restore();
  }
}

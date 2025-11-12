// ============================================================
// 💎 pegasusDrop.js — Olivia’s World: Crystal Keep (Healing, Mana & Diamond Drops)
// ------------------------------------------------------------
// ✦ Pegasus occasionally drops magical heart gems, mana potions or rare diamonds
// ✦ Healing gem restores +25 HP
// ✦ Mana potion restores +50 Mana
// ✦ Diamond grants +10 diamonds (currency)
// ✦ All fade out after 15 seconds with soft aura & glow
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { addDiamonds } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";

let ctx = null;
let gemHeartImg = null;
let gemDiamondImg = null;
let manaPotionImg = null; // 🆕 added
const drops = [];

// ------------------------------------------------------------
// 🌈 LOAD GEM IMAGES
// ------------------------------------------------------------
export async function loadHealingGem() {
  return new Promise((resolve) => {
    const heart = new Image();
    const diamond = new Image();
    const mana = new Image(); // 🆕 load mana pot

    heart.src = "./assets/images/characters/gem_heart.png";
    diamond.src = "./assets/images/characters/gem_diamond.png";
    mana.src = "./assets/images/characters/mana_potion.png"; // 🆕

    let loaded = 0;
    const check = () => { if (++loaded === 3) resolve(); };

    heart.onload = () => { gemHeartImg = heart; check(); };
    diamond.onload = () => { gemDiamondImg = diamond; check(); };
    mana.onload = () => { manaPotionImg = mana; check(); };

    heart.onerror = check;
    diamond.onerror = check;
    mana.onerror = check;
  });
}

// ------------------------------------------------------------
// ✨ INIT
// ------------------------------------------------------------
export function initHealingDrops(canvasContext) {
  ctx = canvasContext;
  console.log("💎 Drop system initialized (hearts + mana + diamonds).");
}

// ------------------------------------------------------------
// 💫 SPAWN DROP — type: "heart" | "mana" | "diamond"
// ------------------------------------------------------------
export function spawnHealingDrop(x, y) {
  if (!ctx) return;

  // 🧪 Diamond remains rare (10%), otherwise 50/50 heart vs mana
  let type = "heart";
  const roll = Math.random();

  if (roll < 0.10) type = "diamond";         // 10% diamond
  else type = Math.random() < 0.5 ? "heart"  // 45% heart
                                  : "mana";  // 45% mana potion

  drops.push({
    type,
    x,
    y,
    opacity: 1,
    life: 0,
    duration: 15000,
    collected: false,
  });

  console.log(`💫 Drop spawned: ${type}`);
}

// ------------------------------------------------------------
// ⏰ UPDATE
// ------------------------------------------------------------
export function updateHealingDrops(delta = 16) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += delta;

    if (d.life < 1000) d.y += 0.05 * delta;
    if (d.life > d.duration - 2000)
      d.opacity = Math.max(0, 1 - (d.life - (d.duration - 2000)) / 2000);

    if (d.life >= d.duration) drops.splice(i, 1);
  }

  checkPlayerCollection();
}

// ------------------------------------------------------------
// 🎨 DRAW (heart, mana, diamond)
// ------------------------------------------------------------
export function drawHealingDrops(ctx) {
  if (!ctx || (!gemHeartImg && !gemDiamondImg && !manaPotionImg)) return;

  const time = Date.now() / 1000;

  for (const d of drops) {
    ctx.save();

    const pulse = 1 + Math.sin(time * 2) * 0.08;
    const float = Math.sin(time * 3 + d.x) * 4;
    const glowPulse = (Math.sin(time * 4) + 1) * 0.5;

    // 🧪 Different size per item
    const baseSize =
      d.type === "heart" ? 65 :
      d.type === "mana" ? 60 :
      48;

    const size = baseSize * pulse;

    const x = d.x;
    const y = d.y + float;

    ctx.globalAlpha = d.opacity;

    // ✨ Aura color based on type
    const color =
      d.type === "diamond" ? "rgba(180, 255, 255," :
      d.type === "mana" ? "rgba(170, 200, 255," :
      "rgba(255, 192, 203,";

    // 🌸 Animated aura gradient
    const auraSize = size * (1.8 + Math.sin(time * 2) * 0.1);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, auraSize);
    gradient.addColorStop(0, `${color}${0.4 + glowPulse * 0.3})`);
    gradient.addColorStop(0.5, `${color}${0.2 + glowPulse * 0.2})`);
    gradient.addColorStop(1, `${color}0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, auraSize, 0, Math.PI * 2);
    ctx.fill();

    // 🌟 Glow behind gems/potions
    ctx.shadowColor =
      d.type === "diamond" ? "#b3f7ff" :
      d.type === "mana" ? "#aaccff" :
      "#ffb6c1";

    ctx.shadowBlur = 25 + 15 * glowPulse;

    // 🖼️ Select correct sprite
    let img = gemHeartImg;
    if (d.type === "diamond") img = gemDiamondImg;
    else if (d.type === "mana") img = manaPotionImg;

    if (img) ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💗 COLLECTION: HP, Mana, Diamonds
// ------------------------------------------------------------
function checkPlayerCollection() {
  const player = gameState.player;
  if (!player) return;

  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    const dx = d.x - player.pos.x;
    const dy = d.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40 && !d.collected) {
      d.collected = true;
      drops.splice(i, 1);

      if (d.type === "heart") {
        const healAmount = 25;
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `+${healAmount} HP`, "#ffb3d9", 22);
        playFairySprinkle();
        console.log("💖 Healing gem collected!");

      } else if (d.type === "mana") {
        const manaAmount = 50;
        player.mana = Math.min(player.maxMana, player.mana + manaAmount);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `🔮 +${manaAmount} Mana`, "#aaccff", 22);
        playFairySprinkle();
        console.log("🔮 Mana potion collected!");

        updateHUD();

      } else if (d.type === "diamond") {
        addDiamonds(10);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `💎 +10 Diamonds!`, "#b3f7ff", 22);
        playFairySprinkle();
        console.log("💎 Diamond collected! +10 Diamonds");

        updateHUD();
      }
    }
  }
}

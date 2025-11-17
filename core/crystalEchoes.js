// ============================================================
// 💎 crystalEchoes.js — Exploration Collectibles System
// ------------------------------------------------------------
// • Fixed-position Crystal Echoes
// • Collect → XP + Diamonds + burst effect
// • Random sprite per echo
// • 74px crystals (large & readable)
// • NO idle pulsing animation
// • Clean burst effect on collect
// ============================================================

import { gameState, addDiamonds } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { awardXP } from "./levelSystem.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

let echoes = [];
let totalEchoes = 0;

// ------------------------------------------------------------
// 📦 CRYSTAL SPRITE IMAGES
// ------------------------------------------------------------
const crystalImages = [
  "./assets/images/characters/crystal_echo_black.png",
  "./assets/images/characters/crystal_echo_blue.png",
  "./assets/images/characters/crystal_echo_red.png",
  "./assets/images/characters/crystal_echo_clear.png",
  "./assets/images/characters/crystal_echo_yellow.png",
];

let preloadedImages = [];

function preloadCrystalImages() {
  preloadedImages = crystalImages.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
}
preloadCrystalImages();

// ------------------------------------------------------------
// 🔄 INIT FOR NEW MAP
// ------------------------------------------------------------
export function initCrystalEchoes(mapData) {
  echoes = [];

  if (mapData.crystalEchoes && Array.isArray(mapData.crystalEchoes)) {
    echoes = structuredClone(mapData.crystalEchoes);

    // assign random sprite
    for (const e of echoes) {
      e.img =
        preloadedImages[Math.floor(Math.random() * preloadedImages.length)];
    }
  }

  totalEchoes = echoes.length;

  gameState.exploration = {
    found: 0,
    total: totalEchoes,
    bonusGiven: false,
  };

  updateHUD();
  console.log(`💎 Loaded ${totalEchoes} Crystal Echoes.`);
}

// ------------------------------------------------------------
// 🎨 RENDER + COLLISION
// ------------------------------------------------------------
export function updateCrystalEchoes(ctx, player) {
  const size = 74;

  for (let i = echoes.length - 1; i >= 0; i--) {
    const c = echoes[i];

    // >>> NO MORE PULSING <<<
    ctx.drawImage(
      c.img,
      c.x - size / 2,
      c.y - size / 2,
      size,
      size
    );

    // collection check
    const dx = player.x - c.x;
    const dy = player.y - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 48) {
      collectCrystalEcho(c, i, ctx);
    }
  }
}

// ------------------------------------------------------------
// ✨ COLLECTION + BURST EFFECT
// ------------------------------------------------------------
function collectCrystalEcho(crystal, index, ctx) {
  // Remove echo from list
  echoes.splice(index, 1);

  gameState.exploration.found++;

  // Small XP reward
  awardXP(20);

  // Floating text
  spawnFloatingText("+20 XP", crystal.x, crystal.y - 10, "#DAB4FF");
  playFairySprinkle();

  // HUD refresh
  updateHUD();

  // ⭐ Burst animation
  drawBurstEffect(crystal);

  console.log(
    `💎 Crystal Echo found (${gameState.exploration.found}/${totalEchoes})`
  );

  // final diamond bonus
  if (
    gameState.exploration.found === totalEchoes &&
    !gameState.exploration.bonusGiven
  ) {
    awardCrystalBonus(crystal);
  }
}

// ------------------------------------------------------------
// 🌟 MAGIC BURST EFFECT
// ------------------------------------------------------------
function drawBurstEffect(crystal) {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const x = crystal.x;
  const y = crystal.y;

  const maxRadius = 90;
  const duration = 320;
  const start = performance.now();

  function animate(now) {
    const t = (now - start) / duration;
    if (t > 1) return;

    const radius = maxRadius * t;
    const alpha = 1 - t;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(220, 180, 255, 0.55)";

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

// ------------------------------------------------------------
// 💎 AWARD FINAL BONUS (Double Damage + HUD Flash)
// ------------------------------------------------------------
function awardCrystalBonus(lastCrystal) {
  gameState.exploration.bonusGiven = true;

  // ⭐ NEW — Enable tower double damage system
  gameState.echoPowerActive = true;

  // ⭐ NEW — Flash the crystal HUD circle
  const icon = document.getElementById("hud-crystals-circle");
  if (icon) icon.classList.add("echo-power-flash");

  addDiamonds(100); // fixed to 100 for your design
  updateHUD();

  spawnFloatingText(
    "✨ Exploration Complete! +100 Diamonds ✨",
    lastCrystal.x,
    lastCrystal.y - 40,
    "#FFFFFF"
  );

  console.log("🏆 Exploration bonus awarded: +100 Diamonds");
  console.log("💠 Crystal Echo Power Activated — Towers deal DOUBLE DAMAGE!");
}

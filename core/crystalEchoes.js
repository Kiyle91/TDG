// ============================================================
// 💎 crystalEchoes.js — Exploration Collectibles System
// ------------------------------------------------------------
// • Fixed-position Crystal Echoes (from mapData.crystalEchoes)
// • Collect → XP + Diamonds + sparkle burst effect
// • Random sprite per echo
// • 74px crystals (large & readable)
// • Soft shadow under each crystal
// • Pretty pastel sparkle burst on collect
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
// ✨ SPARKLE BURST STATE
// ------------------------------------------------------------
let sparkleBursts = [];

// Small helper: star-shaped sparkle
function drawStar(ctx, x, y, size, color) {
  const half = size / 2;

  ctx.fillStyle = color;
  ctx.beginPath();

  ctx.moveTo(x, y - size);
  ctx.lineTo(x + half, y + half);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x + half, y - half);
  ctx.lineTo(x, y + size);

  ctx.closePath();
  ctx.fill();
}

// ------------------------------------------------------------
// 🔄 INIT FOR NEW MAP
// ------------------------------------------------------------
export function initCrystalEchoes(mapData) {
  echoes = [];
  sparkleBursts = [];

  if (mapData && mapData.crystalEchoes && Array.isArray(mapData.crystalEchoes)) {
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
  if (!player) return;

  const size = 74;

  for (let i = echoes.length - 1; i >= 0; i--) {
    const c = echoes[i];

    // ---------------------------------------
    // SHADOW (troll-style ellipse)
    // ---------------------------------------
    const SHADOW_W = 26;
    const SHADOW_H = 10;
    const SHADOW_OFFSET = 20;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      c.x,
      c.y + SHADOW_OFFSET,
      SHADOW_W,
      SHADOW_H,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fill();
    ctx.restore();

    // ---------------------------------------
    // CRYSTAL IMAGE
    // ---------------------------------------
    ctx.drawImage(
      c.img,
      c.x - size / 2,
      c.y - size / 2,
      size,
      size
    );

    // ---------------------------------------
    // COLLECTION CHECK
    // ---------------------------------------
    const px = player.pos?.x ?? player.x;
    const py = player.pos?.y ?? player.y;

    const dx = px - c.x;
    const dy = py - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 48) {
      collectCrystalEcho(c, i);
    }
  }
}

// ------------------------------------------------------------
// ✨ COLLECTION + SPARKLE BURST
// ------------------------------------------------------------
function collectCrystalEcho(crystal, index) {
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

  // ⭐ Spawn sparkle burst (particles stored in sparkleBursts)
  spawnSparkleBurst(crystal);

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
// 🌟 SPAWN SPARKLE BURST (particle data only)
// ------------------------------------------------------------
function spawnSparkleBurst(crystal) {
  const x = crystal.x;
  const y = crystal.y;

  const count = 16;
  const colors = [
    "#FFD8FF",
    "#EAD0FF",
    "#D3B7FF",
    "#B7E8FF",
    "#FFF0B3",
  ];

  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;

    particles.push({
      x,
      y,
      size: 8 + Math.random() * 6,
      vx: Math.cos(angle) * (2 + Math.random() * 2.5),
      vy: Math.sin(angle) * (2 + Math.random() * 2.5),
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  sparkleBursts.push({
    particles,
    age: 0,
    duration: 420,
  });
}

// ------------------------------------------------------------
// 🌟 RENDER SPARKLE BURSTS (call from renderGame)
// ------------------------------------------------------------
export function renderSparkleBursts(ctx, delta) {
  if (sparkleBursts.length === 0) return;

  for (let i = sparkleBursts.length - 1; i >= 0; i--) {
    const burst = sparkleBursts[i];
    burst.age += delta;

    const t = burst.age / burst.duration;
    if (t >= 1) {
      sparkleBursts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter"; // glow blend

    for (const p of burst.particles) {
      // Move outward
      p.x += p.vx;
      p.y += p.vy;

      // Fade out
      p.alpha = 1 - t;

      // Rotate
      p.rotation += p.rotationSpeed;

      // Draw star
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      drawStar(ctx, 0, 0, p.size, p.color);

      ctx.restore();
    }

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💎 AWARD FINAL BONUS (Double Damage + HUD Flash)
// ------------------------------------------------------------
function awardCrystalBonus(lastCrystal) {
  gameState.exploration.bonusGiven = true;

  // ⭐ Enable tower double damage system
  gameState.echoPowerActive = true;

  // ⭐ Flash the crystal HUD circle
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

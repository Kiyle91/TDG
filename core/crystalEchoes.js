/* ------------------------------------------------------------
 * MODULE: crystalEchoes.js
 * PURPOSE:
 *   Implements the Crystal Echoes exploration collectible
 *   system used across every campaign map.
 *
 * SUMMARY:
 *   Each map can define fixed Crystal Echo spawn locations
 *   inside its Tiled JSON. This module loads those Echoes,
 *   assigns random crystal sprites, renders them with a soft
 *   shadow, checks for player collision and triggers
 *   a pastel sparkle burst effect. Once all are found, the
 *   “Crystal Echo Power” bonus unlocks — doubling tower damage
 *
 * FEATURES:
 *   • initCrystalEchoes() — load echoes for the current map
 *   • updateCrystalEchoes() — render & handle player pickup
 *   • renderSparkleBursts() — draws burst particles each frame
 *   • Full-screen sparkle effects on collect
 *   • Final reward grants Diamonds + activates Echo Power
 *
 * PROGRESSION NOTES:
 *   The state (found, total, bonusGiven) is stored in
 *   gameState.exploration per map. Echo Power is temporary and
 *   resets each time a new map loads.
 * ------------------------------------------------------------ */


// ============================================================
// 💎 crystalEchoes.js — Exploration Collectibles System
// ------------------------------------------------------------
// • Fixed-position Crystal Echoes from mapData.crystalEchoes
// • Collect for XP + Diamonds + sparkle effect
// • Random sprite assignment per echo
// • Rendered at 74px with soft shadow
// • Beautiful pastel sparkle bursts on collect
// ============================================================

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { addGold, gameState } from "../utils/gameState.js";
import { awardXP } from "./levelSystem.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle } from "./soundtrack.js";
import { updateHUD } from "./ui.js";


// ------------------------------------------------------------
// 🗺️ MODULE-LEVEL VARIABLES
// ------------------------------------------------------------

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
// ✨ SPARKLE BURST DATA
// ------------------------------------------------------------

let sparkleBursts = [];

// Small helper: pastel star
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

  if (mapData && Array.isArray(mapData.crystalEchoes)) {
    echoes = structuredClone(mapData.crystalEchoes);

    for (const e of echoes) {
      e.img = preloadedImages[
        Math.floor(Math.random() * preloadedImages.length)
      ];
    }
  }

  totalEchoes = echoes.length;

  gameState.exploration = {
    found: 0,
    total: totalEchoes,
    bonusGiven: false,
  };

  updateHUD();
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
    // SHADOW
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

    ctx.drawImage(c.img, c.x - size / 2, c.y - size / 2, size, size);

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
// ✨ COLLECTION HANDLER
// ------------------------------------------------------------

function collectCrystalEcho(crystal, index) {
  echoes.splice(index, 1);

  gameState.exploration.found++;


  spawnFloatingText("+5 XP", crystal.x, crystal.y - 10, "#DAB4FF");
  
  playFairySprinkle();

  addGold (5);
  awardXP(5);

  updateHUD();

  // Sparkles
  spawnSparkleBurst(crystal);

  // final map reward
  if (
    gameState.exploration.found === totalEchoes &&
    !gameState.exploration.bonusGiven
  ) {
    awardCrystalBonus(crystal);
  }
}

// ------------------------------------------------------------
// 🌟 SPAWN SPARKLE BURST
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
// 🌟 RENDER SPARKLE BURSTS
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
    ctx.globalCompositeOperation = "lighter";

    for (const p of burst.particles) {
      p.x += p.vx;
      p.y += p.vy;

      p.alpha = 1 - t;
      p.rotation += p.rotationSpeed;

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
// 💎 FINAL BONUS: DOUBLE DAMAGE + DIAMONDS
// ------------------------------------------------------------

function awardCrystalBonus(lastCrystal) {
  gameState.exploration.bonusGiven = true;


  // Enable tower double-damage mode
  gameState.echoPowerActive = true;

  const goldEl = document.getElementById("gold-display");
  if (goldEl) goldEl.classList.add("gold-glow");

  const icon = document.getElementById("hud-crystals-circle");
  if (icon) icon.classList.add("echo-power-flash");

  updateHUD();

  spawnFloatingText(
    "✨ Exploration Complete! ✨",
    lastCrystal.x,
    lastCrystal.y - 40,
    "#FFFFFF"
  );
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

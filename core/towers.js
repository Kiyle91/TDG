// ============================================================
// 💎 towers.js — Olivia’s World: Crystal Keep (Crystal Defender Modular)
// ------------------------------------------------------------
// ✦ Each tower defines its own projectileType
// ✦ Crystal Defender → uses 'crystal'
// ✦ Future towers: flame / frost / arcane etc.
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";

let turretIdle = null;
let turretActive = null;
let towers = [];

// ------------------------------------------------------------
// 🌷 LOAD IMAGES
// ------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadTowerSprites() {
  turretIdle = await loadImage("./assets/images/turrets/basic_turret.png");
  turretActive = await loadImage("./assets/images/turrets/basic_turret_active.png");
  console.log("🏰 Crystal Defender sprites loaded (idle + active).");
}

// ------------------------------------------------------------
// 🌸 INITIALIZATION
// ------------------------------------------------------------
export async function initTowers() {
  towers = [];
  await loadTowerSprites();

  // ✨ Crystal Defender
  towers.push({
    name: "Crystal Defender",
    type: "basic_turret",
    projectileType: "crystal", // 🩵 important!
    x: 5 * 64 + 32,
    y: 4 * 64 + 32,
    cooldown: 0,
    activeFrameTimer: 0,
  });

  console.log(`🏹 ${towers.length} tower(s) initialized.`);
}

// ------------------------------------------------------------
// 🕒 UPDATE TOWERS
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

  towers.forEach((tower) => {
    tower.cooldown -= dt;
    if (tower.activeFrameTimer > 0) tower.activeFrameTimer -= delta;

    if (tower.cooldown <= 0) {
      const target = enemies.find((e) => {
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        return e.alive && dist <= TOWER_RANGE;
      });

      if (target) {
        spawnProjectile(tower.x, tower.y, target, tower.projectileType);
        tower.cooldown = 800 / 1000;
        tower.activeFrameTimer = 200;
      }
    }
  });
}

// ------------------------------------------------------------
// 🎨 DRAW TOWERS (unchanged from before, shortened)
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  towers.forEach((tower) => {
    const img = tower.activeFrameTimer > 0 ? turretActive : turretIdle;
    if (!img) return;

    const size = 96;
    const verticalOffset = size * 0.10;
    const drawX = tower.x - size / 2;
    const drawY = tower.y - size / 2 + verticalOffset;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(tower.x, tower.y + size * 0.38, size * 0.25, size * 0.10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, drawX, drawY, size, size);
    ctx.restore();
  });
}

export function getTowers() {
  return towers;
}

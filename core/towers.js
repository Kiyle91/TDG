// ============================================================
// 💎 towers.js — Olivia’s World: Crystal Keep (Crystal Defender XL + Refined Shadow)
// ------------------------------------------------------------
// ✦ Crystal Defender tower visuals + targeting + firing
// ✦ Enlarged to 96px with smaller, softer shadow
// ✦ Idle / Active frames from ./assets/images/turrets/
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";

// ------------------------------------------------------------
// 🖼️ SPRITES
// ------------------------------------------------------------
let turretIdle = null;
let turretActive = null;

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
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

  towers.push({
    name: "Crystal Defender",
    x: 5 * 64 + 32,
    y: 4 * 64 + 32,
    cooldown: 0,
    activeFrameTimer: 0,
  });

  console.log(`🏹 ${towers.length} Crystal Defender tower(s) initialized.`);
}

// ------------------------------------------------------------
// 🕒 UPDATE TOWERS — TARGETING & FIRING
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
        spawnProjectile(tower.x, tower.y, target);
        tower.cooldown = 800 / 1000;
        tower.activeFrameTimer = 200;
      }
    }
  });
}

// ------------------------------------------------------------
// 🎨 DRAW TOWERS — 96px size + compact shadow
// ------------------------------------------------------------
// ------------------------------------------------------------
// 🎨 DRAW TOWERS — 96px size + compact shadow + lowered 10%
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  towers.forEach((tower) => {
    const img = tower.activeFrameTimer > 0 ? turretActive : turretIdle;
    if (!img) return;

    const size = 96;
    const drawX = tower.x - size / 2;
    const verticalOffset = size * 0.10; // 🔻 move down 10%
    const drawY = tower.y - size / 2 + verticalOffset;

    ctx.save();

    // 🩶 Smaller, softer shadow (unchanged)
    ctx.beginPath();
    ctx.ellipse(
      tower.x,
      tower.y + size * 0.38,
      size * 0.25,
      size * 0.10,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, drawX, drawY, size, size);

    ctx.restore();
  });
}


// ------------------------------------------------------------
// 🔍 ACCESSOR
// ------------------------------------------------------------
export function getTowers() {
  return towers;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

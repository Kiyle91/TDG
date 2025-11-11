// ============================================================
// 💎 towers.js — Olivia’s World: Crystal Keep (Durability System Final)
// ------------------------------------------------------------
// ✦ Crystal Defender tower visuals + targeting + firing
// ✦ Each tower lasts 10 attacks before breaking
// ✦ Fade-out & removal effect when destroyed
// ✦ No more auto-spawn test tower
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";
import { spawnFloatingText } from "./floatingText.js";

let turretIdle = null;
let turretActive = null;
let towers = [];

const MAX_ATTACKS = 10; // 🔥 durability limit
const FIRE_RATE_MS = 800; // firing delay
const FADE_SPEED = 2; // fade multiplier
const TOWER_SIZE = 96;

// ------------------------------------------------------------
// 🖼️ IMAGE LOADING
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
  console.log("🏹 Tower system initialized (no test towers).");
}

// ------------------------------------------------------------
// ➕ ADD A NEW TOWER
// ------------------------------------------------------------
export function addTower(data) {
  towers.push({
    ...data,
    cooldown: 0,
    activeFrameTimer: 0,
    attacksDone: 0,
    fadeOut: 0,
  });
}

// ------------------------------------------------------------
// 🕒 UPDATE TOWERS — Targeting, Firing, and Durability
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

  for (let i = towers.length - 1; i >= 0; i--) {
    const tower = towers[i];

    // Handle destruction fade
    if (tower.fadeOut > 0) {
      tower.fadeOut -= dt * FADE_SPEED;
      if (tower.fadeOut <= 0) {
        towers.splice(i, 1);
        continue;
      }
      continue;
    }

    // Cooldown timers
    tower.cooldown -= dt;
    if (tower.activeFrameTimer > 0) tower.activeFrameTimer -= delta;

    // Fire if ready
    if (tower.cooldown <= 0) {
      const target = enemies.find((e) => {
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        return e.alive && dist <= TOWER_RANGE;
      });

      if (target) {
        spawnProjectile(tower.x, tower.y, target);
        tower.cooldown = FIRE_RATE_MS / 1000;
        tower.activeFrameTimer = 200;
        tower.attacksDone++;

        // 💥 Durability check
        if (tower.attacksDone >= MAX_ATTACKS) {
          tower.fadeOut = 1;
          spawnFloatingText(tower.x, tower.y - 30, "💥 Broken!", "#ff6fb1");
          console.log(`💔 ${tower.name} destroyed after ${tower.attacksDone} attacks.`);
        }
      }
    }
  }
}

// ------------------------------------------------------------
// 🎨 DRAW TOWERS — Sprite Rendering + Fade Out
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  towers.forEach((tower) => {
    const img = tower.activeFrameTimer > 0 ? turretActive : turretIdle;
    if (!img) return;

    const drawX = tower.x - TOWER_SIZE / 2;
    const drawY = tower.y - TOWER_SIZE / 2 + TOWER_SIZE * 0.1;

    ctx.save();
    ctx.globalAlpha = tower.fadeOut > 0 ? tower.fadeOut : 1;

    // Soft shadow
    ctx.beginPath();
    ctx.ellipse(
      tower.x,
      tower.y + TOWER_SIZE * 0.35,
      TOWER_SIZE * 0.25,
      TOWER_SIZE * 0.1,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, drawX, drawY, TOWER_SIZE, TOWER_SIZE);

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

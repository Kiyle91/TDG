// ============================================================
// 💎 towers.js — Olivia's World: Crystal Keep (OPTIMIZED Edition)
//    (Elemental Projectiles + Smart Targeting + Performance Boost)
// ------------------------------------------------------------
// ✔ Frost / Flame now projectile-based (no AoE lag)
// ✔ Heal turret sends a HEAL PROJECTILE at player.pos.x/y
// ✔ Frost slows ON HIT, Flame burns ON HIT, Moon knockback ON HIT
// ✔ Arcane long-range
// ✔ Smart targeting, durability fade, shadows intact
// ✔ 🆕 PERFORMANCE OPTIMIZATIONS:
//    - Cached distance calculations (squared distance)
//    - Throttled targeting updates (every 200ms instead of 16ms)
//    - Optimized nearest-enemy algorithm
//    - Reduced redundant sprite lookups
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";
import { getWorg } from "./worg.js";
import { spawnFloatingText } from "./floatingText.js";
import { gameState } from "../utils/gameState.js";

let turretSprites = {};
let towers = [];

const MAX_ATTACKS = 150;
const FIRE_RATE_MS = 800;
const FADE_SPEED = 2;
const TOWER_SIZE = 96;

// 🆕 Performance optimization: Throttle targeting updates
const TARGET_UPDATE_INTERVAL = 200; // Update targets every 200ms instead of every frame

// ------------------------------------------------------------
// LOAD IMAGES
// ------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadTowerSprites() {
  const list = ["basic", "frost", "flame", "arcane", "light", "moon"];
  for (const t of list) {
    turretSprites[t] = {
      idle: await loadImage(`./assets/images/turrets/${t}_turret.png`),
      active: await loadImage(`./assets/images/turrets/${t}_turret_active.png`),
    };
  }
  console.log("🰰 Tower sprites loaded:", Object.keys(turretSprites).length);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
export async function initTowers() {
  towers = [];
  await loadTowerSprites();
  console.log("🹹 Tower system initialized (optimized).");
}

// ------------------------------------------------------------
// ADD TOWER
// ------------------------------------------------------------
export function addTower(data) {
  towers.push({
    ...data,
    cooldown: 0,
    activeFrameTimer: 0,
    attacksDone: 0,
    fadeOut: 0,
    lastTargetUpdate: 0, // 🆕 Track when we last searched for targets
    cachedTarget: null,  // 🆕 Cache the current target
  });
}

// ------------------------------------------------------------
// 🆕 OPTIMIZED NEAREST ENEMY FINDER (uses squared distance)
// ------------------------------------------------------------
function findNearestEnemy(tower, enemies, range) {
  let closest = null;
  let minDistSq = range * range; // Use squared distance for speed

  for (const e of enemies) {
    if (!e.alive) continue;
    
    const dx = tower.x - e.x;
    const dy = tower.y - e.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closest = e;
    }
  }
  
  return closest;
}

// ------------------------------------------------------------
// UPDATE TOWERS
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;

  // 🆕 Get combined target list ONCE per frame (not per tower)
  const combinedEnemies = [...getEnemies(), ...getWorg()];

  for (let i = towers.length - 1; i >= 0; i--) {
    const tower = towers[i];

    // fade out & removal
    if (tower.fadeOut > 0) {
      tower.fadeOut -= dt * FADE_SPEED;
      if (tower.fadeOut <= 0) {
        towers.splice(i, 1);
        continue;
      }
      continue;
    }

    tower.cooldown -= dt;
    if (tower.activeFrameTimer > 0) {
      tower.activeFrameTimer -= delta;
    }

    if (tower.cooldown > 0) continue;

    // 🆕 Throttled target acquisition (every 200ms instead of every frame)
    tower.lastTargetUpdate = (tower.lastTargetUpdate || 0) + delta;
    
    if (tower.lastTargetUpdate >= TARGET_UPDATE_INTERVAL) {
      tower.lastTargetUpdate = 0;
      
      // Update cached target based on tower type
      switch (tower.type) {
        case "basic_turret":
          tower.cachedTarget = findNearestEnemy(tower, combinedEnemies, TOWER_RANGE);
          break;
        case "frost_turret":
          tower.cachedTarget = findNearestEnemy(tower, combinedEnemies, TOWER_RANGE * 0.9);
          break;
        case "flame_turret":
          tower.cachedTarget = findNearestEnemy(tower, combinedEnemies, TOWER_RANGE * 0.9);
          break;
        case "arcane_turret":
          tower.cachedTarget = findNearestEnemy(tower, combinedEnemies, TOWER_RANGE * 1.5);
          break;
        case "light_turret":
          // Light tower targets player
          const player = gameState.player;
          if (player && player.pos) {
            const dx = player.pos.x - tower.x;
            const dy = player.pos.y - tower.y;
            const distSq = dx * dx + dy * dy;
            const rangeSq = (TOWER_RANGE * 0.8) * (TOWER_RANGE * 0.8);
            tower.cachedTarget = distSq < rangeSq ? player : null;
          }
          break;
        case "moon_turret":
          tower.cachedTarget = findNearestEnemy(tower, combinedEnemies, TOWER_RANGE);
          break;
      }
    }

    // Fire at cached target if still valid
    const target = tower.cachedTarget;
    if (!target) continue;
    
    // Verify target is still alive (cheap check)
    if (target !== gameState.player && !target.alive) {
      tower.cachedTarget = null;
      continue;
    }

    // Execute attack based on tower type
    switch (tower.type) {
      case "basic_turret":
        spawnProjectile(tower.x, tower.y, target, "crystal");
        trigger(tower);
        break;
      case "frost_turret":
        spawnProjectile(tower.x, tower.y, target, "frost");
        trigger(tower);
        break;
      case "flame_turret":
        spawnProjectile(tower.x, tower.y, target, "flame");
        trigger(tower);
        break;
      case "arcane_turret":
        spawnProjectile(tower.x, tower.y, target, "arcane");
        trigger(tower);
        break;
      case "light_turret":
        spawnProjectile(tower.x, tower.y, target, "heal");
        trigger(tower);
        break;
      case "moon_turret":
        spawnProjectile(tower.x, tower.y, target, "moon");
        trigger(tower);
        break;
    }

    if (tower.attacksDone >= MAX_ATTACKS && tower.fadeOut === 0) {
      tower.fadeOut = 1;
      spawnFloatingText(tower.x, tower.y - 30, "💥 Broken!", "#ff6fb1");
    }
  }
}

// ------------------------------------------------------------
// TRIGGER ATTACK
// ------------------------------------------------------------
function trigger(tower) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 200;
  tower.attacksDone++;
}

// ------------------------------------------------------------
// DRAW TOWERS (with optimized sprite selection)
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  for (const tower of towers) {
    // 🆕 Get sprite key once
    const base = tower.type.replace("_turret", "");
    const sprites = turretSprites[base] || turretSprites.basic;
    
    if (!sprites) continue;
    
    const img = tower.activeFrameTimer > 0 ? sprites.active : sprites.idle;

    // Base scale
    let scale = base === "frost" ? 0.85 : 1;
    const baseSize = TOWER_SIZE * scale;

    // Size adjustments
    let size = baseSize;
    if (base === "flame") {
      size = baseSize * 1.30;
    } else if (base === "moon") {
      size = baseSize * 1.1;
    }

    // Position calculations (keep consistent with base)
    const originalDrawY = tower.y - baseSize / 2 + baseSize * 0.1;
    const originalBottom = originalDrawY + baseSize;

    const drawX = tower.x - size / 2;
    const drawY =
      base === "flame" || base === "moon"
        ? originalBottom - size
        : originalDrawY;

    ctx.save();
    ctx.globalAlpha = tower.fadeOut > 0 ? tower.fadeOut : 1;

    // Shadow
    const yoff =
      base === "basic" || base === "frost"
        ? TOWER_SIZE * 0.38
        : TOWER_SIZE * 0.46;

    ctx.beginPath();
    ctx.ellipse(
      tower.x,
      tower.y + yoff,
      TOWER_SIZE * 0.35,
      TOWER_SIZE * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, drawX, drawY, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// ACCESSOR
// ------------------------------------------------------------
export function getTowers() {
  return towers;
}

// ============================================================
// END OF FILE
// ============================================================
// ============================================================
// 💎 towers.js — Olivia’s World: Crystal Keep
//    (Elemental Projectiles + Smart Targeting Edition)
// ------------------------------------------------------------
// ✔ Frost / Flame now projectile-based (no AoE lag)
// ✔ Heal turret sends a HEAL PROJECTILE at player.pos.x/y
// ✔ Frost slows ON HIT
// ✔ Flame burns ON HIT
// ✔ Moon knockback ON HIT
// ✔ Arcane long-range
// ✔ Smart targeting, durability fade, shadows intact
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";
import { spawnFloatingText } from "./floatingText.js";
import { gameState } from "../utils/gameState.js";

let turretSprites = {};
let towers = [];

const MAX_ATTACKS = 25;
const FIRE_RATE_MS = 800;
const FADE_SPEED = 2;
const TOWER_SIZE = 96;

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
  console.log("🏰 Tower sprites loaded:", Object.keys(turretSprites).length);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
export async function initTowers() {
  towers = [];
  await loadTowerSprites();
  console.log("🏹 Tower system initialized.");
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
  });
}


// ------------------------------------------------------------
// UPDATE TOWERS
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

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

    switch (tower.type) {
      case "basic_turret":
        basicAttack(tower, enemies);
        break;
      case "frost_turret":
        frostShot(tower, enemies);
        break;
      case "flame_turret":
        flameShot(tower, enemies);
        break;
      case "arcane_turret":
        arcaneShot(tower, enemies);
        break;
      case "light_turret":
        lightHeal(tower);
        break;
      case "moon_turret":
        moonShot(tower, enemies);
        break;
    }

    if (tower.attacksDone >= MAX_ATTACKS && tower.fadeOut === 0) {
      tower.fadeOut = 1;
      spawnFloatingText(tower.x, tower.y - 30, "💥 Broken!", "#ff6fb1");
    }
  }
}

// ------------------------------------------------------------
// BEHAVIORS
// ------------------------------------------------------------
function basicAttack(tower, enemies) {
  const target = nearest(tower, enemies, TOWER_RANGE);
  if (!target) return;

  spawnProjectile(tower.x, tower.y, target, "crystal");
  trigger(tower);
}

function frostShot(tower, enemies) {
  const target = nearest(tower, enemies, TOWER_RANGE * 0.9);
  if (!target) return;

  spawnProjectile(tower.x, tower.y, target, "frost");
  trigger(tower);
}

function flameShot(tower, enemies) {
  const target = nearest(tower, enemies, TOWER_RANGE * 0.9);
  if (!target) return;

  spawnProjectile(tower.x, tower.y, target, "flame");
  trigger(tower);
}

function arcaneShot(tower, enemies) {
  const target = nearest(tower, enemies, TOWER_RANGE * 1.5);
  if (!target) return;

  spawnProjectile(tower.x, tower.y, target, "arcane");
  trigger(tower);
}

function lightHeal(tower) {
  const player = gameState.player;
  if (!player || !player.pos) return;

  const dist = Math.hypot(player.pos.x - tower.x, player.pos.y - tower.y);
  if (dist > TOWER_RANGE * 0.8) return;

  // ⭐ FIXED heal projectile
  spawnProjectile(tower.x, tower.y, player, "heal");

  
  trigger(tower);
}

function moonShot(tower, enemies) {
  const target = nearest(tower, enemies, TOWER_RANGE);
  if (!target) return;

  spawnProjectile(tower.x, tower.y, target, "moon");
  trigger(tower);
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------
function nearest(tower, enemies, range) {
  let closest = null;
  let min = range;

  for (const e of enemies) {
    if (!e.alive) continue;
    const d = Math.hypot(tower.x - e.x, tower.y - e.y);
    if (d < min) {
      min = d;
      closest = e;
    }
  }
  return closest;
}

function trigger(tower) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 200;
  tower.attacksDone++;
}

// ------------------------------------------------------------
// DRAW TOWERS
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  for (const tower of towers) {
    const base = tower.type.replace("_turret", "");
    const sprites = turretSprites[base] || turretSprites.basic;
    const img = tower.activeFrameTimer > 0 ? sprites.active : sprites.idle;

    // Base scale (frost smaller)
    let scale = base === "frost" ? 0.85 : 1;

    // Original size
    const baseSize = TOWER_SIZE * scale;

    // ============================================
    // SIZE ADJUSTMENTS
    // flame  = +30%
    // moon   = +15%
    // others = default
    // ============================================
    let size = baseSize;

    if (base === "flame") {
      size = baseSize * 1.30;
    } else if (base === "moon") {
      size = baseSize * 1.1;
    }

    // --------------------------------------------------------
    // KEEP BASE POSITION IDENTICAL FOR SCALED TOWERS
    // --------------------------------------------------------
    const originalDrawY = tower.y - baseSize / 2 + baseSize * 0.1;
    const originalBottom = originalDrawY + baseSize;

    const drawX = tower.x - size / 2;
    const drawY =
      base === "flame" || base === "moon"
        ? originalBottom - size
        : originalDrawY;

    ctx.save();
    ctx.globalAlpha = tower.fadeOut > 0 ? tower.fadeOut : 1;

    // shadow
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

    ctx.imageSmoothingEnabled = true;
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

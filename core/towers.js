// ============================================================
// 💎 towers.js — Olivia’s World: Crystal Keep (Elemental VFX Edition)
// ------------------------------------------------------------
// ✦ Supports all 6 turret types (basic, frost, flame, arcane, light, moon)
// ✦ Adds Frost + Flame AoE pulse rings with soft expansion
// ✦ Each turret has unique attack logic
// ✦ Includes fade-out durability & smooth drawing
// ============================================================

import { TOWER_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";
import { spawnFloatingText } from "./floatingText.js";
import { gameState } from "../utils/gameState.js";

let turretSprites = {};
let towers = [];
let pulseRings = []; // 🌈 stores active AoE ring animations

// ⚙️ CONFIG
const MAX_ATTACKS = 10;
const FIRE_RATE_MS = 800;
const FADE_SPEED = 2;
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
  const list = ["basic", "frost", "flame", "arcane", "light", "moon"];
  for (const t of list) {
    turretSprites[t] = {
      idle: await loadImage(`./assets/images/turrets/${t}_turret.png`),
      active: await loadImage(`./assets/images/turrets/${t}_turret_active.png`),
    };
  }
  console.log("🏰 All turret sprites loaded:", Object.keys(turretSprites).length);
}

// ------------------------------------------------------------
// 🌸 INITIALIZATION
// ------------------------------------------------------------
export async function initTowers() {
  towers = [];
  pulseRings = [];
  await loadTowerSprites();
  console.log("🏹 Tower system initialized.");
}

// ------------------------------------------------------------
// ➕ ADD TOWER
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
// 🧠 UPDATE TOWERS — Elemental Behavior Handling
// ------------------------------------------------------------
export function updateTowers(delta) {
  const dt = delta / 1000;
  const enemies = getEnemies();

  // Update tower behaviors
  for (let i = towers.length - 1; i >= 0; i--) {
    const tower = towers[i];

    // 💨 Fade-out & removal
    if (tower.fadeOut > 0) {
      tower.fadeOut -= dt * FADE_SPEED;
      if (tower.fadeOut <= 0) {
        towers.splice(i, 1);
        continue;
      }
      continue;
    }

    tower.cooldown -= dt;
    if (tower.activeFrameTimer > 0) tower.activeFrameTimer -= delta;

    // 🎯 Fire when ready
    if (tower.cooldown <= 0) {
      switch (tower.type) {
        case "basic_turret": handleBasicAttack(tower, enemies); break;
        case "frost_turret": handleFrostPulse(tower, enemies); break;
        case "flame_turret": handleFlamePulse(tower, enemies); break;
        case "arcane_turret": handleArcaneAttack(tower, enemies); break;
        case "light_turret": handleLightAura(tower, enemies); break;
        case "moon_turret": handleMoonBolt(tower, enemies); break;
      }

      // 💥 Durability check
      if (tower.attacksDone >= MAX_ATTACKS) {
        tower.fadeOut = 1;
        spawnFloatingText(tower.x, tower.y - 30, "💥 Broken!", "#ff6fb1");
        console.log(`💔 ${tower.name} destroyed after ${tower.attacksDone} attacks.`);
      }
    }
  }

  // Update AoE pulse animations
  updatePulseRings(dt);
}

// ------------------------------------------------------------
// 🎯 ELEMENTAL BEHAVIORS
// ------------------------------------------------------------

// 🌸 Basic — Crystal Defender
function handleBasicAttack(tower, enemies) {
  const target = findNearestEnemy(tower, enemies, TOWER_RANGE);
  if (target) {
    spawnProjectile(tower.x, tower.y, target, "crystal");
    triggerTowerAttack(tower);
  }
}

// ❄️ Frost — AoE slow pulse + ring VFX
function handleFrostPulse(tower, enemies) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 300;
  tower.attacksDone++;

  const radius = TOWER_RANGE * 0.8;
  const slowed = enemies.filter(e => e.alive && distance(tower, e) <= radius);
  slowed.forEach(e => {
    e.slowTimer = 2000; // slow for 2s
    e.speed *= 0.5;
  });

  spawnFloatingText(tower.x, tower.y - 20, "❄️ Freeze Pulse!", "#77ccff");

  // Add visual pulse ring
  pulseRings.push({
    x: tower.x,
    y: tower.y,
    color: "rgba(120, 200, 255, 0.35)",
    radius: 0,
    maxRadius: radius,
    life: 1,
  });
}

// 🔥 Flame — AoE burn DoT + ring VFX
function handleFlamePulse(tower, enemies) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 300;
  tower.attacksDone++;

  const radius = TOWER_RANGE * 0.7;
  const burned = enemies.filter(e => e.alive && distance(tower, e) <= radius);
  burned.forEach(e => {
    e.burnTimer = 3000;
    e.burnDamage = 3;
  });

  spawnFloatingText(tower.x, tower.y - 20, "🔥 Flame Burst!", "#ff8844");

  pulseRings.push({
    x: tower.x,
    y: tower.y,
    color: "rgba(255, 120, 80, 0.35)",
    radius: 0,
    maxRadius: radius,
    life: 1,
  });
}

// 💜 Arcane — Long range heavy projectile
function handleArcaneAttack(tower, enemies) {
  const target = findNearestEnemy(tower, enemies, TOWER_RANGE * 1.5);
  if (target) {
    spawnProjectile(tower.x, tower.y, target, "arcane");
    triggerTowerAttack(tower);
  }
}

// 💛 Light — Heal player nearby
function handleLightAura(tower, enemies) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 400;
  tower.attacksDone++;

  const player = gameState.player;
  if (!player) return;
  const dist = Math.hypot(player.pos.x - tower.x, player.pos.y - tower.y);
  if (dist <= TOWER_RANGE * 0.8) {
    player.hp = Math.min(player.maxHp, player.hp + 5);
    spawnFloatingText(tower.x, tower.y - 20, "✨ Heal!", "#ffee88");
  }
}

// 🌙 Moon — Knockback projectile
function handleMoonBolt(tower, enemies) {
  const target = findNearestEnemy(tower, enemies, TOWER_RANGE);
  if (target) {
    target.knockback = 15;
    spawnProjectile(tower.x, tower.y, target, "moon");
    triggerTowerAttack(tower);
  }
}

// ------------------------------------------------------------
// 🪶 Shared helpers
// ------------------------------------------------------------
function findNearestEnemy(tower, enemies, range) {
  let closest = null;
  let minDist = range;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = distance(tower, e);
    if (d < minDist) {
      minDist = d;
      closest = e;
    }
  }
  return closest;
}

function triggerTowerAttack(tower) {
  tower.cooldown = FIRE_RATE_MS / 1000;
  tower.activeFrameTimer = 200;
  tower.attacksDone++;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ------------------------------------------------------------
// 🌈 AOE PULSE RINGS — visual animation logic
// ------------------------------------------------------------
function updatePulseRings(dt) {
  for (let i = pulseRings.length - 1; i >= 0; i--) {
    const ring = pulseRings[i];
    ring.radius += dt * 200; // expand speed
    ring.life -= dt * 1.5;   // fade speed
    if (ring.life <= 0) pulseRings.splice(i, 1);
  }
}

// ------------------------------------------------------------
// 🎨 DRAW TOWERS + RINGS
// ------------------------------------------------------------
export function drawTowers(ctx) {
  if (!ctx) return;

  // Draw AoE pulse rings first (behind towers)
  pulseRings.forEach(ring => {
    ctx.save();
    ctx.globalAlpha = ring.life;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  });

  // Draw tower sprites
  towers.forEach((tower) => {
    const base = tower.type.replace("_turret", "");
    const spriteSet = turretSprites[base] || turretSprites.basic;
    const img = tower.activeFrameTimer > 0 ? spriteSet.active : spriteSet.idle;
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

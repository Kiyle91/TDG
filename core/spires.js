// ============================================================
// 💎 spires.js — Olivia's World: Crystal Keep (OPTIMIZED Edition)
//    (Elemental Projectiles + Smart Targeting + Performance Boost)
// ------------------------------------------------------------
// ✔ Frost / Flame now projectile-based (no AoE lag)
// ✔ Heal spire sends a HEAL PROJECTILE at player.pos.x/y
// ✔ Frost slows ON HIT, Flame burns ON HIT, Moon knockback ON HIT
// ✔ Arcane long-range
// ✔ Smart targeting, durability fade, shadows intact
// ✔ 🆕 PERFORMANCE OPTIMIZATIONS:
//    - Cached distance calculations (squared distance)
//    - Throttled targeting updates (every 200ms instead of 16ms)
//    - Optimized nearest-enemy algorithm
//    - Reduced redundant sprite lookups
// ============================================================

import { SPIRE_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getEnemies } from "./enemies.js";
import { getWorg } from "./worg.js";
import { spawnFloatingText } from "./floatingText.js";
import { gameState } from "../utils/gameState.js";
import { getTrolls } from "./troll.js";
import { getCrossbows } from "./crossbow.js";

let spireSprites = {};
let spires = [];

const MAX_ATTACKS = 150;
const FIRE_RATE_MS = 800;
const FADE_SPEED = 2;
const SPIRE_SIZE = 96;

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

async function loadSpireSprites() {
  const list = ["basic", "frost", "flame", "arcane", "light", "moon"];
  for (const t of list) {
    spireSprites[t] = {
      idle: await loadImage(`./assets/images/spires/${t}_spire.png`),
      active: await loadImage(`./assets/images/spires/${t}_spire_active.png`),
    };
  }
  console.log("🰰 Spire sprites loaded:", Object.keys(spireSprites).length);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
export async function initSpires() {
  spires = [];
  await loadSpireSprites();
  console.log("🹹 Spire system initialized (optimized).");
}

// ------------------------------------------------------------
// ADD SPIRE
// ------------------------------------------------------------
export function addSpire(data) {
  spires.push({
    ...data,
    cooldown: 0,
    activeFrameTimer: 0,
    attacksDone: 0,
    fadeOut: 0,
    lastTargetUpdate: 0,
    cachedTarget: null,
  });
}

// ------------------------------------------------------------
// 🆕 OPTIMIZED NEAREST ENEMY FINDER (uses squared distance)
// ------------------------------------------------------------
function findNearestEnemy(spire, enemies, range) {
  let closest = null;
  let minDistSq = range * range;

  for (const e of enemies) {
    if (!e.alive) continue;

    const dx = spire.x - e.x;
    const dy = spire.y - e.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistSq) {
      minDistSq = distSq;
      closest = e;
    }
  }

  return closest;
}

// ------------------------------------------------------------
// UPDATE SPIRES
// ------------------------------------------------------------
export function updateSpires(delta) {
  const dt = delta / 1000;

  const combinedEnemies = [...getEnemies(), ...getWorg(), ...getElites(), ...getTrolls(), ...getCrossbows()];

  for (let i = spires.length - 1; i >= 0; i--) {
    const spire = spires[i];

    if (spire.fadeOut > 0) {
      spire.fadeOut -= dt * FADE_SPEED;
      if (spire.fadeOut <= 0) {
        spires.splice(i, 1);
        continue;
      }
      continue;
    }

    spire.cooldown -= dt;
    if (spire.activeFrameTimer > 0) {
      spire.activeFrameTimer -= delta;
    }

    if (spire.cooldown > 0) continue;

    spire.lastTargetUpdate = (spire.lastTargetUpdate || 0) + delta;

    if (spire.lastTargetUpdate >= TARGET_UPDATE_INTERVAL) {
      spire.lastTargetUpdate = 0;

      switch (spire.type) {
        case "basic_spire":
          spire.cachedTarget = findNearestEnemy(spire, combinedEnemies, SPIRE_RANGE);
          break;
        case "frost_spire":
          spire.cachedTarget = findNearestEnemy(spire, combinedEnemies, SPIRE_RANGE * 0.9);
          break;
        case "flame_spire":
          spire.cachedTarget = findNearestEnemy(spire, combinedEnemies, SPIRE_RANGE * 0.9);
          break;
        case "arcane_spire":
          spire.cachedTarget = findNearestEnemy(spire, combinedEnemies, SPIRE_RANGE * 1.5);
          break;
        case "light_spire":
          const player = gameState.player;
          if (player && player.pos) {
            const dx = player.pos.x - spire.x;
            const dy = player.pos.y - spire.y;
            const distSq = dx * dx + dy * dy;
            const rangeSq = (SPIRE_RANGE * 0.8) ** 2;
            spire.cachedTarget = distSq < rangeSq ? player : null;
          }
          break;
        case "moon_spire":
          spire.cachedTarget = findNearestEnemy(spire, combinedEnemies, SPIRE_RANGE);
          break;
      }
    }

    const target = spire.cachedTarget;
    if (!target) continue;

    if (target !== gameState.player && !target.alive) {
      spire.cachedTarget = null;
      continue;
    }

    switch (spire.type) {
      case "basic_spire":
        spawnProjectile(spire.x, spire.y, target, "crystal");
        trigger(spire);
        break;
      case "frost_spire":
        spawnProjectile(spire.x, spire.y, target, "frost");
        trigger(spire);
        break;
      case "flame_spire":
        spawnProjectile(spire.x, spire.y, target, "flame");
        trigger(spire);
        break;
      case "arcane_spire":
        spawnProjectile(spire.x, spire.y, target, "arcane");
        trigger(spire);
        break;
      case "light_spire":
        spawnProjectile(spire.x, spire.y, target, "heal");
        trigger(spire);
        break;
      case "moon_spire":
        spawnProjectile(spire.x, spire.y, target, "moon");
        trigger(spire);
        break;
    }

    if (spire.attacksDone >= MAX_ATTACKS && spire.fadeOut === 0) {
      spire.fadeOut = 1;
      spawnFloatingText(spire.x, spire.y - 30, "💥 Broken!", "#ff6fb1");
    }
  }
}

// ------------------------------------------------------------
// TRIGGER ATTACK
// ------------------------------------------------------------
function trigger(spire) {
  spire.cooldown = FIRE_RATE_MS / 1000;
  spire.activeFrameTimer = 200;
  spire.attacksDone++;
}

// ------------------------------------------------------------
// DRAW SPIRES (with optimized sprite selection)
// ------------------------------------------------------------
export function drawSpires(ctx) {
  if (!ctx) return;

  for (const spire of spires) {
    const base = spire.type.replace("_spire", "");
    const sprites = spireSprites[base] || spireSprites.basic;

    if (!sprites) continue;

    const img = spire.activeFrameTimer > 0 ? sprites.active : sprites.idle;

    let scale = base === "frost" ? 0.85 : 1;
    const baseSize = SPIRE_SIZE * scale;

    let size = baseSize;
    if (base === "flame") {
      size = baseSize * 1.30;
    } else if (base === "moon") {
      size = baseSize * 1.1;
    }

    const originalDrawY = spire.y - baseSize / 2 + baseSize * 0.1;
    const originalBottom = originalDrawY + baseSize;

    const drawX = spire.x - size / 2;
    const drawY =
      base === "flame" || base === "moon"
        ? originalBottom - size
        : originalDrawY;

    ctx.save();
    ctx.globalAlpha = spire.fadeOut > 0 ? spire.fadeOut : 1;

    // Shadow
    const yoff =
      base === "basic" || base === "frost"
        ? SPIRE_SIZE * 0.38
        : SPIRE_SIZE * 0.46;

    ctx.beginPath();
    ctx.ellipse(
      spire.x,
      spire.y + yoff,
      SPIRE_SIZE * 0.35,
      SPIRE_SIZE * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // ⭐ NEW — Crystal Echo Power Aura
    if (gameState.echoPowerActive) {
      const auraRadius = size * 0.55;

      const gradient = ctx.createRadialGradient(
        spire.x, spire.y, 0,
        spire.x, spire.y, auraRadius
      );

      gradient.addColorStop(0, "rgba(220, 180, 255, 0.55)");
      gradient.addColorStop(0.6, "rgba(200, 150, 255, 0.25)");
      gradient.addColorStop(1, "rgba(200, 150, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(spire.x, spire.y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, drawX, drawY, size, size);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// ACCESSOR
// ------------------------------------------------------------
export function getSpires() {
  return spires;
}

// ============================================================
// END OF FILE
// ============================================================

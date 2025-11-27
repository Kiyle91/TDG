// ============================================================
// 💎 spires.js — Optimized Multi-Spire Combat Engine
// ============================================================
/* ------------------------------------------------------------
 * MODULE: spires.js
 * PURPOSE:
 *   Full management system for all placed spires (towers).
 *   Handles projectiles, targeting, sprite rendering,
 *   fade-out destruction, and optimized enemy scanning.
 *
 * DESIGN NOTES:
 *   • Targeting updates throttled (200ms)
 *   • Distance checks squared for performance
 *   • Each spire has limited durability (MAX_ATTACKS)
 *   • Crystal Echo Power adds aura + double damage
 *   • NEW: Echo mode adds colored pulse rings per spire type
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------ 

import { SPIRE_RANGE } from "../utils/constants.js";
import { spawnProjectile } from "./projectiles.js";
import { getGoblins } from "../entities/goblin.js";
import { getGoblins as getIceGoblins } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins } from "../entities/voidGoblin.js";
import { getWorg } from "../entities/worg.js";
import { getTrolls } from "../entities/troll.js";
import { getCrossbows } from "../entities/crossbow.js";
import { getElites } from "../entities/elite.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// INTERNAL STATE
// ------------------------------------------------------------

let spireSprites = {};
let spires = [];

// Shared enemy cache to avoid per-frame allocations in updateSpires
const combinedEnemiesCache = [];
let enemyCacheTimer = 0;

// 💥 Durability + timing
const MAX_ATTACKS = 50;
const FIRE_RATE_MS = 800;
const FADE_SPEED = 2;
const SPIRE_SIZE = 96;
const TARGET_UPDATE_INTERVAL = 200; // ms
const ENEMY_CACHE_INTERVAL = TARGET_UPDATE_INTERVAL; // reuse targeting cadence

// 🌈 Pulse FX (simple internal list, also exposed for debugging)
const spirePulses = [];
window.__spirePulses = spirePulses;

// ------------------------------------------------------------
// SPIRE TYPE → UPGRADE ID MAP
// ------------------------------------------------------------

const SPIRE_ID_MAP = {
  basic_spire: 1,
  frost_spire: 2,
  flame_spire: 3,
  arcane_spire: 4,
  light_spire: 5,
  moon_spire: 6,
};

function getSpireIdFor(spire) {
  return SPIRE_ID_MAP[spire.type] ?? null;
}

// ------------------------------------------------------------
// ASSET LOADING
// ------------------------------------------------------------

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadSpireSprites() {
  const list = ["basic", "frost", "flame", "arcane", "light", "moon"];

  const spritePromises = list.map(async (t) => {
    const [idle, active] = await Promise.all([
      loadImage(`./assets/images/spires/${t}_spire.png`),
      loadImage(`./assets/images/spires/${t}_spire_active.png`),
    ]);

    spireSprites[t] = { idle, active };
  });

  await Promise.all(spritePromises);
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

export async function initSpires() {
  spires.length = 0;
  spirePulses.length = 0;
  await loadSpireSprites();
}

// ------------------------------------------------------------
// ADD NEW SPIRE
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
// OPTIMIZED NEAREST-ENEMY CALCULATOR
// ------------------------------------------------------------

function findNearestEnemy(spire, enemies, range) {
  let closest = null;
  const maxDistSq = range * range;
  let minDistSq = maxDistSq;

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
// 🌈 SPIRE PULSE FX — spawn + update
// ------------------------------------------------------------

// Per-type color (pastel-y & bright)
function getPulseColorBase(spire) {
  const baseType = spire.type.replace("_spire", ""); // "basic", "frost", etc.

  switch (baseType) {
    case "basic":  return "255,200,255"; // pink crystal
    case "frost":  return "150,200,255"; // icy blue
    case "flame":  return "255,180,120"; // warm flame
    case "arcane": return "210,160,255"; // purple arcane
    case "light":  return "255,240,150"; // golden
    case "moon":   return "210,220,255"; // soft moonlight
    default:       return "255,200,255";
  }
}

function spawnSpirePulse(spire) {
  spirePulses.push({
    x: spire.x,
    y: spire.y,
    age: 0,
    life: 700,         // ms
    startR: 12,
    endR: 95,
    colorBase: getPulseColorBase(spire),
  });
}

function updateSpirePulses(delta) {
  for (let i = spirePulses.length - 1; i >= 0; i--) {
    const p = spirePulses[i];
    p.age += delta;
    if (p.age >= p.life) {
      spirePulses.splice(i, 1);
    }
  }
}

// ------------------------------------------------------------
// UPDATE — targeting + firing + fade-out + pulses
// ------------------------------------------------------------

export function updateSpires(delta) {
  const dt = delta / 1000;

  refreshEnemyCache(delta);

  for (let i = spires.length - 1; i >= 0; i--) {
    const spire = spires[i];

    // Fade-out / destroy
    if (spire.fadeOut > 0) {
      spire.fadeOut -= dt * FADE_SPEED;
      if (spire.fadeOut <= 0) {
        spires.splice(i, 1);
      }
      continue;
    }

    spire.cooldown -= dt;
    if (spire.activeFrameTimer > 0) {
      spire.activeFrameTimer -= delta;
    }

    if (spire.cooldown > 0) continue;

    // Throttled targeting
    spire.lastTargetUpdate += delta;
    if (spire.lastTargetUpdate >= TARGET_UPDATE_INTERVAL) {
      spire.lastTargetUpdate = 0;

      switch (spire.type) {

        // ============================================================
        // VOID-AURA PATCH: Filter out void-protected enemies
        // ============================================================

        case "basic_spire": {
          const filtered = combinedEnemiesCache.filter(e => !e.insideVoidAura);
          spire.cachedTarget = findNearestEnemy(spire, filtered, SPIRE_RANGE);
          break;
        }

        case "frost_spire": {
          const filtered = combinedEnemiesCache.filter(e => !e.insideVoidAura);
          spire.cachedTarget = findNearestEnemy(spire, filtered, SPIRE_RANGE * 0.9);
          break;
        }

        case "flame_spire": {
          const filtered = combinedEnemiesCache.filter(e => !e.insideVoidAura);
          spire.cachedTarget = findNearestEnemy(spire, filtered, SPIRE_RANGE * 0.9);
          break;
        }

        case "arcane_spire": {
          const filtered = combinedEnemiesCache.filter(e => !e.insideVoidAura);
          spire.cachedTarget = findNearestEnemy(spire, filtered, SPIRE_RANGE * 1.5);
          break;
        }

        case "light_spire": {
          const player = gameState.player;
          if (player && player.pos) {
            const dx = player.pos.x - spire.x;
            const dy = player.pos.y - spire.y;
            const distSq = dx * dx + dy * dy;
            const rangeSq = (SPIRE_RANGE * 0.8) ** 2;
            spire.cachedTarget = distSq < rangeSq ? player : null;
          }
          break;
        }

        case "moon_spire": {
          const filtered = combinedEnemiesCache.filter(e => !e.insideVoidAura);
          spire.cachedTarget = findNearestEnemy(spire, filtered, SPIRE_RANGE);
          break;
        }
      }
    }

    const target = spire.cachedTarget;
    if (!target) continue;

    // Target died (for non-player)
    if (target !== gameState.player && !target.alive) {
      spire.cachedTarget = null;
      continue;
    }

    // ============================================================
    // VOID-AURA PATCH: Spire must NOT fire if target protected
    // ============================================================
    if (target.insideVoidAura) {
      spire.cachedTarget = null;
      continue;
    }

    // -------------------------------------------------------------------
    // FIRE PROJECTILE with correct spireId for upgrade system
    // -------------------------------------------------------------------
    const spireId = getSpireIdFor(spire);

    switch (spire.type) {
      case "basic_spire":
        spawnProjectile(spire.x, spire.y, target, "crystal", spireId);
        break;

      case "frost_spire":
        spawnProjectile(spire.x, spire.y, target, "frost", spireId);
        break;

      case "flame_spire":
        spawnProjectile(spire.x, spire.y, target, "flame", spireId);
        break;

      case "arcane_spire":
        spawnProjectile(spire.x, spire.y, target, "arcane", spireId);
        break;

      case "light_spire":
        spawnProjectile(spire.x, spire.y, target, "heal", spireId);
        break;

      case "moon_spire":
        spawnProjectile(spire.x, spire.y, target, "moon", spireId);
        break;
    }

    // 🌈 Extra pulse ONLY while Crystal Echo Power is active
    if (gameState.echoPowerActive) {
      spawnSpirePulse(spire);
    }

    triggerSpire(spire);

    // Durability check
    if (spire.attacksDone >= MAX_ATTACKS && spire.fadeOut === 0) {
      spire.fadeOut = 1;
      spawnFloatingText(spire.x, spire.y - 30, "💥 Broken!", "#ff6fb1");
    }
  }

  // Update pulse ages
  updateSpirePulses(delta);
}

// ------------------------------------------------------------
// INTERNAL: trigger fire animation & cooldown
// ------------------------------------------------------------

function triggerSpire(spire) {
  spire.cooldown = FIRE_RATE_MS / 1000;
  spire.activeFrameTimer = 200;
  spire.attacksDone++;
}

// Refresh global enemy list on a shared interval to reduce allocations
function refreshEnemyCache(delta) {
  enemyCacheTimer += delta;
  if (enemyCacheTimer < ENEMY_CACHE_INTERVAL && combinedEnemiesCache.length) {
    return;
  }

  enemyCacheTimer = 0;
  combinedEnemiesCache.length = 0;

  combinedEnemiesCache.push(
    ...getGoblins(),
    ...getIceGoblins(),
    ...getEmberGoblins(),
    ...getAshGoblins(),
    ...getVoidGoblins(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
  );
}

// ------------------------------------------------------------
// DRAW ALL SPIRES + PULSES
// ------------------------------------------------------------

export function drawSpires(ctx) {
  if (!ctx) return;

  // First: draw pulse rings under the towers
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const p of spirePulses) {
    const t = Math.max(0, Math.min(1, p.age / p.life));
    const r = p.startR + (p.endR - p.startR) * t;
    const alpha = 1 - t;

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${p.colorBase}, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  ctx.restore();

  // Then: draw spires themselves
  for (const spire of spires) {
    const base = spire.type.replace("_spire", "");
    const sprites = spireSprites[base] || spireSprites.basic;
    const img = spire.activeFrameTimer > 0 ? sprites.active : sprites.idle;

    // Size tweaks
    let scale = base === "frost" ? 0.85 : 1;
    let size = SPIRE_SIZE * scale;

    if (base === "flame") size *= 1.30;
    if (base === "moon") size *= 1.10;

    const baseSize = SPIRE_SIZE * scale;
    const baseY = spire.y - baseSize / 2 + baseSize * 0.1;
    const bottom = baseY + baseSize;

    const drawX = spire.x - size / 2;
    const drawY =
      base === "flame" || base === "moon"
        ? bottom - size
        : baseY;

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

    // Crystal Echo Aura
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

    // Shots remaining counter (pastel, outlined)
    const shotsRemaining = Math.max(0, MAX_ATTACKS - (spire.attacksDone ?? 0));
    if (Number.isFinite(shotsRemaining)) {
      ctx.save();
      ctx.font = "18px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Outline for readability
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.strokeText(shotsRemaining, spire.x, drawY - 14);

      // Main text
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillText(shotsRemaining, spire.x, drawY - 14);

      ctx.restore();
    }

    ctx.restore();
  }
}


// ------------------------------------------------------------
// GETTER
// ------------------------------------------------------------

export function getSpires() {
  return spires;
}

// ============================================================
// END OF FILE
// ============================================================

// ============================================================
// 🐺 worg.js — Olivia's World: Crystal Keep
// ------------------------------------------------------------
// ✦ Path-only runner enemy (no attacks)
// ✦ FIXED: Now supports multiple paths
// ✦ Independent damage system + XP/Gold rewards
// ✦ Cached sprite rendering for zero-lag animation
// ============================================================

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold } from "../utils/gameState.js";
import { addBravery } from "../player/bravery.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { awardXP } from "../player/levelSystem.js";
import { updateHUD } from "../screenManagement/ui.js";
import { playGoblinDeath, playGoblinDamage } from "../core/soundtrack.js";
import { slideRect } from "../utils/mapCollision.js";


// ============================================================
// 🧩 INTERNAL STATE
// ============================================================

let worgList = [];
let allPaths = []; // ✅ Changed to store multiple paths
let worgSprites = null;


// ============================================================
// ⚙️ CONFIGURATION
// ============================================================

const WORG_HP = 50;
const WORG_SPEED = 150;
const WORG_SIZE = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT = 900;

const WORG_HITBOX = WORG_SIZE * 0.55;

const WORG_XP_REWARD = 5;
const WORG_GOLD_REWARD = 2;


// ============================================================
// 🖼️ SPRITE LOADER (CACHED & RESIZED)
// ============================================================

async function loadAndCache(src, targetSize = 128) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = targetSize;
      c.height = targetSize;

      const cx = c.getContext("2d");
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = "medium";

      cx.drawImage(
        img,
        0, 0, img.width, img.height,
        0, 0, targetSize, targetSize
      );

      resolve(c);
    };
  });
}


// ============================================================
// 🖼️ LOAD ALL SPRITES
// ============================================================

async function loadWorgSprites() {
  worgSprites = {
    idle: await loadAndCache("./assets/images/sprites/worg/worg_idle.png"),

    run: {
      left: [
        await loadAndCache("./assets/images/sprites/worg/worg_A1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_A2.png"),
      ],
      right: [
        await loadAndCache("./assets/images/sprites/worg/worg_D1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_D2.png"),
      ],
      up: [
        await loadAndCache("./assets/images/sprites/worg/worg_W1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_W2.png"),
      ],
      down: [
        await loadAndCache("./assets/images/sprites/worg/worg_S1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_S2.png"),
      ],
    },

    slain: await loadAndCache("./assets/images/sprites/worg/worg_slain.png"),
  };
}


// ============================================================
// 🔧 INITIALIZE SYSTEM
// ============================================================

// ✅ FIXED: Now accepts array of paths
export async function initWorg(paths) {
  // Handle both single path (legacy) and multiple paths
  if (Array.isArray(paths)) {
    if (paths.length > 0 && Array.isArray(paths[0])) {
      // Multiple paths: [[path1], [path2], ...]
      allPaths = paths;
    } else {
      // Single path: [point1, point2, ...]
      allPaths = [paths];
    }
  } else {
    allPaths = [];
  }
  
  worgList = [];
  await loadWorgSprites();
}

function moveWorgWithCollision(w, dx, dy) {
  const rectSize = WORG_HITBOX;
  const rectX = w.x - rectSize / 2;
  const rectY = w.y - rectSize / 2;
  const moved = slideRect(rectX, rectY, rectSize, rectSize, dx, dy, { ignoreBounds: true });
  w.x = moved.x + rectSize / 2;
  w.y = moved.y + rectSize / 2;
  return moved;
}


// ============================================================
// 🐺 SPAWN ONE WORG
// ============================================================

// ✅ FIXED: Can now specify which path to use, or random if not specified
export function spawnWorg(pathIndex = null) {
  if (!allPaths.length) {
    console.warn("No paths available for worg spawn");
    return;
  }

  // Choose path: specified index, or random
  let chosenPathIndex = pathIndex;
  if (chosenPathIndex === null || chosenPathIndex >= allPaths.length) {
    chosenPathIndex = Math.floor(Math.random() * allPaths.length);
  }

  const chosenPath = allPaths[chosenPathIndex];
  if (!chosenPath || !chosenPath.length) {
    console.warn(`Invalid path at index ${chosenPathIndex}`);
    return;
  }

  const start = chosenPath[0];

  const w = {
    type: "worg",
    x: start.x,
    y: start.y,
    targetIndex: 0,

    hp: WORG_HP,
    maxHp: WORG_HP,
    alive: true,
    speed: WORG_SPEED,

    dir: "right",
    frame: 0,
    frameTimer: 0,

    flashTimer: 0,
    fade: 0,

    slowTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
    isBurning: false,
    burnTick: 1000,
    stunTimer: 0,

    path: chosenPath,  // ✅ FIXED: Assign the chosen path
    pathIndex: chosenPathIndex, // Track which path this worg is on
  };

  worgList.push(w);
  return w;
}


// ============================================================
// 🔄 UPDATE LOOP
// ============================================================

export function updateWorg(delta = 16) {
  if (!allPaths.length || worgList.length === 0) return;

  const dt = delta / 1000;

  for (let i = worgList.length - 1; i >= 0; i--) {
    const w = worgList[i];

    if (!w.alive) {
      w.fade += delta;
      if (w.fade >= FADE_OUT) worgList.splice(i, 1);
      continue;
    }

    handleWorgElementalEffects(w, dt);

    if (w.flashTimer > 0) {
      w.flashTimer -= delta;
      if (w.flashTimer < 0) w.flashTimer = 0;
    }

    const target = w.path[w.targetIndex];
    if (!target) continue;

    const dx = target.x - w.x;
    const dy = target.y - w.y;
    const dist = Math.hypot(dx, dy);

    const moveSpeed = w.speed * (w.slowTimer > 0 ? 0.5 : 1);
    const step = moveSpeed * dt;

    if (dist <= step) {
      w.x = target.x;
      w.y = target.y;
      w.targetIndex++;

      if (w.targetIndex >= w.path.length) {
        if (gameState.player) {
          if (typeof gameState.player.lives !== "number") {
            gameState.player.lives = 10;
          }
          gameState.player.lives = Math.max(0, gameState.player.lives - 1);
          updateHUD();
        }

        w.alive = false;
        w.fade = 0;
      }
    } else {
      const stepX = (dx / dist) * step;
      const stepY = (dy / dist) * step;
      moveWorgWithCollision(w, stepX, stepY);

      w.dir =
        Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");
    }

    w.frameTimer += delta;
    if (w.frameTimer >= WALK_FRAME_INTERVAL) {
      w.frameTimer = 0;
      w.frame = (w.frame + 1) % 2;
    }
  }
}


// ============================================================
// 🔥 ELEMENTAL EFFECTS
// ============================================================

function handleWorgElementalEffects(w, dt) {
  if (w.slowTimer > 0) w.slowTimer -= dt;

  if (w.isBurning) {
    w.burnTimer -= dt;

    if (!w.burnTick) w.burnTick = 1000;
    w.burnTick -= dt * 1000;

    if (w.burnTick <= 0) {
      w.burnTick = 1000;
      damageWorg(w, w.burnDamage);
    }

    if (w.burnTimer <= 0) {
      w.isBurning = false;
      w.burnDamage = 0;
    }
  }

  if (w.stunTimer > 0) {
    w.stunTimer -= dt;
    if (w.stunTimer < 0) w.stunTimer = 0;
  }
}


// ============================================================
// 💥 DAMAGE HANDLING
// ============================================================

export function damageWorg(w, amount) {
  if (!w || !w.alive) return;

  w.hp -= amount;
  w.flashTimer = 150;

  spawnFloatingText(w.x, w.y - 30, -Math.abs(Math.round(amount)), "#ff5c8a", 18);
  playGoblinDamage();

  if (w.hp <= 0) {
    w.hp = 0;
    w.alive = false;
    w.fade = 0;

    playGoblinDeath();
    awardXP(WORG_XP_REWARD);
    addGold(WORG_GOLD_REWARD);
    addBravery(1);
    updateHUD();
  }
}

export function hitWorg(w, amount) {
  damageWorg(w, amount);
}


// ============================================================
// 🎨 HP BAR
// ============================================================

function drawWorgHpBar(ctx, w) {
  if (!w.alive) return;

  const barWidth = 40;
  const barHeight = 5;
  const offsetY = WORG_SIZE * 0.52;
  const pct = Math.max(0, Math.min(1, w.hp / w.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);

  ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth * pct, barHeight);
}


// ============================================================
// 🖌️ DRAW
// ============================================================

export function drawWorg(ctx) {
  if (!ctx || !worgSprites || worgList.length === 0) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const w of worgList) {
    const img = w.alive
      ? (worgSprites.run[w.dir]?.[w.frame] || worgSprites.idle)
      : worgSprites.slain;

    if (!img) continue;

    let size = WORG_SIZE;
    if (w.dir === "left" || w.dir === "right") size *= 1.15;

    const drawX = w.x - size / 2;
    const drawY = w.y - size / 2;

    ctx.save();

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      w.x,
      w.y + size * 0.45,
      size * 0.32,
      size * 0.13,
      0, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    if (w.flashTimer > 0 && w.alive) {
      const t = w.flashTimer / 150;
      ctx.globalAlpha = 1 - t * 0.3;
    }

    if (!w.alive) {
      ctx.globalAlpha = Math.max(0, 1 - w.fade / FADE_OUT);
    }

    ctx.drawImage(img, drawX, drawY, size, size);

    if (w.isBurning && w.alive) {
      ctx.save();
      const flicker = 0.85 + Math.random() * 0.3;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * flicker;
      ctx.fillStyle = "rgba(255,150,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 * flicker;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y - size * 0.1, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (w.slowTimer > 0 && w.alive) {
      ctx.save();
      const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.15;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * pulse;
      ctx.fillStyle = "rgba(160,200,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, size * 0.38, size * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    drawWorgHpBar(ctx, w);
    ctx.restore();
  }
}


// ============================================================
// 📦 GETTER
// ============================================================

export function getWorg() {
  return worgList;
}

// ✅ NEW: Get available paths count
export function getPathCount() {
  return allPaths.length;
}


// ============================================================
// 🌟 END OF FILE — worg.js
// ============================================================
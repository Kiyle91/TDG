// ============================================================
// 🐺 worg.js — Olivia's World: Crystal Keep (Fully Independent Edition)
// ------------------------------------------------------------
// • Follows the enemy path only (no attacks)
// • Damageable by player + towers/projectiles
// • Small goblin-style HP bar
// • High-quality rendering with cached sprites (zero lag)
// • Hit flash + smooth death fade
// • 🆕 Independent damage system (no dependency on enemies.js)
// • 🆕 Own XP/gold rewards
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";
import {
  playGoblinDeath,
  playGoblinDamage,
} from "./soundtrack.js";

// ------------------------------------------------------------
// 🧩 INTERNAL STATE
// ------------------------------------------------------------
let worgList = [];
let pathPoints = [];
let worgSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const WORG_HP = 175;
const WORG_SPEED = 150;
const WORG_SIZE = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT = 900;

// 🆕 Worg rewards (separate from goblins)
const WORG_XP_REWARD = 25;
const WORG_GOLD_REWARD = 15;

// ------------------------------------------------------------
// 🖼️ SPRITE LOADER (CACHED + RESIZED)
// ------------------------------------------------------------
async function loadAndCache(src, targetSize = 128) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // Create cached canvas
      const c = document.createElement("canvas");
      c.width = targetSize;
      c.height = targetSize;

      const cx = c.getContext("2d");
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = "medium";

      // Draw scaled-down image ONCE
      cx.drawImage(
        img,
        0, 0, img.width, img.height,
        0, 0, targetSize, targetSize
      );

      resolve(c);
    };
  });
}

// ------------------------------------------------------------
// 🖼️ LOAD ALL SPRITES (CACHED)
// ------------------------------------------------------------
async function loadWorgSprites() {
  worgSprites = {
    idle: await loadAndCache("./assets/images/sprites/worg/worg_idle.png"),

    run: {
      left: [
        await loadAndCache("./assets/images/sprites/worg/worg_A1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_A2.png")
      ],
      right: [
        await loadAndCache("./assets/images/sprites/worg/worg_D1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_D2.png")
      ],
      up: [
        await loadAndCache("./assets/images/sprites/worg/worg_W1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_W2.png")
      ],
      down: [
        await loadAndCache("./assets/images/sprites/worg/worg_S1.png"),
        await loadAndCache("./assets/images/sprites/worg/worg_S2.png")
      ]
    },

    slain: await loadAndCache("./assets/images/sprites/worg/worg_slain.png")
  };
}

// ------------------------------------------------------------
// 🔧 INITIALISE
// ------------------------------------------------------------
export async function initWorg(path) {
  pathPoints = path || [];
  worgList = [];
  await loadWorgSprites();
  console.log("🐺 Worg system initialized with cached sprites.");
}

// ------------------------------------------------------------
// 🐺 SPAWN ONE WORG
// ------------------------------------------------------------
export function spawnWorg() {
  if (!pathPoints.length) return;

  const start = pathPoints[0];

  const worg = {
    type: "worg",
    x: start.x,
    y: start.y,
    targetIndex: 1,

    hp: WORG_HP,
    maxHp: WORG_HP,

    alive: true,
    speed: WORG_SPEED,

    dir: "right",
    frame: 0,
    frameTimer: 0,

    flashTimer: 0,
    fade: 0,
    
    // 🆕 Elemental effect support (same as goblins for tower compatibility)
    slowTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
    isBurning: false,
    burnTick: 1000,
    stunTimer: 0
  };

  worgList.push(worg);

  if (typeof window !== "undefined") {
    window.spawnWorg = spawnWorg;
  }

  return worg;
}

// ------------------------------------------------------------
// 🔁 UPDATE
// ------------------------------------------------------------
export function updateWorg(delta = 16) {
  if (!pathPoints.length || !worgList.length) return;

  const dt = delta / 1000;

  for (let i = worgList.length - 1; i >= 0; i--) {
    const w = worgList[i];

    // Dead → fade out
    if (!w.alive) {
      w.fade += delta;
      if (w.fade >= FADE_OUT) {
        worgList.splice(i, 1);
      }
      continue;
    }

    // 🆕 Elemental effects (frost slow, burn DoT)
    handleWorgElementalEffects(w, dt);

    // Hit flash timer
    if (w.flashTimer > 0) {
      w.flashTimer -= delta;
      if (w.flashTimer < 0) w.flashTimer = 0;
    }

    const target = pathPoints[w.targetIndex];
    if (!target) continue;

    const dx = target.x - w.x;
    const dy = target.y - w.y;
    const dist = Math.hypot(dx, dy);

    // Movement (affected by slow)
    if (dist > 1) {
      const moveSpeed = w.speed * (w.slowTimer > 0 ? 0.5 : 1);
      w.x += (dx / dist) * moveSpeed * dt;
      w.y += (dy / dist) * moveSpeed * dt;

      // Direction
      w.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";

    } else {
      // Reached a waypoint
      w.targetIndex++;

      if (w.targetIndex >= pathPoints.length) {
        // Consume a life
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
    }

    // Animation frame cycling
    w.frameTimer += delta;
    if (w.frameTimer >= WALK_FRAME_INTERVAL) {
      w.frameTimer = 0;
      w.frame = (w.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// 🔥 ELEMENTAL EFFECTS (Frost + Flame support)
// ------------------------------------------------------------
function handleWorgElementalEffects(worg, dt) {
  // ❄️ FROST (Slow debuff)
  if (worg.slowTimer > 0) {
    worg.slowTimer -= dt;
  }

  // 🔥 FLAME (Burn DoT)
  if (worg.isBurning) {
    worg.burnTimer -= dt;

    // Apply burn tick damage every 1 second
    if (!worg.burnTick) worg.burnTick = 1000;
    worg.burnTick -= dt * 1000;

    if (worg.burnTick <= 0) {
      worg.burnTick = 1000;   // reset for 1 second
      damageWorg(worg, worg.burnDamage);
    }

    // Burn expired
    if (worg.burnTimer <= 0) {
      worg.isBurning = false;
      worg.burnDamage = 0;
    }
  }

  // 🌙 MOON STUN
  if (worg.stunTimer > 0) {
    worg.stunTimer -= dt;
    if (worg.stunTimer < 0) worg.stunTimer = 0;
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE (Independent system)
// ------------------------------------------------------------
export function damageWorg(worg, amount) {
  if (!worg || !worg.alive) return;
  
  const dmg = Number(amount);
  if (isNaN(dmg) || dmg <= 0) return;

  spawnFloatingText(worg.x, worg.y - 30, -Math.abs(Math.round(dmg)), "#ff5c8a", 18);
  worg.hp -= dmg;
  worg.flashTimer = 150;
  playGoblinDamage();

  if (worg.hp <= 0) {
    worg.hp = 0;
    worg.alive = false;
    worg.fade = 0;
    
    playGoblinDeath();
    
    // 🆕 Award XP and Gold
    awardXP(WORG_XP_REWARD);
    addGold(WORG_GOLD_REWARD);
    updateHUD();
    
    console.log(`🐺 Worg defeated! Awarded ${WORG_XP_REWARD} XP and ${WORG_GOLD_REWARD} gold.`);
  }
}

// Legacy compatibility (towers/projectiles may call hitWorg)
export function hitWorg(worg, amount) {
  damageWorg(worg, amount);
}

// ------------------------------------------------------------
// 🎨 HP BAR
// ------------------------------------------------------------
function drawWorgHpBar(ctx, w) {
  if (!w.alive) return;

  const barWidth = 36;
  const barHeight = 4;
  const offsetY = WORG_SIZE * 0.5 + 8;
  const pct = Math.max(0, Math.min(1, w.hp / w.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);

  const grad = ctx.createLinearGradient(w.x - barWidth / 2, 0, w.x + barWidth / 2, 0);
  grad.addColorStop(0, "#ff6688");
  grad.addColorStop(1, "#ff99bb");
  ctx.fillStyle = grad;
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth * pct, barHeight);

  ctx.strokeStyle = "rgba(255,182,193,0.7)";
  ctx.strokeRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🖌️ DRAW (lag-free cached version with elemental effects)
// ------------------------------------------------------------
export function drawWorg(ctx) {
  if (!ctx || !worgSprites || !worgList.length) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const w of worgList) {
    const img = w.alive
      ? (worgSprites.run[w.dir]?.[w.frame] || worgSprites.idle)
      : worgSprites.slain;

    if (!img) continue;

    // 15% bigger left/right
    let size = WORG_SIZE;
    if (w.dir === "left" || w.dir === "right") size *= 1.15;

    const drawX = w.x - size / 2;
    const drawY = w.y - size / 2;

    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      w.x,
      w.y + size * 0.45,
      size * 0.32,
      size * 0.13,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    // Hit flash
    if (w.flashTimer > 0 && w.alive) {
      const t = w.flashTimer / 150;
      ctx.globalAlpha = 1 - t * 0.3;
    }

    // Fade out on death
    if (!w.alive) {
      ctx.globalAlpha = Math.max(0, 1 - w.fade / FADE_OUT);
    }

    // Draw sprite
    ctx.drawImage(img, drawX, drawY, size, size);

    // ====================================================================
    // 🔥 FIRE EFFECT (burn over time)
    // ====================================================================
    if (w.isBurning && w.alive) {
      ctx.save();

      const flicker = 0.85 + Math.random() * 0.3;

      // Warm tint
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * flicker;
      ctx.fillStyle = "rgba(255,150,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, size * 0.35, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame aura
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 * flicker;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(w.x, w.y - size * 0.1, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ====================================================================
    // ❄ FROST EFFECT (slow debuff)
    // ====================================================================
    if (w.slowTimer > 0 && w.alive) {
      ctx.save();

      const frostPulse = 0.8 + Math.sin(Date.now() / 200) * 0.15;

      // Cool tint (screen blend)
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * frostPulse;
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

// ------------------------------------------------------------
// 📦 GETTER
// ------------------------------------------------------------
export function getWorg() {
  return worgList;
}

// Expose for debugging
if (typeof window !== "undefined") {
  window.getWorg = getWorg;
}
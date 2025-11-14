// ============================================================
// 🐺 worg.js — Olivia’s World: Crystal Keep (Final Polished Build)
// ------------------------------------------------------------
// • Follows the enemy path only (no attacks)
// • Damageable by player + towers/projectiles
// • Small goblin-style HP bar
// • High-quality rendering (no pixelation)
// • Hit flash + smooth death fade
// • Exposed to global scope for targeting (getWorg, spawnWorg)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { damageEnemy } from "./enemies.js";

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

// ------------------------------------------------------------
// 🖼️ SPRITE LOADER
// ------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadWorgSprites() {
  worgSprites = {
    idle: await loadImage("./assets/images/sprites/worg/worg_idle.png"),

    run: {
      left: [
        await loadImage("./assets/images/sprites/worg/worg_A1.png"),
        await loadImage("./assets/images/sprites/worg/worg_A2.png")
      ],
      right: [
        await loadImage("./assets/images/sprites/worg/worg_D1.png"),
        await loadImage("./assets/images/sprites/worg/worg_D2.png")
      ],
      up: [
        await loadImage("./assets/images/sprites/worg/worg_W1.png"),
        await loadImage("./assets/images/sprites/worg/worg_W2.png")
      ],
      down: [
        await loadImage("./assets/images/sprites/worg/worg_S1.png"),
        await loadImage("./assets/images/sprites/worg/worg_S2.png")
      ]
    },

    slain: await loadImage("./assets/images/sprites/worg/worg_slain.png")
  };
}

// ------------------------------------------------------------
// 🔧 INITIALISE
// ------------------------------------------------------------
export async function initWorg(path) {
  pathPoints = path || [];
  worgList = [];
  await loadWorgSprites();
  console.log("🐺 Worg system initialized.");
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
    fade: 0
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

    // Dead → fading
    if (!w.alive) {
      w.fade += delta;
      if (w.fade >= FADE_OUT) {
        worgList.splice(i, 1);
      }
      continue;
    }

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

    // Movement
    if (dist > 1) {
      w.x += (dx / dist) * w.speed * dt;
      w.y += (dy / dist) * w.speed * dt;

      // Animation direction
      w.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";

    } else {
      // Reached waypoint
      w.targetIndex++;

      if (w.targetIndex >= pathPoints.length) {
        // Consume a life
        if (gameState.player) {
          if (typeof gameState.player.lives !== "number") {
            gameState.player.lives = 10;
          }
          gameState.player.lives = Math.max(0, gameState.player.lives - 1);
        }

        w.alive = false;
        w.fade = 0;
      }
    }

    // Animation cycling
    w.frameTimer += delta;
    if (w.frameTimer >= WALK_FRAME_INTERVAL) {
      w.frameTimer = 0;
      w.frame = (w.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function hitWorg(worg, amount) {
  if (!worg || !worg.alive) return;

  damageEnemy(worg, amount);
  worg.flashTimer = 150;

  if (worg.hp <= 0) {
    worg.alive = false;
    worg.fade = 0;
  }
}

// ------------------------------------------------------------
// 🎨 HP BAR (Goblin-style small bar)
// ------------------------------------------------------------
function drawWorgHpBar(ctx, w) {
  if (!w.alive) return;

  const barWidth = 36;
  const barHeight = 4;
  const offsetY = WORG_SIZE * 0.5 + 8;
  const pct = Math.max(0, Math.min(1, w.hp / w.maxHp));

  // Background
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);

  // HP fill (pink gradient)
  const grad = ctx.createLinearGradient(w.x - barWidth / 2, 0, w.x + barWidth / 2, 0);
  grad.addColorStop(0, "#ff6688");
  grad.addColorStop(1, "#ff99bb");
  ctx.fillStyle = grad;
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth * pct, barHeight);

  ctx.strokeStyle = "rgba(255,182,193,0.7)";
  ctx.strokeRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🖌️ DRAW
// ------------------------------------------------------------
export function drawWorg(ctx) {
  if (!ctx || !worgSprites || !worgList.length) return;

  for (const w of worgList) {
    const img = w.alive
      ? (worgSprites.run[w.dir]?.[w.frame] || worgSprites.idle)
      : worgSprites.slain;

    if (!img) continue;

    const drawX = w.x - WORG_SIZE / 2;
    const drawY = w.y - WORG_SIZE / 2;

    ctx.save();

    // Shadow
    ctx.beginPath();
    ctx.ellipse(
      w.x,
      w.y + WORG_SIZE / 2.3,
      WORG_SIZE * 0.35,
      WORG_SIZE * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Flash
    if (w.alive && w.flashTimer > 0) {
      const t = w.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + t * 0.5}) saturate(${1 + t * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    // Dead fade
    if (!w.alive) {
      const alpha = Math.max(0, 1 - w.fade / FADE_OUT);
      ctx.globalAlpha = alpha;
    }

    // Draw sprite (assuming 1024x1024 sheet)
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, WORG_SIZE, WORG_SIZE);

    // HP bar
    drawWorgHpBar(ctx, w);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 📦 GETTER (for targeting)
// ------------------------------------------------------------
export function getWorg() {
  return worgList;
}

// Expose to global so player/towers/projectiles can target them
if (typeof window !== "undefined") {
  window.getWorg = getWorg;
}

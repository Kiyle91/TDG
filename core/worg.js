// ============================================================
// 🐺 worg.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// • Rushes the path only
// • No collision with player or goblins
// • Can be damaged by player (and towers if they ever target it)
// • Drawn BEHIND goblins
// • Uses your directional sprites (worg_*.png)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { damageEnemy } from "./enemies.js";

let worgList = [];
let pathPoints = [];
let worgSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const WORG_SPEED = 150;
const WORG_SIZE = 80;
const FADE_OUT = 900;
const WORG_HP = 175;        // 🩸 small HP like goblins
const WALK_FRAME_INTERVAL = 220;

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
// 🧩 INITIALISE
// ------------------------------------------------------------
export async function initWorg(path) {
  pathPoints = path || [];
  worgList = [];
  await loadWorgSprites();
  console.log("🐺 Worg system initialized.");
}

// ------------------------------------------------------------
// 🐺 SPAWN ONE WORG (for testing or scripted waves)
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

    // Death fade
    fade: 0,

    // Hit flash (ms)
    flashTimer: 0
  };

  worgList.push(worg);

  // 🔧 Dev helper: manual spawn from console
  //   > spawnWorg()
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

    // Already dead → run fade timer and remove
    if (!w.alive) {
      w.fade += delta;
      if (w.fade >= FADE_OUT) {
        worgList.splice(i, 1);
      }
      continue;
    }

    // 🔻 Reduce hit-flash timer
    if (w.flashTimer > 0) {
      w.flashTimer -= delta;
      if (w.flashTimer < 0) w.flashTimer = 0;
    }

    // 🧭 Follow path points like goblins
    const target = pathPoints[w.targetIndex];
    if (!target) continue;

    const dx = target.x - w.x;
    const dy = target.y - w.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      w.x += (dx / dist) * w.speed * dt;
      w.y += (dy / dist) * w.speed * dt;

      // Direction for animation
      w.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";
    } else {
      // Reached current waypoint → move to next
      w.targetIndex++;

      // End of path → consume 1 life and die
      if (w.targetIndex >= pathPoints.length) {
        if (gameState.player) {
          if (gameState.player.lives === undefined) {
            gameState.player.lives = 10;
          }
          gameState.player.lives = Math.max(0, gameState.player.lives - 1);
        }
        w.alive = false;
        w.fade = 0;
      }
    }

    // 🕺 Simple 2-frame run animation
    w.frameTimer += delta;
    if (w.frameTimer >= WALK_FRAME_INTERVAL) {
      w.frameTimer = 0;
      w.frame = (w.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE ENTRY POINT (player / towers can call this)
// ------------------------------------------------------------
export function hitWorg(worg, amount) {
  if (!worg || !worg.alive) return;

  // Use shared damage logic (floating text, XP, etc.)
  damageEnemy(worg, amount);

  // Local flash flag (in case damageEnemy doesn't set it)
  worg.flashTimer = 150;

  // If some other system set hp <= 0 but didn't flip alive
  if (worg.hp <= 0) {
    worg.alive = false;
    worg.fade = 0;
  }
}

// ------------------------------------------------------------
// 🎨 HP BAR
// ------------------------------------------------------------
function drawWorgHpBar(ctx, w) {
  if (!w.alive) return;

  const barWidth = 36;
  const barHeight = 4;
  const offsetY = WORG_SIZE * 0.5 + 8;
  const hpPct = Math.max(0, Math.min(1, w.hp / w.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);

  const grad = ctx.createLinearGradient(
    w.x - barWidth / 2,
    0,
    w.x + barWidth / 2,
    0
  );
  grad.addColorStop(0, "#ff6688");
  grad.addColorStop(1, "#ff99bb");
  ctx.fillStyle = grad;
  ctx.fillRect(
    w.x - barWidth / 2,
    w.y + offsetY,
    barWidth * hpPct,
    barHeight
  );

  ctx.strokeStyle = "rgba(255,182,193,0.7)";
  ctx.lineWidth = 1;
  ctx.strokeRect(w.x - barWidth / 2, w.y + offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🖌️ DRAW
// ------------------------------------------------------------
export function drawWorg(ctx) {
  if (!worgSprites || !worgList.length || !ctx) return;

  for (const w of worgList) {
    const img = w.alive
      ? (worgSprites.run[w.dir]?.[w.frame] || worgSprites.idle)
      : worgSprites.slain;

    if (!img) continue;

    const drawX = w.x - WORG_SIZE / 2;
    const drawY = w.y - WORG_SIZE / 2;

    ctx.save();

    // 🕳 Shadow
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

    // 🧼 High-quality scaling (de-pixelate)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // ❤️ Hit flash (similar to goblins)
    if (w.alive && w.flashTimer > 0) {
      const flashAlpha = w.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    // 🫥 Fade-out for dead worgs
    if (!w.alive) {
      const alpha = Math.max(0, 1 - w.fade / FADE_OUT);
      ctx.globalAlpha = alpha;
    }

    // 🐺 Draw sprite (1024x1024 source like other characters)
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, WORG_SIZE, WORG_SIZE);

    // ❤️ Compact HP bar under feet
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

// Allow towers, spells, melee to target Worgs
if (typeof window !== "undefined") {
  window.getWorg = () => worgList;
}

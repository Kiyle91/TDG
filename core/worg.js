// ============================================================
// 🐺 worg.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// • Rushes the path only
// • No collision with player or goblins
// • Can be damaged by towers & player
// • Drawn BEHIND goblins
// • Uses your directional sprites (worg_*.png)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { damageEnemy } from "./enemies.js";

let worgList = [];
let pathPoints = [];
let worgSprites = null;

const WORG_SPEED = 150;
const WORG_SIZE = 80;
const FADE_OUT = 900;

// ------------------------------------------------------------
// SPRITE LOADER
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
// INITIALISE
// ------------------------------------------------------------
export async function initWorg(path) {
  pathPoints = path;
  worgList = [];
  await loadWorgSprites();
  console.log("🐺 Worg system initialized.");
}

// ------------------------------------------------------------
// SPAWN ONE WORG
// ------------------------------------------------------------
export function spawnWorg() {
  if (!pathPoints.length) return;

  const start = pathPoints[0];

  worgList.push({
    type: "worg",
    x: start.x,
    y: start.y,
    targetIndex: 1,
    hp: 200,
    maxHp: 200,
    alive: true,
    speed: WORG_SPEED,
    dir: "right",
    frame: 0,
    frameTimer: 0,
    fade: 0
  });

  return worgList[worgList.length - 1];
}

// ------------------------------------------------------------
// UPDATE
// ------------------------------------------------------------
export function updateWorg(delta) {
  if (!pathPoints.length) return;

  const dt = delta / 1000;

  for (let i = worgList.length - 1; i >= 0; i--) {
    const w = worgList[i];

    if (!w.alive) {
      w.fade += delta;
      if (w.fade >= FADE_OUT) worgList.splice(i, 1);
      continue;
    }

    const target = pathPoints[w.targetIndex];
    if (!target) continue;

    const dx = target.x - w.x;
    const dy = target.y - w.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      w.x += (dx / dist) * w.speed * dt;
      w.y += (dy / dist) * w.speed * dt;

      w.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";

    } else {
      w.targetIndex++;

      if (w.targetIndex >= pathPoints.length) {
        if (gameState.player) gameState.player.lives--;
        w.alive = false;
      }
    }

    w.frameTimer += delta;
    if (w.frameTimer >= 120) {
      w.frameTimer = 0;
      w.frame = (w.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// DAMAGE
// ------------------------------------------------------------
export function hitWorg(worg, amount) {
  if (!worg || !worg.alive) return;
  damageEnemy(worg, amount);
}

// ------------------------------------------------------------
// DRAW
// ------------------------------------------------------------
export function drawWorg(ctx) {
  if (!worgSprites) return;

  for (const w of worgList) {
    const img = w.alive
      ? worgSprites.run[w.dir][w.frame]
      : worgSprites.slain;

    const x = w.x - WORG_SIZE / 2;
    const y = w.y - WORG_SIZE / 2;

    ctx.save();

    ctx.beginPath();
    ctx.ellipse(
      w.x,
      w.y + WORG_SIZE / 2.3,
      WORG_SIZE * 0.35,
      WORG_SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.drawImage(img, x, y, WORG_SIZE, WORG_SIZE);
    ctx.restore();
  }
}

// ------------------------------------------------------------
export function getWorg() {
  return worgList;
}

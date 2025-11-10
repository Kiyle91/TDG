// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep (Polished Goblins)
// ------------------------------------------------------------
// ✦ Directional goblins with smooth animation + shadows
// ✦ Auto direction detection + death fadeout
// ✦ Solid hitboxes for player collision (now slightly LOWER)
// ✦ High-quality smoothing for pastel visuals
// ✦ Adds individual HP + health bar rendering above heads
// ✦ Fully compatible with towers/projectiles systems
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";

let enemies = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const ENEMY_SIZE = 80;           // on-screen render size (px)
const SPEED = 80;                // movement speed (px/s)
const WALK_FRAME_INTERVAL = 220; // ms per frame
const FADE_OUT_TIME = 600;       // ms before removal
const DEFAULT_HP = 100;
const HITBOX_OFFSET_Y = 15;      // pixels to shift hitbox lower (toward feet)

// ------------------------------------------------------------
// 🧩 LOAD GOBLIN SPRITES
// ------------------------------------------------------------
async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadGoblinSprites() {
  goblinSprites = {
    idle: await loadImage("./assets/images/sprites/goblin/goblin_idle.png"),

    walk: {
      up: [
        await loadImage("./assets/images/sprites/goblin/goblin_W1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_W2.png"),
      ],
      down: [
        await loadImage("./assets/images/sprites/goblin/goblin_S1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_S2.png"),
      ],
      left: [
        await loadImage("./assets/images/sprites/goblin/goblin_A1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_A2.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/goblin/goblin_D1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_D2.png"),
      ],
    },

    slain: await loadImage("./assets/images/sprites/goblin/goblin_slain.png"),
  };

  console.log("👹 Goblin sprite set loaded (directional + death).");
}

// ------------------------------------------------------------
// 🌍 PATH CONTROL
// ------------------------------------------------------------
export function setEnemyPath(points) {
  pathPoints = points || [];
}

// ------------------------------------------------------------
// 🌱 INIT
// ------------------------------------------------------------
export async function initEnemies() {
  enemies = [];
  await loadGoblinSprites();
  spawnEnemy();
}

// ------------------------------------------------------------
// 💀 SPAWN
// ------------------------------------------------------------
function spawnEnemy() {
  if (!pathPoints.length) {
    console.warn("⚠️ No path points — cannot spawn enemies.");
    return;
  }

  enemies.push({
    x: pathPoints[0].x,
    y: pathPoints[0].y,
    width: 42,
    height: 42,
    hp: DEFAULT_HP,        // 🩸 Current HP
    maxHp: DEFAULT_HP,     // 🩸 Max HP
    targetIndex: 1,
    frameTimer: 0,
    frame: 0,
    dir: "down",
    alive: true,
    fadeTimer: 0,
    hitboxOffsetY: HITBOX_OFFSET_Y, // 👣 hitbox lowered slightly
  });
}

// ------------------------------------------------------------
// 🧠 UPDATE — includes delta clamp to prevent warp after tabbing out
// ------------------------------------------------------------
export function updateEnemies(delta) {
  // 🛡️ Cap delta time to avoid huge jumps (e.g., after alt-tab or pause)
  delta = Math.min(delta, 100);
  const dt = delta / 1000;

  for (const e of enemies) {
    if (!e.alive) {
      e.fadeTimer += delta;
      continue;
    }

    const target = pathPoints[e.targetIndex];
    if (!target) continue;

    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Direction detection
    if (Math.abs(dx) > Math.abs(dy)) {
      e.dir = dx > 0 ? "right" : "left";
    } else {
      e.dir = dy > 0 ? "down" : "up";
    }

    // Movement
    if (dist > 1) {
      e.x += (dx / dist) * SPEED * dt;
      e.y += (dy / dist) * SPEED * dt;
    } else {
      // Advance to next path point
      e.targetIndex++;
      if (e.targetIndex >= pathPoints.length) {
        e.targetIndex = 1;
        e.x = pathPoints[0].x;
        e.y = pathPoints[0].y;
      }
    }

    // Animation timing
    e.frameTimer += delta;
    if (e.frameTimer >= WALK_FRAME_INTERVAL) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 2;
    }
  }

  // Remove fully faded enemies + respawn
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive && e.fadeTimer >= FADE_OUT_TIME) {
      enemies.splice(i, 1);
      spawnEnemy();
    }
  }
}

// ------------------------------------------------------------
// 🎯 DAMAGE HANDLING
// ------------------------------------------------------------
export function damageEnemy(enemy, amount) {
  if (!enemy.alive) return;
  enemy.hp -= amount;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    enemy.fadeTimer = 0;
  }
}

// ------------------------------------------------------------
// 🎨 DRAW HEALTH BAR
// ------------------------------------------------------------
function drawHealthBar(ctx, x, y, hp, maxHp) {
  const barWidth = 40;
  const barHeight = 5;
  const offsetY = 20; // distance above goblin head
  const hpPct = Math.max(0, Math.min(1, hp / maxHp));

  // Background (dark semi-transparent)
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);

  // Fill (dynamic hue from green → red)
  const hue = Math.max(0, Math.min(120, (hp / maxHp) * 120));
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(
    x - barWidth / 2,
    y - ENEMY_SIZE / 2 - offsetY,
    barWidth * hpPct,
    barHeight
  );

  // Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🎨 DRAW ENEMIES
// ------------------------------------------------------------
export function drawEnemies(context) {
  if (!goblinSprites) return;
  ctx = context;

  for (const e of enemies) {
    const img = getEnemySprite(e);
    if (!img) continue;

    const drawX = e.x - ENEMY_SIZE / 2;
    const drawY = e.y - ENEMY_SIZE / 2;

    ctx.save();

    // Soft shadow
    ctx.beginPath();
    ctx.ellipse(
      e.x,
      e.y + ENEMY_SIZE / 2.3,
      ENEMY_SIZE * 0.35,
      ENEMY_SIZE * 0.15,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fade if dead
    if (!e.alive) {
      const alpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);
      ctx.globalAlpha = alpha;
    }

    // Draw goblin sprite
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, ENEMY_SIZE, ENEMY_SIZE);

    // Draw health bar (alive or fading)
    if (e.alive || e.fadeTimer < FADE_OUT_TIME) {
      drawHealthBar(ctx, e.x, e.y, e.hp, e.maxHp);
    }

    // // 🧪 DEBUG: visualize lowered hitbox
    // ctx.strokeStyle = "rgba(0,255,0,0.6)";
    // ctx.strokeRect(
    //   e.x - e.width / 2,
    //   e.y - e.height / 2 + e.hitboxOffsetY,
    //   e.width,
    //   e.height
    // );

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 🧩 SELECT SPRITE BASED ON STATE
// ------------------------------------------------------------
function getEnemySprite(e) {
  if (!goblinSprites) return null;
  if (!e.alive) return goblinSprites.slain;

  switch (e.dir) {
    case "up": return goblinSprites.walk.up[e.frame];
    case "down": return goblinSprites.walk.down[e.frame];
    case "left": return goblinSprites.walk.left[e.frame];
    case "right": return goblinSprites.walk.right[e.frame];
    default: return goblinSprites.idle;
  }
}

// ------------------------------------------------------------
// 🔍 EXTERNAL ACCESSORS
// ------------------------------------------------------------
export function getEnemies() {
  return enemies;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

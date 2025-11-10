// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep (Aggro Goblins, Fixed Distance)
// ------------------------------------------------------------
// ✦ Directional goblins with smooth animation + shadows
// ✦ Auto direction detection + death fadeout
// ✦ Goblins chase player if close, attack, then return to path
// ✦ Uses player.pos.x/y safely for real distance
// ✦ Health bars + color gradient, fade on death
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";
import { gameState } from "../utils/gameState.js";

let enemies = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const ENEMY_SIZE = 80;
const SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 600;
const DEFAULT_HP = 100;
const HITBOX_OFFSET_Y = 15;

// 🧠 AI + Combat
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 180;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1000;
const GOBLIN_DAMAGE = 10;

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
    hp: DEFAULT_HP,
    maxHp: DEFAULT_HP,
    targetIndex: 1,
    frameTimer: 0,
    frame: 0,
    dir: "down",
    alive: true,
    fadeTimer: 0,
    hitboxOffsetY: HITBOX_OFFSET_Y,
    state: "path",
    attackCooldown: 0,
    returnTimer: 0,
  });
}

// ------------------------------------------------------------
// 🧠 UPDATE — Movement, Combat & State Logic
// ------------------------------------------------------------
export function updateEnemies(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;

  // Guard clause
  if (!player) return;

  // Safely extract player coords (works with player.pos or flat x/y)
  const px = player?.pos?.x ?? player.x ?? 0;
  const py = player?.pos?.y ?? player.y ?? 0;

  for (const e of enemies) {
    if (!e.alive) {
      e.fadeTimer += delta;
      continue;
    }

    // Calculate distance
    const dxp = px - e.x;
    const dyp = py - e.y;
    const distToPlayer = Math.sqrt(dxp * dxp + dyp * dyp);

    // 1️⃣ Aggro
    if (distToPlayer < AGGRO_RANGE && e.state === "path") {
      e.state = "chase";
    }

    // 2️⃣ Chase / Attack
    if (e.state === "chase") {
      if (distToPlayer > AGGRO_RANGE * 1.5) {
        e.state = "return";
        e.returnTimer = 0;
      } else if (distToPlayer > ATTACK_RANGE) {
        e.x += (dxp / distToPlayer) * SPEED * dt;
        e.y += (dyp / distToPlayer) * SPEED * dt;
      } else {
        e.attackCooldown -= delta;
        if (e.attackCooldown <= 0) {
          e.attackCooldown = ATTACK_COOLDOWN;
          player.hp = Math.max(0, player.hp - GOBLIN_DAMAGE);
          console.log(`💥 Goblin hit! Player HP: ${player.hp}`);
        }
      }
    }

    // 3️⃣ Return to path
    if (e.state === "return") {
      e.returnTimer += delta;
      if (e.returnTimer > RETURN_DELAY) {
        let nearestIndex = 0;
        let nearestDist = Infinity;
        for (let i = 0; i < pathPoints.length; i++) {
          const dx = pathPoints[i].x - e.x;
          const dy = pathPoints[i].y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = i;
          }
        }
        e.targetIndex = nearestIndex;
        e.state = "path";
      }
    }

    // Normal path
    if (e.state === "path") {
      const target = pathPoints[e.targetIndex];
      if (!target) continue;
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dx) > Math.abs(dy)) {
        e.dir = dx > 0 ? "right" : "left";
      } else {
        e.dir = dy > 0 ? "down" : "up";
      }
      if (dist > 1) {
        e.x += (dx / dist) * SPEED * dt;
        e.y += (dy / dist) * SPEED * dt;
      } else {
        e.targetIndex++;
        if (e.targetIndex >= pathPoints.length) {
          e.targetIndex = 1;
          e.x = pathPoints[0].x;
          e.y = pathPoints[0].y;
        }
      }
    }

    // Animation frames
    e.frameTimer += delta;
    if (e.frameTimer >= WALK_FRAME_INTERVAL) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 2;
    }
  }

  // Remove faded
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
  const offsetY = 20;
  const hpPct = Math.max(0, Math.min(1, hp / maxHp));
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);
  const hue = Math.max(0, Math.min(120, (hp / maxHp) * 120));
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(
    x - barWidth / 2,
    y - ENEMY_SIZE / 2 - offsetY,
    barWidth * hpPct,
    barHeight
  );
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

    // Shadow
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

    if (!e.alive) {
      const alpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);
      ctx.globalAlpha = alpha;
    }

    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, ENEMY_SIZE, ENEMY_SIZE);

    if (e.alive || e.fadeTimer < FADE_OUT_TIME) {
      drawHealthBar(ctx, e.x, e.y, e.hp, e.maxHp);
    }

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

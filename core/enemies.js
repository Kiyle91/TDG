// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep (Elemental Status Edition)
// ------------------------------------------------------------
// ✦ Adds support for Frost slow, Flame burn DoT, and Moon knockback
// ✦ Fully compatible with tower elemental system
// ✦ Smooth recovery timers + safe clamping
// ✦ Restores all existing chase/path/death/XP/gold logic
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";
import { addGold, gameState } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { incrementGoblinDefeated } from "./game.js";
import { spawnFloatingText } from "./floatingText.js";
import {
  playGoblinAttack,
  playGoblinDeath,
  playPlayerDamage,
  playGoblinDamage,
} from "./soundtrack.js";
import { spawnDamageSparkles } from "./playerController.js";
import { awardXP } from "./levelSystem.js";
import { triggerMidBattleStory } from "./story.js";

let enemies = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;

// 📈 Spawn tracking (for mid-battle story, scaling, etc.)
let enemiesSpawned = 0;
let storyTriggered = false;

// ✅ Global shared array so towers can access
window.__enemies = enemies;

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const ENEMY_SIZE = 80;
const BASE_SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 900;
const DEFAULT_HP = 50;
const HITBOX_OFFSET_Y = 15;

const ATTACK_RANGE = 80;
const AGGRO_RANGE = 180;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1000;
const GOBLIN_DAMAGE = 10;
const DEATH_LAY_DURATION = 600;

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
    attack: {
      left: [
        await loadImage("./assets/images/sprites/goblin/goblin_attack_left.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_melee_left.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/goblin/goblin_attack_right.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_melee_right.png"),
      ],
    },
    slain: await loadImage("./assets/images/sprites/goblin/goblin_slain.png"),
  };

  console.log("👹 Goblin sprite set loaded (directional + attack + death).");
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
  window.__enemies = enemies;

  enemiesSpawned = 0;
  storyTriggered = false;

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
    fading: false,
    fadeTimer: 0,
    deathTimer: 0,
    hitboxOffsetY: HITBOX_OFFSET_Y,
    state: "path",
    attackCooldown: 0,
    returnTimer: 0,
    flashTimer: 0,

    // 🌡️ Elemental effects
    slowTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
    knockback: 0,
    speed: BASE_SPEED,
  });

  enemiesSpawned++;

  if (enemiesSpawned >= 10 && !storyTriggered) {
    storyTriggered = true;
    console.log("📖 Triggering mid-battle story...");
    try {
      triggerMidBattleStory();
    } catch (e) {
      console.warn("⚠️ triggerMidBattleStory failed:", e);
    }
  }

  window.__enemies = enemies;
}

// ------------------------------------------------------------
// 🧠 UPDATE ENEMIES
// ------------------------------------------------------------
export function updateEnemies(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;
  if (!player) return;

  const px = player?.pos?.x ?? player.x ?? 0;
  const py = player?.pos?.y ?? player.y ?? 0;

  for (const e of enemies) {
    // ☠️ Handle dead enemies (same as before)
    if (!e.alive) {
      if (!e.fading) {
        e.deathTimer += delta;
        if (e.deathTimer >= DEATH_LAY_DURATION) e.fading = true;
      } else {
        e.fadeTimer += delta;
      }
      continue;
    }

    // 🌡️ STATUS EFFECT HANDLING
    handleElementalEffects(e, dt);

    // 🧠 Standard AI logic (same as before)
    const dxp = px - e.x;
    const dyp = py - e.y;
    const distToPlayer = Math.sqrt(dxp * dxp + dyp * dyp);

    if (distToPlayer < AGGRO_RANGE && e.state === "path") e.state = "chase";

    if (e.state === "chase") {
      if (distToPlayer > AGGRO_RANGE * 1.5) {
        e.state = "return";
        e.returnTimer = 0;
      } else if (distToPlayer > ATTACK_RANGE) {
        const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);
        e.x += (dxp / distToPlayer) * moveSpeed * dt;
        e.y += (dyp / distToPlayer) * moveSpeed * dt;
      } else {
        // Attack player
        e.attackCooldown -= delta;
        if (e.attackCooldown <= 0) {
          e.attackCooldown = ATTACK_COOLDOWN;
          player.hp = Math.max(0, (player.hp ?? 0) - GOBLIN_DAMAGE);
          playGoblinAttack();
          setTimeout(() => playPlayerDamage(), 370);

          const sx = player?.pos?.x ?? px;
          const sy = player?.pos?.y ?? py;
          spawnDamageSparkles(sx, sy);

          e.attacking = true;
          e.attackFrame = 0;
          e.attackDir = px < e.x ? "left" : "right";
          setTimeout(() => (e.attackFrame = 1), 150);
          setTimeout(() => {
            e.attacking = false;
            e.attackFrame = 0;
          }, 350);
        }
      }
    }

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

    if (e.state === "path") {
      const target = pathPoints[e.targetIndex];
      if (!target) continue;
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      e.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
          ? "down"
          : "up";
      if (dist > 1) {
        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;
      } else {
        e.targetIndex++;
        if (e.targetIndex >= pathPoints.length) {
          handleGoblinEscape(e);
          continue;
        }
      }
    }

    // Knockback effect
    if (e.knockback > 0) {
      e.knockback -= dt * 20;
      e.y -= e.knockback; // simple push upward along path for now
    }

    e.frameTimer += delta;
    if (e.frameTimer >= WALK_FRAME_INTERVAL) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 2;
    }

    if (e.flashTimer > 0) e.flashTimer -= delta;
  }

  // Remove & respawn faded enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive && e.fading && e.fadeTimer >= FADE_OUT_TIME) {
      enemies.splice(i, 1);
      spawnEnemy();
    }
  }

  window.__enemies = enemies;
}

// ------------------------------------------------------------
// 🌡️ ELEMENTAL EFFECTS HANDLER
// ------------------------------------------------------------
function handleElementalEffects(e, dt) {
  // ❄️ Slow decay
  if (e.slowTimer > 0) {
    e.slowTimer -= dt * 1000;
    if (e.slowTimer <= 0) {
      e.slowTimer = 0;
      e.speed = BASE_SPEED;
    }
  }

  // 🔥 Burn DoT
  if (e.burnTimer > 0) {
    e.burnTimer -= dt * 1000;
    if (Math.random() < 0.05) {
      damageEnemy(e, e.burnDamage ?? 2);
      spawnFloatingText(e.x, e.y - 40, "🔥", "#ff6633");
    }
    if (e.burnTimer <= 0) {
      e.burnTimer = 0;
      e.burnDamage = 0;
    }
  }
}

// ------------------------------------------------------------
// 🎯 DAMAGE HANDLING (unchanged except for safety)
// ------------------------------------------------------------
export function damageEnemy(enemy, amount) {
  if (!enemy || !enemy.alive) return;
  const dmg = Number(amount);
  if (isNaN(dmg) || dmg <= 0) return;

  spawnFloatingText(enemy.x, enemy.y - 30, -Math.abs(Math.round(dmg)), "#ff5c8a", 18);
  enemy.hp -= dmg;
  enemy.flashTimer = 150;
  playGoblinDamage();

  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    enemy.deathTimer = 0;
    enemy.fading = false;
    enemy.fadeTimer = 0;

    playGoblinDeath();
    incrementGoblinDefeated();
    awardXP(2500);
    addGold(50);
    updateHUD();

    spawnFloatingText(enemy.x, enemy.y - 40, "💀", "#fff", 22);
    spawnFloatingText(enemy.x, enemy.y - 55, "+25 XP", "#b3ffb3", 18);
  }
}

// ------------------------------------------------------------
// 💔 HANDLE ESCAPE
// ------------------------------------------------------------
function handleGoblinEscape(enemy) {
  if (gameState.player) {
    if (gameState.player.lives === undefined) gameState.player.lives = 10;
    gameState.player.lives = Math.max(0, gameState.player.lives - 1);
    updateHUD();
  }
  enemy.alive = false;
  enemy.hp = 0;
  enemy.fadeTimer = FADE_OUT_TIME;
}

// ------------------------------------------------------------
// 🎨 DRAW ENEMIES (same visuals)
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
    ctx.ellipse(e.x, e.y + ENEMY_SIZE / 2.3, ENEMY_SIZE * 0.35, ENEMY_SIZE * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Flash
    if (e.alive && e.flashTimer > 0) {
      const flashAlpha = e.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else ctx.filter = "none";

    if (!e.alive && e.fading) ctx.globalAlpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);

    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, ENEMY_SIZE, ENEMY_SIZE);
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    if (e.alive) drawHealthBar(ctx, e.x, e.y, e.hp, e.maxHp);
    ctx.restore();
  }
}

function drawHealthBar(ctx, x, y, hp, maxHp) {
  const barWidth = 40, barHeight = 5, offsetY = 20;
  const hpPct = Math.max(0, Math.min(1, hp / maxHp));
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);
  ctx.fillStyle = `hsl(${hpPct * 120},100%,50%)`;
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth * hpPct, barHeight);
}

// ------------------------------------------------------------
// 🧩 SPRITE SELECTOR (unchanged)
// ------------------------------------------------------------
function getEnemySprite(e) {
  if (!goblinSprites) return null;
  if (!e.alive) return goblinSprites.slain;
  if (e.attacking) {
    const dir = e.attackDir || (e.dir === "left" ? "left" : "right");
    return goblinSprites.attack[dir][e.attackFrame || 0];
  }
  switch (e.dir) {
    case "up": return goblinSprites.walk.up[e.frame];
    case "down": return goblinSprites.walk.down[e.frame];
    case "left": return goblinSprites.walk.left[e.frame];
    case "right": return goblinSprites.walk.right[e.frame];
    default: return goblinSprites.idle;
  }
}

// ------------------------------------------------------------
// 🔍 ACCESSOR
// ------------------------------------------------------------
export function getEnemies() {
  return enemies;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

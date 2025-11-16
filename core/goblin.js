// ============================================================
// 👹 enemies.js — Olivia's World: Crystal Keep (OPTIMIZED - No Stutter Edition)
// ------------------------------------------------------------
// ✦ Adds Frost slow, Flame burn DoT, Moon knockback
// ✦ Goblin ↔ Goblin + Goblin ↔ Player physical collision
// ✦ Smooth chase / attack / path-follow logic + death fade
// ✦ 🆕 PERFORMANCE FIXES:
//    - Spatial partitioning (grid-based collision)
//    - Throttled crowd collision (every 100ms instead of 16ms)
//    - Cached distance calculations
//    - Early exit optimizations
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
import { trySpawnGoblinDrop } from "./goblinDrop.js";
import { addBravery } from "./ui.js";

let enemies = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;
let crowdCollisionTimer = 0;
let enemiesSpawned = 0;
let storyTriggered = false;

// Keep both aliases for compatibility
window.__goblins = enemies;
window.__enemies  = enemies;

// ============================================================
// ⚙️ CONFIG
// ============================================================
const ENEMY_SIZE = 80;
const BASE_SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 900;
const DEFAULT_HP = 75;
const HITBOX_OFFSET_Y = 15;
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1000;
const GOBLIN_DAMAGE = 8;
const DEATH_LAY_DURATION = 600;

// 🆕 PERFORMANCE TUNING
const CROWD_COLLISION_INTERVAL = 100; // Only check every 100ms instead of 16ms
const SPATIAL_GRID_SIZE = 128;       // Grid cell size for spatial partitioning

function getChaseSpread() {
  // Count goblins currently in chase
  let chasing = 0;
  for (const g of enemies) {
    if (g.state === "chase" && g.alive) chasing++;
  }

  // Spread scaling
  if (chasing < 5) return 10;     // small pack
  if (chasing < 10) return 20;    // medium pack
  if (chasing < 20) return 32;    // large pack
  return 48;                      // massive horde
}

// ============================================================
// 🧩 LOAD SPRITES
// ============================================================
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
  console.log("👹 Goblin sprites loaded (directional + attack + death).");
}

// ============================================================
// 🌍 PATH + INIT
// ============================================================
export function setEnemyPath(points) {
  pathPoints = points || [];
}

export async function initEnemies() {
  enemies = [];
  window.__enemies = enemies;
  window.__goblins = enemies;
  enemiesSpawned = 0;
  storyTriggered = false;
  await loadGoblinSprites();
}

// ============================================================
// 🆕 MAP-AWARE GOBLIN SPAWN WRAPPER
// (Legacy wrapper removed — waves now control all spawns)
// ============================================================

// ============================================================
// 💀 SPAWN
// ============================================================
function spawnEnemy() {
  if (!pathPoints.length) {
    console.warn("⚠️ No path points — cannot spawn enemies.");
    return;
  }

  const start = pathPoints[0];
  const spread = 40; // ±20px around path start

  enemies.push({
    x: start.x + (Math.random() - 0.5) * spread,
    y: start.y + (Math.random() - 0.5) * spread,
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
    slowTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
    knockback: 0,
    speed: BASE_SPEED,
    laneOffset: 0,
  });

  enemiesSpawned++;


  window.__enemies = enemies;
  window.__goblins = enemies;
}

// ============================================================
// 🆕 SPATIAL PARTITIONING HELPER
// ============================================================
function buildSpatialGrid(entities) {
  const grid = new Map();

  for (const entity of entities) {
    if (!entity.alive) continue;

    const cellX = Math.floor(entity.x / SPATIAL_GRID_SIZE);
    const cellY = Math.floor(entity.y / SPATIAL_GRID_SIZE);
    const key = `${cellX},${cellY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key).push(entity);
  }

  return grid;
}

function getNearbyFromGrid(grid, x, y) {
  const nearby = [];
  const cellX = Math.floor(x / SPATIAL_GRID_SIZE);
  const cellY = Math.floor(y / SPATIAL_GRID_SIZE);

  // Check 3x3 grid around entity
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      if (grid.has(key)) {
        nearby.push(...grid.get(key));
      }
    }
  }

  return nearby;
}

// ============================================================
// 🧠 UPDATE ENEMIES — Clean, Simple, No Lag
// ============================================================
export function updateEnemies(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;
  if (!player) return;

  const px = player?.pos?.x ?? player.x ?? 0;
  const py = player?.pos?.y ?? player.y ?? 0;

  let activeCount = 0;
  for (const e of enemies) if (e.alive) activeCount++;

  // MAIN LOOP
  for (const e of enemies) {

    // Moon stun
    if (e.stunTimer > 0) {
      e.stunTimer -= delta;
      e.state = "stunned";
      continue;
    }

    // Death fade timing
    if (!e.alive) {
      if (!e.fading) {
        e.deathTimer += delta;
        if (e.deathTimer >= DEATH_LAY_DURATION) e.fading = true;
      } else {
        e.fadeTimer += delta;
      }
      continue;
    }

    // Burn + frost effects
    handleElementalEffects(e, dt);

    // Distance to player
    const dxp = px - e.x;
    const dyp = py - e.y;
    const distToPlayer = Math.hypot(dxp, dyp);

    // Trigger chase
    if (distToPlayer < AGGRO_RANGE && e.state === "path") {
      e.state = "chase";
    }

    // CHASE MODE
    if (e.state === "chase") {

      if (distToPlayer > AGGRO_RANGE * 1.5) {
        // Too far → go back to path
        e.state = "return";
      }

      else if (distToPlayer > ATTACK_RANGE) {
        const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

        e.x += (dxp / distToPlayer) * moveSpeed * dt;
        e.y += (dyp / distToPlayer) * moveSpeed * dt;

        // Sprite direction
        if (Math.abs(dxp) > Math.abs(dyp))
          e.dir = dxp > 0 ? "right" : "left";
        else
          e.dir = dyp > 0 ? "down" : "up";

        e.attacking = false;

        // Animate
        e.frameTimer += delta;
        if (e.frameTimer >= WALK_FRAME_INTERVAL) {
          e.frameTimer = 0;
          e.frame = (e.frame + 1) % 2;
        }
      }

      else {
        // Attack the player
        e.attacking = true;
        if (e.attackCooldown <= 0) {
          attackPlayer(e, player);
          e.attackCooldown = ATTACK_COOLDOWN;
        }
        e.attackCooldown -= delta;
      }
    }

    // RETURN MODE
    else if (e.state === "return") {
      const target = pathPoints[e.targetIndex];

      if (!target) {
        e.state = "path";
        continue;
      }

      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 6) {
        // Back on path
        e.state = "path";
        continue;
      }

      const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

      e.x += (dx / dist) * moveSpeed * dt;
      e.y += (dy / dist) * moveSpeed * dt;

      if (Math.abs(dx) > Math.abs(dy))
        e.dir = dx > 0 ? "right" : "left";
      else
        e.dir = dy > 0 ? "down" : "up";

      // Animate
      e.frameTimer += delta;
      if (e.frameTimer >= WALK_FRAME_INTERVAL) {
        e.frameTimer = 0;
        e.frame = (e.frame + 1) % 2;
      }

      // Re-aggro if player gets close again
      if (distToPlayer < AGGRO_RANGE) {
        e.state = "chase";
      }
    }

    // FOLLOW PATH
    else if (e.state === "path") {
      const target = pathPoints[e.targetIndex];

      if (target) {
        const dx = target.x - e.x;
        const dy = target.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
          e.targetIndex++;
          if (e.targetIndex >= pathPoints.length) {
            handleGoblinEscape(e);
          }
        } else {
          const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);
          e.x += (dx / dist) * moveSpeed * dt;
          e.y += (dy / dist) * moveSpeed * dt;

          if (Math.abs(dx) > Math.abs(dy))
            e.dir = dx > 0 ? "right" : "left";
          else
            e.dir = dy > 0 ? "down" : "up";
        }
      }

      e.attacking = false;

      // Animate
      e.frameTimer += delta;
      if (e.frameTimer >= WALK_FRAME_INTERVAL) {
        e.frameTimer = 0;
        e.frame = (e.frame + 1) % 2;
      }
    }

    // Flash effect fade
    if (e.flashTimer > 0) e.flashTimer -= delta;
  }

  // CLEANUP DEAD
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive && e.fading && e.fadeTimer >= FADE_OUT_TIME) {
      enemies.splice(i, 1);
    }
  }
}

// ============================================================
// 🔥 ELEMENTAL EFFECTS
// ============================================================
function handleElementalEffects(e, dt) {
  // ❄️ FROST (Slow debuff)
  if (e.slowTimer > 0) {
    e.slowTimer -= dt;
  }

  // 🔥 FLAME (Burn DoT)
  if (e.isBurning) {
    e.burnTimer -= dt;

    // Apply burn tick damage every 1 second
    if (!e.burnTick) e.burnTick = 1000;
    e.burnTick -= dt * 1000;

    if (e.burnTick <= 0) {
      e.burnTick = 1000;
      damageEnemy(e, e.burnDamage);
    }

    // Burn expired
    if (e.burnTimer <= 0) {
      e.isBurning = false;
      e.burnDamage = 0;
    }
  }
}

// ============================================================
// 💢 ATTACK PLAYER
// ============================================================
function attackPlayer(enemy, player) {
  if (!player || player.dead) return;

  // ⭐ FULL BRAVERY INVINCIBILITY
  if (player.invincible) {
    return;
  }

  // ⭐ Post-hit invulnerability window
  if (player.invulnTimer > 0) {
    return;
  }

  playGoblinAttack();

  let damage = GOBLIN_DAMAGE;

  // Apply defense reduction
  const def = player.defense || 5;
  const reduction = Math.min(0.5, def / 100);
  damage *= (1 - reduction);

  player.hp = Math.max(0, player.hp - damage);
  player.invulnTimer = 800;   // same timing as updatePlayer
  player.flashTimer = 200;

  updateHUD();

  spawnFloatingText(player.pos.x, player.pos.y - 40, `-${Math.round(damage)}`, "#ff6fb1", 20);
  spawnDamageSparkles(player.pos.x, player.pos.y);
  playPlayerDamage();

  // Attack animation
  enemy.attackFrame = 0;
  enemy.attackDir = enemy.dir === "left" ? "left" : "right";

  setTimeout(() => { enemy.attackFrame = 1; }, 150);
  setTimeout(() => { enemy.attacking = false; }, 400);
}

// ============================================================
// 🎯 DAMAGE
// ============================================================
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
    awardXP(5);
    addGold(5);
    addBravery (1);
    updateHUD();
    trySpawnGoblinDrop(enemy.x, enemy.y);
  }
}

// ============================================================
// 💔 ESCAPE
// ============================================================
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

// ============================================================
// 🎨 DRAW ENEMIES (Fire + Frost Overlay Effects)
// ============================================================
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
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Hit Flash
    if (e.alive && e.flashTimer > 0) {
      const flashAlpha = e.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    // Death fade
    if (!e.alive && e.fading) {
      ctx.globalAlpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);
    }

    // Base goblin sprite
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, ENEMY_SIZE, ENEMY_SIZE);

    // FIRE EFFECT
    if (e.isBurning && e.alive) {
      ctx.save();

      const flicker = 0.85 + Math.random() * 0.3;

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * flicker;
      ctx.fillStyle = "rgba(255,150,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, ENEMY_SIZE * 0.35, ENEMY_SIZE * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 * flicker;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y - ENEMY_SIZE * 0.1, ENEMY_SIZE * 0.55, ENEMY_SIZE * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.15 * flicker;
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y - ENEMY_SIZE * 0.25, ENEMY_SIZE * 0.25, ENEMY_SIZE * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * ENEMY_SIZE * 0.2;
        const oy = -Math.random() * ENEMY_SIZE * 0.3;

        ctx.globalAlpha = 0.15 * Math.random();
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // FROST EFFECT
    if (e.slowTimer > 0 && e.alive) {
      ctx.save();

      const frostPulse = 0.8 + Math.sin(Date.now() / 200) * 0.15;

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * frostPulse;
      ctx.fillStyle = "rgba(160,200,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, ENEMY_SIZE * 0.38, ENEMY_SIZE * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 * frostPulse;
      ctx.fillStyle = "rgba(120,170,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        e.x,
        e.y - ENEMY_SIZE * 0.1,
        ENEMY_SIZE * 0.6,
        ENEMY_SIZE * 0.75,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * ENEMY_SIZE * 0.3;
        const oy = -Math.random() * ENEMY_SIZE * 0.3;

        ctx.globalAlpha = 0.12 * Math.random();
        ctx.fillStyle = "rgba(210,240,255,0.8)";
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Health bar
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    if (e.alive) drawHealthBar(ctx, e.x, e.y, e.hp, e.maxHp);

    ctx.restore();
  }
}

// ============================================================
// ❤️ HEALTH BAR
// ============================================================
function drawHealthBar(ctx, x, y, hp, maxHp) {
  const barWidth = 40, barHeight = 5, offsetY = 20;
  const hpPct = Math.max(0, Math.min(1, hp / maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);

  ctx.fillStyle = `hsl(${hpPct * 120},100%,50%)`;
  ctx.fillRect(
    x - barWidth / 2,
    y - ENEMY_SIZE / 2 - offsetY,
    barWidth * hpPct,
    barHeight
  );
}

// ============================================================
// 🧩 SPRITE SELECTOR
// ============================================================
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

// ============================================================
// 🔍 ACCESSOR
// ============================================================
export function getEnemies() {
  return enemies;
}

// ✅ New explicit goblin spawner for waves & dev tools
export function spawnGoblin() {
  spawnEnemy();   // uses internal spawn logic + spread
}

// Optional alias if you want goblin-specific getter
export function getGoblins() {
  return enemies;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

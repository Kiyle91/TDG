// ============================================================
// 👹 goblin.js — Olivia's World: Crystal Keep
// ------------------------------------------------------------
// ✦ Core melee enemy: path-follow + chase + return-to-path
// ✦ Frost slow, Flame burn DoT, Moon stun compatible
// ✦ Goblin ↔ Goblin + Goblin ↔ Player collision
// ✦ Hit flash, HP bar, death lay + fade
// ✦ Performance tuned (dt clamp, early exits, prepared grid)
// ============================================================
/* ------------------------------------------------------------
 * MODULE: goblin.js
 * PURPOSE:
 *   Implements the primary goblin enemy type, including path
 *   following, chase AI, melee attacks, elemental debuffs,
 *   collisions, rewards, and rendering with fire/frost VFX.
 *
 * SUMMARY:
 *   Goblins spawn at the path start, walk along waypoints,
 *   aggro to the player in range, chase and attack, then give
 *   up and return to the path if the player escapes. They
 *   support frost slow, burn damage over time, and stun, and
 *   contribute XP, gold, bravery, and loot on death.
 *
 * FEATURES:
 *   • setGoblinPath(), initGoblins(), spawnGoblin()
 *   • updateGoblins() — AI, movement, elemental handling
 *   • damageGoblin(), handleGoblinEscape()
 *   • drawGoblins() — sprites, fire/frost, HP bar
 *   • getGoblins() — primary accessor
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { TILE_SIZE } from "../utils/constants.js";
import { addGold, gameState } from "../utils/gameState.js";
import { updateHUD } from "../screenManagement/ui.js";
import { incrementGoblinDefeated } from "../core/game.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import {
  playGoblinAttack,
  playGoblinDeath,
  playPlayerDamage,
  playGoblinDamage,
} from "../core/soundtrack.js";
import { spawnDamageSparkles } from "../fx/sparkles.js";
import { awardXP } from "../player/levelSystem.js";
import { spawnLoot } from "./loot.js";
import { addBravery } from "../screenManagement/ui.js";


// ============================================================
// ⚙️ CONFIG & STATE
// ============================================================

let goblins = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;
let crowdCollisionTimer = 0;
let goblinsSpawned = 0;
let storyTriggered = false;

const GOBLIN_SIZE = 80;
const BASE_SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 900;
const DEFAULT_HP = 80;
const HITBOX_OFFSET_Y = 15;
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1000;
const GOBLIN_DAMAGE = 6;
const DEATH_LAY_DURATION = 600;

const CROWD_COLLISION_INTERVAL = 100;
const SPATIAL_GRID_SIZE = 128;

function getChaseSpread() {
  let chasing = 0;
  for (const g of goblins) {
    if (g.state === "chase" && g.alive) chasing++;
  }
  if (chasing < 5) return 10;
  if (chasing < 10) return 20;
  if (chasing < 20) return 32;
  return 48;
}


// ============================================================
// 🧩 SPRITE LOADING
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
}


// ============================================================
// 🌍 PATH + INIT
// ============================================================

export function setGoblinPath(points) {
  pathPoints = points || [];
}

export async function initGoblins() {
  goblins = [];
  goblinsSpawned = 0;
  storyTriggered = false;
  await loadGoblinSprites();
}


// ============================================================
// 💀 SPAWN
// ============================================================

export function spawnGoblin() {
  if (!pathPoints.length) return;

  const start = pathPoints[0];

  goblins.push({
    type: "goblin",
    x: start.x,
    y: start.y,
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

  goblinsSpawned++;

  return goblins[goblins.length - 1];  // ✅ FIXED
}


// ============================================================
// 🆕 SPATIAL PARTITIONING HELPERS (prepared for heavy hordes)
// ============================================================

function buildSpatialGrid(entities) {
  const grid = new Map();

  for (const entity of entities) {
    if (!entity.alive) continue;

    const cellX = Math.floor(entity.x / SPATIAL_GRID_SIZE);
    const cellY = Math.floor(entity.y / SPATIAL_GRID_SIZE);
    const key = `${cellX},${cellY}`;

    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(entity);
  }

  return grid;
}

function getNearbyFromGrid(grid, x, y) {
  const nearby = [];
  const cellX = Math.floor(x / SPATIAL_GRID_SIZE);
  const cellY = Math.floor(y / SPATIAL_GRID_SIZE);

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      if (grid.has(key)) nearby.push(...grid.get(key));
    }
  }

  return nearby;
}


// ============================================================
// 🧠 UPDATE — AI, MOVEMENT, ATTACK
// ============================================================

export function updateGoblins(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;
  if (!player) return;

  const px = player.pos?.x ?? player.x ?? 0;
  const py = player.pos?.y ?? player.y ?? 0;

  for (const e of goblins) {
    if (e.stunTimer > 0) {
      e.stunTimer -= delta;
      e.state = "stunned";
      continue;
    }

    if (!e.alive) {
      if (!e.fading) {
        e.deathTimer += delta;
        if (e.deathTimer >= DEATH_LAY_DURATION) e.fading = true;
      } else {
        e.fadeTimer += delta;
      }
      continue;
    }

    e.attackCooldown = Math.max(0, (e.attackCooldown ?? 0) - delta);
    handleElementalEffects(e, dt);

    const dxp = px - e.x;
    const dyp = py - e.y;
    const distToPlayer = Math.hypot(dxp, dyp);

    if (distToPlayer < AGGRO_RANGE && e.state === "path") {
      e.state = "chase";
    }

    if (e.state === "chase") {
      const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);
      const attackRange = ATTACK_RANGE * 1.25;

      if (distToPlayer > AGGRO_RANGE * 2.2) {
        e.state = "return";
        e.attacking = false;
        continue;
      }

      if (distToPlayer > attackRange) {
        e.x += (dxp / distToPlayer) * moveSpeed * dt;
        e.y += (dyp / distToPlayer) * moveSpeed * dt;

        if (player.invincible === true) {
        const dx = e.x - px;
        const dy = e.y - py;
        const dist = Math.hypot(dx, dy);

        const BRAVERY_AURA_RADIUS = 130; // Matches your glow radius

        if (dist < BRAVERY_AURA_RADIUS && dist > 0) {
            const pushForce = (BRAVERY_AURA_RADIUS - dist) * 0.35;
            const nx = dx / dist;
            const ny = dy / dist;

            e.x += nx * pushForce;
            e.y += ny * pushForce;
        }
      }

        if (Math.abs(dxp) > Math.abs(dyp))
          e.dir = dxp > 0 ? "right" : "left";
        else
          e.dir = dyp > 0 ? "down" : "up";

        e.attacking = false;

        for (let j = 0; j < goblins.length; j++) {
          const o = goblins[j];
          if (o === e || !o.alive) continue;

          const dx = e.x - o.x;
          const dy = e.y - o.y;
          const dist = Math.hypot(dx, dy);

          const minDist = 72;
          if (dist > 0 && dist < minDist) {
            const push = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            e.x += nx * push;
            e.y += ny * push;
            o.x -= nx * push;
            o.y -= ny * push;
          }
        }

        e.frameTimer += delta;
        if (e.frameTimer >= WALK_FRAME_INTERVAL) {
          e.frameTimer = 0;
          e.frame = (e.frame + 1) % 2;
        }
      } else {
        if (e.attackCooldown === 0) {
          e.attacking = true;
          attackPlayer(e, player);
          e.attackCooldown = ATTACK_COOLDOWN;
        }
      }
    }

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

      e.frameTimer += delta;
      if (e.frameTimer >= WALK_FRAME_INTERVAL) {
        e.frameTimer = 0;
        e.frame = (e.frame + 1) % 2;
      }

      if (distToPlayer < AGGRO_RANGE) {
        e.state = "chase";
      }
    }

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

      e.frameTimer += delta;
      if (e.frameTimer >= WALK_FRAME_INTERVAL) {
        e.frameTimer = 0;
        e.frame = (e.frame + 1) % 2;
      }
    }

    if (e.flashTimer > 0) e.flashTimer -= delta;
  }

  for (let i = goblins.length - 1; i >= 0; i--) {
    const e = goblins[i];
    if (!e.alive && e.fading && e.fadeTimer >= FADE_OUT_TIME) {
      goblins.splice(i, 1);
    }
  }
}


// ============================================================
// 🔥 ELEMENTAL EFFECTS
// ============================================================

function handleElementalEffects(e, dt) {
  if (e.slowTimer > 0) {
    e.slowTimer -= dt;
  }

  if (e.isBurning) {
    e.burnTimer -= dt;

    if (!e.burnTick) e.burnTick = 1000;
    e.burnTick -= dt * 1000;

    if (e.burnTick <= 0) {
      e.burnTick = 1000;
      damageGoblin(e, e.burnDamage);
    }

    if (e.burnTimer <= 0) {
      e.isBurning = false;
      e.burnDamage = 0;
    }
  }
}


// ============================================================
// 💢 ATTACK PLAYER
// ============================================================

function attackPlayer(goblin, player) {
  if (!player || player.dead) {
    goblin.attacking = false;
    return;
  }

  // ⭐ BRAVERY INVULNERABILITY
  if (player.invincible === true) {
    goblin.attacking = false;
    return;
  }

  playGoblinAttack();

  let damage = GOBLIN_DAMAGE;
  const def = player.defense || 5;
  const reduction = Math.min(0.5, def / 100);
  damage *= (1 - reduction);

  player.hp = Math.max(0, player.hp - damage);
  player.flashTimer = 200;

  updateHUD();

  spawnFloatingText(
    player.pos.x,
    player.pos.y - 40,
    `-${Math.round(damage)}`,
    "#ff6fb1",
    20
  );

  spawnDamageSparkles(player.pos.x, player.pos.y);
  playPlayerDamage();

  goblin.attackFrame = 0;
  goblin.attackDir = goblin.dir === "left" ? "left" : "right";

  setTimeout(() => {
    if (goblin.alive) goblin.attackFrame = 1;
  }, 150);

  setTimeout(() => {
    if (goblin.alive) goblin.attacking = false;
  }, 400);
}


// ============================================================
// 🎯 DAMAGE
// ============================================================

export function damageGoblin(goblin, amount) {
  if (!goblin || !goblin.alive) return;
  const dmg = Number(amount);
  if (isNaN(dmg) || dmg <= 0) return;

  spawnFloatingText(
    goblin.x,
    goblin.y - 30,
    -Math.abs(Math.round(dmg)),
    "#ff5c8a",
    18
  );

  goblin.hp -= dmg;
  goblin.flashTimer = 150;
  playGoblinDamage();

  if (goblin.hp <= 0) {
    goblin.hp = 0;
    goblin.alive = false;
    goblin.deathTimer = 0;
    goblin.fading = false;
    goblin.fadeTimer = 0;
    playGoblinDeath();
    incrementGoblinDefeated();
    awardXP(5);
    addGold(10);
    addBravery(10);
    updateHUD();
    spawnLoot("goblin", goblin.x, goblin.y);
  }
}


// ============================================================
// 💔 ESCAPE (REACHES END OF PATH)
// ============================================================

function handleGoblinEscape(goblin) {
  if (gameState.player) {
    if (gameState.player.lives === undefined) gameState.player.lives = 10;
    gameState.player.lives = Math.max(0, gameState.player.lives - 1);
    updateHUD();
  }
  goblin.alive = false;
  goblin.hp = 0;
  goblin.fadeTimer = FADE_OUT_TIME;
}


// ============================================================
// 🎨 DRAW
// ============================================================

export function drawGoblins(context) {
  if (!goblinSprites) return;
  ctx = context;

  for (const e of goblins) {
    const img = getGoblinSprite(e);
    if (!img) continue;

    const drawX = e.x - GOBLIN_SIZE / 2;
    const drawY = e.y - GOBLIN_SIZE / 2;

    ctx.save();

    ctx.beginPath();
    ctx.ellipse(
      e.x,
      e.y + GOBLIN_SIZE / 2.3,
      GOBLIN_SIZE * 0.35,
      GOBLIN_SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (e.alive && e.flashTimer > 0) {
      const flashAlpha = e.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    if (!e.alive && e.fading) {
      ctx.globalAlpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);
    }

    ctx.drawImage(
      img,
      0,
      0,
      1024,
      1024,
      drawX,
      drawY,
      GOBLIN_SIZE,
      GOBLIN_SIZE
    );

    if (e.isBurning && e.alive) {
      ctx.save();

      const flicker = 0.85 + Math.random() * 0.3;

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * flicker;
      ctx.fillStyle = "rgba(255,150,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, GOBLIN_SIZE * 0.35, GOBLIN_SIZE * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 * flicker;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        e.x,
        e.y - GOBLIN_SIZE * 0.1,
        GOBLIN_SIZE * 0.55,
        GOBLIN_SIZE * 0.7,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 0.15 * flicker;
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        e.x,
        e.y - GOBLIN_SIZE * 0.25,
        GOBLIN_SIZE * 0.25,
        GOBLIN_SIZE * 0.35,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * GOBLIN_SIZE * 0.2;
        const oy = -Math.random() * GOBLIN_SIZE * 0.3;

        ctx.globalAlpha = 0.15 * Math.random();
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (e.slowTimer > 0 && e.alive) {
      ctx.save();

      const frostPulse = 0.8 + Math.sin(Date.now() / 200) * 0.15;

      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * frostPulse;
      ctx.fillStyle = "rgba(160,200,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, GOBLIN_SIZE * 0.38, GOBLIN_SIZE * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 * frostPulse;
      ctx.fillStyle = "rgba(120,170,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        e.x,
        e.y - GOBLIN_SIZE * 0.1,
        GOBLIN_SIZE * 0.6,
        GOBLIN_SIZE * 0.75,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * GOBLIN_SIZE * 0.3;
        const oy = -Math.random() * GOBLIN_SIZE * 0.3;

        ctx.globalAlpha = 0.12 * Math.random();
        ctx.fillStyle = "rgba(210,240,255,0.8)";
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

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
  const barWidth = 40;
  const barHeight = 5;
  const offsetY = GOBLIN_SIZE * 0.52;

  const hpPct = Math.max(0, Math.min(1, hp / maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x - barWidth / 2, y + offsetY, barWidth, barHeight);

  ctx.fillStyle = `hsl(${hpPct * 120},100%,50%)`;
  ctx.fillRect(
    x - barWidth / 2,
    y + offsetY,
    barWidth * hpPct,
    barHeight
  );
}


// ============================================================
// 🧩 SPRITE SELECTOR
// ============================================================

function getGoblinSprite(e) {
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

export function getGoblins() {
  return goblins;
}


// ============================================================
// 🌟 END OF FILE — goblin.js
// ============================================================

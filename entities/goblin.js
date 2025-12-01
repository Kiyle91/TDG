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
import { addBravery } from "../player/bravery.js";
import { slideRect } from "../utils/mapCollision.js";
import { getAllPaths } from "../maps/map.js";
import { applyBraveryAuraEffects } from "../player/bravery.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";
import { tryEnemySpeech, tryEnemyHitSpeech } from "../core/events/enemySpeech.js";

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
let fxToggle = 0;

const GOBLIN_SIZE = 80;
const BASE_SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 900;
const DEFAULT_HP = 80;
const HITBOX_OFFSET_Y = 15;
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1500;
const GOBLIN_DAMAGE = 6;
const ATTACK_WINDUP_MS = 250;
const ATTACK_TOTAL_MS = 700;
const ATTACK_IMPACT_MS = Math.max(0, ATTACK_WINDUP_MS - 20); // land hit just before swapping to melee frame
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

function moveGoblinWithCollision(e, dx, dy) {
  const rectX = e.x - e.width / 2;
  const rectY = e.y - e.height / 2;
  const moved = slideRect(rectX, rectY, e.width, e.height, dx, dy, { ignoreBounds: true });
  e.x = moved.x + e.width / 2;
  e.y = moved.y + e.height / 2;
  return moved;
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
  const sources = {
    idle: "./assets/images/sprites/goblin/goblin_idle.png",
    walkUp1: "./assets/images/sprites/goblin/goblin_W1.png",
    walkUp2: "./assets/images/sprites/goblin/goblin_W2.png",
    walkDown1: "./assets/images/sprites/goblin/goblin_S1.png",
    walkDown2: "./assets/images/sprites/goblin/goblin_S2.png",
    walkLeft1: "./assets/images/sprites/goblin/goblin_A1.png",
    walkLeft2: "./assets/images/sprites/goblin/goblin_A2.png",
    walkRight1: "./assets/images/sprites/goblin/goblin_D1.png",
    walkRight2: "./assets/images/sprites/goblin/goblin_D2.png",
    attackLeft1: "./assets/images/sprites/goblin/goblin_attack_left.png",
    attackLeft2: "./assets/images/sprites/goblin/goblin_melee_left.png",
    attackRight1: "./assets/images/sprites/goblin/goblin_attack_right.png",
    attackRight2: "./assets/images/sprites/goblin/goblin_melee_right.png",
    slain: "./assets/images/sprites/goblin/goblin_slain.png",
  };

  const keys = Object.keys(sources);
  const loaded = await Promise.all(keys.map(k => loadImage(sources[k])));
  const get = (name) => loaded[keys.indexOf(name)];

  goblinSprites = {
    idle: get("idle"),
    walk: {
      up: [get("walkUp1"), get("walkUp2")],
      down: [get("walkDown1"), get("walkDown2")],
      left: [get("walkLeft1"), get("walkLeft2")],
      right: [get("walkRight1"), get("walkRight2")],
    },
    attack: {
      left: [get("attackLeft1"), get("attackLeft2")],
      right: [get("attackRight1"), get("attackRight2")],
    },
    slain: get("slain"),
  };
}


// ============================================================
// 🌍 PATH + INIT
// ============================================================

// Accept either a single path OR an array of paths
export function setGoblinPath(points) {
  pathPoints = Array.isArray(points[0]) ? points : [points];
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
  const all = getAllPaths();

  // NEW: If multiple paths exist, choose one randomly
  let chosenPath = [];

  if (all && all.length > 0) {
    chosenPath = all[Math.floor(Math.random() * all.length)];
  } else {
    // Fallback: old single-path maps
    chosenPath = pathPoints[0] || [];
  }

  if (!chosenPath || chosenPath.length === 0) return;

  const start = chosenPath[0];

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
    stunTimer: 0,
    stunned: false,
    preStunState: null,
    burnTimer: 0,
    burnDamage: 0,
    knockback: 0,
    speed: BASE_SPEED,
    laneOffset: 0,
    path: chosenPath
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

    tryEnemySpeech(e);

    if (e.stunTimer > 0) {
      if (!e.stunned) {
        e.preStunState = e.state;
        e.stunned = true;
      }
      e.stunTimer -= delta;
      if (e.stunTimer < 0) e.stunTimer = 0;
      e.state = "stunned";
      continue;
    } else if (e.stunned) {
      e.stunned = false;
      e.stunTimer = 0;
      e.state = e.preStunState || "path";
      e.preStunState = null;
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
        const stepX = (dxp / distToPlayer) * moveSpeed * dt;
        const stepY = (dyp / distToPlayer) * moveSpeed * dt;
        moveGoblinWithCollision(e, stepX, stepY);

        if (player.invincible === true) {
          applyBraveryAuraEffects(e);
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
      const target = e.path[e.targetIndex];
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
      const stepX = (dx / dist) * moveSpeed * dt;
      const stepY = (dy / dist) * moveSpeed * dt;
      moveGoblinWithCollision(e, stepX, stepY);

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
      const target = e.path[e.targetIndex];
      if (target) {
        const dx = target.x - e.x;
        const dy = target.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
          e.targetIndex++;
          if (e.targetIndex >= e.path.length) {
            handleGoblinEscape(e);
          }
        } else {
          const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);
          const stepX = (dx / dist) * moveSpeed * dt;
          const stepY = (dy / dist) * moveSpeed * dt;
          moveGoblinWithCollision(e, stepX, stepY);

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

  playGoblinAttack();

  goblin.attackFrame = 0;
  goblin.attackDir = goblin.dir === "left" ? "left" : "right";

  setTimeout(() => {
    if (goblin.alive) goblin.attackFrame = 1;
  }, ATTACK_WINDUP_MS); // hold wind-up frame a bit longer

  setTimeout(() => {
    if (!goblin.alive || !goblin.attacking) return;
    if (!player || player.dead || player.invincible === true) return;

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
  }, ATTACK_IMPACT_MS); // land damage at end of attack frame (before melee frame)

  setTimeout(() => {
    if (goblin.alive) goblin.attacking = false;
  }, ATTACK_TOTAL_MS); // keep swing frame visible longer
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
  tryEnemyHitSpeech(goblin);

  if (goblin.hp <= 0) {
    goblin.hp = 0;
    goblin.alive = false;
    Events.emit(E.enemyKilled, { type: "goblin", x: goblin.x, y: goblin.y });
    goblin.deathTimer = 0;
    goblin.fading = false;
    goblin.fadeTimer = 0;
    playGoblinDeath();
    awardXP(3);
    addGold(1);
    addBravery(100);
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
    const prevLives = gameState.player.lives;
    gameState.player.lives = Math.max(0, gameState.player.lives - 1);
    if (gameState.player.lives < prevLives) {
      Events.emit(E.playerLifeLost, { lives: gameState.player.lives });
    }
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
    const doFx = (fxToggle++ & 1) === 0;
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

    const sw = img.width;
    const sh = img.height;

    ctx.drawImage(
      img,
      0, 0, sw, sh,
      drawX, drawY,
      GOBLIN_SIZE,
      GOBLIN_SIZE
    );

    if (e.isBurning && e.alive && doFx) {
      ctx.save();

      const flicker = 0.9 + Math.sin(performance.now() * 0.02) * 0.1;

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

      if (doFx) {
        for (let i = 0; i < 2; i++) {
          const ox = (Math.random() - 0.5) * GOBLIN_SIZE * 0.2;
          const oy = -Math.random() * GOBLIN_SIZE * 0.3;

          ctx.globalAlpha = 0.15 * Math.random();
          ctx.beginPath();
          ctx.arc(e.x + ox, e.y + oy, 2 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    if (e.slowTimer > 0 && e.alive && doFx) {
      ctx.save();

      const frostPulse = 0.85 + Math.sin(performance.now() / 200) * 0.12;

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

      if (doFx) {
        for (let i = 0; i < 2; i++) {
          const ox = (Math.random() - 0.5) * GOBLIN_SIZE * 0.3;
          const oy = -Math.random() * GOBLIN_SIZE * 0.3;

          ctx.globalAlpha = 0.12 * Math.random();
          ctx.fillStyle = "rgba(210,240,255,0.8)";
          ctx.beginPath();
          ctx.arc(e.x + ox, e.y + oy, 2 + Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
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


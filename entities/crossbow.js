// ============================================================
// 🏹 crossbow.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Ranged Elite Goblin (off-path spawner + kiting AI)
// ✦ Independent projectile-based ranged attacks
// ✦ Fully supports elemental hits & tower/spire damage
// ✦ Cached sprite sets with walk + raise + shoot + lower frames
// ✦ XP + Gold rewards + loot drops
// ✦ Supports crowd collision (elites + goblins + crossbows)
// ============================================================
/* ------------------------------------------------------------
 * MODULE: crossbow.js
 * PURPOSE:
 *   Implements the ranged crossbow goblin class with path
 *   movement, kite behavior, ranged projectile attacks, damage,
 *   death fade, and rendering of walk/attack states.
 *
 * SUMMARY:
 *   Crossbows spawn off-screen, move toward the player using
 *   elite-style chase + retreat logic, fire projectiles at
 *   range, avoid crowd collisions, and drop rewards on death.
 *
 * FEATURES:
 *   • initCrossbows() — load sprites + reset arrays
 *   • spawnCrossbow() — off-screen elite-style spawner
 *   • updateCrossbows() — movement, AI, cooldowns, projectiles
 *   • drawCrossbows() — render sprites + HP bar + bolts
 *   • damageCrossbow() — external damage handler
 *   • getCrossbows(), clearCrossbows() — public API
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { awardXP } from "../player/levelSystem.js";
import { updateHUD } from "../screenManagement/ui.js";
import { playGoblinDeath, playGoblinDamage } from "../core/soundtrack.js";
import { spawnDamageSparkles } from "../fx/sparkles.js";
import { spawnLoot } from "./loot.js";
import { slideRect } from "../utils/mapCollision.js";
import { addBravery, applyBraveryAuraEffects } from "../player/bravery.js"
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";
import { tryEnemySpeech, tryEnemyHitSpeech } from "../core/events/enemySpeech.js";


// ============================================================
// 🧩 INTERNAL STATE
// ============================================================

let crossbowList = [];
let pathPoints = [];
let crossbowSprites = null;

let crossbowBolts = [];

let globalCrossbowCooldown = 0;
const GLOBAL_CROSSBOW_COOLDOWN_MS = 900;


// ============================================================
// ⚙️ CONFIGURATION
// ============================================================

const CROSSBOW_HP = 80;
const CROSSBOW_SPEED = 80;
const CROSSBOW_SIZE = 80;
const CROSSBOW_HITBOX = CROSSBOW_SIZE * 0.55;

const ATTACK_RANGE = 260;
const IDEAL_MIN_RANGE = 160;

const ATTACK_COOLDOWN = 3200;
const ATTACK_DAMAGE = 8;
const ATTACK_WINDUP_MS = 160;
const ATTACK_DURATION_MS = 380;

const WALK_FRAME_INTERVAL = 220;
const ATTACK_FRAME_INTERVAL = 180;


// ============================================================
// 📦 SPRITE LOADER
// ============================================================

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.decoding = "sync";
    img.loading = "eager";

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function loadCrossbowSprites() {
  const base = "./assets/images/sprites/crossbow";

  const [
    idleRight, idleLeft,
    walkR1, walkR2,
    walkL1, walkL2,
    walkU1, walkU2,
    walkD1, walkD2,
    shootR,
    shootL,
    raiseR, raiseL,
    lowerR, lowerL,
    slain
  ] = await Promise.all([
    loadImage(`${base}/crossbow_idle_right.png`),
    loadImage(`${base}/crossbow_idle_left.png`),

    loadImage(`${base}/crossbow_D1.png`),
    loadImage(`${base}/crossbow_D2.png`),

    loadImage(`${base}/crossbow_A1.png`),
    loadImage(`${base}/crossbow_A2.png`),

    loadImage(`${base}/crossbow_W1.png`),
    loadImage(`${base}/crossbow_W2.png`),

    loadImage(`${base}/crossbow_S1.png`),
    loadImage(`${base}/crossbow_S2.png`),

    loadImage(`${base}/crossbow_shoot_right.png`),
    loadImage(`${base}/crossbow_shoot_left.png`),

    loadImage(`${base}/crossbow_raise_right.png`),
    loadImage(`${base}/crossbow_raise_left.png`),

    loadImage(`${base}/crossbow_lower_right.png`),
    loadImage(`${base}/crossbow_lower_left.png`),

    loadImage(`${base}/crossbow_slain.png`),
  ]);

  const fallbackIdle = await loadImage(`${base}/crossbow_idle.png`);

  crossbowSprites = {
    idle: {
      right: idleRight || fallbackIdle,
      left: idleLeft || fallbackIdle,
      up: fallbackIdle,
      down: fallbackIdle,
    },
    walk: {
      right: [walkR1, walkR2].filter(Boolean),
      left: [walkL1, walkL2].filter(Boolean),
      up: [walkU1, walkU2].filter(Boolean),
      down: [walkD1, walkD2].filter(Boolean),
    },
    attack: {
      right: [raiseR, shootR, lowerR].filter(Boolean),
      left: [raiseL, shootL, lowerL].filter(Boolean),
    },
    slain: slain || idle,
  };
}


// ============================================================
// 🔧 INIT
// ============================================================

export async function initCrossbows(path) {
  pathPoints = Array.isArray(path) ? path : [];
  crossbowList = [];

  if (!crossbowSprites) {
    await loadCrossbowSprites();
  }
}

function moveCrossbowWithCollision(c, dx, dy) {
  const w = CROSSBOW_HITBOX;
  const h = CROSSBOW_HITBOX;
  const rectX = c.x - w / 2;
  const rectY = c.y - h / 2 + CROSSBOW_SIZE * 0.25;
  const moved = slideRect(rectX, rectY, w, h, dx, dy, { ignoreBounds: true });
  c.x = moved.x + w / 2;
  c.y = moved.y + h / 2 - CROSSBOW_SIZE * 0.25;
  return moved.blocked === true;
}


export function spawnCrossbow() {
  const p = gameState.player;
  if (!p) return;

  const mapW = gameState.mapWidth ?? 3000;
  const mapH = gameState.mapHeight ?? 3000;

  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) { x = Math.random() * mapW; y = -200; }
  else if (side === 1) { x = Math.random() * mapW; y = mapH + 200; }
  else if (side === 2) { x = -200; y = Math.random() * mapH; }
  else { x = mapW + 200; y = Math.random() * mapH; }

  crossbowList.push({
    type: "crossbow",
    x,
    y,
    width: CROSSBOW_SIZE,
    height: CROSSBOW_SIZE,

    hp: CROSSBOW_HP,
    maxHp: CROSSBOW_HP,
    alive: true,
    dead: false,
    fading: false,
    fade: 1,

    dir: "right",

    walkTimer: 0,
    walkFrame: 0,
    attacking: false,
    attackFrame: 0,
    attackTimer: 0,
    facing: "right",
    moveDir: "right",
  });

  return crossbowList[crossbowList.length - 1];   // ← FIXED
}


// ============================================================
// 🔥 FIRE PROJECTILE
// ============================================================

function spawnCrossbowBolt(c, targetX, targetY) {
  const angle = Math.atan2(targetY - c.y, targetX - c.x);
  const speed = 580;

  crossbowBolts.push({
    x: c.x,
    y: c.y - 10,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1200,
    from: c,
  });
}


// ============================================================
// 🔁 UPDATE LOOP
// ============================================================

export function updateCrossbows(delta) {
  
  delta = Math.min(delta, 100);
  const dt = delta / 1000;

  const player = gameState.player;
  if (!player) return;

  for (let i = crossbowList.length - 1; i >= 0; i--) {
    const c = crossbowList[i];
    const startX = c.x;
    const startY = c.y;
    c.movedThisFrame = false;

    tryEnemySpeech(c);


    // Death fade
    if (!c.alive) {
      if (!c.fading) {
        c.fading = true;
        c.fade = 1;
      }
      c.fade -= dt;
      if (c.fade <= 0) crossbowList.splice(i, 1);
      continue;
    }
    

    // Distance + direction
    const px = player.pos?.x ?? 0;
    const py = player.pos?.y ?? 0;

    const dx = px - c.x;
    const dy = py - c.y;
    const dist = Math.hypot(dx, dy) || 1;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    c.facing = dx < 0 ? "left" : "right";
    c.dir = c.facing; // legacy fallback
    if (absDy > absDx * 1.1) {
      c.moveDir = dy < 0 ? "up" : "down";
    } else {
      c.moveDir = c.facing;
    }

    // Attack cooldown
    if (c.attackTimer > 0) c.attackTimer -= delta;

    // ATTACK LOGIC
    if (
      dist <= ATTACK_RANGE &&
      dist >= IDEAL_MIN_RANGE * 0.7 &&
      c.attackTimer <= 0 &&
      globalCrossbowCooldown <= 0 &&
      !c.attacking &&
      !player.dead
    ) {
      c.attacking = true;
      c.attackTimer = ATTACK_COOLDOWN;
      c.attackFrame = 0;

      setTimeout(() => {
        if (c.alive) c.attackFrame = 1;
      }, ATTACK_WINDUP_MS * 0.3);

      setTimeout(() => {
        if (!c.alive || player.dead) return;

        spawnCrossbowBolt(
          c,
          player.pos?.x ?? 0,
          player.pos?.y ?? 0
        );

        globalCrossbowCooldown = GLOBAL_CROSSBOW_COOLDOWN_MS;
        c.attackFrame = 2;
      }, ATTACK_WINDUP_MS);

      setTimeout(() => {
        if (c.alive) {
          c.attacking = false;
          c.attackFrame = 0;
        }
      }, ATTACK_DURATION_MS);
    }

    // MOVEMENT / KITE AI
    if (!c.attacking) {
      if (dist > ATTACK_RANGE * 1.05) {
        const stepX = (dx / dist) * CROSSBOW_SPEED * dt;
        const stepY = (dy / dist) * CROSSBOW_SPEED * dt;
        const blocked = moveCrossbowWithCollision(c, stepX, stepY);

        // If path is blocked, try a quick perpendicular sidestep to get around corners
        if (blocked) {
          const sidestep = CROSSBOW_SPEED * 0.6 * dt;
          const perpX = -stepY;
          const perpY = stepX;
          moveCrossbowWithCollision(c, perpX > 0 ? sidestep : -sidestep, perpY > 0 ? sidestep : -sidestep);
        }
      }
      else if (dist < IDEAL_MIN_RANGE) {
        const backSpeed = CROSSBOW_SPEED * 0.7;
        const stepX = -(dx / dist) * backSpeed * dt;
        const stepY = -(dy / dist) * backSpeed * dt;
        const blocked = moveCrossbowWithCollision(c, stepX, stepY);
        if (blocked) {
          const sidestep = backSpeed * 0.6 * dt;
          const perpX = -stepY;
          const perpY = stepX;
          moveCrossbowWithCollision(c, perpX > 0 ? sidestep : -sidestep, perpY > 0 ? sidestep : -sidestep);
        }

        if (player.invincible === true) {
            applyBraveryAuraEffects(c);
        }   
      }

      // Collision with other crossbows
      for (let j = 0; j < crossbowList.length; j++) {
        const o = crossbowList[j];
        if (o === c || !o.alive) continue;

        const dx2 = c.x - o.x;
        const dy2 = c.y - o.y;
        const dist2 = Math.hypot(dx2, dy2);

        const minDist = 72;
        if (dist2 > 0 && dist2 < minDist) {
          const push = (minDist - dist2) / 2;
          const nx = dx2 / dist2;
          const ny = dy2 / dist2;

          c.x += nx * push;
          c.y += ny * push;
          o.x -= nx * push;
          o.y -= ny * push;
        }
      }

      // Collision with goblins
      const goblins = window.__enemies || [];
      for (let g of goblins) {
        if (!g?.alive) continue;

        const dx3 = c.x - g.x;
        const dy3 = c.y - g.y;
        const dist3 = Math.hypot(dx3, dy3);
        const minG = 72;

        if (dist3 > 0 && dist3 < minG) {
          const push = (minG - dist3) / 2;
          const nx = dx3 / dist3;
          const ny = dy3 / dist3;

          c.x += nx * push;
          c.y += ny * push;
          g.x -= nx * push;
          g.y -= ny * push;
        }
      }

      const movedDist = Math.hypot(c.x - startX, c.y - startY);
      c.movedThisFrame = movedDist > 0.25;

      if (c.movedThisFrame) {
        c.walkTimer += delta;
        if (c.walkTimer >= WALK_FRAME_INTERVAL) {
          c.walkTimer = 0;
          c.walkFrame = (c.walkFrame + 1) % 2;
        }
      } else {
        c.walkTimer = 0;
        c.walkFrame = 0;
      }

      updateCrossbowBolts(delta);
      globalCrossbowCooldown = Math.max(0, globalCrossbowCooldown - delta);
    }
  }
}


// ============================================================
// 🔁 PROJECTILE UPDATES
// ============================================================

function updateCrossbowBolts(delta) {
  globalCrossbowCooldown = Math.max(0, globalCrossbowCooldown - delta);

  const dt = delta / 1000;
  const player = gameState.player;

  for (let i = crossbowBolts.length - 1; i >= 0; i--) {
    const b = crossbowBolts[i];

    b.life -= delta;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (player) {
      const dx = player.pos.x - b.x;
      const dy = player.pos.y - b.y;
      const dist = Math.hypot(dx, dy);

    if (dist < 28) {

        // ⭐ BRAVERY INVULNERABILITY
        if (player.invincible === true) {
            crossbowBolts.splice(i, 1);
            continue;
        }

        const dmg = ATTACK_DAMAGE;
        player.hp = Math.max(0, player.hp - dmg);
        spawnDamageSparkles(player.pos.x, player.pos.y);
        spawnFloatingText(player.pos.x, player.pos.y - 40, `-${dmg}`, "#ff8080");
        playGoblinDamage();
        updateHUD();

        crossbowBolts.splice(i, 1);
        continue;
      }
    }

    if (b.life <= 0) crossbowBolts.splice(i, 1);
  }
}


// ============================================================
// 🔁 DRAW PROJECTILES
// ============================================================

function drawCrossbowBolts(ctx) {
  ctx.save();

  for (const b of crossbowBolts) {
    // Arrow-like bolt: small shaft + head oriented to velocity
    const angle = Math.atan2(b.vy, b.vx);
    const len = 18;
    const shaft = 10;
    const half = 2;

    ctx.translate(b.x, b.y);
    ctx.rotate(angle);

    ctx.fillStyle = "#d84b1f";
    ctx.fillRect(-shaft / 2, -half, shaft, half * 2);

    ctx.beginPath();
    ctx.moveTo(len / 2, 0);
    ctx.lineTo(len / 2 - 6, 4);
    ctx.lineTo(len / 2 - 6, -4);
    ctx.closePath();
    ctx.fillStyle = "#ff9b4c";
    ctx.fill();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.restore();
}


// ============================================================
// 🎨 DRAW CROSSBOWS
// ============================================================

export function drawCrossbows(ctx) {
  if (!ctx || !crossbowSprites) return;

  for (const c of crossbowList) {
    ctx.save();
    ctx.globalAlpha = c.fade ?? 1;

    const size = CROSSBOW_SIZE;
    const drawSize = c.alive ? size * 1.1 : size; // 10% larger when alive/active
    const drawX = c.x - drawSize / 2;
    const drawY = c.y - drawSize / 2;

    let img = null;
    const facing = c.facing === "left" ? "left" : "right";
    const moveDir = c.moveDir || facing;

    if (!c.alive || c.dead) {
      img = crossbowSprites.slain;
    } else if (c.attacking && crossbowSprites.attack[facing]?.length) {
      const frames = crossbowSprites.attack[facing];
      img = frames[c.attackFrame % frames.length];
    } else if (!c.movedThisFrame && crossbowSprites.idle[moveDir]) {
      img = crossbowSprites.idle[moveDir];
    } else {
      const walkFrames =
        (crossbowSprites.walk[moveDir]?.length ? crossbowSprites.walk[moveDir] : null) ||
        (crossbowSprites.walk[facing]?.length ? crossbowSprites.walk[facing] : null);

      if (walkFrames && walkFrames.length) {
        img = walkFrames[c.walkFrame % walkFrames.length];
      } else {
        img = crossbowSprites.idle[moveDir] || crossbowSprites.idle[facing];
      }
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(
      c.x,
      c.y + size * 0.35,
      size * 0.35,
      size * 0.18,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (img) ctx.drawImage(img, drawX, drawY, drawSize, drawSize);

    // HP BAR
    if (c.alive) {
      const barWidth = 40;
      const barHeight = 5;
      const offsetY = size * 0.52;

      const pct = Math.max(0, Math.min(1, c.hp / c.maxHp));

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(c.x - barWidth / 2, c.y + offsetY, barWidth, barHeight);

      ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
      ctx.fillRect(c.x - barWidth / 2, c.y + offsetY, barWidth * pct, barHeight);
    }

    drawCrossbowBolts(ctx);
    ctx.restore();
  }
}


// ============================================================
// 💥 DAMAGE API
// ============================================================

export function damageCrossbow(c, amount) {
  if (!c || !c.alive) return;

  c.hp -= amount;
  spawnFloatingText(c.x, c.y - 40, `-${amount}`, "#ff8080");
  playGoblinDamage();
  tryEnemyHitSpeech(c);

  if (c.hp <= 0) {
    killCrossbow(c);
  }
}

function killCrossbow(c) {
  if (!c.alive) return;

  c.alive = false;
  c.dead = true;
  c.fade = 1;
  c.fading = true;
  Events.emit(E.enemyKilled, { type: "crossbow", x: c.x, y: c.y });
  Events.emit(E.waveKillRegistered, { type: "crossbow" });

  awardXP(5);
  addGold(2);
  addBravery(1);
  updateHUD();
  playGoblinDeath();
  spawnLoot("crossbow", c.x, c.y);
}


// ============================================================
// 🧺 PUBLIC API
// ============================================================

export function getCrossbows() {
  return crossbowList;
}

export function clearCrossbows() {
  crossbowList.length = 0;
}


// ============================================================
// 🌟 END OF FILE — crossbow.js
// ============================================================


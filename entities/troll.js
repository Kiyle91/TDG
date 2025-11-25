// ============================================================
// 🧌 troll.js — Olivia's World: Crystal Keep
// ------------------------------------------------------------
// MODULE: troll.js
// PURPOSE:
//   Implements Troll enemies — goblin-style AI with heavier
//   health, slower movement, goblin attack logic, and full
//   support for flash, death fade, collisions, and loot.
//
// FEATURES:
//   • initTrolls()    — Load sprites + reset troll list
//   • spawnTroll()    — Spawn at path start
//   • updateTrolls()  — Path → chase → attack → return AI
//   • drawTrolls()    — Rendering with shadow, HP bar, flash
//   • damageTroll()   — Independent damage system
//   • getTrolls()     — Accessor
//   • clearTrolls()   — Reset list
//
// NOTES:
//   • Bravery: player.invincible blocks damage
//   • Bravery: trolls are knocked back by aura (130 radius)
//   • Uses same attack logic as goblins
//   • Fully standalone enemy system
// ============================================================


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { updateHUD } from "../screenManagement/ui.js";
import {
  playGoblinDamage,
  playGoblinDeath,
  playGoblinAttack,
  playPlayerDamage
} from "../core/soundtrack.js";
import { spawnDamageSparkles } from "../fx/sparkles.js"
import { spawnLoot } from "./loot.js";
import { awardXP } from "../player/levelSystem.js";
import { incrementGoblinDefeated } from "../core/game.js";
import { slideRect } from "../utils/mapCollision.js";
import { addBravery } from "../player/bravery.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";

// ------------------------------------------------------------
// 🗺️ INTERNAL STATE
// ------------------------------------------------------------

let trolls = [];
let pathPoints = [];
let trollSprites = null;


// ------------------------------------------------------------
// ⚙️ CONFIG (Troll stats)
// ------------------------------------------------------------

const SIZE = 96;
const SPEED = 55;
const HP = 170;
const HITBOX = SIZE * 0.55;

const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_RANGE = 260;

const ATTACK_COOLDOWN = 1000;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT = 900;

const BRAVERY_AURA_RADIUS = 130;


// ------------------------------------------------------------
// 🖼️ SPRITE LOADING
// ------------------------------------------------------------

function loadImage(src) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
  });
}

async function loadTrollSprites() {
  trollSprites = {
    idle: await loadImage("./assets/images/sprites/troll/troll_idle.png"),
    slain: await loadImage("./assets/images/sprites/troll/troll_slain.png"),

    walk: {
      up: [
        await loadImage("./assets/images/sprites/troll/troll_A1.png"),
        await loadImage("./assets/images/sprites/troll/troll_A2.png"),
      ],
      down: [
        await loadImage("./assets/images/sprites/troll/troll_S1.png"),
        await loadImage("./assets/images/sprites/troll/troll_S2.png"),
      ],
      left: [
        await loadImage("./assets/images/sprites/troll/troll_W1.png"),
        await loadImage("./assets/images/sprites/troll/troll_W2.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/troll/troll_D1.png"),
        await loadImage("./assets/images/sprites/troll/troll_D2.png"),
      ],
    },

    attack: {
      left: [
        await loadImage("./assets/images/sprites/troll/troll_attack_left.png"),
        await loadImage("./assets/images/sprites/troll/troll_melee_left.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/troll/troll_attack_right.png"),
        await loadImage("./assets/images/sprites/troll/troll_melee_right.png"),
      ]
    }
  };
}


// ------------------------------------------------------------
// 🌸 INIT
// ------------------------------------------------------------

export async function initTrolls(points) {
  trolls = [];
  if (Array.isArray(points) && Array.isArray(points[0])) {
    // Multiple paths
    pathPoints = points;
  } else {
    // Single path fallback
    pathPoints = [points];
  }

  await loadTrollSprites();
}

function moveTrollWithCollision(t, dx, dy) {
  const w = HITBOX;
  const h = HITBOX;
  const rectX = t.x - w / 2;
  const rectY = t.y - h / 2;
  const moved = slideRect(rectX, rectY, w, h, dx, dy, { ignoreBounds: true });
  t.x = moved.x + w / 2;
  t.y = moved.y + h / 2;
  return moved;
}


// ------------------------------------------------------------
// 💀 SPAWN
// ------------------------------------------------------------

export function spawnTroll() {
  if (!pathPoints.length) return;

  const myPath = pathPoints[Math.floor(Math.random() * pathPoints.length)];
  if (!myPath || !myPath.length) return;

  const start = myPath[0];

  trolls.push({
    type: "troll",
    x: start.x,
    y: start.y,

    hp: HP,
    maxHp: HP,

    alive: true,
    fading: false,
    fadeTimer: 0,

    pathIndex: 0,
    state: "path",

    frame: 0,
    frameTimer: 0,
    attackCooldown: 0,
    attackFrame: 0,
    attackDir: "right",

    flashTimer: 0,
    attacking: false,
    chasing: false,
    path: myPath,
    targetIndex: 0,
  });

  return trolls[trolls.length - 1];
}


// ------------------------------------------------------------
// 🗡️ ATTACK PLAYER (Goblin-style + bravery invuln)
// ------------------------------------------------------------

function attackPlayer(t, player) {
  if (!player || player.dead) {
    t.attacking = false;
    return;
  }

  // Bravery: ignore all damage while invincible
  if (player.invincible === true) {
    t.attacking = false;
    return;
  }

  playGoblinAttack();

  let damage = 8;
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
    "#ff6fb1"
  );

  spawnDamageSparkles(player.pos.x, player.pos.y);
  playPlayerDamage();

  t.attackFrame = 0;
  t.attackDir = t.dir === "left" ? "left" : "right";

  setTimeout(() => { if (t.alive) t.attackFrame = 1; }, 150);
  setTimeout(() => { if (t.alive) t.attacking = false; }, 400);
}


// ------------------------------------------------------------
// 🔁 UPDATE — Path → Chase → Attack → Return
// ------------------------------------------------------------

export function updateTrolls(delta = 16) {
  if (!trollSprites || !pathPoints.length) return;

  delta = Math.min(delta, 100);
  const dt = delta / 1000;

  const player = gameState.player;
  if (!player) return;

  const px = player.pos.x;
  const py = player.pos.y;

  for (const t of trolls) {

    // Death fade
    if (!t.alive) {
      t.fadeTimer += delta;
      continue;
    }

    // Cooldown tick
    t.attackCooldown = Math.max(0, t.attackCooldown - delta);

    // Distance to player
    const dxp = px - t.x;
    const dyp = py - t.y;
    const distP = Math.hypot(dxp, dyp);

    t.chasing = distP < AGGRO_RANGE;
    if (distP > RETURN_RANGE) t.chasing = false;

    // ------------------------------
    // 🐺 CHASE
    // ------------------------------
    if (t.chasing) {

      // Attack window
      if (distP < ATTACK_RANGE) {
        if (t.attackCooldown === 0) {
          t.attacking = true;
          attackPlayer(t, player);
          t.attackCooldown = ATTACK_COOLDOWN;
        }
        // we still skip movement this frame
        continue;
      }

      // Move toward player
      const dist = distP || 1;
      const stepX = (dxp / dist) * SPEED * dt;
      const stepY = (dyp / dist) * SPEED * dt;
      moveTrollWithCollision(t, stepX, stepY);

      // Bravery aura knockback (push troll away from player)
      if (player.invincible === true) {
          applyBraveryAuraEffects(e);
      }

      // Direction & walk animation
      t.dir =
        Math.abs(dxp) > Math.abs(dyp)
          ? (dxp > 0 ? "right" : "left")
          : (dyp > 0 ? "down" : "up");

      t.frameTimer += delta;
      if (t.frameTimer >= WALK_FRAME_INTERVAL) {
        t.frameTimer = 0;
        t.frame = (t.frame + 1) % 2;
      }

    } else {
      // ------------------------------
      // 🛣 PATH FOLLOW
      // ------------------------------
      // ✅ FIXED: Use t.path instead of pathPoints
      const target = t.path[t.pathIndex];
      if (!target) {
        handleEscape(t);
        continue;
      }

      const dx = target.x - t.x;
      const dy = target.y - t.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < 6) {
        t.pathIndex++;
        // ✅ FIXED: Compare against t.path.length instead of pathPoints.length
        if (t.pathIndex >= t.path.length) {
          handleEscape(t);
        }
      } else {
        const stepX = (dx / dist) * SPEED * dt;
        const stepY = (dy / dist) * SPEED * dt;
        moveTrollWithCollision(t, stepX, stepY);

        t.dir =
          Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? "right" : "left")
            : (dy > 0 ? "down" : "up");
      }

      t.frameTimer += delta;
      if (t.frameTimer >= WALK_FRAME_INTERVAL) {
        t.frameTimer = 0;
        t.frame = (t.frame + 1) % 2;
      }
    }

    // ------------------------------
    // ✨ Flash fade-out
    // ------------------------------
    if (t.flashTimer > 0) {
      t.flashTimer -= delta;
      if (t.flashTimer < 0) t.flashTimer = 0;
    }

    // ------------------------------
    // Player ↔ Troll pushback
    // (only when not invincible — bravery handles aura instead)
    // ------------------------------
    if (!player.invincible && distP < 50 && distP > 0) {
      const overlap = (50 - distP) / 3;
      const nx = dxp / distP;
      const ny = dyp / distP;

      player.pos.x += nx * overlap * 0.8;
      player.pos.y += ny * overlap * 0.8;
    }
  }

  // ----------------------------------------------------
  // 🧌 Troll ↔ Troll collision
  // ----------------------------------------------------
  const MIN_DIST = 72;

  for (let i = 0; i < trolls.length; i++) {
    const a = trolls[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < trolls.length; j++) {
      const b = trolls[j];
      if (!b.alive) continue;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < MIN_DIST) {
        const push = (MIN_DIST - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        a.x += nx * push;
        a.y += ny * push;

        b.x -= nx * push;
        b.y -= ny * push;
      }
    }
  }

  // Cleanup faded corpses
  for (let i = trolls.length - 1; i >= 0; i--) {
    if (!trolls[i].alive && trolls[i].fadeTimer >= FADE_OUT) {
      trolls.splice(i, 1);
    }
  }
}


// ------------------------------------------------------------
// 💔 ESCAPE
// ------------------------------------------------------------

function handleEscape(t) {
  const p = gameState.player;
  if (p) {
    if (p.lives === undefined) p.lives = 10;
    p.lives = Math.max(0, p.lives - 1);
    updateHUD();
  }

  t.alive = false;
  t.hp = 0;
  t.fadeTimer = FADE_OUT;
}


// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------

export function damageTroll(t, amount) {
  if (!t || !t.alive) return;

  t.hp -= amount;
  t.flashTimer = 150;

  spawnFloatingText(t.x, t.y - 40, `-${Math.round(amount)}`, "#ff7777");
  playGoblinDamage();

  if (t.hp <= 0) {
    t.hp = 0;
    Events.emit(E.enemyKilled, { type: "troll", x: t.x, y: t.y });
    t.alive = false;
    t.fadeTimer = 0;

    playGoblinDeath();
    incrementGoblinDefeated();

    awardXP(5);
    addGold(5);
    addBravery(1);

    updateHUD();
    spawnLoot("troll", t.x, t.y);
  }
}


// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------

export function drawTrolls(ctx) {
  if (!ctx || !trollSprites) return;

  const FEET_OFFSET = 12;

  for (const t of trolls) {
    const img = getSprite(t);
    if (!img) continue;

    const drawX = t.x - SIZE / 2;
    let drawY = t.y - SIZE / 2 - FEET_OFFSET;

    ctx.save();
    
    // High-quality rendering
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = "high";


    // Shadow
    ctx.beginPath();
    ctx.ellipse(
      t.x,
      t.y + SIZE / 2.7,
      SIZE * 0.35,
      SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Fade-out corpse
    if (!t.alive) {
      ctx.globalAlpha = Math.max(0, 1 - t.fadeTimer / FADE_OUT);
    }

    // Flash effect
    if (t.flashTimer > 0) {
      const alpha = t.flashTimer / 150;
      ctx.filter = `brightness(${1 + alpha * 0.4}) saturate(${1 + alpha})`;
    }

    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      drawX,
      drawY,
      SIZE,
      SIZE
    );

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // HP bar
    if (t.alive) {
      const barW = 40;
      const barH = 5;
      const offsetY = SIZE * 0.52;

      const pct = Math.max(0, Math.min(1, t.hp / t.maxHp));

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(t.x - barW / 2, t.y + offsetY, barW, barH);

      ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
      ctx.fillRect(t.x - barW / 2, t.y + offsetY, barW * pct, barH);
    }

    ctx.restore();
  }
}


// ------------------------------------------------------------
// SPRITE SELECTOR
// ------------------------------------------------------------

function getSprite(t) {
  if (!t.alive) return trollSprites.slain;
  if (t.attacking) return trollSprites.attack[t.attackDir][t.attackFrame];
  if (t.dir && trollSprites.walk[t.dir]) return trollSprites.walk[t.dir][t.frame];
  return trollSprites.idle;
}


// ------------------------------------------------------------
// ACCESSORS
// ------------------------------------------------------------

export function getTrolls() {
  return trolls;
}

export function clearTrolls() {
  trolls = [];
}


// ============================================================
// 🌟 END OF FILE
// ============================================================
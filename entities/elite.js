// ============================================================
// 🟥 elite.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Brute-class hunter enemy (off-path spawner)
// ✦ Chases player directly (not the goblin path)
// ✦ Full run + attack + idle + slain sprite set
// ✦ Frost slow, flame burn, moon stun compatible
// ✦ Hit flash, death fade, goblin-style HP bar
// ✦ XP + Gold + Bravery reward on kill
// ============================================================
/* ------------------------------------------------------------
 * MODULE: elite.js
 * PURPOSE:
 *   Implements the Elite hunter enemy that pursues the player
 *   directly, attacks at melee range, supports elemental effects,
 *   and performs smooth rendering with hit flashes and death fade.
 *
 * SUMMARY:
 *   Elites spawn off-screen, navigate toward the player using
 *   chase logic, execute timed melee attacks, and collide with
 *   goblins and other elites. Uses 2-frame run and 2-frame
 *   attack animations with idle/slain frames.
 *
 * FEATURES:
 *   • initElites() — load sprites + reset data
 *   • spawnElite() — elite spawner (off-screen)
 *   • updateElites() — hunter AI, elemental effects, melee
 *   • drawElites() — sprite render + HP bar + VFX
 *   • damageElite() — external damage system
 *   • getElites(), clearElites() — public API
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { awardXP } from "../player/levelSystem.js";
import { updateHUD } from "../screenManagement/ui.js";
import { playGoblinDamage, playGoblinDeath } from "../core/soundtrack.js";
import { getGoblins } from "../entities/goblin.js";
import { slideRect } from "../utils/mapCollision.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";
import { addBravery } from "../player/bravery.js";
import { applyBraveryAuraEffects } from "../player/bravery.js";
import { tryEnemySpeech, tryEnemyHitSpeech } from "../core/events/enemySpeech.js";
// ============================================================
// 🧩 INTERNAL STATE
// ============================================================

let eliteList = [];
let eliteSprites = null;


// ============================================================
// ⚙️ CONFIGURATION
// ============================================================

const ELITE_HP = 120;
const ELITE_SPEED = 90;
const ELITE_SIZE = 80;
const ELITE_HITBOX = ELITE_SIZE * 0.55;

const FRAME_INTERVAL = 220;

const ATTACK_RANGE = 55;
const ATTACK_DAMAGE = 14;
const ATTACK_TOTAL_TIME = 700;  // lengthen full attack animation
const ATTACK_WINDUP = 250;      // keep attack frame visible longer
const ATTACK_IMPACT_TIME = Math.max(0, ATTACK_WINDUP - 20); // land hit at end of attack frame
const ATTACK_COOLDOWN = 1500;   // delay between swings

const FADE_OUT = 900;

const EXP_REWARD = 5;
const GOLD_REWARD = 2;


// ============================================================
// 📦 IMAGE LOADER
// ============================================================

async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}


// ============================================================
// 🖼️ LOAD SPRITES
// ============================================================

async function loadEliteSprites() {
  eliteSprites = {
    idle: await loadImage("./assets/images/sprites/elite/elite_idle.png"),

    run: {
      left: [
        await loadImage("./assets/images/sprites/elite/elite_A1.png"),
        await loadImage("./assets/images/sprites/elite/elite_A2.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/elite/elite_D1.png"),
        await loadImage("./assets/images/sprites/elite/elite_D2.png"),
      ],
      up: [
        await loadImage("./assets/images/sprites/elite/elite_W1.png"),
        await loadImage("./assets/images/sprites/elite/elite_W2.png"),
      ],
      down: [
        await loadImage("./assets/images/sprites/elite/elite_S1.png"),
        await loadImage("./assets/images/sprites/elite/elite_S2.png"),
      ],
    },

    attack: {
      left: [
        await loadImage("./assets/images/sprites/elite/elite_attack_left.png"),
        await loadImage("./assets/images/sprites/elite/elite_melee_left.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/elite/elite_attack_right.png"),
        await loadImage("./assets/images/sprites/elite/elite_melee_right.png"),
      ],
    },

    slain: await loadImage("./assets/images/sprites/elite/elite_slain.png"),
  };
}


// ============================================================
// 🔧 INIT
// ============================================================

export async function initElites() {
  eliteList = [];
  await loadEliteSprites();
}

function moveEliteWithCollision(e, dx, dy) {
  const w = ELITE_HITBOX;
  const h = ELITE_HITBOX;
  const rectX = e.x - w / 2;
  const rectY = e.y - h / 2 + ELITE_SIZE * 0.25;
  const moved = slideRect(rectX, rectY, w, h, dx, dy, { ignoreBounds: true });
  e.x = moved.x + w / 2;
  e.y = moved.y + h / 2 - ELITE_SIZE * 0.25;
  return moved.blocked === true;
}


// ============================================================
// 🟥 SPAWN ELITE (off-screen, no path required)
// ============================================================

export function spawnElite() {
  const mapW = gameState.mapWidth ?? 3000;
  const mapH = gameState.mapHeight ?? 3000;

  // Off-screen spawn like Crossbows/Ogres
  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) { x = Math.random() * mapW; y = -300; }
  else if (side === 1) { x = Math.random() * mapW; y = mapH + 300; }
  else if (side === 2) { x = -300; y = Math.random() * mapH; }
  else { x = mapW + 300; y = Math.random() * mapH; }

  const e = {
    type: "elite",
    x,
    y,

    hp: ELITE_HP,
    maxHp: ELITE_HP,

    alive: true,
    dir: "down",
    frame: 0,
    frameTimer: 0,

    attackCooldown: 0,
    flashTimer: 0,

    fading: false,
    fadeTimer: 0,

    // attack system
    attacking: false,
    attackFrame: 0,
    attackTimer: 0,

    // elemental
    slowTimer: 0,
    stunTimer: 0,

    // burn
    isBurning: false,
    burnTimer: 0,
    burnTick: 0,
    burnDamage: 0,

    speed: ELITE_SPEED,
  };

  eliteList.push(e);
  return e;
}




// ============================================================
// 🔁 UPDATE — AI, EFFECTS, ATTACK
// ============================================================

export function updateElites(delta = 16) {
  if (!eliteList.length || !gameState.player) return;

  const p = gameState.player;
  const dt = delta / 1000;

  for (let i = eliteList.length - 1; i >= 0; i--) {
    const e = eliteList[i];
    const startX = e.x;
    const startY = e.y;
    e.movedThisFrame = false;

    // Death fade
    if (!e.alive) {
      e.fade += delta;
      if (e.fade >= FADE_OUT) eliteList.splice(i, 1);
      continue;
    }

    // Hit flash
    if (e.flashTimer > 0) {
      e.flashTimer -= delta;
      if (e.flashTimer < 0) e.flashTimer = 0;
    }

    // Stun
    if (e.stunTimer > 0) {
      e.stunTimer -= delta;
      continue;
    }

    // Attack cooldown
    if (e.attackCooldown > 0) {
      e.attackCooldown = Math.max(0, e.attackCooldown - delta);
    }

    // Elemental: Frost
    if (e.slowTimer > 0) e.slowTimer -= dt;

    // Elemental: Burn
    if (e.isBurning) {
      e.burnTimer -= dt;
      e.burnTick -= dt * 1000;

      if (e.burnTick <= 0) {
        e.burnTick = 1000;
        damageElite(e, e.burnDamage);
      }

      if (e.burnTimer <= 0) {
        e.isBurning = false;
        e.burnDamage = 0;
      }
    }

    // Push away from player if overlapping (never move the player)
    if (!player.invincible) {
      const dxp = p.pos.x - e.x;
      const dyp = p.pos.y - e.y;
      const distP = Math.hypot(dxp, dyp);
      if (distP > 0 && distP < 54) {
        const overlap = (54 - distP) * 0.6;
        const inv = 1 / distP;
        e.x -= dxp * inv * overlap;
        e.y -= dyp * inv * overlap;
      }
    }

    // Chase player
    const dx = p.pos.x - e.x;
    const dy = p.pos.y - e.y;
    const dist = Math.hypot(dx, dy);

    // Attack logic
    if (!e.attacking && dist < ATTACK_RANGE && e.attackCooldown === 0) {
      e.attacking = true;
      e.attackTimer = ATTACK_TOTAL_TIME;
      e.attackFrame = 0;
      e.attackCooldown = ATTACK_COOLDOWN;

      setTimeout(() => { if (e.alive) e.attackFrame = 1; }, ATTACK_WINDUP);

            setTimeout(() => {
        if (!e.alive || !e.attacking) return;
        if (!p || p.dead) return;

        const pdx = p.pos.x - e.x;
        const pdy = p.pos.y - e.y;

        if (Math.hypot(pdx, pdy) < ATTACK_RANGE + 20) {

            // ??? BRAVERY INVULNERABILITY
            if (p.invincible === true) {
                return; // ignore all elite damage
            }

            const dmg = ATTACK_DAMAGE;
            p.hp = Math.max(0, p.hp - dmg);
            p.flashTimer = 200;

          spawnFloatingText(p.pos.x, p.pos.y - 30, `-${dmg}`, "#ff5577", 20);
          updateHUD();
        }
      }, ATTACK_IMPACT_TIME);

      setTimeout(() => {
        if (e.alive) {
          e.attacking = false;
          e.attackFrame = 0;
        }
      }, ATTACK_TOTAL_TIME);

      continue;
    }

    // Movement
    if (!e.attacking) {
      const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

      if (dist > 5) {
        const stepX = (dx / dist) * moveSpeed * dt;
        const stepY = (dy / dist) * moveSpeed * dt;
        const blocked = moveEliteWithCollision(e, stepX, stepY);

        // Fast sidestep when path is blocked to slip around corners
        if (blocked) {
          const sidestep = moveSpeed * 0.6 * dt;
          const perpX = -stepY;
          const perpY = stepX;
          moveEliteWithCollision(
            e,
            perpX > 0 ? sidestep : -sidestep,
            perpY > 0 ? sidestep : -sidestep
          );
        }

        if (p.invincible === true) {
            applyBraveryAuraEffects(e);
        }
      
      }

      e.dir =
        Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");

      // Elite vs Goblin collisions
      const goblins = getGoblins();
      for (let g of goblins) {
        if (!g?.alive) continue;

        const dx2 = e.x - g.x;
        const dy2 = e.y - g.y;
        const d2 = Math.hypot(dx2, dy2);

        const minDist = 96;
        if (d2 > 0 && d2 < minDist) {
          const push = (minDist - d2) / 2;
          const nx = dx2 / d2;
          const ny = dy2 / d2;

          e.x += nx * push;
          e.y += ny * push;

          g.x -= nx * push;
          g.y -= ny * push;
        }
      }

      // Elite vs Elite collisions
      for (let o of eliteList) {
        if (o === e || !o.alive) continue;

        const dx2 = e.x - o.x;
        const dy2 = e.y - o.y;
        const d2 = Math.hypot(dx2, dy2);

        const minDist = 96;
        if (d2 > 0 && d2 < minDist) {
          const push = (minDist - d2) / 2;
          const nx = dx2 / d2;
          const ny = dy2 / d2;

          e.x += nx * push;
          e.y += ny * push;

          o.x -= nx * push;
          o.y -= ny * push;
        }
      }

      // Run animation
      const movedDist = Math.hypot(e.x - startX, e.y - startY);
      e.movedThisFrame = movedDist > 0.25;

      if (e.movedThisFrame) {
        e.frameTimer += delta;
        if (e.frameTimer >= FRAME_INTERVAL) {
          e.frameTimer = 0;
          e.frame = (e.frame + 1) % 2;
        }
      } else {
        e.frameTimer = 0;
        e.frame = 0;
      }
    }
  }
}


// ============================================================
// 💥 DAMAGE
// ============================================================

export function damageElite(e, amount) {
  if (!e || !e.alive) return;

  e.hp -= amount;
  e.flashTimer = 150;

  spawnFloatingText(e.x, e.y - 40, `-${amount}`, "#ff3355");
  playGoblinDamage();
  tryEnemyHitSpeech(e);

  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
    e.fade = 0;    
    Events.emit(E.enemyKilled, { type: "elite", x: e.x, y: e.y });
    Events.emit(E.waveKillRegistered, { type: "elite" });

    

    playGoblinDeath();
    awardXP(EXP_REWARD);
    addGold(GOLD_REWARD);
    addBravery(1);
    updateHUD();
  }
}


// ============================================================
// ❤️ HP BAR
// ============================================================

function drawEliteHpBar(ctx, e) {
  const barWidth = 40;
  const barHeight = 5;
  const offsetY = ELITE_SIZE * 0.52;

  const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(e.x - barWidth / 2, e.y + offsetY, barWidth, barHeight);

  ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
  ctx.fillRect(e.x - barWidth / 2, e.y + offsetY, barWidth * pct, barHeight);
}


// ============================================================
// 🖌️ DRAW
// ============================================================

export function drawElites(ctx) {
  if (!eliteSprites || !eliteList.length) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const e of eliteList) {
    let img;
    tryEnemySpeech(e);

    if (!e.alive) {
      img = eliteSprites.slain;
    } else if (e.attacking) {
      const dir = e.dir === "left" ? "left" : "right";
      img = eliteSprites.attack[dir][e.attackFrame];
    } else if (!e.movedThisFrame && e.attackCooldown > 0 && !e.attacking) {
      img = eliteSprites.idle;
    } else {
      img = eliteSprites.run[e.dir]?.[e.frame] || eliteSprites.idle;
    }

    const size = ELITE_SIZE;
    const drawX = e.x - size / 2;
    const drawY = e.y - size / 2;

    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + size * 0.45, size * 0.32, size * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Hit flash
    if (e.flashTimer > 0 && e.alive) {
      const t = e.flashTimer / 150;
      ctx.globalAlpha = 1 - t * 0.35;
    }

    // Death fade
    if (!e.alive) {
      ctx.globalAlpha = Math.max(0, 1 - e.fade / FADE_OUT);
    }

    // Draw
    if (!e.alive) {
      const srcW = img.width;
      const srcH = img.height;

      ctx.drawImage(
        img,
        0, 0, srcW, srcH,
        drawX, drawY, size, size
      );

    } else {
            // All elite sprites are now 512x512, scale them down
      const srcW = img.width;
      const srcH = img.height;

      ctx.drawImage(
        img,
        0, 0, srcW, srcH,
        drawX, drawY, size, size
      );

    }

    // Burn effect
    if (e.isBurning && e.alive) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, size * 0.55, size * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Frost effect
    if (e.slowTimer > 0 && e.alive) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "rgba(160,200,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, size * 0.48, size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (e.alive) drawEliteHpBar(ctx, e);
    ctx.restore();
  }
}


// ============================================================
// 🧺 PUBLIC API
// ============================================================

export function getElites() {
  return eliteList;
}

export function clearElites() {
  eliteList.length = 0;
}


// ============================================================
// 🌟 END OF FILE — elite.js
// ============================================================


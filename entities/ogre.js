// ============================================================
// 👹 ogre.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// MODULE: ogre.js
// PURPOSE:
//   Implements the Ogre enemy — a large brute that hunts the
//   player directly with heavy melee attacks, two-phase attack
//   animation, status effects, and smooth death fade.
//
// SUMMARY:
//   • initOgres()    — Load sprites and reset ogre list
//   • spawnOgre()    — Public spawn API (off-screen brute)
//   • updateOgres()  — AI, chasing, attacking, collisions,
//                      stun/flash logic, fade-out
//   • drawOgres()    — Rendering with shadow, HP bar, effects
//   • damageOgre()   — Independent damage system
//   • getOgres()     — Accessor
//   • clearOgres()   — Wipe all ogres
//
// TECHNICAL NOTES:
//   • Optimized squared-distance checks
//   • Timer-based attack system (no setTimeout)
//   • Flash timer handled in update, not draw
//   • Clean, standalone enemy system
// ============================================================


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { getDifficultyHpMultiplier } from "../screenManagement/settings.js";

import { spawnFloatingText } from "../fx/floatingText.js";

import {
  playOgreEnter,
  playOgreAttack,
  playOgreSlain,
  playGoblinDamage
} from "../core/soundtrack.js";

import { spawnDamageSparkles } from "../fx/sparkles.js";
import { awardXP } from "../player/levelSystem.js";
import { updateHUD } from "../screenManagement/ui.js";
import { spawnLoot } from "./loot.js";
import { slideRect } from "../utils/mapCollision.js";
import { addBravery } from "../player/bravery.js";
import { applyBraveryAuraEffects } from "../player/bravery.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";


// ------------------------------------------------------------
// 🗺️ INTERNAL STATE
// ------------------------------------------------------------

let ogres = [];
let ogreSprites = null;


// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------

const OGRE_SIZE   = 160;
const OGRE_SPEED  = 38;
const BASE_HP     = 1200;
const OGRE_DAMAGE = 25;

const ATTACK_RANGE    = 120;
const ATTACK_RANGE_SQ = ATTACK_RANGE * ATTACK_RANGE;

const ATTACK_COOLDOWN = 1500;
const FADE_OUT        = 900;

export const OGRE_HIT_RADIUS = 85;
const OGRE_HITBOX = OGRE_HIT_RADIUS * 1.4;

// Attack animation timings
const PHASE_SWITCH_TIME = 140;
const END_ATTACK_TIME   = 600;
const HIT_DELAY_TIME    = Math.max(0, PHASE_SWITCH_TIME - 20); // land hit at end of attack frame


// ------------------------------------------------------------
// 🖼️ SPRITE LOADING
// ------------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function loadOgreSprites() {
  ogreSprites = {
    idle:  await loadImage("./assets/images/sprites/ogre/ogre_idle.png"),
    slain: await loadImage("./assets/images/sprites/ogre/ogre_slain.png"),

    walk: {
      up: [
        await loadImage("./assets/images/sprites/ogre/ogre_W1.png"),
        await loadImage("./assets/images/sprites/ogre/ogre_W2.png")
      ],
      down: [
        await loadImage("./assets/images/sprites/ogre/ogre_S1.png"),
        await loadImage("./assets/images/sprites/ogre/ogre_S2.png")
      ],
      left: [
        await loadImage("./assets/images/sprites/ogre/ogre_A1.png"),
        await loadImage("./assets/images/sprites/ogre/ogre_A2.png")
      ],
      right: [
        await loadImage("./assets/images/sprites/ogre/ogre_D1.png"),
        await loadImage("./assets/images/sprites/ogre/ogre_D2.png")
      ],
    },

    attack: {
      left:  await loadImage("./assets/images/sprites/ogre/ogre_attack_left.png"),
      right: await loadImage("./assets/images/sprites/ogre/ogre_attack_right.png")
    },

    melee: {
      left:  await loadImage("./assets/images/sprites/ogre/ogre_melee_left.png"),
      right: await loadImage("./assets/images/sprites/ogre/ogre_melee_right.png")
    }
  };
}


// ------------------------------------------------------------
// 🌸 INIT
// ------------------------------------------------------------

export async function initOgres() {
  ogres = [];
  await loadOgreSprites();
}

function moveOgreWithCollision(o, dx, dy) {
  const w = OGRE_HITBOX;
  const h = OGRE_HITBOX;
  const rectX = o.x - w / 2;
  const rectY = o.y - h / 2 + OGRE_SIZE * 0.2;
  const moved = slideRect(rectX, rectY, w, h, dx, dy, { ignoreBounds: true });
  o.x = moved.x + w / 2;
  o.y = moved.y + h / 2 - OGRE_SIZE * 0.2;
  return moved.blocked === true;
}


export function spawnOgre(options = {}) {
  const { skipDifficultyScaling = false } = options;
  const p = gameState.player;
  if (!p) return;

  // Use REAL map dimensions — never fall back to 3000x3000
  const mapW = gameState.mapWidth;
  const mapH = gameState.mapHeight;

  if (!mapW || !mapH) {
    console.warn("⚠️ spawnOgre() called before map size was set");
    return;
  }

  // Spawn just outside the visible play area
  const spawnOffset = 40;

  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) {                   // Spawn above map
    x = Math.random() * mapW;
    y = -spawnOffset;
  }
  else if (side === 1) {              // Spawn below map
    x = Math.random() * mapW;
    y = mapH + spawnOffset;
  }
  else if (side === 2) {              // Spawn left of map
    x = -spawnOffset;
    y = Math.random() * mapH;
  }
  else {                              // Spawn right of map
    x = mapW + spawnOffset;
    y = Math.random() * mapH;
  }

  const hpMult = skipDifficultyScaling ? 1 : getDifficultyHpMultiplier();
  const scaledHP = Math.round(BASE_HP * hpMult);

  const ogre = {
    type: "ogre",

    x,
    y,

    hp: scaledHP,
    maxHp: scaledHP,

    alive: true,
    fading: false,
    fadeTimer: 0,

    attackCooldown: 0,
    attackPhase: 0,
    attackTimer: 0,
    attacking: false,
    damageApplied: false,

    dir: "down",
    frame: 0,
    frameTimer: 0,

    flashTimer: 0,
  };

  ogres.push(ogre);
  playOgreEnter();
  return ogre;
}




// ------------------------------------------------------------
// 🔁 UPDATE — AI, chase, attack, flash, fade
// ------------------------------------------------------------

export function updateOgres(delta = 16) {
  
  const p = gameState.player;
  if (!p) return;

  const px = p.pos?.x ?? p.x ?? 0;
  const py = p.pos?.y ?? p.y ?? 0;
  const dt = delta / 1000;

  for (let i = ogres.length - 1; i >= 0; i--) {
      const o = ogres[i];
      const startX = o.x;
      const startY = o.y;
      o.movedThisFrame = false;

      

    // --- Death fade ---
    if (!o.alive) {
      o.fadeTimer += delta;
      if (o.fadeTimer >= FADE_OUT) ogres.splice(i, 1);
      continue;
    }

    // --- Hit flash ---
    if (o.flashTimer > 0) {
      o.flashTimer -= delta;
      if (o.flashTimer < 0) o.flashTimer = 0;
    }

    const dx = px - o.x;
    const dy = py - o.y;
    const distSq = dx * dx + dy * dy;

    // ----------------------------------------------------
    // ⭐ BRAVERY AURA PUSHBACK (works in ALL states)
    // ----------------------------------------------------

    if (p.invincible === true) {
        applyBraveryAuraEffects(o);
    }

    


    // ----------------------------------------------------
    // 🗡 ATTACK SEQUENCE
    // ----------------------------------------------------
    if (o.attacking) {
      o.attackTimer += delta;

      // Phase switch (wind-up → swing)
      if (o.attackTimer >= PHASE_SWITCH_TIME && o.attackPhase === 0) {
        o.attackPhase = 1;
      }

      // Damage application
      if (o.attackTimer >= HIT_DELAY_TIME && !o.damageApplied) {
        o.damageApplied = true;

        // ⭐ BRAVERY INVULNERABILITY (ignore ALL ogre damage)
        if (p.invincible === true) {
            o.damageApplied = true; // mark as used so the attack ends normally
            continue;               // go to next ogre
        }

        p.hp = Math.max(0, p.hp - OGRE_DAMAGE);
        spawnFloatingText(px, py - 40, `-${OGRE_DAMAGE}`, "#ff5577");
        spawnDamageSparkles(px, py);
        playOgreAttack();
        updateHUD();
      }

      // End attack
      if (o.attackTimer >= END_ATTACK_TIME) {
        o.attacking = false;
        o.attackTimer = 0;
        o.attackPhase = 0;
        o.damageApplied = false;
      }

      continue;
    }


    // ----------------------------------------------------
    // 🤜 CHASE / STRIKE DECISION
    // ----------------------------------------------------
    if (distSq > ATTACK_RANGE_SQ) {
      // Chase
      const dist = Math.sqrt(distSq);
      const stepX = (dx / dist) * OGRE_SPEED * dt;
      const stepY = (dy / dist) * OGRE_SPEED * dt;
      const blocked = moveOgreWithCollision(o, stepX, stepY);

      if (blocked) {
        const sidestep = OGRE_SPEED * 0.55 * dt;
        const perpX = -stepY;
        const perpY = stepX;
        moveOgreWithCollision(
          o,
          perpX > 0 ? sidestep : -sidestep,
          perpY > 0 ? sidestep : -sidestep
        );
      }
            
      if (p.invincible === true) {
        const aura = 130; // same radius as bravery glow

        const dxp = o.x - px;
        const dyp = o.y - py;
        const dp = Math.hypot(dxp, dyp);

        if (dp < aura && dp > 0) {
          const push = (aura - dp) * 0.35;
          const nx = dxp / dp;
          const ny = dyp / dp;

          o.x += nx * push;
          o.y += ny * push;
        }
      }


    } else {
      // Attack if cooled down
      o.attackCooldown -= delta;
      if (o.attackCooldown <= 0) {
        startOgreAttack(o, dx);
        o.attackCooldown = ATTACK_COOLDOWN;
      }
    }

    // Direction (used for animation)
    o.dir =
      Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? "right" : "left")
        : (dy > 0 ? "down" : "up");


    // ----------------------------------------------------
    // 🧱 OGRE ↔ OGRE COLLISION
    // ----------------------------------------------------
    for (const other of ogres) {
      if (other === o || !other.alive) continue;

      const dx2 = o.x - other.x;
      const dy2 = o.y - other.y;
      const dist = Math.hypot(dx2, dy2);
      const minDist = 140;

      if (dist > 0 && dist < minDist) {
        const push = (minDist - dist) / 2;
        const nx = dx2 / dist;
        const ny = dy2 / dist;

        o.x += nx * push;
        o.y += ny * push;
        other.x -= nx * push;
        other.y -= ny * push;
      }
    }

    // Walk animation
    const movedDist = Math.hypot(o.x - startX, o.y - startY);
    o.movedThisFrame = movedDist > 0.25;

    if (o.movedThisFrame) {
      o.frameTimer += delta;
      if (o.frameTimer >= 220) {
        o.frameTimer = 0;
        o.frame = (o.frame + 1) % 2;
      }
    } else {
      o.frameTimer = 0;
      o.frame = 0;
    }
  }
}


// ------------------------------------------------------------
// ⚔️ START ATTACK
// ------------------------------------------------------------

function startOgreAttack(o, dx) {
  o.attacking = true;
  o.attackPhase = 0;
  o.attackTimer = 0;
  o.damageApplied = false;

  o.dir = dx < 0 ? "left" : "right";

  playOgreEnter();
}


// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------

export function damageOgre(o, amount) {
  if (!o || !o.alive) return;

  o.hp -= amount;
  o.flashTimer = 150;

  spawnFloatingText(o.x, o.y - 50, `-${amount}`, "#ff9999");
  playGoblinDamage();

  if (o.hp <= 0) {
    o.hp = 0;
    o.alive = false;
    Events.emit(E.enemyKilled, { type: "ogre", x: o.x, y: o.y });
    Events.emit(E.waveKillRegistered, { type: "ogre" });
    o.fading = true;

    spawnLoot("ogre", o.x, o.y);
    awardXP(15);
    addBravery(10);

    spawnFloatingText(o.x, o.y - 50, "💀 Ogre Down!", "#ffccff");
    playOgreSlain();
    updateHUD();
  }
}


// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------

export function drawOgres(ctx) {
  if (!ogreSprites) return;

  for (const o of ogres) {
    let img = ogreSprites.idle;

    if (!o.alive) {
      img = ogreSprites.slain;
    }
    else if (o.attacking) {
      const left = o.dir === "left";
      img =
        left
          ? (o.attackPhase === 0 ? ogreSprites.attack.left : ogreSprites.melee.left)
          : (o.attackPhase === 0 ? ogreSprites.attack.right : ogreSprites.melee.right);
    }
    else if (!o.movedThisFrame) {
      img = ogreSprites.idle;
    }
    else if (ogreSprites.walk[o.dir]) {
      img = ogreSprites.walk[o.dir][o.frame] || ogreSprites.idle;
    }

    const drawX = o.x - OGRE_SIZE / 2;
    let drawY = o.y - OGRE_SIZE / 2;

    if (o.alive) drawY -= 10;
    else drawY += 25;

    ctx.save();

    // Shadow
    ctx.beginPath();
    ctx.ellipse(
      o.x,
      o.y + OGRE_SIZE / 4.5,
      OGRE_SIZE * 0.35,
      OGRE_SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = "high";

    // Death fade
    const alpha = o.fading ? Math.max(0, 1 - o.fadeTimer / FADE_OUT) : 1;
    ctx.globalAlpha = alpha;

    // Hit flash filter
    if (o.flashTimer > 0) {
      const f = o.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + f * 0.5}) saturate(${1 + f * 1.5})`;
    }

    ctx.drawImage(img, drawX, drawY, OGRE_SIZE, OGRE_SIZE);

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // HP bar
    if (o.alive) {
      const pct = Math.max(0, Math.min(1, o.hp / o.maxHp));
      const bw = 50;
      const bh = 6;
      const off = OGRE_SIZE * 0.55;

      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(o.x - bw / 2, o.y + off, bw, bh);

      ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
      ctx.fillRect(o.x - bw / 2, o.y + off, bw * pct, bh);
    }

    ctx.restore();
  }
}


// ------------------------------------------------------------
// 📦 PUBLIC API
// ------------------------------------------------------------

export function getOgres() {
  return ogres;
}

export function clearOgres() {
  ogres = [];
}


// ============================================================
// 🌟 END OF FILE
// ============================================================

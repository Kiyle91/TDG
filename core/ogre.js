// ============================================================
// 👹 ogre.js — Olivia's World: Crystal Keep (OPTIMIZED Edition)
// ------------------------------------------------------------
// ✦ Independent AI — ignores path, hunts player directly
// ✦ 2× goblin size, large HP pool, strong melee hits
// ✦ Two-phase attack animation (attack → melee)
// ✦ 🆕 PERFORMANCE OPTIMIZATIONS:
//    - Squared distance calculations (no Math.hypot)
//    - Timer-based attacks instead of setTimeout
//    - Cached player position
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playOgreEnter, playOgreAttack, playOgreSlain, playGoblinDamage } from "./soundtrack.js";
import { damageEnemy } from "./enemies.js";
import { spawnDamageSparkles } from "./playerController.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";
import { spawnOgreLoot } from "./ogreLoot.js";


let ctx = null;
let ogres = [];
let ogreSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const OGRE_SIZE = 160;
const OGRE_SPEED = 30;
const OGRE_DAMAGE = 25;
const OGRE_HP = 600;
const ATTACK_RANGE = 120;
const ATTACK_RANGE_SQ = ATTACK_RANGE * ATTACK_RANGE; // 🆕 Squared for speed
const ATTACK_COOLDOWN = 1500;
const FADE_OUT = 900;
export const OGRE_HIT_RADIUS = 85;

// 🆕 Attack timing (replaces setTimeout)
const PHASE_SWITCH_TIME = 140;
const HIT_DELAY_TIME = 220;
const END_ATTACK_TIME = 600;

// ------------------------------------------------------------
// 🖼️ LOAD SPRITES
// ------------------------------------------------------------
async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadOgreSprites() {
  ogreSprites = {
    idle: await loadImage("./assets/images/sprites/ogre/ogre_idle.png"),
    slain: await loadImage("./assets/images/sprites/ogre/ogre_slain.png"),
    walk: {
      up: [await loadImage("./assets/images/sprites/ogre/ogre_W1.png"), await loadImage("./assets/images/sprites/ogre/ogre_W2.png")],
      down: [await loadImage("./assets/images/sprites/ogre/ogre_S1.png"), await loadImage("./assets/images/sprites/ogre/ogre_S2.png")],
      left: [await loadImage("./assets/images/sprites/ogre/ogre_A1.png"), await loadImage("./assets/images/sprites/ogre/ogre_A2.png")],
      right: [await loadImage("./assets/images/sprites/ogre/ogre_D1.png"), await loadImage("./assets/images/sprites/ogre/ogre_D2.png")],
    },
    attack: {
      left: await loadImage("./assets/images/sprites/ogre/ogre_attack_left.png"),
      right: await loadImage("./assets/images/sprites/ogre/ogre_attack_right.png"),
    },
    melee: {
      left: await loadImage("./assets/images/sprites/ogre/ogre_melee_left.png"),
      right: await loadImage("./assets/images/sprites/ogre/ogre_melee_right.png"),
    },
  };
  console.log("👹 Ogre sprites loaded (optimized).");
}

// ------------------------------------------------------------
// 🌿 INIT
// ------------------------------------------------------------
export async function initOgres() {
  ogres = [];
  await loadOgreSprites();
  console.log("👹 Ogre system initialized (optimized).");
}

// ------------------------------------------------------------
// 💀 SPAWN (internal use)
// ------------------------------------------------------------
function spawnOgreInternal(x, y) {
  ogres.push({
    type: "ogre",
    x,
    y,
    hp: OGRE_HP,
    maxHp: OGRE_HP,
    alive: true,
    fading: false,
    fadeTimer: 0,
    attackCooldown: 0,
    frame: 0,
    frameTimer: 0,
    dir: "down",
    attacking: false,
    attackPhase: 0,
    attackTimer: 0,        // 🆕 Timer-based attack instead of setTimeout
    damageApplied: false,  // 🆕 Track if damage was applied
  });
}

// ------------------------------------------------------------
// 🧠 UPDATE — hunts player directly (OPTIMIZED)
// ------------------------------------------------------------
export function updateOgres(delta = 16) {
  if (!gameState.player) return;
  const p = gameState.player;
  const dt = delta / 1000;
  
  // 🆕 Cache player position once
  const px = p.pos.x;
  const py = p.pos.y;

  for (const o of ogres) {
    if (!o.alive) {
      if (o.fading) {
        o.fadeTimer += delta;
        if (o.fadeTimer >= FADE_OUT) ogres.splice(ogres.indexOf(o), 1);
      }
      continue;
    }

    // 🆕 Use squared distance (avoid Math.hypot)
    const dx = px - o.x;
    const dy = py - o.y;
    const distSq = dx * dx + dy * dy;

    // 🆕 Timer-based attack system (replaces setTimeout)
    if (o.attacking) {
      o.attackTimer += delta;

      // Phase switch
      if (o.attackTimer >= PHASE_SWITCH_TIME && o.attackPhase === 0) {
        o.attackPhase = 1;
      }

      // Apply damage
      if (o.attackTimer >= HIT_DELAY_TIME && !o.damageApplied) {
        o.damageApplied = true;

        if (p.invincible) {
        o.damageApplied = true; // prevent repeat hits
        return;
}
        
        // Damage
        p.hp = Math.max(0, p.hp - OGRE_DAMAGE);
        spawnFloatingText(p.pos.x, p.pos.y - 40, `-${OGRE_DAMAGE}`, "#ff5577");
        playOgreAttack();
        spawnDamageSparkles(p.pos.x, p.pos.y);
        updateHUD();

        // Knockback
        const dist = Math.sqrt(distSq) || 1;
        const KNOCKBACK_FORCE = 50;
        p.pos.x += (dx / dist) * KNOCKBACK_FORCE;
        p.pos.y += (dy / dist) * KNOCKBACK_FORCE;
      }

      // End attack
      if (o.attackTimer >= END_ATTACK_TIME) {
        o.attacking = false;
        o.attackPhase = 0;
        o.attackTimer = 0;
        o.damageApplied = false;
      }
    } else {
      // Movement and attack initiation
      if (distSq > ATTACK_RANGE_SQ) {
        const dist = Math.sqrt(distSq);
        const move = OGRE_SPEED * dt;
        o.x += (dx / dist) * move;
        o.y += (dy / dist) * move;
      } else {
        o.attackCooldown -= delta;
        if (o.attackCooldown <= 0) {
          startOgreAttack(o, dx);
          o.attackCooldown = ATTACK_COOLDOWN;
        }
      }
    }

    // Direction (optimized - fewer checks)
    o.dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "right" : "left")
      : (dy > 0 ? "down" : "up");

    // ------------------------------------------------------------
    // 🤜 OGRE ↔ OGRE COLLISION (big push, visually clean)
    // ------------------------------------------------------------
    for (let k = 0; k < ogres.length; k++) {
        const other = ogres[k];
        if (other === o || !other.alive) continue;

        const dx = o.x - other.x;
        const dy = o.y - other.y;
        const dist = Math.hypot(dx, dy);

        const minDist = 140;  // ~85% of 160px — perfect for big ogres

        if (dist > 0 && dist < minDist) {
            const push = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;

            o.x += nx * push;
            o.y += ny * push;

            other.x -= nx * push;
            other.y -= ny * push;
        }
    }  

    // Animation
    o.frameTimer += delta;
    if (o.frameTimer >= 220) {
      o.frameTimer = 0;
      o.frame = (o.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// ⚔️ START ATTACK (no setTimeout)
// ------------------------------------------------------------
function startOgreAttack(o, dx) {
  o.attacking = true;
  o.attackPhase = 0;
  o.attackTimer = 0;
  o.damageApplied = false;
  
  // Face the player
  o.dir = Math.abs(dx) < 1 ? o.dir : (dx < 0 ? "left" : "right");
}

// ------------------------------------------------------------
// 💥 DAMAGE (OPTIMIZED - removed setTimeout)
// ------------------------------------------------------------
export function damageOgre(o, amount) {
  if (!o.alive) return;

  o.hp -= amount;
  o.flashTimer = 150;
  
  playGoblinDamage();
  spawnFloatingText(o.x, o.y - 50, `-${amount}`, "#ff9999");

  if (o.hp <= 0) {
    o.hp = 0;
    o.alive = false;
    o.fading = true;

    // Spawn loot with error handling
    try { 
      if (typeof spawnOgreLoot === 'function') {
        spawnOgreLoot(o.x, o.y);
      }
    } catch (err) { 
      console.warn("⚠️ Failed to spawn ogre loot:", err); 
    }

    awardXP(25);
    spawnFloatingText(o.x, o.y - 50, "💀 Ogre Down!", "#ffccff");
    playOgreSlain();
    updateHUD();
  }
}

// ------------------------------------------------------------
// 🎨 DRAW OGRES — High quality, crisp, unified style
// ------------------------------------------------------------
export function drawOgres(ctx) {
  if (!ctx || !ogres || !ogreSprites) return;

  const OGRE_SIZE = 160;
  const FEET_OFFSET = 25;
  const DEATH_DROP = 25;
  const LIFT_WHEN_ALIVE = 10;
  const FADE_OUT = 900;

  for (const o of ogres) {
    let img = ogreSprites.idle;

    // 🆕 Decrement flash timer in update loop instead
    if (o.flashTimer && o.flashTimer > 0) o.flashTimer -= 16;

    if (!o.alive) {
      img = ogreSprites.slain;
    } else if (o.attacking) {
      if (o.dir === "left") {
        img = (o.attackPhase === 0)
          ? ogreSprites.attack.left
          : (ogreSprites.melee?.left || ogreSprites.attack.left);
      } else {
        img = (o.attackPhase === 0)
          ? ogreSprites.attack.right
          : (ogreSprites.melee?.right || ogreSprites.attack.right);
      }
    } else if (o.dir && ogreSprites.walk[o.dir]) {
      img = ogreSprites.walk[o.dir][o.frame] || ogreSprites.idle;
    }

    if (!img) continue;

    const drawX = o.x - OGRE_SIZE / 2;
    let drawY = o.y - OGRE_SIZE / 2 - FEET_OFFSET;
    if (o.alive) drawY -= LIFT_WHEN_ALIVE;
    else drawY += DEATH_DROP;

    ctx.save();

    // SHADOW (unchanged)
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

    // 🆕 Proper high-quality smoothing like goblins/elites
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fade-out
    const alpha = o.fading ? Math.max(0, 1 - o.fadeTimer / FADE_OUT) : 1;
    ctx.globalAlpha = alpha;

    // Flash effect (same as before)
    if (o.alive && o.flashTimer > 0) {
      const flashAlpha = o.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else ctx.filter = "none";

    // 🆕 Unified drawing — same as new goblin system
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      drawX, drawY,
      OGRE_SIZE, OGRE_SIZE
    );

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // HP bar (unchanged)
    if (o.alive) {
      const hpPct = Math.max(0, Math.min(1, o.hp / o.maxHp));
      const barWidth = 80;
      const barHeight = 6;
      const barY = drawY - 14;

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(o.x - barWidth / 2, barY, barWidth, barHeight);

      ctx.fillStyle = `hsl(${hpPct * 120}, 100%, 50%)`;
      ctx.fillRect(o.x - barWidth / 2, barY, barWidth * hpPct, barHeight);
    }

    ctx.restore();
  }
}


// ------------------------------------------------------------
// 🔍 ACCESSOR
// ------------------------------------------------------------
export function getOgres() {
  return ogres;
}

// ------------------------------------------------------------
// ♻️ CLEAR OGRES
// ------------------------------------------------------------
export function clearOgres() {
  ogres = [];
  console.log("🧹 All ogres cleared.");
}

// ------------------------------------------------------------
// 👹 DEV COMMAND — spawn Ogre from top-left offscreen
// ------------------------------------------------------------
window.spawnOgre = function () {
  const startX = -80;
  const startY = 0;
  spawnOgreInternal(startX, startY);
  console.log(`👹 Ogre spawned offscreen top-left (${startX}, ${startY}) — HP: ${OGRE_HP}`);
  playOgreEnter();
  return ogres[ogres.length - 1];
};

window.getOgres = () => ogres;

// ------------------------------------------------------------
// 🧩 EXPORT — spawnOgre for boss integration
// ------------------------------------------------------------
export function spawnOgre() {
  const startX = -80;
  const startY = 0;
  const ogre = {
    type: "ogre",
    x: startX,
    y: startY,
    hp: 600,
    maxHp: 600,
    alive: true,
    fading: false,
    fadeTimer: 0,
    attackCooldown: 0,
    frame: 0,
    frameTimer: 0,
    dir: "down",
    attacking: false,
    attackPhase: 0,
    attackTimer: 0,
    damageApplied: false,
  };

  ogres.push(ogre);
  console.log(`👹 Ogre spawned offscreen top-left (${startX}, ${startY}) — HP: 600`);
  playOgreEnter();
  return ogre;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================
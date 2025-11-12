// ============================================================
// 👹 ogre.js — Olivia’s World: Crystal Keep (Elite Melee Brute)
// ------------------------------------------------------------
// ✦ Independent AI — ignores path, hunts player directly
// ✦ 2× goblin size, large HP pool, strong melee hits
// ✦ Two-phase attack animation (attack → melee)
// ✦ Uses ogre sprites from assets/images/sprites/ogre/
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playOgreEnter, playOgreAttack, playOgreSlain, playGoblinDamage } from "./soundtrack.js";
import { damageEnemy } from "./enemies.js"; // optional shared logic
import { spawnDamageSparkles } from "./playerController.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";
import { spawnOgreLoot } from "./ogreLoot.js"; // 💎 added for loot spawn on death

let ctx = null;
let ogres = [];
let ogreSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const OGRE_SIZE = 160;          // roughly double goblin size
const OGRE_SPEED = 30;          // slower but heavy
const OGRE_DAMAGE = 25;
const OGRE_HP = 600;
const ATTACK_RANGE = 120;
const ATTACK_COOLDOWN = 1500;
const FADE_OUT = 900;
export const OGRE_HIT_RADIUS = 85; 

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
    melee: { // ➕ extra phase
      left: await loadImage("./assets/images/sprites/ogre/ogre_melee_left.png"),
      right: await loadImage("./assets/images/sprites/ogre/ogre_melee_right.png"),
    },
  };
  console.log("👹 Ogre sprites loaded.");
}

// ------------------------------------------------------------
// 🌿 INIT
// ------------------------------------------------------------
export async function initOgres() {
  ogres = [];
  await loadOgreSprites();
  console.log("👹 Ogre system initialized.");
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
  });
}

// ------------------------------------------------------------
// 🧠 UPDATE — hunts player directly
// ------------------------------------------------------------
export function updateOgres(delta = 16) {
  if (!gameState.player) return;
  const p = gameState.player;
  const dt = delta / 1000;

  for (const o of ogres) {
    if (!o.alive) {
      if (o.fading) {
        o.fadeTimer += delta;
        if (o.fadeTimer >= FADE_OUT) ogres.splice(ogres.indexOf(o), 1);
      }
      continue;
    }

    const dx = p.pos.x - o.x;
    const dy = p.pos.y - o.y;
    const dist = Math.hypot(dx, dy);

    if (!o.attacking) {
      if (dist > ATTACK_RANGE) {
        const move = OGRE_SPEED * dt;
        o.x += (dx / dist) * move;
        o.y += (dy / dist) * move;
      } else {
        o.attackCooldown -= delta;
        if (o.attackCooldown <= 0) {
          performOgreAttack(o, p);
          o.attackCooldown = ATTACK_COOLDOWN;
        }
      }
    }

    o.dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? "right" : "left"
        : dy > 0 ? "down" : "up";

    o.frameTimer += delta;
    if (o.frameTimer >= 220) {
      o.frameTimer = 0;
      o.frame = (o.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// ⚔️ ATTACK — two-phase (attack → melee)
// ------------------------------------------------------------
function performOgreAttack(o, p) {
  o.attacking = true;
  o.attackPhase = 0;

  // Face the player
  const dx = p.pos.x - o.x;
  o.dir = Math.abs(dx) < 1 ? o.dir : (dx < 0 ? "left" : "right");

  const HIT_DELAY = 220;     // when axe connects
  const PHASE_SWITCH = 140;  // switch to melee frame
  const END_ATTACK = 600;    // total duration

  setTimeout(() => { if (o.alive) o.attackPhase = 1; }, PHASE_SWITCH);

  // Apply damage
  // Apply damage + KNOCKBACK
  setTimeout(() => {
    if (!o.alive) return;

    // 💥 Damage
    p.hp = Math.max(0, p.hp - OGRE_DAMAGE);
    spawnFloatingText(p.pos.x, p.pos.y - 40, `-${OGRE_DAMAGE}`, "#ff5577");
    playOgreAttack();
    spawnDamageSparkles(p.pos.x, p.pos.y);
    updateHUD();

    // ------------------------------------------------------------
    // 💨 KNOCKBACK — push player 100px away from the ogre
    // ------------------------------------------------------------
    const dx = p.pos.x - o.x;
    const dy = p.pos.y - o.y;
    const dist = Math.hypot(dx, dy) || 1;

    const KNOCKBACK_FORCE = 50; // ← adjust if needed

    // Normalize and apply push
    p.pos.x += (dx / dist) * KNOCKBACK_FORCE;
    p.pos.y += (dy / dist) * KNOCKBACK_FORCE;

    }, HIT_DELAY);

  setTimeout(() => { o.attacking = false; o.attackPhase = 0; }, END_ATTACK);
}

// ------------------------------------------------------------
// 💥 DAMAGE (includes flash + delayed hit SFX like goblins)
// ------------------------------------------------------------
export function damageOgre(o, amount) {
  if (!o.alive) return;

  o.hp -= amount;
  o.flashTimer = 150; // 💫 short visual flash duration

  // Delay the SFX to line up with the visual impact frame
  setTimeout(() => {
    playGoblinDamage(); // 🔊 use same short delay as goblins
  }, 100);

  spawnFloatingText(o.x, o.y - 50, `-${amount}`, "#ff9999");

  // 💀 Handle death
  if (o.hp <= 0) {
    o.hp = 0;
    o.alive = false;
    o.fading = true;

    // 🎁 Spawn loot (4 drops: chest, heart, diamond, mana)
    try { spawnOgreLoot(o.x, o.y); } 
    catch (err) { console.warn("⚠️ Failed to spawn ogre loot:", err); }

    awardXP(100);
    spawnFloatingText(o.x, o.y - 50, "💀 Ogre Down!", "#ffccff");
    playOgreSlain();
    updateHUD();
  }
}

// ------------------------------------------------------------
// 🎨 DRAW OGRES — full-size, ground-aligned (with hit flash)
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

    // 🕒 Reduce flash timer
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

    // 🌑 shadow (lifted slightly)
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

    const alpha = o.fading ? Math.max(0, 1 - o.fadeTimer / FADE_OUT) : 1;
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 💫 Flash effect
    if (o.alive && o.flashTimer > 0) {
      const flashAlpha = o.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else ctx.filter = "none";

    // 🖼️ Draw sprite
    ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, OGRE_SIZE, OGRE_SIZE);

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // ❤️ HP bar (only when alive)
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
  };

  ogres.push(ogre);
  console.log(`👹 Ogre spawned offscreen top-left (${startX}, ${startY}) — HP: 600`);
  playOgreEnter();
  return ogre;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

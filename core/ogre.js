// ============================================================
// 👹 ogre.js — Olivia’s World: Crystal Keep (Elite Melee Brute)
// ------------------------------------------------------------
// ✦ Independent AI — ignores path, hunts player directly
// ✦ 2× goblin size, large HP pool, strong melee hits
// ✦ Uses ogre sprites from assets/images/sprites/ogre/
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playGoblinAttack, playGoblinDamage, playGoblinDeath } from "./soundtrack.js";
import { damageEnemy } from "./enemies.js"; // optional shared logic
import { spawnDamageSparkles } from "./playerController.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";

let ctx = null;
let ogres = [];
let ogreSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const OGRE_SIZE = 80;          // roughly double goblin size
const OGRE_SPEED = 60;          // slower but heavy
const OGRE_DAMAGE = 25;
const OGRE_HP = 600;
const ATTACK_RANGE = 90;
const ATTACK_COOLDOWN = 1500;
const FADE_OUT = 900;

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
// 💀 SPAWN
// ------------------------------------------------------------
function spawnOgre() {
  ogres.push({
    x: 800 + Math.random() * 800,
    y: 600 + Math.random() * 600,
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
// ⚔️ ATTACK
// ------------------------------------------------------------
function performOgreAttack(o, p) {
  o.attacking = true;
  setTimeout(() => (o.attacking = false), 600);

  // Damage player
  p.hp = Math.max(0, p.hp - OGRE_DAMAGE);
  spawnFloatingText(p.pos.x, p.pos.y - 40, `-${OGRE_DAMAGE}`, "#ff5577");
  playGoblinAttack();
  spawnDamageSparkles(p.pos.x, p.pos.y);
  updateHUD();
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function damageOgre(o, amount) {
  if (!o.alive) return;
  o.hp -= amount;
  playGoblinDamage();
  spawnFloatingText(o.x, o.y - 50, `-${amount}`, "#ff9999");
  if (o.hp <= 0) {
    o.hp = 0;
    o.alive = false;
    o.fading = true;
    playGoblinDeath();
    awardXP(2000);
    spawnFloatingText(o.x, o.y - 50, "💀 Ogre Down!", "#ffccff");
    updateHUD();
  }
}

// ------------------------------------------------------------
// 🎨 DRAW OGRES — Full-Size Ground-Aligned Version
// ------------------------------------------------------------
export function drawOgres(ctx) {
  if (!ctx || !ogres || !ogreSprites) return;

  const OGRE_SIZE = 160;     // 2× goblin size
  const FEET_OFFSET = 25;    // pushes sprite down to touch ground
  const FADE_OUT = 900;

  for (const o of ogres) {
    let img = ogreSprites.idle;
    if (!o.alive) img = ogreSprites.slain;
    else if (o.attacking) {
      img = o.dir === "left" ? ogreSprites.attack.left : ogreSprites.attack.right;
    } else if (o.dir && ogreSprites.walk[o.dir]) {
      img = ogreSprites.walk[o.dir][o.frame] || ogreSprites.idle;
    }

    if (!img) continue;

    // Position & offset so feet sit on ground
    const drawX = o.x - OGRE_SIZE / 2;
    const drawY = o.y - OGRE_SIZE / 2 - FEET_OFFSET;

    ctx.save();

    // 🌑 Ground shadow (scaled for big size)
    ctx.beginPath();
    ctx.ellipse(
      o.x,
      o.y + OGRE_SIZE / 3.2,    // a bit lower for large body
      OGRE_SIZE * 0.35,
      OGRE_SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Fade while dying
    const alpha = o.fading ? Math.max(0, 1 - o.fadeTimer / FADE_OUT) : 1;
    ctx.globalAlpha = alpha;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw sprite
    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      drawX, drawY,
      OGRE_SIZE, OGRE_SIZE
    );

    ctx.globalAlpha = 1;

    // ❤️ HP bar (scaled + repositioned)
    if (o.alive) {
      const hpPct = Math.max(0, Math.min(1, o.hp / o.maxHp));
      const barWidth = 80;
      const barHeight = 6;
      const barY = drawY - 14; // just above head

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
// 🧙‍♂️ DEV COMMANDS — Manual Ogre Spawning from Console
// ------------------------------------------------------------
window.spawnOgre = function (x = 1000, y = 500) {
  const o = {
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
  };
  ogres.push(o);
  console.log(`👹 Ogre manually spawned at (${x}, ${y}) — HP: ${OGRE_HP}`);
  return o;
};

window.getOgres = () => ogres;
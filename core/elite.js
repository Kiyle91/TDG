// ============================================================
// 🟥 elite.js — Olivia’s World: Crystal Keep (Brute Hunter Enemy)
// ------------------------------------------------------------
// • Aggressive hunter enemy (tracks player, not path)
// • Independent from goblin.js/worg.js
// • Full elemental compatibility: Frost / Flame / Moon
// • Takes damage from player melee, spells, arrows
// • Smooth 2-frame animations
// • HP bar + flash + death fade
// • Works inside wave system
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { playGoblinDamage, playGoblinDeath } from "./soundtrack.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";

let eliteList = [];
let eliteSprites = null;

// ------------------------------------------------------------
// 📦 CONFIG
// ------------------------------------------------------------
const ELITE_HP = 550;
const ELITE_SPEED = 105;
const ELITE_SIZE = 80;
const ELITE_FRAME_INTERVAL = 220;
const FADE_OUT = 900;

const ELITE_XP_REWARD = 40;
const ELITE_GOLD_REWARD = 25;

// ------------------------------------------------------------
// 🖼 IMAGE LOADER
// ------------------------------------------------------------
async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

// ------------------------------------------------------------
// 🖼 LOAD SPRITES
// ------------------------------------------------------------
async function loadEliteSprites() {
  eliteSprites = {
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

    slain: await loadImage("./assets/images/sprites/elite/elite_slain.png"),
  };

  console.log("🟥 Elite sprites loaded.");
}

// ------------------------------------------------------------
// 🔧 INIT
// ------------------------------------------------------------
export async function initElites() {
  eliteList = [];
  await loadEliteSprites();
  console.log("🟥 Elite system initialized.");
}

// ------------------------------------------------------------
// 🟥 SPAWN
// ------------------------------------------------------------
export function spawnElite() {
  const p = gameState.player;
  if (!p) return;

  // Spawn randomly at map edge
  const mapW = gameState.mapWidth ?? 3000;
  const mapH = gameState.mapHeight ?? 3000;

  const side = Math.floor(Math.random() * 4);

  let x, y;

  switch (side) {
    case 0: // top
      x = Math.random() * mapW;
      y = -200;
      break;
    case 1: // bottom
      x = Math.random() * mapW;
      y = mapH + 200;
      break;
    case 2: // left
      x = -200;
      y = Math.random() * mapH;
      break;
    case 3: // right
      x = mapW + 200;
      y = Math.random() * mapH;
      break;
  }

  eliteList.push({
    type: "elite",
    x,
    y,

    hp: ELITE_HP,
    maxHp: ELITE_HP,

    alive: true,
    fade: 0,
    speed: ELITE_SPEED,

    frame: 0,
    frameTimer: 0,
    dir: "down",

    slowTimer: 0,
    burnTimer: 0,
    burnTick: 1000,
    burnDamage: 0,
    isBurning: false,
    stunTimer: 0,

    flashTimer: 0,
  });

  console.log("🟥 Elite spawned!");
}

// ------------------------------------------------------------
// 🔥 Elemental Effects
// ------------------------------------------------------------
function updateEliteEffects(e, dt) {
  // ❄️ FROST
  if (e.slowTimer > 0) e.slowTimer -= dt;

  // 🔥 BURN (DoT)
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

  // 🌙 STUN
  if (e.stunTimer > 0) {
    e.stunTimer -= dt;
    if (e.stunTimer < 0) e.stunTimer = 0;
  }
}

// ------------------------------------------------------------
// 🔁 UPDATE (Hunter AI)
// ------------------------------------------------------------
export function updateElites(delta = 16) {
  if (!eliteList.length) return;
  const dt = delta / 1000;

  const p = gameState.player;
  if (!p) return;

  for (let i = eliteList.length - 1; i >= 0; i--) {
    const e = eliteList[i];

    if (!e.alive) {
      e.fade += delta;
      if (e.fade >= FADE_OUT) eliteList.splice(i, 1);
      continue;
    }

    updateEliteEffects(e, dt);

    // Hit flash
    if (e.flashTimer > 0) {
      e.flashTimer -= delta;
      if (e.flashTimer < 0) e.flashTimer = 0;
    }

    // stun stops movement
    if (e.stunTimer > 0) continue;

    // HOMING AI
    const dx = p.pos.x - e.x;
    const dy = p.pos.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

      e.x += (dx / dist) * moveSpeed * dt;
      e.y += (dy / dist) * moveSpeed * dt;

      // Direction update
      e.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";
    }

    // Animation frames
    e.frameTimer += delta;
    if (e.frameTimer >= ELITE_FRAME_INTERVAL) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 2;
    }
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function damageElite(e, dmg) {
  if (!e || !e.alive) return;

  dmg = Math.round(Math.abs(dmg));

  e.hp -= dmg;
  e.flashTimer = 150;

  spawnFloatingText(e.x, e.y - 40, `-${dmg}`, "#ff3355");
  playGoblinDamage();

  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
    e.fade = 0;

    playGoblinDeath();
    awardXP(ELITE_XP_REWARD);
    addGold(ELITE_GOLD_REWARD);
    updateHUD();

    console.log("🟥 Elite defeated!");
  }
}

// ------------------------------------------------------------
// ❤️ HP BAR
// ------------------------------------------------------------
function drawEliteHpBar(ctx, e) {
  const barWidth = 50;
  const barHeight = 6;
  const offsetY = ELITE_SIZE * 0.55;
  const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(e.x - barWidth / 2, e.y + offsetY, barWidth, barHeight);

  const grad = ctx.createLinearGradient(
    e.x - barWidth / 2, 0,
    e.x + barWidth / 2, 0
  );
  grad.addColorStop(0, "#ff3355");
  grad.addColorStop(1, "#ff7788");

  ctx.fillStyle = grad;
  ctx.fillRect(e.x - barWidth / 2, e.y + offsetY, barWidth * pct, barHeight);

  ctx.strokeStyle = "rgba(255,182,193,0.7)";
  ctx.strokeRect(e.x - barWidth / 2, e.y + offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🖌️ DRAW
// ------------------------------------------------------------
export function drawElites(ctx) {
  if (!eliteSprites || !eliteList.length) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const e of eliteList) {
    const img = e.alive
      ? eliteSprites.run[e.dir]?.[e.frame] || eliteSprites.run.down[0]
      : eliteSprites.slain;

    const size = ELITE_SIZE;
    const drawX = e.x - size / 2;
    const drawY = e.y - size / 2;

    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(
      e.x,
      e.y + size * 0.45,
      size * 0.32,
      size * 0.13,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    // Hit flash
    if (e.flashTimer > 0 && e.alive) {
      const t = e.flashTimer / 150;
      ctx.globalAlpha = 1 - t * 0.3;
    }

    // Death fade
    if (!e.alive) {
      ctx.globalAlpha = Math.max(0, 1 - e.fade / FADE_OUT);
    }

    // ⭐ FIXED DRAWING (no cropping, draw actual frame directly)
    ctx.drawImage(img, drawX, drawY, size, size);

    // 🔥 FIRE EFFECT
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

    // ❄️ FROST EFFECT
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

    // ❤️ HP BAR
    if (e.alive) drawEliteHpBar(ctx, e);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 📦 GETTERS + CLEAR
// ------------------------------------------------------------
export function getElites() {
  return eliteList;
}

export function clearElites() {
  eliteList.length = 0;
}

// Expose for debugging
if (typeof window !== "undefined") {
  window.getElites = getElites;
  window.spawnElite = spawnElite;
}

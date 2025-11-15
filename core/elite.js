// ============================================================
// 🟥 elite.js — Olivia’s World: Crystal Keep (Brute Elite Hunter)
// ------------------------------------------------------------
// • Hunter enemy (tracks player instead of following path)
// • Full 2-frame RUN + full 2-frame ATTACK + idle + slain
// • Takes damage from melee, spells, arrows
// • Frost slow, Flame burn, Moon stun
// • HP bar + hit flash + death fade
// • Sized exactly like goblins (80px)
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";
import { playGoblinDamage, playGoblinDeath } from "./soundtrack.js";

// ------------------------------------------------------------
// 🧩 INTERNAL STATE
// ------------------------------------------------------------
let eliteList = [];
let eliteSprites = null;

// ------------------------------------------------------------
// ⚙ CONFIG
// ------------------------------------------------------------
const ELITE_HP = 150;
const ELITE_SPEED = 105;
const ELITE_SIZE = 80;             // SAME SIZE AS GOBLIN
const FRAME_INTERVAL = 220;
const ATTACK_RANGE = 55;
const ATTACK_DAMAGE = 14;
const ATTACK_TOTAL_TIME = 320;     // ms (0 → windup → hit)
const ATTACK_WINDUP = 120;         // ms to switch attack frame

const FADE_OUT = 900;

// Rewards
const EXP_REWARD = 40;
const GOLD_REWARD = 25;

// ------------------------------------------------------------
// 📦 IMAGE LOADER
// ------------------------------------------------------------
async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

// ------------------------------------------------------------
// 🖼 LOAD ALL SPRITES
// ------------------------------------------------------------
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
      ]
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
// 🟥 SPAWN — Hunters spawn off-screen
// ------------------------------------------------------------
export function spawnElite() {
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

  eliteList.push({
    type: "elite",
    x,
    y,

    hp: ELITE_HP,
    maxHp: ELITE_HP,

    alive: true,
    fade: 0,
    speed: ELITE_SPEED,

    dir: "down",
    frame: 0,
    frameTimer: 0,

    // Attack state
    attacking: false,
    attackFrame: 0,
    attackTimer: 0,

    // Effects
    flashTimer: 0,
    slowTimer: 0,
    isBurning: false,
    burnTimer: 0,
    burnTick: 1000,
    burnDamage: 0,
    stunTimer: 0,
  });

  console.log("🟥 Elite spawned.");
}

// ------------------------------------------------------------
// 🔁 UPDATE — Hunter AI + Attacks + Effects
// ------------------------------------------------------------
export function updateElites(delta = 16) {
  if (!eliteList.length || !gameState.player) return;

  const p = gameState.player;
  const dt = delta / 1000;

  for (let i = eliteList.length - 1; i >= 0; i--) {
    const e = eliteList[i];

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

    // ⏸️ STUN
    if (e.stunTimer > 0) {
      e.stunTimer -= delta;
      continue;
    }

    // ------------------------------------------------------------
    // 🔥 ELEMENTAL EFFECTS
    // ------------------------------------------------------------
    if (e.slowTimer > 0) e.slowTimer -= dt;

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

    // ------------------------------------------------------------
    // 🧠 CHASE PLAYER (unless attacking)
    // ------------------------------------------------------------
    const dx = p.pos.x - e.x;
    const dy = p.pos.y - e.y;
    const dist = Math.hypot(dx, dy);

    // ------------------------------------------------------------
    // 🗡️ ATTACK LOGIC
    // ------------------------------------------------------------
    if (!e.attacking && dist < ATTACK_RANGE) {
      e.attacking = true;
      e.attackTimer = ATTACK_TOTAL_TIME;

      e.attackFrame = 0; // windup

      // Switch to "melee" frame mid attack (like goblin)
      setTimeout(() => { if (e.alive) e.attackFrame = 1; }, ATTACK_WINDUP);

      // Deal damage slightly after frame 1
      setTimeout(() => {
        if (!e.alive) return;
        const pdx = p.pos.x - e.x;
        const pdy = p.pos.y - e.y;
        if (Math.hypot(pdx, pdy) < ATTACK_RANGE + 20) {
          const dmg = ATTACK_DAMAGE;
          p.hp = Math.max(0, p.hp - dmg);
          p.flashTimer = 200;

          spawnFloatingText(p.pos.x, p.pos.y - 30, `-${dmg}`, "#ff5577");
        }
      }, 180);

      // End attack
      setTimeout(() => {
        if (e.alive) {
          e.attacking = false;
          e.attackFrame = 0;
        }
      }, ATTACK_TOTAL_TIME);

      continue;
    }

    // ------------------------------------------------------------
    // 🏃 MOVEMENT (only if not attacking)
    // ------------------------------------------------------------
    if (!e.attacking) {
      const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

      if (dist > 5) {
        e.x += (dx / dist) * moveSpeed * dt;
        e.y += (dy / dist) * moveSpeed * dt;
      }

      // Direction
      e.dir =
        Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");

      // Run animation
      e.frameTimer += delta;
      if (e.frameTimer >= FRAME_INTERVAL) {
        e.frameTimer = 0;
        e.frame = (e.frame + 1) % 2;
      }
    }
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function damageElite(e, amount) {
  if (!e || !e.alive) return;

  const dmg = Math.round(Math.abs(amount));
  e.hp -= dmg;
  e.flashTimer = 150;

  spawnFloatingText(e.x, e.y - 40, `-${dmg}`, "#ff3355");
  playGoblinDamage();

  if (e.hp <= 0) {
    e.hp = 0;
    e.alive = false;
    e.fade = 0;

    playGoblinDeath();
    awardXP(EXP_REWARD);
    addGold(GOLD_REWARD);
    updateHUD();
  }
}

// ------------------------------------------------------------
// ❤️ HP BAR
// ------------------------------------------------------------
function drawEliteHpBar(ctx, e) {
  const barWidth = 46;
  const barHeight = 5;
  const offsetY = ELITE_SIZE * 0.52;

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
  ctx.strokeRect(e.x - barWidth / 2, e.y + offsetY, barWidth,barHeight);
}

// ------------------------------------------------------------
// 🖌 DRAW
// ------------------------------------------------------------
export function drawElites(ctx) {
  if (!eliteSprites || !eliteList.length) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const e of eliteList) {
    let img;

    if (!e.alive) {
      img = eliteSprites.slain;
    }
    else if (e.attacking) {
      const dir = e.dir === "left" ? "left" : "right";
      img = eliteSprites.attack[dir][e.attackFrame];
    }
    else if (e.frame !== undefined) {
      img = eliteSprites.run[e.dir]?.[e.frame] || eliteSprites.idle;
    }
    else {
      img = eliteSprites.idle;
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

    // Draw sprite
        if (!e.alive) {
        // 🟥 Death frame sits too high — shift down ~15%
        const deadOffset = size * 0.15;
        ctx.drawImage(img, drawX, drawY + deadOffset, size, size);
    } else {
        ctx.drawImage(img, drawX, drawY, size, size);
    }

    // 🔥 Burn aura
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

    // ❄ Frost aura
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

    // HP bar
    if (e.alive) drawEliteHpBar(ctx, e);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 📦 GETTER + CLEAR
// ------------------------------------------------------------
export function getElites() {
  return eliteList;
}

export function clearElites() {
  eliteList.length = 0;
}

if (typeof window !== "undefined") {
  window.getElites = getElites;
  window.spawnElite = spawnElite;
}

// ============================================================
// 🧌 troll.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// • Exact same system as goblins (path followers)
// • Much slower, much tankier
// • Uses goblin AI, damage, hit flash, death fade
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { updateHUD } from "./ui.js";
import { playGoblinDamage, playGoblinDeath } from "./soundtrack.js";

let trolls = [];
let pathPoints = [];
let trollSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const TROLL_SIZE = 90;
const TROLL_SPEED = 60;           // slower than goblin (120-140)
const TROLL_HP = 250;             // much more HP
const WALK_FRAME_INTERVAL = 220;

// ------------------------------------------------------------
// 🖼 LOAD SPRITE
// ------------------------------------------------------------
async function loadImage(src) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
  });
}

async function loadTrollSprites() {
  trollSprites = {
    walk: {
      left: [
        await loadImage("./assets/images/sprites/troll/troll_W1.png"),
        await loadImage("./assets/images/sprites/troll/troll_W2.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/troll/troll_D1.png"),
        await loadImage("./assets/images/sprites/troll/troll_D2.png"),
      ],
      up: [
        await loadImage("./assets/images/sprites/troll/troll_A1.png"),
        await loadImage("./assets/images/sprites/troll/troll_A2.png"),
      ],
      down: [
        await loadImage("./assets/images/sprites/troll/troll_S1.png"),
        await loadImage("./assets/images/sprites/troll/troll_S2.png"),
      ],
    },
    idle: await loadImage("./assets/images/sprites/troll/troll_idle.png"),
    slain: await loadImage("./assets/images/sprites/troll/troll_slain.png"),
  };
}

// ------------------------------------------------------------
// 🌿 INIT
// ------------------------------------------------------------
export async function initTrolls(points) {
  trolls = [];
  pathPoints = points || [];
  await loadTrollSprites();
  console.log("🧌 Trolls initialized.");
}

// ------------------------------------------------------------
// 💀 SPAWN
// ------------------------------------------------------------
export function spawnTroll() {
  if (!pathPoints.length) return;

  const start = pathPoints[0];
  trolls.push({
    type: "troll",
    x: start.x,
    y: start.y,
    hp: TROLL_HP,
    maxHp: TROLL_HP,
    alive: true,
    fading: false,
    fadeTimer: 0,
    frame: 0,
    frameTimer: 0,
    pathIndex: 0,
  });

  return trolls[trolls.length - 1];
}

// ------------------------------------------------------------
// 🧠 UPDATE — identical to goblins but slower + tankier
// ------------------------------------------------------------
export function updateTrolls(delta = 16) {
  if (!trollSprites) return;

  const dt = delta / 1000;

  for (const t of trolls) {
    if (!t.alive) {
      t.fadeTimer += delta;
      if (t.fadeTimer > 600) {
        trolls.splice(trolls.indexOf(t), 1);
      }
      continue;
    }

    // Reached player?
    const p = gameState.player;
    if (p && Math.hypot(p.pos.x - t.x, p.pos.y - t.y) < 36) {
      p.lives = Math.max(0, (p.lives || 1) - 1);
      t.alive = false;
      updateHUD();
      return;
    }

    // Follow path
    const target = pathPoints[t.pathIndex];
    if (!target) continue;

    const dx = target.x - t.x;
    const dy = target.y - t.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
      t.pathIndex++;
      continue;
    }

    t.x += (dx / dist) * TROLL_SPEED * dt;
    t.y += (dy / dist) * TROLL_SPEED * dt;

    // Frame animation
    t.frameTimer += delta;
    if (t.frameTimer >= WALK_FRAME_INTERVAL) {
      t.frame = (t.frame + 1) % 2;
      t.frameTimer = 0;
    }

    // Direction for sprites
    t.dir =
      Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? "right" : "left")
        : (dy > 0 ? "down" : "up");
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function damageTroll(t, amount) {
  if (!t.alive) return;

  t.hp -= amount;
  spawnFloatingText(t.x, t.y - 40, `-${amount}`, "#ff7777");
  playGoblinDamage();

  if (t.hp <= 0) {
    t.hp = 0;
    t.alive = false;
    t.fading = true;
    playGoblinDeath();
  }
}

// ============================================================
// 🎨 DRAW TROLLS — Crisp, 20% larger than goblins
// ============================================================
export function drawTrolls(ctx) {
  if (!ctx || !trolls || !trollSprites) return;

  const SIZE = 96;          // ⭐ 20% larger than 80px goblins
  const FEET_OFFSET = 12;
  const DEATH_DROP = 12;
  const ALIVE_LIFT = 4;
  const FADE_OUT = 900;

  for (const t of trolls) {
    let img = trollSprites.idle;

    // Flash timer decrease
    if (t.flashTimer && t.flashTimer > 0) t.flashTimer -= 16;

    // Pick correct frame
    if (!t.alive) {
      img = trollSprites.slain;
    } else if (t.attacking) {
      img = (t.dir === "left")
        ? trollSprites.attack.left
        : trollSprites.attack.right;
    } else if (t.dir && trollSprites.walk[t.dir]) {
      img = trollSprites.walk[t.dir][t.frame] || trollSprites.idle;
    }

    if (!img) continue;

    // Base draw positions
    const drawX = t.x - SIZE / 2;
    let drawY = t.y - SIZE / 2 - FEET_OFFSET;

    if (t.alive) drawY -= ALIVE_LIFT;
    else drawY += DEATH_DROP;

    ctx.save();

    // ============================================================
    // SHADOW
    // ============================================================
    ctx.beginPath();
    ctx.ellipse(
      t.x,
      t.y + SIZE / 4.2,
      SIZE * 0.35,
      SIZE * 0.18,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Fade-out corpse
    const alpha = t.fading ? Math.max(0, 1 - t.fadeTimer / FADE_OUT) : 1;
    ctx.globalAlpha = alpha;

    // Flash effect
    if (t.alive && t.flashTimer > 0) {
      const flashAlpha = t.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    // ============================================================
    // DRAW (corpse is slightly smaller)
    // ============================================================
    let drawSize = SIZE;
    if (!t.alive) drawSize = 84; // 12px reduction looks perfect

    ctx.drawImage(
      img,
      0, 0, img.width, img.height,
      t.x - drawSize / 2,
      drawY + (SIZE - drawSize) / 2,
      drawSize,
      drawSize
    );

    ctx.filter = "none";
    ctx.globalAlpha = 1;

    // ============================================================
    // HP BAR
    // ============================================================
    if (t.alive) {
      const hpPct = Math.max(0, Math.min(1, t.hp / t.maxHp));
      const barWidth = 60;
      const barHeight = 5;

      const barY = drawY - 10;

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(t.x - barWidth / 2, barY, barWidth, barHeight);

      ctx.fillStyle = `hsl(${hpPct * 120}, 100%, 50%)`;
      ctx.fillRect(t.x - barWidth / 2, barY, barWidth * hpPct, barHeight);
    }

    ctx.restore();
  }
}



// ------------------------------------------------------------
// ACCESS
// ------------------------------------------------------------
export function getTrolls() {
  return trolls;
}
export function clearTrolls() {
  trolls = [];
}

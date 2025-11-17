// ============================================================
// 🧌 troll.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// Troll = Goblin AI + Troll stats + Troll sprites
//  • Exact goblin behaviour: path → chase → return → attack
//  • Uses same attack frames/logic as goblins
//  • Takes damage like goblins
//  • Only difference: slower + more HP
// ============================================================

import { gameState } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { updateHUD } from "./ui.js";
import { playGoblinDamage, playGoblinDeath, playGoblinAttack, playPlayerDamage } from "./soundtrack.js";
import { spawnDamageSparkles } from "./playerController.js";
import { trySpawnGoblinDrop } from "./drops.js";

let trolls = [];
let pathPoints = [];
let trollSprites = null;

// ------------------------------------------------------------
// ⚙️ CONFIG (Troll stats)
// ------------------------------------------------------------
const SIZE = 96;                 // goblins = 80
const SPEED = 55;                // goblins = 80
const HP = 140;                  // goblins = 75
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_RANGE = 260;
const ATTACK_COOLDOWN = 1000;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT = 900;

// ------------------------------------------------------------
// 🖼 LOAD SPRITES
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
// 🌱 INIT
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
    hp: HP,
    maxHp: HP,
    alive: true,
    fading: false,
    fadeTimer: 0,
    frame: 0,
    frameTimer: 0,
    pathIndex: 0,
    state: "path",
    attackCooldown: 0,
    attackFrame: 0,
    attackDir: "right",
    flashTimer: 0,
  });

  return trolls[trolls.length - 1];
}

// ------------------------------------------------------------
// 🗡 ATTACK PLAYER (same as goblin)
// ------------------------------------------------------------
function attackPlayer(t, player) {
  if (!player || player.dead) {
    t.attacking = false;
    return;
  }

  playGoblinAttack();

  let damage = 8; // same as goblins
  const def = player.defense || 5;
  const reduction = Math.min(0.5, def / 100);
  damage *= (1 - reduction);

  player.hp = Math.max(0, player.hp - damage);
  player.flashTimer = 200;
  player.invulnTimer = 800;

  updateHUD();

  spawnFloatingText(player.pos.x, player.pos.y - 40, `-${Math.round(damage)}`, "#ff6fb1");
  spawnDamageSparkles(player.pos.x, player.pos.y);
  playPlayerDamage();

  // Animation
  t.attackFrame = 0;
  t.attackDir = t.dir === "left" ? "left" : "right";

  setTimeout(() => { if (t.alive) t.attackFrame = 1; }, 150);
  setTimeout(() => { if (t.alive) t.attacking = false; }, 400);
}

// ------------------------------------------------------------
// 🧠 UPDATE — EXACT MATCH to goblin logic
// ------------------------------------------------------------
export function updateTrolls(delta = 16) {
  if (!trollSprites || !pathPoints.length) return;

  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;

  const px = player?.pos?.x ?? null;
  const py = player?.pos?.y ?? null;

  // ============================================================
  // MAIN TROLL LOOP
  // ============================================================
  for (const t of trolls) {

    // ------------------------------
    // DEATH HANDLING
    // ------------------------------
    if (!t.alive) {
      t.fadeTimer += delta;
      continue;
    }

    // ------------------------------
    // ATTACK COOLDOWN
    // ------------------------------
    t.attackCooldown = Math.max(0, t.attackCooldown - delta);

    // ------------------------------
    // DISTANCE TO PLAYER
    // ------------------------------
    let chase = false;
    if (px !== null) {
      const dxp = px - t.x;
      const dyp = py - t.y;
      const distP = Math.hypot(dxp, dyp);

      if (distP < AGGRO_RANGE) chase = true;
      if (distP > RETURN_RANGE) chase = false;

      t.chasing = chase;
      t.distToPlayer = distP;
    }

    // ============================================================
    // 🐺 CHASE MODE
    // ============================================================
    if (t.chasing && px !== null) {
      const dx = px - t.x;
      const dy = py - t.y;

      // Try to attack if close
      if (t.distToPlayer < ATTACK_RANGE) {
        if (t.attackCooldown === 0) {
          t.attacking = true;
          attackPlayer(t, player);
          t.attackCooldown = ATTACK_COOLDOWN;
        }
        continue;
      }

      // Move toward player
      const dist = Math.hypot(dx, dy) || 1;
      t.x += (dx / dist) * SPEED * dt;
      t.y += (dy / dist) * SPEED * dt;

      // Direction
      t.dir =
        Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? "right" : "left")
          : (dy > 0 ? "down" : "up");

      // Walk animation
      t.frameTimer += delta;
      if (t.frameTimer >= WALK_FRAME_INTERVAL) {
        t.frameTimer = 0;
        t.frame = (t.frame + 1) % 2;
      }

    }

    // ============================================================
    // 🛣 PATH MODE
    // ============================================================
    else {
      const target = pathPoints[t.pathIndex];
      if (!target) {
        handleEscape(t);
        continue;
      }

      const dx = target.x - t.x;
      const dy = target.y - t.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < 6) {
        t.pathIndex++;
        if (t.pathIndex >= pathPoints.length) handleEscape(t);
      } else {
        t.x += (dx / dist) * SPEED * dt;
        t.y += (dy / dist) * SPEED * dt;

        t.dir =
          Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? "right" : "left")
            : (dy > 0 ? "down" : "up");
      }

      // Walk animation
      t.frameTimer += delta;
      if (t.frameTimer >= WALK_FRAME_INTERVAL) {
        t.frameTimer = 0;
        t.frame = (t.frame + 1) % 2;
      }
    }

    // ============================================================
    // FLASH TIMER (Hit red fade-out)
    // ============================================================
    if (t.flashTimer > 0) {
      t.flashTimer -= delta;
      if (t.flashTimer < 0) t.flashTimer = 0;
    }

    // ============================================================
    // 🟣 PLAYER ↔ TROLL COLLISION (Goblin-style soft push)
    // ============================================================
    const dxp = player.pos.x - t.x;
    const dyp = player.pos.y - t.y;
    const distP = Math.hypot(dxp, dyp);

    const PLAYER_COLLIDE_DIST = 50;  // same radius used for goblins

    if (distP < PLAYER_COLLIDE_DIST && distP > 0) {
      const overlap = (PLAYER_COLLIDE_DIST - distP) / 3;
      const nx = dxp / distP;
      const ny = dyp / distP;

      player.pos.x += nx * overlap * 0.8;
      player.pos.y += ny * overlap * 0.8;
    }
  }

  // ============================================================
  // 🟢 TROLL ↔ TROLL COLLISION (Goblin-style)
  // ============================================================
  const MIN_TROLL_DIST = 72; // identical spacing to goblins

  for (let i = 0; i < trolls.length; i++) {
    const a = trolls[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < trolls.length; j++) {
      const b = trolls[j];
      if (!b.alive) continue;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < MIN_TROLL_DIST) {
        const push = (MIN_TROLL_DIST - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        a.x += nx * push;
        a.y += ny * push;

        b.x -= nx * push;
        b.y -= ny * push;
      }
    }
  }

  // ============================================================
  // CLEANUP DEAD (Unload faded corpses)
  // ============================================================
  for (let i = trolls.length - 1; i >= 0; i--) {
    if (!trolls[i].alive && trolls[i].fadeTimer >= FADE_OUT) {
      trolls.splice(i, 1);
    }
  }
}


// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------
export function damageTroll(t, amount) {
  if (!t || !t.alive) return;

  const dmg = Math.max(0, Number(amount));
  if (dmg <= 0) return;

  t.hp -= dmg;

  spawnFloatingText(t.x, t.y - 40, `-${Math.round(dmg)}`, "#ff7777");
  playGoblinDamage();
  t.flashTimer = 150;

  if (t.hp <= 0) {
    t.hp = 0;
    t.alive = false;
    t.fadeTimer = 0;
    playGoblinDeath();
    trySpawnGoblinDrop(t.x, t.y);
  }
}

// ------------------------------------------------------------
// 🎨 DRAW — crisp, goblin-quality rendering + flash fade
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

    // ---------------------------------------
    // 🔍 High-quality smoothing (matches goblins)
    // ---------------------------------------
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.mozImageSmoothingEnabled = true;

    // ---------------------------------------
    // Shadow
    // ---------------------------------------
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

    // ---------------------------------------
    // Fade out corpse
    // ---------------------------------------
    if (!t.alive) {
      ctx.globalAlpha = Math.max(0, 1 - t.fadeTimer / FADE_OUT);
    }

    // ---------------------------------------
    // Flash effect (proper fade-out)
    // ---------------------------------------
    if (t.flashTimer > 0) {
      const alpha = t.flashTimer / 150;
      ctx.filter = `brightness(${1 + alpha * 0.4}) saturate(${1 + alpha})`;
    } else {
      ctx.filter = "none";
    }

    // ---------------------------------------
    // Draw troll sprite
    // ---------------------------------------
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

    // ---------------------------------------
    // HP BAR
    // ---------------------------------------
    if (t.alive) {
      const barW = 60, barH = 5;
      const pct = Math.max(0, Math.min(1, t.hp / t.maxHp));
      const barY = drawY - 8;

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(t.x - barW / 2, barY, barW, barH);

      ctx.fillStyle = `hsl(${pct * 120},100%,50%)`;
      ctx.fillRect(t.x - barW / 2, barY, barW * pct, barH);
    }

    ctx.restore();
  }
}


// ------------------------------------------------------------
// Sprite selector
// ------------------------------------------------------------
function getSprite(t) {
  if (!t.alive) return trollSprites.slain;

  if (t.attacking) {
    return trollSprites.attack[t.attackDir][t.attackFrame];
  }

  if (t.dir && trollSprites.walk[t.dir]) {
    return trollSprites.walk[t.dir][t.frame];
  }

  return trollSprites.idle;
}


// ------------------------------------------------------------
// ACCESS
// ------------------------------------------------------------
export function getTrolls() { return trolls; }
export function clearTrolls() { trolls = []; }

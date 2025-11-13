// ============================================================
// 👹 enemies.js — Olivia’s World: Crystal Keep (Elemental + Continuous Spawn + Physical Collision)
// ------------------------------------------------------------
// ✦ Adds Frost slow, Flame burn DoT, Moon knockback
// ✦ Continuous spawn system (1 goblin every 5s)
// ✦ Goblin ↔ Goblin + Goblin ↔ Player physical collision
// ✦ Smooth chase / attack / path-follow logic + death fade
// ✦ Full compatibility with towers, playerController, HUD
// ============================================================

import { TILE_SIZE } from "../utils/constants.js";
import { addGold, gameState } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { incrementGoblinDefeated } from "./game.js";
import { spawnFloatingText } from "./floatingText.js";
import {
  playGoblinAttack,
  playGoblinDeath,
  playPlayerDamage,
  playGoblinDamage,
} from "./soundtrack.js";
import { spawnDamageSparkles } from "./playerController.js";
import { awardXP } from "./levelSystem.js";
import { triggerMidBattleStory } from "./story.js";
import { trySpawnGoblinDrop } from "./goblinDrop.js";

let enemies = [];
let ctx = null;
let pathPoints = [];
let goblinSprites = null;

let enemiesSpawned = 0;
let storyTriggered = false;

window.__enemies = enemies;

// ============================================================
// ⚙️ CONFIG
// ============================================================
const ENEMY_SIZE = 80;
const BASE_SPEED = 80;
const WALK_FRAME_INTERVAL = 220;
const FADE_OUT_TIME = 900;
const DEFAULT_HP = 175;
const HITBOX_OFFSET_Y = 15;
const ATTACK_RANGE = 80;
const AGGRO_RANGE = 150;
const RETURN_DELAY = 1200;
const ATTACK_COOLDOWN = 1000;
const GOBLIN_DAMAGE = 8;
const DEATH_LAY_DURATION = 600;

let spawnTimer = 0;
const SPAWN_INTERVAL = 5000;
const MAX_ACTIVE_ENEMIES = 50;


function getChaseSpread() {
  // Count goblins currently in chase
  let chasing = 0;
  for (const g of enemies) {
    if (g.state === "chase" && g.alive) chasing++;
  }

  // Spread scaling
  if (chasing < 5) return 10;     // small pack
  if (chasing < 10) return 20;    // medium pack
  if (chasing < 20) return 32;    // large pack
  return 48;                       // massive horde
}

// ============================================================
// 🧩 LOAD SPRITES
// ============================================================
async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadGoblinSprites() {
  goblinSprites = {
    idle: await loadImage("./assets/images/sprites/goblin/goblin_idle.png"),
    walk: {
      up: [
        await loadImage("./assets/images/sprites/goblin/goblin_W1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_W2.png"),
      ],
      down: [
        await loadImage("./assets/images/sprites/goblin/goblin_S1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_S2.png"),
      ],
      left: [
        await loadImage("./assets/images/sprites/goblin/goblin_A1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_A2.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/goblin/goblin_D1.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_D2.png"),
      ],
    },
    attack: {
      left: [
        await loadImage("./assets/images/sprites/goblin/goblin_attack_left.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_melee_left.png"),
      ],
      right: [
        await loadImage("./assets/images/sprites/goblin/goblin_attack_right.png"),
        await loadImage("./assets/images/sprites/goblin/goblin_melee_right.png"),
      ],
    },
    slain: await loadImage("./assets/images/sprites/goblin/goblin_slain.png"),
  };
  console.log("👹 Goblin sprites loaded (directional + attack + death).");
}

// ============================================================
// 🌍 PATH + INIT
// ============================================================
export function setEnemyPath(points) {
  pathPoints = points || [];
}

export async function initEnemies() {
  enemies = [];
  window.__enemies = enemies;
  enemiesSpawned = 0;
  storyTriggered = false;
  await loadGoblinSprites();
  spawnEnemy();
  spawnTimer = SPAWN_INTERVAL;
}

// ============================================================
// 💀 SPAWN
// ============================================================
function spawnEnemy() {
  if (!pathPoints.length) {
    console.warn("⚠️ No path points — cannot spawn enemies.");
    return;
  }

  enemies.push({
    x: pathPoints[0].x,
    y: pathPoints[0].y,
    width: 42,
    height: 42,
    hp: DEFAULT_HP,
    maxHp: DEFAULT_HP,
    targetIndex: 1,
    frameTimer: 0,
    frame: 0,
    dir: "down",
    alive: true,
    fading: false,
    fadeTimer: 0,
    deathTimer: 0,
    hitboxOffsetY: HITBOX_OFFSET_Y,
    state: "path",
    attackCooldown: 0,
    returnTimer: 0,
    flashTimer: 0,
    slowTimer: 0,
    burnTimer: 0,
    burnDamage: 0,
    knockback: 0,
    speed: BASE_SPEED,
    laneOffset: 0,
  });

  enemiesSpawned++;

  if (enemiesSpawned >= 25 && !storyTriggered) {
    storyTriggered = true;
    console.log("📖 Triggering mid-battle story...");
    try {
      triggerMidBattleStory();
    } catch (e) {
      console.warn("⚠️ triggerMidBattleStory failed:", e);
    }
  }

  window.__enemies = enemies;
}

// ============================================================
// 🧠 UPDATE ENEMIES (Ultimate Anti-Jam + MergeOffset Edition)
// ============================================================
export function updateEnemies(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;
  const player = gameState.player;
  if (!player) return;

  const px = player?.pos?.x ?? player.x ?? 0;
  const py = player?.pos?.y ?? player.y ?? 0;

  // Count active enemies for dynamic chase spread
  let activeCount = 0;
  for (const e of enemies) {
    if (e.alive) activeCount++;
  }

  // Wider spread for large hordes
  let chaseSpread = 12;
  if (activeCount >= 10 && activeCount < 20) chaseSpread = 22;
  else if (activeCount >= 20 && activeCount < 30) chaseSpread = 32;
  else if (activeCount >= 30) chaseSpread = 42;

  // ----------------------------------------------------------
  // MAIN UPDATE LOOP
  // ----------------------------------------------------------
  for (const e of enemies) {

    // Death & fade logic
    if (!e.alive) {
      if (!e.fading) {
        e.deathTimer += delta;
        if (e.deathTimer >= DEATH_LAY_DURATION) e.fading = true;
      } else {
        e.fadeTimer += delta;
      }
      continue;
    }

    handleElementalEffects(e, dt);

    // Distance to player
    const dxp = px - e.x;
    const dyp = py - e.y;
    const distToPlayer = Math.hypot(dxp, dyp);

    // Acquire aggro
    if (distToPlayer < AGGRO_RANGE && e.state === "path") {
      e.state = "chase";
    }

    // ==========================================================
    // CHASE MODE
    // ==========================================================
    if (e.state === "chase") {

      if (distToPlayer > AGGRO_RANGE * 1.5) {
        // Lose line of sight → Return mode
        e.state = "return";
        e.returnTimer = 0;

        // Spread returning goblins horizontally
        e.returnOffset = (Math.random() * 60 - 30);  // -30..+30 px

      } else if (distToPlayer > ATTACK_RANGE) {

        const moveSpeed = e.speed * (e.slowTimer > 0 ? 0.5 : 1);

        // Spread goblins around the player (perpendicular offset)
        const dirX = dxp / (distToPlayer || 1);
        const dirY = dyp / (distToPlayer || 1);
        const perpX = -dirY;
        const perpY = dirX;

        const laneOffset = e.laneOffset ?? 0;
        const extraSpread = Math.random() * chaseSpread - chaseSpread / 2;
        const sideOffset = laneOffset + extraSpread;

        const chaseTX = px + perpX * sideOffset;
        const chaseTY = py + perpY * sideOffset;

        const ddx = chaseTX - e.x;
        const ddy = chaseTY - e.y;
        const chaseDist = Math.hypot(ddx, ddy) || 1;

        e.x += (ddx / chaseDist) * moveSpeed * dt;
        e.y += (ddy / chaseDist) * moveSpeed * dt;

      } else {

        // --- Attack player ---
        e.attackCooldown -= delta;
        if (e.attackCooldown <= 0) {
          e.attackCooldown = ATTACK_COOLDOWN;
          player.hp = Math.max(0, (player.hp ?? 0) - GOBLIN_DAMAGE);

          playGoblinAttack();
          setTimeout(() => playPlayerDamage(), 350);
          spawnDamageSparkles(px, py);

          e.attacking = true;
          e.attackDir = px < e.x ? "left" : "right";
          e.attackFrame = 0;

          setTimeout(() => (e.attackFrame = 1), 150);
          setTimeout(() => (e.attacking = false), 350);
        }
      }
    }

    // ==========================================================
    // RETURN MODE
    // ==========================================================
    if (e.state === "return") {
      e.returnTimer += delta;

      if (e.returnTimer > RETURN_DELAY) {

        let nearestIndex = 0;
        let nearestDist = Infinity;

        for (let i = 0; i < pathPoints.length; i++) {
          const dx = (pathPoints[i].x + (e.returnOffset || 0)) - e.x;
          const dy = pathPoints[i].y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = i;
          }
        }

        // Random nearby path point = NO MORE JAM
        let nearby = nearestIndex + Math.floor(Math.random() * 3) - 1; // -1..+1
        nearby = Math.max(0, Math.min(pathPoints.length - 1, nearby));

        e.targetIndex = nearby;
        e.state = "path";

        // ⭐ NEW: MergeOffset for smooth rejoin
        e.mergeOffset = (Math.random() * 80 - 40); // -40..+40 px
        e.mergeSteps = 2; // apply for 2 nodes
      }
    }

    // ==========================================================
    // FOLLOW PATH MODE
    // ==========================================================
    if (e.state === "path") {

      const target = pathPoints[e.targetIndex];
      if (!target) continue;

      const laneOffset = e.laneOffset ?? 0;

      // Apply laneOffset + returnOffset + mergeOffset
      const tx =
        target.x +
        laneOffset +
        (e.returnOffset || 0) +
        (e.mergeOffset || 0);

      const ty = target.y;

      const dx = tx - e.x;
      const dy = ty - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Animate sprite direction
      e.dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0 ? "right" : "left"
          : dy > 0 ? "down" : "up";

      if (dist > 1) {

        e.x += (dx / dist) * e.speed * dt;
        e.y += (dy / dist) * e.speed * dt;

        // ⭐ Anti-corner wedge nudging
        if (dist < 12) {
          const perpX = -dy / (dist || 1);
          const perpY = dx / (dist || 1);
          e.x += perpX * 16 * dt;
          e.y += perpY * 16 * dt;
        }

      } else {

        // Arrived at this node → move to next
        e.targetIndex++;

        // Remove returnOffset after merging in
        if (e.returnOffset) e.returnOffset = 0;

        // MergeOffset lasts 2 nodes only
        if (e.mergeSteps > 0) {
          e.mergeSteps--;
          if (e.mergeSteps === 0) e.mergeOffset = 0;
        }

        if (e.targetIndex >= pathPoints.length) {
          handleGoblinEscape(e);
          continue;
        }
      }
    }

    // Knockback
    if (e.knockback > 0) {
      e.knockback -= dt * 20;
      e.y -= e.knockback;
    }

    // Animation
    e.frameTimer += delta;
    if (e.frameTimer >= WALK_FRAME_INTERVAL) {
      e.frameTimer = 0;
      e.frame = (e.frame + 1) % 2;
    }

    if (e.flashTimer > 0) e.flashTimer -= delta;
  }

  // ==========================================================
  // GOBLIN ↔ GOBLIN COLLISION (widened)
  // ==========================================================
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (!a.alive) continue;

    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (!b.alive) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);

      const minDist = 38; // upgraded personal space

      if (dist > 0 && dist < minDist) {
        const overlap = (minDist - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;
      }
    }

    // Player pushback
    if (player && !player.dead) {
      const dxp2 = a.x - player.pos.x;
      const dyp2 = a.y - player.pos.y;
      const distP = Math.hypot(dxp2, dyp2);

      const minDistP = 45;
      if (distP > 0 && distP < minDistP) {
        const push = (minDistP - distP) / 8;
        const nx = dxp2 / distP;
        const ny = dyp2 / distP;

        a.x += nx * push;
        a.y += ny * push;
      }
    }
  }

  // ==========================================================
  // REMOVE FADED CORPSES
  // ==========================================================
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e.alive && e.fading && e.fadeTimer >= FADE_OUT_TIME) {
      enemies.splice(i, 1);
    }
  }

  // ==========================================================
  // CONTINUOUS SPAWNING
  // ==========================================================
  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    if (
      enemiesSpawned < 50 &&
      enemies.length < MAX_ACTIVE_ENEMIES
    ) {
      spawnEnemy();
      spawnTimer = SPAWN_INTERVAL;
    }
  }

  window.__enemies = enemies;
}




// ============================================================
// 🌡️ ELEMENTAL EFFECTS (Frost Slow + Burn DOT — Non-stacking, Emoji-only)
// ============================================================
function handleElementalEffects(e, dt) {

  // ------------------------------------------------------------
  // ❄ FROST SLOW (non-stacking, clean expire)
  // ------------------------------------------------------------
  if (e.slowTimer > 0) {
    e.slowTimer -= dt * 1000;

    if (e.slowTimer <= 0) {
      e.slowTimer = 0;
      e.speed = BASE_SPEED;        // restore normal speed
      e._owFrostSlowed = false;    // allow slow to be applied again
    }
  }

  // ------------------------------------------------------------
  // 🔥 BURN DOT (single instance per goblin, ticks every 1s)
  // ------------------------------------------------------------
  if (e.isBurning) {

    // Count down total burn duration
    e.burnTimer -= dt * 1000;

    // Tick timer
    e.burnTick -= dt * 1000;

    // Time for next tick
    if (e.burnTick <= 0) {
      e.burnTick = 1000;   // reset for 1 second

      // Apply burn tick damage
      damageEnemy(e, e.burnDamage);
      
    }

    // Burn expired
    if (e.burnTimer <= 0) {
      e.isBurning = false;
      e.burnDamage = 0;
      // tick counter left alone intentionally
    }
  }
}




// ============================================================
// 🎯 DAMAGE
// ============================================================
export function damageEnemy(enemy, amount) {
  if (!enemy || !enemy.alive) return;
  const dmg = Number(amount);
  if (isNaN(dmg) || dmg <= 0) return;

  spawnFloatingText(enemy.x, enemy.y - 30, -Math.abs(Math.round(dmg)), "#ff5c8a", 18);
  enemy.hp -= dmg;
  enemy.flashTimer = 150;
  playGoblinDamage();

  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    enemy.deathTimer = 0;
    enemy.fading = false;
    enemy.fadeTimer = 0;
    playGoblinDeath();
    incrementGoblinDefeated();
    awardXP(10);
    addGold(5);
    updateHUD();
    trySpawnGoblinDrop(enemy.x, enemy.y);
  }
}

// ============================================================
// 💔 ESCAPE
// ============================================================
function handleGoblinEscape(enemy) {
  if (gameState.player) {
    if (gameState.player.lives === undefined) gameState.player.lives = 10;
    gameState.player.lives = Math.max(0, gameState.player.lives - 1);
    updateHUD();
  }
  enemy.alive = false;
  enemy.hp = 0;
  enemy.fadeTimer = FADE_OUT_TIME;
}

// ============================================================
// 🎨 DRAW ENEMIES (Fire + Frost Overlay Effects)
// ============================================================
export function drawEnemies(context) {
  if (!goblinSprites) return;
  ctx = context;

  for (const e of enemies) {
    const img = getEnemySprite(e);
    if (!img) continue;

    const drawX = e.x - ENEMY_SIZE / 2;
    const drawY = e.y - ENEMY_SIZE / 2;

    ctx.save();

    // 🕳 Shadow
    ctx.beginPath();
    ctx.ellipse(
      e.x,
      e.y + ENEMY_SIZE / 2.3,
      ENEMY_SIZE * 0.35,
      ENEMY_SIZE * 0.15,
      0, 0, Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // ✨ Hit Flash
    if (e.alive && e.flashTimer > 0) {
      const flashAlpha = e.flashTimer / 150;
      ctx.filter = `contrast(1.2) brightness(${1 + flashAlpha * 0.5}) saturate(${1 + flashAlpha * 1.5})`;
    } else {
      ctx.filter = "none";
    }

    // 🫥 Fade-out for death
    if (!e.alive && e.fading) {
      ctx.globalAlpha = Math.max(0, 1 - e.fadeTimer / FADE_OUT_TIME);
    }

    // 🧌 Draw base goblin sprite
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, ENEMY_SIZE, ENEMY_SIZE);

    // ====================================================================
    // 🔥 FIRE EFFECT (burn over time)
    // ====================================================================
    if (e.isBurning && e.alive) {
      ctx.save();

      const flicker = 0.85 + Math.random() * 0.3;

      // Warm tint
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * flicker;
      ctx.fillStyle = "rgba(255,150,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, ENEMY_SIZE * 0.35, ENEMY_SIZE * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer flame aura
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.22 * flicker;
      ctx.fillStyle = "rgba(255,120,60,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y - ENEMY_SIZE * 0.1, ENEMY_SIZE * 0.55, ENEMY_SIZE * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Small inner flame
      ctx.globalAlpha = 0.15 * flicker;
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y - ENEMY_SIZE * 0.25, ENEMY_SIZE * 0.25, ENEMY_SIZE * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Embers
      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * ENEMY_SIZE * 0.2;
        const oy = -Math.random() * ENEMY_SIZE * 0.3;

        ctx.globalAlpha = 0.15 * Math.random();
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ====================================================================
    // ❄ FROST EFFECT (slow debuff)
    // ====================================================================
    if (e.slowTimer > 0 && e.alive) {
      ctx.save();

      // Soft icy glow (no flicker — frost is stable)
      const frostPulse = 0.8 + Math.sin(Date.now() / 200) * 0.15;

      // Cool tint (screen blend)
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.25 * frostPulse;
      ctx.fillStyle = "rgba(160,200,255,0.5)"; // soft pastel ice-blue
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, ENEMY_SIZE * 0.38, ENEMY_SIZE * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Frost aura (lighter)
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 * frostPulse;
      ctx.fillStyle = "rgba(120,170,255,0.5)";
      ctx.beginPath();
      ctx.ellipse(
        e.x,
        e.y - ENEMY_SIZE * 0.1,
        ENEMY_SIZE * 0.6,
        ENEMY_SIZE * 0.75,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Sparkle flakes (gentle particles)
      for (let i = 0; i < 2; i++) {
        const ox = (Math.random() - 0.5) * ENEMY_SIZE * 0.3;
        const oy = -Math.random() * ENEMY_SIZE * 0.3;

        ctx.globalAlpha = 0.12 * Math.random();
        ctx.fillStyle = "rgba(210,240,255,0.8)";
        ctx.beginPath();
        ctx.arc(e.x + ox, e.y + oy, 2 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // ============================================================
    // Reset filters, draw health bar
    // ============================================================
    ctx.filter = "none";
    ctx.globalAlpha = 1;

    if (e.alive) drawHealthBar(ctx, e.x, e.y, e.hp, e.maxHp);

    ctx.restore();
  }
}

// ============================================================
// ❤️ HEALTH BAR
// ============================================================
function drawHealthBar(ctx, x, y, hp, maxHp) {
  const barWidth = 40, barHeight = 5, offsetY = 20;
  const hpPct = Math.max(0, Math.min(1, hp / maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x - barWidth / 2, y - ENEMY_SIZE / 2 - offsetY, barWidth, barHeight);

  ctx.fillStyle = `hsl(${hpPct * 120},100%,50%)`;
  ctx.fillRect(
    x - barWidth / 2,
    y - ENEMY_SIZE / 2 - offsetY,
    barWidth * hpPct,
    barHeight
  );
}




// ============================================================
// 🧩 SPRITE SELECTOR
// ============================================================
function getEnemySprite(e) {
  if (!goblinSprites) return null;
  if (!e.alive) return goblinSprites.slain;
  if (e.attacking) {
    const dir = e.attackDir || (e.dir === "left" ? "left" : "right");
    return goblinSprites.attack[dir][e.attackFrame || 0];
  }
  switch (e.dir) {
    case "up": return goblinSprites.walk.up[e.frame];
    case "down": return goblinSprites.walk.down[e.frame];
    case "left": return goblinSprites.walk.left[e.frame];
    case "right": return goblinSprites.walk.right[e.frame];
    default: return goblinSprites.idle;
  }
}

// ============================================================
// 🔍 ACCESSOR
// ============================================================
export function getEnemies() { return enemies; }

// ============================================================
// 🌟 END OF FILE
// ============================================================

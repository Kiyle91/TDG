// ============================================================
// 🏹 crossbow.js — Olivia's World: Crystal Keep (Ranged Elite)
// ------------------------------------------------------------
// • Independent goblin type: Crossbow Goblins
// • Follows the goblin path, then kites at range
// • Ranged basic attack with cooldown (no projectile sprites yet)
// • Small HP bar, death fade, XP + Gold rewards
// • Fully compatible with spire targeting once integrated
// ============================================================

import { gameState, addGold } from "../utils/gameState.js";
import { spawnFloatingText } from "./floatingText.js";
import { awardXP } from "./levelSystem.js";
import { updateHUD } from "./ui.js";
import {
  playGoblinDeath,
  playGoblinDamage,
} from "./soundtrack.js";
import { spawnDamageSparkles } from "./playerController.js";
import { spawnLoot } from "./loot.js";

// ------------------------------------------------------------
// 🧩 INTERNAL STATE
// ------------------------------------------------------------
let crossbowList = [];
let pathPoints = [];
let crossbowSprites = null;

let crossbowBolts = [];

let globalCrossbowCooldown = 0;  // shared across every crossbow
const GLOBAL_CROSSBOW_COOLDOWN_MS = 900; 

// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------
const CROSSBOW_HP = 100;
const CROSSBOW_SPEED = 80;          // movement along path
const CROSSBOW_SIZE = 80;          // sprite render size

const ATTACK_RANGE = 420;          // distance at which they like to shoot
const IDEAL_MIN_RANGE = 260;       // if closer than this, they back off
const ATTACK_COOLDOWN = 1600;      // ms between volleys
const ATTACK_DAMAGE = 8;           // damage per hit
const ATTACK_WINDUP_MS = 160;      // time until arrow "looses"
const ATTACK_DURATION_MS = 380;    // total attack animation

const WALK_FRAME_INTERVAL = 220;
const ATTACK_FRAME_INTERVAL = 180;

// ------------------------------------------------------------
// 📦 SPRITES
// (Uses a similar structure to elite.js / goblins. Adjust paths
//  later if your final crossbow art uses different filenames.)
// ------------------------------------------------------------
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    img.decoding = "sync";
    img.loading = "eager";
    img.style.imageRendering = "pixelated";

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function loadCrossbowSprites() {
  const base = "./assets/images/sprites/crossbow";

  const [
    idle,                 // use generic idle
    walkR1, walkR2,       // W1 / W2 = right walk
    walkL1, walkL2,       // A1 / A2 used as left walk
    shootR,               // shoot right
    shootL,               // shoot left
    raiseR, raiseL,       // raise bow
    lowerR, lowerL,       // lower bow
    slain
  ] = await Promise.all([

    loadImage(`${base}/crossbow_idle.png`),

    loadImage(`${base}/crossbow_W1.png`),
    loadImage(`${base}/crossbow_W2.png`),

    loadImage(`${base}/crossbow_A1.png`),
    loadImage(`${base}/crossbow_A2.png`),

    loadImage(`${base}/crossbow_shoot_right.png`),
    loadImage(`${base}/crossbow_shoot_left.png`),

    loadImage(`${base}/crossbow_raise_right.png`),
    loadImage(`${base}/crossbow_raise_left.png`),

    loadImage(`${base}/crossbow_lower_right.png`),
    loadImage(`${base}/crossbow_lower_left.png`),

    loadImage(`${base}/crossbow_slain.png`),
  ]);

  crossbowSprites = {
    idle: {
      right: idle,
      left: idle,
    },
    walk: {
      right: [walkR1, walkR2].filter(Boolean),
      left: [walkL1, walkL2].filter(Boolean),
    },
    attack: {
      right: [raiseR, shootR, lowerR].filter(Boolean),
      left: [raiseL, shootL, lowerL].filter(Boolean),
    },
    slain: slain || idle,
  };

  console.log("🏹 Crossbow sprites loaded (CORRECTED).");
}
// ------------------------------------------------------------
// 🔄 PATH MOVEMENT HELPER (same style as other path goblins)
// ------------------------------------------------------------
function moveAlongPath(entity, dt, speed) {
  if (!pathPoints || pathPoints.length < 2) return;

  if (entity.pathIndex == null) entity.pathIndex = 0;
  if (entity.segmentT == null) entity.segmentT = 0;

  let idx = entity.pathIndex;
  if (idx >= pathPoints.length - 1) return;

  const from = pathPoints[idx];
  const to = pathPoints[idx + 1];

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const segLen = Math.sqrt(dx * dx + dy * dy) || 1;

  const travel = speed * dt;
  const stepT = travel / segLen;

  entity.segmentT += stepT;

  if (entity.segmentT >= 1) {
    entity.pathIndex++;
    entity.segmentT = 0;

    if (entity.pathIndex >= pathPoints.length - 1) {
      entity.x = to.x;
      entity.y = to.y;
      return;
    }
  }

  const pFrom = pathPoints[entity.pathIndex];
  const pTo = pathPoints[entity.pathIndex + 1];
  const t = entity.segmentT;

  entity.x = pFrom.x + (pTo.x - pFrom.x) * t;
  entity.y = pFrom.y + (pTo.y - pFrom.y) * t;
}

// ------------------------------------------------------------
// 🔧 INIT
// ------------------------------------------------------------
export async function initCrossbows(path) {
  pathPoints = Array.isArray(path) ? path : pathPoints;
  crossbowList = [];

  if (!crossbowSprites) {
    await loadCrossbowSprites();
  }

  console.log("🏹 Crossbow system initialized.");
}

// ------------------------------------------------------------
// 🧬 SPAWN
// ------------------------------------------------------------
export function spawnCrossbow() {
  const p = gameState.player;
  if (!p) return;

  // Use the same map bounds as elites
  const mapW = gameState.mapWidth ?? 3000;
  const mapH = gameState.mapHeight ?? 3000;

  // Spawn off-screen (same system as elites)
  const side = Math.floor(Math.random() * 4);
  let x, y;

  if (side === 0) { x = Math.random() * mapW; y = -200; }
  else if (side === 1) { x = Math.random() * mapW; y = mapH + 200; }
  else if (side === 2) { x = -200; y = Math.random() * mapH; }
  else { x = mapW + 200; y = Math.random() * mapH; }

  crossbowList.push({
    type: "crossbow",
    x,
    y,
    width: CROSSBOW_SIZE,
    height: CROSSBOW_SIZE,
    hp: CROSSBOW_HP,
    maxHp: CROSSBOW_HP,
    alive: true,
    dead: false,
    fading: false,
    fade: 1,

    dir: "right",

    // Movement + animation
    walkTimer: 0,
    walkFrame: 0,
    attacking: false,
    attackFrame: 0,
    attackTimer: 0,
  });

  console.log("🏹 Crossbow spawned (off-screen).");
}

function spawnCrossbowBolt(c, targetX, targetY) {
  const angle = Math.atan2(targetY - c.y, targetX - c.x);
  const speed = 580; // adjust if needed

  crossbowBolts.push({
    x: c.x,
    y: c.y - 10,  // small offset for realism
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1200,   // ms before despawn
    from: c
  });
}



export function updateCrossbows(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;

  const player = gameState.player;
  if (!player) return;

  for (let i = crossbowList.length - 1; i >= 0; i--) {
    const c = crossbowList[i];

    // --------------------------------------------------------
    // 💀 DEATH FADE
    // --------------------------------------------------------
    if (!c.alive) {
      if (!c.fading) {
        c.fading = true;
        c.fade = 1;
      }
      c.fade -= dt;
      if (c.fade <= 0) crossbowList.splice(i, 1);
      continue;
    }

    // --------------------------------------------------------
    // 📏 DISTANCE + DIRECTION
    // --------------------------------------------------------
    const px = player.pos?.x ?? player.x ?? 0;
    const py = player.pos?.y ?? player.y ?? 0;

    const dx = px - c.x;
    const dy = py - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    c.dir = (dx < 0) ? "left" : "right";

    // --------------------------------------------------------
    // ⏱ ATTACK COOLDOWN
    // --------------------------------------------------------
    if (c.attackTimer > 0) {
      c.attackTimer -= delta;
    }

    // --------------------------------------------------------
    // 🏹 RANGED ATTACK (Projectile-based)
    // --------------------------------------------------------
    if (
    dist <= ATTACK_RANGE &&
    dist >= IDEAL_MIN_RANGE * 0.7 &&
    c.attackTimer <= 0 &&
    globalCrossbowCooldown <= 0 &&
    !c.attacking &&
    !player.dead
    ) {
    c.attacking = true;
    c.attackTimer = ATTACK_COOLDOWN;
    c.attackFrame = 0;

    const startTime = performance.now();

    // ------------------------------------------
    // Frame flip (raise → shoot → lower)
    // ------------------------------------------
    setTimeout(() => {
        if (!c.alive) return;
        c.attackFrame = 1;
    }, ATTACK_WINDUP_MS * 0.3);

    // ------------------------------------------
    // FIRE PROJECTILE
    // ------------------------------------------
    setTimeout(() => {
        if (!c.alive || player.dead) return;

        const px2 = player.pos?.x ?? player.x ?? 0;
        const py2 = player.pos?.y ?? player.y ?? 0;

        spawnCrossbowBolt(c, px2, py2);

        // GLOBAL SHARED COOLDOWN
        globalCrossbowCooldown = GLOBAL_CROSSBOW_COOLDOWN_MS;

        c.attackFrame = 2;
    }, ATTACK_WINDUP_MS);

    // ------------------------------------------
    // END OF ATTACK
    // ------------------------------------------
    setTimeout(() => {
        if (!c.alive) return;
        c.attacking = false;
        c.attackFrame = 0;
    }, ATTACK_DURATION_MS);
    }

    // --------------------------------------------------------
    // 🏃 MOVEMENT / KITE LOGIC (ELITE-STYLE)
    // --------------------------------------------------------
    if (!c.attacking) {
      // Too far → Chase player
      if (dist > ATTACK_RANGE * 1.05) {
        c.x += (dx / dist) * CROSSBOW_SPEED * dt;
        c.y += (dy / dist) * CROSSBOW_SPEED * dt;
      }

      // Too close → Backpedal
      else if (dist < IDEAL_MIN_RANGE) {
        const backSpeed = CROSSBOW_SPEED * 0.7;
        c.x -= (dx / dist) * backSpeed * dt;
        c.y -= (dy / dist) * backSpeed * dt;
      }

      // Perfect range → small idle shuffle (optional)
      else {
        // No actual movement needed, keep idle
      }

      // ----------------------------------------------------
      // 🚶 WALK ANIMATION
      // ----------------------------------------------------
      c.walkTimer += delta;
      if (c.walkTimer >= WALK_FRAME_INTERVAL) {
        c.walkTimer = 0;
        c.walkFrame = (c.walkFrame + 1) % 2;

      
      
      }
    updateCrossbowBolts(delta);
    globalCrossbowCooldown = Math.max(0, globalCrossbowCooldown - delta);
    
    }

  }
}



function updateCrossbowBolts(delta) {
  globalCrossbowCooldown = Math.max(0, globalCrossbowCooldown - delta);  
  const dt = delta / 1000;
  const player = gameState.player;

  for (let i = crossbowBolts.length - 1; i >= 0; i--) {
    const b = crossbowBolts[i];

    b.life -= delta;

    // Movement
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Collision with player
    if (player) {
      const dx = player.pos.x - b.x;
      const dy = player.pos.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < 28) {
        const dmg = ATTACK_DAMAGE;

        player.hp = Math.max(0, player.hp - dmg);
        spawnDamageSparkles(player.pos.x, player.pos.y);
        spawnFloatingText(`-${dmg}`, player.pos.x, player.pos.y - 40, "#ff8080");
        playGoblinDamage();
        updateHUD();

        crossbowBolts.splice(i, 1);
        continue;
      }
    }

    if (b.life <= 0) {
      crossbowBolts.splice(i, 1);
    }
  }
}

function drawCrossbowBolts(ctx) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 230, 120, 0.95)";

  for (const b of crossbowBolts) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------
export function drawCrossbows(ctx) {
  if (!ctx || !crossbowSprites) return;

  for (const c of crossbowList) {
    ctx.save();

    // Fade if dying
    ctx.globalAlpha = c.fade ?? 1;

    const baseSize = CROSSBOW_SIZE;
    const drawX = c.x - baseSize / 2;
    const drawY = c.y - baseSize / 2;

    // Choose sprite
    let img = null;
    const dir = c.dir === "left" ? "left" : "right";

    if (!c.alive || c.dead) {
      img = crossbowSprites.slain;
    } else if (c.attacking && crossbowSprites.attack[dir]?.length) {
      const frames = crossbowSprites.attack[dir];
      img = frames[c.attackFrame % frames.length];
    } else if (crossbowSprites.walk[dir]?.length) {
      const frames = crossbowSprites.walk[dir];
      img = frames[c.walkFrame % frames.length];
    } else {
      img = crossbowSprites.idle[dir];
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(
      c.x,
      c.y + baseSize * 0.35,
      baseSize * 0.35,
      baseSize * 0.18,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();

    // Body
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    // Draw sprite
    if (img) {
    ctx.drawImage(img, drawX, drawY, baseSize, baseSize);
    }

    if (c.alive) {
      const barWidth = 40;
      const barHeight = 5;

      // Elite sprites draw downward — keeping your offset but cleaner
      const offsetY = CROSSBOW_SIZE * 0.52;

      const hpPct = Math.max(0, Math.min(1, c.hp / c.maxHp));

      // Background
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(
        c.x - barWidth / 2,
        c.y + offsetY,
        barWidth,
        barHeight
      );

      // Fill (green → yellow → red)
      ctx.fillStyle = `hsl(${hpPct * 120},100%,50%)`;
      ctx.fillRect(
        c.x - barWidth / 2,
        c.y + offsetY,
        barWidth * hpPct,
        barHeight
      );
    }

    drawCrossbowBolts(ctx);

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE API (for spires / player attacks to call later)
// ------------------------------------------------------------
export function damageCrossbow(c, amount) {
  if (!c || !c.alive) return;

  c.hp -= amount;
  c.flashTimer = 150;

  spawnFloatingText(`-${amount}`, c.x, c.y - 40, "#ff8080");
  playGoblinDamage();

  if (c.hp <= 0) {
    killCrossbow(c);
  }
}

function killCrossbow(c) {
  if (!c.alive) return;
  c.alive = false;
  c.dead = true;
  c.fade = 1;
  c.fading = true;

  awardXP(35);
  addGold(8);
  updateHUD();
  playGoblinDeath();
  spawnLoot("crossbow", c.x, c.y);

  spawnFloatingText("✝", c.x, c.y - 50, "#ffffff");
}

// ------------------------------------------------------------
// 🧺 PUBLIC API
// ------------------------------------------------------------
export function getCrossbows() {
  return crossbowList;
}

export function clearCrossbows() {
  crossbowList.length = 0;
}

if (typeof window !== "undefined") {
  window.getCrossbows = getCrossbows;
  window.spawnCrossbow = spawnCrossbow;
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

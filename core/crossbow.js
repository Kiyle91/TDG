// ============================================================
// 🏹 crossbow.js — Olivia's World: Crystal Keep (Ranged Elite)
// ------------------------------------------------------------
// • Independent enemy type: Crossbow Goblins
// • Follows the enemy path, then kites at range
// • Ranged basic attack with cooldown (no projectile sprites yet)
// • Small HP bar, death fade, XP + Gold rewards
// • Fully compatible with tower targeting once integrated
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

// ------------------------------------------------------------
// 🧩 INTERNAL STATE
// ------------------------------------------------------------
let crossbowList = [];
let pathPoints = [];
let crossbowSprites = null;

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
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

async function loadCrossbowSprites() {
  const base = "./assets/images/sprites/crossbow";

  const [
    idleRight,
    idleLeft,
    walkRight1,
    walkRight2,
    walkLeft1,
    walkLeft2,
    attackRight1,
    attackRight2,
    attackLeft1,
    attackLeft2,
    slain,
  ] = await Promise.all([
    loadImage(`${base}/crossbow_idle_right.png`),
    loadImage(`${base}/crossbow_idle_left.png`),
    loadImage(`${base}/crossbow_W1.png`),
    loadImage(`${base}/crossbow_W2.png`),
    loadImage(`${base}/crossbow_A1.png`),
    loadImage(`${base}/crossbow_A2.png`),
    loadImage(`${base}/crossbow_attack_right_1.png`),
    loadImage(`${base}/crossbow_attack_right_2.png`),
    loadImage(`${base}/crossbow_attack_left_1.png`),
    loadImage(`${base}/crossbow_attack_left_2.png`),
    loadImage(`${base}/crossbow_slain.png`),
  ]);

  crossbowSprites = {
    idle: {
      right: idleRight || walkRight1,
      left: idleLeft || walkLeft1,
    },
    walk: {
      right: [walkRight1, walkRight2].filter(Boolean),
      left: [walkLeft1, walkLeft2].filter(Boolean),
    },
    attack: {
      right: [attackRight1, attackRight2].filter(Boolean),
      left: [attackLeft1, attackLeft2].filter(Boolean),
    },
    slain: slain || walkRight1,
  };

  console.log("🏹 Crossbow sprites loaded.");
}

// ------------------------------------------------------------
// 🔄 PATH MOVEMENT HELPER (same style as other path enemies)
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
  if (!pathPoints || pathPoints.length === 0) {
    console.warn("⚠️ Cannot spawn crossbow — no pathPoints set.");
    return;
  }

  const start = pathPoints[0];

  crossbowList.push({
    x: start.x,
    y: start.y,
    width: CROSSBOW_SIZE,
    height: CROSSBOW_SIZE,
    hp: CROSSBOW_HP,
    maxHp: CROSSBOW_HP,
    alive: true,
    dead: false,
    fading: false,
    fade: 1,
    dir: "right",

    // Path data
    pathIndex: 0,
    segmentT: 0,

    // Animation
    walkTimer: 0,
    walkFrame: 0,
    attackTimer: 0,
    attacking: false,
    attackFrame: 0,

    // Combat
    lastHitTime: 0,
  });

  console.log("🏹 Crossbow spawned.");
}

// ------------------------------------------------------------
// 🔁 UPDATE
// ------------------------------------------------------------
export function updateCrossbows(delta) {
  delta = Math.min(delta, 100);
  const dt = delta / 1000;

  const player = gameState.player;
  if (!player) return;

  for (let i = crossbowList.length - 1; i >= 0; i--) {
    const c = crossbowList[i];

    if (!c.alive) {
      // Death fade
      if (!c.fading) {
        c.fading = true;
        c.fade = 1;
      }
      c.fade -= dt;
      if (c.fade <= 0) {
        crossbowList.splice(i, 1);
      }
      continue;
    }

    // Distance to player
    const px = player.pos?.x ?? player.x ?? 0;
    const py = player.pos?.y ?? player.y ?? 0;
    const dx = px - c.x;
    const dy = py - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Direction for facing
    c.dir = (dx < 0) ? "left" : "right";

    // Attack cooldown
    if (c.attackTimer > 0) {
      c.attackTimer -= delta;
    }

    // --------------------------------------------------------
    // 🏹 RANGED ATTACK
    // --------------------------------------------------------
    if (
      dist <= ATTACK_RANGE &&
      dist >= IDEAL_MIN_RANGE * 0.7 &&   // not point-blank
      c.attackTimer <= 0 &&
      !c.attacking &&
      !player.dead
    ) {
      c.attacking = true;
      c.attackTimer = ATTACK_COOLDOWN;
      c.attackFrame = 0;

      const startTime = performance.now();

      // Frame flip (simple 2-frame attack)
      setTimeout(() => {
        if (!c.alive) return;
        c.attackFrame = 1;
      }, ATTACK_WINDUP_MS * 0.5);

      // Apply damage at windup
      setTimeout(() => {
        if (!c.alive || player.dead) return;

        const now = performance.now();
        const elapsed = now - startTime;
        if (elapsed > ATTACK_DURATION_MS + 200) return;

        // Re-check distance to avoid sniping across map
        const px2 = player.pos?.x ?? player.x ?? 0;
        const py2 = player.pos?.y ?? player.y ?? 0;
        const ddx = px2 - c.x;
        const ddy = py2 - c.y;
        const d2 = Math.sqrt(ddx * ddx + ddy * ddy) || 1;

        if (d2 <= ATTACK_RANGE + 40) {
          const dmg = ATTACK_DAMAGE;
          player.hp = Math.max(0, (player.hp ?? player.maxHp ?? 100) - dmg);
          spawnDamageSparkles?.(px2, py2);

          spawnFloatingText(`-${dmg}`, px2, py2 - 40, "#ff8080");
          playGoblinDamage();

          updateHUD();
        }
      }, ATTACK_WINDUP_MS);

      // End attack
      setTimeout(() => {
        if (!c.alive) return;
        c.attacking = false;
        c.attackFrame = 0;
      }, ATTACK_DURATION_MS);
    }

    // --------------------------------------------------------
    // 🏃 MOVEMENT / KITE LOGIC
    // --------------------------------------------------------
    if (!c.attacking) {
      // Too far → move along path toward keep
      if (dist > ATTACK_RANGE * 1.1) {
        moveAlongPath(c, dt, CROSSBOW_SPEED);
      }
      // Too close → step back from player
      else if (dist < IDEAL_MIN_RANGE) {
        const backSpeed = CROSSBOW_SPEED * 0.7;
        c.x -= (dx / dist) * backSpeed * dt;
        c.y -= (dy / dist) * backSpeed * dt;
      } else {
        // In ideal range → tiny shuffle on the spot (no movement needed)
      }

      // Walk animation
      c.walkTimer += delta;
      if (c.walkTimer >= WALK_FRAME_INTERVAL) {
        c.walkTimer = 0;
        c.walkFrame = (c.walkFrame + 1) % 2;
      }
    }
  }
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
    ctx.imageSmoothingEnabled = false;
    if (img) {
      ctx.drawImage(img, drawX, drawY, baseSize, baseSize);
    }

    // HP bar
    if (c.alive) {
      const barW = 46;
      const barH = 6;
      const bx = c.x - barW / 2;
      const by = drawY - 10;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);

      const ratio = Math.max(0, c.hp / c.maxHp);
      ctx.fillStyle = "#ff7575";
      ctx.fillRect(bx, by, barW * ratio, barH);
    }

    ctx.restore();
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE API (for towers / player attacks to call later)
// ------------------------------------------------------------
export function damageCrossbow(crossbow, amount) {
  if (!crossbow || !crossbow.alive) return;

  crossbow.hp -= amount;
  spawnFloatingText(`-${amount}`, crossbow.x, crossbow.y - 40, "#ff8080");
  playGoblinDamage();

  if (crossbow.hp <= 0) {
    killCrossbow(crossbow);
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

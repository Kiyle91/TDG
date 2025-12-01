// ============================================================
// 🟣 seraphine.js — The Architect (Boss Entity)
// ------------------------------------------------------------
// ✦ Boss built from Elite hunter + Player sprite system
// ✦ Chases the player directly (off-path), melee + spell
// ✦ Melee: sword/scythe combo (attack → melee_left/right)
// ✦ Spell: huge slow dark orb that homes toward the player
// ✦ Non-violent defeat: collapses into "slain" frames
// ✦ Designed to be spawned at end of waves 3 / 6 / 9
// ============================================================

/* ------------------------------------------------------------
 * MODULE: seraphine.js
 * PURPOSE:
 *   Implements the Seraphine boss using a mix of:
 *   - Elite-style hunter AI (movement, collisions, rewards)
 *   - Player-style animation flow (melee + spell timing)
 *   - Custom giant homing orb spell when out of melee range.
 *
 * PUBLIC API:
 *   • initSeraphine()              — preload sprites, reset state
 *   • spawnSeraphineBoss(phase,x,y)— spawn Seraphine (phase 1–3)
 *   • updateSeraphine(delta)       — AI, movement, attacks, spell
 *   • drawSeraphine(ctx)           — render boss + HP bar + orbs
 *   • damageSeraphine(boss, amt)   — external damage handler
 *   • getSeraphines()              — access array (usually 0/1)
 *   • clearSeraphines()            — remove all instances
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold } from "../utils/gameState.js";
import { slideRect } from "../utils/mapCollision.js";
import { getGoblins } from "../entities/goblin.js";
import { updateHUD } from "../screenManagement/ui.js";
import { awardXP } from "../player/levelSystem.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { playGoblinDamage } from "../core/soundtrack.js";
import { addBravery, applyBraveryAuraEffects } from "../player/bravery.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";
import { playSeraphineSpawn } from "../core/soundtrack.js";

// ------------------------------------------------------------
// 🧩 INTERNAL STATE
// ------------------------------------------------------------

let seraphines = [];
let sprites = null;
let darkOrbs = [];
let seraphineEdgeFlash = 0; // 0–1 intensity (raw)
let seraphineEdgeFlashDisplay = 0; // smoothed for UI

// Which maps she appears on: 1, 4, 7, 9
// Tune these numbers however you like.
const SERAPHINE_PHASES = {
  1: { hp: 350, melee: 12, spell: 10 },  // tutorial boss
  4: { hp: 600, melee: 18, spell: 14 },  // early mid-game
  7: { hp: 900, melee: 24, spell: 18 },  // late-game
  9: { hp: 1300, melee: 30, spell: 22 }, // final showdown
};


// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------

// Tougher than elites
const SERAPHINE_BASE_HP = 420;
const SERAPHINE_SIZE = 80;
const SERAPHINE_HITBOX = SERAPHINE_SIZE * 0.55;
const SERAPHINE_SPEED = 95; // slightly faster than elite
const FRAME_INTERVAL = 220;

// Melee (copied from player timing: 0 → 1 → idle)
const MELEE_RANGE = 95; // increased so she connects more reliably
const MELEE_DAMAGE = 1;
const MELEE_TOTAL_TIME = 400; // ms
const MELEE_WINDUP = 180;     // ms (frame 0 → frame 1)

// Spell (giant homing orb)
const SPELL_COOLDOWN = 3200; // ms
const SPELL_MIN_RANGE = 200; // only cast if player this far away
const SPELL_ORB_SPEED = 120; // px/sec (deliberately not super fast)
const SPELL_ORB_RADIUS = 26;
const SPELL_DAMAGE = 1;
const SPELL_LIFETIME = 7000; // ms

// Death / defeat
const FADE_OUT = 1200;

// Rewards (per kill)
const EXP_REWARD = 40;
const GOLD_REWARD = 15;
const BRAVERY_REWARD = 100;

// ------------------------------------------------------------
// 📦 IMAGE LOADER
// ------------------------------------------------------------

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

// ------------------------------------------------------------
// 🖼️ LOAD SPRITES (matches player sprite structure)
// ------------------------------------------------------------

async function loadSeraphineSprites() {
  const base = "./assets/images/sprites/seraphine/seraphine";

  sprites = {
    idle: await loadImage(`${base}_idle.png`),

    walk: {
      up: [
        await loadImage(`${base}_W1.png`),
        await loadImage(`${base}_W2.png`),
      ],
      left: [
        await loadImage(`${base}_A1.png`),
        await loadImage(`${base}_A2.png`),
      ],
      down: [
        await loadImage(`${base}_S1.png`),
        await loadImage(`${base}_S2.png`),
      ],
      right: [
        await loadImage(`${base}_D1.png`),
        await loadImage(`${base}_D2.png`),
      ],
    },

    attack: {
      left: [
        await loadImage(`${base}_attack_left.png`),
        await loadImage(`${base}_melee_left.png`),
      ],
      right: [
        await loadImage(`${base}_attack_right.png`),
        await loadImage(`${base}_melee_right.png`),
      ],
    },

    spell: {
      charge: await loadImage(`${base}_spell_charge.png`),
      explode: await loadImage(`${base}_spell_explode.png`),
    },

    escape: {
      charge: await loadImage(`${base}_escape_charge.png`),
      burst: await loadImage(`${base}_escape_explode.png`),
    },

    slain: [
      await loadImage(`${base}_escape_charge.png`),
      await loadImage(`${base}_escape_explode.png`),
    ],
  };
}

// ------------------------------------------------------------
// 🔧 INIT
// ------------------------------------------------------------

export async function initSeraphine() {
  seraphines.length = 0;
  darkOrbs.length = 0;
  await loadSeraphineSprites();
}

// Helper: world-space collision slide
function moveWithCollision(b, dx, dy) {
  const w = SERAPHINE_HITBOX;
  const h = SERAPHINE_HITBOX;
  const rectX = b.x - w / 2;
  const rectY = b.y - h / 2;
  const moved = slideRect(rectX, rectY, w, h, dx, dy, { ignoreBounds: true });
  b.x = moved.x + w / 2;
  b.y = moved.y + h / 2;
}


function getSeraphineStats() {
  const mapId = gameState.progress?.currentMap ?? 1;

  const base = SERAPHINE_PHASES[mapId] || SERAPHINE_PHASES[1];

  return {
    maxHp: base.hp,
    meleeDamage: base.melee,
    spellDamage: base.spell,
  };
}

// ------------------------------------------------------------
// 🟣 SPAWN BOSS
// ------------------------------------------------------------

export function spawnSeraphineBoss(phase = 1, x, y, options = {}) {
  const mapW = gameState.mapWidth ?? 3000;
  const mapH = gameState.mapHeight ?? 3000;
  const hpMultiplier = options.hpMultiplier ?? 1;

  const spawnOffset = 40;
  let sx = x;
  let sy = y;

  // If no manual coordinates provided → spawn off-screen like elites
  if (typeof x !== "number" || typeof y !== "number") {
    const side = Math.floor(Math.random() * 4);

    if (side === 0) {            // Top
      sx = Math.random() * mapW;
      sy = -spawnOffset;
    } else if (side === 1) {     // Bottom
      sx = Math.random() * mapW;
      sy = mapH + spawnOffset;
    } else if (side === 2) {     // Left
      sx = -spawnOffset;
      sy = Math.random() * mapH;
    } else {                     // Right
      sx = mapW + spawnOffset;
      sy = Math.random() * mapH;
    }
  }

  const stats = getSeraphineStats();

  const boss = {
    type: "seraphine",
    phase,
    x: sx,
    y: sy,

    hp: stats.maxHp,
    maxHp: stats.maxHp,

    meleeDamage: stats.meleeDamage,
    spellDamage: stats.spellDamage,

    alive: true,
    defeated: false,
    dir: "down",
    frame: 0,
    frameTimer: 0,

    attacking: false,
    meleeFrame: 0,
    meleeTimer: 0,

    castingSpell: false,
    spellFrame: 0,
    spellTimer: 0,
    spellCooldown: 1500,

    fading: false,
    fadeTimer: 0,
    slainFrame: 0,

    slowTimer: 0,
    stunTimer: 0,

    speed: SERAPHINE_SPEED,

    hpEvents: { "75": false, "50": false, "40": false, "25": false },
  };

  seraphines.push(boss);
  seraphineEdgeFlash = 1; // force an immediate edge flash on spawn
  // keep display lagging slightly for a softer fade-in
  seraphineEdgeFlashDisplay = Math.min(seraphineEdgeFlashDisplay, seraphineEdgeFlash * 0.5);

  Events.emit(E.bossSpawn, {
    boss: "seraphine",
    phase,
    x: boss.x,
    y: boss.y,
    instance: boss,
  });

  playSeraphineSpawn();

  return boss;
}

// ------------------------------------------------------------
// 🔮 DARK ORB SYSTEM
// ------------------------------------------------------------

function spawnDarkOrb(boss) {
  const orb = {
    x: boss.x,
    y: boss.y - SERAPHINE_SIZE * 0.1,
    radius: SPELL_ORB_RADIUS,
    life: SPELL_LIFETIME,
  };
  darkOrbs.push(orb);
}

function updateDarkOrbs(delta) {
  if (!darkOrbs.length || !gameState.player) return;

  const p = gameState.player;
  const dt = delta / 1000;

  for (let i = darkOrbs.length - 1; i >= 0; i--) {
    const o = darkOrbs[i];
    o.life -= delta;
    if (o.life <= 0) {
      darkOrbs.splice(i, 1);
      continue;
    }

    // Home toward player each frame
    const dx = p.pos.x - o.x;
    const dy = p.pos.y - o.y;
    const dist = Math.hypot(dx, dy) || 1;

    const stepX = (dx / dist) * SPELL_ORB_SPEED * dt;
    const stepY = (dy / dist) * SPELL_ORB_SPEED * dt;

    o.x += stepX;
    o.y += stepY;

    // Collision with player
    const hitDist = SPELL_ORB_RADIUS + 22;

    if (!p.invincible && dist < hitDist) {
      // Damage uses spellDamage stored on the boss instance that cast it
      const dmg = SPELL_DAMAGE;

      p.hp = Math.max(0, p.hp - dmg);
      p.flashTimer = 220;

      spawnFloatingText(p.pos.x, p.pos.y - 30, `-${dmg}`, "#c58bff");
      updateHUD();

      darkOrbs.splice(i, 1);
    }
  }
}

function drawDarkOrbs(ctx) {
  if (!darkOrbs.length) return;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const o of darkOrbs) {
    const t = 1 - o.life / SPELL_LIFETIME;
    const alpha = 0.8 - 0.4 * t;

    const r = o.radius * (1 + 0.2 * Math.sin(Date.now() / 150));

    const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
    grad.addColorStop(0.0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.3, "rgba(210,160,255,0.9)");
    grad.addColorStop(0.7, "rgba(140,70,210,0.8)");
    grad.addColorStop(1.0, "rgba(40,0,60,0)");

    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ------------------------------------------------------------
// 🔁 UPDATE — AI, MOVEMENT, MELEE + SPELL
// ------------------------------------------------------------

export function updateSeraphine(delta = 16) {
  if (!seraphines.length || !gameState.player) {
    seraphineEdgeFlash *= 0.9; // softly fade out glow when she isn't present
    seraphineEdgeFlashDisplay += (seraphineEdgeFlash - seraphineEdgeFlashDisplay) * 0.08;
    updateDarkOrbs(delta);
    return;
  }

  const p = gameState.player;
  const dt = delta / 1000;

  updateDarkOrbs(delta);

  for (let i = seraphines.length - 1; i >= 0; i--) {
    const b = seraphines[i];

    // Death fade + removal
    if (!b.alive) {
      b.fadeTimer += delta;
      if (b.fadeTimer >= FADE_OUT) {
        seraphines.splice(i, 1);
      }
      continue;
    }

    // Stun (future-proof)
    if (b.stunTimer > 0) {
      b.stunTimer -= delta;
      continue;
    }

    // Spell cooldown tick
    if (b.spellCooldown > 0) {
      b.spellCooldown -= delta;
      if (b.spellCooldown < 0) b.spellCooldown = 0;
    }

    // Movement / decision making skipped while animating spell/defeat
    if (b.defeated) continue;

    // Distance to player
    const dx = p.pos.x - b.x;
    const dy = p.pos.y - b.y;
    const dist = Math.hypot(dx, dy);

    // Decide facing (left/right dominant)
    if (Math.abs(dx) > Math.abs(dy)) {
      b.dir = dx >= 0 ? "right" : "left";
    } else {
      b.dir = dy >= 0 ? "down" : "up";
    }

    // ============================================================
    // 🌌 SCREEN EDGE PURPLE FLASH INTENSITY
    // ============================================================
      if (b.alive && !b.defeated) {
        // stronger flash when close, weaker when far
        const maxDist = 1200; 
        const intensity = Math.max(0, 1 - dist / maxDist);

        // smooth transition
        seraphineEdgeFlash += (intensity - seraphineEdgeFlash) * 0.1;
        // ensure a minimum presence cue while she is alive
        seraphineEdgeFlash = Math.max(seraphineEdgeFlash, 0.8);
      } else {
        // fade out when defeated / removed
      seraphineEdgeFlash *= 0.92;
      }

    // If currently casting spell, just let its timer run
    if (b.castingSpell) {
      b.spellTimer -= delta;
      if (b.spellTimer <= 0) {
        b.castingSpell = false;
        b.spellFrame = 0;
      }
      continue;
    }

    // Melee attack if close enough
    if (!b.attacking && dist < MELEE_RANGE) {
      b.attacking = true;
      b.meleeFrame = 0;
      b.meleeTimer = MELEE_TOTAL_TIME;

      // Switch to strike frame after windup
      setTimeout(() => {
        if (b.alive && b.attacking) {
          b.meleeFrame = 1;
        }
      }, MELEE_WINDUP);

      // Damage window (copied from player melee feel)
      setTimeout(() => {
        if (!b.alive || !b.attacking) return;

        const pdx = p.pos.x - b.x;
        const pdy = p.pos.y - b.y;
        const dNow = Math.hypot(pdx, pdy);

        if (dNow < MELEE_RANGE + 18 && p.invincible !== true) {
          const dmg = b.meleeDamage ?? MELEE_DAMAGE;
          p.hp = Math.max(0, p.hp - dmg);
          p.flashTimer = 220;

          spawnFloatingText(p.pos.x, p.pos.y - 30, `-${dmg}`, "#ff5577");
          updateHUD();
        }
      }, MELEE_WINDUP + 40);

      // End melee
      setTimeout(() => {
        if (b.alive) {
          b.attacking = false;
          b.meleeFrame = 0;
        }
      }, MELEE_TOTAL_TIME);

      continue;
    }

    // Spell if out of melee range and cooldown ready
    if (!b.attacking && dist > SPELL_MIN_RANGE && b.spellCooldown <= 0) {
      b.castingSpell = true;
      b.spellFrame = 0;
      b.spellTimer = 900; // total anim time

      // Spawn orb at explode frame
      setTimeout(() => {
        if (!b.alive) return;
        b.spellFrame = 1;
        spawnDarkOrb(b);
      }, 420); // charge → explode

      // Reset state + cooldown
      setTimeout(() => {
        if (!b.alive) return;
        b.castingSpell = false;
        b.spellFrame = 0;
        b.spellCooldown = SPELL_COOLDOWN;
      }, 900);

      continue;
    }

    // Movement toward player (elite-style chase)
    if (!b.attacking) {
      const moveSpeed = b.speed * (b.slowTimer > 0 ? 0.5 : 1);

      if (dist > 4) {
        const stepX = (dx / dist) * moveSpeed * dt;
        const stepY = (dy / dist) * moveSpeed * dt;
        moveWithCollision(b, stepX, stepY);
      }

      if (gameState.player.invincible === true && b.alive && !b.defeated) {
        applyBraveryAuraEffects(b);
      }

      // Simple collision push vs goblins so she doesn't overlap hordes
      const goblins = getGoblins();
      for (const g of goblins) {
        if (!g?.alive) continue;
        const gx = g.x;
        const gy = g.y;
        const ddx = b.x - gx;
        const ddy = b.y - gy;
        const d2 = Math.hypot(ddx, ddy);
        const minDist = 72;

        if (d2 > 0 && d2 < minDist) {
          const push = (minDist - d2) / 2;
          const nx = ddx / d2;
          const ny = ddy / d2;
          b.x += nx * push;
          b.y += ny * push;
          g.x -= nx * push;
          g.y -= ny * push;
        }
      }

      // ============================================================
      // PLAYER ↔ SERAPHINE PUSH-BACK COLLISION (Elite-style)
      // ============================================================
      {
        const px = p.pos.x;
        const py = p.pos.y;

        const dx2 = b.x - px;
        const dy2 = b.y - py;
        const d2 = Math.hypot(dx2, dy2);

        const minDist = 72;

        if (d2 > 0 && d2 < minDist) {
          const push = (minDist - d2) / 2;
          const nx = dx2 / d2;
          const ny = dy2 / d2;

          // Push Seraphine
          b.x += nx * push;
          b.y += ny * push;

          // Push player
          p.pos.x -= nx * push;
          p.pos.y -= ny * push;
        }
      }

      // Run animation
      b.frameTimer += delta;
      if (b.frameTimer >= FRAME_INTERVAL) {
        b.frameTimer = 0;
        b.frame = (b.frame + 1) % 2;
      }
    }
  }
}

// ------------------------------------------------------------
// 💥 DAMAGE
// ------------------------------------------------------------

export function damageSeraphine(boss, amount) {
  if (!boss || !boss.alive || boss.defeated) return;

  const prevHP = boss.hp; // (kept for future if you want effects based on lost HP)
  boss.hp -= amount;

  spawnFloatingText(boss.x, boss.y - 50, `-${amount}`, "#ff88dd");
  playGoblinDamage();

  // 🔮 💥 HP Threshold Event Emission
  const pct = (boss.hp / boss.maxHp) * 100;

  if (!boss.hpEvents["75"] && pct <= 75) {
    boss.hpEvents["75"] = true;
    Events.emit(E.bossHpThreshold, {
      boss: "seraphine",
      phase: boss.phase,
      threshold: 75,
      x: boss.x,
      y: boss.y,
      instance: boss,
    });
  }

  if (!boss.hpEvents["50"] && pct <= 50) {
    boss.hpEvents["50"] = true;
    Events.emit(E.bossHpThreshold, {
      boss: "seraphine",
      phase: boss.phase,
      threshold: 50,
      x: boss.x,
      y: boss.y,
      instance: boss,
    });
  }

  if (!boss.hpEvents["40"] && pct <= 40) {
    boss.hpEvents["40"] = true;
    Events.emit(E.bossHpThreshold, {
      boss: "seraphine",
      phase: boss.phase,
      threshold: 40,
      x: boss.x,
      y: boss.y,
      instance: boss,
    });
  }

  if (!boss.hpEvents["25"] && pct <= 25) {
    boss.hpEvents["25"] = true;
    Events.emit(E.bossHpThreshold, {
      boss: "seraphine",
      phase: boss.phase,
      threshold: 25,
      x: boss.x,
      y: boss.y,
      instance: boss,
    });
  }

  // ============================================================
  // 🖤 DEFEAT LOGIC (non-violent collapse + events)
  // ============================================================
  if (boss.hp <= 0) {
    boss.hp = 0;
    boss.defeated = true;
    boss.attacking = false;
    boss.castingSpell = false;
    boss.meleeFrame = 0;
    boss.spellFrame = 0;

    Events.emit(E.bossDefeated, {
      boss: "seraphine",
      phase: boss.phase,
      x: boss.x,
      y: boss.y,
      instance: boss,   // ⭐ REQUIRED FOR SPEECH BUBBLE ANCHORING
    });

    // Rewards
    awardXP(EXP_REWARD);
    addGold(GOLD_REWARD);
    addBravery(BRAVERY_REWARD);
    updateHUD();


    // Death animation flow
    boss.slainFrame = 0;
    setTimeout(() => {
      boss.slainFrame = 1;
    }, 1000);

    setTimeout(() => {
      boss.alive = false;
      boss.fadeTimer = 0;
    }, 1600);
  }
}

// ------------------------------------------------------------
// ❤️ HP BAR (Boss-style)
// ------------------------------------------------------------

function drawBossHpBar(ctx, b) {
  const barWidth = 80;
  const barHeight = 7;

  // Use base size so bar doesn't jump with scale
  const offsetY = SERAPHINE_SIZE * 1.01;

  const pct = Math.max(0, Math.min(1, b.hp / b.maxHp));

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(b.x - barWidth / 2, b.y + offsetY, barWidth, barHeight);

  const grad = ctx.createLinearGradient(
    b.x - barWidth / 2,
    0,
    b.x + barWidth / 2,
    0
  );
  grad.addColorStop(0, "#b074ff");
  grad.addColorStop(1, "#ffb0f0");

  ctx.fillStyle = grad;
  ctx.fillRect(b.x - barWidth / 2, b.y + offsetY, barWidth * pct, barHeight);

  ctx.strokeStyle = "rgba(230,200,255,0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(b.x - barWidth / 2, b.y + offsetY, barWidth, barHeight);
}

// ------------------------------------------------------------
// 🖌️ DRAW
// ------------------------------------------------------------
// ============================================================
// ✨ SERAPHINE PARTICLE SPARKLES (Void-like boss intensity)
// ============================================================


function drawSeraphineSparkles(ctx, b) {
  const count = 10;        // more intense than goblins
  const maxSpread = 45;    // large radius around her body

  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * maxSpread;

    const px = b.x + Math.cos(ang) * dist;
    const py = b.y + Math.sin(ang) * dist;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5 + Math.random() * 0.4;

    const size = 2 + Math.random() * 3;

    // Deep void purple flash
    ctx.fillStyle = "rgba(180, 90, 255, 1)";

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}


export function drawSeraphine(ctx) {
  if (!sprites || !seraphines.length) {
    drawDarkOrbs(ctx);
    return;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";

  for (const b of seraphines) {
    let img = sprites.idle;

    if (b.defeated) {
      img = sprites.slain[b.slainFrame] || sprites.slain[0];
    } else if (b.castingSpell) {
      img = b.spellFrame === 0 ? sprites.spell.charge : sprites.spell.explode;
    } else if (b.attacking) {
      const dir = b.dir === "left" ? "left" : "right";
      img = sprites.attack[dir][b.meleeFrame];
    } else {
      const runSet = sprites.walk[b.dir] || sprites.walk.down;
      img = runSet[b.frame] || sprites.idle;
    }

    // ==================================================
    // SCALE LOGIC (big attack, large idle)
    // ==================================================
    let scale = 1.0;

    // 1. Melee + Attack animations (biggest)
    if (b.attacking) {
      scale = 2.3; // ~130% bigger than 1.0

      // 2. Idle, walking, spell, escape (general)
    } else {
      scale = 1.5; // 50% bigger
    }

    // Final draw size
    const drawSize = SERAPHINE_SIZE * scale;

    // Center offsets
    let drawX = b.x - drawSize / 2;
    let drawY = b.y - drawSize / 2;

    // Offset attack/melee frames upward
    if (b.attacking) {
      drawY -= 20; // tweak position
    }

    ctx.save();

    // ==================================================
    // SHADOW (scaled independently of sprite)
    // ==================================================
    const shadowScale = b.attacking ? 1.2 : 1.0; // attack = slightly bigger shadow

    const shadowW = SERAPHINE_SIZE * 0.45 * shadowScale; // width
    const shadowH = SERAPHINE_SIZE * 0.18 * shadowScale; // height

    // Raise shadow up a bit so it's closer to her feet
    const shadowY = b.y + SERAPHINE_SIZE * (scale * 0.30);

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(b.x, shadowY, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (b.alive && !b.defeated) {
      drawSeraphineSparkles(ctx, b);
    }

    // Death fade
    if (!b.alive && b.defeated) {
      ctx.globalAlpha = Math.max(0, 1 - b.fadeTimer / FADE_OUT);
    }

    ctx.drawImage(
      img,
      0,
      0,
      1024,
      1024,
      drawX,
      drawY,
      drawSize,
      drawSize
    );

    if (b.alive && !b.defeated) {
      drawBossHpBar(ctx, b);
    }

    ctx.restore();
  }

  // Orbs on top of boss shadow but under UI
  drawDarkOrbs(ctx);

  ctx.restore();
}

// ------------------------------------------------------------
// 🧺 PUBLIC API
// ------------------------------------------------------------

export function getSeraphines() {
  return seraphines;
}

export function clearSeraphines() {
  seraphines.length = 0;
  darkOrbs.length = 0;
}

export function getSeraphinesEdgeFlash() {
  // ease display toward target for smoother fade-in/out
  seraphineEdgeFlashDisplay += (seraphineEdgeFlash - seraphineEdgeFlashDisplay) * 0.08;
  return seraphineEdgeFlashDisplay;
}
// ============================================================
// 🌟 END OF FILE — seraphine.js
// ============================================================

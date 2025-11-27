// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ WASD movement + directional animations
// ✦ Melee / Ranged / Heal / Spell combat system (modular)
// ✦ Silver arrows, knockback, collisions, sparkle FX
// ✦ Bravery aura + stat-scaled damage & mana costs
// ✦ Unified enemy contact damage & pushback
// ✦ NO window.__goblins — uses imported getGoblins()
// ============================================================
/* ------------------------------------------------------------
 * MODULE: playerController.js
 * PURPOSE:
 *   Controls the player character — input, movement, animation,
 *   and bridges input → combat modules → visual FX.
 *
 * SUMMARY:
 *   - Movement: WASD / arrows + map collision & goblin shunt
 *   - Combat:
 *       • Melee (Space)  → ./combat/melee.js
 *       • Ranged (Mouse) → ./combat/ranged.js
 *       • Heal (R)       → ./combat/heal.js
 *       • Spell (F)      → ./combat/spell.js
 *   - Targets:
 *       • Goblins (getGoblins)
 *       • Ogres (getOgres)
 *   - FX: glitter sparkles, damage bursts, bravery aura
 *   - Works with fixed timestep game loop + camera
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { getGoblins } from "../entities/goblin.js";
import { getGoblins as getIceGoblins } from "../entities/iceGoblin.js";
import { getGoblins as getEmberGoblins } from "../entities/emberGoblin.js";
import { getGoblins as getAshGoblins } from "../entities/ashGoblin.js";
import { getGoblins as getVoidGoblins } from "../entities/voidGoblin.js";
import { getWorg } from "../entities/worg.js";
import { getElites } from "../entities/elite.js";
import { getCrossbows } from "../entities/crossbow.js";
import { getTrolls } from "../entities/troll.js";
import { getSeraphines } from "../entities/seraphine.js";
import { updateHUD, getArrowCount } from "../screenManagement/ui.js";
import { playPlayerDamage, playCancelSound } from "../core/soundtrack.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { handleSpireKey } from "../spires/spirePlacement.js";
import { getOgres } from "../entities/ogre.js";
import { getMapPixelSize } from "../maps/map.js";
import { SKINS } from "../screenManagement/skins.js";
import { activateBravery } from "./bravery.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";

import {
  updateAndDrawSparkles,
  spawnDamageSparkles
} from "../fx/sparkles.js";

import { performMelee, drawSlashArc } from "../combat/melee.js";
import { performRanged } from "../combat/ranged.js";
import { performSpell as castSpell } from "../combat/spell.js";
import { performHeal as castHeal } from "../combat/heal.js";

import { spawnArrow } from "../combat/arrow.js";


// ------------------------------------------------------------
// 🔢 Spire Hotkeys (1–5 etc.)
// ------------------------------------------------------------

window.addEventListener("keydown", (e) => {
  const code = e?.code;
  if (!code) return;
  if (code.startsWith("Digit")) handleSpireKey(code);
});

// ------------------------------------------------------------
// 🔧 Input + Runtime State
// ------------------------------------------------------------

let canvasRef = null;
const keys = new Set();

const DEFAULT_SPEED = 160;
const SPRITE_SIZE = 80;
const WALK_FRAME_INTERVAL = 220;
const SHADOW_OPACITY = 0.25;
const STEP_LENGTH_PX = 80; // distance traveled that counts as one story step
const LOW_HP_THRESHOLD = 0.3;
const LOW_HP_RESET = 0.36;

// Attack / animation state
let attackCooldown = 0;
let isAttacking = false;
let attackType = null;
let currentFrame = 0;
let currentDir = "down";
let isMoving = false;
let lowHpAlerted = false;

// Walk anim timer
let frameTimer = 0;

// ------------------------------------------------------------
// 🎨 Sprite Atlas
// ------------------------------------------------------------

const sprites = {
  idle: null,
  walk: {
    up: [null, null],
    left: [null, null],
    down: [null, null],
    right: [null, null],
  },
  attack: {
    left: [null, null],   // 0: attack_*, 1: melee_*
    right: [null, null],
  },
  shoot: {
    left: [null, null],   // 0: raise_*, 1: shoot_*
    right: [null, null],
    lowerLeft: null,
    lowerRight: null,
  },
  spell: {
    charge: null,
    explode: null,
  },
  heal: null,
  dead: null,
};

// Cooldowns (seconds)
const CD_MELEE = 0.5;
const CD_RANGED = 0.4;
const CD_HEAL = 1.0;
const CD_SPELL = 1.0;

function loadSprite(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

// ------------------------------------------------------------
// 🖼 Load Player Sprites (Skin-Aware)
// ------------------------------------------------------------

async function loadPlayerSprites() {
  const skinKey = gameState.player?.skin || "glitter";
  const folder = SKINS[skinKey].folder;
  const base = `./assets/images/sprites/${folder}/${folder}`;
  const L = (suffix) => loadSprite(`${base}${suffix}`);

  // Idle + Walk
  sprites.idle = await L("_idle.png");

  sprites.walk.up[0] = await L("_W1.png");
  sprites.walk.up[1] = await L("_W2.png");
  sprites.walk.left[0] = await L("_A1.png");
  sprites.walk.left[1] = await L("_A2.png");
  sprites.walk.down[0] = await L("_S1.png");
  sprites.walk.down[1] = await L("_S2.png");
  sprites.walk.right[0] = await L("_D1.png");
  sprites.walk.right[1] = await L("_D2.png");

  // Attack
  sprites.attack.left[0] = await L("_attack_left.png");
  sprites.attack.left[1] = await L("_melee_left.png");
  sprites.attack.right[0] = await L("_attack_right.png");
  sprites.attack.right[1] = await L("_melee_right.png");

  // Shooting
  sprites.shoot.left[0] = await L("_raise_left.png");
  sprites.shoot.left[1] = await L("_shoot_left.png");
  sprites.shoot.right[0] = await L("_raise_right.png");
  sprites.shoot.right[1] = await L("_shoot_right.png");
  sprites.shoot.lowerLeft = await L("_lower_left.png");
  sprites.shoot.lowerRight = await L("_lower_right.png");

  // Spell
  sprites.spell.charge = await L("_spell_charge.png");
  sprites.spell.explode = await L("_spell_explode.png");

  // Heal
  sprites.heal = await L("_heal_kneel.png");

  // Dead
  sprites.dead = await L("_slain.png");
}

// ------------------------------------------------------------
// 🧱 Ensure Player Runtime Defaults
// ------------------------------------------------------------

function ensurePlayerRuntime() {
  if (!gameState.player) {
    gameState.player = {
      name: gameState.profile?.name || "Princess",
      pos: { x: 400, y: 400 },
      speed: DEFAULT_SPEED,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 15,
      defense: 5,
      rangedAttack: 10,
      spellPower: 10,
    };
  }

  const p = gameState.player;

  if (!p.name) p.name = gameState.profile?.name || "Princess";

  if (!p.pos || typeof p.pos.x !== "number" || typeof p.pos.y !== "number") {
    p.pos = { x: 400, y: 400 };
  }

  if (typeof p.speed !== "number") p.speed = DEFAULT_SPEED;
  if (typeof p.attack !== "number" || isNaN(p.attack)) p.attack = 15;
  if (typeof p.rangedAttack !== "number" || isNaN(p.rangedAttack)) p.rangedAttack = 10;
  if (typeof p.spellPower !== "number" || isNaN(p.spellPower)) p.spellPower = 10;

  if (typeof p.hp !== "number" || isNaN(p.hp)) p.hp = 100;
  if (typeof p.maxHp !== "number" || isNaN(p.maxHp)) p.maxHp = 100;
  if (typeof p.mana !== "number" || isNaN(p.mana)) p.mana = 50;
  if (typeof p.maxMana !== "number" || isNaN(p.maxMana)) p.maxMana = 50;
  if (typeof p.defense !== "number" || isNaN(p.defense)) p.defense = 5;
  if (typeof p.dead === "undefined") p.dead = false;

  if (!p.body) {
    const bw = SPRITE_SIZE * 0.55;
    const bh = SPRITE_SIZE * 0.38;
    const ox = -bw / 2;
    const oy = SPRITE_SIZE * 0.50;
    p.body = { bw, bh, ox, oy };
  }

  if (typeof p.invulnTimer !== "number") p.invulnTimer = 0;
  if (typeof p.speedMultiplier !== "number") p.speedMultiplier = 1;
  if (typeof p.steps !== "number") p.steps = 0;
  if (typeof p.stepDistance !== "number") p.stepDistance = 0;
}

// ------------------------------------------------------------
// ⚠️ Shared “Not Enough Mana” Feedback
// ------------------------------------------------------------

function notEnoughMana(p) {
  spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough mana!", "#77aaff");
  if (typeof playCancelSound === "function") playCancelSound();
}

function getAllGoblinVariants() {
  return [
    ...getGoblins(),
    ...getIceGoblins(),
    ...getEmberGoblins(),
    ...getAshGoblins(),
    ...getVoidGoblins(),
  ];
}

function applyEnemyBodyCollision(nextX, nextY) {
  const groups = [
    { list: getAllGoblinVariants(), radius: 45 },
    { list: getWorg(), radius: 45 },
    { list: getElites(), radius: 45 },
    { list: getCrossbows(), radius: 45 },
    { list: getTrolls(), radius: 55 },
    { list: getSeraphines(), radius: 72 },
  ];

  let px = nextX;
  let py = nextY;

  for (const { list, radius } of groups) {
    if (!list?.length) continue;

    for (const e of list) {
      if (!e || !e.alive) continue;

      const ex = e.x ?? e.pos?.x;
      const ey = e.y ?? e.pos?.y;
      if (typeof ex !== "number" || typeof ey !== "number") continue;

      const dx = px - ex;
      const dy = py - ey;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < radius) {
        const overlap = (radius - dist) / 3;
        const nx = dx / dist;
        const ny = dy / dist;

        px += nx * overlap * 0.8;
        py += ny * overlap * 0.8;
      }
    }
  }

  return { x: px, y: py };
}

// ------------------------------------------------------------
// ⌨️ Input Handlers
// ------------------------------------------------------------

function onKeyDown(e) {
  keys.add(e.code);

  // Bravery activate
  if (e.code === "KeyQ") {
    activateBravery();
  }

  if (!isAttacking && attackCooldown <= 0) {
    switch (e.code) {
      case "Space":
        performMeleeAttack();
        break;
      case "KeyR":
        performHealAction();
        break;
      case "KeyF":
        performSpellAction();
        break;
    }
  }
}

function onKeyUp(e) {
  keys.delete(e.code);
}

function onMouseDown(e) {
  if (!isAttacking && attackCooldown <= 0) {
    performRangedAttack(e);
  }
}

// ------------------------------------------------------------
// 🔧 Init / Destroy
// ------------------------------------------------------------

export async function initPlayerController(canvas) {
  canvasRef = canvas;
  ensurePlayerRuntime();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousedown", onMouseDown);

  await loadPlayerSprites();
}

export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousedown", onMouseDown);
}

// ------------------------------------------------------------
// 🗡️ Melee Attack (Space) → combat/melee.js
// ------------------------------------------------------------

function performMeleeAttack() {
  const p = gameState.player;
  if (!p) return;

  if (attackCooldown > 0) return;

  isAttacking = true;
  attackType = "melee";
  attackCooldown = CD_MELEE;
  currentFrame = 0;

  const { tier } = performMelee(p, currentDir);
  p.lastMeleeTier = tier;

  setTimeout(() => {
    currentFrame = 1;
  }, 180);

  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, 400);
}

// ------------------------------------------------------------
// 🏹 Ranged Attack (Mouse) → combat/ranged.js
// ------------------------------------------------------------

function performRangedAttack(e) {
  const p = gameState.player;
  if (!p || !canvasRef) return;

  if (attackCooldown > 0) return;

  // Call modular ranged system
  const result = performRanged(p, e, canvasRef);

  if (!result.ok) {
    if (result.reason === "mana") notEnoughMana(p);
    return;
  }

  // Sync facing for shooting animation
  if (result.facing) {
    p.facing = result.facing;
  }

  isAttacking = true;
  attackType = "ranged";
  attackCooldown = CD_RANGED;

  setTimeout(() => {
    isAttacking = false;
  }, 300);
}

// ------------------------------------------------------------
// 💖 Heal (R) → combat/heal.js
// ------------------------------------------------------------

function performHealAction() {
  const p = gameState.player;
  if (!p) return;

  if (attackCooldown > 0) return;

  const result = castHeal(p);

  if (!result.ok) {
    if (result.reason === "mana") notEnoughMana(p);
    return;
  }

  isAttacking = true;
  attackType = "heal";
  attackCooldown = CD_HEAL;
  currentFrame = 0;

  const anim = result.anim;

  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, anim.totalTime);
}

// ------------------------------------------------------------
// 🔮 Spell (F) → combat/spell.js
// ------------------------------------------------------------

function performSpellAction() {
  const p = gameState.player;
  if (!p) return;

  if (attackCooldown > 0) return;

  const result = castSpell(p);

  if (!result.ok) {
    if (result.reason === "mana") notEnoughMana(p);
    return;
  }

  isAttacking = true;
  attackType = "spell";
  attackCooldown = CD_SPELL;
  currentFrame = 0;

  const anim = result.anim;

  setTimeout(() => {
    currentFrame = 1;
  }, anim.chargeTime);

  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, anim.totalTime);
}

// ============================================================
// 🔁 UPDATE PLAYER — Movement, Combat, Collision, Regen + FX
// ============================================================

export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  if (p.slowAuraTimer > 0) {
    p.slowAuraTimer -= delta;     // ms count-down
    p.speedMultiplier = p.slowAuraFactor || 0.5;
  } else {
    p.speedMultiplier = 1;
  }

  if (p.hp <= 0 && !p.dead) {
    p.hp = 0;
    p.dead = true;
    isAttacking = false;
    isMoving = false;
  }

  if (p.dead) return;

  if (p.flashTimer > 0) p.flashTimer -= delta;

  // Cooldown tick
  if (attackCooldown > 0) {
    attackCooldown -= dt;
    if (attackCooldown < 0) attackCooldown = 0;
  }

  // 🔮 Passive mana regen
  const regenRate = 0.8 + (p.level ?? 1) * 0.05;
  const prevArrows = getArrowCount();
  p.mana = Math.min(p.maxMana, p.mana + regenRate * dt);

  if (getArrowCount() !== prevArrows) {
    updateHUD();
  }

  // 🎮 Movement input
  const left = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up = keys.has("KeyW") || keys.has("ArrowUp");
  const down = keys.has("KeyS") || keys.has("ArrowDown");

  let dx = 0;
  let dy = 0;
  if (left) dx -= 1;
  if (right) dx += 1;
  if (up) dy -= 1;
  if (down) dy += 1;

  isMoving = dx !== 0 || dy !== 0;

  // Diagonal normalisation
  if (dx && dy) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv;
    dy *= inv;
  }

  // 🚶 Movement + goblin body shunt
  if (!isAttacking) {
    const prevX = p.pos.x;
    const prevY = p.pos.y;

    let nextX = p.pos.x + dx * speed * p.speedMultiplier * dt;
    let nextY = p.pos.y + dy * speed * p.speedMultiplier * dt;
    const { bw, bh, ox, oy } = p.body;
    const feetX = nextX + ox;
    const feetY = nextY + oy;

    if (!isRectBlocked(feetX, feetY, bw, bh)) {
      const { x: resolvedX, y: resolvedY } = applyEnemyBodyCollision(nextX, nextY);

      p.pos.x = resolvedX;
      p.pos.y = resolvedY;

      const moved = Math.hypot(p.pos.x - prevX, p.pos.y - prevY);
      if (moved > 0) {
        p.stepDistance += moved;
        while (p.stepDistance >= STEP_LENGTH_PX) {
          p.steps += 1;
          p.stepDistance -= STEP_LENGTH_PX;
        }
      }
    }
  }

  // Facing
  if (left || right) {
    if (left && !right) currentDir = "left";
    else if (right && !left) currentDir = "right";
  } else if (up || down) {
    currentDir = up ? "up" : "down";
  }

  // Clamp to map world
  const { width: mapW, height: mapH } = getMapPixelSize();
  const r = SPRITE_SIZE / 2;
  p.pos.x = Math.max(r, Math.min(mapW - r, p.pos.x));
  p.pos.y = Math.max(r, Math.min(mapH - r, p.pos.y));

  // 🟥 Player ↔ goblin contact damage (uses invulnTimer)
  if (!p.invincible) {
    if (p.invulnTimer > 0) {
      p.invulnTimer -= delta;
    } else {
      const goblinTargets = getAllGoblinVariants();
      for (const g of goblinTargets) {
        if (!g.alive) continue;

        const dxg = g.x - p.pos.x;
        const dyg = g.y - p.pos.y;
        const dist = Math.hypot(dxg, dyg);

        if (dist < 50) {
          const damage = 10;
          p.hp = Math.max(0, p.hp - damage);
          p.flashTimer = 200;
          p.invulnTimer = 800;

          spawnFloatingText(p.pos.x, p.pos.y - 30, `-${damage}`, "#ff7aa8");
          playPlayerDamage();
          spawnDamageSparkles(p.pos.x, p.pos.y);

          break;
        }
      }
    }
  }

  // 🐲 Ogre collision pushback (damage handled in ogre.js)
  const ogres = getOgres() || [];
  for (const o of ogres) {
    if (!o.alive) continue;

    const dxo = o.x - p.pos.x;
    const dyo = o.y - p.pos.y;
    const dist = Math.hypot(dxo, dyo);
    const combinedRadius = 60;

    if (dist < combinedRadius && dist > 0) {
      const pushStrength = 4;
      p.pos.x -= (dxo / dist) * pushStrength;
      p.pos.y -= (dyo / dist) * pushStrength;
    }
  }

  // 🌀 Animation
  if (isAttacking) {
    // handled by attack timeouts
  } else if (isMoving) {
    frameTimer += delta;
    if (frameTimer >= WALK_FRAME_INTERVAL) {
      frameTimer = 0;
      currentFrame = (currentFrame + 1) % 2;
    }
  } else {
    frameTimer = 0;
    currentFrame = 0;
  }

  // Mirror convenience
  gameState.player.x = p.pos.x;
  gameState.player.y = p.pos.y;

  // Low HP alert (fires once until healed past reset threshold)
  const hpPct = Math.max(0, Math.min(1, (p.hp || 0) / (p.maxHp || 1)));
  if (!lowHpAlerted && hpPct <= LOW_HP_THRESHOLD) {
    lowHpAlerted = true;
    Events.emit(E.playerLowHP, { hp: p.hp, maxHp: p.maxHp });
  } else if (lowHpAlerted && hpPct >= LOW_HP_RESET) {
    lowHpAlerted = false;
  }
}

// ============================================================
// 🎨 DRAW PLAYER — Sprite + HP Bar + Sparkles
// ============================================================

export function drawPlayer(ctx) {
  if (!ctx) return;
  ensurePlayerRuntime();

  const p = gameState.player;
  const { x, y } = p.pos;

  let img = sprites.idle;

  if (p.dead) {
    img = sprites.dead;
  } else if (isAttacking) {
    if (attackType === "melee") {
      const dir = currentDir === "left" ? "left" : "right";
      img = currentFrame === 0 ? sprites.attack[dir][0] : sprites.attack[dir][1];
    } else if (attackType === "ranged") {
      const facing = p.facing || "right";
      switch (facing) {
        case "left":
          img = sprites.shoot.left[1];
          break;
        case "right":
          img = sprites.shoot.right[1];
          break;
        case "topLeft":
          img = sprites.shoot.left[0];
          break;
        case "topRight":
          img = sprites.shoot.right[0];
          break;
        case "bottomLeft":
          img = sprites.shoot.lowerLeft;
          break;
        case "bottomRight":
          img = sprites.shoot.lowerRight;
          break;
        default:
          img = sprites.shoot.right[1];
          break;
      }
    } else if (attackType === "spell") {
      img = currentFrame === 0 ? sprites.spell.charge : sprites.spell.explode;
    } else if (attackType === "heal") {
      img = sprites.heal;
    }
  } else if (isMoving) {
    img = sprites.walk[currentDir][currentFrame];
  } else {
    img = sprites.idle;
  }

  if (!img) return;

  const drawX = x - SPRITE_SIZE / 2;
  const drawY = y - SPRITE_SIZE / 2;

  ctx.save();

  // ✨ Bravery aura (invincible flag)
  if (p.invincible === true) {
    ctx.save();

    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 120);
    const auraRadius = SPRITE_SIZE * (0.9 + pulse * 0.25);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, auraRadius);
    gradient.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
    gradient.addColorStop(0.35, "rgba(255, 170, 255, 0.75)");
    gradient.addColorStop(0.7, "rgba(190, 120, 255, 0.55)");
    gradient.addColorStop(1.0, "rgba(170, 0, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 200, 255, ${
      0.8 + 0.2 * Math.sin(Date.now() / 150)
    })`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, auraRadius * 0.95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Shadow
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + SPRITE_SIZE / 2.3,
    SPRITE_SIZE * 0.35,
    SPRITE_SIZE * 0.15,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = `rgba(0,0,0,${SHADOW_OPACITY})`;
  ctx.fill();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Player sprite (melee first frame exaggerated)
  if (isAttacking && attackType === "melee" && currentFrame === 0) {
    const scale = 1.5;
    const w = SPRITE_SIZE * scale;
    const h = SPRITE_SIZE * scale;
    ctx.drawImage(img, 0, 0, 1024, 1024, x - w / 2, y - h / 2, w, h);
  } else {
    const isDownWalk = !isAttacking && isMoving && currentDir === "down";
    const isUpWalk = !isAttacking && isMoving && currentDir === "up";

    if (isDownWalk || isUpWalk) {
      const scale = 1.2;
      const w = SPRITE_SIZE * scale;
      const h = SPRITE_SIZE * scale;

      const lowerFeet = SPRITE_SIZE * 0.18;
      const raiseUp = SPRITE_SIZE * 0.2;

      const offsetX = x - w / 2;
      const offsetY = y - h / 2 + lowerFeet - raiseUp;

      ctx.drawImage(img, 0, 0, 1024, 1024, offsetX, offsetY, w, h);
    } else {
      ctx.drawImage(
        img,
        0,
        0,
        1024,
        1024,
        drawX,
        drawY,
        SPRITE_SIZE,
        SPRITE_SIZE
      );
    }
  }

  // ---------------------------------------------
  // 🗡️ Slash Arc FX (Tier-scaled, first attack frame only)
  // ---------------------------------------------
  if (isAttacking && attackType === "melee" && currentFrame === 0) {
    const tier = p.lastMeleeTier || 1;
    drawSlashArc(ctx, x, y, currentDir, tier);
  }

  // ❤️ Player HP bar
  if (!p.dead) {
    const barWidth = 42;
    const barHeight = 4;
    const offsetY = SPRITE_SIZE * 0.5 + 12;
    const hpPct = Math.max(0, Math.min(1, p.hp / p.maxHp));

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - barWidth / 2, y + offsetY, barWidth, barHeight);

    const grad = ctx.createLinearGradient(
      x - barWidth / 2,
      0,
      x + barWidth / 2,
      0
    );
    grad.addColorStop(0, "#ff66b3");
    grad.addColorStop(1, "#ff99cc");
    ctx.fillStyle = grad;
    ctx.fillRect(
      x - barWidth / 2,
      y + offsetY,
      barWidth * hpPct,
      barHeight
    );

    ctx.strokeStyle = "rgba(255,182,193,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y + offsetY, barWidth, barHeight);
  }

  // 🌈 Sparkles
  updateAndDrawSparkles(ctx, 16);

  ctx.restore();
}

// ------------------------------------------------------------
// 🧭 Controller Reset (for Try Again)
// ------------------------------------------------------------

export function resetPlayerControllerState() {
  isAttacking = false;
  attackType = null;
  currentFrame = 0;
  isMoving = false;
  attackCooldown = 0;
}

window.__playerControllerReset = resetPlayerControllerState;

// ============================================================
// 🌟 END OF FILE
// ============================================================

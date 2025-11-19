// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ WASD movement + directional animations
// ✦ Melee / Ranged / Heal / Spell combat system
// ✦ Silver arrows, knockback, collisions, sparkle FX
// ✦ Bravery aura + stat-scaled damage & mana costs
// ✦ Unified target system (goblins, ogres, worgs, elites, trolls, crossbows)
// ✦ NO window.__goblins — uses imported getGoblins()
// ============================================================
/* ------------------------------------------------------------
 * MODULE: playerController.js
 * PURPOSE:
 *   Controls the player character — input, movement, combat,
 *   projectiles, animations, and visual FX.
 *
 * SUMMARY:
 *   - Movement: WASD / arrows + map collision & goblin shunt
 *   - Combat:
 *       • Melee (Space)
 *       • Ranged (Mouse)
 *       • Heal (R)
 *       • Spell (F)
 *   - Targets:
 *       • Goblins (getGoblins)
 *       • Ogres (getOgres)
 *       • Worgs (getWorg)
 *       • Elites (getElites)
 *       • Trolls (getTrolls)
 *       • Crossbow goblins (getCrossbows)
 *   - FX: glitter sparkles, damage bursts, bravery aura
 *   - Works with fixed timestep game loop + camera
 * ------------------------------------------------------------ */

// ------------------------------------------------------------ 
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { damageGoblin, getGoblins } from "./goblin.js";
import { updateHUD, getArrowCount } from "./ui.js";
import {
  playFairySprinkle,
  playMeleeSwing,
  playArrowSwish,
  playSpellCast,
  playPlayerDamage,
  playCancelSound,
} from "./soundtrack.js";
import { spawnFloatingText } from "./floatingText.js";
import { handleSpireKey } from "./spirePlacement.js";
import { getOgres, damageOgre, OGRE_HIT_RADIUS } from "./ogre.js";
import { getWorg } from "./worg.js";
import { getElites, damageElite } from "./elite.js";
import { getTrolls } from "./troll.js";
import { getMapPixelSize } from "./map.js";
import { SKINS } from "./skins.js";
import { activateBravery } from "./ui.js";
import { getCrossbows } from "./crossbow.js";

// ------------------------------------------------------------
// 🔢 Spire Hotkeys (1–5 etc.)
// ------------------------------------------------------------

window.addEventListener("keydown", (e) => {
  if (e.code.startsWith("Digit")) handleSpireKey(e.code);
});

// ------------------------------------------------------------
// 🧩 Unified Target Helper
// ------------------------------------------------------------

function getAllTargets() {
  return [
    ...getGoblins(),
    ...getOgres(),
    ...getWorg(),
    ...getElites(),
    ...getTrolls(),
    ...getCrossbows(),
  ];
}

// ------------------------------------------------------------
// 🔧 Input + Runtime State
// ------------------------------------------------------------

let canvasRef = null;
const keys = new Set();

const DEFAULT_SPEED = 160;
const SPRITE_SIZE = 80;
const WALK_FRAME_INTERVAL = 220;
const SHADOW_OPACITY = 0.25;

// Attack / animation state
let attackCooldown = 0;
let isAttacking = false;
let attackType = null;
let currentFrame = 0;
let currentDir = "down";
let isMoving = false;

// Ranged projectiles (silver arrows)
let projectiles = [];

// Cooldowns (seconds)
const CD_MELEE = 0.5;
const CD_RANGED = 0.4;
const CD_HEAL = 1.0;
const CD_SPELL = 1.0;

// Mana costs
const COST_HEAL = 15;
const COST_SPELL = 10;

// Damage multipliers
const DMG_MELEE = 1.2;
const DMG_RANGED = 0.9;
const DMG_SPELL = 4;

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
    left: [null, null], // 0: attack_*, 1: melee_*
    right: [null, null],
  },
  shoot: {
    left: [null, null], // 0: raise_*, 1: shoot_*
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
    const oy = SPRITE_SIZE * 0.20;
    p.body = { bw, bh, ox, oy };
  }

  if (typeof p.invulnTimer !== "number") p.invulnTimer = 0;
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
        performHeal();
        break;
      case "KeyF":
        performSpell();
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
// 🎯 Nearest Goblin (legacy helper for facing)
// ------------------------------------------------------------

function findNearestGoblinInRange(px, py, maxDist = 320) {
  let target = null;
  let best = maxDist;

  for (const g of getGoblins()) {
    if (!g?.alive) continue;
    const dx = g.x - px;
    const dy = g.y - py;
    const d = Math.hypot(dx, dy);
    if (d < best) {
      best = d;
      target = g;
    }
  }

  return { target, dist: best };
}

// ------------------------------------------------------------
// ⚠️ Shared “Not Enough Mana” Feedback
// ------------------------------------------------------------

function notEnoughMana(p) {
  spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough mana!", "#77aaff");
  if (typeof playCancelSound === "function") playCancelSound();
}

// ------------------------------------------------------------
// 🗡️ Melee Attack (Space)
// ------------------------------------------------------------

function performMeleeAttack() {
  const p = gameState.player;
  if (!p) return;

  const dmg = p.attack * DMG_MELEE;

  const prevDir = currentDir;
  const { target } = findNearestGoblinInRange(p.pos.x, p.pos.y, 320);

  if (target) {
    const dxToGoblin = target.x - p.pos.x;
    currentDir = dxToGoblin < 0 ? "left" : "right";
  }

  isAttacking = true;
  attackType = "melee";
  attackCooldown = CD_MELEE;
  currentFrame = 0;

  setTimeout(() => {
    currentFrame = 1;
  }, 180);

  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
    currentDir = prevDir;
  }, 400);

  const range = 80;
  const ox = p.pos.x;
  const oy = p.pos.y;
  let hit = false;

  const allTargets = getAllTargets();

  for (const t of allTargets) {
    if (!t.alive) continue;

    const dx = t.x - ox;
    const dy = t.y - oy;
    const dist = Math.hypot(dx, dy);
    if (dist > range + (t.width || 32) / 2) continue;

    if (t.type === "elite") {
      damageElite(t, dmg, "player");
    } else if (t.type === "ogre" || t.maxHp >= 400) {
      damageOgre(t, dmg, "player");
    } else {
      damageGoblin(t, dmg);
    }

    hit = true;

    // Knockback (no knockback on ogres)
    if (t.type !== "ogre") {
      const len = Math.max(1, dist);
      t.x += (dx / len) * 50;
      t.y += (dy / len) * 50;
    }
  }

  spawnCanvasSparkleBurst(
    p.pos.x,
    p.pos.y,
    12,
    70,
    ["#ffd6eb", "#b5e2ff", "#ffffff"]
  );

  playMeleeSwing();

}

// ------------------------------------------------------------
// 🏹 Ranged Attack — Silver Arrows (Mouse)
// ------------------------------------------------------------

function performRangedAttack(e) {
  const p = gameState.player;
  if (!p || !canvasRef) return;

  if (p.mana < 2) {
    notEnoughMana(p);
    return;
  }

  p.mana -= 2;
  updateHUD();

  const dmg = Math.max(1, (Number(p.rangedAttack) || 0) * DMG_RANGED);

  const rect = canvasRef.getBoundingClientRect();
  const scaleX = window.canvasScaleX || (canvasRef.width / rect.width);
  const scaleY = window.canvasScaleY || (canvasRef.height / rect.height);

  const canvasX = (e.clientX - rect.left) * scaleX;
  const canvasY = (e.clientY - rect.top) * scaleY;
  const worldX = (window.cameraX || 0) + canvasX;
  const worldY = (window.cameraY || 0) + canvasY;

  const dx = worldX - p.pos.x;
  const dy = worldY - p.pos.y;
  const angle = Math.atan2(dy, dx);
  const deg = ((angle * 180) / Math.PI + 360) % 360;

  let facing;
  if (deg >= 330 || deg < 30) facing = "right";
  else if (deg >= 30 && deg < 90) facing = "bottomRight";
  else if (deg >= 90 && deg < 150) facing = "bottomLeft";
  else if (deg >= 150 && deg < 210) facing = "left";
  else if (deg >= 210 && deg < 270) facing = "topLeft";
  else if (deg >= 270 && deg < 330) facing = "topRight";
  else facing = "right";

  p.facing = facing;

  isAttacking = true;
  attackType = "ranged";
  attackCooldown = CD_RANGED;
  setTimeout(() => {
    isAttacking = false;
  }, 300);

  const speed = 1200;
  const startX = p.pos.x + Math.cos(angle) * 30;
  const startY = p.pos.y + Math.sin(angle) * 30;
  const projectile = {
    x: startX,
    y: startY,
    angle,
    speed,
    dmg,
    alive: true,
    life: 0,
  };

  projectiles.push(projectile);
  playArrowSwish();

  const checkArrowCollision = () => {
    if (!projectile.alive) return;

    const dt = 16 / 1000;
    projectile.x += Math.cos(projectile.angle) * projectile.speed * dt;
    projectile.y += Math.sin(projectile.angle) * projectile.speed * dt;
    projectile.life += 16;

    const targets = getAllTargets();
    for (const t of targets) {
      if (!t.alive) continue;

      const dx = t.x - projectile.x;
      const dy = t.y - projectile.y;
      const dist = Math.hypot(dx, dy);

      let hitRadius = 26;
      if (t.type === "elite") {
        hitRadius = 50;
      } else if (t.type === "ogre" || t.maxHp >= 400) {
        hitRadius = OGRE_HIT_RADIUS || 60;
      } else {
        hitRadius = 32;
      }

      if (dist < hitRadius) {
        if (t.type === "elite") damageElite(t, dmg);
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "player");
        else damageGoblin(t, dmg);

        projectile.alive = false;
        break;
      }
    }

    if (projectile.alive && projectile.life < 1000) {
      requestAnimationFrame(checkArrowCollision);
    }
  };

  requestAnimationFrame(checkArrowCollision);
}

// ------------------------------------------------------------
// 💖 Heal (R)
// ------------------------------------------------------------

function performHeal() {
  const p = gameState.player;
  if (!p) return;

  const cost = Number(COST_HEAL) || 0;

  if (p.mana < cost) {
    notEnoughMana(p);
    return;
  }

  isAttacking = true;
  attackType = "heal";
  attackCooldown = CD_HEAL;
  currentFrame = 0;
  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, 1000);

  p.mana = Math.max(0, p.mana - cost);

  const sp = Number(p.spellPower) || 0;
  const mh = Number(p.maxHp) || 0;
  const rawHeal = sp * 1.2 + mh * 0.08 + 10;
  const amount = Math.max(1, Math.round(rawHeal));

  const prevHP = p.hp;
  p.hp = Math.min(p.maxHp, p.hp + amount);
  const actual = Math.max(0, Math.round(p.hp - prevHP));

  playFairySprinkle();
  spawnFloatingText(p.pos.x, p.pos.y - 40, `+${actual}`, "#7aff7a");

  spawnCanvasSparkleBurst(
    p.pos.x,
    p.pos.y,
    18,
    90,
    ["#b3ffb3", "#99ffcc", "#ccffcc"]
  );

  updateHUD();

}

// ------------------------------------------------------------
// 🔮 Spell (F) — Pastel AoE Burst
// ------------------------------------------------------------

function performSpell() {
  const p = gameState.player;
  if (!p) return;

  if (p.mana < COST_SPELL) {
    notEnoughMana(p);
    return;
  }

  isAttacking = true;
  attackType = "spell";
  attackCooldown = CD_SPELL;
  p.mana -= COST_SPELL;

  currentFrame = 0;
  setTimeout(() => {
    currentFrame = 1;
  }, 350);
  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, 900);

  setTimeout(() => {
    const dmg = Math.max(1, (Number(p.spellPower) || 0) * DMG_SPELL);
    const radius = 150;
    let hits = 0;

    const targets = getAllTargets();
    for (const t of targets) {
      if (!t.alive) continue;

      const dx = t.x - p.pos.x;
      const dy = t.y - p.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        if (t.type === "elite") damageElite(t, dmg, "spell");
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "spell");
        else damageGoblin(t, dmg);
        hits++;
      }
    }

    spawnCanvasSparkleBurst(
      p.pos.x,
      p.pos.y,
      26,
      160,
      ["#ffb3e6", "#b3ecff", "#fff2b3", "#cdb3ff", "#b3ffd9", "#ffffff"]
    );

    updateHUD();
    playSpellCast();
  }, 400);
}

// ------------------------------------------------------------
// 🌈 GLITTER BURSTS — Optimized Sparkle System
// ------------------------------------------------------------

const sparkles = [];
const MAX_SPARKLES = 60;

function spawnCanvasSparkleBurst(x, y, count = 50, radius = 140, colors) {
  colors ??= ["#ffd6eb", "#b5e2ff", "#fff2b3"];

  for (let i = 0; i < count; i++) {
    if (sparkles.length >= MAX_SPARKLES) {
      sparkles.shift();
    }

    const ang = Math.random() * Math.PI * 2;
    const speed = 140 + Math.random() * 160;

    sparkles.push({
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 600 + Math.random() * 400,
      age: 0,
      size: 2 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function updateAndDrawSparkles(ctx, delta) {
  if (!sparkles.length) return;

  const dt = delta / 1000;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.age += delta;

    if (s.age >= s.life) {
      sparkles.splice(i, 1);
      continue;
    }

    const t = s.age / s.life;

    s.vx *= 0.985;
    s.vy *= 0.985;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    const alpha = (1 - t) * 0.9;
    const r = s.size * (1 + 0.4 * (1 - t));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ------------------------------------------------------------
// 🌸 Damage Sparkle Burst (Soft Pink Hit)
// ------------------------------------------------------------

export function spawnDamageSparkles(x, y) {
  const palette = ["#ff7aa8", "#ff99b9", "#ffb3c6", "#ffccd5"];
  spawnCanvasSparkleBurst(x, y, 10, 50, palette);
}

// ------------------------------------------------------------
// 🏹 Legacy Silver Arrow Projectiles (Map + Goblin Only)
// (Used in addition to the per-arrow collision system above)
// ------------------------------------------------------------

function updateProjectiles(delta) {
  const dt = delta / 1000;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const a = projectiles[i];
    if (!a.alive) {
      projectiles.splice(i, 1);
      continue;
    }

    a.x += Math.cos(a.angle) * a.speed * dt;
    a.y += Math.sin(a.angle) * a.speed * dt;

    a.life += delta;
    if (a.life > 1500) {
      a.alive = false;
      continue;
    }

    const hitbox = 8;
    if (isRectBlocked(a.x - hitbox / 2, a.y - hitbox / 2, hitbox, hitbox)) {
      a.alive = false;
      continue;
    }

    for (const g of getGoblins()) {
      if (!g.alive) continue;
      const dist = Math.hypot(g.x - a.x, g.y - a.y);
      if (dist < 45) {
        damageGoblin(g, a.dmg);
        a.alive = false;
        break;
      }
    }
  }
}

// ============================================================
// 🔁 UPDATE PLAYER — Movement, Combat, Collision, Regen + FX
// ============================================================

export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  if (p.hp <= 0 && !p.dead) {
    p.hp = 0;
    p.dead = true;
    isAttacking = false;
    isMoving = false;
  }

  if (p.dead) return;

  if (p.flashTimer > 0) p.flashTimer -= delta;

  if (attackCooldown > 0) attackCooldown -= dt;
  updateProjectiles(delta);

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
    let nextX = p.pos.x + dx * speed * dt;
    let nextY = p.pos.y + dy * speed * dt;
    const { bw, bh, ox, oy } = p.body;
    const feetX = nextX + ox;
    const feetY = nextY + oy;

    if (!isRectBlocked(feetX, feetY, bw, bh)) {
      for (const g of getGoblins()) {
        if (!g.alive) continue;
        const dxp = nextX - g.x;
        const dyp = nextY - g.y;
        const dist = Math.hypot(dxp, dyp);
        const minDist = 45;
        if (dist > 0 && dist < minDist) {
          const overlap = (minDist - dist) / 3;
          const nx = dxp / dist;
          const ny = dyp / dist;
          nextX += nx * overlap * 0.8;
          nextY += ny * overlap * 0.8;
        }
      }

      p.pos.x = nextX;
      p.pos.y = nextY;
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
      for (const g of getGoblins()) {
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
}

// ============================================================
// 🎨 DRAW PLAYER — Sprite + HP Bar + Projectiles + Sparkles
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

  // 🏹 Silver arrow projectiles
  ctx.fillStyle = "rgba(240,240,255,0.9)";
  for (const a of projectiles) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillRect(0, -3, 45, 4);
    ctx.restore();
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

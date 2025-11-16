// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep (Combat + Glitter FX Optimized)
// ------------------------------------------------------------
// ✦ WASD + animation + directional attacks
// ✦ Melee / Ranged / Heal / Spell abilities
// ✦ Knockback + drawn silver arrows + sparkle FX (canvas-based)
// ✦ Stat-scaled damage & mana costs
// ✦ Uses shared enemy array via window.__enemies (kills goblins properly)
// ✦ 🌈 Sparkle system heavily optimized (no blur, capped particles)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { damageEnemy } from "./enemies.js"; // ✅ shared enemy array mutated inside enemies.js
import { updateHUD } from "./ui.js";
import { 
  playFairySprinkle, 
  playMeleeSwing, 
  playArrowSwish, 
  playSpellCast, 
  playPlayerDamage,
  playCancelSound             // ✅ REQUIRED
} from "./soundtrack.js";

import { spawnFloatingText } from "./floatingText.js";
import { handleTowerKey } from "./towerPlacement.js";
import { getOgres, damageOgre, OGRE_HIT_RADIUS } from "./ogre.js";
import { getWorg } from "./worg.js";
import { getElites, damageElite } from "./elite.js";
import { getMapPixelSize } from "./map.js";
// Tower hotkeys
window.addEventListener("keydown", (e) => {
  if (e.code.startsWith("Digit")) handleTowerKey(e.code);
});

// ------------------------------------------------------------
// ✅ Shared enemy getter (same instance towers & player use)
const getEnemies = () => window.__enemies || [];

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

// Projectiles
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
// Sprites
const sprites = {
  idle: null,
  walk: { up: [null, null], left: [null, null], down: [null, null], right: [null, null] },
  attack: { left: [null, null], right: [null, null] }, // 0: attack_*, 1: melee_*
  shoot:  { left: [null, null], right: [null, null] }, // 0: raise_*,  1: shoot_*
};

function loadSprite(src) {
  return new Promise((r) => {
    const img = new Image();
    img.src = src;
    img.onload = () => r(img);
  });
}

async function loadPlayerSprites() {
  // 🩷 IDLE + WALK
  sprites.idle = await loadSprite("./assets/images/sprites/glitter/glitter_idle.png");

  sprites.walk.up[0] = await loadSprite("./assets/images/sprites/glitter/glitter_W1.png");
  sprites.walk.up[1] = await loadSprite("./assets/images/sprites/glitter/glitter_W2.png");
  sprites.walk.left[0] = await loadSprite("./assets/images/sprites/glitter/glitter_A1.png");
  sprites.walk.left[1] = await loadSprite("./assets/images/sprites/glitter/glitter_A2.png");
  sprites.walk.down[0] = await loadSprite("./assets/images/sprites/glitter/glitter_S1.png");
  sprites.walk.down[1] = await loadSprite("./assets/images/sprites/glitter/glitter_S2.png");
  sprites.walk.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_D1.png");
  sprites.walk.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_D2.png");

  // 🗡️ MELEE (2-frame sequence)
  sprites.attack.left[0]  = await loadSprite("./assets/images/sprites/glitter/glitter_attack_left.png");
  sprites.attack.left[1]  = await loadSprite("./assets/images/sprites/glitter/glitter_melee_left.png");
  sprites.attack.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_attack_right.png");
  sprites.attack.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_melee_right.png");

  // 🏹 RANGED (2-frame sequence)
  sprites.shoot.left[0]   = await loadSprite("./assets/images/sprites/glitter/glitter_raise_left.png");
  sprites.shoot.left[1]   = await loadSprite("./assets/images/sprites/glitter/glitter_shoot_left.png");
  sprites.shoot.right[0]  = await loadSprite("./assets/images/sprites/glitter/glitter_raise_right.png");
  sprites.shoot.right[1]  = await loadSprite("./assets/images/sprites/glitter/glitter_shoot_right.png");
  sprites.shoot.lowerLeft  = await loadSprite("./assets/images/sprites/glitter/glitter_lower_left.png");
  sprites.shoot.lowerRight = await loadSprite("./assets/images/sprites/glitter/glitter_lower_right.png");

  // 🔮 SPELL (2-frame sequence)
  sprites.spell = {};
  sprites.spell.charge  = await loadSprite("./assets/images/sprites/glitter/glitter_spell_charge.png");
  sprites.spell.explode = await loadSprite("./assets/images/sprites/glitter/glitter_spell_explode.png");

  // 💖 HEAL (single-frame kneeling prayer)
  sprites.heal = await loadSprite("./assets/images/sprites/glitter/glitter_heal_kneel.png");

  // 💀 DEATH (single slain frame)
  sprites.dead = await loadSprite("./assets/images/sprites/glitter/glitter_slain.png");

  console.log("🦄 Glitter sprites + combat frames loaded (file-verified).");
}

// ------------------------------------------------------------
function ensurePlayerRuntime() {
  if (!gameState.player) {
    gameState.player = {
      name: gameState.profile?.name || "Princess",
      pos: { x: 400, y: 400 },
      speed: DEFAULT_SPEED,
      hp: 100, maxHp: 100,
      mana: 50, maxMana: 50,
      attack: 15, defense: 5,
    };
  }

  const p = gameState.player;

  if (!p.name) p.name = gameState.profile?.name || "Princess";

  if (
    !p.pos ||
    typeof p.pos.x !== "number" ||
    typeof p.pos.y !== "number"
  ) {
    p.pos = { x: 400, y: 400 };
  }
  
  if (typeof p.speed   !== "number") p.speed   = DEFAULT_SPEED;
  if (typeof p.attack  !== "number" || isNaN(p.attack))  p.attack  = 15;

  // ⭐⭐⭐ FIXED: Missing stats for ranged + spell ⭐⭐⭐
  if (typeof p.rangedAttack !== "number" || isNaN(p.rangedAttack)) p.rangedAttack = 10;
  if (typeof p.spellPower   !== "number" || isNaN(p.spellPower))   p.spellPower   = 10;

  if (typeof p.hp      !== "number" || isNaN(p.hp))      p.hp      = 100;
  if (typeof p.maxHp   !== "number" || isNaN(p.maxHp))   p.maxHp   = 100;
  if (typeof p.mana    !== "number" || isNaN(p.mana))    p.mana    = 50;
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
}


// ------------------------------------------------------------
// Input
function onKeyDown(e) {
  keys.add(e.code);
  if (!isAttacking && attackCooldown <= 0) {
    switch (e.code) {
      case "Space": performMeleeAttack(); break;
      case "KeyR":  performHeal();        break;
      case "KeyF":  performSpell();       break;
    }
  }
}
function onKeyUp(e)   { keys.delete(e.code); }
function onMouseDown(e) {
  if (!isAttacking && attackCooldown <= 0) performRangedAttack(e);
}

// ------------------------------------------------------------
// Init / Destroy
export async function initPlayerController(canvas) {
  canvasRef = canvas;
  ensurePlayerRuntime();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousedown", onMouseDown);
  await loadPlayerSprites();
  console.log("🧭 PlayerController initialized (Combat + FX Optimized).");
}

export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousedown", onMouseDown);
  console.log("🧭 PlayerController destroyed.");
}

// ------------------------------------------------------------
// Nearest enemy within a search radius (px/py = player position)
function findNearestEnemyInRange(px, py, maxDist = 320) {
  let target = null;
  let best = maxDist;
  for (const g of getEnemies()) {
    if (!g?.alive) continue;
    const dx = g.x - px;
    const dy = g.y - py;
    const d  = Math.hypot(dx, dy);
    if (d < best) { best = d; target = g; }
  }
  return { target, dist: best };
}

// ------------------------------------------------------------
// 🗡️ Melee (Auto-face nearest enemy during swing, then restore)
// ------------------------------------------------------------
function performMeleeAttack() {
  const p = gameState.player;
  const dmg = p.attack * DMG_MELEE;

  // 🧭 Remember facing before swing
  const prevDir = currentDir;

  // 🧠 Find nearest enemy and face them
  const { target } = findNearestEnemyInRange(p.pos.x, p.pos.y, 320);
  if (target) {
    const dxToEnemy = target.x - p.pos.x;
    currentDir = dxToEnemy < 0 ? "left" : "right";
  }

  // 🎬 Begin attack animation sequence
  isAttacking = true;
  attackType = "melee";
  attackCooldown = CD_MELEE;
  currentFrame = 0;

  setTimeout(() => { currentFrame = 1; }, 180);

  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
    currentDir = prevDir; // 🔁 restore movement direction
  }, 400);

  // ------------------------------------------------------------
  // ⚔️ DAMAGE LOGIC (Goblins + Ogres + Worgs)
  // ------------------------------------------------------------
  const range = 80;
  const ox = p.pos.x;
  const oy = p.pos.y;
  let hit = false;

  const goblins = getEnemies();
  const ogres = getOgres();
  const worgs = getWorg();
  const elites = getElites();

  const allTargets = [...goblins, ...ogres, ...worgs, ...elites];

  for (const t of allTargets) {
    if (!t.alive) continue;

    const dx = t.x - ox;
    const dy = t.y - oy;
    const dist = Math.hypot(dx, dy);

    if (dist <= range + (t.width || 32) / 2) {
      if (t.type === "elite") {
          damageElite(t, dmg, "player");
      }
      else if (t.type === "ogre" || t.maxHp >= 400) {
          damageOgre(t, dmg, "player");
      }
      else {
          damageEnemy(t, dmg);
      }

      hit = true;

      // 💥 Knockback (Ogres stay firm)
      if (t.type !== "ogre") {
        const len = Math.max(1, dist);
        t.x += (dx / len) * 50;
        t.y += (dy / len) * 50;
      }
    }
  }

  // ------------------------------------------------------------
  // ✨ FX + SFX (smaller, cheaper burst)
  // ------------------------------------------------------------
  spawnCanvasSparkleBurst(
    p.pos.x,
    p.pos.y,
    12,
    70,
    ["#ffd6eb", "#b5e2ff", "#ffffff"]
  );

  playMeleeSwing();

  console.log(`🗡️ Melee attack executed | ${hit ? "Hit" : "Miss"}`);
}

// ============================================================
// 🏹 Ranged — Fires Arrow Toward Mouse (Goblins + Ogres + Worgs)
// ============================================================
function performRangedAttack(e) {
  const p = gameState.player;
  if (!p || !canvasRef) return;

  if (p.mana < 2) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough mana!", "#77aaff");
    playCancelSound?.();
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
  setTimeout(() => { isAttacking = false; }, 300);

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

    const targets = [...getEnemies(), ...getOgres(), ...getWorg(), ...getElites()];
    for (const t of targets) {
      if (!t.alive) continue;

      const dx = t.x - projectile.x;
      const dy = t.y - projectile.y;
      const dist = Math.hypot(dx, dy);

      let hitRadius = 26;

      // Elite → medium-large hitbox
      if (t.type === "elite") {
        hitRadius = 50;
      }
      // Ogre → largest hitbox
      else if (t.type === "ogre" || t.maxHp >= 400) {
        hitRadius = OGRE_HIT_RADIUS || 60;
      }
      // Goblins & worgs → smaller hitbox
      else {
        hitRadius = 32;
}

      if (dist < hitRadius) {
        if (t.type === "elite") damageElite(t, dmg);
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "player");
        else damageEnemy(t, dmg);

        projectile.alive = false;
        break;
      }
    }

    if (projectile.alive && projectile.life < 1000)
      requestAnimationFrame(checkArrowCollision);
  };

  requestAnimationFrame(checkArrowCollision);
}

// ------------------------------------------------------------
// 💖 Heal — pastel shimmer, SP + MaxHP scaling, NaN-safe
// ------------------------------------------------------------
function performHeal() {
  const p = gameState.player;
  const cost = Number(COST_HEAL) || 0;

  if (!p || p.mana < cost) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough mana!", "#77aaff");
    playCancelSound?.();
    return;
  }

  isAttacking = true;
  attackType = "heal";
  attackCooldown = CD_HEAL;
  currentFrame = 0;
  setTimeout(() => { isAttacking = false; currentFrame = 0; }, 1000);

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
  console.log(`💖 Heal +${actual} HP (SP=${sp}, MaxHP=${mh}, Cost=${cost})`);
}

// ------------------------------------------------------------
// 🔮 Spell — pastel AoE burst (Goblins + Ogres + Worgs)
// ------------------------------------------------------------
function performSpell() {
  const p = gameState.player;

  if (!p || p.mana < COST_SPELL) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough mana!", "#77aaff");
    playCancelSound?.();
    return;
  }

  isAttacking = true;
  attackType = "spell";
  attackCooldown = CD_SPELL;
  p.mana -= COST_SPELL;

  currentFrame = 0;
  setTimeout(() => (currentFrame = 1), 350);
  setTimeout(() => {
    isAttacking = false;
    currentFrame = 0;
  }, 900);

  setTimeout(() => {
    const dmg = Math.max(1, (Number(p.spellPower) || 0) * DMG_SPELL);
    const radius = 150;
    let hits = 0;

    const targets = [...getEnemies(), ...getOgres(), ...getWorg(), ...getElites()];

    for (const t of targets) {
      if (!t.alive) continue;

      const dx = t.x - p.pos.x;
      const dy = t.y - p.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        if (t.type === "elite") damageElite(t, dmg, "spell");
        else if (t.type === "ogre" || t.maxHp >= 400) damageOgre(t, dmg, "spell");
        else damageEnemy(t, dmg);
        hits++;
      }
    }

    // Slightly higher sparkle count than melee, still cheap
    spawnCanvasSparkleBurst(
      p.pos.x,
      p.pos.y,
      26,
      160,
      ["#ffb3e6", "#b3ecff", "#fff2b3", "#cdb3ff", "#b3ffd9", "#ffffff"]
    );

    updateHUD();
    playSpellCast();

    console.log(`🔮 Spell hit ${hits} targets for ${dmg.toFixed(1)} each.`);
  }, 400);
}

// ------------------------------------------------------------
// 🌈 GLITTER BURSTS — Optimized (no blur, capped particles)
// ------------------------------------------------------------
const sparkles = [];
const MAX_SPARKLES = 60;  // hard cap for performance

function spawnCanvasSparkleBurst(x, y, count = 50, radius = 140, colors) {
  colors ??= ["#ffd6eb", "#b5e2ff", "#fff2b3"];

  for (let i = 0; i < count; i++) {
    // Respect global cap: drop oldest if needed
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
      life: 600 + Math.random() * 400,   // 0.6–1.0s
      age: 0,
      size: 2 + Math.random() * 2.5,     // small, tight
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function updateAndDrawSparkles(ctx, delta) {
  if (!sparkles.length) return;

  const dt = delta / 1000;

  ctx.save();
  ctx.globalCompositeOperation = "lighter"; // cheap glow

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.age += delta;

    if (s.age >= s.life) {
      sparkles.splice(i, 1);
      continue;
    }

    const t = s.age / s.life;

    // Mild deceleration
    s.vx *= 0.985;
    s.vy *= 0.985;
    s.x  += s.vx * dt;
    s.y  += s.vy * dt;

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
// 🌸 Damage Sparkle Burst (soft pink hit) — uses same system
// ------------------------------------------------------------
export function spawnDamageSparkles(x, y) {
  const pinkRedPalette = ["#ff7aa8", "#ff99b9", "#ffb3c6", "#ffccd5"];
  spawnCanvasSparkleBurst(x, y, 10, 50, pinkRedPalette);
}

// ------------------------------------------------------------
// 🏹 Projectiles — accuracy + map collision + lifetime + damage
// ------------------------------------------------------------
function updateProjectiles(delta) {
  const dt = delta / 1000;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const a = projectiles[i];
    if (!a.alive) { projectiles.splice(i, 1); continue; }

    a.x += Math.cos(a.angle) * a.speed * dt;
    a.y += Math.sin(a.angle) * a.speed * dt;

    a.life += delta;
    if (a.life > 1500) { a.alive = false; continue; }

    const hitbox = 8;
    if (isRectBlocked(a.x - hitbox / 2, a.y - hitbox / 2, hitbox, hitbox)) {
      a.alive = false;
      continue;
    }

    for (const g of getEnemies()) {
      if (!g.alive) continue;
      const dist = Math.hypot(g.x - a.x, g.y - a.y);
      if (dist < 45) {
        damageEnemy(g, a.dmg);
        a.alive = false;
        console.log("🏹 Arrow hit goblin!");
        break;
      }
    }
  }
}

// ============================================================
// 🔁 UPDATE PLAYER — movement, combat, collision, regen + FX
// ============================================================
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  // ⚰️ Death check
  if (p.hp <= 0 && !p.dead) {
    p.hp = 0;
    p.dead = true;
    isAttacking = false;
    isMoving = false;
    console.log("💀 Player has fallen!");
  }

  if (p.dead) return;

  if (p.flashTimer > 0) p.flashTimer -= delta;

  if (attackCooldown > 0) attackCooldown -= dt;
  updateProjectiles(delta);

  // 🔮 PASSIVE MANA REGENERATION
  const regenRate = 0.8 + (p.level ?? 1) * 0.05;
  p.mana = Math.min(p.maxMana, p.mana + regenRate * dt);

  // 🎮 MOVEMENT INPUT
  const left  = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up    = keys.has("KeyW") || keys.has("ArrowUp");
  const down  = keys.has("KeyS") || keys.has("ArrowDown");

  let dx = 0, dy = 0;
  if (left)  dx -= 1;
  if (right) dx += 1;
  if (up)    dy -= 1;
  if (down)  dy += 1;

  isMoving = dx !== 0 || dy !== 0;

  if (dx && dy) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv;
    dy *= inv;
  }

  if (!isAttacking) {
    let nextX = p.pos.x + dx * speed * dt;
    let nextY = p.pos.y + dy * speed * dt;
    const { bw, bh, ox, oy } = p.body;
    const feetX = nextX + ox, feetY = nextY + oy;

    if (!isRectBlocked(feetX, feetY, bw, bh)) {
      for (const g of getEnemies()) {
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

  // FACING
  if (left || right)
    currentDir = left && !right ? "left" : right && !left ? "right" : currentDir;
  else if (up || down)
    currentDir = up ? "up" : "down";

  // CLAMP TO MAP WORLD (not canvas!)
  

  const { width: mapW, height: mapH } = getMapPixelSize();
  const r = SPRITE_SIZE / 2;

  p.pos.x = Math.max(r, Math.min(mapW - r, p.pos.x));
  p.pos.y = Math.max(r, Math.min(mapH - r, p.pos.y));

  // PLAYER ↔ GOBLIN CONTACT DAMAGE
  if (!p.invulnTimer) p.invulnTimer = 0;
  if (p.invulnTimer > 0) {
    p.invulnTimer -= delta;
  } else {
    for (const g of getEnemies()) {
      if (!g.alive) continue;

      const dx = g.x - p.pos.x;
      const dy = g.y - p.pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 50) {
        const damage = 10;
        p.hp = Math.max(0, p.hp - damage);
        p.flashTimer = 200;
        p.invulnTimer = 800;

        spawnFloatingText(p.pos.x, p.pos.y - 30, `-${damage}`, "#ff7aa8");
        playPlayerDamage();
        spawnDamageSparkles(p.pos.x, p.pos.y);

        console.log(`💥 Player hit by goblin for ${damage} damage!`);
        break;
      }
    }
  }

  // Ogre collision pushback
  const ogres = getOgres ? getOgres() : [];
  for (const o of ogres) {
    if (!o.alive) continue;

    const dx = o.x - p.pos.x;
    const dy = o.y - p.pos.y;
    const dist = Math.hypot(dx, dy);

    const combinedRadius = 60;

    if (dist < combinedRadius) {
      const pushStrength = 4;
      p.pos.x -= (dx / dist) * pushStrength;
      p.pos.y -= (dy / dist) * pushStrength;
    }
  }

  // ------------------------------------------------------------
  // 🟥 PLAYER ↔ ELITE CONTACT DAMAGE
  // ------------------------------------------------------------
  const elites = getElites ? getElites() : [];
  for (const e of elites) {
    if (!e.alive) continue;

    const dx = e.x - p.pos.x;
    const dy = e.y - p.pos.y;
    const dist = Math.hypot(dx, dy);

    const hitRadius = 50; // similar to goblins

    if (dist < hitRadius) {
      // Damage player if not invulnerable
      if (p.invulnTimer <= 0) {
        const dmg = 12; // Choose any value you want
        p.hp = Math.max(0, p.hp - dmg);
        p.flashTimer = 200;
        p.invulnTimer = 800; // same as goblins

        spawnFloatingText(p.pos.x, p.pos.y - 30, `-${dmg}`, "#ff5577");
        playPlayerDamage();
        spawnDamageSparkles(p.pos.x, p.pos.y);
      }

      // Small pushback (lighter than ogres)
      const push = 3;
      if (dist > 0) {
        p.pos.x -= (dx / dist) * push;
        p.pos.y -= (dy / dist) * push;
      }
    }
  }

  // ANIMATION
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

  gameState.player.x = p.pos.x;
  gameState.player.y = p.pos.y;
}

// ============================================================
// 🎨 DRAW PLAYER — incl. HP bar + projectiles + sparkles
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
      img = currentFrame === 0
        ? sprites.attack[dir][0]
        : sprites.attack[dir][1];
    } else if (attackType === "ranged") {
      const facing = p.facing || "right";
      switch (facing) {
        case "left":        img = sprites.shoot.left[1];  break;
        case "right":       img = sprites.shoot.right[1]; break;
        case "topLeft":     img = sprites.shoot.left[0];  break;
        case "topRight":    img = sprites.shoot.right[0]; break;
        case "bottomLeft":  img = sprites.shoot.lowerLeft; break;
        case "bottomRight": img = sprites.shoot.lowerRight; break;
        default:            img = sprites.shoot.right[1]; break;
      }
    } else if (attackType === "spell") {
      img = currentFrame === 0
        ? sprites.spell.charge
        : sprites.spell.explode;
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

  // Shadow
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + SPRITE_SIZE / 2.3,
    SPRITE_SIZE * 0.35,
    SPRITE_SIZE * 0.15,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = `rgba(0,0,0,${SHADOW_OPACITY})`;
  ctx.fill();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (isAttacking && attackType === "melee" && currentFrame === 0) {
    const scale = 1.5;
    const w = SPRITE_SIZE * scale;
    const h = SPRITE_SIZE * scale;
    ctx.drawImage(img, 0, 0, 1024, 1024, x - w/2, y - h/2, w, h);
  } else {
    const isDownWalk = !isAttacking && isMoving && currentDir === "down";
    const isUpWalk   = !isAttacking && isMoving && currentDir === "up";
    if (isDownWalk || isUpWalk) {
      const scale = 1.20;
      const w = SPRITE_SIZE * scale;
      const h = SPRITE_SIZE * scale;

      const lowerFeet = SPRITE_SIZE * 0.18;
      const raiseUp   = SPRITE_SIZE * 0.20;

      const offsetX = x - w / 2;
      const offsetY = y - h / 2 + lowerFeet - raiseUp;

      ctx.drawImage(
        img,
        0, 0, 1024, 1024,
        offsetX, offsetY,
        w, h
      );
    } else {
      ctx.drawImage(
        img,
        0, 0, 1024, 1024,
        drawX, drawY,
        SPRITE_SIZE, SPRITE_SIZE
      );
    }
  }

  // ❤️ Player HP Bar
  if (!p.dead) {
    const barWidth = 42;
    const barHeight = 4;
    const offsetY = SPRITE_SIZE * 0.5 + 12;
    const hpPct = Math.max(0, Math.min(1, p.hp / p.maxHp));

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x - barWidth / 2, y + offsetY, barWidth, barHeight);

    const grad = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
    grad.addColorStop(0, "#ff66b3");
    grad.addColorStop(1, "#ff99cc");
    ctx.fillStyle = grad;
    ctx.fillRect(x - barWidth / 2, y + offsetY, barWidth * hpPct, barHeight);

    ctx.strokeStyle = "rgba(255,182,193,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y + offsetY, barWidth, barHeight);
  }

  // 🏹 Silver Arrow projectiles
  ctx.fillStyle = "rgba(240,240,255,0.9)";
  for (const a of projectiles) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillRect(0, -3, 45, 4);
    ctx.restore();
  }

  // 🌈 Sparkles (now cheap)
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
  console.log("🎮 Player controller reset (Try Again).");
}
window.__playerControllerReset = resetPlayerControllerState;

// ============================================================
// 🌟 END OF FILE
// ============================================================

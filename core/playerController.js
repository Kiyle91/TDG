// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep (Combat + Glitter FX Final)
// ------------------------------------------------------------
// ✦ WASD + animation + directional attacks
// ✦ Melee / Ranged / Heal / Spell abilities
// ✦ Knockback + drawn silver arrows + sparkle FX (canvas-based)
// ✦ Stat-scaled damage & mana costs
// ✦ Uses shared enemy array via window.__enemies (kills goblins properly)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { damageEnemy } from "./enemies.js"; // ✅ shared enemy array mutated inside enemies.js
import { updateHUD } from "./ui.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// ✅ Shared enemy getter (same instance towers & player use)
const getEnemies = () => window.__enemies || [];

// ------------------------------------------------------------
let canvasRef = null;
const keys = new Set();

const DEFAULT_SPEED = 220;
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

// Mana costs (kept low for testing as per your last file)
const COST_HEAL = 1;
const COST_SPELL = 1;

// Damage multipliers
const DMG_MELEE = 1.2;
const DMG_RANGED = 0.9;
const DMG_SPELL = 2.5;

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
  sprites.shoot.lowerLeft = await loadSprite("./assets/images/sprites/glitter/glitter_lower_left.png");
  sprites.shoot.lowerRight = await loadSprite("./assets/images/sprites/glitter/glitter_lower_right.png");

  console.log("🦄 Glitter sprites + combat frames loaded (file-verified).");
}

// ------------------------------------------------------------
function ensurePlayerRuntime() {
  if (!gameState.player) {
    gameState.player = {
      name: "Glitter Guardian",
      pos: { x: 400, y: 400 },
      speed: DEFAULT_SPEED,
      hp: 100, maxHp: 100,
      mana: 50, maxMana: 50,
      attack: 15, defense: 5,
    };
  }

  const p = gameState.player;
  if (!p.pos) p.pos = { x: 400, y: 400 };
  if (typeof p.speed   !== "number") p.speed   = DEFAULT_SPEED;
  if (typeof p.attack  !== "number" || isNaN(p.attack))  p.attack  = 15;
  if (typeof p.hp      !== "number" || isNaN(p.hp))      p.hp      = 100;
  if (typeof p.maxHp   !== "number" || isNaN(p.maxHp))   p.maxHp   = 100;
  if (typeof p.mana    !== "number" || isNaN(p.mana))    p.mana    = 50;
  if (typeof p.maxMana !== "number" || isNaN(p.maxMana)) p.maxMana = 50;
  if (typeof p.defense !== "number" || isNaN(p.defense)) p.defense = 5;

  if (!p.body) {
    const bw = SPRITE_SIZE * 0.55;
    const bh = SPRITE_SIZE * 0.38;
    const ox = -bw / 2;
    const oy = SPRITE_SIZE * 0.20;
    p.body = { bw, bh, ox, oy }; // feet rect
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
  console.log("🧭 PlayerController initialized (Combat + FX).");
}

export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousedown", onMouseDown);
  console.log("🧭 PlayerController destroyed.");
}

// ------------------------------------------------------------
// 🗡️ Melee (2-frame attack → melee) + knockback + glitter burst
function performMeleeAttack() {
  const p = gameState.player;
  const dmg = p.attack * DMG_MELEE;
  const leftKeys  = keys.has("KeyA") || keys.has("KeyW");
  const rightKeys = keys.has("KeyD") || keys.has("KeyS");
  currentDir = leftKeys && !rightKeys ? "left" : "right";

  isAttacking = true;
  attackType = "melee";
  attackCooldown = CD_MELEE;
  currentFrame = 0;
  setTimeout(() => { currentFrame = 1; }, 180);
  setTimeout(() => { isAttacking = false; currentFrame = 0; }, 400);

  const range = 80;
  const ox = p.pos.x, oy = p.pos.y;
  let hit = false;

  for (const g of getEnemies()) {
    if (!g.alive) continue;
    const dx = g.x - ox, dy = g.y - oy;
    const dist = Math.hypot(dx, dy);
    if (dist <= range + g.width / 2) {
      damageEnemy(g, dmg);
      hit = true;
      // knockback
      const len = Math.max(1, dist);
      g.x += (dx / len) * 50;
      g.y += (dy / len) * 50;
    }
  }

  // pastel alternating melee burst
  const palette = Math.random() > 0.5
    ? ["#ffd6eb", "#b5e2ff", "#ffffff"]
    : ["#b3ffd9", "#cdb3ff", "#fff2b3"];
  spawnCanvasSparkleBurst(p.pos.x, p.pos.y, 15, 60, ["#ffd6eb", "#b5e2ff", "#ffffff"]);

  console.log(hit ? "🗡️ Melee hit landed!" : "⚔️ Melee swing missed.");
}

// ------------------------------------------------------------
// 🏹 Ranged — accurate aim (canvas scaling), map collision, lifetime
function performRangedAttack(e) {
  const p = gameState.player;
  const dmg = p.attack * DMG_RANGED;

  // Get mouse position relative to canvas
  const rect = canvasRef.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvasRef.width / rect.width);
  const my = (e.clientY - rect.top) * (canvasRef.height / rect.height);

  // Calculate shot angle and speed
  const angle = Math.atan2(my - p.pos.y, mx - p.pos.x);
  const speed = 600;

  // Determine facing purely from cursor position
  const screenHalfY = canvasRef.height / 2;
  let facing;
  if (my > screenHalfY && mx < p.pos.x) facing = "lowerLeft";
  else if (my > screenHalfY && mx >= p.pos.x) facing = "lowerRight";
  else facing = mx < p.pos.x ? "left" : "right";
  p.facing = facing;

  // Attack timing (short lockout)
  isAttacking = true;
  attackType = "ranged";
  attackCooldown = CD_RANGED;
  currentFrame = 0;
  setTimeout(() => { currentFrame = 1; }, 200);
  setTimeout(() => { isAttacking = false; currentFrame = 0; }, 400);

  // Spawn projectile
  const startX = p.pos.x + Math.cos(angle) * 30;
  const startY = p.pos.y + Math.sin(angle) * 30;
  projectiles.push({ x: startX, y: startY, angle, speed, dmg, alive: true, life: 0 });
}


// ------------------------------------------------------------
// 💖 Heal — centered rainbow shimmer + HUD update
function performHeal() {
  const p = gameState.player;
  if (p.mana < COST_HEAL) return;
  isAttacking = true; attackType = "heal"; attackCooldown = CD_HEAL;

  p.mana -= COST_HEAL;
  const amount = p.maxHp ? p.maxHp * 0.25 : 25;
  p.hp = Math.min(p.maxHp || 100, p.hp + amount);
  playFairySprinkle();
  spawnCanvasSparkleBurst(p.pos.x, p.pos.y, 25, 80, ["#b3ffb3", "#99ffcc", "#ccffcc"]);

  updateHUD();
  console.log(`💖 Heal +${Math.round(amount)} HP`);
  setTimeout(() => { isAttacking = false; }, 1000);
}

// ------------------------------------------------------------
// 🔮 Spell — large pastel explosion + AoE damage
function performSpell() {
  const p = gameState.player;
  if (p.mana < COST_SPELL) return;
  isAttacking = true; attackType = "spell"; attackCooldown = CD_SPELL;

  p.mana -= COST_SPELL;
  const dmg = p.attack * DMG_SPELL;
  const radius = 150;
  let hits = 0;

  for (const g of getEnemies()) {
    if (!g.alive) continue;
    const dx = g.x - p.pos.x, dy = g.y - p.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) { damageEnemy(g, dmg); hits++; }
  }

  spawnCanvasSparkleBurst(p.pos.x, p.pos.y, 90, 160,
    ["#ffb3e6", "#b3ecff", "#fff2b3", "#cdb3ff", "#b3ffd9", "#ffffff"]);

  updateHUD();
  console.log(`🔮 Spell cast! Hit ${hits} enemies for ${Math.round(dmg)} dmg`);
  setTimeout(() => { isAttacking = false; }, 1000);
}

// ------------------------------------------------------------
// 🌈 GLITTER BURSTS — refined size + radius (canvas-based)
const sparkles = [];

function spawnCanvasSparkleBurst(x, y, count = 50, radius = 140, colors) {
  colors ??= ["#ffd6eb", "#b5e2ff", "#fff2b3"];
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 160 + Math.random() * 180; // slightly slower, gentler spread
    sparkles.push({
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 800 + Math.random() * 400,
      age: 0,
      size: 1.5 + Math.random() * 2.5, // ✨ smaller particles
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      trail: []
    });
  }
}

function updateAndDrawSparkles(ctx, delta) {
  const dt = delta / 1000;
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.age += delta;
    if (s.age >= s.life) { sparkles.splice(i, 1); continue; }

    const t = s.age / s.life;

    // Slight deceleration
    s.vx *= 0.98;
    s.vy *= 0.98;
    s.x  += s.vx * dt;
    s.y  += s.vy * dt;

    // Short trail
    s.trail.push({ x: s.x, y: s.y, alpha: 1 - t });
    if (s.trail.length > 5) s.trail.shift();

    // Trail rendering
    for (let j = 0; j < s.trail.length; j++) {
      const p = s.trail[j];
      ctx.globalAlpha = p.alpha * (1 - t);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s.size * (1 - j / s.trail.length), 0, Math.PI * 2);
      ctx.fill();
    }

    // Main sparkle
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    const alpha = 1 - t * 0.9;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------
// 🏹 Projectiles — accuracy + map collision + lifetime + damage
function updateProjectiles(delta) {
  const dt = delta / 1000;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const a = projectiles[i];
    if (!a.alive) { projectiles.splice(i, 1); continue; }

    // Move
    a.x += Math.cos(a.angle) * a.speed * dt;
    a.y += Math.sin(a.angle) * a.speed * dt;

    // Lifetime
    a.life += delta;
    if (a.life > 1500) { a.alive = false; continue; }

    // Map collision (8x8 hitbox)
    const hitbox = 8;
    if (isRectBlocked(a.x - hitbox / 2, a.y - hitbox / 2, hitbox, hitbox)) {
      a.alive = false;
      continue;
    }

    // Enemy collision
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

// ------------------------------------------------------------
// Update
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  // Cooldown & projectiles
  if (attackCooldown > 0) attackCooldown -= dt;
  updateProjectiles(delta);

  // Movement input
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
  if (dx && dy) { const inv = 1 / Math.sqrt(2); dx *= inv; dy *= inv; }

  // Move if not locked by attack animation
  if (!isAttacking) {
    const nextX = p.pos.x + dx * speed * dt;
    const nextY = p.pos.y + dy * speed * dt;
    const { bw, bh, ox, oy } = p.body;
    const feetX = nextX + ox, feetY = nextY + oy;
    if (!isRectBlocked(feetX, feetY, bw, bh)) { p.pos.x = nextX; p.pos.y = nextY; }
  }

  // Facing
  if (left || right) currentDir = left && !right ? "left" : right && !left ? "right" : currentDir;
  else if (up || down) currentDir = up ? "up" : "down";

  // Clamp to canvas
  if (canvasRef) {
    const r = SPRITE_SIZE / 2;
    p.pos.x = Math.max(r, Math.min(canvasRef.width  - r, p.pos.x));
    p.pos.y = Math.max(r, Math.min(canvasRef.height - r, p.pos.y));
  }

  // Animation advance
  if (isAttacking) {
    // preserve currentFrame for attack (controlled by timeouts)
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

  // Sync global coords
  gameState.player.x = p.pos.x;
  gameState.player.y = p.pos.y;
}

// ------------------------------------------------------------
// ============================================================
// 🎨 Draw Player (with cursor-based ranged animation)
// ============================================================
export function drawPlayer(ctx) {
  if (!ctx) return;
  ensurePlayerRuntime();
  const { x, y } = gameState.player.pos;

  let img = sprites.idle;

  // ============================================================
  // 🗡️ / 🏹 ATTACK SEQUENCES
  // ============================================================
  if (isAttacking) {
    if (attackType === "melee") {
      // two-frame melee animation
      const dir = currentDir === "left" ? "left" : "right";
      img = currentFrame === 0 ? sprites.attack[dir][0] : sprites.attack[dir][1];
    } 
    
    else if (attackType === "ranged") {
      // cursor-based ranged animation
      const facing = gameState.player.facing || "right";
      if (facing === "lowerLeft") {
        img = sprites.shoot.lowerLeft;
      } else if (facing === "lowerRight") {
        img = sprites.shoot.lowerRight;
      } else if (facing === "left") {
        img = currentFrame === 0 ? sprites.shoot.left[0] : sprites.shoot.left[1];
      } else {
        img = currentFrame === 0 ? sprites.shoot.right[0] : sprites.shoot.right[1];
      }
    }

  } else if (isMoving) {
    // walking animation
    img = sprites.walk[currentDir][currentFrame];
  } else {
    // idle frame
    img = sprites.idle;
  }

  if (!img) return;

  // ============================================================
  // 🩶 SHADOW + CHARACTER RENDER
  // ============================================================
  const drawX = x - SPRITE_SIZE / 2;
  const drawY = y - SPRITE_SIZE / 2;

  ctx.save();

  // Soft drop shadow
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

  // ------------------------------------------------------------
  // ✨ Render player sprite — upscale only glitter_attack_* frames
  // ------------------------------------------------------------
  if (isAttacking && attackType === "melee" && currentFrame === 0) {
    const scale = 1.5; // 40% larger
    const w = SPRITE_SIZE * scale;
    const h = SPRITE_SIZE * scale;
    const offsetX = x - w / 2;
    const offsetY = y - h / 2;
    ctx.drawImage(img, 0, 0, 1024, 1024, offsetX, offsetY, w, h);
  } else {
    // normal size for everything else
    ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, SPRITE_SIZE, SPRITE_SIZE);
  }

  // ============================================================
  // 🏹 DRAW PROJECTILES (silver arrows)
  // ============================================================
  ctx.fillStyle = "rgba(240,240,255,0.9)";
  for (const a of projectiles) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillRect(0, -2, 18, 4);
    ctx.restore();
  }

  // ============================================================
  // 🌈 DRAW SPARKLES
  // ============================================================
  updateAndDrawSparkles(ctx, 16);

  ctx.restore();
}


// ============================================================
// 🌟 END OF FILE
// ============================================================

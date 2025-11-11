// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep (Combat Fixed Build)
// ------------------------------------------------------------
// ✦ WASD + animation + directional attacks
// ✦ Melee / Ranged / Heal / Spell abilities
// ✦ Knockback + drawn silver arrows + sparkle FX
// ✦ Stat-scaled damage & mana costs
// ✦ FIX: Shared enemy array (kills goblins properly)
// ============================================================

import { gameState } from "../utils/gameState.js";
import { TILE_SIZE } from "../utils/constants.js";
import { isRectBlocked } from "../utils/mapCollision.js";
import { damageEnemy } from "./enemies.js"; // ✅ only import function (shared array via window)
import { updateHUD } from "./ui.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// ✅ Shared enemy getter
// ------------------------------------------------------------
const getEnemies = () => window.__enemies || [];

// ------------------------------------------------------------
let canvasRef = null;
const keys = new Set();

const DEFAULT_SPEED = 220;
const SPRITE_SIZE = 80;
const WALK_FRAME_INTERVAL = 220;
const SHADOW_OPACITY = 0.25;

// Attack config
let attackCooldown = 0;
let isAttacking = false;
let attackType = null;
let projectiles = [];

// Cooldowns (seconds)
const CD_MELEE = 0.5;
const CD_RANGED = 0.4;
const CD_HEAL = 1.0;
const CD_SPELL = 1.0;

// Mana costs
const COST_HEAL = 20;
const COST_SPELL = 30;

// Damage multipliers
const DMG_MELEE = 1.2;
const DMG_RANGED = 0.9;
const DMG_SPELL = 2.5;

// ------------------------------------------------------------
let frameTimer = 0;
let currentFrame = 0;
let currentDir = "down";
let isMoving = false;

// ------------------------------------------------------------
const sprites = {
  idle: null,
  walk: { up: [null, null], left: [null, null], down: [null, null], right: [null, null] },
  attack: { left: [null, null], right: [null, null] },
  shoot: { left: [null, null], right: [null, null] },
};

// ------------------------------------------------------------
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
  sprites.attack.left[0] = await loadSprite("./assets/images/sprites/glitter/glitter_attack_left.png");
  sprites.attack.left[1] = await loadSprite("./assets/images/sprites/glitter/glitter_melee_left.png");
  sprites.attack.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_attack_right.png");
  sprites.attack.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_melee_right.png");

  // 🏹 RANGED (2-frame sequence)
  sprites.shoot.left[0] = await loadSprite("./assets/images/sprites/glitter/glitter_raise_left.png");
  sprites.shoot.left[1] = await loadSprite("./assets/images/sprites/glitter/glitter_shoot_left.png");
  sprites.shoot.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_raise_right.png");
  sprites.shoot.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_shoot_right.png");

  console.log("🦄 Glitter sprites + combat frames loaded (file-verified).");
}


// ------------------------------------------------------------
function ensurePlayerRuntime() {
  if (!gameState.player) {
    gameState.player = {
      name: "Glitter Guardian",
      pos: { x: 400, y: 400 },
      speed: DEFAULT_SPEED,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 15,
      defense: 5,
    };
  }

  const p = gameState.player;
  if (!p.pos) p.pos = { x: 400, y: 400 };
  if (typeof p.speed !== "number") p.speed = DEFAULT_SPEED;
  if (typeof p.attack !== "number" || isNaN(p.attack)) p.attack = 15;
  if (typeof p.hp !== "number" || isNaN(p.hp)) p.hp = 100;
  if (typeof p.maxHp !== "number" || isNaN(p.maxHp)) p.maxHp = 100;
  if (typeof p.mana !== "number" || isNaN(p.mana)) p.mana = 50;
  if (typeof p.maxMana !== "number" || isNaN(p.maxMana)) p.maxMana = 50;
  if (typeof p.defense !== "number" || isNaN(p.defense)) p.defense = 5;

  if (!p.body) {
    const bw = SPRITE_SIZE * 0.55;
    const bh = SPRITE_SIZE * 0.38;
    const ox = -bw / 2;
    const oy = SPRITE_SIZE * 0.2;
    p.body = { bw, bh, ox, oy };
  }
}

// ------------------------------------------------------------
function onKeyDown(e) {
  keys.add(e.code);
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
  if (!isAttacking && attackCooldown <= 0) performRangedAttack(e);
}

// ------------------------------------------------------------
export async function initPlayerController(canvas) {
  canvasRef = canvas;
  ensurePlayerRuntime();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousedown", onMouseDown);
  await loadPlayerSprites();
  console.log("🧭 PlayerController initialized (Combat Fixed).");
}

function performMeleeAttack() {
  const p = gameState.player;
  const dmg = p.attack * DMG_MELEE;
  const leftKeys = keys.has("KeyA") || keys.has("KeyW");
  const rightKeys = keys.has("KeyD") || keys.has("KeyS");
  currentDir = leftKeys && !rightKeys ? "left" : "right";

  isAttacking = true;
  attackType = "melee";
  attackCooldown = CD_MELEE;

  // Start with first attack frame
  currentFrame = 0;

  // play attack frame → then melee frame after short delay
  setTimeout(() => { currentFrame = 1; }, 180);
  setTimeout(() => { isAttacking = false; currentFrame = 0; }, 400);

  // --- damage + knockback ---
  const range = 80;
  const origin = { x: p.pos.x, y: p.pos.y };

  let hitSomething = false;
  for (const g of getEnemies()) {
    if (!g.alive) continue;
    const dx = g.x - origin.x;
    const dy = g.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= range + g.width / 2) {
      damageEnemy(g, dmg);
      hitSomething = true;

      const len = Math.max(1, dist);
      g.x += (dx / len) * 50;
      g.y += (dy / len) * 50;
    }
  }

  if (hitSomething) console.log("🗡️ Melee hit landed!");
  else console.log("⚔️ Melee swing missed.");
}

// ------------------------------------------------------------
// 🏹 RANGED
// ------------------------------------------------------------
function performRangedAttack(e) {
  const p = gameState.player;
  const dmg = p.attack * DMG_RANGED;
  const rect = canvasRef.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const angle = Math.atan2(my - p.pos.y, mx - p.pos.x);
  const speed = 600;

  // decide facing direction based on cursor
  currentDir = mx < p.pos.x ? "left" : "right";

  isAttacking = true;
  attackType = "ranged";
  attackCooldown = CD_RANGED;

  // animate raise → shoot
  currentFrame = 0;
  setTimeout(() => { currentFrame = 1; }, 200);
  setTimeout(() => { isAttacking = false; currentFrame = 0; }, 400);

  // spawn projectile slightly forward from player
  const startX = p.pos.x + Math.cos(angle) * 30;
  const startY = p.pos.y + Math.sin(angle) * 30;

  projectiles.push({
    x: startX,
    y: startY,
    angle,
    speed,
    dmg,
    alive: true,
  });

  spawnSparkleBurst(startX, startY, 6);
}


// ------------------------------------------------------------
// 💖 HEAL
// ------------------------------------------------------------
function performHeal() {
  const p = gameState.player;
  if (p.mana < COST_HEAL) return;
  isAttacking = true;
  attackType = "heal";
  attackCooldown = CD_HEAL;
  p.mana -= COST_HEAL;
  const amount = p.maxHp ? p.maxHp * 0.25 : 25;
  p.hp = Math.min(p.maxHp || 100, p.hp + amount);
  playFairySprinkle();
  spawnSparkleBurst(p.pos.x, p.pos.y, 20);
  updateHUD();
  setTimeout(() => (isAttacking = false), 1000);
}

// ------------------------------------------------------------
// 🔮 SPELL
// ------------------------------------------------------------
function performSpell() {
  const p = gameState.player;
  if (p.mana < COST_SPELL) return;
  isAttacking = true;
  attackType = "spell";
  attackCooldown = CD_SPELL;
  p.mana -= COST_SPELL;
  const dmg = p.attack * DMG_SPELL;
  const radius = 150;
  for (const g of getEnemies()) {
    if (!g.alive) continue;
    const dx = g.x - p.pos.x;
    const dy = g.y - p.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) damageEnemy(g, dmg);
  }
  spawnSparkleBurst(p.pos.x, p.pos.y, 30);
  updateHUD();
  setTimeout(() => (isAttacking = false), 1000);
}

// ------------------------------------------------------------
// ✨ SPARKLES
// ------------------------------------------------------------
function spawnSparkleBurst(x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "magic-particle";
    const size = 6 + Math.random() * 8;
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.position = "absolute";
    s.style.background = "white";
    s.style.pointerEvents = "none";
    document.body.appendChild(s);
    const ang = Math.random() * Math.PI * 2,
      dist = 60 + Math.random() * 40;
    const tx = x + Math.cos(ang) * dist,
      ty = y + Math.sin(ang) * dist;
    s.animate(
      [
        { transform: `translate(0,0)`, opacity: 1 },
        { transform: `translate(${tx - x}px,${ty - y}px)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 300, easing: "ease-out" }
    );
    setTimeout(() => s.remove(), 1000);
  }
}

// ------------------------------------------------------------
// 🏹 UPDATE PROJECTILES
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

    for (const g of getEnemies()) {
      if (!g.alive) continue;
      const dx = g.x - a.x;
      const dy = g.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = g.width / 2 + 15;
      if (dist <= hitRadius) {
        console.log("🏹 Arrow hit goblin!");
        damageEnemy(g, a.dmg);
        a.alive = false;
        break;
      }
    }
  }
}

// ------------------------------------------------------------
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  if (attackCooldown > 0) attackCooldown -= dt;
  updateProjectiles(delta);

  const left = keys.has("KeyA") || keys.has("ArrowLeft");
  const right = keys.has("KeyD") || keys.has("ArrowRight");
  const up = keys.has("KeyW") || keys.has("ArrowUp");
  const down = keys.has("KeyS") || keys.has("ArrowDown");

  let dx = 0,
    dy = 0;
  if (left) dx -= 1;
  if (right) dx += 1;
  if (up) dy -= 1;
  if (down) dy += 1;
  isMoving = dx !== 0 || dy !== 0;
  if (dx && dy) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv;
    dy *= inv;
  }

  if (!isAttacking) {
    const nextX = p.pos.x + dx * speed * dt;
    const nextY = p.pos.y + dy * speed * dt;
    const { bw, bh, ox, oy } = p.body;
    const feetX = nextX + ox,
      feetY = nextY + oy;
    if (!isRectBlocked(feetX, feetY, bw, bh)) {
      p.pos.x = nextX;
      p.pos.y = nextY;
    }
  }

  if (left || right)
    currentDir = left && !right ? "left" : right && !left ? "right" : currentDir;
  else if (up || down) currentDir = up ? "up" : "down";

  if (canvasRef) {
    const r = SPRITE_SIZE / 2;
    p.pos.x = Math.max(r, Math.min(canvasRef.width - r, p.pos.x));
    p.pos.y = Math.max(r, Math.min(canvasRef.height - r, p.pos.y));
  }

  if (isAttacking) {
    // 🔒 preserve currentFrame for attack animations
    // do not reset here; handled by attack timeouts
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


// ------------------------------------------------------------
// 🎨 DRAW PLAYER — proper 2-frame attack + ranged animation
// ------------------------------------------------------------
export function drawPlayer(ctx) {
  if (!ctx) return;
  ensurePlayerRuntime();
  const { x, y } = gameState.player.pos;

  // default
  let img = sprites.idle;

  // ==========================================================
  // ATTACK ANIMATIONS
  // ==========================================================
  if (isAttacking) {
    if (attackType === "melee") {
      // Frame 0 → glitter_attack_*, Frame 1 → glitter_melee_*
      const dir = currentDir === "left" ? "left" : "right";
      img = currentFrame === 0
        ? sprites.attack[dir][0]   // glitter_attack_*
        : sprites.attack[dir][1];  // glitter_melee_*
    }

    if (attackType === "ranged") {
      // Frame 0 → glitter_raise_*, Frame 1 → glitter_shoot_*
      const dir = currentDir === "left" ? "left" : "right";
      img = currentFrame === 0
        ? sprites.shoot[dir][0]   // glitter_raise_*
        : sprites.shoot[dir][1];  // glitter_shoot_*
    }
  }

  // ==========================================================
  // MOVEMENT / IDLE
  // ==========================================================
  if (!isAttacking) {
    if (isMoving) img = sprites.walk[currentDir][currentFrame];
    else img = sprites.idle;
  }

  if (!img) return;

  // ==========================================================
  // RENDER
  // ==========================================================
  const drawX = x - SPRITE_SIZE / 2;
  const drawY = y - SPRITE_SIZE / 2;

  ctx.save();

  // 🩶 shadow
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
  ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, SPRITE_SIZE, SPRITE_SIZE);

  // 🏹 silver arrows
  ctx.fillStyle = "rgba(240,240,255,0.9)";
  for (const a of projectiles) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillRect(0, -2, 18, 4);
    ctx.restore();
  }

  ctx.restore();
}



// ------------------------------------------------------------
export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousedown", onMouseDown);
  console.log("🧭 PlayerController destroyed.");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

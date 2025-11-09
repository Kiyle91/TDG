// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Glitter sprite with proper WASD directions
// ✦ Idle when standing still
// ✦ 2-frame walk per direction (A / D / W / S sets)
// ✦ Horizontal priority on diagonals (WA→left, DS→right, etc.)
// ✦ Scales 1024px frames to ~64px on-screen
// ============================================================

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ LOCAL STATE
// ------------------------------------------------------------
let canvasRef = null;
const keys = new Set();
const DEFAULT_SPEED = 220;

const SPRITE_SIZE = 64;
const WALK_FRAME_INTERVAL = 150; // ms/frame

let frameTimer = 0;
let currentFrame = 0;          // 0 or 1
let currentDir = "down";       // "up" | "down" | "left" | "right"
let isMoving = false;

// ------------------------------------------------------------
// 🖼️ SPRITES (WASD mapping)
//  W = UP, A = LEFT, S = DOWN, D = RIGHT
// ------------------------------------------------------------
const sprites = {
  idle: null,
  walk: {
    up:    [null, null],  // W1, W2
    left:  [null, null],  // A1, A2
    down:  [null, null],  // S1, S2
    right: [null, null],  // D1, D2
  },
};

function loadSprite(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadPlayerSprites() {
  sprites.idle = await loadSprite("./assets/images/sprites/glitter/glitter_idle.png");

  // Map filenames to WASD directions (as you specified)
  sprites.walk.up[0]    = await loadSprite("./assets/images/sprites/glitter/glitter_W1.png");
  sprites.walk.up[1]    = await loadSprite("./assets/images/sprites/glitter/glitter_W2.png");

  sprites.walk.left[0]  = await loadSprite("./assets/images/sprites/glitter/glitter_A1.png");
  sprites.walk.left[1]  = await loadSprite("./assets/images/sprites/glitter/glitter_A2.png");

  sprites.walk.down[0]  = await loadSprite("./assets/images/sprites/glitter/glitter_S1.png");
  sprites.walk.down[1]  = await loadSprite("./assets/images/sprites/glitter/glitter_S2.png");

  sprites.walk.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_D1.png");
  sprites.walk.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_D2.png");

  console.log("✨ Glitter sprite set loaded (WASD mapped).");
}

// ------------------------------------------------------------
// 🧩 ENSURE PLAYER RUNTIME
// ------------------------------------------------------------
function ensurePlayerRuntime() {
  if (!gameState.player) {
    gameState.player = {
      name: "Glitter Guardian",
      pos: { x: 400, y: 400 },
      speed: DEFAULT_SPEED,
    };
  } else {
    if (!gameState.player.pos) gameState.player.pos = { x: 400, y: 400 };
    if (typeof gameState.player.speed !== "number") {
      const statSpeed =
        gameState.player?.stats?.speed ??
        gameState.profile?.player?.stats?.speed ??
        DEFAULT_SPEED;
      gameState.player.speed = statSpeed;
    }
  }
}

// ------------------------------------------------------------
// 🎛️ INPUT
// ------------------------------------------------------------
function onKeyDown(e) { keys.add(e.code); }
function onKeyUp(e)   { keys.delete(e.code); }

// ------------------------------------------------------------
// 🌷 INIT
// ------------------------------------------------------------
export async function initPlayerController(canvas) {
  canvasRef = canvas;
  ensurePlayerRuntime();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  await loadPlayerSprites();
  console.log("🧭 PlayerController ready (idle + 4-dir walk).");
}

// ------------------------------------------------------------
// 🏃 UPDATE
// ------------------------------------------------------------
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

  // Pressed states
  const leftPressed  = keys.has("KeyA") || keys.has("ArrowLeft");
  const rightPressed = keys.has("KeyD") || keys.has("ArrowRight");
  const upPressed    = keys.has("KeyW") || keys.has("ArrowUp");
  const downPressed  = keys.has("KeyS") || keys.has("ArrowDown");

  // Velocity
  let dx = 0, dy = 0;
  if (leftPressed)  dx -= 1;
  if (rightPressed) dx += 1;
  if (upPressed)    dy -= 1;
  if (downPressed)  dy += 1;

  isMoving = dx !== 0 || dy !== 0;

  // Normalize diagonals
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv; dy *= inv;
  }

  // Apply motion
  p.pos.x += dx * speed * dt;
  p.pos.y += dy * speed * dt;

  // Direction resolution
  // — Horizontal priority when both pressed (your rule)
  if (leftPressed || rightPressed) {
    if (leftPressed && !rightPressed) currentDir = "left";
    else if (rightPressed && !leftPressed) currentDir = "right";
    // if both left+right, keep last currentDir (prevents jitter)
  } else if (upPressed || downPressed) {
    currentDir = upPressed ? "up" : "down";
  }
  // If nothing pressed, keep last dir (used for idle facing)

  // Clamp within canvas
  if (canvasRef) {
    const r = SPRITE_SIZE / 2;
    if (p.pos.x < r) p.pos.x = r;
    if (p.pos.y < r) p.pos.y = r;
    if (p.pos.x > canvasRef.width - r)  p.pos.x = canvasRef.width - r;
    if (p.pos.y > canvasRef.height - r) p.pos.y = canvasRef.height - r;
  }

  // Animate
  if (isMoving) {
    frameTimer += delta;
    if (frameTimer >= WALK_FRAME_INTERVAL) {
      frameTimer = 0;
      currentFrame = (currentFrame + 1) % 2;
    }
  } else {
    frameTimer = 0;
    currentFrame = 0;
  }
}

// ------------------------------------------------------------
// 🎨 DRAW
// ------------------------------------------------------------
export function drawPlayer(ctx) {
  if (!ctx) return;
  ensurePlayerRuntime();
  const { x, y } = gameState.player.pos;

  let img = sprites.idle;
  if (isMoving) img = sprites.walk[currentDir][currentFrame];
  if (!img) return;

  const drawX = x - SPRITE_SIZE / 2;
  const drawY = y - SPRITE_SIZE / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // All frames are already direction-specific; no mirroring needed.
  ctx.drawImage(img, 0, 0, 1024, 1024, drawX, drawY, SPRITE_SIZE, SPRITE_SIZE);
  ctx.restore();
}

// ------------------------------------------------------------
// 🧼 CLEANUP
// ------------------------------------------------------------
export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  console.log("🧭 PlayerController destroyed.");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

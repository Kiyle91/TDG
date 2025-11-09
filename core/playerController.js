// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep (Polished)
// ------------------------------------------------------------
// ✦ Smooth, pastel-friendly Glitter Guardian controller
// ✦ 4-directional movement (WASD / Arrow keys)
// ✦ High-quality sprite rendering (no pixelation)
// ✦ Soft shadow & smoother animation timing
// ✦ Consistent visual polish with enemy rendering
// ============================================================

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ LOCAL STATE
// ------------------------------------------------------------
let canvasRef = null;
const keys = new Set();

const DEFAULT_SPEED = 220;
const SPRITE_SIZE = 80;             // slightly larger for detail
const WALK_FRAME_INTERVAL = 220;    // smoother animation pacing
const SHADOW_OPACITY = 0.25;        // soft shadow tone

let frameTimer = 0;
let currentFrame = 0;
let currentDir = "down";
let isMoving = false;

// ------------------------------------------------------------
// 🖼️ SPRITE SETUP (WASD mapping)
// ------------------------------------------------------------
const sprites = {
  idle: null,
  walk: {
    up: [null, null],    // W1, W2
    left: [null, null],  // A1, A2
    down: [null, null],  // S1, S2
    right: [null, null], // D1, D2
  },
};

// ------------------------------------------------------------
// 🖼️ LOAD SPRITES
// ------------------------------------------------------------
function loadSprite(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
  });
}

async function loadPlayerSprites() {
  sprites.idle = await loadSprite("./assets/images/sprites/glitter/glitter_idle.png");

  sprites.walk.up[0] = await loadSprite("./assets/images/sprites/glitter/glitter_W1.png");
  sprites.walk.up[1] = await loadSprite("./assets/images/sprites/glitter/glitter_W2.png");

  sprites.walk.left[0] = await loadSprite("./assets/images/sprites/glitter/glitter_A1.png");
  sprites.walk.left[1] = await loadSprite("./assets/images/sprites/glitter/glitter_A2.png");

  sprites.walk.down[0] = await loadSprite("./assets/images/sprites/glitter/glitter_S1.png");
  sprites.walk.down[1] = await loadSprite("./assets/images/sprites/glitter/glitter_S2.png");

  sprites.walk.right[0] = await loadSprite("./assets/images/sprites/glitter/glitter_D1.png");
  sprites.walk.right[1] = await loadSprite("./assets/images/sprites/glitter/glitter_D2.png");

  console.log("🦄 Glitter sprites loaded (polished version).");
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
// 🎛️ INPUT HANDLING
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
  console.log("🧭 PlayerController initialized — pastel smooth mode active.");
}

// ------------------------------------------------------------
// 🏃 UPDATE
// ------------------------------------------------------------
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000;
  const speed = p.speed ?? DEFAULT_SPEED;

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

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv; dy *= inv;
  }

  p.pos.x += dx * speed * dt;
  p.pos.y += dy * speed * dt;

  // Direction logic with horizontal priority (like before)
  if (left || right) {
    if (left && !right) currentDir = "left";
    else if (right && !left) currentDir = "right";
  } else if (up || down) {
    currentDir = up ? "up" : "down";
  }

  // Clamp to canvas
  if (canvasRef) {
    const r = SPRITE_SIZE / 2;
    p.pos.x = Math.max(r, Math.min(canvasRef.width - r, p.pos.x));
    p.pos.y = Math.max(r, Math.min(canvasRef.height - r, p.pos.y));
  }

  // Animation timer
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
// 🎨 DRAW (Polished pastel rendering)
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

  // 🌫️ Soft oval shadow
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
  ctx.fillStyle = `rgba(0, 0, 0, ${SHADOW_OPACITY})`;
  ctx.fill();

  // 🦄 Smooth, pastel-friendly rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw sprite
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

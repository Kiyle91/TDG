// ============================================================
// 🧭 playerController.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Adds a simple playable "dot" on the canvas
// ✦ WASD + Arrow-key movement with delta timing
// ✦ Reads/initializes player via gameState (non-destructive)
// ✦ Purely additive — does not modify or remove any existing code
// ============================================================

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ Local state
// ------------------------------------------------------------
let canvasRef = null;
const keys = new Set();

// Default movement speed (pixels/sec) if none found in profile
const DEFAULT_SPEED = 220;

// Dot visuals
const DOT_RADIUS = 10;        // size of the player marker
const DOT_OUTLINE = 2;        // outline thickness

// ------------------------------------------------------------
// 🧩 Helpers — ensure player has runtime position
// ------------------------------------------------------------
function ensurePlayerRuntime() {
  if (!gameState.player) {
    // If no active player has been set yet, create a minimal one
    // NOTE: We DO NOT touch createPlayer() here (non-destructive).
    gameState.player = {
      name: "Glitter Guardian",
      pos: { x: 200, y: 200 },
      speed: DEFAULT_SPEED,
    };
  } else {
    // Add missing runtime fields without overwriting
    if (!gameState.player.pos) {
      gameState.player.pos = { x: 200, y: 200 };
    }
    if (typeof gameState.player.speed !== "number") {
      // Try to derive from stats if present (e.g., profile stats)
      const statSpeed =
        gameState.player?.stats?.speed ??
        gameState.profile?.player?.stats?.speed ??
        DEFAULT_SPEED;
      gameState.player.speed = statSpeed;
    }
  }
}

// ------------------------------------------------------------
// 🎛️ Input hooks
// ------------------------------------------------------------
function onKeyDown(e) {
  const code = e.code;
  // Avoid repeated adds
  keys.add(code);
}

function onKeyUp(e) {
  const code = e.code;
  keys.delete(code);
}

// ------------------------------------------------------------
// 🌷 Public: init
// ------------------------------------------------------------
export function initPlayerController(canvas) {
  canvasRef = canvas;
  ensurePlayerRuntime();

  // Attach listeners (once)
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  console.log("🧭 PlayerController initialized. Speed:", gameState.player.speed);
}

// ------------------------------------------------------------
// 🏃 Update — called each frame from game.updateGame(delta)
// ------------------------------------------------------------
export function updatePlayer(delta) {
  ensurePlayerRuntime();
  const p = gameState.player;
  const dt = Math.max(0, delta) / 1000; // ms → seconds
  const speed = p.speed ?? DEFAULT_SPEED;

  let dx = 0;
  let dy = 0;

  // WASD + Arrows
  if (keys.has("KeyA") || keys.has("ArrowLeft"))  dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp"))    dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown"))  dy += 1;

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv; dy *= inv;
  }

  // Apply velocity
  p.pos.x += dx * speed * dt;
  p.pos.y += dy * speed * dt;

  // Clamp inside canvas bounds (safe if canvasRef present)
  if (canvasRef) {
    const maxX = Math.max(0, canvasRef.width);
    const maxY = Math.max(0, canvasRef.height);
    const r = DOT_RADIUS + DOT_OUTLINE;

    if (p.pos.x < r) p.pos.x = r;
    if (p.pos.y < r) p.pos.y = r;
    if (p.pos.x > maxX - r) p.pos.x = maxX - r;
    if (p.pos.y > maxY - r) p.pos.y = maxY - r;
  }
}

// ------------------------------------------------------------
// 🎨 Draw — called each frame from game.renderGame(ctx)
// ------------------------------------------------------------
export function drawPlayer(ctx) {
  if (!ctx) return;
  ensurePlayerRuntime();
  const { x, y } = gameState.player.pos;

  // Soft pastel dot with outline — future: replace with sprite
  ctx.save();

  // Outer outline
  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS + DOT_OUTLINE, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)"; // soft glow ring
  ctx.fill();

  // Inner core
  ctx.beginPath();
  ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 182, 193, 0.95)"; // pastel pink core
  ctx.fill();

  // Tiny highlight
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fill();

  ctx.restore();
}

// ------------------------------------------------------------
// 🧼 Cleanup (optional if you add screen switching hooks later)
// ------------------------------------------------------------
export function destroyPlayerController() {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  console.log("🧭 PlayerController destroyed.");
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

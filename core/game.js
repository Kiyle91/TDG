// ============================================================
// 🌸 game.js — Olivia’s World: Crystal Keep (FULL — Floating Text Integrated)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player + Enemies + Towers rendered between layers
// ✦ Victory/Defeat system + resetCombatState()
// ✦ Floating combat text support (damage/heal popups)
// ============================================================

// ------------------------------------------------------------
// 🗺️ MAP & LAYERS
// ------------------------------------------------------------
import {
  loadMap,
  extractPathFromMap,
  drawMap,
  drawMapLayered
} from "./map.js";

// ------------------------------------------------------------
// 👹 ENEMIES / TOWERS / PROJECTILES
// ------------------------------------------------------------
import {
  initEnemies,
  updateEnemies,
  drawEnemies,
  setEnemyPath
} from "./enemies.js";

import {
  initTowers,
  updateTowers,
  drawTowers
} from "./towers.js";

import {
  initProjectiles,
  updateProjectiles,
  drawProjectiles
} from "./projectiles.js";

// ------------------------------------------------------------
// 🧭 PLAYER CONTROLLER
// ------------------------------------------------------------
import {
  initPlayerController,
  updatePlayer,
  drawPlayer
} from "./playerController.js";

// ------------------------------------------------------------
// 🧩 UI / HUD
// ------------------------------------------------------------
import { initUI, updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 💬 FLOATING COMBAT TEXT
// ------------------------------------------------------------
import {
  updateFloatingText,
  drawFloatingText
} from "./floatingText.js";

// ------------------------------------------------------------
// ⚙️ GLOBAL STATE IMPORTS
// ------------------------------------------------------------
import { gameState } from "../utils/gameState.js";
import { getMapPixelSize } from "./map.js";
import { stopGameplay } from "../main.js"; // used to stop game when win/lose

// ------------------------------------------------------------
// 🎥 LOCAL CAMERA STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

let cameraX = 0;
let cameraY = 0;

// ------------------------------------------------------------
// 🏆 VICTORY COUNTER
// ------------------------------------------------------------
export let goblinsDefeated = 0;

export function incrementGoblinDefeated() {
  goblinsDefeated++;
  console.log(`⚔️ Goblins defeated: ${goblinsDefeated}`);
}

// ============================================================
// 🌷 INIT — called once when entering the Game screen
// ============================================================
export async function initGame() {
  // 1️⃣ Canvas & Context
  canvas = document.getElementById("game-canvas");
  if (!canvas) throw new Error("game.js: #game-canvas not found in DOM");
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("game.js: 2D context not available");

  // 2️⃣ Load Map
  await loadMap();

  // 3️⃣ Extract enemy path + apply
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // 4️⃣ Initialize subsystems
  initEnemies();
  initTowers();
  initProjectiles();
  initUI();

  // 5️⃣ Player setup
  initPlayerController(canvas);

  console.log("🌸 game.js — Initialization complete.");
}

// ============================================================
// 🔁 UPDATE — synchronized world logic
// ============================================================
export function updateGame(delta) {
  delta = Math.min(delta, 100);

  // Update all systems
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();
  updatePlayer(delta);
  updateFloatingText(delta); // 💬 Floating text movement + fade

  // 🎥 Camera follow player
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;

  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp camera within map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));

  // Check win/loss
  checkVictoryDefeat();
}

// ============================================================
// 🎨 RENDER — ordered by layer depth + camera offset
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  // 1️⃣ Background ground layer
  drawMapLayered(ctx, "ground", cameraX, cameraY, canvas.width, canvas.height);

  // 2️⃣ Entities (translated by camera)
  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  drawEnemies(ctx);
  drawTowers(ctx);
  drawPlayer(ctx);
  drawProjectiles(ctx);
  drawFloatingText(ctx); // 💬 draw floating damage/heal numbers

  ctx.restore();

  // 3️⃣ Foreground canopy / trees layer
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);
}

// ============================================================
// 🧠 VICTORY / DEFEAT CONDITIONS
// ============================================================
function checkVictoryDefeat() {
  const playerHP = gameState.player?.hp ?? 100;
  const lives = gameState.player?.lives ?? 3;

  if (playerHP <= 0) {
    console.log("💀 Player defeated!");
    stopGameplay("defeat");
  } else if (lives <= 0) {
    console.log("💔 No lives remaining!");
    stopGameplay("lives");
  } else if (goblinsDefeated >= 5) {
    console.log("🏆 Victory condition reached!");
    stopGameplay("victory");
  }
}

// ============================================================
// ♻️ RESET COMBAT STATE (used by main.resetGameplay())
// ------------------------------------------------------------
// Resets counters and re-initializes combat subsystems fresh.
// Keeps currencies because main.js preserved them in gameState.
// ============================================================
export function resetCombatState() {
  goblinsDefeated = 0;

  if (gameState.player) {
    gameState.player.pos = { x: 1000, y: 500 };
    gameState.player.hp = gameState.player.maxHp ?? 100;
    gameState.player.lives = 10;
  }

  initGame();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

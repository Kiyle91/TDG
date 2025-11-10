// ============================================================
// 🌸 game.js — Olivia’s World: Crystal Keep (FULL FILE)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player dot renders BETWEEN ground and trees
// ✦ Victory/Defeat system + resetCombatState()
// ============================================================

// ------------------------------------------------------------
// 🗺️ Map & Layers
// ------------------------------------------------------------
import {
  loadMap,
  extractPathFromMap,
  drawMap,
  drawMapLayered
} from "./map.js";

// ------------------------------------------------------------
// 👹 Enemies / Towers / Projectiles
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
// 🧩 UI / HUD
// ------------------------------------------------------------
import { initUI, updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🧭 Player Controller (movable dot)
// ------------------------------------------------------------
import {
  initPlayerController,
  updatePlayer,
  drawPlayer
} from "./playerController.js";

import { gameState } from "../utils/gameState.js";
import { getMapPixelSize } from "./map.js";
import { stopGameplay } from "../main.js"; // used to stop game when win/lose

// ------------------------------------------------------------
// ⚙️ LOCAL STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

// 🎥 CAMERA (scroll offset)
let cameraX = 0;
let cameraY = 0;

// ------------------------------------------------------------
// 🏆 VICTORY TRACKING EXPORTS
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
  // 1) Canvas & context
  canvas = document.getElementById("game-canvas");
  if (!canvas) throw new Error("game.js: #game-canvas not found in DOM");
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("game.js: 2D context not available");

  // 2) Load the Tiled map data
  await loadMap();

  // 3) Extract enemy path and apply
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // 4) Initialize subsystems
  initEnemies();
  initTowers();
  initProjectiles();
  initUI();

  // 5) Initialize player (movable dot)
  initPlayerController(canvas);

  console.log("🌸 game.js — Initialization complete.");
}

// ============================================================
// 🔁 UPDATE — now includes delta clamp for all systems
// ============================================================
export function updateGame(delta) {
  delta = Math.min(delta, 100);

  // Update world systems
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();
  updatePlayer(delta);

  // 🎥 CAMERA FOLLOW
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;
  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp to map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));

  // 🧠 Victory/Defeat check
  checkVictoryDefeat();
}

// ============================================================
// 🎨 RENDER — Corrected Layer Depth + Camera
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  // 1) Ground
  drawMapLayered(ctx, "ground", cameraX, cameraY, canvas.width, canvas.height);

  // 2) Entities
  ctx.save();
  ctx.translate(-cameraX, -cameraY);
  drawEnemies(ctx);
  drawTowers(ctx);
  drawPlayer(ctx);
  drawProjectiles(ctx);
  ctx.restore();

  // 3) Trees / canopy
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);
}

// ============================================================
// 🧠 VICTORY / DEFEAT CHECKS
// ============================================================
function checkVictoryDefeat() {
  const playerHP = gameState.player?.hp ?? 100;
  const lives = gameState.player?.lives ?? 3;

  if (playerHP <= 0) {
    console.log("💀 Player defeated!");
    stopGameplay("defeat");
  } else if (lives <= 0) {
    console.log("💔 No lives remaining!");
    stopGameplay("lives"); // distinct reason for copywriting
  } else if (goblinsDefeated >= 50) {
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
  // Re-run the game init that clears enemies/towers/projectiles,
  // sets up player controller, HUD, etc.
  initGame();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

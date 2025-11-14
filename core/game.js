// ============================================================
// 🌸 game.js — Olivia's World: Crystal Keep (OPTIMIZED Edition)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player + Enemies + Towers rendered between layers
// ✦ Victory/Defeat system + resetCombatState()
// ✦ Floating combat text support (damage/heal popups)
// ✦ Pegasus ambient flight drawn above all layers
// ✦ 🆕 PERFORMANCE OPTIMIZATIONS:
//    - Throttled HUD updates (every 100ms instead of 16ms)
//    - Cached getBoundingClientRect() (expensive DOM call)
//    - Paused-state early exit
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

import { initOgres, updateOgres, drawOgres } from "./ogre.js";

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

import {
  loadLootImages,
  updateLoot,
  drawLoot,
  clearLoot
} from "./ogreLoot.js";

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
// 🪽 PEGASUS (ambient flight)
// ------------------------------------------------------------
import { loadPegasus, initPegasus, updatePegasus, drawPegasusFrame } from "./pegasus.js";
import { loadHealingGem, initHealingDrops, updateHealingDrops, drawHealingDrops } from "./pegasusDrop.js";
import { initWorg, updateWorg, drawWorg, spawnWorg } from "./worg.js";

// ------------------------------------------------------------
// ⚙️ GLOBAL STATE IMPORTS
// ------------------------------------------------------------
import { gameState } from "../utils/gameState.js";
import { getMapPixelSize } from "./map.js";
import { stopGameplay } from "../main.js";
import { initGoblinDrops, updateGoblinDrops, drawGoblinDrops } from "./goblinDrop.js";
import { clearOgres } from "./ogre.js";
import { spawnOgre } from "./ogre.js";

// ------------------------------------------------------------
// 🎥 LOCAL CAMERA STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

let cameraX = 0;
let cameraY = 0;

// 🆕 Performance: Cache expensive DOM queries
let cachedCanvasRect = null;
let rectCacheTimer = 0;
const RECT_CACHE_DURATION = 1000; // Refresh every 1 second (handles window resize)

// 🆕 Performance: Throttle HUD updates
let hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 100; // Update HUD every 100ms instead of 16ms

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

  // 🆕 Cache canvas rect on init
  cachedCanvasRect = canvas.getBoundingClientRect();
  rectCacheTimer = 0;

  // 2️⃣ Load Map
  await loadMap();

  // 3️⃣ Extract enemy path + apply
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // 4️⃣ Initialize subsystems
  initEnemies();
  await initWorg(pathPoints);
  initTowers();
  initOgres();
  initProjectiles();

  await loadLootImages();

  // 5️⃣ Player setup
  initPlayerController(canvas);
  initUI();

  // 6️⃣ Pegasus ambient flight
  await loadPegasus();
  initPegasus(ctx);
  await loadHealingGem();
  initHealingDrops(ctx);
  initGoblinDrops(ctx);

  console.log("🌸 game.js — Initialization complete (optimized).");
}

// ============================================================
// 🔁 UPDATE — synchronized world logic (OPTIMIZED)
// ============================================================
export function updateGame(delta) {
  // 🆕 Early exit if paused (saves CPU)
  if (gameState.paused) return;
  
  delta = Math.min(delta, 100);

  // Update all systems
  updateEnemies(delta);
  updateWorg(delta);
  updateTowers(delta);
  updateOgres(delta);
  updateProjectiles(delta);
  updatePlayer(delta);
  updateFloatingText(delta);
  updatePegasus(delta);
  updateHealingDrops(delta);
  updateGoblinDrops(delta);
  updateLoot(delta);

  // 🆕 Throttled HUD update (every 100ms instead of 16ms)
  hudUpdateTimer += delta;
  if (hudUpdateTimer >= HUD_UPDATE_INTERVAL) {
    hudUpdateTimer = 0;
    updateHUD();
  }

  // 🎥 Camera follow player
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;

  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp camera within map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));
  
  // 🆕 Cache canvas rect (expensive DOM operation)
  rectCacheTimer += delta;
  if (rectCacheTimer >= RECT_CACHE_DURATION || !cachedCanvasRect) {
    rectCacheTimer = 0;
    cachedCanvasRect = canvas.getBoundingClientRect();
  }

  // Keep globals in sync for input → world conversions
  window.cameraX = cameraX;
  window.cameraY = cameraY;
  window.canvasScaleX = canvas.width  / cachedCanvasRect.width;
  window.canvasScaleY = canvas.height / cachedCanvasRect.height;
  
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

  drawTowers(ctx);
  drawWorg(ctx);
  drawEnemies(ctx);
  drawOgres(ctx);
  drawPlayer(ctx);
  drawProjectiles(ctx);
  drawFloatingText(ctx);
  drawHealingDrops(ctx);
  drawGoblinDrops(ctx);
  drawLoot(ctx);

  ctx.restore();

  // 3️⃣ Foreground canopy / trees layer (map overlay)
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);

  // 4️⃣ Pegasus drawn LAST so it stays visible above all
  try {
    if (typeof drawPegasusFrame === "function") {
      drawPegasusFrame(ctx);
    }
  } catch (e) {
    // Non-fatal
  }
}

function checkVictoryDefeat() {
  const playerHP = gameState.player?.hp ?? 100;
  const lives = gameState.player?.lives ?? 3;

  // 💀 Player HP reached 0
  if (playerHP <= 0) {
    console.log("💀 Player defeated!");
    gameState.player.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("defeat"), 2000);
    return;
  }

  // 💔 All lives lost
  if (lives <= 0) {
    console.log("💔 No lives remaining!");
    gameState.player.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("lives"), 2000);
    return;
  }

  // 👹 Boss Spawn Trigger — after 43 goblins slain
  if (goblinsDefeated === 43 && !gameState.ogreSpawned) {
    console.log("👹 43 goblins defeated — summoning the Ogre Boss!");
    gameState.ogreSpawned = true;
    spawnOgre();
  }

  // 🏆 Victory Trigger — all 50 goblins defeated AND Ogre dead
  if (goblinsDefeated >= 50 && gameState.ogreSpawned) {
    const ogres = window.getOgres ? window.getOgres() : [];
    const aliveOgre = ogres.some(o => o.alive);

    if (!aliveOgre && !gameState.victoryPending) {
      console.log("💀 All goblins + Ogre defeated — preparing victory...");
      gameState.victoryPending = true;

      // ⏳ 5-second loot collection window before victory
      setTimeout(() => {
        console.log("🏆 Full wave cleared — Victory achieved!");
        stopGameplay("victory");
      }, 5000);
    }
  }
}

// ============================================================
// ♻️ RESET COMBAT STATE (used by Try Again + New Story)
// ============================================================
export function resetCombatState() {
  goblinsDefeated = 0;

  if (gameState.player) {
    const p = gameState.player;
    p.pos = { x: 1000, y: 500 };
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;
    p.facing = "right";
  }

  // Clear player controller state
  if (typeof window !== "undefined") {
    if (window.__enemies) window.__enemies.length = 0;
  }

  // Internal flags reset
  try {
    import("./playerController.js").then(mod => {
      if (mod && typeof mod.initPlayerController === "function" && canvas) {
        mod.initPlayerController(canvas);
      }
    });
  } catch (err) {
    console.warn("⚠️ Could not refresh player controller:", err);
  }

  // Re-initialize combat systems
  clearOgres();
  clearLoot();
  initEnemies();
  initTowers();
  initProjectiles();

  // 🆕 Force immediate HUD update after reset
  updateHUD();
  hudUpdateTimer = 0;
  
  console.log("♻️ Combat state fully reset (optimized).");
}

// ============================================================
// 🔁 RESET PLAYER STATE — used by "Try Again"
// ============================================================
export function resetPlayerState() {
  const p = gameState.player;
  if (!p) return;

  p.hp = p.maxHp ?? 100;
  p.mana = p.maxMana ?? 50;
  p.dead = false;
  p.lives = 10;
  p.pos = { x: 1000, y: 500 };
  p.facing = "right";

  if (typeof window.__playerControllerReset === "function") {
    window.__playerControllerReset();
  }

  // 🆕 Force immediate HUD update after reset
  updateHUD();
  hudUpdateTimer = 0;
  
  console.log("🎮 Player revived — soft reset (optimized).");
}

import("./ogre.js").then(() => console.log("👹 Ogre dev commands ready."));

// 🆕 Window resize handler to invalidate rect cache
window.addEventListener("resize", () => {
  cachedCanvasRect = null;
  rectCacheTimer = RECT_CACHE_DURATION; // Force immediate update
});

window.spawnWorg = spawnWorg;

// ============================================================
// 🌟 END OF FILE
// ============================================================
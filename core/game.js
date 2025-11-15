// ============================================================
// 🌸 game.js — Olivia's World: Crystal Keep (OPTIMIZED + Multi-Map Spawns)
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
// ✦ 🆕 MAP-AWARE SPAWN:
//    - Spawns player differently per map (map_one / map_two / others)
// ✦ 🆕 WAVE SYSTEM (Maps 1–9):
//    - Wave configs per map
//    - Global spawn queue with 4s spacing per enemy
//    - Unified victory after final wave clear
// ============================================================

// ------------------------------------------------------------
// 🗺️ MAP & LAYERS
// ------------------------------------------------------------
import {
  loadMap,
  extractPathFromMap,
  drawMapLayered,
  getMapPixelSize,
} from "./map.js";

// ------------------------------------------------------------
// 👹 ENEMIES / TOWERS / PROJECTILES
// ------------------------------------------------------------
import {
  initEnemies,
  updateEnemies,
  drawEnemies,
  setEnemyPath,
} from "./enemies.js";

import { initOgres, updateOgres, drawOgres, clearOgres, getOgres, spawnOgre } from "./ogre.js";
import { spawnGoblin } from "./goblin.js";

import {
  initTowers,
  updateTowers,
  drawTowers,
} from "./towers.js";

import {
  initProjectiles,
  updateProjectiles,
  drawProjectiles,
} from "./projectiles.js";

import {
  loadLootImages,
  updateLoot,
  drawLoot,
  clearLoot,
} from "./ogreLoot.js";

// ------------------------------------------------------------
// 🧭 PLAYER CONTROLLER
// ------------------------------------------------------------
import {
  initPlayerController,
  updatePlayer,
  drawPlayer,
  spawnDamageSparkles,
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
  drawFloatingText,
} from "./floatingText.js";

// ------------------------------------------------------------
// 🪽 PEGASUS (ambient flight) + Healing Drops / Goblin Drops
// ------------------------------------------------------------
import {
  loadPegasus,
  initPegasus,
  updatePegasus,
  drawPegasusFrame,
} from "./pegasus.js";

import {
  loadHealingGem,
  initHealingDrops,
  updateHealingDrops,
  drawHealingDrops,
} from "./pegasusDrop.js";

import {
  initWorg,
  updateWorg,
  drawWorg,
  spawnWorg,
  getWorg,
} from "./worg.js";

import {
  initGoblinDrops,
  updateGoblinDrops,
  drawGoblinDrops,
} from "./goblinDrop.js";

// ------------------------------------------------------------
// ⚙️ GLOBAL STATE IMPORTS
// ------------------------------------------------------------
import { gameState } from "../utils/gameState.js";
import { stopGameplay } from "../main.js";

// ============================================================
// 📘 WAVE CONFIG — All maps 1–9
// ============================================================

export const waveConfigs = {
  1: [
    { goblins: 1,  worgs: 0,  ogres: 0 },
    { goblins: 3,  worgs: 0,  ogres: 0 },
    { goblins: 7,  worgs: 0,  ogres: 0 },
    { goblins: 10, worgs: 0,  ogres: 0 },
    { goblins: 20, worgs: 0,  ogres: 0 },
  ],

  2: [
    { goblins: 10, worgs: 0,  ogres: 0 },
    { goblins: 0,  worgs: 10, ogres: 0 },
    { goblins: 20, worgs: 10, ogres: 0 },
    { goblins: 20, worgs: 20, ogres: 1 },
    { goblins: 20, worgs: 20, ogres: 1 },
  ],

  3: [
    { goblins: 30, worgs: 10, ogres: 0 },
    { goblins: 20, worgs: 0,  ogres: 0 },
    { goblins: 30, worgs: 20, ogres: 0 },
    { goblins: 30, worgs: 20, ogres: 1 },
    { goblins: 20, worgs: 20, ogres: 2 },
  ],

  4: [
    { goblins: 30, worgs: 20, ogres: 0 },
    { goblins: 30, worgs: 30, ogres: 0 },
    { goblins: 40, worgs: 20, ogres: 0 },
    { goblins: 10, worgs: 0,  ogres: 2 },
    { goblins: 20, worgs: 10, ogres: 3 },
  ],

  5: [
    { goblins: 30, worgs: 20, ogres: 0 },
    { goblins: 30, worgs: 20, ogres: 1 },
    { goblins: 40, worgs: 30, ogres: 2 },
    { goblins: 0,  worgs: 0,  ogres: 4 },
    { goblins: 40, worgs: 30, ogres: 2 },
  ],

  6: [
    { goblins: 50, worgs: 20, ogres: 0 },
    { goblins: 0,  worgs: 20, ogres: 3 },
    { goblins: 30, worgs: 0,  ogres: 1 },
    { goblins: 0,  worgs: 40, ogres: 0 },
    { goblins: 40, worgs: 30, ogres: 2 },
  ],

  7: [
    { goblins: 50, worgs: 20, ogres: 0 },
    { goblins: 0,  worgs: 20, ogres: 2 },
    { goblins: 60, worgs: 40, ogres: 0 },
    { goblins: 0,  worgs: 10, ogres: 5 },
    { goblins: 40, worgs: 30, ogres: 2 },
  ],

  8: [
    { goblins: 60, worgs: 30, ogres: 0 },
    { goblins: 60, worgs: 20, ogres: 1 },
    { goblins: 60, worgs: 30, ogres: 2 },
    { goblins: 60, worgs: 0,  ogres: 0 },
    { goblins: 60, worgs: 0,  ogres: 3 },
  ],

  9: [
    { goblins: 70, worgs: 50, ogres: 0 },
    { goblins: 70, worgs: 50, ogres: 3 },
    { goblins: 50, worgs: 0,  ogres: 5 },
    { goblins: 70, worgs: 70, ogres: 5 },
    { goblins: 80, worgs: 80, ogres: 7 },
  ],
};

// ============================================================
// 🎯 WAVE STATE
// ============================================================

let currentWaveIndex = 0;
let waveActive = false;
let waveCleared = false;

const BETWEEN_WAVES_DELAY = 3000; 
const VICTORY_DELAY = 5000;       

let betweenWaveTimer = 0;
let victoryPending = false;

// ============================================================
// 🐣 SPAWN QUEUE (4-second spacing)
// ============================================================
const SPAWN_INTERVAL = 4000;
let spawnQueue = [];
let spawnTimer = 0;

// ============================================================
// 🚀 START NEXT WAVE
// ============================================================
function startNextWave() {
  const mapId = gameState.progress.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  const wave = waves[currentWaveIndex];
  if (!wave) return;

  console.log(`🌊 Starting Wave ${currentWaveIndex + 1} of ${waves.length} (Map ${mapId})`);

  // ⚠️ CRITICAL: Clear old queue
  spawnQueue.length = 0;

  waveActive = true;
  waveCleared = false;

  // Update HUD
  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();

  // Queue spawns
  for (let i = 0; i < wave.goblins; i++) spawnQueue.push(() => spawnGoblin());
  for (let i = 0; i < wave.worgs; i++)   spawnQueue.push(() => spawnWorg());
  for (let i = 0; i < wave.ogres; i++)   spawnQueue.push(() => spawnOgre());
}

// ============================================================
// 👁 CHECK ACTIVE ENEMIES
// ============================================================
import { getEnemies } from "./goblin.js";

function noEnemiesAlive() {
  const g = getEnemies();
  const w = getWorg();
  const o = getOgres();

  console.log("Alive counts:", {
    goblins: g.filter(e => e.alive).length,
    worgs:   w.filter(e => e.alive).length,
    ogres:   o.filter(e => e.alive).length,
    spawnQueueLeft: spawnQueue.length
  });

  return (
    g.every(e => !e.alive) &&
    w.every(e => !e.alive) &&
    o.every(e => !e.alive)
  );
}

// ============================================================
// 🔁 UPDATE WAVE PROGRESSION (FULLY FIXED)
// ============================================================
function updateWaveSystem(delta) {

  console.log("🔥 waveSystemTick", {
    mapId: gameState.progress?.currentMap,
    waveIndex: currentWaveIndex,
    totalWaves: waveConfigs[gameState.progress?.currentMap]?.length,
    waveActive,
    waveCleared,
    enemiesAlive: !noEnemiesAlive(),
    spawnQueue: spawnQueue.length
  });

  // 1️⃣ Handle spawn queue
  spawnTimer -= delta;
  if (spawnQueue.length > 0 && spawnTimer <= 0) {
    const spawnFn = spawnQueue.shift();
    spawnFn();
    spawnTimer = SPAWN_INTERVAL;
  }

  if (victoryPending) return;

  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  // ----------------------------------------------------------
  // 2️⃣ ACTIVE WAVE
  // ----------------------------------------------------------
  if (waveActive) {
    if (!noEnemiesAlive()) return;

    // Mark cleared once
    if (!waveCleared) {
      waveCleared = true;
      waveActive = false;
      betweenWaveTimer = BETWEEN_WAVES_DELAY;

      console.log(`✨ Wave ${currentWaveIndex + 1} cleared (Map ${mapId})`);
      return;
    }
  }

  if (!waveCleared) return;

  // ----------------------------------------------------------
  // 3️⃣ BETWEEN WAVES
  // ----------------------------------------------------------
  betweenWaveTimer -= delta;
  if (betweenWaveTimer > 0) return;

  // ----------------------------------------------------------
  // 4️⃣ MORE WAVES?
  // ----------------------------------------------------------
  if (currentWaveIndex + 1 < waves.length) {
    currentWaveIndex++;
    startNextWave();
    return;
  }

  // ----------------------------------------------------------
  // 5️⃣ FINAL WAVE → VICTORY
  // ----------------------------------------------------------
  console.log(`🏆 All waves complete on map ${mapId}. Scheduling victory…`);

  victoryPending = true;

  setTimeout(() => {
    stopGameplay("victory");
  }, VICTORY_DELAY);
}


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
const RECT_CACHE_DURATION = 1000; // Refresh every 1 second

// 🆕 Performance: Throttle HUD updates
let hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 100; // Update HUD every 100ms

// ------------------------------------------------------------
// 🏆 VICTORY COUNTER
// ------------------------------------------------------------
export let goblinsDefeated = 0;

export function incrementGoblinDefeated() {
  goblinsDefeated++;
  console.log(`⚔️ Goblins defeated: ${goblinsDefeated}`);
}

// ------------------------------------------------------------
// 🧭 MAP-AWARE PLAYER SPAWN
// ------------------------------------------------------------
function applyMapSpawn() {
  if (!gameState.player) return;

  const p = gameState.player;
  const mapId = gameState.progress?.currentMap || 1;

  if (mapId === 1) {
    // 📍 MAP ONE spawn
    p.pos = { x: 1000, y: 500 };
  } else if (mapId === 2) {
    // 📍 MAP TWO spawn
    p.pos = { x: 250, y: 1650 };
  } else {
    // Fallback for any future maps
    if (!p.pos) p.pos = { x: 1000, y: 500 };
  }
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

  // Cache canvas rect on init
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
  if (!gameState.player) {
    gameState.player = {
      name: "Glitter Guardian",
      pos: { x: 1000, y: 500 },
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      lives: 10,
      facing: "right",
    };
  }
  applyMapSpawn();
  initPlayerController(canvas);
  initUI();

  // 6️⃣ Pegasus + healing + goblin drops
  await loadPegasus();
  initPegasus(ctx);
  await loadHealingGem();
  initHealingDrops(ctx);
  initGoblinDrops(ctx);

  // 🌊 Reset wave state
  currentWaveIndex = 0;
  waveActive = false;
  waveCleared = false;
  victoryPending = false;
  spawnQueue = [];
  spawnTimer = 0;

  // Start first wave automatically
  startNextWave();

  console.log("🌸 game.js — Initialization complete (optimized, multi-map).");
}

// ============================================================
// 🔁 UPDATE — synchronized world logic (OPTIMIZED)
// ============================================================
export function updateGame(delta) {
  // Early exit if paused
  if (gameState.paused) return;

  delta = Math.min(delta, 100);

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
  updateWaveSystem(delta);

  // Throttled HUD update
  hudUpdateTimer += delta;
  if (hudUpdateTimer >= HUD_UPDATE_INTERVAL) {
    hudUpdateTimer = 0;
    updateHUD();
  }

  // Camera follow
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;

  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp camera within map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));

  // Cache canvas rect occasionally (expensive DOM op)
  rectCacheTimer += delta;
  if (rectCacheTimer >= RECT_CACHE_DURATION || !cachedCanvasRect) {
    rectCacheTimer = 0;
    cachedCanvasRect = canvas.getBoundingClientRect();
  }

  // Keep globals in sync
  window.cameraX = cameraX;
  window.cameraY = cameraY;
  window.canvasScaleX = canvas.width  / cachedCanvasRect.width;
  window.canvasScaleY = canvas.height / cachedCanvasRect.height;

  // Check defeat (victory handled by wave engine)
  checkVictoryDefeat();
}

// ============================================================
// 🎨 RENDER — ordered by layer depth + camera offset
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  // 1️⃣ Background ground layer
  drawMapLayered(ctx, "ground", cameraX, cameraY, canvas.width, canvas.height);

  // 2️⃣ Entities
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

  // 3️⃣ Foreground trees
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);

  // 4️⃣ Pegasus
  try {
    if (typeof drawPegasusFrame === "function") {
      drawPegasusFrame(ctx);
    }
  } catch (e) {
    // Non-fatal
  }
}

// ============================================================
// 🧠 VICTORY / DEFEAT CHECK
// (Victory now handled exclusively by wave system)
// ============================================================
function checkVictoryDefeat() {
  const p = gameState.player;
  if (!p) return;

  const hp = p.hp ?? 100;
  const lives = p.lives ?? 3;

  // -------------------------------------------
  // ❌ DEFEAT: HP zero
  // -------------------------------------------
  if (hp <= 0) {
    p.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("defeat"), 1500);
    return;
  }

  // -------------------------------------------
  // ❌ DEFEAT: Lives zero (escaped goblins)
  // -------------------------------------------
  if (lives <= 0) {
    p.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("lives"), 1500);
    return;
  }

  // -------------------------------------------
  // 🏆 VICTORY:
  // NOW HANDLED 100% BY THE WAVE ENGINE
  // (no map-specific victory here anymore)
  // -------------------------------------------
}


// ============================================================
// ♻️ RESET COMBAT STATE — used by Try Again, Continue, New Map
// ============================================================
export function resetCombatState() {
  console.log("♻️ Resetting combat state...");

  // Global counters
  goblinsDefeated = 0;
  gameState.victoryPending = false;
  gameState.ogreSpawned = false;

  // Map-specific triggers (legacy map 2 flags reset anyway)
  gameState.worgSpawns = 0;
  gameState.ogreTriggers = {
    25: false,
    50: false,
    75: false,
    100: false,
  };

  // Player reset
  const p = gameState.player;
  if (p) {
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;
    p.facing = "right";
  }

  // Clear runtime entities
  if (window.__enemies) window.__enemies.length = 0;
  clearOgres();
  clearLoot();

  // Re-init combat systems
  initEnemies();
  initTowers();
  initProjectiles();

  updateHUD();

  console.log("♻️ Combat state fully reset for new battle.");
}

// ============================================================
// 🔁 RESET PLAYER STATE — used by "Try Again"
// ============================================================
export function resetPlayerState() {
  const p = gameState.player;
  if (!p) return;

  applyMapSpawn();
  p.hp = p.maxHp ?? 100;
  p.mana = p.maxMana ?? 50;
  p.dead = false;
  p.lives = 10;
  p.facing = "right";

  if (typeof window.__playerControllerReset === "function") {
    window.__playerControllerReset();
  }

  updateHUD();
  hudUpdateTimer = 0;

  console.log("🎮 Player revived — soft reset (optimized, multi-map).");
}

import("./ogre.js").then(() => console.log("👹 Ogre dev commands ready."));

// Window resize handler to invalidate rect cache
window.addEventListener("resize", () => {
  cachedCanvasRect = null;
  rectCacheTimer = RECT_CACHE_DURATION;
});

window.spawnWorg = spawnWorg;

// ============================================================
// 🛠️ DEV TOOL — Instant Victory Trigger
// ============================================================
window.forceMapVictory = function () {
  console.log("⚡ DEV: Forcing Victory!");

  try {
    const currentMap = gameState.progress?.currentMap ?? 1;

    // Mark victory pending to prevent double triggers
    gameState.victoryPending = true;

    // Force all ogres dead (compat)
    if (window.getOgres) {
      const ogres = window.getOgres();
      for (const o of ogres) {
        o.alive = false;
        o.hp = 0;
      }
    }

    // Force goblins defeated to max based on map (for stats only)
    if (!gameState.stats) gameState.stats = {};
    if (currentMap === 1) {
      gameState.stats.goblinsDefeated = 50;
    } else if (currentMap === 2) {
      gameState.stats.goblinsDefeated = 100;
    } else {
      gameState.stats.goblinsDefeated = 9999;
    }

    setTimeout(() => {
      stopGameplay("victory");
    }, 500);

  } catch (err) {
    console.warn("⚠️ DEV Victory failed:", err);
  }
};

// ============================================================
// 🌟 END OF FILE
// ============================================================

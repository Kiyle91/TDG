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
//    - Spawns player differently per map (map_one / map_two)
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

import { spawnGoblin } from "./goblin.js";

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
// ============================================================
// 🧩 ENEMY SPAWN HELPERS
// ============================================================



// ============================================================
// 📘 WAVE CONFIG — All maps 1–9
// ============================================================

export const waveConfigs = {
  1: [
    { goblins: 20, worgs: 0, ogres: 0 },
  ],

  2: [
    { goblins: 10, worgs: 0, ogres: 0 },
    { goblins: 0,  worgs: 10, ogres: 0 },
    { goblins: 20, worgs: 10, ogres: 0 },
  ],

  3: [
    { goblins: 30, worgs: 10, ogres: 0 },
    { goblins: 20, worgs: 0,  ogres: 0 },
    { goblins: 0,  worgs: 20, ogres: 0 },
    { goblins: 0,  worgs: 0,  ogres: 1 },
  ],

  4: [
    { goblins: 30, worgs: 20, ogres: 0 },
    { goblins: 30, worgs: 30, ogres: 0 },
    { goblins: 40, worgs: 20, ogres: 0 },
    { goblins: 10, worgs: 0,  ogres: 2 },
  ],

  5: [
    { goblins: 30, worgs: 20, ogres: 0 },
    { goblins: 30, worgs: 20, ogres: 1 },
    { goblins: 40, worgs: 30, ogres: 2 },
    { goblins: 0,  worgs: 0,  ogres: 2 },
  ],

  6: [
    { goblins: 50, worgs: 20, ogres: 0 },
    { goblins: 0,  worgs: 20, ogres: 3 },
    { goblins: 30, worgs: 0,  ogres: 1 },
    { goblins: 0,  worgs: 40, ogres: 0 },
  ],

  7: [
    { goblins: 50, worgs: 20, ogres: 0 },
    { goblins: 0,  worgs: 20, ogres: 2 },
    { goblins: 60, worgs: 40, ogres: 0 },
    { goblins: 0,  worgs: 10, ogres: 5 },
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

const BETWEEN_WAVES_DELAY = 3000; // 3s between waves
const VICTORY_DELAY = 5000;       // your loot window

let betweenWaveTimer = 0;
let victoryPending = false;


// ============================================================
// 🐣 SPAWN QUEUE (4-second spacing)
// ============================================================
const SPAWN_INTERVAL = 4000; // 4 seconds in ms
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

  console.log(`🌊 Starting Wave ${currentWaveIndex + 1} of ${waves.length}`);

  waveActive = true;
  waveCleared = false;

  // Update HUD wave info
  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();

  // Queue goblins
  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => spawnGoblin());
  }

  // Queue worgs
  for (let i = 0; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnWorg());
  }

  // Queue ogres
  for (let i = 0; i < wave.ogres; i++) {
    spawnQueue.push(() => spawnOgre());
  }
}

// ============================================================
// 👁 CHECK ACTIVE ENEMIES
// ============================================================
import { getEnemies } from "./enemies.js";
import { getWorg } from "./worg.js";
import { getOgres } from "./ogre.js";

function noEnemiesAlive() {
  const all = [
    ...getEnemies(),
    ...getWorg(),
    ...getOgres(),
  ];
  return all.every(e => !e.alive);
}
// ============================================================
// 🔁 UPDATE WAVE PROGRESSION
// ============================================================
function updateWaveSystem(delta) {
  spawnTimer -= delta;

  if (spawnQueue.length > 0 && spawnTimer <= 0) {
      const spawnFn = spawnQueue.shift(); // take next enemy
      spawnFn();                           // spawn that enemy
      spawnTimer = SPAWN_INTERVAL;         // reset timer
  }
  
  if (victoryPending) return;

  // No waves until gameplay starts
  if (!waveActive) return;

  // Wave still ongoing? Enemies alive -> do nothing
  if (!noEnemiesAlive()) return;

  // Wave finished
  if (!waveCleared) {
    waveCleared = true;
    waveActive = false;
    betweenWaveTimer = BETWEEN_WAVES_DELAY;

    console.log(`✨ Wave ${currentWaveIndex + 1} cleared!`);
    return;
  }

  // All enemies gone, countdown to next wave
  betweenWaveTimer -= delta;
  if (betweenWaveTimer > 0) return;

  const mapId = gameState.progress.currentMap ?? 1;
  const waves = waveConfigs[mapId];

  // More waves left?
  if (currentWaveIndex + 1 < waves.length) {
    currentWaveIndex++;
    startNextWave();
  }

  // LAST WAVE FINISHED
  else {
    console.log("🏆 All waves complete — final clear window active.");

    victoryPending = true;

    setTimeout(() => {
      stopGameplay("victory");
    }, VICTORY_DELAY);
  }
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

// ------------------------------------------------------------
// 🧭 MAP-AWARE PLAYER SPAWN
// ------------------------------------------------------------
// Centralised spawn logic so all systems use the same positions
function applyMapSpawn() {
  if (!gameState.player) return;

  const p = gameState.player;
  const mapId = gameState.progress?.currentMap || 1;

  if (mapId === 1) {
    // 📍 MAP ONE spawn (existing default)
    p.pos = { x: 1000, y: 500 };
  } else if (mapId === 2) {
    // 📍 MAP TWO spawn — tweak after testing new map layout
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

  // 🆕 Cache canvas rect on init
  cachedCanvasRect = canvas.getBoundingClientRect();
  rectCacheTimer = 0;

  // 2️⃣ Load Map (map_one / map_two based on gameState.progress.currentMap)
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
  //    Ensure player object exists, THEN apply map-based spawn.
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
  applyMapSpawn();             // 🔑 Map-aware spawn
  initPlayerController(canvas);
  initUI();

  // 6️⃣ Pegasus ambient flight
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

  // Start first wave automatically (except Map 1, which is 1 wave anyway)
  startNextWave();

  console.log("🌸 game.js — Initialization complete (optimized, multi-map).");
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
  updateWaveSystem(delta);

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
  const p = gameState.player;
  if (!p) return;

  const hp = p.hp ?? 100;
  const lives = p.lives ?? 3;

  // -------------------------------------------
  // DEFEAT
  // -------------------------------------------
  if (hp <= 0) {
    gameState.player.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("defeat"), 1500);
    return;
  }

  if (lives <= 0) {
    gameState.player.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("lives"), 1500);
    return;
  }

  // -------------------------------------------
  // MAP ROUTER
  // -------------------------------------------
  const mapId = gameState.progress.currentMap || 1;

  if (mapId === 1) {
    handleMapOneVictoryLogic();
  } else if (mapId === 2) {
    handleMapTwoVictoryLogic();
  }
}

function handleMapOneVictoryLogic() {
  // Goblin waves total: 50
  if (goblinsDefeated === 10 && !gameState.ogreSpawned) {
    console.log("👹 Summoning Ogre (Map 1)");
    gameState.ogreSpawned = true;
    spawnOgre();
  }

  if (goblinsDefeated >= 15 && gameState.ogreSpawned) {
    const ogres = window.getOgres ? window.getOgres() : [];
    const alive = ogres.some(o => o.alive);

    if (!alive && !gameState.victoryPending) {
      console.log("🏆 Map 1 victory pending...");
      gameState.victoryPending = true;
      setTimeout(() => stopGameplay("victory"), 5000);
    }
  }
}

function handleMapTwoVictoryLogic() {

  // ------------------------------------------------------------
  // 🐺 WORG SPAWNS (every 10 goblins)
  // ------------------------------------------------------------
  if (!gameState.worgSpawns) gameState.worgSpawns = 0;

  if (goblinsDefeated >= (gameState.worgSpawns + 1) * 10) {
    console.log("🐺 Spawning 3 Worgs!");
    spawnWorg();
    spawnWorg();
    spawnWorg();
    gameState.worgSpawns++;
  }

  // ------------------------------------------------------------
  // 👹 OGRE SPAWNS (25, 50, 75, 100)
  // ------------------------------------------------------------
  if (!gameState.ogreTriggers) {
    gameState.ogreTriggers = { 25: false, 50: false, 75: false, 100: false };
  }

  const triggerPoints = [25, 50, 75, 100];
  for (const point of triggerPoints) {
    if (goblinsDefeated >= point && !gameState.ogreTriggers[point]) {
      console.log(`👹 Spawning Ogre at ${point} kills`);
      spawnOgre();
      gameState.ogreTriggers[point] = true;
    }
  }

  // ------------------------------------------------------------
  // 🏆 VICTORY CONDITION (Map 2)
  // ------------------------------------------------------------
  if (goblinsDefeated >= 25) {
    const ogres = window.getOgres ? window.getOgres() : [];
    const alive = ogres.some(o => o.alive);

    if (!alive && !gameState.victoryPending) {
      console.log("🏆 Map 2 victory pending...");
      gameState.victoryPending = true;
      setTimeout(() => stopGameplay("victory"), 5000);
    }
  }
}


// ============================================================
// ♻️ RESET COMBAT STATE — used by Try Again, Continue, New Map
// ============================================================
export function resetCombatState() {
  console.log("♻️ Resetting combat state...");

  // ------------------------------------------------------------
  // GLOBAL COUNTERS
  // ------------------------------------------------------------
  goblinsDefeated = 0;
  gameState.victoryPending = false;
  gameState.ogreSpawned = false;

  // ------------------------------------------------------------
  // MAP-SPECIFIC TRIGGERS (Map 2)
  // ------------------------------------------------------------
  gameState.worgSpawns = 0;
  gameState.ogreTriggers = {
    25: false,
    50: false,
    75: false,
    100: false
  };

  // ------------------------------------------------------------
  // PLAYER RESET (but DO NOT override map-based spawn)
  // ------------------------------------------------------------
  const p = gameState.player;
  if (p) {
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;
    p.facing = "right";

    // position handled by initGame() → applyMapSpawn()
  }

  // ------------------------------------------------------------
  // CLEAR ALL RUNTIME ENTITIES
  // ------------------------------------------------------------
  // clear goblins by enemies.js
  if (window.__enemies) window.__enemies.length = 0;

  // clear ogres + their fade-outs
  clearOgres();

  // clear loot bags
  clearLoot();

  // ------------------------------------------------------------
  // RE-INIT COMBAT SYSTEMS
  // ------------------------------------------------------------
  initEnemies();        // goblins
  initTowers();         // towers
  initProjectiles();    // tower & player projectiles

  // Force HUD refresh
  updateHUD();

  console.log("♻️ Combat state fully reset for new battle.");
}

// ============================================================
// 🔁 RESET PLAYER STATE — used by "Try Again"
// ============================================================
export function resetPlayerState() {
  const p = gameState.player;
  if (!p) return;

  applyMapSpawn();            // 🔑 Map-based respawn
  p.hp = p.maxHp ?? 100;
  p.mana = p.maxMana ?? 50;
  p.dead = false;
  p.lives = 10;
  p.facing = "right";

  if (typeof window.__playerControllerReset === "function") {
    window.__playerControllerReset();
  }

  // 🆕 Force immediate HUD update after reset
  updateHUD();
  hudUpdateTimer = 0;
  
  console.log("🎮 Player revived — soft reset (optimized, multi-map).");
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

    // Force goblins defeated to max based on map
    if (!gameState.stats) gameState.stats = {};
    if (currentMap === 1) {
      gameState.stats.goblinsDefeated = 50;
    } else if (currentMap === 2) {
      gameState.stats.goblinsDefeated = 100;
    } else {
      // future maps? just mark large number
      gameState.stats.goblinsDefeated = 9999;
    }

    // Slight delay to mimic real victory
    setTimeout(() => {
      stopGameplay("victory");
    }, 500);

  } catch (err) {
    console.warn("⚠️ DEV Victory failed:", err);
  }
};

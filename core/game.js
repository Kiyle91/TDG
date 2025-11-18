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

// ============================================================
// 🌸 game.js — Olivia's World: Crystal Keep (OPTIMIZED + Multi-Map Spawns)
// ------------------------------------------------------------
// Core game controller — update loop, render loop, system orchestration
// ============================================================

// ------------------------------------------------------------
// 🗺️ MAP & LAYERS
// ------------------------------------------------------------
import {
  loadMap,
  extractPathFromMap,
  drawMapLayered,
  getMapPixelSize,
  extractCrystalEchoes,
} from "./map.js";

// ------------------------------------------------------------
// 👹 ENEMIES (Goblin / Troll / Ogre / Worg / Elite / Crossbow)
// ------------------------------------------------------------
import {
  initEnemies,
  updateEnemies,
  drawEnemies,
  setEnemyPath,
} from "./enemies.js";

import {
  initOgres,
  updateOgres,
  drawOgres,
  clearOgres,
  getOgres,
  spawnOgre,
} from "./ogre.js";

import {
  getGoblins,
  spawnGoblin,
} from "./goblin.js";

import {
  initTrolls,
  updateTrolls,
  drawTrolls,
  spawnTroll,
  getTrolls,
  clearTrolls,
} from "./troll.js";

import {
  initWorg,
  updateWorg,
  drawWorg,
  spawnWorg,
  getWorg,
} from "./worg.js";

import {
  initElites,
  updateElites,
  drawElites,
  getElites,
  clearElites,
  spawnElite,
} from "./elite.js";

import {
  initCrossbows,
  updateCrossbows,
  drawCrossbows,
  spawnCrossbow,
  getCrossbows,
  clearCrossbows,
} from "./crossbow.js";

// ------------------------------------------------------------
// 🏹 TOWERS & PROJECTILES
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 🎁 UNIFIED LOOT SYSTEM
// ------------------------------------------------------------
import {
  loadLootImages,
  updateLoot,
  drawLoot,
  clearLoot,
} from "./loot.js";

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
import {
  initUI,
  updateHUD,
  updateBraveryBar,
} from "./ui.js";

// ------------------------------------------------------------
// 💬 FLOATING COMBAT TEXT
// ------------------------------------------------------------
import {
  updateFloatingText,
  drawFloatingText,
} from "./floatingText.js";

// ------------------------------------------------------------
// 🪽 PEGASUS (ambient flight only)
// ------------------------------------------------------------
import {
  loadPegasus,
  initPegasus,
  updatePegasus,
  drawPegasusFrame,
} from "./pegasus.js";

// ------------------------------------------------------------
// ✨ CRYSTAL ECHOES (ambient sparkle bursts)
// ------------------------------------------------------------
import {
  updateCrystalEchoes,
  initCrystalEchoes,
  renderSparkleBursts,
} from "./crystalEchoes.js";

// ------------------------------------------------------------
// ⚙️ GLOBAL STATE & STORY
// ------------------------------------------------------------
import {
  gameState,
  unlockMap,
  saveProfiles,
} from "../utils/gameState.js";

import { stopGameplay } from "../main.js";

import {
  triggerEndOfWave1Story,
  triggerEndOfWave5Story,
} from "./story.js";


// ============================================================
// 🌊 WAVE CONFIGS
// ============================================================
export const waveConfigs = {
  // 🌿 MAP 1 — Beginner Onboarding
  1: [
    { goblins: 4,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 7,  worgs: 0, ogres: 0, elites: 1, trolls: 1, crossbows: 0 },
    { goblins: 10, worgs: 0, ogres: 0, elites: 2, trolls: 2, crossbows: 0 },
    { goblins: 14, worgs: 0, ogres: 0, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 18, worgs: 0, ogres: 0, elites: 4, trolls: 4, crossbows: 1 },
  ],

  // 🌲 MAP 2 — Early Mixed Units
  2: [
    { goblins: 10, worgs: 2,  ogres: 0, elites: 4, trolls: 4, crossbows: 4 },
    { goblins: 14, worgs: 4,  ogres: 0, elites: 5, trolls: 4, crossbows: 4 },
    { goblins: 18, worgs: 6,  ogres: 0, elites: 6, trolls: 5, crossbows: 5 },
    { goblins: 22, worgs: 8,  ogres: 1, elites: 7, trolls: 5, crossbows: 6 },
    { goblins: 26, worgs: 10, ogres: 1, elites: 8, trolls: 6, crossbows: 6 },
  ],

  // 🏞 MAP 3 — Early-Mid Mix
  3: [
    { goblins: 16, worgs: 6,  ogres: 0, elites: 10, trolls: 8, crossbows: 8 },
    { goblins: 20, worgs: 8,  ogres: 0, elites: 12, trolls: 8, crossbows: 8 },
    { goblins: 24, worgs: 10, ogres: 1, elites: 14, trolls: 9, crossbows: 8 },
    { goblins: 28, worgs: 12, ogres: 1, elites: 16, trolls: 10, crossbows: 9 },
    { goblins: 32, worgs: 14, ogres: 2, elites: 18, trolls: 10, crossbows: 10 },
  ],

  // ❄ MAP 4 — Worg Pressure
  4: [
    { goblins: 18, worgs: 12, ogres: 0, elites: 12, trolls: 12, crossbows: 8 },
    { goblins: 20, worgs: 14, ogres: 0, elites: 13, trolls: 12, crossbows: 8 },
    { goblins: 22, worgs: 16, ogres: 1, elites: 14, trolls: 13, crossbows: 9 },
    { goblins: 24, worgs: 18, ogres: 1, elites: 15, trolls: 14, crossbows: 9 },
    { goblins: 26, worgs: 20, ogres: 2, elites: 16, trolls: 14, crossbows: 10 },
  ],

  // 🔥 MAP 5 — Mid Game Sustain
  5: [
    { goblins: 20, worgs: 10, ogres: 1, elites: 14, trolls: 14, crossbows: 10 },
    { goblins: 24, worgs: 12, ogres: 1, elites: 15, trolls: 14, crossbows: 10 },
    { goblins: 28, worgs: 14, ogres: 2, elites: 16, trolls: 15, crossbows: 10 },
    { goblins: 30, worgs: 16, ogres: 3, elites: 17, trolls: 15, crossbows: 11 },
    { goblins: 34, worgs: 18, ogres: 3, elites: 18, trolls: 16, crossbows: 12 },
  ],

  // 🜂 MAP 6 — Chaotic Alternation
  6: [
    { goblins: 28, worgs: 12, ogres: 1, elites: 18, trolls: 18, crossbows: 14 },
    { goblins: 18, worgs: 20, ogres: 1, elites: 18, trolls: 18, crossbows: 14 },
    { goblins: 26, worgs: 14, ogres: 2, elites: 19, trolls: 18, crossbows: 15 },
    { goblins: 14, worgs: 26, ogres: 2, elites: 20, trolls: 18, crossbows: 15 },
    { goblins: 30, worgs: 20, ogres: 3, elites: 22, trolls: 18, crossbows: 16 },
  ],

  // ⚔ MAP 7 — Elite-Heavy Spike
  7: [
    { goblins: 28, worgs: 14, ogres: 1, elites: 22, trolls: 18, crossbows: 16 },
    { goblins: 22, worgs: 18, ogres: 2, elites: 24, trolls: 18, crossbows: 16 },
    { goblins: 30, worgs: 22, ogres: 2, elites: 26, trolls: 18, crossbows: 17 },
    { goblins: 24, worgs: 16, ogres: 3, elites: 28, trolls: 16, crossbows: 17 },
    { goblins: 32, worgs: 24, ogres: 3, elites: 30, trolls: 18, crossbows: 18 },
  ],

  // ⚡ MAP 8 — Very Late Scaling
  8: [
    { goblins: 34, worgs: 18, ogres: 1, elites: 26, trolls: 18, crossbows: 18 },
    { goblins: 38, worgs: 22, ogres: 1, elites: 28, trolls: 18, crossbows: 18 },
    { goblins: 42, worgs: 24, ogres: 2, elites: 30, trolls: 18, crossbows: 18 },
    { goblins: 44, worgs: 20, ogres: 2, elites: 32, trolls: 18, crossbows: 18 },
    { goblins: 48, worgs: 26, ogres: 3, elites: 34, trolls: 18, crossbows: 20 },
  ],

  // 👑 MAP 9 — Final Showdown
  9: [
    { goblins: 40, worgs: 24, ogres: 2, elites: 30, trolls: 18, crossbows: 20 },
    { goblins: 46, worgs: 28, ogres: 3, elites: 32, trolls: 18, crossbows: 20 },
    { goblins: 52, worgs: 34, ogres: 4, elites: 34, trolls: 18, crossbows: 20 },
    { goblins: 58, worgs: 38, ogres: 5, elites: 36, trolls: 18, crossbows: 20 },
    { goblins: 64, worgs: 42, ogres: 6, elites: 38, trolls: 18, crossbows: 20 },
  ],
};

// ============================================================
// 🎯 WAVE STATE
// ============================================================
let currentWaveIndex = 0;
let waveActive = false;
let waveCleared = false;
let justStartedWave = false;

// Prevent wave skipping before first wave spawns
let firstWaveStarted = false;
window.firstWaveStarted = false;

window.betweenWaveTimerActive = false;

// ============================================================
// 🧩 BONUS OGRE SPAWN — 1 per 100 goblins killed
// ============================================================
let ogreMilestones = {};
for (let i = 1; i <= 20; i++) {
  ogreMilestones[i * 100] = false;
}

const FIRST_WAVE_DELAY = 5000;
const BETWEEN_WAVES_DELAY = 5000;
const VICTORY_DELAY = 5000;

let betweenWaveTimer = 0;

// We now use gameState.victoryPending as the single source of truth
if (typeof gameState.victoryPending !== "boolean") {
  gameState.victoryPending = false;
}

// ============================================================
// 🐣 SPAWN QUEUE (4-second spacing)
// ============================================================
const SPAWN_INTERVAL = 4000;
let spawnQueue = [];
let spawnTimer = 0;

// ============================================================
// 🔄 RESET WAVE SYSTEM (call on map load / new game)
// ============================================================
export function resetWaveSystem() {
  currentWaveIndex = 0;
  waveActive = false;
  waveCleared = false;
  justStartedWave = true;

  window.betweenWaveTimerActive = true;

  spawnQueue.length = 0;
  spawnTimer = 0;

  // Reset victory + start lock
  gameState.victoryPending = false;
  firstWaveStarted = false;
  window.firstWaveStarted = false;

  // Delay before first wave
  betweenWaveTimer = FIRST_WAVE_DELAY;

  console.log("🔄 Wave system reset.");
}

// ============================================================
// 🚀 START NEXT WAVE
// ============================================================
function startNextWave() {
  firstWaveStarted = true;
  window.firstWaveStarted = true;

  const mapId = gameState.progress.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  const wave = waves[currentWaveIndex];
  if (!wave) return;

  console.log(`🌊 Starting Wave ${currentWaveIndex + 1} of ${waves.length} (Map ${mapId})`);

  spawnQueue.length = 0;

  waveActive = true;
  waveCleared = false;
  justStartedWave = true;

  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();

  // Baseline goblin-driven loop
  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => {
      spawnGoblin();

      if (i < wave.worgs)      spawnWorg();
      if (i < wave.elites)     spawnElite();
      if (i < wave.trolls)     spawnTroll();
      if (i < wave.ogres)      spawnOgre();
      if (i < wave.crossbows)  spawnCrossbow();
    });
  }

  // Overflow Worgs
  for (let i = wave.goblins; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnWorg());
  }

  // Overflow Elites
  for (let i = wave.goblins; i < wave.elites; i++) {
    spawnQueue.push(() => spawnElite());
  }

  // Overflow Trolls
  for (let i = wave.goblins; i < wave.trolls; i++) {
    spawnQueue.push(() => spawnTroll());
  }

  // Overflow Crossbows
  for (let i = wave.goblins; i < wave.crossbows; i++) {
    spawnQueue.push(() => spawnCrossbow());
  }
}

// ============================================================
// 👁 CHECK ACTIVE ENEMIES
// ============================================================
function noEnemiesAlive() {
  const g = getGoblins();
  const w = getWorg();
  const o = getOgres();
  const e = getElites();
  const t = getTrolls();
  const x = getCrossbows();

  const aliveG = g.filter(e => e.alive).length;
  const aliveW = w.filter(e => e.alive).length;
  const aliveO = o.filter(e => e.alive).length;
  const aliveE = e.filter(e => e.alive).length;
  const aliveT = t.filter(e => e.alive).length;
  const aliveX = x.filter(e => e.alive).length;

  const totalAlive = aliveG + aliveW + aliveO + aliveE + aliveT + aliveX;
  const totalSpawnedSoFar = g.length + w.length + o.length + e.length + t.length + x.length;

  if (spawnQueue.length > 0) return false;
  if (totalSpawnedSoFar === 0) return false;

  return totalAlive === 0;
}

// ============================================================
// 🔁 UPDATE WAVE PROGRESSION
// ============================================================
async function updateWaveSystem(delta) {
  // Initial delay before first wave
  if (!firstWaveStarted) {
    betweenWaveTimer -= delta;

    if (betweenWaveTimer <= 0) {
      firstWaveStarted = true;
      startNextWave();
    }

    return;
  }

  if (justStartedWave) {
    justStartedWave = false;
    return;
  }

  // Handle spawn queue
  spawnTimer -= delta;
  if (spawnQueue.length > 0 && spawnTimer <= 0) {
    const spawnFn = spawnQueue.shift();
    spawnFn();
    spawnTimer = SPAWN_INTERVAL;
  }

  if (gameState.victoryPending) return;

  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  // Active wave
  if (waveActive) {
    if (!noEnemiesAlive()) return;

    if (!waveCleared) {
      waveCleared = true;
      waveActive = false;

      const waveNumber = currentWaveIndex + 1;

      if (waveNumber === 1) {
        await triggerEndOfWave1Story(mapId);
      }
      if (waveNumber === 5) {
        await triggerEndOfWave5Story(mapId);
      }

      betweenWaveTimer = BETWEEN_WAVES_DELAY;

      console.log(`✨ Wave ${waveNumber} cleared (Map ${mapId})`);
      return;
    }
  }

  // Between waves
  if (betweenWaveTimer > 0) {
    window.betweenWaveTimerActive = true;
    betweenWaveTimer -= delta;
    return;
  }

  // Timer finished → clear flag
  window.betweenWaveTimerActive = false;

  // More waves?
  if (currentWaveIndex + 1 < waves.length) {
    currentWaveIndex++;
    startNextWave();
    return;
  }

  // Final wave → schedule victory
  console.log(`🏆 All waves complete on map ${mapId}. Scheduling victory…`);

  gameState.victoryPending = true;

  const nextMap = mapId + 1;

  if (nextMap <= 9) {
    unlockMap(nextMap);
    saveProfiles();
    console.log(`🔓 Map ${nextMap} unlocked!`);
  }

  setTimeout(() => {
    stopGameplay("victory");

    if (mapId === 9) {
      import("./credits.js").then(mod => {
        mod.showCredits();
      });
    }
  }, VICTORY_DELAY);
}

// ------------------------------------------------------------
// 🎥 LOCAL CAMERA STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

let cameraX = 0;
let cameraY = 0;

// Cache expensive DOM queries
let cachedCanvasRect = null;
let rectCacheTimer = 0;
const RECT_CACHE_DURATION = 1000;

// Throttled HUD updates
let hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 100;

// ------------------------------------------------------------
// 🏆 VICTORY COUNTER
// ------------------------------------------------------------
export let goblinsDefeated = 0;

export function incrementGoblinDefeated() {
  goblinsDefeated++;

  if (ogreMilestones[goblinsDefeated] === false) {
    ogreMilestones[goblinsDefeated] = true;
    console.log("👹 BONUS OGRE SPAWNED at", goblinsDefeated, "kills!");
    spawnOgre();
  }
}

// ------------------------------------------------------------
// 🧭 MAP-AWARE PLAYER SPAWN (Maps 1–9)
// ------------------------------------------------------------
function applyMapSpawn() {
  if (!gameState.player) return;

  const p = gameState.player;
  const mapId = gameState.progress?.currentMap || 1;

  switch (mapId) {
    case 1:
      p.pos = { x: 1000, y: 500 };
      break;
    case 2:
      p.pos = { x: 250, y: 1650 };
      break;
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      p.pos = { x: 300, y: 300 };
      break;
    default:
      p.pos = { x: 1000, y: 500 };
      break;
  }
}

// ============================================================
// 🌷 INIT — called once when entering the Game screen
// ============================================================
export async function initGame(mode = "new") {
  gameState.echoPowerActive = false;

  if (!gameState.exploration) {
    gameState.exploration = { found: 0, total: 0, bonusGiven: false };
  } else {
    gameState.exploration.found = 0;
    gameState.exploration.total = 0;
    gameState.exploration.bonusGiven = false;
  }

  const icon = document.getElementById("hud-crystals-circle");
  if (icon) icon.classList.remove("echo-power-flash");

  // Canvas & context
  canvas = document.getElementById("game-canvas");
  if (!canvas) throw new Error("game.js: #game-canvas not found in DOM");
  ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("game.js: 2D context not available");

  cachedCanvasRect = canvas.getBoundingClientRect();
  rectCacheTimer = 0;

  // Map & path
  await loadMap();

  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  const echoPoints = extractCrystalEchoes();
  gameState.exploration.total = echoPoints.length;
  gameState.exploration.found = 0;

  initCrystalEchoes({ crystalEchoes: echoPoints });

  // Subsystems
  clearLoot();
  initEnemies();
  await initWorg(pathPoints);
  await initElites();
  await initTrolls(pathPoints);
  await initCrossbows();
  initTowers();
  initOgres();
  initProjectiles();
  await loadLootImages();

  // Player
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

  // Pegasus + healing + drops
  await loadPegasus();
  initPegasus(ctx);

  // Wave state (only on new/retry)
  if (mode !== "load") {
    currentWaveIndex = 0;
    waveActive = false;
    waveCleared = false;
    gameState.victoryPending = false;
    spawnQueue = [];
    spawnTimer = 0;
    betweenWaveTimer = FIRST_WAVE_DELAY;
    firstWaveStarted = false;
    window.firstWaveStarted = false;
  }

  console.log(`🌸 game.js — Initialization complete (mode: ${mode}).`);
}

// ============================================================
// 🔁 UPDATE — synchronized world logic (OPTIMIZED)
// ============================================================
export function updateGame(delta) {
  if (gameState.paused) return;

  delta = Math.min(delta, 100);

  updateEnemies(delta);
  updateWorg(delta);
  updateCrossbows(delta);
  updateElites(delta);
  updateTrolls(delta);
  updateTowers(delta);
  updateOgres(delta);
  updateProjectiles(delta);
  updatePlayer(delta);
  updateFloatingText(delta);
  updatePegasus(delta);
  updateLoot(delta);
  updateWaveSystem(delta);

  // Throttled HUD
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

  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));

  // Cache rect occasionally
  rectCacheTimer += delta;
  if (rectCacheTimer >= RECT_CACHE_DURATION || !cachedCanvasRect) {
    rectCacheTimer = 0;
    cachedCanvasRect = canvas.getBoundingClientRect();
  }

  window.cameraX = cameraX;
  window.cameraY = cameraY;
  window.canvasScaleX = canvas.width / cachedCanvasRect.width;
  window.canvasScaleY = canvas.height / cachedCanvasRect.height;

  checkVictoryDefeat();
}

// ============================================================
// 🎨 RENDER — ordered by layer depth + camera offset
// ============================================================
export function renderGame() {
  if (!ctx || !canvas) return;

  // Ground
  drawMapLayered(ctx, "ground", cameraX, cameraY, canvas.width, canvas.height);

  // Entities
  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  updateCrystalEchoes(ctx, gameState.player);

  drawTowers(ctx);
  drawWorg(ctx);
  drawCrossbows(ctx);
  drawEnemies(ctx);
  drawElites(ctx);
  drawTrolls(ctx);
  drawOgres(ctx);
  drawPlayer(ctx);

  drawProjectiles(ctx);
  drawFloatingText(ctx);
  drawLoot(ctx);
  renderSparkleBursts(ctx, 16);

  ctx.restore();

  // Foreground
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);

  // Pegasus
  try {
    if (typeof drawPegasusFrame === "function") {
      drawPegasusFrame(ctx);
    }
  } catch {
    // non-fatal
  }
}

// ============================================================
// 🧠 VICTORY / DEFEAT CHECK
// ============================================================
function checkVictoryDefeat() {
  const p = gameState.player;
  if (!p) return;

  const hp = p.hp ?? 100;
  const lives = p.lives ?? 3;

  if (hp <= 0) {
    p.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("defeat"), 1500);
    return;
  }

  if (lives <= 0) {
    p.dead = true;
    gameState.paused = true;
    setTimeout(() => stopGameplay("lives"), 1500);
    return;
  }

  // Victory is handled entirely in the wave system now
}

// ============================================================
// ♻️ RESET COMBAT STATE — used by Try Again, Continue, New Map
// ============================================================
export function resetCombatState() {
  console.log("♻️ Resetting combat state...");

  goblinsDefeated = 0;
  gameState.victoryPending = false;

  for (let key in ogreMilestones) {
    ogreMilestones[key] = false;
  }
  gameState.ogreSpawned = false;

  gameState.worgSpawns = 0;
  gameState.ogreTriggers = {
    25: false,
    50: false,
    75: false,
    100: false,
  };

  const p = gameState.player;
  if (p) {
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;
    p.facing = "right";
  }

  if (gameState.bravery) {
    gameState.bravery.current = 0;
    gameState.bravery.charged = false;
    gameState.bravery.draining = false;
  }
  updateBraveryBar?.();

  gameState.echoPowerActive = false;

  const icon = document.getElementById("hud-crystals-circle");
  if (icon) icon.classList.remove("echo-power-flash");

  if (window.__enemies) window.__enemies.length = 0;
  clearOgres();
  clearLoot();
  clearElites();
  clearCrossbows();

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

  console.log("🎮 Player revived — soft reset (multi-map).");
}

// Dev ogre preload
import("./ogre.js").then(() => console.log("👹 Ogre dev commands ready."));

// Resize → invalidate rect cache
window.addEventListener("resize", () => {
  cachedCanvasRect = null;
  rectCacheTimer = RECT_CACHE_DURATION;
});

// Dev hooks
window.spawnWorg = spawnWorg;

// ============================================================
// 🛠️ DEV TOOL — Instant Victory Trigger
// ============================================================
window.forceMapVictory = function () {
  console.log("⚡ DEV: Forcing Victory!");

  try {
    const currentMap = gameState.progress?.currentMap ?? 1;

    gameState.victoryPending = true;

    if (window.getOgres) {
      const ogres = window.getOgres();
      for (const o of ogres) {
        o.alive = false;
        o.hp = 0;
      }
    }

    if (!gameState.stats) gameState.stats = {};
    if (currentMap === 1) {
      gameState.stats.goblinsDefeated = 50;
    } else if (currentMap === 2) {
      gameState.stats.goblinsDefeated = 100;
    } else {
      gameState.stats.goblinsDefeated = 9999;
    }

    setTimeout(() => {
      const mapId = gameState.progress.currentMap ?? 1;

      unlockMap(mapId + 1);
      saveProfiles();

      stopGameplay("victory");
    }, VICTORY_DELAY);
  } catch (err) {
    console.warn("⚠️ DEV Victory failed:", err);
  }
};

export { applyMapSpawn };

// ============================================================
// 🌟 END OF FILE
// ============================================================

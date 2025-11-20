// ============================================================
// 🌸 game.js — Olivia's World: Crystal Keep (OPTIMIZED + Multi-Map Spawns)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player + Goblins + Spires rendered between layers
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
//    - Global spawn queue with 4s spacing per goblin
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
  extractCrystalEchoes,
} from "./map.js";

// ------------------------------------------------------------
// 👹 ENEMIES (Goblin / Troll / Ogre / Worg / Elite / Crossbow)
// ------------------------------------------------------------

import {
  initGoblins,
  updateGoblins,
  drawGoblins,
  spawnGoblin,
  getGoblins,
  setGoblinPath,
} from "./goblin.js";

import {
  initOgres,
  updateOgres,
  drawOgres,
  clearOgres,
  getOgres,
  spawnOgre,
} from "./ogre.js";

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
// 🏹 SPIRES & PROJECTILES
// ------------------------------------------------------------

import {
  initSpires,
  updateSpires,
  drawSpires,
} from "./spires.js";

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

// ------------------------------------------------------------
// Difficulty
// ------------------------------------------------------------

import { getDifficultyHpMultiplier } from "../core/settings.js";

function scaleEnemyHp(enemy) {
  const mult = getDifficultyHpMultiplier();
  enemy.hp = Math.round(enemy.hp * mult);
  enemy.maxHp = Math.round(enemy.maxHp * mult);
}
import { updateArrows, drawArrows } from "./combat/arrow.js";

// ============================================================
// 🌊 WAVE CONFIGS
// ============================================================

export const waveConfigs = {
  // 🌿 MAP 1 — Beginner Onboarding
  1: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // 🌲 MAP 2 — Early Mixed Units
  2: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // 🏞 MAP 3 — Early-Mid Mix
  3: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // ❄ MAP 4 — Worg Pressure
  4: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // 🔥 MAP 5 — Mid Game Sustain
  5: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // 🜂 MAP 6 — Chaotic Alternation
  6: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // ⚔ MAP 7 — Elite-Heavy Spike
  7: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // ⚡ MAP 8 — Very Late Scaling
  8: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // 👑 MAP 9 — Final Showdown
  9: [
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1,  worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 1, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],
};

// ============================================================
// 🏆 VICTORY MESSAGES — Per Map
// ============================================================

export const VICTORY_MESSAGES = {
  1: "✨ Map One Complete! The goblins scatter before your growing power!",
  2: "🌿 Map Two Cleared! The Hollow Woods fall silent once more.",
  3: "🔥 Map Three Victorious! The Ember Plains glow in your honour.",
  4: "🌙 Map Four Defeated! Shadows tremble at your presence.",
  5: "❄️ Map Five Purified! Even the frost bows to the Princess.",
  6: "⚡ Map Six Triumphed! The Arcane Crystals resonate with power.",
  7: "💎 Map Seven Won! You stand unmatched in the Crystal Isles!",
  8: "🌈 Map Eight Cleared! Magic ripples through the realm!",
  9: "👑 Final Map Conquered! The Crystal Keep is safe once more!"
};


// ============================================================
// 🏆 VICTORY SUBTITLES — Per Map
// ============================================================
export const VICTORY_SUBTITLES = {
  1: "Peace returns to the training fields.",
  2: "The Hollow Woods breathe a calm sigh.",
  3: "The Ember Plains cool under your light.",
  4: "Shadows retreat from your presence.",
  5: "The Frosted Vale grows quiet once more.",
  6: "Arcane storms settle in your wake.",
  7: "Crystal Isles shimmer with renewed hope.",
  8: "Magic ripples across the realm in harmony.",
  9: "The Crystal Keep stands protected — your legend complete."
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
const VICTORY_DELAY = 50;

let betweenWaveTimer = 0;

// Single source of truth for victory pending
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

  gameState.victoryPending = false;
  // Ensure HUD/meta wave counters start at wave 1 for new runs
  gameState.wave = 1;
  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  gameState.totalWaves = Array.isArray(waves) ? waves.length : 0;
  firstWaveStarted = false;
  window.firstWaveStarted = false;

  betweenWaveTimer = FIRST_WAVE_DELAY;


}

export function getWaveSnapshotState() {
  return {
    currentWaveIndex,
    waveActive,
    waveCleared,
    firstWaveStarted,
    betweenWaveTimer,
    betweenWaveTimerActive: window.betweenWaveTimerActive === true,
  };
}

export function restoreWaveFromSnapshot(meta, snapshot) {
  if (!meta) return;

  // Restore correct wave index (1-based → 0-based)
  if (typeof meta.wave === "number") {
    currentWaveIndex = Math.max(0, meta.wave - 1);
    gameState.wave = meta.wave;
  }

  // Ensure legacy window-access sees correct index
  window.currentWaveIndex = currentWaveIndex;

  const waveState = meta.waveState || {};
  const hasSavedEnemies = snapshot
    ? [
        snapshot.goblins,
        snapshot.worgs,
        snapshot.elites,
        snapshot.ogres,
        snapshot.trolls,
        snapshot.crossbows,
      ].some(arr => Array.isArray(arr) && arr.length > 0)
    : false;

  const resolvedFirstWave =
    typeof waveState.firstWaveStarted === "boolean"
      ? waveState.firstWaveStarted
      : (meta.firstWaveStarted ??
        (hasSavedEnemies || false));

  firstWaveStarted = !!resolvedFirstWave;
  window.firstWaveStarted = firstWaveStarted;

  waveActive =
    typeof waveState.waveActive === "boolean"
      ? waveState.waveActive
      : hasSavedEnemies;
  waveCleared =
    typeof waveState.waveCleared === "boolean"
      ? waveState.waveCleared
      : (!waveActive && firstWaveStarted);
  justStartedWave = false;

  // Clear active spawn sequence (snapshot stores enemies, not timers)
  spawnQueue.length = 0;
  spawnTimer = 0;

  let restoredTimer = 0;
  if (!waveActive) {
    if (typeof waveState.betweenWaveTimer === "number") {
      restoredTimer = Math.max(0, waveState.betweenWaveTimer);
    } else if (!firstWaveStarted) {
      restoredTimer = FIRST_WAVE_DELAY;
    }
  }

  betweenWaveTimer = waveActive ? 0 : restoredTimer;

  let restoredTimerActive =
    waveActive
      ? false
      : (typeof waveState.betweenWaveTimerActive === "boolean"
          ? waveState.betweenWaveTimerActive
          : betweenWaveTimer > 0);

  if (!waveActive && betweenWaveTimer <= 0) {
    if (!firstWaveStarted) {
      betweenWaveTimer = FIRST_WAVE_DELAY;
      restoredTimerActive = true;
    } else {
      restoredTimerActive = false;
    }
  }

  window.betweenWaveTimerActive = restoredTimerActive;

  // No victory pending after restore
  gameState.victoryPending = false;
}

// ============================================================
// 🚀 START NEXT WAVE
// ============================================================

function startNextWave() {
  firstWaveStarted = true;
  window.firstWaveStarted = true;
  window.betweenWaveTimerActive = false;
  betweenWaveTimer = 0;

  const mapId = gameState.progress.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  const wave = waves[currentWaveIndex];
  if (!wave) return;

  // Reset queue
  spawnQueue.length = 0;

  waveActive = true;
  waveCleared = false;
  justStartedWave = true;

  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();

  const hpMult = getDifficultyHpMultiplier();

  // 🔧 Small helper to apply difficulty on any enemy returned by a spawn function
  const spawnScaled = (fn) => {
    const enemy = fn();
    if (enemy) {
      enemy.hp = Math.round(enemy.hp * hpMult);
      enemy.maxHp = Math.round(enemy.maxHp * hpMult);
    }
    return enemy;
  };

  // ============================================================
  // 🐉 BASELINE LOOP (Driven by goblin count)
  // ============================================================

  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => {
      // GOBLIN
      spawnScaled(spawnGoblin);

      // WORG
      if (i < wave.worgs) spawnScaled(spawnWorg);

      // ELITE
      if (i < wave.elites) spawnScaled(spawnElite);

      // TROLL
      if (i < wave.trolls) spawnScaled(spawnTroll);

      // OGRE (spawnOgre already scales by difficulty; disable here to avoid double-scaling)
      if (i < wave.ogres) spawnScaled(() => spawnOgre({ skipDifficultyScaling: true }));

      // CROSSBOW
      if (i < wave.crossbows) spawnScaled(spawnCrossbow);
    });
  }

  // ============================================================
  // 🐺 OVERFLOW Worgs
  // ============================================================

  for (let i = wave.goblins; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnScaled(spawnWorg));
  }

  // ============================================================
  // 🛡 OVERFLOW Elites
  // ============================================================

  for (let i = wave.goblins; i < wave.elites; i++) {
    spawnQueue.push(() => spawnScaled(spawnElite));
  }

  // ============================================================
  // 👹 OVERFLOW Trolls
  // ============================================================

  for (let i = wave.goblins; i < wave.trolls; i++) {
    spawnQueue.push(() => spawnScaled(spawnTroll));
  }

  // ============================================================
  // 🎯 OVERFLOW Crossbow Orcs
  // ============================================================

  for (let i = wave.goblins; i < wave.crossbows; i++) {
    spawnQueue.push(() => spawnScaled(spawnCrossbow));
  }

  // NOTE: Ogres do not have overflow because wave.ogres
  // is always ≤ goblins in your wave configs.
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
  gameState.victoryPending = true;

  // ⭐ Correctly clamp next map to 1–9
  const nextMap = Math.min(mapId + 1, 9);

  // ⭐ Clamp persisted progress so it never exceeds map 9
  if (gameState.progress?.currentMap > 9) {
      gameState.progress.currentMap = 9;
  }
  if (gameState.profile?.progress?.currentMap > 9) {
      gameState.profile.progress.currentMap = 9;
  }

  // ⭐ Unlock next map (only if map < 9)
  if (mapId < 9) {
      unlockMap(nextMap);
      saveProfiles();
  }

  setTimeout(() => {
      stopGameplay("victory");

      // Map 9 → Credits (handled for players who let the screen sit)
      if (mapId === 9) {
          setTimeout(() => {
              import("./../core/credits.js")
                .then(mod => mod.showCredits())
                .catch(err => console.warn("Credits display failed:", err));
          }, 300);
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
  // Always unpause on load or new
  gameState.paused = false;
  gameState.isPaused = false;
  gameState.echoPowerActive = false;

  // Exploration reset ONLY for "new"
  if (mode === "new") {
    if (!gameState.exploration) {
      gameState.exploration = { found: 0, total: 0, bonusGiven: false };
    } else {
      gameState.exploration.found = 0;
      gameState.exploration.total = 0;
      gameState.exploration.bonusGiven = false;
    }

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

  const { width: mapW, height: mapH } = getMapPixelSize();
  gameState.mapWidth = mapW;
  gameState.mapHeight = mapH;

  const pathPoints = extractPathFromMap();
  setGoblinPath(pathPoints);

  const echoPoints = extractCrystalEchoes();

  // Only reset exploration count on NEW
  if (mode === "new") {
    gameState.exploration.total = echoPoints.length;
    gameState.exploration.found = 0;
  }

  initCrystalEchoes({ crystalEchoes: echoPoints });

  // Subsystems
  clearLoot();
  await loadLootImages();
  initGoblins();
  await initWorg(pathPoints);
  await initElites();
  await initTrolls(pathPoints);
  await initCrossbows();
  initSpires();
  initOgres();
  initProjectiles();

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

  // NEW: Only apply map spawn on NEW game
  if (mode === "new") {
    applyMapSpawn();
  }

  initPlayerController(canvas);
  initUI();

  // Pegasus + healing + drops
  await loadPegasus();
  initPegasus(ctx);

  // Wave state (only NEW/RETRY)
  if (mode !== "load") {
    resetWaveSystem();
  }
}


// ============================================================
// 🔁 UPDATE — synchronized world logic (OPTIMIZED)
// ============================================================

export function updateGame(delta) {
  if (gameState.paused) return;

  delta = Math.min(delta, 100);

  updateGoblins(delta);
  updateWorg(delta);
  updateCrossbows(delta);
  updateElites(delta);
  updateTrolls(delta);
  updateSpires(delta);
  updateOgres(delta);
  updateProjectiles(delta);
  updateArrows(delta);
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

  drawSpires(ctx);
  drawWorg(ctx);
  drawCrossbows(ctx);
  drawGoblins(ctx);
  drawElites(ctx);
  drawTrolls(ctx);
  drawOgres(ctx);
  drawPlayer(ctx);

  drawProjectiles(ctx);
  drawArrows(ctx);
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
// ♻️ RESET COMBAT STATE — Try Again / Continue / New Map
// ============================================================

export function resetCombatState() {
  goblinsDefeated = 0;
  gameState.victoryPending = false;

  gameState.profile.currencies.gold = 0;

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

  clearOgres();
  clearLoot();
  clearElites();
  clearCrossbows();
  clearTrolls();

  initGoblins();
  initSpires();
  initProjectiles();

  updateHUD();
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

  gameState.profile.currencies.gold = 0;

  if (typeof window.__playerControllerReset === "function") {
    window.__playerControllerReset();
  }

  updateHUD();
  hudUpdateTimer = 0;
}

// Resize → invalidate rect cache (production-safe)
window.addEventListener("resize", () => {
  cachedCanvasRect = null;
  rectCacheTimer = RECT_CACHE_DURATION;
});

export { applyMapSpawn };

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🛠️ DEBUG TOOL — Instant Victory (temporary, safe to remove)
// ============================================================
window.debugVictory = function () {
  try {
    console.log("⚡ DEBUG: Forcing immediate victory…");
    stopGameplay("victory");
  } catch (err) {
    console.warn("⚠️ debugVictory failed:", err);
  }
};



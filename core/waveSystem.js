// ============================================================
// waveSystem.js - Extracted wave progression logic
// ------------------------------------------------------------
// Handles:
//   - Wave configs and victory messaging
//   - Spawn queue management + difficulty scaling
//   - Autosave hooks and end-of-wave story beats
//   - Victory unlock flow and runtime snapshot helpers
// ============================================================

import { gameState, unlockMap, saveProfiles } from "../utils/gameState.js";
import { stopGameplay } from "../main.js";
import { triggerEndOfWave1Story, triggerEndOfWave5Story } from "./story.js";
import { getDifficultyHpMultiplier } from "../screenManagement/settings.js";
import { saveToSlot } from "../save/saveSystem.js";
import { updateHUD } from "../screenManagement/ui.js";

import { spawnGoblin, getGoblins } from "../entities/goblin.js";
import { spawnWorg, getWorg } from "../entities/worg.js";
import { spawnElite, getElites } from "../entities/elite.js";
import { spawnTroll, getTrolls } from "../entities/troll.js";
import { spawnOgre, getOgres } from "../entities/ogre.js";
import { spawnCrossbow, getCrossbows } from "../entities/crossbow.js";
import { spawnSeraphineBoss, getSeraphines } from "../entities/seraphine.js";
import { Events, EVENT_NAMES as E } from "./eventEngine.js";

// ============================================================
// WAVE CONFIGS
// ============================================================

// ============================================================
// waveConfigs - Olivia's World: Crystal Keep
// ------------------------------------------------------------
// Fully rebalanced 1-9 campaign waves
// - Map 1 gentle & forgiving
// - Map 2 introduces Worgs mid-way
// - Map 3 patterned mixes + elite surprises
// - Map 4 escalates everything
// - Map 5 introduces Trolls
// - Map 6 introduces Ogres
// - Map 7 introduces Crossbows (1-2 MAX)
// - Map 8 Penultimate chaos
// - Map 9 Final all-out showdown
// All enemy counts doubled from baseline design
// ============================================================

export const waveConfigs = {

  // ============================================================
  // MAP 1 - Gentle Onboarding
  // ============================================================
  1: [
    { goblins: 5, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 5, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
  ],

  // ============================================================
  // MAP 2 - Early Worg Pressure (Introduced Mid-Map)
  // ============================================================
  2: [
    { goblins: 18, worgs: 0, elites: 0, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 22, worgs: 2, elites: 0, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 24, worgs: 3, elites: 1, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 26, worgs: 4, elites: 1, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 30, worgs: 5, elites: 1, trolls: 0, ogres: 0, crossbows: 1 },
  ],

  // ============================================================
  // MAP 3 - Pattern Mixing + Elite Ambushes
  // ============================================================
  3: [
    { goblins: 5, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 5, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { boss: "seraphine", phase: 1, goblins: 6 }
  ],

  // ============================================================
  // MAP 4 - Everything Tightens
  // ============================================================
  4: [
    { goblins: 4, worgs: 0, elites: 0, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 28, worgs: 6, elites: 2, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 32, worgs: 7, elites: 2, trolls: 0, ogres: 0, crossbows: 0 },
    { goblins: 34, worgs: 7, elites: 3, trolls: 0, ogres: 0, crossbows: 1 },
    { goblins: 38, worgs: 8, elites: 3, trolls: 0, ogres: 0, crossbows: 1 },
  ],

  // ============================================================
  // MAP 5 - Trolls Arrive (High HP Disruptors)
  // ============================================================
  5: [
    { goblins: 28, worgs: 6, elites: 1, trolls: 1, ogres: 0, crossbows: 0 },
    { goblins: 30, worgs: 7, elites: 1, trolls: 1, ogres: 0, crossbows: 0 },
    { goblins: 32, worgs: 7, elites: 2, trolls: 2, ogres: 0, crossbows: 0 },
    { goblins: 34, worgs: 8, elites: 2, trolls: 2, ogres: 0, crossbows: 1 },
    { goblins: 38, worgs: 9, elites: 3, trolls: 2, ogres: 0, crossbows: 1 },
  ],

  // ============================================================
  // MAP 6 - Ogre Introduction (Slow, Heavy Hitters)
  // ============================================================
  6: [
    { goblins: 5, worgs: 0, ogres: 0, elites: 0, trolls: 0, crossbows: 0 },
    { goblins: 14, worgs: 3, ogres: 1, elites: 1, trolls: 0, crossbows: 0 },
    { boss: "seraphine", phase: 2, goblins: 10, worgs: 4, elites: 2 }
  ],

  // ============================================================
  // MAP 7 - Crossbows Introduced (1-2 MAX)
  // ============================================================
  7: [
    { goblins: 32, worgs: 8, elites: 2, trolls: 2, ogres: 1, crossbows: 1 },
    { goblins: 34, worgs: 8, elites: 2, trolls: 3, ogres: 1, crossbows: 1 },
    { goblins: 36, worgs: 9, elites: 3, trolls: 3, ogres: 1, crossbows: 1 },
    { goblins: 38, worgs: 9, elites: 3, trolls: 3, ogres: 2, crossbows: 2 },
    { goblins: 42, worgs: 10, elites: 4, trolls: 3, ogres: 2, crossbows: 2 },
  ],

  // ============================================================
  // MAP 8 - Penultimate Chaos
  // ============================================================
  8: [
    { goblins: 36, worgs: 10, elites: 3, trolls: 3, ogres: 2, crossbows: 1 },
    { goblins: 40, worgs: 10, elites: 3, trolls: 4, ogres: 2, crossbows: 1 },
    { goblins: 42, worgs: 11, elites: 4, trolls: 4, ogres: 2, crossbows: 2 },
    { goblins: 44, worgs: 11, elites: 4, trolls: 4, ogres: 3, crossbows: 2 },
    { goblins: 48, worgs: 12, elites: 5, trolls: 4, ogres: 3, crossbows: 2 },
  ],

  // ============================================================
  // MAP 9 - Ultimate Final Showdown
  // ============================================================
  9: [
    { goblins: 40, worgs: 12, elites: 3, trolls: 3, ogres: 2, crossbows: 1 },
    { goblins: 44, worgs: 12, elites: 4, trolls: 4, ogres: 2, crossbows: 1 },
    { goblins: 48, worgs: 13, elites: 4, trolls: 4, ogres: 3, crossbows: 1 },
    { goblins: 52, worgs: 14, elites: 5, trolls: 5, ogres: 3, crossbows: 2 },
    { boss: "seraphine", phase: 3, goblins: 56, worgs: 15, elites: 6, trolls: 6, ogres: 4, crossbows: 2 }, // **BOSS WAVE**
  ],
};


// ============================================================
// VICTORY MESSAGES / SUBTITLES
// ============================================================

export const VICTORY_MESSAGES = {
  1: "Map One Complete! The goblins scatter before your growing power!",
  2: "Map Two Cleared! The Hollow Woods fall silent once more.",
  3: "Map Three Victorious! The Ember Plains glow in your honour.",
  4: "Map Four Defeated! Shadows tremble at your presence.",
  5: "Map Five Purified! Even the frost bows to the Princess.",
  6: "Map Six Triumphed! The Arcane Crystals resonate with power.",
  7: "Map Seven Won! You stand unmatched in the Crystal Isles!",
  8: "Map Eight Cleared! Magic ripples through the realm!",
  9: "Final Map Conquered! The Crystal Keep is safe once more!"
};

export const VICTORY_SUBTITLES = {
  1: "Peace returns to the training fields.",
  2: "The Hollow Woods breathe a calm sigh.",
  3: "The Ember Plains cool under your light.",
  4: "Shadows retreat from your presence.",
  5: "The Frosted Vale grows quiet once more.",
  6: "Arcane storms settle in your wake.",
  7: "Crystal Isles shimmer with renewed hope.",
  8: "Magic ripples across the realm in harmony.",
  9: "The Crystal Keep stands protected - your legend complete."
};

// ============================================================
// WAVE STATE
// ============================================================

let currentWaveIndex = 0;
let waveActive = false;
let waveCleared = false;
let justStartedWave = false;
let autosaveDoneForWave = false;
let waveTransitionInProgress = false;

let firstWaveStarted = false;
window.firstWaveStarted = false;

window.betweenWaveTimerActive = false;

// Bonus ogre spawn tracking
export let goblinsDefeated = 0;
const ogreMilestones = {};
for (let i = 1; i <= 20; i++) {
  ogreMilestones[i * 100] = false;
}

const FIRST_WAVE_DELAY = 5000;
const BETWEEN_WAVES_DELAY = 5000;
const VICTORY_DELAY = 50;

let betweenWaveTimer = 0;

if (typeof gameState.victoryPending !== "boolean") {
  gameState.victoryPending = false;
}

const SPAWN_INTERVAL = 4000;
let spawnQueue = [];
let spawnTimer = 0;

// ============================================================
// RESET / SNAPSHOT HELPERS
// ============================================================

export function resetWaveSystem() {
  currentWaveIndex = 0;
  waveActive = false;
  waveCleared = false;
  justStartedWave = true;
  autosaveDoneForWave = false;
  waveTransitionInProgress = false;

  window.betweenWaveTimerActive = true;

  spawnQueue.length = 0;
  spawnTimer = 0;

  gameState.victoryPending = false;
  gameState.wave = 1;
  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  gameState.totalWaves = Array.isArray(waves) ? waves.length : 0;
  firstWaveStarted = false;
  window.firstWaveStarted = false;

  if (mapId === 1) {
    betweenWaveTimer = 30000; // 30 seconds intro delay for Map 1
  } else {
    betweenWaveTimer = 5000;  // default 5 seconds for other maps
  }
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

  waveTransitionInProgress = false;

  if (typeof meta.wave === "number") {
    currentWaveIndex = Math.max(0, meta.wave - 1);
    gameState.wave = meta.wave;
  }

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
        snapshot.seraphines,
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

  gameState.victoryPending = false;
}

// ============================================================
// WAVE CONTROL
// ============================================================

function startNextWave() {
  firstWaveStarted = true;
  window.firstWaveStarted = true;
  window.betweenWaveTimerActive = false;
  betweenWaveTimer = 0;

  autosaveDoneForWave = false;

  const mapId = gameState.progress?.currentMap ?? 1;
  const waves = waveConfigs[mapId];
  if (!waves) return;

  const wave = waves[currentWaveIndex];
  if (!wave) return;

  

  spawnQueue.length = 0;

  waveActive = true;
  waveCleared = false;
  justStartedWave = true;

  gameState.wave = currentWaveIndex + 1;
  gameState.totalWaves = waves.length;
  updateHUD();
  Events.emit(E.waveStart, { wave: gameState.wave });

  const hpMult = getDifficultyHpMultiplier();
  const spawnScaled = (fn) => {
    const enemy = fn();
    if (enemy) {
      enemy.hp = Math.round(enemy.hp * hpMult);
      enemy.maxHp = Math.round(enemy.maxHp * hpMult);
    }
    return enemy;
  };
  const spawnAndEmit = (type, fn) => {
    const enemy = spawnScaled(fn);
    if (enemy) {
      Events.emit(E.enemySpawn, { type, wave: gameState.wave });
    }
    return enemy;
  };

  if (wave.boss === "seraphine") {

  // spawn boss immediately
  spawnSeraphineBoss(wave.phase || 1);

  // goblin escorts
  const escorts = wave.goblins || 0;
  for (let i = 0; i < escorts; i++) {
    spawnQueue.push(() => spawnAndEmit("goblin", spawnGoblin));
  }

  return; // IMPORTANT so normal enemies don't spawn
}

  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => {
      spawnAndEmit("goblin", spawnGoblin);

      if (i < wave.worgs) spawnAndEmit("worg", spawnWorg);
      if (i < wave.elites) spawnAndEmit("elite", spawnElite);
      if (i < wave.trolls) spawnAndEmit("troll", spawnTroll);
      if (i < wave.ogres) {
        spawnAndEmit("ogre", () => spawnOgre({ skipDifficultyScaling: true }));
      }
      if (i < wave.crossbows) spawnAndEmit("crossbow", spawnCrossbow);
    });
  }

  for (let i = wave.goblins; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnAndEmit("worg", spawnWorg));
  }

  for (let i = wave.goblins; i < wave.elites; i++) {
    spawnQueue.push(() => spawnAndEmit("elite", spawnElite));
  }

  for (let i = wave.goblins; i < wave.trolls; i++) {
    spawnQueue.push(() => spawnAndEmit("troll", spawnTroll));
  }

  for (let i = wave.goblins; i < wave.crossbows; i++) {
    spawnQueue.push(() => spawnAndEmit("crossbow", spawnCrossbow));
  }
}

function noEnemiesAlive() {
  const g = getGoblins();
  const w = getWorg();
  const o = getOgres();
  const e = getElites();
  const t = getTrolls();
  const x = getCrossbows();
  const s = getSeraphines();

  const aliveG = g.filter(e => e.alive).length;
  const aliveW = w.filter(e => e.alive).length;
  const aliveO = o.filter(e => e.alive).length;
  const aliveE = e.filter(e => e.alive).length;
  const aliveT = t.filter(e => e.alive).length;
  const aliveX = x.filter(e => e.alive).length;
  const aliveS = s.filter(e => e.alive).length;

  const totalAlive = aliveG + aliveW + aliveO + aliveE + aliveT + aliveX + aliveS;
  const totalSpawnedSoFar = g.length + w.length + o.length + e.length + t.length + x.length + s.length;

  if (spawnQueue.length > 0) return false;
  if (totalSpawnedSoFar === 0) return false;

  return totalAlive === 0;
}

export async function updateWaveSystem(delta) {
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

  if (waveTransitionInProgress) {
    return;
  }

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

  if (waveActive) {
    if (!noEnemiesAlive()) return;

    if (!waveCleared) {
      waveCleared = true;
      waveActive = false;
      waveTransitionInProgress = true;

      const waveNumber = currentWaveIndex + 1;

      handleWaveCleared(waveNumber, mapId);
      return;
    }
  }

  if (betweenWaveTimer > 0) {
    window.betweenWaveTimerActive = true;
    betweenWaveTimer -= delta;
    return;
  }

  window.betweenWaveTimerActive = false;

  if (currentWaveIndex + 1 < waves.length) {
    currentWaveIndex++;
    startNextWave();
    return;
  }

  gameState.victoryPending = true;

  const nextMap = Math.min(mapId + 1, 9);

  if (gameState.progress?.currentMap > 9) {
    gameState.progress.currentMap = 9;
  }
  if (gameState.profile?.progress?.currentMap > 9) {
    gameState.profile.progress.currentMap = 9;
  }

  Events.emit(E.mapComplete, { map: mapId });

  if (mapId < 9) {
    unlockMap(nextMap);
    saveProfiles();
  }

  setTimeout(() => {
    stopGameplay("victory");

    if (mapId === 9) {
      setTimeout(() => {
        import("../screenManagement/credits.js")
          .then(mod => mod.showCredits())
          .catch(err => console.warn("Credits display failed:", err));
      }, 300);
    }
  }, VICTORY_DELAY);
}

async function handleWaveCleared(waveNumber, mapId) {
  Events.emit(E.waveEnd, { wave: waveNumber });

  try {
    if (waveNumber === 1) {
      await triggerEndOfWave1Story(mapId);
    }
    if (waveNumber === 5) {
      await triggerEndOfWave5Story(mapId);
    }

    if (!autosaveDoneForWave) {
      const profile = gameState.profile;
      if (profile) {
        const slot = typeof profile.lastSave === "number" ? profile.lastSave : 0;
        try {
          await saveToSlot(slot);
          profile.lastSave = slot;
          saveProfiles();
          console.log(`Autosaved after Wave ${waveNumber}`);
        } catch (err) {
          console.warn("Autosave failed:", err);
        }
      }
      autosaveDoneForWave = true;
    }
  } catch (err) {
    console.warn("Wave-end sequence failed:", err);
  } finally {
    betweenWaveTimer = BETWEEN_WAVES_DELAY;
    window.betweenWaveTimerActive = true;
    waveTransitionInProgress = false;
  }
}

// ============================================================
// BONUS OGRE TRIGGERS
// ============================================================

export function incrementGoblinDefeated() {
  goblinsDefeated++;

  if (ogreMilestones[goblinsDefeated] === false) {
    ogreMilestones[goblinsDefeated] = true;
    spawnOgre();
  }
}

export function resetWaveKillTracking() {
  goblinsDefeated = 0;
  for (let key in ogreMilestones) {
    ogreMilestones[key] = false;
  }
}


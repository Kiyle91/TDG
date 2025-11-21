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

// ============================================================
// WAVE CONFIGS
// ============================================================

export const waveConfigs = {
  1: [
    { goblins: 10, worgs: 2, ogres: 0, elites: 1, trolls: 1, crossbows: 1 },
    { goblins: 12, worgs: 3, ogres: 0, elites: 1, trolls: 1, crossbows: 1 },
    { goblins: 14, worgs: 4, ogres: 0, elites: 2, trolls: 1, crossbows: 1 },
    { goblins: 15, worgs: 5, ogres: 0, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 16, worgs: 6, ogres: 0, elites: 2, trolls: 2, crossbows: 2 },
  ],

  2: [
    { goblins: 12, worgs: 3, ogres: 0, elites: 1, trolls: 1, crossbows: 1 },
    { goblins: 14, worgs: 4, ogres: 0, elites: 1, trolls: 1, crossbows: 1 },
    { goblins: 16, worgs: 5, ogres: 0, elites: 2, trolls: 1, crossbows: 1 },
    { goblins: 18, worgs: 6, ogres: 0, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 20, worgs: 6, ogres: 0, elites: 2, trolls: 2, crossbows: 2 },
  ],

  3: [
    { goblins: 14, worgs: 4, ogres: 0, elites: 1, trolls: 2, crossbows: 1 },
    { goblins: 16, worgs: 5, ogres: 0, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 18, worgs: 5, ogres: 0, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 20, worgs: 6, ogres: 0, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 22, worgs: 6, ogres: 0, elites: 2, trolls: 3, crossbows: 2 },
  ],

  4: [
    { goblins: 16, worgs: 5, ogres: 0, elites: 1, trolls: 2, crossbows: 1 },
    { goblins: 18, worgs: 5, ogres: 0, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 20, worgs: 6, ogres: 0, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 22, worgs: 6, ogres: 0, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 24, worgs: 7, ogres: 0, elites: 3, trolls: 3, crossbows: 2 },
  ],

  5: [
    { goblins: 18, worgs: 6, ogres: 1, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 20, worgs: 6, ogres: 1, elites: 2, trolls: 2, crossbows: 1 },
    { goblins: 22, worgs: 7, ogres: 1, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 24, worgs: 7, ogres: 1, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 26, worgs: 8, ogres: 2, elites: 3, trolls: 3, crossbows: 2 },
  ],

  6: [
    { goblins: 20, worgs: 7, ogres: 1, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 22, worgs: 7, ogres: 1, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 24, worgs: 8, ogres: 1, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 26, worgs: 8, ogres: 2, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 28, worgs: 9, ogres: 2, elites: 3, trolls: 4, crossbows: 2 },
  ],

  7: [
    { goblins: 22, worgs: 8, ogres: 1, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 24, worgs: 8, ogres: 1, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 26, worgs: 9, ogres: 2, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 28, worgs: 9, ogres: 2, elites: 3, trolls: 4, crossbows: 1 },
    { goblins: 30, worgs: 10, ogres: 2, elites: 4, trolls: 4, crossbows: 2 },
  ],

  8: [
    { goblins: 24, worgs: 9, ogres: 1, elites: 2, trolls: 3, crossbows: 1 },
    { goblins: 26, worgs: 9, ogres: 2, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 28, worgs: 10, ogres: 2, elites: 3, trolls: 4, crossbows: 1 },
    { goblins: 30, worgs: 10, ogres: 2, elites: 4, trolls: 4, crossbows: 1 },
    { goblins: 32, worgs: 11, ogres: 2, elites: 4, trolls: 5, crossbows: 2 },
  ],

  9: [
    { goblins: 26, worgs: 10, ogres: 1, elites: 3, trolls: 3, crossbows: 1 },
    { goblins: 28, worgs: 10, ogres: 2, elites: 3, trolls: 4, crossbows: 1 },
    { goblins: 30, worgs: 11, ogres: 2, elites: 4, trolls: 4, crossbows: 1 },
    { goblins: 32, worgs: 11, ogres: 2, elites: 4, trolls: 5, crossbows: 1 },
    { goblins: 34, worgs: 12, ogres: 3, elites: 5, trolls: 5, crossbows: 2 },
  ],
};

// ============================================================
// VICTORY MESSAGES / SUBTITLES
// ============================================================

export const VICTORY_MESSAGES = {
  1: "�o� Map One Complete! The goblins scatter before your growing power!",
  2: "�YO� Map Two Cleared! The Hollow Woods fall silent once more.",
  3: "�Y\"� Map Three Victorious! The Ember Plains glow in your honour.",
  4: "�YOT Map Four Defeated! Shadows tremble at your presence.",
  5: "�?\"��? Map Five Purified! Even the frost bows to the Princess.",
  6: "�s� Map Six Triumphed! The Arcane Crystals resonate with power.",
  7: "�Y'Z Map Seven Won! You stand unmatched in the Crystal Isles!",
  8: "�YO^ Map Eight Cleared! Magic ripples through the realm!",
  9: "�Y'' Final Map Conquered! The Crystal Keep is safe once more!"
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
  9: "The Crystal Keep stands protected �?\" your legend complete.",
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

  const hpMult = getDifficultyHpMultiplier();
  const spawnScaled = (fn) => {
    const enemy = fn();
    if (enemy) {
      enemy.hp = Math.round(enemy.hp * hpMult);
      enemy.maxHp = Math.round(enemy.maxHp * hpMult);
    }
    return enemy;
  };

  for (let i = 0; i < wave.goblins; i++) {
    spawnQueue.push(() => {
      spawnScaled(spawnGoblin);

      if (i < wave.worgs) spawnScaled(spawnWorg);
      if (i < wave.elites) spawnScaled(spawnElite);
      if (i < wave.trolls) spawnScaled(spawnTroll);
      if (i < wave.ogres) spawnScaled(() => spawnOgre({ skipDifficultyScaling: true }));
      if (i < wave.crossbows) spawnScaled(spawnCrossbow);
    });
  }

  for (let i = wave.goblins; i < wave.worgs; i++) {
    spawnQueue.push(() => spawnScaled(spawnWorg));
  }

  for (let i = wave.goblins; i < wave.elites; i++) {
    spawnQueue.push(() => spawnScaled(spawnElite));
  }

  for (let i = wave.goblins; i < wave.trolls; i++) {
    spawnQueue.push(() => spawnScaled(spawnTroll));
  }

  for (let i = wave.goblins; i < wave.crossbows; i++) {
    spawnQueue.push(() => spawnScaled(spawnCrossbow));
  }
}

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
          console.log(`�Y'� Autosaved after Wave ${waveNumber}`);
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

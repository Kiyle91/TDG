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

// ------------------------------------------------------------
// MAP & LAYERS (MULTI-PATH READY)
// ------------------------------------------------------------
import {
  loadMap,
  extractPathsFromMap,
  getAllPaths,
  drawMapLayered,
  getMapPixelSize,
  extractCrystalEchoes,
} from "../maps/map.js";

const MAP_LAYERS_BELOW_ENTITIES = ["groundLayer", "road", "props", "propsTwo"];
const MAP_LAYERS_ABOVE_ENTITIES = ["trees", "clouds"];
// ------------------------------------------------------------
// 👹 ENEMIES (Goblin / Troll / Ogre / Worg / Elite / Crossbow)
// ------------------------------------------------------------

import {
  initGoblins,
  updateGoblins,
  drawGoblins,
  setGoblinPath,
  getGoblins,
} from "../entities/goblin.js";

import {
  initOgres,
  updateOgres,
  drawOgres,
  clearOgres,
  damageOgre,
  getOgres,
} from "../entities/ogre.js";

import {
  initTrolls,
  updateTrolls,
  drawTrolls,
  clearTrolls,
  getTrolls,
} from "../entities/troll.js";

import {
  initWorg,
  updateWorg,
  drawWorg,
  getWorg,
} from "../entities/worg.js";

import {
  initElites,
  updateElites,
  drawElites,
  clearElites,
  damageElite,
  getElites,
} from "../entities/elite.js";

import {
  initCrossbows,
  updateCrossbows,
  drawCrossbows,
  clearCrossbows,
  getCrossbows,
} from "../entities/crossbow.js";

// ------------------------------------------------------------
// 🏹 SPIRES & PROJECTILES
// ------------------------------------------------------------

import {
  initSpires,
  updateSpires,
  drawSpires,
} from "../spires/spires.js";

import {
  initProjectiles,
  updateProjectiles,
  drawProjectiles,
} from "../spires/projectiles.js";

// ------------------------------------------------------------
// 🎁 UNIFIED LOOT SYSTEM
// ------------------------------------------------------------

import {
  loadLootImages,
  updateLoot,
  drawLoot,
  clearLoot,
} from "../entities/loot.js";

// ------------------------------------------------------------
// 🧭 PLAYER CONTROLLER
// ------------------------------------------------------------

import {
  initPlayerController,
  updatePlayer,
  drawPlayer,
} from "../player/playerController.js";

// ------------------------------------------------------------
// 🧩 UI / HUD
// ------------------------------------------------------------

import {
  initUI,
  updateHUD,
  updateBraveryBar,
} from "../screenManagement/ui.js";

// ------------------------------------------------------------
// 💬 FLOATING COMBAT TEXT
// ------------------------------------------------------------

import {
  updateFloatingText,
  drawFloatingText,
} from "../fx/floatingText.js";

import { updateAndDrawSpeechBubbles, clearSpeechBubbles } from "../fx/speechBubble.js";

// ------------------------------------------------------------
// 🪽 PEGASUS (ambient flight only)
// ------------------------------------------------------------

import {
  loadPegasus,
  initPegasus,
  updatePegasus,
  drawPegasusFrame,
} from "../entities/pegasus.js";

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

import { gameState } from "../utils/gameState.js";
import { stopGameplay } from "../main.js";

import {
  resetWaveSystem,
  updateWaveSystem,
} from "./waveSystem.js";

import { updateArrows, drawArrows } from "../combat/arrow.js";
import { damageGoblin } from "../entities/goblin.js";

import { spawnDamageSparkles } from "../fx/sparkles.js";

import { updateHealFX, renderHealFX } from "../combat/heal.js";

import map2Events from "../core/events/map2Events.js";
import map3Events from "../core/events/map3Events.js";
import map4Events from "../core/events/map4Events.js";
import map5Events from "./events/map5Events.js";
import map6Events from "./events/map6Events.js";
import map7Events from "../core/events/map7Events.js";
import map8Events from "../core/events/map8Events.js";
import map9Events from "./events/map9Events.js";
import { updateStepEvents } from "./eventEngine.js";
import { spawnSeraphineBoss, clearSeraphines, drawSeraphine, updateSeraphine, initSeraphine, getSeraphines } from "../entities/seraphine.js";
import { initMap1Events } from "./events/map1Events.js";
import "../core/events/seraphineSpeech.js";
import { buildSpatialGrid, getNeighbors, getIndex } from "../utils/spatialGrid.js";
import { getSeraphinesEdgeFlash } from "../entities/seraphine.js";


// ? Ice goblin
import {
  initGoblins as initIceGoblins,
  spawnGoblin as spawnIceGoblin,
  updateGoblins as updateIceGoblins,
  drawGoblins as drawIceGoblins,
  getGoblins as getIceGoblins,
} from "../entities/iceGoblin.js";

// ?? Ember goblin
import {
  initGoblins as initEmberGoblins,
  spawnGoblin as spawnEmberGoblin,
  updateGoblins as updateEmberGoblins,
  drawGoblins as drawEmberGoblins,
  getGoblins as getEmberGoblins,
} from "../entities/emberGoblin.js";

// ?? Ash goblin
import {
  initGoblins as initAshGoblins,
  spawnGoblin as spawnAshGoblin,
  updateGoblins as updateAshGoblins,
  drawGoblins as drawAshGoblins,
  getGoblins as getAshGoblins,
} from "../entities/ashGoblin.js";

// ?? Void goblin
import {
  initGoblins as initVoidGoblins,
  spawnGoblin as spawnVoidGoblin,
  updateGoblins as updateVoidGoblins,
  drawGoblins as drawVoidGoblins,
  getGoblins as getVoidGoblins,
} from "../entities/voidGoblin.js";

import { applyGoblinAuras } from "../entities/goblinAuras.js";  

import { initSpireClickHandler } from "../spires/spires.js";


export {
  waveConfigs,
  VICTORY_MESSAGES,
  VICTORY_SUBTITLES,
  getWaveSnapshotState,
  restoreWaveFromSnapshot,
  resetWaveSystem,
} from "./waveSystem.js";



// ------------------------------------------------------------
// 🎥 LOCAL CAMERA STATE
// ------------------------------------------------------------

let canvas = null;
let ctx = null;

let cameraX = 0;
let cameraY = 0;

// Track last render time to make speech bubble lifetime framerate-independent
let lastSpeechBubbleTime = 0;

// Cache expensive DOM queries
let cachedCanvasRect = null;
let rectCacheTimer = 0;
const RECT_CACHE_DURATION = 1000;

// Throttled HUD updates
let hudUpdateTimer = 0;
const HUD_UPDATE_INTERVAL = 100;

// Track stuck enemies to temporarily bypass collision
let stuckState = new WeakMap();
const STUCK_DISTANCE_EPS = 3;
const STUCK_TIME_MS = 2000;
const UNSTUCK_WINDOW_MS = 3000;
const LATERAL_STUCK_NUDGE = 6; // px

// Perf overlay state
let perfOverlayEl = null;
let lastFrameTime = 0;
let perfAccum = 0;
let perfFrames = 0;
let smoothedFps = 60;
let lastEnemyCount = 0;
const enemiesScratch = [];

function trackEnemyMotion(delta, enemies) {
  if (!Array.isArray(enemies)) return;
  const now = performance.now();

  for (const e of enemies) {
    let state = stuckState.get(e);
    if (!state) {
      state = { x: e.x, y: e.y, still: 0, noCollideUntil: 0 };
    }

    const moved = Math.hypot(e.x - state.x, e.y - state.y) > STUCK_DISTANCE_EPS;
    if (moved) {
      state.x = e.x;
      state.y = e.y;
      state.still = 0;
    } else {
      state.still += delta;
      if (state.still >= STUCK_TIME_MS) {
        state.noCollideUntil = now + UNSTUCK_WINDOW_MS;
        // Apply a quick lateral nudge to break gridlock
        const angle = Math.random() * Math.PI * 2;
        e.x += Math.cos(angle) * LATERAL_STUCK_NUDGE;
        e.y += Math.sin(angle) * LATERAL_STUCK_NUDGE;
        state.still = 0;
      }
    }

    stuckState.set(e, state);
    e.__noCollideUntil = state.noCollideUntil;
  }
}

function getEnemyRadius(enemy) {
  switch (enemy?.type) {
    case "ogre": return 60;
    case "troll": return 52;
    case "elite": return 46;
    case "worg": return 46;
    case "crossbow": return 36;
    case "seraphine": return 72;
    case "goblin":
    case "iceGoblin":
    case "emberGoblin":
    case "ashGoblin":
    case "voidGoblin":
    default:
      return 34;
  }
}

function getPathFollowerInfo(e) {
  if (!Array.isArray(e?.path)) return { isPathFollower: false, distToWaypoint: Infinity };
  const next = e.path[e.targetIndex] || e.path[e.path.length - 1];
  if (!next) return { isPathFollower: true, distToWaypoint: Infinity };
  const dist = Math.hypot((next.x ?? 0) - (e.x ?? 0), (next.y ?? 0) - (e.y ?? 0));
  return { isPathFollower: true, distToWaypoint: dist };
}

function collectAllEnemies() {
  enemiesScratch.length = 0;
  const groups = [
    getGoblins(),
    getIceGoblins(),
    getEmberGoblins(),
    getAshGoblins(),
    getVoidGoblins(),
    getWorg(),
    getTrolls(),
    getCrossbows(),
    getElites(),
    getOgres(),
    getSeraphines()
  ];

  for (const group of groups) {
    if (!Array.isArray(group)) continue;
    for (const e of group) {
      if (e && e.alive) enemiesScratch.push(e);
    }
  }

  return enemiesScratch;
}

function resolveEnemyCollisions(spatial, enemies) {
  if (!Array.isArray(enemies) || enemies.length === 0) return;
  const count = enemies.length;
  const now = performance.now();

  const MAX_PUSH = 5; // cap push per pair to reduce clumping chains

  const useSpatial = spatial && spatial.grid && spatial.indexMap;

  if (useSpatial) {
    for (let i = 0; i < count; i++) {
      const a = enemies[i];
      if (!a || !a.alive) continue;
      let ra = getEnemyRadius(a);
      const aInfo = getPathFollowerInfo(a);
      const candidates = getNeighbors(spatial, a.x, a.y);

      for (const b of candidates) {
        let rb = getEnemyRadius(b);
        if (!b || !b.alive) continue;
        const j = getIndex(spatial, b);
        if (j <= i) continue;
        const bInfo = getPathFollowerInfo(b);
        if ((a.__noCollideUntil ?? 0) > now || (b.__noCollideUntil ?? 0) > now) {
          continue;
        }

        if (aInfo.isPathFollower && bInfo.isPathFollower) {
          if (aInfo.distToWaypoint < 90 || bInfo.distToWaypoint < 90) {
            continue;
          }
        }

        if (aInfo.isPathFollower) ra *= 0.75;
        if (bInfo.isPathFollower) rb *= 0.75;

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        let dist = Math.hypot(dx, dy);
        const minDist = ra + rb;

        if (dist >= minDist || !Number.isFinite(dist)) continue;

        if (dist === 0) {
          const angle = Math.random() * Math.PI * 2;
          dist = 0.01;
          a.x += Math.cos(angle) * 0.5;
          a.y += Math.sin(angle) * 0.5;
        }

        let overlap = Math.min((minDist - dist) * 0.5, MAX_PUSH);
        if (aInfo.isPathFollower && bInfo.isPathFollower) overlap *= 0.6;
        const adirX = a.vx ?? 0;
        const adirY = a.vy ?? 0;
        const bdirX = b.vx ?? 0;
        const bdirY = b.vy ?? 0;
        const lenA = Math.hypot(adirX, adirY) || 1;
        const lenB = Math.hypot(bdirX, bdirY) || 1;
        const dot = (adirX * bdirX + adirY * bdirY) / (lenA * lenB);
        let lateralBoost = 0;
        if (dot < -0.5) {
          lateralBoost = 3;
        } else if (dot < 0) {
          lateralBoost = 1.5;
        }
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        const jitter = (0.2 + lateralBoost * 0.1) * (Math.random() - 0.5);
        const jx = -ny * (jitter + lateralBoost * 0.15);
        const jy = nx * (jitter + lateralBoost * 0.15);

        a.x += nx * overlap + jx;
        a.y += ny * overlap + jy;
        b.x -= nx * overlap + jx;
        b.y -= ny * overlap + jy;
      }
    }
    return;
  }

  for (let i = 0; i < count; i++) {
    const a = enemies[i];
    if (!a || !a.alive) continue;
    let ra = getEnemyRadius(a);
    const aInfo = getPathFollowerInfo(a);

    for (let j = i + 1; j < count; j++) {
      const b = enemies[j];
      if (!b || !b.alive) continue;
      let rb = getEnemyRadius(b);
      const bInfo = getPathFollowerInfo(b);

      if ((a.__noCollideUntil ?? 0) > now || (b.__noCollideUntil ?? 0) > now) {
        continue;
      }

      if (aInfo.isPathFollower && bInfo.isPathFollower) {
        if (aInfo.distToWaypoint < 90 || bInfo.distToWaypoint < 90) {
          continue;
        }
      }

      if (aInfo.isPathFollower) ra *= 0.75;
      if (bInfo.isPathFollower) rb *= 0.75;

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      let dist = Math.hypot(dx, dy);
      const minDist = ra + rb;

      if (dist >= minDist || !Number.isFinite(dist)) continue;

      if (dist === 0) {
        const angle = Math.random() * Math.PI * 2;
        dist = 0.01;
        a.x += Math.cos(angle) * 0.5;
        a.y += Math.sin(angle) * 0.5;
      }

      let overlap = Math.min((minDist - dist) * 0.5, MAX_PUSH);
      if (aInfo.isPathFollower && bInfo.isPathFollower) overlap *= 0.6;
      const adirX = a.vx ?? 0;
      const adirY = a.vy ?? 0;
      const bdirX = b.vx ?? 0;
      const bdirY = b.vy ?? 0;
      const lenA = Math.hypot(adirX, adirY) || 1;
      const lenB = Math.hypot(bdirX, bdirY) || 1;
      const dot = (adirX * bdirX + adirY * bdirY) / (lenA * lenB);
      let lateralBoost = 0;
      if (dot < -0.5) {
        lateralBoost = 3;
      } else if (dot < 0) {
        lateralBoost = 1.5;
      }
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);

      const jitter = (0.2 + lateralBoost * 0.1) * (Math.random() - 0.5);
      const jx = -ny * (jitter + lateralBoost * 0.15);
      const jy = nx * (jitter + lateralBoost * 0.15);

      a.x += nx * overlap + jx;
      a.y += ny * overlap + jy;
      b.x -= nx * overlap + jx;
      b.y -= ny * overlap + jy;
    }
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
      p.pos = { x: 250, y: 350 };
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
  gameState.elapsedTime = 0;
  gameState.paused = false;
  gameState.isPaused = false;
  gameState.echoPowerActive = false;
  clearSpeechBubbles();

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

  // NEW: extract all enemy paths (any polylines in "Paths" layer)
  const allPaths = extractPathsFromMap();

  // Goblins choose their own lane internally if needed
  setGoblinPath(allPaths);

  // Crystal Echoes
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
  // ------------------------------------------------------------
  // ENEMY INITIALIZATION (multi-path for all walkers)
  // ------------------------------------------------------------
  await initGoblins();
  await initIceGoblins();
  await initEmberGoblins();
  await initAshGoblins();
  await initVoidGoblins();

  // Worg & Trolls MUST receive allPaths or they will break waves
  await initWorg(allPaths);
  await initTrolls(allPaths);

  await initElites();     // No paths needed
  await initCrossbows();  // No paths needed
  await initSeraphine();  // Preload boss sprites for debug + map events

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

  if (mode !== "load") {
    gameState.player.steps = 0;
    gameState.player.stepDistance = 0;
  }

  // NEW: Only apply map spawn on NEW game
  if (mode === "new") {
    applyMapSpawn();
  }

  initPlayerController(canvas);
  initUI();
  initSpireClickHandler(canvas);

  const current = gameState.progress?.currentMap ?? gameState.currentMap ?? 1;
  gameState.currentMap = current;

  switch (current) {
    case 1: initMap1Events(); break;
    case 2: map2Events(); break;
    case 3: map3Events(); break;
    case 4: map4Events(); break;
    case 5: map5Events(); break;
    case 6: map6Events(); break;
    case 7: map7Events(); break;
    case 8: map8Events(); break;
    case 9: map9Events(); break;
    default: break;
  }

  

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

  gameState.elapsedTime = (gameState.elapsedTime || 0) + delta / 1000;

  delta = Math.min(delta, 100);

  updateGoblins(delta);
  updateIceGoblins(delta);
  updateEmberGoblins(delta);
  updateAshGoblins(delta);
  updateVoidGoblins(delta);

  updateWorg(delta);
  updateCrossbows(delta);
  updateElites(delta);
  updateTrolls(delta);
  updateSpires(delta);
  updateOgres(delta);
  updateSeraphine(delta);
  updateProjectiles(delta);
  updateArrows(delta);
  updateHealFX(delta);
  const enemies = collectAllEnemies();
  lastEnemyCount = enemies.length;
  const enemySpatial = buildSpatialGrid(enemies, 128);
  updatePlayer(delta, { enemies, spatial: enemySpatial });
  updateFloatingText(delta);
  updatePegasus(delta);
  updateLoot(delta);
  updateStepEvents();
  applyGoblinAuras(delta, { enemies, spatial: enemySpatial });
  trackEnemyMotion(delta, enemies);
  resolveEnemyCollisions(enemySpatial, enemies);
  try {
    updateWaveSystem(delta);
  } catch (err) {
    console.warn("updateWaveSystem failed:", err);
  }

  // 🔮 UPDATE SEEKER ORBS
  if (gameState.fx?.seekers) {
    for (let i = gameState.fx.seekers.length - 1; i >= 0; i--) {
      const o = gameState.fx.seekers[i];
      if (!o.alive || !o.target?.alive) {
        gameState.fx.seekers.splice(i, 1);
        continue;
      }

      const dx = o.target.x - o.x;
      const dy = o.target.y - o.y;
      const dist = Math.hypot(dx, dy);

      const dt = delta / 1000;
      o.x += (dx / dist) * o.speed * dt;
      o.y += (dy / dist) * o.speed * dt;

      // Hit enemy
      if (dist < 32) {
        const t = o.target;

        // Unified damage router for seeker orbs
        if (t.type === "elite") {
          damageElite(t, o.dmg, "spell");
        } else if (t.type === "ogre" || t.maxHp >= 400) {
          damageOgre(t, o.dmg, "spell");
        } else {
          damageGoblin(t, o.dmg);
        }

        spawnDamageSparkles(t.x, t.y);
        o.alive = false;
      }
    }
  }

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

  const nowFrame = performance.now();
  if (!lastFrameTime) lastFrameTime = nowFrame;
  const frameDt = nowFrame - lastFrameTime;
  lastFrameTime = nowFrame;
  perfAccum += frameDt;
  perfFrames++;
  if (perfAccum >= 500) {
    const fps = (perfFrames * 1000) / perfAccum;
    smoothedFps = Math.round(fps);
    perfAccum = 0;
    perfFrames = 0;
    // FPS overlay disabled
  }

  for (const layer of MAP_LAYERS_BELOW_ENTITIES) {
    drawMapLayered(ctx, layer, cameraX, cameraY, canvas.width, canvas.height);
  }

  // Entities
  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  updateCrystalEchoes(ctx, gameState.player);

  drawSpires(ctx);
  drawWorg(ctx);
  drawCrossbows(ctx);
  drawGoblins(ctx);
  drawIceGoblins(ctx);
  drawEmberGoblins(ctx);
  drawAshGoblins(ctx);
  drawVoidGoblins(ctx);
  drawElites(ctx);
  drawTrolls(ctx);
  drawOgres(ctx);
  drawSeraphine(ctx);
  drawPlayer(ctx);
  drawProjectiles(ctx);
  drawArrows(ctx);
  drawFloatingText(ctx);
  drawLoot(ctx);
  renderSparkleBursts(ctx, 16);
  renderHealFX(ctx);



  // 🚀 PULSE RINGS
  if (gameState.fx?.pulses) {
    for (let i = gameState.fx.pulses.length - 1; i >= 0; i--) {
      const p = gameState.fx.pulses[i];
      p.age += 16;

      const t = p.age / p.life;
      if (t >= 1) {
        gameState.fx.pulses.splice(i, 1);
        continue;
      }

      const r = p.radius * (0.4 + 1.8 * t); // expands outward
      const alpha = 1 - t;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = p.color.replace("0.8", alpha.toFixed(2));
      ctx.lineWidth = 6;
      ctx.stroke();
    }
  }

  // 🔮 DRAW SEEKER ORBS
  if (gameState.fx?.seekers) {
    for (const o of gameState.fx.seekers) {
      if (!o.alive) continue;

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = o.color;

      // main orb
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
      ctx.fill();

      // glow
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  ctx.restore();

  // ============================================================
  for (const layer of MAP_LAYERS_ABOVE_ENTITIES) {
    drawMapLayered(ctx, layer, cameraX, cameraY, canvas.width, canvas.height);
  }

  // Pegasus
  try {
    if (typeof drawPegasusFrame === "function") {
      drawPegasusFrame(ctx);
    }
  } catch {
    // non-fatal
  }

  // Speech bubbles above all layers (including trees/pegasus)
  ctx.save();
  ctx.translate(-cameraX, -cameraY);
  const nowBubble = performance.now();
  if (!lastSpeechBubbleTime) lastSpeechBubbleTime = nowBubble;
  const bubbleDelta = Math.min(nowBubble - lastSpeechBubbleTime, 100);
  lastSpeechBubbleTime = nowBubble;
  updateAndDrawSpeechBubbles(ctx, bubbleDelta);
  ctx.restore();

  // ============================================================
  // ?? SCREEN EDGE PURPLE FLASH (Seraphine presence cue)
  // ============================================================
  const flash = getSeraphinesEdgeFlash();
  if (flash > 0.01) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Simple, readable pulse (solid fill + subtle ring + dark rim)
    const now = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(now / 120);
    const ringPulse = 0.5 + 0.5 * Math.sin(now / 70);
    const edgeAlpha = Math.min(0.85, Math.max(0.25, 0.25 + flash * 0.5 + 0.25 * pulse));

    // Solid purple wash
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = edgeAlpha;
    ctx.fillStyle = "rgba(140,0,200,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Thin strobing ring near the edge for contrast
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = Math.min(0.6, edgeAlpha * (0.7 + 0.6 * ringPulse));
    const ring = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.82,
      w / 2, h / 2, Math.max(w, h) * 0.98
    );
    ring.addColorStop(0.0, "rgba(0,0,0,0)");
    ring.addColorStop(0.5, "rgba(220,0,255,0.55)");
    ring.addColorStop(0.8, "rgba(255,200,255,0.9)");
    ring.addColorStop(1.0, "rgba(255,255,255,0.1)");
    ctx.fillStyle = ring;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Dark rim to enhance contrast at the very edges
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = edgeAlpha * 0.4;

    const gradDark = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.26,
      w / 2, h / 2, Math.max(w, h) * 1.08
    );

    gradDark.addColorStop(0.0, "rgba(0,0,0,0)");
    gradDark.addColorStop(0.6, "rgba(20,0,40,0.35)");
    gradDark.addColorStop(1.0, "rgba(6,0,12,0.65)");

    ctx.fillStyle = gradDark;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
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

  const defeatDelay = 2000;

  if (hp <= 0) {
    p.dead = true;
    gameState.paused = true;
    clearSpeechBubbles();
    setTimeout(() => stopGameplay("defeat"), defeatDelay);
    return;
  }

  if (lives <= 0) {
    p.dead = true;
    gameState.paused = true;
    clearSpeechBubbles();
    setTimeout(() => stopGameplay("lives"), defeatDelay);
    return;
  }

  // Victory is handled entirely in the wave system now
}

// ============================================================
// ♻️ RESET COMBAT STATE — Try Again / Continue / New Map
// ============================================================

export function resetCombatState() {
  gameState.elapsedTime = 0;
  gameState.victoryPending = false;

  const cur = gameState.progress?.currentMap ?? gameState.currentMap ?? 1;
  gameState.currentMap = cur;

  switch (cur) {
    case 1: initMap1Events(); break;
    case 2: map2Events(); break;
    case 3: map3Events(); break;
    case 4: map4Events(); break;
    case 5: map5Events(); break;
    case 6: map6Events(); break;
    case 7: map7Events(); break;
    case 8: map8Events(); break;
    case 9: map9Events(); break;
    default: break;
  }

  if (gameState.profile?.currencies) {
    gameState.profile.currencies.gold = 0;
  }

  gameState.ogreSpawned = false;

  gameState.worgSpawns = 0;
  gameState.ogreTriggers = {
    25: false,
    50: false,
    75: false,
    100: false,
  };
  stuckState = new WeakMap();

  const p = gameState.player;
  if (p) {
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;
    p.facing = "right";
    p.steps = 0;
    p.stepDistance = 0;
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
  clearSeraphines();

  initIceGoblins();
  initEmberGoblins();
  initAshGoblins();
  initVoidGoblins();
  initWorg(getAllPaths());
  initGoblins();
  initSpires();
  initProjectiles();
  clearSpeechBubbles();

  updateHUD();
}

// ============================================================
// 🔁 RESET PLAYER STATE — used by "Try Again"
// ============================================================

export function resetPlayerState() {
  const p = gameState.player;
  gameState.elapsedTime = 0;
  if (!p) return;

  applyMapSpawn();
  p.hp = p.maxHp ?? 100;
  p.mana = p.maxMana ?? 50;
  p.dead = false;
  p.lives = 10;
  p.facing = "right";
  p.steps = 0;
  p.stepDistance = 0;

  if (gameState.profile?.currencies) {
    gameState.profile.currencies.gold = 0;
  }

  if (typeof window.__playerControllerReset === "function") {
    window.__playerControllerReset();
  }

  updateHUD();
  hudUpdateTimer = 0;
}

// Resize → invalidate rect cache (production-safe)
let resizeListenerBound = false;
function bindResizeListener() {
  if (resizeListenerBound) return;
  window.addEventListener("resize", () => {
    cachedCanvasRect = null;
    rectCacheTimer = RECT_CACHE_DURATION;
  });
  resizeListenerBound = true;
}
bindResizeListener();

function ensurePerfOverlay() {
  if (perfOverlayEl) return;
  const el = document.createElement("div");
  el.id = "perf-overlay";
  Object.assign(el.style, {
    position: "fixed",
    top: "8px",
    right: "10px",
    padding: "6px 10px",
    background: "rgba(0,0,0,0.55)",
    color: "#e0f0ff",
    fontSize: "12px",
    fontFamily: "monospace",
    zIndex: 9999,
    pointerEvents: "none",
  });
  el.textContent = "FPS: -- | Enemies: --";
  document.body.appendChild(el);
  perfOverlayEl = el;
}

function updatePerfOverlay(fps, enemies) {
  if (!perfOverlayEl) return;
  perfOverlayEl.textContent = `FPS: ${fps} | Enemies: ${enemies}`;
}

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


window.spawnSeraphine = (phase = 3, x, y) => {
  const p = gameState.player;
  const px = x ?? p?.pos.x ?? 0;
  const py = y ?? p?.pos.y ?? 0;

  console.log("? Spawning Seraphine (phase:", phase, ") at", px, py);
  spawnSeraphineBoss(phase, px, py);
};

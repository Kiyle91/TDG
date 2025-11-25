// ============================================================
// ðŸŒ¸ game.js â€” Olivia's World: Crystal Keep (OPTIMIZED + Multi-Map Spawns)
// ------------------------------------------------------------
// âœ¦ Core game controller & system orchestration
// âœ¦ Initializes and coordinates all core modules
// âœ¦ Runs update + render loops (called by main.js)
// âœ¦ Player + Goblins + Spires rendered between layers
// âœ¦ Victory/Defeat system + resetCombatState()
// âœ¦ Floating combat text support (damage/heal popups)
// âœ¦ Pegasus ambient flight drawn above all layers
// âœ¦ ðŸ†• PERFORMANCE OPTIMIZATIONS:
//    - Throttled HUD updates (every 100ms instead of 16ms)
//    - Cached getBoundingClientRect() (expensive DOM call)
//    - Paused-state early exit
// âœ¦ ðŸ†• MAP-AWARE SPAWN:
//    - Spawns player differently per map (map_one / map_two / others)
// âœ¦ ðŸ†• WAVE SYSTEM (Maps 1â€“9):
//    - Wave configs per map
//    - Global spawn queue with 4s spacing per goblin
//    - Unified victory after final wave clear
// ============================================================

// ------------------------------------------------------------
// ðŸ—ºï¸ MAP & LAYERS
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
// ðŸ‘¹ ENEMIES (Goblin / Troll / Ogre / Worg / Elite / Crossbow)
// ------------------------------------------------------------

import {
  initGoblins,
  updateGoblins,
  drawGoblins,
  setGoblinPath,
} from "../entities/goblin.js";

import {
  initOgres,
  updateOgres,
  drawOgres,
  clearOgres,
  damageOgre,
} from "../entities/ogre.js";

import {
  initTrolls,
  updateTrolls,
  drawTrolls,
  clearTrolls,
} from "../entities/troll.js";

import {
  initWorg,
  updateWorg,
  drawWorg,
} from "../entities/worg.js";

import {
  initElites,
  updateElites,
  drawElites,
  clearElites,
  damageElite,
} from "../entities/elite.js";

import {
  initCrossbows,
  updateCrossbows,
  drawCrossbows,
  clearCrossbows,
} from "../entities/crossbow.js";

// ------------------------------------------------------------
// ðŸ¹ SPIRES & PROJECTILES
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
// ðŸŽ UNIFIED LOOT SYSTEM
// ------------------------------------------------------------

import {
  loadLootImages,
  updateLoot,
  drawLoot,
  clearLoot,
} from "../entities/loot.js";

// ------------------------------------------------------------
// ðŸ§­ PLAYER CONTROLLER
// ------------------------------------------------------------

import {
  initPlayerController,
  updatePlayer,
  drawPlayer,
} from "../player/playerController.js";

// ------------------------------------------------------------
// ðŸ§© UI / HUD
// ------------------------------------------------------------

import {
  initUI,
  updateHUD,
  updateBraveryBar,
} from "../screenManagement/ui.js";

// ------------------------------------------------------------
// ðŸ’¬ FLOATING COMBAT TEXT
// ------------------------------------------------------------

import {
  updateFloatingText,
  drawFloatingText,
} from "../fx/floatingText.js";

import { updateAndDrawSpeechBubbles, clearSpeechBubbles } from "../fx/speechBubble.js";

// ------------------------------------------------------------
// ðŸª½ PEGASUS (ambient flight only)
// ------------------------------------------------------------

import {
  loadPegasus,
  initPegasus,
  updatePegasus,
  drawPegasusFrame,
} from "../entities/pegasus.js";

// ------------------------------------------------------------
// âœ¨ CRYSTAL ECHOES (ambient sparkle bursts)
// ------------------------------------------------------------

import {
  updateCrystalEchoes,
  initCrystalEchoes,
  renderSparkleBursts,
} from "./crystalEchoes.js";

// ------------------------------------------------------------
// âš™ï¸ GLOBAL STATE & STORY
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";
import { stopGameplay } from "../main.js";

import {
  resetWaveSystem,
  updateWaveSystem,
  resetWaveKillTracking,
} from "./waveSystem.js";

import { updateArrows, drawArrows } from "../combat/arrow.js";
import { damageGoblin } from "../entities/goblin.js";

import { spawnDamageSparkles } from "../fx/sparkles.js";

import { updateHealFX, renderHealFX } from "../combat/heal.js";

import { loadStepEventsForMap } from "../core/eventEngine.js";
import map1Steps from "../core/events/map1Steps.js";
import map2Steps from "../core/events/map2Steps.js";
import map3Steps from "../core/events/map3Steps.js";
import map4Steps from "../core/events/map4Steps.js";
import map5steps from "./events/map5steps.js";
import map6Steps from "../core/events/map6Steps.js";
import map7Steps from "../core/events/map7Steps.js";
import map8Steps from "../core/events/map8Steps.js";
import map9Steps from "../core/events/map9Steps.js";
import { updateStepEvents } from "../core/eventEngine.js";
import { spawnSeraphineBoss, clearSeraphines, drawSeraphine, updateSeraphine, initSeraphine } from "../entities/seraphine.js";



export {
  waveConfigs,
  VICTORY_MESSAGES,
  VICTORY_SUBTITLES,
  getWaveSnapshotState,
  restoreWaveFromSnapshot,
  resetWaveSystem,
  incrementGoblinDefeated,
} from "./waveSystem.js";

// ------------------------------------------------------------
// ðŸŽ¥ LOCAL CAMERA STATE
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
// ðŸ§­ MAP-AWARE PLAYER SPAWN (Maps 1â€“9)
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
// ðŸŒ· INIT â€” called once when entering the Game screen
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

  const current = gameState.progress?.currentMap ?? 1;

  switch (current) {
    case 1: loadStepEventsForMap(1, map1Steps); break;
    case 2: loadStepEventsForMap(2, map2Steps); break;
    case 3: loadStepEventsForMap(3, map3Steps); break;
    case 4: loadStepEventsForMap(4, map4Steps); break;
    case 5: loadStepEventsForMap(5, map5Steps); break;
    case 6: loadStepEventsForMap(6, map6Steps); break;
    case 7: loadStepEventsForMap(7, map7Steps); break;
    case 8: loadStepEventsForMap(8, map8Steps); break;
    case 9: loadStepEventsForMap(9, map9Steps); break;
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
// ðŸ” UPDATE â€” synchronized world logic (OPTIMIZED)
// ============================================================

export function updateGame(delta) {
  if (gameState.paused) return;

  gameState.elapsedTime = (gameState.elapsedTime || 0) + delta / 1000;

  delta = Math.min(delta, 100);

  updateGoblins(delta);
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
  updatePlayer(delta);
  updateFloatingText(delta);
  updatePegasus(delta);
  updateLoot(delta);
  updateStepEvents();
  updateWaveSystem(delta).catch(err => {
    console.warn("updateWaveSystem failed:", err);
  });

  // ðŸ”® UPDATE SEEKER ORBS
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
// ðŸŽ¨ RENDER â€” ordered by layer depth + camera offset
// ============================================================

export function renderGame() {
  if (!ctx || !canvas) return;

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

  // ðŸš€ PULSE RINGS
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

  // ðŸ”® DRAW SEEKER ORBS
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
  updateAndDrawSpeechBubbles(ctx, 16);
  ctx.restore();
}

// ============================================================
// ðŸ§  VICTORY / DEFEAT CHECK
// ============================================================

function checkVictoryDefeat() {
  const p = gameState.player;
  if (!p) return;

  const hp = p.hp ?? 100;
  const lives = p.lives ?? 3;

  if (hp <= 0) {
    p.dead = true;
    gameState.paused = true;
    clearSpeechBubbles();
    setTimeout(() => stopGameplay("defeat"), 1500);
    return;
  }

  if (lives <= 0) {
    p.dead = true;
    gameState.paused = true;
    clearSpeechBubbles();
    setTimeout(() => stopGameplay("lives"), 1500);
    return;
  }

  // Victory is handled entirely in the wave system now
}

// ============================================================
// â™»ï¸ RESET COMBAT STATE â€” Try Again / Continue / New Map
// ============================================================

export function resetCombatState() {
  gameState.elapsedTime = 0;
  resetWaveKillTracking();
  gameState.victoryPending = false;

  const cur = gameState.progress?.currentMap ?? 1;

  switch (cur) {
    case 1: loadStepEventsForMap(1, map1Steps); break;
    case 2: loadStepEventsForMap(2, map2Steps); break;
    case 3: loadStepEventsForMap(3, map3Steps); break;
    case 4: loadStepEventsForMap(4, map4Steps); break;
    case 5: loadStepEventsForMap(5, map5Steps); break;
    case 6: loadStepEventsForMap(6, map6Steps); break;
    case 7: loadStepEventsForMap(7, map7Steps); break;
    case 8: loadStepEventsForMap(8, map8Steps); break;
    case 9: loadStepEventsForMap(9, map9Steps); break;
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

  initGoblins();
  initSpires();
  initProjectiles();
  clearSpeechBubbles();

  updateHUD();
}

// ============================================================
// ðŸ” RESET PLAYER STATE â€” used by "Try Again"
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

// Resize â†’ invalidate rect cache (production-safe)
window.addEventListener("resize", () => {
  cachedCanvasRect = null;
  rectCacheTimer = RECT_CACHE_DURATION;
});

export { applyMapSpawn };

// ============================================================
// ðŸŒŸ END OF FILE
// ============================================================

// ============================================================
// ðŸ› ï¸ DEBUG TOOL â€” Instant Victory (temporary, safe to remove)
// ============================================================
window.debugVictory = function () {
  try {
    console.log("âš¡ DEBUG: Forcing immediate victoryâ€¦");
    stopGameplay("victory");
  } catch (err) {
    console.warn("âš ï¸ debugVictory failed:", err);
  }
};


window.spawnSeraphine = (phase = 3, x, y) => {
  const p = gameState.player;
  const px = x ?? p?.pos.x ?? 0;
  const py = y ?? p?.pos.y ?? 0;

  console.log("⚡ Spawning Seraphine (phase:", phase, ") at", px, py);
  spawnSeraphineBoss(phase, px, py);
};

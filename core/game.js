// ============================================================
// 🌸 game.js — Olivia’s World: Crystal Keep (FULL — Floating Text Integrated + Pegasus)
// ------------------------------------------------------------
// ✦ Core game controller & system orchestration
// ✦ Initializes and coordinates all core modules
// ✦ Runs update + render loops (called by main.js)
// ✦ Player + Enemies + Towers rendered between layers
// ✦ Victory/Defeat system + resetCombatState()
// ✦ Floating combat text support (damage/heal popups)
// ✦ Pegasus ambient flight drawn above all layers
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
// NOTE: ensure ./pegasus.js exports loadPegasus, initPegasus, and drawPegasusFrame
import { loadPegasus, initPegasus, updatePegasus, drawPegasusFrame } from "./pegasus.js";
import { loadHealingGem, initHealingDrops, updateHealingDrops, drawHealingDrops } from "./pegasusDrop.js";




// ------------------------------------------------------------
// ⚙️ GLOBAL STATE IMPORTS
// ------------------------------------------------------------
import { gameState } from "../utils/gameState.js";
import { getMapPixelSize } from "./map.js";
import { stopGameplay } from "../main.js"; // used to stop game when win/lose
import { initGoblinDrops, updateGoblinDrops, drawGoblinDrops } from "./goblinDrop.js";
// ------------------------------------------------------------
// 🎥 LOCAL CAMERA STATE
// ------------------------------------------------------------
let canvas = null;
let ctx = null;

let cameraX = 0;
let cameraY = 0;

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

  // 2️⃣ Load Map
  await loadMap();

  // 3️⃣ Extract enemy path + apply
  const pathPoints = extractPathFromMap();
  setEnemyPath(pathPoints);

  // 4️⃣ Initialize subsystems
  initEnemies();
  initTowers();
  initProjectiles();
  

  // 5️⃣ Player setup
  initPlayerController(canvas);
  initUI();

  // 6️⃣ Pegasus ambient flight (load once, then init with ctx)
  await loadPegasus();
  initPegasus(ctx);
  await loadPegasus();
  initPegasus(ctx);
  await loadHealingGem();      // 💎 Load the gem image
  initHealingDrops(ctx);
  initGoblinDrops(ctx);

  console.log("🌸 game.js — Initialization complete.");
}

// ============================================================
// 🔁 UPDATE — synchronized world logic
// ============================================================
export function updateGame(delta) {
  delta = Math.min(delta, 100);

  // Update all systems
  updateEnemies(delta);
  updateTowers(delta);
  updateProjectiles(delta);
  updateHUD();
  updatePlayer(delta);
  updateFloatingText(delta);
  updatePegasus(delta);
  updateHealingDrops(delta);
  updateGoblinDrops(delta);
   // 💬 Floating text movement + fade

  // 🎥 Camera follow player
  const px = gameState.player?.pos?.x ?? 0;
  const py = gameState.player?.pos?.y ?? 0;

  cameraX = Math.floor(px - canvas.width / 2);
  cameraY = Math.floor(py - canvas.height / 2);

  // Clamp camera within map bounds
  const { width: mapW, height: mapH } = getMapPixelSize();
  cameraX = Math.max(0, Math.min(mapW - canvas.width, cameraX));
  cameraY = Math.max(0, Math.min(mapH - canvas.height, cameraY));

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

  drawEnemies(ctx);
  drawTowers(ctx);
  drawPlayer(ctx);
  drawProjectiles(ctx);
  drawFloatingText(ctx); // 💬 draw floating damage/heal numbers
  drawHealingDrops(ctx);
  drawGoblinDrops(ctx);

  ctx.restore();

  // 3️⃣ Foreground canopy / trees layer (map overlay)
  drawMapLayered(ctx, "trees", cameraX, cameraY, canvas.width, canvas.height);

  // 4️⃣ Pegasus drawn LAST so it stays visible above all (screen-space)
  // If your drawPegasusFrame expects world-space, move it between save()/restore() instead.
  try {
    if (typeof drawPegasusFrame === "function") {
      drawPegasusFrame(ctx);
    }
  } catch (e) {
    // Non-fatal: if pegasus.js hasn't exported drawPegasusFrame yet, skip draw
    // (loadPegasus/initPegasus still run; you can expose drawPegasusFrame later)
  }
}

// ============================================================
// 🧠 VICTORY / DEFEAT CONDITIONS (with 5s Defeat Delay)
// ============================================================
function checkVictoryDefeat() {
  const playerHP = gameState.player?.hp ?? 100;
  const lives = gameState.player?.lives ?? 3;

  // 💀 Player HP reached 0
  if (playerHP <= 0) {
    console.log("💀 Player defeated! Waiting 5 seconds before showing defeat screen...");
    gameState.player.dead = true; // mark as dead so no re-trigger

    // Stop player movement & input immediately
    gameState.paused = true;

    // ⏳ Delay defeat overlay
    setTimeout(() => {
      stopGameplay("defeat");
    }, 2000); // 5-second cinematic delay

    return; // prevent other checks
  }

  // 💔 All lives lost
  if (lives <= 0) {
    console.log("💔 No lives remaining! Waiting 5 seconds before showing defeat screen...");
    gameState.player.dead = true;
    gameState.paused = true;

    setTimeout(() => {
      stopGameplay("lives");
    }, 2000);

    return;
  }

  // 🏆 Victory condition
  if (goblinsDefeated >= 50) {
    console.log("🏆 Victory condition reached!");
    stopGameplay("victory");
  }
}


// ============================================================
// ♻️ RESET COMBAT STATE (used by Try Again + New Story)
// ------------------------------------------------------------
// Ensures both buttons fully reset the player and systems.
// Keeps gold and diamonds intact while reinitializing combat.
// ============================================================
export function resetCombatState() {
  goblinsDefeated = 0;

  if (gameState.player) {
    const p = gameState.player;
    p.pos = { x: 1000, y: 500 }; // your normal spawn position
    p.hp = p.maxHp ?? 100;
    p.mana = p.maxMana ?? 50;
    p.lives = 10;
    p.dead = false;          // 💀 clear death flag
    p.facing = "right";      // reset facing
  }

  // 🧭 Clear player controller state manually
  if (typeof window !== "undefined") {
    if (window.__enemies) window.__enemies.length = 0; // clear old enemies
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

  // 🧩 Re-initialize combat systems
  initEnemies();
  initTowers();
  initProjectiles();

  // UI refresh
  updateHUD();
  console.log("♻️ Combat state fully reset (Try Again / New Story).");
}

// ============================================================
// 🔁 RESET PLAYER STATE — used by "Try Again"
// ------------------------------------------------------------
// Soft reset: restores HP, Mana, and clears death state.
// Keeps current map, towers, and enemies in place.
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

  updateHUD();
  console.log("🎮 Player revived — soft reset (Try Again).");
}
// ============================================================
// 🌟 END OF FILE
// ============================================================

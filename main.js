// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep (Fixed Timestep + Map System)
// ------------------------------------------------------------
// ✦ Stutter-free fixed timestep game loop (60Hz update / RAF render)
// ✦ Complete multi-map support (Map One → Map Nine + Credits)
// ✦ Victory Continue unlocks next map & moves player forward
// ✦ Fully compatible with all overlays, hub, story, navbar
// ============================================================

import { 
  initGame, 
  updateGame, 
  renderGame,
  resetCombatState
} from "./core/game.js";

import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";
import { initTooltipSystem } from "./core/tooltip.js";
import { showScreen } from "./core/screens.js";
import { 
  gameState, 
  getCurrencies, 
  spendDiamonds, 
  unlockMap,
  setCurrentMap,
  saveProfiles
} from "./utils/gameState.js";
import { updateBraveryBar, updateHUD } from "./core/ui.js";
import { startGoblinIntroStory } from "./core/story.js";
import { initNavbar } from "./core/navbar.js";
import { applyMapSpawn } from "./core/game.js";
import { initCredits } from "./core/credits.js";
import { getOgres } from "./core/ogre.js";
import { getElites } from "./core/elite.js";
import { getWorg } from "./core/worg.js";
import { getCrossbows } from "./core/crossbow.js";

// ============================================================
// 🎮 GLOBAL GAME LOOP STATE
// ============================================================
export let gameActive = false;

// ============================================================
// ⏱ FIXED TIMESTEP VARIABLES
// ============================================================
let lastTimestamp = 0;
let accumulator = 0;
const FIXED_DT = 1000 / 60; // 60Hz update interval

// ============================================================
// 🎯 MAIN GAME LOOP
// ============================================================
function gameLoop(timestamp) {
  if (!gameActive) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  let delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (delta > 100) delta = 100; // avoid tab-switch jumps
  accumulator += delta;

  // 🔁 FIXED 60Hz update loop
  while (accumulator >= FIXED_DT) {
    if (!gameState.paused) updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // 🎨 Render once per RAF
  renderGame();

  window.__gameLoopID = requestAnimationFrame(gameLoop);
}

// ============================================================
// ▶️ START GAMEPLAY
// ============================================================
export function startGameplay() {
  cancelAnimationFrame(window.__gameLoopID);

  gameActive = true;
  gameState.paused = false;

  lastTimestamp = performance.now();
  accumulator = 0;

  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🎮 Gameplay loop started!");

  // Intro story once
  if (!gameState.goblinIntroPlayed) {
    gameState.goblinIntroPlayed = true;
    gameState.paused = true;
    startGoblinIntroStory().then(() => {
      gameState.paused = false;
      console.log("📖 Goblin intro finished — battle continues.");
    });
  }
}

// ============================================================
// ⛔ STOP GAMEPLAY (victory / defeat / exit)
// ============================================================
export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;

  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = true;

  console.log(`🛑 Gameplay stopped: ${reason}`);

  // ----------------------------------------------------------
  // 🏠 SAFE EXIT TO HUB (navbar home)
// ----------------------------------------------------------
  if (reason === "exit") {

    // ⭐ CLEANUP: Close maps overlay PROPERLY
    const ov = document.getElementById("overlay-maps");
    if (ov) {
      ov.classList.remove("active");
      ov.style.pointerEvents = "none";   // the ONE needed fix
    }

    // existing cleanup
    document.getElementById("end-screen")?.remove();
    document.querySelectorAll(".end-overlay").forEach(el => el.remove?.());

    showScreen("hub-screen");
    setTimeout(() => initHub(), 50);
    console.log("🏠 Returned to Hub (safe exit).");
    return;
  }

  // ----------------------------------------------------------
  // 🏆 VICTORY — show victory end screen
  // ----------------------------------------------------------
  if (reason === "victory") {
    console.log("🏆 Victory triggered — showing victory end screen.");

    // Clean previous overlays to avoid blank-screen
    document.querySelectorAll(".end-overlay, #end-screen")
      .forEach(el => el.remove?.());

    // Now show the victory end-screen
    showEndScreen("victory");
    return;
  }

  // ----------------------------------------------------------
  // 💀 DEFEAT — use defeat end screen
  // ----------------------------------------------------------
  showEndScreen(reason);
}

// ============================================================
// 🌟 FULL NEW GAME RESET (Use this for Start New Story)
// ============================================================
export function fullNewGameReset() {
  console.log("🔄 FULL NEW GAME RESET — fresh character");

  // ----------------------------------------------------------
  // 1️⃣ Reset runtime & progression
  // ----------------------------------------------------------
  // Keep existing map unlocks, ONLY reset the story position
  gameState.progress.currentMap = 1;

  // Ensure progress exists on profile
  if (!gameState.profile.progress) {
    gameState.profile.progress = {
      currentMap: 1,
      mapsUnlocked: gameState.progress.mapsUnlocked ||
        [true, false, false, false, false, false, false, false, false]
    };
  } else {
    // Reset only story position
    gameState.profile.progress.currentMap = 1;

    // Preserve map unlocks if they already existed
    if (gameState.profile.progress.mapsUnlocked) {
      gameState.progress.mapsUnlocked = [...gameState.profile.progress.mapsUnlocked];
    }
  }

  // ----------------------------------------------------------
  // 2️⃣ Reset the player to a FRESH character, but KEEP skins
  // ----------------------------------------------------------
  const prevSkin     = gameState.player?.skin || "glitter";
  const prevUnlocked = gameState.player?.unlockedSkins ?? ["glitter"];

  gameState.player = {
    name: gameState.profile.name || "Olivia",
    level: 1,
    xp: 0,
    maxHp: 100,
    hp: 100,
    maxMana: 50,
    mana: 50,
    lives: 10,
    facing: "right",
    dead: false,
    pos: { x: 0, y: 0 },

    // ⭐ Restore skin data
    skin: prevSkin,
    unlockedSkins: prevUnlocked,
  };

  // ⭐ Save FULL snapshot to profile (Codex Issue #3)
  gameState.profile.player = { ...gameState.player };

  // ----------------------------------------------------------
  // 💰 2B — RESET GOLD FOR A NEW GAME
  // ----------------------------------------------------------
  if (gameState.profile?.currencies) {
    gameState.profile.currencies.gold = 0;   // or any start value
  }
  // Diamonds intentionally NOT reset — they’re a meta reward

  // ----------------------------------------------------------
  // 💖 RESET BRAVERY METER
  // ----------------------------------------------------------
  gameState.bravery = {
    current: 0,
    max: 100,
    charged: false,
    draining: false
  };
  
  // ----------------------------------------------------------
  // 3️⃣ Reset all unlocks / systems
  // ----------------------------------------------------------
  gameState.profile.turretsUnlocked = {
    crystal: true,
    frost: false,
    flame: false,
    arcane: false,
    moon: false,
  };

  // Reset wave/story flags
  gameState.goblinIntroPlayed = false;

  if (gameState.waveStoryFlags) {
    for (let m in gameState.waveStoryFlags) {
      gameState.waveStoryFlags[m] = { 1: false, 5: false };
    }
  }

  // ----------------------------------------------------------
  // 4️⃣ Reset temporary session
  // ----------------------------------------------------------
  gameState.session = null;

  // ----------------------------------------------------------
  // 5️⃣ Save profile so fresh state persists
  // ----------------------------------------------------------
  saveProfiles();

  console.log("🌟 New character created: Level 1, Map 1, Fresh progress.");
}

// ============================================================
// 🌟 START NEW GAME — run when user clicks "New Story"
// ============================================================
export async function startNewGameStory() {
  console.log("🌟 Starting NEW GAME STORY…");

  // 1️⃣ Reset all persistent + runtime data
  fullNewGameReset();

  // 2️⃣ Switch UI to the game screen
  showScreen("game-container");

  // 3️⃣ Full game system reload
  await initGame();

  // 4️⃣ Start gameplay on Map 1
  startGameplay();

  console.log("🌸 New Game Story loaded — Map 1 active.");
}

// ============================================================
// 🔁 RESET GAMEPLAY (Try Again)
// ============================================================
export async function resetGameplay() {
  console.log("🔄 Combat reset!");

  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = false;

  const p = gameState.player || (gameState.player = {});

  // Restore stats
  p.hp = p.maxHp ?? 100;
  p.mana = p.maxMana ?? 50;
  p.lives = 10;
  p.dead = false;
  p.facing = "right";

  // ==========================================================
  // 🌊 FULL WAVE SYSTEM RESET
  // ==========================================================

  // Reset ogres / elites / worg
  if (window.getOgres) {
    const ogres = getOgres();
    if (ogres?.length) ogres.length = 0;
  }

  if (window.getElites) {
    const elites = getElites();
    if (elites?.length) elites.length = 0;
  }

  // 🐺 Always clear Worgs via imported helper
  {
    const worg = getWorg();
    if (worg?.length) worg.length = 0;
  }

  {
    const crossbow = getCrossbows();
    if (crossbow?.length) crossbow.length = 0;
  }

  // Reset goblins fully
  if (typeof initEnemies === "function") {
    initEnemies();
  }

  // ⭐ Reset bravery
  if (gameState.bravery) {
    gameState.bravery.current = 0;
    gameState.bravery.charged = false;
    gameState.bravery.draining = false;
  }

  updateBraveryBar?.();

  // ⭐ Correct spawn for map
  if (typeof applyMapSpawn === "function") {
    applyMapSpawn();
  }

  document.getElementById("end-screen")?.remove();
  resetCombatState();

  // ==========================================================
  // ⭐ NEW — RE-INIT GAME AS RETRY
  // ==========================================================
  const gameMod = await import("./core/game.js");
  await gameMod.initGame("retry");

  lastTimestamp = performance.now();
  accumulator = 0;

  gameActive = true;
  window.__gameLoopID = requestAnimationFrame(gameLoop);

  console.log("🌸 Restart complete.");
}

// ============================================================
// 💎 CONTINUE WITH DIAMONDS
// ============================================================
function tryContinueWithDiamonds() {
  const p = gameState.player;
  const c = getCurrencies();

  if (c.diamonds >= 25 && spendDiamonds(25)) {
    console.log("💎 Continue purchased!");

    document.getElementById("end-screen")?.remove();

    p.hp = p.maxHp;
    p.lives = 10;
    p.dead = false;

    updateHUD();
    gameState.paused = false;
    startGameplay();

    const msg = document.createElement("div");
    msg.textContent = "✨ The Crystal restores your strength!";
    Object.assign(msg.style, {
      position: "fixed",
      top: "40%", width: "100%",
      textAlign: "center",
      fontSize: "24px",
      color: "#fff2b3",
      textShadow: "0 0 10px #fff",
      zIndex: 9999,
    });
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);

  } else {
    const warn = document.createElement("div");
    warn.textContent = "💎 You need 25 diamonds to continue!";
    Object.assign(warn.style, {
      position: "fixed",
      top: "40%", width: "100%",
      textAlign: "center",
      fontSize: "22px",
      color: "#ff99b9",
      textShadow: "0 0 8px #fff",
      zIndex: 9999,
    });
    document.body.appendChild(warn);
    setTimeout(() => warn.remove(), 2000);
  }
}

// ============================================================
// 🕯 END SCREEN (Victory / Defeat) — CLEAN + FULLY FIXED
// ============================================================
function showEndScreen(reason) {
  // Remove old overlays (safety)
  document.querySelectorAll(".end-overlay, #end-screen").forEach(el => el.remove());

  // Overlay container
  const overlay = document.createElement("div");
  overlay.id = "end-screen";
  overlay.className = "end-overlay";
  document.body.appendChild(overlay);

  // Panel
  const panel = document.createElement("div");
  panel.className = "end-panel";
  overlay.appendChild(panel);

  // Title + subtitle
  const title = document.createElement("h1");
  const subtitle = document.createElement("p");

  // Buttons container
  const buttons = document.createElement("div");
  buttons.className = "end-buttons";

  // ---------------------------
  // 🎭 Victory / Defeat Messages
  // ---------------------------
  if (reason === "victory") {
    title.textContent = "You have held back the goblin forces — for now…";
    subtitle.textContent = "You return to the Crystal Keep to regroup.";
  } else if (reason === "defeat" || reason === "lives") {
    title.textContent = "Sorry, Princess…";
    subtitle.textContent = "Your strength fades as the goblins overwhelm you.";
  } else {
    title.textContent = "Game Ended";
    subtitle.textContent = "";
  }

  // ---------------------------
  // 🖼 Image
  // ---------------------------
  const skinKey = gameState?.profile?.cosmetics?.skin || "glitter";
  const folder = skinKey;

  const img = document.createElement("img");
  img.src = (reason === "victory")
    ? `./assets/images/sprites/${folder}/${folder}_attack_right.png`
    : `./assets/images/sprites/${folder}/${folder}_slain.png`;

  img.style.display = "block";
  img.style.margin = "20px auto 35px auto";
  img.style.width = "180px";
  img.style.filter = "drop-shadow(0 0 12px #ffffffaa)";
  // ============================================================
  // ⭐ BUTTONS
  // ============================================================

  // ---------------------------
  // ⭐ VICTORY → Continue to next map
  // ---------------------------
  if (reason === "victory") {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Continue";

    nextBtn.onclick = async () => {
      const currentMap = gameState.progress.currentMap ?? 1;
      const nextMap = currentMap + 1;

      console.log(`🏆 Victory on Map ${currentMap}`);

      gameState.shardsCollected = 0;          // if you track shard count
      gameState.towerBuff = 1;                // reset any buff to normal
      window.towerDamageMultiplier = 1;  
      

      // --------------------------------------------------------
      // 💎✨ DIAMOND REWARD FOR VICTORY (now persistent)
      // --------------------------------------------------------
      const reward = 100;
      gameState.profile.currencies.diamonds += reward;
      saveProfiles();

      const rewardMsg = document.createElement("div");
      rewardMsg.textContent = `💎 +${reward} Diamonds`;
      Object.assign(rewardMsg.style, {
        position: "fixed",
        top: "45%", width: "100%",
        textAlign: "center",
        fontSize: "28px",
        color: "#b7f3ff",
        textShadow: "0 0 12px #00faff",
        pointerEvents: "none",
        zIndex: 9999,
      });
      document.body.appendChild(rewardMsg);
      setTimeout(() => rewardMsg.remove(), 2000);

      // --------------------------------------------------------
      // 🎬 If map 9 is finished → credits
      // --------------------------------------------------------
      if (nextMap > 9) {
        document.getElementById("end-screen")?.remove();
        showScreen("credits-screen");
        console.log("🎬 Showing credits…");
        return;
      }

      // Unlock and switch to next map
      unlockMap(nextMap);
      gameState.progress.currentMap = nextMap;

      // Update SAVE progress
      if (!gameState.profile.progress) gameState.profile.progress = {};
      gameState.profile.progress.currentMap = nextMap;

      // Persist to disk
      saveProfiles();

      console.log(`🌍 Switching to Map ${nextMap}...`);

      document.getElementById("end-screen")?.remove();
      showScreen("game-container");

      await initGame();
      startGameplay();
    };

    buttons.append(nextBtn);

  } else {
    // 💎 Continue with Diamonds
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue (25 💎)";
    continueBtn.onclick = tryContinueWithDiamonds;

    // 🔁 Retry (Try Again)
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Try Again";
    retryBtn.onclick = () => {
      document.getElementById("end-screen")?.remove();
      resetGameplay();
    };

    // 🏠 Return to Hub
    const hubBtn = document.createElement("button");
    hubBtn.textContent = "Return to Hub";
    hubBtn.onclick = () => {
      document.getElementById("end-screen")?.remove();
      showScreen("hub-screen");
      setTimeout(() => initHub(), 50);
    };

    buttons.append(continueBtn, retryBtn, hubBtn);
  }

  // Assemble panel
  panel.append(title, subtitle, img, buttons);

  // Fade-in
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

// ============================================================
// 🌼 INITIALISATION — runs once on page load
// ============================================================
window.addEventListener("DOMContentLoaded", () => {
  initMusic();
  initLanding();
  initProfiles();
  initHub();
  initGame();
  initSparkles();
  initSettings();
  initNavbar();
  initTooltipSystem();
  initCredits();
  console.log("🌸 Olivia’s World loaded — menu systems active");
});

// ============================================================
// 🌟 END OF FILE
// ============================================================

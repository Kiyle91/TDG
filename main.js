// ============================================================
// 🌸 main.js — Olivia’s World: Crystal Keep (Polished Edition)
// ------------------------------------------------------------
// ✦ Fixed timestep 60Hz game loop
// ✦ Full multi-map system (1 → 9 + Credits)
// ✦ Clean retry cycle, victory flow, safe exit
// ✦ Unified goblin reset logic
// ✦ Fully stable story, HUD, navbar, overlays
// ✦ All console logs removed for production
// ============================================================

import { 
  initGame, 
  updateGame, 
  renderGame,
  resetCombatState,
  applyMapSpawn
} from "./core/game.js";

import { initLanding } from "./core/landing.js";
import { initProfiles } from "./core/profile.js";
import { initHub } from "./core/hub.js";
import { initSparkles } from "./core/sparkles.js";
import { initSettings } from "./core/settings.js";
import { initMusic } from "./core/soundtrack.js";
import { showScreen } from "./core/screens.js";

import { 
  gameState, 
  getCurrencies, 
  spendDiamonds, 
  unlockMap,
  saveProfiles
} from "./utils/gameState.js";

import { updateBraveryBar, updateHUD } from "./core/ui.js";
import { startGoblinIntroStory } from "./core/story.js";
import { initNavbar } from "./core/navbar.js";
import { initCredits } from "./core/credits.js";

import { getOgres } from "./core/ogre.js";
import { getElites } from "./core/elite.js";
import { getWorg } from "./core/worg.js";
import { getCrossbows } from "./core/crossbow.js";
import { initGoblins } from "./core/goblin.js";

// ============================================================
// 🎮 GLOBAL GAME LOOP STATE
// ============================================================

export let gameActive = false;

// ============================================================
// ⏱ FIXED TIMESTEP VARIABLES
// ============================================================

let lastTimestamp = 0;
let accumulator = 0;
const FIXED_DT = 1000 / 60;

// ============================================================
// 🎯 MAIN GAME LOOP
// ============================================================

function gameLoop(timestamp) {
  if (!gameActive) return;

  if (!lastTimestamp) lastTimestamp = timestamp;
  let delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (delta > 100) delta = 100;
  accumulator += delta;

  while (accumulator >= FIXED_DT) {
    if (!gameState.paused) updateGame(FIXED_DT);
    accumulator -= FIXED_DT;
  }

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

  if (!gameState.goblinIntroPlayed) {
    gameState.goblinIntroPlayed = true;
    gameState.paused = true;

    startGoblinIntroStory().then(() => {
      gameState.paused = false;
    });
  }
}

// ============================================================
// ⛔ STOP GAMEPLAY (Victory / Defeat / Exit)
// ============================================================

export function stopGameplay(reason = "unknown") {
  if (!gameActive) return;

  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = true;

  clearEndScreens();

  if (reason === "exit") {
    showScreen("hub-screen");
    setTimeout(initHub, 50);
    return;
  }

  if (reason === "victory") {
    showEndScreen("victory");
    return;
  }

  showEndScreen(reason);
}

// ============================================================
// 🧹 Clear all end-screen overlays
// ============================================================

function clearEndScreens() {
  document.querySelectorAll(".end-overlay, #end-screen")
    .forEach(el => el.remove?.());
}

// ============================================================
// 🌟 FULL NEW GAME RESET (Reset progress, keep diamonds)
// ============================================================

export function fullNewGameReset() {
  if (!gameState.profile) return;

  const profile = gameState.profile;

  // 🌸 Preserve premium currency (diamonds)
  const diamonds = profile.currencies?.diamonds ?? 0;

  // 🌸 Preserve cosmetics
  const prevSkin = gameState.player?.skin || "glitter";
  const prevUnlocked = gameState.player?.unlockedSkins ?? ["glitter"];

  // ------------------------------------------------------------
  // 🗺️ Reset Campaign Progress
  // ------------------------------------------------------------
  const freshMaps = [true, false, false, false, false, false, false, false, false];

  gameState.progress.currentMap = 1;
  gameState.progress.mapsUnlocked = [...freshMaps];

  profile.progress = {
    currentMap: 1,
    mapsUnlocked: [...freshMaps],
    // Optional: exploration reset (safe to include)
    exploration: {
      echoes: [],
      crystalsFound: 0,
      secretsFound: 0,
      visitedTiles: []
    }
  };

  // ------------------------------------------------------------
  // 🧍 Reset Player Gameplay Stats (cosmetics restored after)
  // ------------------------------------------------------------

  gameState.player = {
    name: profile.name || "Olivia",
    level: 1,
    xp: 0,
    maxHp: 100,
    hp: 100,
    maxMana: 50,
    mana: 50,
    lives: 10,
    dead: false,
    facing: "right",
    pos: { x: 0, y: 0 },
    skin: prevSkin,
    unlockedSkins: prevUnlocked,
  };

  profile.player = { ...gameState.player };

  // ------------------------------------------------------------
  // 💰 Reset Gold Only — Diamonds Persist
  // ------------------------------------------------------------

  profile.currencies = {
    gold: 0,
    diamonds: diamonds
  };

  // ------------------------------------------------------------
  // ⚔️ Reset Bravery
  // ------------------------------------------------------------

  gameState.bravery = {
    current: 0,
    max: 100,
    charged: false,
    draining: false
  };

  // ------------------------------------------------------------
  // 🏰 Reset Spire Unlocks (tower progression)
  // ------------------------------------------------------------

  profile.spiresUnlocked = {
    crystal: true,
    frost: false,
    flame: false,
    arcane: false,
    light: false,   // Beacon of Light (matches future unlock)
    moon: false,
  };

  // ------------------------------------------------------------
  // 🎬 Story Flags
  // ------------------------------------------------------------

  gameState.goblinIntroPlayed = false;

  // Save
  saveProfiles();
}


// ============================================================
// 🌟 START NEW GAME STORY
// ============================================================

export async function startNewGameStory() {
  fullNewGameReset();
  showScreen("game-container");

  await initGame();
  startGameplay();
}

// ============================================================
// 🔁 RESET GAMEPLAY (Try Again)
// ============================================================

export async function resetGameplay() {
  cancelAnimationFrame(window.__gameLoopID);
  gameActive = false;
  gameState.paused = false;

  const p = gameState.player;

  p.hp = p.maxHp;
  p.mana = p.maxMana;
  p.lives = 10;
  p.dead = false;
  p.facing = "right";

  function clearList(getter) {
    const arr = getter();
    if (Array.isArray(arr)) arr.length = 0;
  }

  clearList(getOgres);
  clearList(getElites);
  clearList(getWorg);
  clearList(getCrossbows);

  initGoblins();

  gameState.bravery.current = 0;
  gameState.bravery.charged = false;
  gameState.bravery.draining = false;

  updateBraveryBar();

  clearEndScreens();
  resetCombatState();

  const gameMod = await import("./core/game.js");
  await gameMod.initGame("retry");

  lastTimestamp = performance.now();
  accumulator = 0;

  gameActive = true;
  window.__gameLoopID = requestAnimationFrame(gameLoop);
}

// ============================================================
// 💎 CONTINUE WITH DIAMONDS
// ============================================================

function tryContinueWithDiamonds() {
  const p = gameState.player;
  const c = getCurrencies();

  if (c.diamonds >= 25 && spendDiamonds(25)) {
    document.getElementById("end-screen")?.remove();

    p.hp = p.maxHp;
    p.lives = 10;
    p.dead = false;

    updateHUD();
    gameState.paused = false;
    startGameplay();

    showTempMsg("✨ The Crystal restores your strength!");
  } else {
    showTempMsg("💎 You need 25 diamonds to continue!");
  }
}

function showTempMsg(text) {
  const msg = document.createElement("div");
  msg.textContent = text;
  Object.assign(msg.style, {
    position: "fixed",
    top: "40%",
    width: "100%",
    textAlign: "center",
    fontSize: "24px",
    color: "#fff",
    zIndex: 9999,
  });
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// ============================================================
// 🕯 END SCREEN (Victory / Defeat)
// ============================================================

function showEndScreen(reason) {
  clearEndScreens();

  const overlay = document.createElement("div");
  overlay.id = "end-screen";
  overlay.className = "end-overlay";
  document.body.appendChild(overlay);

  const panel = document.createElement("div");
  panel.className = "end-panel";
  overlay.appendChild(panel);

  const title = document.createElement("h1");
  const subtitle = document.createElement("p");
  const buttons = document.createElement("div");
  buttons.className = "end-buttons";

  if (reason === "victory") {
    title.textContent = "You have held back the goblin forces — for now…";
    subtitle.textContent = "You return to the Crystal Keep to regroup.";
  } else if (reason === "defeat" || reason === "lives") {
    title.textContent = "Sorry, Princess…";
    subtitle.textContent = "Your strength fades as the goblins overwhelm you.";
  } else {
    title.textContent = "Game Ended";
  }

  const skinKey = gameState?.profile?.cosmetics?.skin || "glitter";
  const img = document.createElement("img");
  img.src = (reason === "victory")
    ? `./assets/images/sprites/${skinKey}/${skinKey}_attack_right.png`
    : `./assets/images/sprites/${skinKey}/${skinKey}_slain.png`;

  img.style.display = "block";
  img.style.margin = "20px auto 35px auto";
  img.style.width = "180px";
  img.style.filter = "drop-shadow(0 0 12px #ffffffaa)";

  // ======================================================
  // ⭐ BUTTONS
  // ======================================================

  if (reason === "victory") {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Continue";

    nextBtn.onclick = async () => {
      const currentMap = gameState.progress.currentMap ?? 1;
      const nextMap = currentMap + 1;

      gameState.shardsCollected = 0;
      gameState.spireBuff = 1;
      window.spireDamageMultiplier = 1;

      if (!gameState.profile.currencies)
        gameState.profile.currencies = { gold: 0, diamonds: 0 };

      gameState.profile.currencies.diamonds += 100;
      gameState.profile.currencies.gold = 0;
      saveProfiles();

      showTempMsg("💎 +100 Diamonds");

      if (nextMap > 9) {
        overlay.remove();      // 🔄 Hide overlay so credits are visible
        showScreen("credits-screen");
        return;
      }

      unlockMap(nextMap);
      gameState.progress.currentMap = nextMap;
      gameState.profile.progress.currentMap = nextMap;
      saveProfiles();

      overlay.remove();
      showScreen("game-container");

      await initGame();
      startGameplay();
    };

    buttons.append(nextBtn);

  } else {
    const cont = document.createElement("button");
    cont.textContent = "Continue (25 💎)";
    cont.onclick = tryContinueWithDiamonds;

    const retry = document.createElement("button");
    retry.textContent = "Try Again";
    retry.onclick = () => {
      document.getElementById("end-screen")?.remove();
      resetGameplay();
    };

    const hub = document.createElement("button");
    hub.textContent = "Return to Hub";
    hub.onclick = () => {
      document.getElementById("end-screen")?.remove();
      showScreen("hub-screen");
      setTimeout(initHub, 50);
    };

    buttons.append(cont, retry, hub);
  }

  panel.append(title, subtitle, img, buttons);

  requestAnimationFrame(() => overlay.classList.add("visible"));
}

// ============================================================
// 🌼 INITIALISATION — page load
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
  initCredits();
});


// ============================================================
// CONSOLE LOG
// ============================================================

console.log("🌸 Olivia’s World: Crystal Keep (Polished Edition) Loaded.");

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep (FINAL POLISHED BUILD + Turret Unlocks)
// ------------------------------------------------------------
// ✦ Handles all hub buttons, overlays, and transitions
// ✦ Adds turret unlocks that update dynamically by level
// ✦ Keeps full currency + profile updates
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay, gameActive, stopGameplay } from "../main.js";
import { getCurrencies, gameState } from "../utils/gameState.js";
import { showOverlay } from "./ui.js";
import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { updateStatsOverlay } from "./ui.js";
import { initSettingsMenu } from "./ui.js";
import { playFairySprinkle } from "./soundtrack.js";
import { resetCombatState } from "./game.js";
import { createPlayer } from "./player.js";
import { fullNewGameReset, startNewGameStory } from "../main.js";

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initHub() {
  const hub = document.getElementById("hub-screen");
  if (!hub) return;

  // 🎯 Buttons
  const newStoryBtn = document.getElementById("new-story-btn");
  const loadGameBtn = document.getElementById("load-game-btn");
  const mapsBtn = document.getElementById("maps-btn");
  const turretsBtn = document.getElementById("turrets-btn");
  const skinsBtn = document.getElementById("skins-btn");
  const statsBtn = document.getElementById("stats-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const exitBtn = document.getElementById("exit-hub-btn");

  initChest();
  initSettingsMenu();
  updateHubCurrencies();
  updateHubProfile();
  updateTurretUnlocks();

  // 🩵 Safety check
  if (
    !newStoryBtn || !loadGameBtn || !mapsBtn ||
    !turretsBtn || !skinsBtn || !statsBtn ||
    !settingsBtn || !exitBtn
  ) {
    console.warn("⚠️ Hub buttons missing!");
    return;
  }

  // ------------------------------------------------------------
  // 🎮 HUB ACTIONS
  // ------------------------------------------------------------

  // 🏰 NEW STORY — full cleanup before story intro
  newStoryBtn.addEventListener("click", () => {
    console.log("🩷 Prompting story confirmation...");
    playFairySprinkle();

    showConfirm(
      "Are you sure you want to start a new story?",
      () => {
        console.log("📖 New Story confirmed — cleaning old session...");

        // 1️⃣ Stop any running gameplay loop
        if (gameActive) stopGameplay("restart");

        // 2️⃣ Remove leftover overlays (defeat/victory)
        document.querySelectorAll("#end-screen, .end-overlay").forEach(el => el.remove());

        // 3️⃣ Reset combat + player state
        fullNewGameReset();
        resetCombatState();
        startNewGameStory();

        // 4️⃣ Start fresh story intro

        playFairySprinkle();
        console.log("✨ New Story sequence started fresh.");
      },
      () => console.log("❎ New Story cancelled")
    );
  });

  // 💾 LOAD GAME — open save overlay
  loadGameBtn.addEventListener("click", () => {
    console.log("💾 Load Game overlay");
    playFairySprinkle();
    showOverlay("overlay-load");
  });

  // 🗺️ MAPS — open map selection overlay
  mapsBtn.addEventListener("click", () => {
    console.log("🗺️ Maps overlay");
    playFairySprinkle();
    showOverlay("overlay-maps");
  });

  // 🏹 TURRETS — open turret selection overlay
  turretsBtn.addEventListener("click", () => {
    console.log("🏹 Turrets overlay");
    playFairySprinkle();
    updateTurretUnlocks();
    showOverlay("overlay-turrets");
  });

  // 🎨 SKINS — open skin selector
  skinsBtn.addEventListener("click", () => {
    console.log("🎨 Skins overlay");
    playFairySprinkle();
    showOverlay("overlay-skins");
  });

  // 📜 STATS — open stats overlay
  statsBtn.addEventListener("click", () => {
    console.log("📜 Stats overlay");
    playFairySprinkle();
    updateStatsOverlay();
    showOverlay("overlay-stats");
  });

  // ⚙️ SETTINGS — open settings overlay
  settingsBtn.addEventListener("click", () => {
    playFairySprinkle();
    console.log("⚙️ Settings overlay");
    showOverlay("overlay-settings");
  });

  // 🚪 EXIT — confirmation before leaving the hub
  exitBtn.addEventListener("click", () => {
    console.log("🩷 Prompting exit confirmation...");
    playFairySprinkle();

    showConfirm(
      "Are you sure you want to exit to the profile screen?",
      () => {
        console.log("🚪 Exit confirmed — returning to profile...");
        fadeOut(hub, () => {
          showScreen("profile-screen");
        });
      },
      () => console.log("❎ Exit cancelled")
    );
  });

  console.log("🏰 Hub ready — all buttons linked");
}

// ------------------------------------------------------------
// 🌈 FADE HELPERS
// ------------------------------------------------------------
function fadeOut(element, callback) {
  element.style.transition = "opacity 0.8s ease";
  element.style.opacity = 0;
  setTimeout(() => {
    element.style.display = "none";
    if (callback) callback();
  }, 800);
}

// ------------------------------------------------------------
// 💰 CURRENCY UPDATE
// ------------------------------------------------------------
export function updateHubCurrencies() {
  const { gold, diamonds } = getCurrencies();
  const goldEl = document.getElementById("hub-gold");
  const diamondEl = document.getElementById("hub-diamonds");
  if (goldEl) goldEl.textContent = `Gold: ${gold}`;
  if (diamondEl) diamondEl.textContent = `Diamonds: ${diamonds}`;
}

// ------------------------------------------------------------
// 👑 PROFILE UPDATE
// ------------------------------------------------------------
export function updateHubProfile() {
  const nameEl = document.getElementById("hub-profile-name");
  const levelEl = document.getElementById("hub-profile-level");
  if (!gameState.player) return;

  const displayName = gameState.player.name
    ? `Princess ${gameState.player.name}`
    : "Princess (Unknown)";
  nameEl.textContent = displayName;
  levelEl.textContent = `Level ${gameState.player.level || 1}`;
}

// ------------------------------------------------------------
// 🏹 UPDATE TURRET UNLOCKS BASED ON PLAYER LEVEL
// ------------------------------------------------------------
function updateTurretUnlocks() {
  const playerLevel = gameState.player?.level ?? 1;
  document.querySelectorAll(".turret-card").forEach(card => {
    const unlockLevel = parseInt(card.dataset.unlock);
    const info = card.querySelector(".unlock-info");

    if (playerLevel >= unlockLevel) {
      card.style.opacity = "1";
      card.style.filter = "none";
      if (info) info.textContent = `🔓 Unlocked at Level ${unlockLevel}`;
    } else {
      card.style.opacity = "0.6";
      card.style.filter = "grayscale(0.5)";
      if (info) info.textContent = `🔒 Unlocks at Level ${unlockLevel}`;
    }
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep (FINAL CLEAN BUILD)
// ------------------------------------------------------------
// ✦ Main hub navigation screen
// ✦ Handles transitions and overlay openings for all 8 buttons
// ✦ Integrates with clean game start & screen manager
// ✦ Fixed: “New Story” now resets everything properly
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay, gameActive, stopGameplay } from "../main.js";
import { getCurrencies, gameState } from "../utils/gameState.js";
import { showOverlay } from "./ui.js";
import { setupStoryControls, startIntroStory } from "./story.js";
import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { updateStatsOverlay } from "./ui.js";
import { initSettingsMenu } from "./ui.js";
import { playFairySprinkle } from "./soundtrack.js";
import { resetCombatState } from "./game.js";

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

    import("./alert.js").then(({ showConfirm }) => {
      showConfirm(
        "Are you sure you want to start a new story?",
        () => {
          console.log("📖 New Story confirmed — cleaning old session...");

          // 1️⃣ Stop any running gameplay loop
          if (gameActive) stopGameplay("restart");

          // 2️⃣ Remove any overlays (defeat/victory/story)
          document.querySelectorAll("#end-screen, .end-overlay, .overlay").forEach(el => el.remove());

          // 3️⃣ Reset combat state & player stats
          resetCombatState();
          gameState.player = {
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            lives: 10,
            gold: 0,
            diamonds: 0,
            pos: { x: 160, y: 160 },
          };

          // 4️⃣ Switch to story overlay cleanly
          setupStoryControls();
          startIntroStory();
          playFairySprinkle();

          console.log("✨ New Story sequence started fresh.");
        },
        () => {
          console.log("❎ New Story cancelled");
        }
      );
    });
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

  // 🏹 TURRETS — open tower menu
  turretsBtn.addEventListener("click", () => {
    console.log("🏹 Turrets overlay");
    playFairySprinkle();
    showOverlay("overlay-turrets");
  });

  // 🎨 SKINS — open skin selector
  skinsBtn.addEventListener("click", () => {
    console.log("🎨 Skins overlay");
    playFairySprinkle();
    showOverlay("overlay-skins");
  });

  // 📜 STATS — open stats
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
      () => {
        console.log("❎ Exit cancelled");
      }
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
  document.getElementById("hub-gold").textContent = `Gold: ${gold}`;
  document.getElementById("hub-diamonds").textContent = `Diamonds: ${diamonds}`;
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

// ============================================================
// 🌟 END OF FILE
// ============================================================

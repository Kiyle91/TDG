// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Main hub navigation screen
// ✦ Handles transitions and overlay openings for all 8 buttons
// ✦ Integrates with game start and screen manager
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { getCurrencies, gameState } from "../utils/gameState.js";
import { showOverlay } from "./ui.js"; // we’ll use this pattern for overlays later
import { setupStoryControls, startIntroStory } from "./story.js";
import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { updateStatsOverlay } from "./ui.js";
import { initSettingsMenu } from "./ui.js";
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

  // 🏰 New Story — confirmation before starting
  newStoryBtn.addEventListener("click", () => {
    console.log("🩷 Prompting story confirmation...");

    // Use the pastel confirm modal
    import("./alert.js").then(({ showConfirm }) => {
      showConfirm(
        "Are you sure you want to start a new story?",
        () => {
          console.log("📖 New story confirmed — starting intro...");
          setupStoryControls();
          startIntroStory();
        },
        () => {
          console.log("❎ New story cancelled");
        }
      );
    });
  });


  // 💾 Load Game — open save overlay (future overlay system)
  loadGameBtn.addEventListener("click", () => {
    console.log("💾 Load Game overlay");
    showOverlay("overlay-load");
  });

  // 🗺️ Maps — open map selection overlay
  mapsBtn.addEventListener("click", () => {
    console.log("🗺️ Maps overlay");
    showOverlay("overlay-maps");
  });

  // 🏹 Turrets — open tower menu
  turretsBtn.addEventListener("click", () => {
    console.log("🏹 Turrets overlay");
    showOverlay("overlay-turrets");
  });

  // 🎨 Skins — open skin selector
  skinsBtn.addEventListener("click", () => {
    console.log("🎨 Skins overlay");
    showOverlay("overlay-skins");
  });

  // 📜 Stats — open stats
  statsBtn.addEventListener("click", () => {
    console.log("📜 Stats overlay");
    updateStatsOverlay();
    showOverlay("overlay-stats");
  });

  // ⚙️ Settings — open settings overlay
  settingsBtn.addEventListener("click", () => {
    console.log("⚙️ Settings overlay");
    showOverlay("overlay-settings");
  });

  // 🚪 Exit — confirmation before leaving the hub
  exitBtn.addEventListener("click", () => {
    console.log("🩷 Prompting exit confirmation...");

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

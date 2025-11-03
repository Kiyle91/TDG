// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Main hub navigation screen
// ✦ Handles transitions and overlay openings for all 8 buttons
// ✦ Integrates with game start and screen manager
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay } from "../main.js";
import { showOverlay } from "./ui.js"; // we’ll use this pattern for overlays later

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
  const questsBtn = document.getElementById("quests-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const exitBtn = document.getElementById("exit-hub-btn");

  // 🩵 Safety check
  if (
    !newStoryBtn || !loadGameBtn || !mapsBtn ||
    !turretsBtn || !skinsBtn || !questsBtn ||
    !settingsBtn || !exitBtn
  ) {
    console.warn("⚠️ Hub buttons missing!");
    return;
  }

  // ------------------------------------------------------------
  // 🎮 HUB ACTIONS
  // ------------------------------------------------------------

  // 🏰 New Story — start fresh game
  newStoryBtn.addEventListener("click", () => {
    console.log("🎮 Starting new story...");
    fadeOut(hub, () => {
      showScreen("game-container");
      startGameplay();
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

  // 📜 Quests — open quest log
  questsBtn.addEventListener("click", () => {
    console.log("📜 Quests overlay");
    showOverlay("overlay-quests");
  });

  // ⚙️ Settings — open settings overlay
  settingsBtn.addEventListener("click", () => {
    console.log("⚙️ Settings overlay");
    showOverlay("overlay-settings");
  });

  // 🚪 Exit — return to profile screen
  exitBtn.addEventListener("click", () => {
    console.log("🚪 Exiting to profile...");
    fadeOut(hub, () => {
      showScreen("profile-screen");
    });
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

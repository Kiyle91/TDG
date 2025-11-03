// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Manages the main hub navigation screen
// ✦ Handles transitions between hub, map, and game screens
// ✦ Soft pastel fade effects for smooth screen flow
// ============================================================

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initHub() {
  const hub = document.getElementById("hub-screen");
  const mapsBtn = document.getElementById("maps-btn");
  const newStoryBtn = document.getElementById("new-story-btn");
  const loadGameBtn = document.getElementById("load-game-btn");
  const turretsBtn = document.getElementById("turrets-btn");
  const skinsBtn = document.getElementById("skins-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const exitBtn = document.getElementById("exit-hub-btn");

  if (!hub) return;

  // 🌸 Navigation Events
  newStoryBtn.addEventListener("click", () => {
    console.log("New Story selected");
    startGameTransition();
  });

  loadGameBtn.addEventListener("click", () => console.log("Load Game selected"));
  mapsBtn.addEventListener("click", () => showMapScreen());
  turretsBtn.addEventListener("click", () => console.log("Turrets selected"));
  skinsBtn.addEventListener("click", () => console.log("Skins selected"));
  settingsBtn.addEventListener("click", () => console.log("Settings selected"));
  exitBtn.addEventListener("click", () => console.log("Exit hub"));
}

// ------------------------------------------------------------
// 🎬 START GAME TRANSITION
// ------------------------------------------------------------
function startGameTransition() {
  const hub = document.getElementById("hub-screen");
  const game = document.getElementById("game-container");

  hub.style.opacity = 0;
  setTimeout(() => {
    hub.style.display = "none";
    game.style.display = "block";
  }, 800);
}

// ------------------------------------------------------------
// 🗺️ SHOW MAP SCREEN
// ------------------------------------------------------------
function showMapScreen() {
  const hub = document.getElementById("hub-screen");
  const mapScreen = document.getElementById("maps-screen");

  if (!mapScreen) {
    console.warn("Map screen not yet implemented");
    return;
  }

  hub.style.opacity = 0;
  setTimeout(() => {
    hub.style.display = "none";
    mapScreen.style.display = "flex";
    fadeIn(mapScreen);
  }, 800);
}

// ------------------------------------------------------------
// 🌈 FADE-IN UTILITY
// ------------------------------------------------------------
function fadeIn(element) {
  element.style.opacity = 0;
  element.style.transition = "opacity 0.8s ease";
  requestAnimationFrame(() => (element.style.opacity = 1));
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

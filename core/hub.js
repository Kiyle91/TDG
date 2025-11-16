// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles hub buttons, overlays, currencies, and map loading
// ✦ Supports map unlocking + replay
// ✦ Full save/load support from hub
// ============================================================

// Correct paths for your actual folder layout
import { showScreen } from "./screens.js";
import { startGameplay, gameActive, stopGameplay, fullNewGameReset, startNewGameStory } from "../main.js";
import { getCurrencies, gameState, saveProfiles } from "../utils/gameState.js";
import { showOverlay, updateStatsOverlay, initSettingsMenu } from "./ui.js";
import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { playFairySprinkle } from "./soundtrack.js";
import { resetCombatState } from "./game.js";

// THESE TWO ARE INSIDE CORE FOLDER (your screenshot confirms):
import { renderSlots } from "./saveSlots.js";
import { loadFromSlot, applySnapshot } from "./saveSystem.js";

// ============================================================
// 🌷 INIT HUB
// ============================================================
export function initHub() {
  const hub = document.getElementById("hub-screen");
  if (!hub) return;

  const newStoryBtn   = document.getElementById("new-story-btn");
  const loadGameBtn   = document.getElementById("load-game-btn");
  const mapsBtn       = document.getElementById("maps-btn");
  const turretsBtn    = document.getElementById("turrets-btn");
  const skinsBtn      = document.getElementById("skins-btn");
  const statsBtn      = document.getElementById("stats-btn");
  const settingsBtn   = document.getElementById("settings-btn");
  const exitBtn       = document.getElementById("exit-hub-btn");

  initChest();
  initSettingsMenu();
  updateHubCurrencies();
  updateHubProfile();
  updateTurretUnlocks();

  // NEW STORY
  newStoryBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm("Start a new story from Map 1?", () => {
      if (gameActive) stopGameplay("restart");

      document.querySelectorAll("#end-screen, .end-overlay")
        .forEach(el => el.remove());

      fullNewGameReset();
      resetCombatState();
      startNewGameStory();
    });
  });

  // LOAD GAME
  loadGameBtn.addEventListener("click", () => {
    playFairySprinkle();

    const container = document.getElementById("save-slots-container");
    renderSlots(container, false);
    showOverlay("overlay-load");

    container.addEventListener("click", async (evt) => {
      const btn = evt.target.closest(".load-btn");
      if (!btn) return;

      const slotIndex = Number(btn.dataset.index);
      const snap = loadFromSlot(slotIndex);
      if (!snap) return;

      console.log("💾 Loaded snapshot:", snap);

      // ⭐ FIX — Set map before initGame()
      if (snap.progress?.currentMap) {
        gameState.progress.currentMap = snap.progress.currentMap;
      }

      const ov = document.getElementById("overlay-load");
      ov.classList.remove("active");
      ov.style.display = "none";

      showScreen("game-container");

      const gameMod = await import("./game.js");
      await gameMod.initGame();

      applySnapshot(snap);
      startGameplay();
    }, { once: true });
  });

  // MAPS
  mapsBtn.addEventListener("click", () => {
    playFairySprinkle();
    import("./maps.js").then(mod => mod.initMapSelect?.());
    showOverlay("overlay-maps");
  });

  // TURRETS
  turretsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateTurretUnlocks();
    showOverlay("overlay-turrets");
  });

  // SKINS
  skinsBtn.addEventListener("click", () => {
    playFairySprinkle();
    showOverlay("overlay-skins");
  });

  // STATS
  statsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateStatsOverlay();
    showOverlay("overlay-stats");
  });

  // SETTINGS
  settingsBtn.addEventListener("click", () => {
    playFairySprinkle();
    showOverlay("overlay-settings");
  });

  // EXIT → PROFILE
  exitBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm(
      "Return to the Profile Select?",
      () => fadeOut(hub, () => showScreen("profile-screen"))
    );
  });

  console.log("🏰 Hub ready — all buttons linked");
}

// ====================== OTHER FUNCTIONS — UNCHANGED ======================

export function updateHubCurrencies() {
  const { gold, diamonds } = getCurrencies();
  document.getElementById("hub-gold").textContent = `Gold: ${gold}`;
  document.getElementById("hub-diamonds").textContent = `Diamonds: ${diamonds}`;
}

export function updateHubProfile() {
  const nameEl = document.getElementById("hub-profile-name");
  const levelEl = document.getElementById("hub-profile-level");

  const displayName = gameState.player?.name
    ? `Princess ${gameState.player.name}`
    : "Princess";

  nameEl.textContent = displayName;
  levelEl.textContent = `Level ${gameState.player?.level || 1}`;
}

function updateTurretUnlocks() { /* unchanged */ }

function fadeOut(element, callback) { /* unchanged */ }

// ============================================================
// END OF FILE
// ============================================================

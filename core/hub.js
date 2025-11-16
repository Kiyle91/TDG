// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles hub buttons, overlays, currencies, map loading
// ✦ Skins system (corrected + persistent)
// ✦ Save/load, maps, turrets, settings, stats
// ============================================================

import { showScreen } from "./screens.js";
import {
  startGameplay,
  gameActive,
  stopGameplay,
  fullNewGameReset,
  startNewGameStory
} from "../main.js";

import {
  gameState,
  saveProfiles,
  getCurrencies,
  spendDiamonds
} from "../utils/gameState.js";

import {
  showOverlay,
  updateStatsOverlay,
  initSettingsMenu
} from "./ui.js";

import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { playFairySprinkle } from "./soundtrack.js";
import { resetCombatState } from "./game.js";

import {
  SKINS,
  unlockSkin,
  selectSkin,
  ensureSkin
} from "./skins.js";

import { renderSlots } from "./saveSlots.js";
import { loadFromSlot, applySnapshot } from "./saveSystem.js";


// ============================================================
// 🌷 INIT HUB
// ============================================================
export function initHub() {
  const hub = document.getElementById("hub-screen");
  if (!hub) return;

  // ⭐ CRITICAL: Ensure skin system exists BEFORE anything else
  if (!gameState.player) gameState.player = {};
  ensureSkin(gameState.player);
  saveProfiles();

  // Buttons
  const newStoryBtn   = document.getElementById("new-story-btn");
  const loadGameBtn   = document.getElementById("load-game-btn");
  const mapsBtn       = document.getElementById("maps-btn");
  const turretsBtn    = document.getElementById("turrets-btn");
  const skinsBtn      = document.getElementById("skins-btn");
  const statsBtn      = document.getElementById("stats-btn");
  const settingsBtn   = document.getElementById("settings-btn");
  const exitBtn       = document.getElementById("exit-hub-btn");

  // Initialize hub subsystems
  initChest();
  initSettingsMenu();
  updateHubCurrencies();
  updateHubProfile();
  updateTurretUnlocks();

  // ============================================================
  // NEW STORY
  // ============================================================
  newStoryBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm("Start a new story from Map 1?", () => {

      if (gameActive) stopGameplay("restart");

      document.querySelectorAll("#end-screen, .end-overlay")
        .forEach(el => el.remove());

      fullNewGameReset();         // fresh character, BUT preserves skins
      ensureSkin(gameState.player);
      saveProfiles();

      resetCombatState();
      startNewGameStory();
    });
  });

  // ============================================================
  // LOAD GAME
  // ============================================================
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

      if (snap.progress?.currentMap) {
        gameState.progress.currentMap = snap.progress.currentMap;
      }

      const ov = document.getElementById("overlay-load");
      ov.classList.remove("active");
      ov.style.display = "none";

      showScreen("game-container");

      // ⭐ initGame in LOAD MODE
      const gameMod = await import("./game.js");
      await gameMod.initGame("load");

      applySnapshot(snap);
      ensureSkin(gameState.player);
      saveProfiles();

      startGameplay();

    }, { once: true });
  });

  // ============================================================
  // MAPS
  // ============================================================
  mapsBtn.addEventListener("click", () => {
    playFairySprinkle();
    const ov = document.getElementById("overlay-maps");
    if (ov) ov.style.pointerEvents = "auto";

    import("./maps.js").then(mod => mod.initMapSelect?.());
    showOverlay("overlay-maps");
  });

  // ============================================================
  // TURRETS
  // ============================================================
  turretsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateTurretUnlocks();
    showOverlay("overlay-turrets");
  });

  // ============================================================
  // SKINS MENU
  // ============================================================
  skinsBtn.addEventListener("click", () => {
    playFairySprinkle();
    ensureSkin(gameState.player);  // ⭐ guarantees array exists
    saveProfiles();
    refreshSkinsMenu();
    showOverlay("overlay-skins");
  });

  // ============================================================
  // STATS
  // ============================================================
  statsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateStatsOverlay();
    showOverlay("overlay-stats");
  });

  // ============================================================
  // SETTINGS
  // ============================================================
  settingsBtn.addEventListener("click", () => {
    playFairySprinkle();
    showOverlay("overlay-settings");
  });

  // ============================================================
  // EXIT → PROFILE SCREEN
  // ============================================================
  exitBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm(
      "Return to the Profile Select?",
      () => fadeOut(hub, () => showScreen("profile-screen"))
    );
  });

  initSkinsMenu();
  console.log("🏰 Hub ready — all buttons linked");
}


// ============================================================
// 🌈 SKINS MENU — FULL FIXED VERSION
// ============================================================
export function initSkinsMenu() {
  const overlay = document.getElementById("overlay-skins");
  const closeBtn = document.getElementById("skins-close");

  // ⭐ Ensure skin system always exists
  if (!gameState.player) gameState.player = {};
  ensureSkin(gameState.player);
  saveProfiles();

  // Close
  closeBtn?.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  // Buttons for each card
  document.querySelectorAll(".skin-card").forEach(card => {
    const key = card.dataset.skin;
    const btn = card.querySelector(".skin-btn");

    btn.addEventListener("click", () => {
      const player = gameState.player;
      const skin = SKINS[key];

      ensureSkin(player);  // ⭐ guarantees unlockedSkins array
      saveProfiles();

      // Already equipped
      if (player.skin === key) return;

      // Try unlock
      if (!player.unlockedSkins.includes(key)) {
        const { diamonds } = getCurrencies();
        if (diamonds < skin.cost) {
          alert("Not enough diamonds!");
          return;
        }

        spendDiamonds(skin.cost);
        unlockSkin(player, key);
        saveProfiles();
      }

      // Equip
      selectSkin(player, key);
      saveProfiles();
      refreshSkinsMenu();
    });
  });
}


// ============================================================
// REFRESH SKINS MENU UI
// ============================================================
function refreshSkinsMenu() {
  const player = gameState.player;
  ensureSkin(player);

  const unlocked = player.unlockedSkins;

  document.querySelectorAll(".skin-card").forEach(card => {
    const key = card.dataset.skin;
    const btn = card.querySelector(".skin-btn");
    const skin = SKINS[key];

    if (player.skin === key) {
      btn.textContent = "Equipped";
      btn.classList.add("equipped");
      btn.dataset.action = "equip";
      return;
    }

    btn.classList.remove("equipped");

    if (unlocked.includes(key)) {
      btn.textContent = "Equip";
      btn.dataset.action = "equip";
    } else {
      btn.textContent = `Unlock ${skin.cost} 💎`;
      btn.dataset.action = "unlock";
    }
  });

  const { gold, diamonds } = getCurrencies();
  document.getElementById("hub-diamonds").textContent = diamonds;
}


// ============================================================
// HUB PROFILE + CURRENCY UI
// ============================================================
export function updateHubCurrencies() {
  const { gold, diamonds } = getCurrencies();
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


// ============================================================
// PLACEHOLDERS FOR UNCHANGED FUNCTIONS
// ============================================================
function updateTurretUnlocks() { /* unchanged */ }
function fadeOut(element, callback) { /* unchanged */ }

// ============================================================
// END OF FILE
// ============================================================

// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles hub buttons, overlays, currencies, map loading
// ✦ Skins system (corrected + persistent)
// ✦ Save/load, maps, spires, settings, stats, credits
// ============================================================
/* ------------------------------------------------------------
 * MODULE: hub.js
 * PURPOSE:
 *   Coordinates the main Hub screen behaviour: profile display,
 *   currency display, navigation overlays, skins, maps, spires,
 *   save/load, and access to the campaign story.
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

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
import { playFairySprinkle } from "../core/soundtrack.js";

import {
  SKINS,
  unlockSkin,
  selectSkin,
  ensureSkin
} from "./skins.js";

import { renderSlots } from "../save/saveSlots.js";
import { loadFromSlot, applySnapshot } from "../save/saveSystem.js";

import { showCredits } from "./credits.js";
import { getSlotSummaries } from "../save/saveSystem.js";

import { initSpireUpgrades, refreshSpireUpgradeFromHub } from "../spires/spireUpgrades.js";

import { showDifficultySelect } from "./alert.js";

let hubListenersBound = false;


// ============================================================
// 🌷 INIT HUB
// ============================================================

export function initHub() {
  const hub = document.getElementById("hub-screen");
  if (!hub) return;

  // Ensure skin system exists before anything else
  const activeProfile = getActiveProfile();
  if (activeProfile) {
    if (!gameState.player) gameState.player = {};
    ensureSkin(gameState.player);
    saveProfiles();
  }

  // Buttons
  const newStoryBtn = document.getElementById("new-story-btn");
  const loadGameBtn = document.getElementById("load-game-btn");
  const mapsBtn = document.getElementById("maps-btn");
  const spiresBtn = document.getElementById("spires-btn");
  const skinsBtn = document.getElementById("skins-btn");
  const statsBtn = document.getElementById("stats-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const exitBtn = document.getElementById("exit-hub-btn");

  // ⭐ CONTINUE BUTTON
  const continueBtn = document.getElementById("continue-btn");

  // Initialize hub subsystems
  updateStartButton();
  initChest();
  initSettingsMenu();
  updateHubCurrencies();
  updateHubProfile();
  updateSpireUnlocks();
  initSpireUpgrades();
  refreshSkinsMenu();

  if (hubListenersBound) {
    updateContinueButton(continueBtn);
    return;
  }

  hubListenersBound = true;

  

  // ============================================================
  // ⭐ CONTINUE BUTTON – SHOW/HIDE LOGIC
  // ============================================================

  // ⭐ CONTINUE BUTTON LOGIC
  updateContinueButton(continueBtn);

  // ============================================================
  // ⭐ CONTINUE BUTTON – LOAD LAST SAVE
  // ============================================================
  continueBtn?.addEventListener("click", async () => {
      playFairySprinkle();

      const profile = getActiveProfile();
      const slot = profile?.lastSave;

      if (typeof slot !== "number") {
        alert("No saved game found!");
        return;
      }

      const snap = loadFromSlot(slot);
      if (!snap) {
        alert("Could not load save!");
        return;
      }

      if (snap.progress?.currentMap) {
        gameState.progress.currentMap = Math.min(Math.max(snap.progress.currentMap, 1), 9);
      } else if (snap.meta?.map) {
        gameState.progress.currentMap = Math.min(Math.max(snap.meta.map, 1), 9);
      } else {
        gameState.progress.currentMap = 1;
      }

      showScreen("game-container");

      const gameMod = await import("../core/game.js");
      await gameMod.initGame("load");

      applySnapshot(snap);
      ensureSkin(gameState.player);
      saveProfiles();

      startGameplay?.();
  });


  // ============================================================
  // NEW STORY
  // ============================================================

  newStoryBtn.addEventListener("click", () => {
    playFairySprinkle();

    // Step 1 — “Begin your adventure?”
    showConfirm("Are you ready to begin your adventure?", () => {

      // ⭐ Step 2 — Choose Difficulty
      showDifficultySelect((chosenDiff) => {

        const profile = getActiveProfile();
        if (profile) {
          profile.difficulty = chosenDiff;   // easy | normal | hard
          saveProfiles();
        }

        // Continue original flow
        const startStory = (resetProgress) => {
          if (gameActive) stopGameplay("restart");

          document.querySelectorAll("#end-screen, .end-overlay")
            .forEach(el => el.remove());

          startNewGameStory({ resetProgress });
        };

        // Step 3 — If progress exists → ask about reset
        if (hasExistingProgress()) {
          showConfirm(
            "Reset your levels and map unlocks too?",
            () => startStory(true),
            () => startStory(false),
            { variant: "danger" }
          );
        } else {
          startStory(true);
        }
      });
    });
  });



  // ============================================================
  // LOAD GAME – FIXED VERSION
  // ============================================================

  const handleLoadSlotClick = async (evt) => {
    const btn = evt.target.closest(".load-btn");
    if (!btn) return;

    playFairySprinkle();

    const slotIndex = Number(btn.dataset.index);
    const snap = loadFromSlot(slotIndex);
    if (!snap) return;

    if (snap.progress?.currentMap) {
      gameState.progress.currentMap = Math.min(snap.progress.currentMap, 9);
    } else if (snap.meta?.map) {
      gameState.progress.currentMap = Math.min(snap.meta.map, 9);
    } else {
      gameState.progress.currentMap = 1;
    }

    const ov = document.getElementById("overlay-load");
    if (ov) {
      ov.classList.remove("active");
      ov.style.display = "none";
    }

    showScreen("game-container");

    const gameMod = await import("../core/game.js");
    await gameMod.initGame("load");

    applySnapshot(snap);
    ensureSkin(gameState.player);
    saveProfiles();

    startGameplay?.();
  };

  loadGameBtn.addEventListener("click", () => {
    playFairySprinkle();

    const containerHost = document.getElementById("save-slots-container");
    renderSlots(containerHost, false);
    // renderSlots replaces the element, so re-query after renderSlots completes
    const container = document.getElementById("save-slots-container");
    showOverlay("overlay-load");

    // Ensure only one active listener across overlay reopenings
    if (container) {
      container.removeEventListener("click", handleLoadSlotClick);
      container.addEventListener("click", handleLoadSlotClick);
    }
  });

  // ============================================================
  // MAPS
  // ============================================================

  mapsBtn.addEventListener("click", () => {
    playFairySprinkle();
    const ov = document.getElementById("overlay-maps");
    if (ov) ov.style.pointerEvents = "auto";

    import("../maps/maps.js").then(mod => mod.initMapSelect?.());
    showOverlay("overlay-maps");
  });

  // ============================================================
  // SPIRES
  // ============================================================

  spiresBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateSpireUnlocks();
    initSpireUpgrades(); // Ensures UI/events are bound even if profile was created this session
    refreshSpireUpgradeFromHub();
    showOverlay("overlay-spires");
  });

  // ============================================================
  // SKINS
  // ============================================================

  skinsBtn.addEventListener("click", () => {
    playFairySprinkle();
    ensureSkin(gameState.player);
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

  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      playFairySprinkle();
      showConfirm(
        "Return to the Profile Select?",
        () => fadeOut(hub, () => showScreen("profile-screen"))
      );
    });
  }

  // ============================================================
  // CREDITS
  // ============================================================

  const creditsBtn = document.getElementById("credits-btn");
  if (creditsBtn) {
    creditsBtn.onclick = () => {
      playFairySprinkle();
      showCredits();
    };
  }

  // ============================================================
  // SUPPORT BUTTON
  // ============================================================

  const supportBtn = document.getElementById("support-btn");
  const supportScreen = document.getElementById("support-screen");
  const supportBack = document.getElementById("support-back-btn");

  supportBtn?.addEventListener("click", () => {
    supportScreen.style.display = "flex";
    supportScreen.classList.remove("hidden");
    supportScreen.classList.add("active");
  });

  supportBack?.addEventListener("click", () => {
    supportScreen.style.display = "none";  
    supportScreen.classList.remove("active");
    supportScreen.classList.add("hidden");
  });

  initSkinsMenu();
}

export function updateStartButton() {
    // Delegate to unified Start/Continue visibility logic
    updateContinueButton();
}

// ============================================================
// 🌈 SKINS MENU
// ============================================================

export function initSkinsMenu() {
  const overlay = document.getElementById("overlay-skins");
  const closeBtn = document.getElementById("skins-close");

  if (!gameState.player) gameState.player = {};
  ensureSkin(gameState.player);
  saveProfiles();

  closeBtn?.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  document.querySelectorAll(".skin-card").forEach(card => {
    const key = card.dataset.skin;
    const btn = card.querySelector(".skin-btn");

    btn.addEventListener("click", () => {
      const player = gameState.player;
      const skin = SKINS[key];

      ensureSkin(player);
      saveProfiles();

      if (player.skin === key) return;

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

      selectSkin(player, key);
      saveProfiles();
      refreshSkinsMenu();
    });
  });
}


// ============================================================
// REFRESH SKINS MENU
// ============================================================

function refreshSkinsMenu() {
  let player = gameState.player;
  if (!player) {
    player = {};
    gameState.player = player;
  }
  ensureSkin(player);

  const unlocked = Array.isArray(player.unlockedSkins)
    ? player.unlockedSkins
    : [];

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

  const { diamonds } = getCurrencies();
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

export function updateContinueButton(
  btn = document.getElementById("continue-btn")
) {
  if (!btn) return;

  const profile = getActiveProfile();
  const startBtn = document.getElementById("start-btn");

  const summaries = getSlotSummaries() || [];
  const hasAnySlotSave = summaries.some(s => s);
  const hasSave = typeof profile?.lastSave === "number" || hasAnySlotSave;

  if (startBtn) {
    startBtn.style.display = hasSave ? "none" : "block";
  }

  btn.style.display = hasSave ? "block" : "none";
}

function hasExistingProgress() {
  const profile = getActiveProfile();
  if (!profile) return false;

  const playerLevel = profile.player?.level ?? gameState.player?.level ?? 1;
  const playerXp = profile.player?.xp ?? gameState.player?.xp ?? 0;

  const progress = profile.progress || gameState.progress || {};
  const currentMap = progress.currentMap ?? 1;
  const mapsUnlocked = Array.isArray(progress.mapsUnlocked)
    ? progress.mapsUnlocked
    : [];
  const hasUnlockedLater = mapsUnlocked.some((unlocked, idx) => unlocked && idx > 0);

  const summaries = getSlotSummaries() || [];
  const hasAnySlotSave = summaries.some(s => s);
  const hasAutoSave = typeof profile.lastSave === "number";

  return (
    playerLevel > 1 ||
    playerXp > 0 ||
    currentMap > 1 ||
    hasUnlockedLater ||
    hasAutoSave ||
    hasAnySlotSave
  );
}


// ============================================================
// UTILITY
// ============================================================

function getActiveProfile() {
  if (gameState.profile) return gameState.profile;

  const profiles = Array.isArray(gameState.profiles)
    ? gameState.profiles
    : [];
  if (!profiles.length) return null;

  const index = Number.isInteger(gameState.activeProfileIndex)
    ? gameState.activeProfileIndex
    : 0;

  return profiles[index] ?? profiles[0] ?? null;
}

function updateSpireUnlocks() {}

function fadeOut(element, callback) {
  if (!element) {
    callback?.();
    return;
  }

  element.style.opacity = "1";
  element.style.transition = "opacity 0.4s ease";

  requestAnimationFrame(() => {
    element.style.opacity = "0";
  });

  setTimeout(() => callback?.(), 400);
}

document.getElementById("start-btn").addEventListener("click", () => {
    document.getElementById("new-story-btn").click();
});

// ============================================================
// 🌟 END OF FILE
// ============================================================

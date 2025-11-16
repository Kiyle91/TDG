// ============================================================
// 🌸 hub.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles hub buttons, overlays, currencies, and map loading
// ✦ Supports map unlocking + replay
// ✦ Full save/load support from hub
// ============================================================

import { showScreen } from "./screens.js";
import { startGameplay, gameActive, stopGameplay } from "../main.js";
import { getCurrencies, gameState, saveProfiles } from "../utils/gameState.js";
import { showOverlay } from "./ui.js";
import { initChest } from "./chest.js";
import { showConfirm } from "./alert.js";
import { updateStatsOverlay } from "./ui.js";
import { initSettingsMenu } from "./ui.js";
import { playFairySprinkle } from "./soundtrack.js";
import { resetCombatState } from "./game.js";
import { fullNewGameReset, startNewGameStory } from "../main.js";
import { renderSlots } from "./saveSlots.js";
import { loadFromSlot } from "./saveSystem.js";
import { applySnapshot } from "./saveSystem.js";

// ============================================================
// 🌷 INIT HUB
// ============================================================
export function initHub() {
  const hub = document.getElementById("hub-screen");
  if (!hub) return;

  // Buttons
  const newStoryBtn   = document.getElementById("new-story-btn");
  const loadGameBtn   = document.getElementById("load-game-btn");
  const mapsBtn       = document.getElementById("maps-btn");
  const turretsBtn    = document.getElementById("turrets-btn");
  const skinsBtn      = document.getElementById("skins-btn");
  const statsBtn      = document.getElementById("stats-btn");
  const settingsBtn   = document.getElementById("settings-btn");
  const exitBtn       = document.getElementById("exit-hub-btn");

  // Init subsystems
  initChest();
  initSettingsMenu();
  updateHubCurrencies();
  updateHubProfile();
  updateTurretUnlocks();

  // Safety check
  if (!newStoryBtn || !loadGameBtn || !mapsBtn ||
      !turretsBtn || !skinsBtn || !statsBtn ||
      !settingsBtn || !exitBtn) {
    console.warn("⚠️ Hub buttons missing!");
    return;
  }

  // ------------------------------------------------------------
  // 🏰 NEW STORY — Map 1
  // ------------------------------------------------------------
  newStoryBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm(
      "Start a new story from Map 1?",
      () => {
        if (gameActive) stopGameplay("restart");

        document.querySelectorAll("#end-screen, .end-overlay")
          .forEach(el => el.remove());

        fullNewGameReset();
        resetCombatState();
        startNewGameStory(); // calls startGameplay(map1)
      }
    );
  });

  // ------------------------------------------------------------
  // 💾 LOAD GAME — FULL SNAPSHOT LOAD (HUB → GAME)
  // ------------------------------------------------------------
  loadGameBtn.addEventListener("click", () => {
    playFairySprinkle();

    const container = document.getElementById("save-slots-container");
    renderSlots(container, false);  // Hub mode = NO Save button

    showOverlay("overlay-load");

    // Handle slot clicks INSIDE saveSlots.js
    // But we must intercept load-from-hub here:
    container.addEventListener("click", async (evt) => {
      const btn = evt.target.closest(".load-btn");
      if (!btn) return;

      const slotIndex = Number(btn.dataset.index);
      if (isNaN(slotIndex)) return;

      // 1. Load snapshot from storage
      const snap = loadFromSlot(slotIndex);
      if (!snap) return;

      console.log("💾 [HUB] Loaded snapshot:", snap);

      // 2. Close overlay immediately
      const ov = document.getElementById("overlay-load");
      ov.classList.remove("active");
      ov.style.display = "none";

      // 3. Switch to GAME
      showScreen("game-container");

      // 4. FULL game initialisation
      const gameMod = await import("./game.js");
      await gameMod.initGame();         // loads map, sets up arrays, etc.

      // 5. Apply snapshot to fresh game instance
      applySnapshot(snap);

      // 6. Start gameplay
      startGameplay();
    }, { once: true });
  });

  // ------------------------------------------------------------
  // 🗺️ MAP SELECT
  // ------------------------------------------------------------
  mapsBtn.addEventListener("click", () => {
    playFairySprinkle();

    const ov = document.getElementById("overlay-maps");
    if (ov) ov.style.pointerEvents = "auto";

    import("./maps.js").then(mod => mod.initMapSelect?.());
    showOverlay("overlay-maps");
  });

  // ------------------------------------------------------------
  // 🏹 TURRETS
  // ------------------------------------------------------------
  turretsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateTurretUnlocks();
    showOverlay("overlay-turrets");
  });

  // ------------------------------------------------------------
  // 🎨 SKINS
  // ------------------------------------------------------------
  skinsBtn.addEventListener("click", () => {
    playFairySprinkle();
    showOverlay("overlay-skins");
  });

  // ------------------------------------------------------------
  // 📜 STATS
  // ------------------------------------------------------------
  statsBtn.addEventListener("click", () => {
    playFairySprinkle();
    updateStatsOverlay();
    showOverlay("overlay-stats");
  });

  // ------------------------------------------------------------
  // ⚙️ SETTINGS
  // ------------------------------------------------------------
  settingsBtn.addEventListener("click", () => {
    playFairySprinkle();
    showOverlay("overlay-settings");
  });

  // ------------------------------------------------------------
  // 🚪 EXIT HUB → Profile Screen
  // ------------------------------------------------------------
  exitBtn.addEventListener("click", () => {
    playFairySprinkle();
    showConfirm(
      "Return to the Profile Select?",
      () => fadeOut(hub, () => showScreen("profile-screen"))
    );
  });

  console.log("🏰 Hub ready — all buttons linked");
}

// ============================================================
// 💰 UPDATE HUB CURRENCIES
// ============================================================
export function updateHubCurrencies() {
  const { gold, diamonds } = getCurrencies();
  const goldEl = document.getElementById("hub-gold");
  const diamondEl = document.getElementById("hub-diamonds");

  if (goldEl) goldEl.textContent = `Gold: ${gold}`;
  if (diamondEl) diamondEl.textContent = `Diamonds: ${diamonds}`;
}

// ============================================================
// 👑 UPDATE PROFILE DISPLAY
// ============================================================
export function updateHubProfile() {
  if (!gameState.player) return;

  const nameEl = document.getElementById("hub-profile-name");
  const levelEl = document.getElementById("hub-profile-level");

  const displayName = gameState.player.name
    ? `Princess ${gameState.player.name}`
    : "Princess";

  nameEl.textContent = displayName;
  levelEl.textContent = `Level ${gameState.player.level || 1}`;
}

// ============================================================
// 🏹 UPDATE TURRET UNLOCKS
// ============================================================
function updateTurretUnlocks() {
  const level = gameState.player?.level ?? 1;

  document.querySelectorAll(".turret-card").forEach(card => {
    const unlockLevel = parseInt(card.dataset.unlock);
    const info = card.querySelector(".unlock-info");

    if (level >= unlockLevel) {
      card.style.opacity = "1";
      card.style.filter = "none";
      if (info) info.textContent = `🔓 Unlocked`;
    } else {
      card.style.opacity = "0.5";
      card.style.filter = "grayscale(0.5)";
      if (info) info.textContent = `🔒 Unlocks at Level ${unlockLevel}`;
    }
  });
}

// ============================================================
// 🌈 FADE OUT
// ============================================================
function fadeOut(element, callback) {
  if (!element) return;
  element.style.transition = "opacity 0.6s ease";
  element.style.opacity = 0;

  setTimeout(() => {
    element.style.display = "none";
    if (callback) callback();
  }, 600);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

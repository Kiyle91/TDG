// ============================================================
// 🧭 navbar.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Restart confirmation + safe exit handler
// ✦ Pauses gameplay when overlays open
// ✦ Full in-game UI navigation system
// ============================================================
/* ------------------------------------------------------------
 * MODULE: navbar.js
 * PURPOSE:
 *   Handles all in-game navbar actions: home, restart, save,
 *   load, settings, controls, and player stats. Provides safe
 *   exit to hub, restart confirmation, and consistent overlay
 *   handling during gameplay.
 *
 * SUMMARY:
 *   This module binds click events to the navbar buttons,
 *   displays a custom confirmation overlay, pauses/resumes
 *   gameplay during modal interactions, and performs the
 *   appropriate navigation actions such as restarting a map
 *   or exiting to the hub.
 *
 * FEATURES:
 *   • initNavbar() — attaches behaviours to navbar buttons
 *   • showConfirmOverlay() — reusable local confirm dialog
 *   • Safe exit → returns to Hub without breaking state
 *   • Restart map → cleans combat then resets gameplay loop
 *   • Save / Load from in-game context
 *   • Player stats + controls + settings overlays
 *
 * TECHNICAL NOTES:
 *   • Does NOT modify profile or player data except via exposed
 *     functions in main.js and ui.js.
 *   • Uses pauseGame() / resumeGame() to ensure gameplay freeze
 *     during confirm dialogs.
 * ------------------------------------------------------------ */


// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------ 

import { playFairySprinkle } from "./soundtrack.js";
import { stopGameplay, resetGameplay } from "../main.js";
import { pauseGame, resumeGame } from "./ui.js";

// ------------------------------------------------------------
// 🌸 INIT NAVBAR
// ------------------------------------------------------------

export function initNavbar() {
  const nav = document.getElementById("game-navbar");
  if (!nav) return;

  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleNavAction(btn.dataset.action));
  });
}

// ------------------------------------------------------------
// ✅ LOCAL CONFIRM OVERLAY (uses #overlay-confirm)
// ------------------------------------------------------------

function showConfirmOverlay(message, onYes, onNo) {
  const overlay = document.getElementById("overlay-confirm");
  const msgEl = document.getElementById("confirm-message");
  const yes = document.getElementById("confirm-yes");
  const no = document.getElementById("confirm-no");

  if (!overlay || !msgEl || !yes || !no) return;

  msgEl.textContent = message;

  pauseGame();

  overlay.style.display = "flex";
  overlay.classList.add("active");

  const cleanup = (shouldResume = true) => {
    yes.onclick = null;
    no.onclick = null;

    overlay.classList.remove("active");
    overlay.style.display = "none";

    if (shouldResume) resumeGame();
  };

  yes.onclick = () => {
    cleanup(false);
    onYes?.();
  };

  no.onclick = () => {
    cleanup(true);
    onNo?.();
  };
}

// ------------------------------------------------------------
// 💖 ACTION HANDLER
// ------------------------------------------------------------

function handleNavAction(action) {
  playFairySprinkle();

  switch (action) {
    // --------------------------------------------------------
    // 🏠 HOME — Safe exit to Hub
    // --------------------------------------------------------

    case "home":
      showConfirmOverlay(
        "Return to the Crystal Hub? Your progress will be saved safely.",
        () => {
          const gameContainer = document.getElementById("game-container");
          fadeOut(gameContainer, () => stopGameplay("exit"));
        },
        () => {}
      );
      break;

    // --------------------------------------------------------
    // 🔄 RESTART MAP
    // --------------------------------------------------------

    case "restart":
      showConfirmOverlay(
        "Restart this map? You’ll keep your player stats, but spires and goblins will reset.",
        () => {
          flashScreen();
          resetGameplay();
        },
        () => {}
      );
      break;

    // --------------------------------------------------------
    // 💾 SAVE / LOAD (in-game)
    // --------------------------------------------------------

    case "save": {
      playFairySprinkle();
      const container = document.getElementById("save-slots-ingame");

      import("./saveSlots.js").then((mod) => {
        mod.renderSlots(container, true);
      });

      import("./ui.js").then((mod) =>
        mod.showOverlay?.("overlay-save-game")
      );
      break;
    }

    // --------------------------------------------------------
    // ⚙️ SETTINGS
    // --------------------------------------------------------

    case "settings":
      playFairySprinkle();
      import("./settings.js").then((mod) => mod.initGameSettings?.());
      import("./ui.js").then((mod) =>
        mod.showOverlay?.("overlay-settings-game")
      );
      break;

    // --------------------------------------------------------
    // 👑 PLAYER STATS
    // --------------------------------------------------------

    case "player":
      playFairySprinkle();
      import("./ui.js").then((mod) => {
        mod.updatePlayerStatsOverlay?.();
        mod.showOverlay?.("overlay-player-stats");
      });
      break;

    // --------------------------------------------------------
    // 🎮 CONTROLS
    // --------------------------------------------------------

    case "controls":
      playFairySprinkle();
      import("./ui.js").then((mod) =>
        mod.showOverlay?.("overlay-controls")
      );
      break;

    default:
      break;
  }
}

// ------------------------------------------------------------
// ✨ FLASH EFFECT (restart feedback)
// ------------------------------------------------------------

function flashScreen() {
  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "fixed",
    inset: "0",
    background:
      "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.65), rgba(255,255,255,0))",
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0",
  });

  document.body.appendChild(flash);

  flash
    .animate(
      [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
      { duration: 350, easing: "ease-out" }
    )
    .finished.then(() => flash.remove());
}

// ------------------------------------------------------------
// 🌈 FADE HELPERS
// ------------------------------------------------------------

function fadeOut(element, callback) {
  if (!element) return;

  element.style.transition = "opacity 0.8s ease";
  element.style.opacity = 0;

  setTimeout(() => {
    element.style.display = "none";
    callback?.();
  }, 800);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

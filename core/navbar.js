// ============================================================
// 🧭 navbar.js — Olivia’s World: Crystal Keep (Restart Confirm + Safe Exit)
// ------------------------------------------------------------
// ✦ Adds restart with confirmation (same as Try Again)
// ✦ Keeps player data intact (no profile wipe)
// ✦ Uses resetGameplay() from main.js
// ✦ Home still uses confirm + safe hub exit
// ============================================================

import { playFairySprinkle } from "./soundtrack.js";
import { stopGameplay, resetGameplay } from "../main.js";
import { pauseGame, resumeGame } from "./ui.js";
import { renderSlots } from "./saveSlots.js";

// ------------------------------------------------------------
// 🌸 INIT NAVBAR
// ------------------------------------------------------------
export function initNavbar() {
  const nav = document.getElementById("game-navbar");
  if (!nav) {
    console.warn("🧭 Navbar not found in DOM.");
    return;
  }

  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleNavAction(btn.dataset.action));
  });

  console.log("🧭 Navbar initialized (safe exit + restart confirm).");
}

// ------------------------------------------------------------
// ✅ LOCAL CONFIRM OVERLAY (uses #overlay-confirm)
// ------------------------------------------------------------
function showConfirmOverlay(message, onYes, onNo) {
  const overlay = document.getElementById("overlay-confirm");
  const msgEl = document.getElementById("confirm-message");
  const yes = document.getElementById("confirm-yes");
  const no = document.getElementById("confirm-no");

  if (!overlay || !msgEl || !yes || !no) {
    console.warn("⚠️ Confirm overlay elements missing.");
    return;
  }

  msgEl.textContent = message;

  // 👉 Pause the game when the confirm box opens
  pauseGame();

  // Make sure the overlay is actually visible even if another
  // .overlay helper previously set display:none
  overlay.style.display = "flex";
  overlay.classList.add("active");

  const cleanup = (shouldResume = true) => {
    yes.onclick = null;
    no.onclick = null;

    overlay.classList.remove("active");
    overlay.style.display = "none";

    if (shouldResume) {
      resumeGame();
    }
  };

  // YES → do not resume here; leave it to the follow-up flow
  yes.onclick = () => {
    cleanup(false);
    onYes?.();
  };

  // NO  → just close & resume gameplay
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
    // 🏠 HOME — Confirm safe hub exit
    // --------------------------------------------------------
    case "home":
      showConfirmOverlay(
        "Return to the Crystal Hub? Your progress will be saved safely.",
        () => {
          console.log("🏠 Confirmed: graceful exit to hub.");
          const gameContainer = document.getElementById("game-container");
          fadeOut(gameContainer, () => stopGameplay("exit"));
        },
        () => console.log("❎ Cancelled hub return.")
      );
      break;

    // --------------------------------------------------------
    // 🔄 RESTART MAP — Confirm + ResetGameplay
    // --------------------------------------------------------
    case "restart":
      showConfirmOverlay(
        "Restart this map? You’ll keep your player stats, but spires and goblins will reset.",
        () => {
          console.log("🔄 Confirmed: restarting map...");
          flashScreen();
          resetGameplay();
        },
        () => console.log("❎ Restart cancelled.")
      );
      break;

    // --------------------------------------------------------
    // 💾 SAVE / LOAD
    // --------------------------------------------------------
    case "save":
      playFairySprinkle();

      const container = document.getElementById("save-slots-ingame");
      import("./saveSlots.js").then(mod => {
        mod.renderSlots(container, true); // allowSave = true
      });

      import("./ui.js").then(mod => mod.showOverlay?.("overlay-save-game"));
      break;

    // --------------------------------------------------------
    // ⚙️ SETTINGS (in-game version)
    // --------------------------------------------------------
    case "settings":
      playFairySprinkle();
      console.log("⚙️ Opening in-game settings overlay...");
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
      console.log("👑 Opening player stats overlay...");
      import("./ui.js").then((mod) => {
        mod.updatePlayerStatsOverlay?.();
        mod.showOverlay?.("overlay-player-stats");
      });
      break;

    // --------------------------------------------------------
    // 🎮 CONTROLS (in-game controls / keybinds screen)
    // --------------------------------------------------------
    case "controls":
      playFairySprinkle();
      import("./ui.js").then(mod => {
        mod.showOverlay?.("overlay-controls");
      });
      break;

    default:
      console.warn("Unknown navbar action:", action);

    
  }
}

// ------------------------------------------------------------
// ✨ FLASH EFFECT (short white pulse for restart feedback)
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
// 🌈 FADE HELPERS (used only for hub exit)
// ------------------------------------------------------------
function fadeOut(element, callback) {
  if (!element) return;
  element.style.transition = "opacity 0.8s ease";
  element.style.opacity = 0;
  setTimeout(() => {
    element.style.display = "none";
    if (callback) callback();
  }, 800);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

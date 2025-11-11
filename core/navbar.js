// ============================================================
// 🧭 navbar.js — Olivia’s World: Crystal Keep (Restart Confirm + Safe Exit)
// ------------------------------------------------------------
// ✦ Adds restart with confirmation (same as Try Again)
// ✦ Keeps player data intact (no profile wipe)
// ✦ Uses resetGameplay() from main.js
// ✦ Home still uses confirm + safe hub exit
// ============================================================

import { showConfirm } from "./alert.js";
import { playFairySprinkle } from "./soundtrack.js";
import { stopGameplay, resetGameplay } from "../main.js";

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
// 💖 ACTION HANDLER
// ------------------------------------------------------------
function handleNavAction(action) {
  playFairySprinkle();

  switch (action) {
    // --------------------------------------------------------
    // 🏠 HOME — Confirm safe hub exit
    // --------------------------------------------------------
    case "home":
      showConfirm(
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
      showConfirm(
        "Restart this map? You’ll keep your player stats, but towers and enemies will reset.",
        () => {
          console.log("🔄 Confirmed: restarting map...");
          // No fadeOut — just flash effect for visual feedback
          flashScreen();
          resetGameplay(); // identical to Try Again from defeat overlay
        },
        () => console.log("❎ Restart cancelled.")
      );
      break;

    // --------------------------------------------------------
    // 💾 SAVE / LOAD
    // --------------------------------------------------------
    case "save":
      alert("💾 Save/Load system coming soon!");
      break;

    // 🎮 CONTROLS
    case "controls":
      playFairySprinkle();
      console.log("🎮 Opening controls overlay...");
      import("./ui.js").then((mod) => mod.showOverlay?.("overlay-game-controls")); // ✅ updated ID
      break;

    // --------------------------------------------------------
    // ⚙️ SETTINGS (in-game version)
    // --------------------------------------------------------
    case "settings":
      playFairySprinkle();
      console.log("⚙️ Opening in-game settings overlay...");
      import("./settings.js").then((mod) => mod.initGameSettings?.());
      import("./ui.js").then((mod) => mod.showOverlay?.("overlay-settings-game"));
      break;

    // --------------------------------------------------------
    // 👑 PLAYER STATS
    // --------------------------------------------------------
    case "player":
      alert("👑 Player stats overlay coming soon!");
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
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.65), rgba(255,255,255,0))",
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0",
  });
  document.body.appendChild(flash);
  flash.animate(
    [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
    { duration: 350, easing: "ease-out" }
  ).finished.then(() => flash.remove());
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

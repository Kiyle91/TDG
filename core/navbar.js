// ============================================================
// 🧭 navbar.js — Olivia’s World: Crystal Keep (Hub-Standard Safe Exit)
// ------------------------------------------------------------
// ✦ Bottom in-game navbar for quick menus
// ✦ Home uses confirm dialog and calls stopGameplay("exit")
// ✦ Avoids triggering defeat overlay, fades cleanly to hub
// ✦ Other buttons stubbed safely
// ============================================================

import { showConfirm } from "./alert.js";
import { playFairySprinkle } from "./soundtrack.js";
import { stopGameplay } from "../main.js";

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

  console.log("🧭 Navbar initialized (hub-standard confirm + safe exit).");
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
    // 💾 SAVE / LOAD
    // --------------------------------------------------------
    case "save":
      alert("💾 Save/Load system coming soon!");
      break;

    // --------------------------------------------------------
    // 🔄 RESTART MAP
    // --------------------------------------------------------
    case "restart":
      alert("🔄 Restart feature not yet connected!");
      break;

    // --------------------------------------------------------
    // 🎮 CONTROLS
    // --------------------------------------------------------
    case "controls":
      alert("🎮 Controls overlay coming soon!");
      break;

    // --------------------------------------------------------
    // ⚙️ SETTINGS
    // --------------------------------------------------------
    case "settings":
      alert("⚙️ Settings menu coming soon!");
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
// 🌈 FADE HELPERS
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

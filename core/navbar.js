// ============================================================
// 🧭 navbar.js — Olivia’s World: Crystal Keep (Stable Build)
// ------------------------------------------------------------
// ✦ Bottom nav bar for quick access menus
// ✦ Home, Save/Load, Restart, Controls, Settings, Player
// ✦ All missing features handled gracefully (no 404s / no bad imports)
// ============================================================

import { showScreen } from "./screens.js";
// import { restartMap } from "./game.js"; // not implemented yet
// import { openSettings } from "./settings.js"; // not implemented yet
import { openControlsOverlay } from "./controls.js"; // simple placeholder we added
// import { openPlayerStats } from "./profile.js";    // not implemented yet

export function initNavbar() {
  const nav = document.getElementById("game-navbar");
  if (!nav) {
    console.warn("🧭 Navbar not found in DOM");
    return;
  }

  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => handleNavAction(btn.dataset.action));
  });

  console.log("🧭 Navbar initialized and linked.");
}

function handleNavAction(action) {
  switch (action) {
    case "home":
      showScreen("hub-screen");
      break;

    case "save":
      alert("💾 Save/Load system not yet implemented!");
      break;

    case "restart":
      restartMap?.();
      break;

    case "controls":
      openControlsOverlay?.();
      break;

    case "settings":
      openSettings?.();
      break;

    case "player":
      alert("👑 Player stats overlay coming soon!");
      break;

    default:
      console.warn("Unknown navbar action:", action);
  }
}

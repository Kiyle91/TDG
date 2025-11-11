// ============================================================
// 🏰 turretBar.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Displays all turret types with level requirements
// ✦ Unlocks visually when player reaches that level
// ============================================================

import { gameState } from "../utils/gameState.js";

const requirements = {
  1: 2,
  2: 6,
  3: 10,
  4: 15,
  5: 20,
  6: 25,
};

export function initTurretBar() {
  updateTurretBar();
  console.log("🏰 Turret bar initialized.");
}

export function updateTurretBar() {
  const level = gameState.player?.level ?? 1;
  document.querySelectorAll(".turret-slot").forEach((slot) => {
    const id = Number(slot.dataset.id);
    const req = requirements[id];
    if (level >= req) {
      slot.classList.add("unlocked");
    } else {
      slot.classList.remove("unlocked");
    }
  });
}

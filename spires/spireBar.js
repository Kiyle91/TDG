// ============================================================
// 🏰 spireBar.js — Hotkey Labels + Unlock Indicators
// ============================================================
/* ------------------------------------------------------------
 * MODULE: spireBar.js
 * PURPOSE:
 *   Controls the visual state of the Spire Bar UI, including:
 *     • Hotkey labels on each spire slot
 *     • Unlock progression previews (level requirements)
 *     • Gold cost indicators for unlocked spires
 *
 * SUMMARY:
 *   • initSpireBar() — injects the hotkey labels + performs
 *     the first full UI update.
 *   • updateSpireBar() — refreshes locked/unlocked states
 *     based on the player’s current level.
 *
 * DESIGN NOTES:
 *   • This file handles *UI only* — no gameplay logic.
 *   • Spire purchase logic exists inside spires.js.
 *   • Hotkey labels are added once, then managed visually.
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ SPIRE CONFIG
// ------------------------------------------------------------

const spireData = {
  1: { name: "Crystal Defender",  level: 1,  cost: 50,  key: "1" },
  2: { name: "Frost Sentinel",    level: 5,  cost: 100, key: "2" },
  3: { name: "Flameheart",        level: 10, cost: 150, key: "3" },
  4: { name: "Arcane Spire",      level: 15, cost: 200, key: "4" },
  5: { name: "Beacon of Light",   level: 20, cost: 250, key: "5" },
  6: { name: "Moonlight Aegis",   level: 25, cost: 300, key: "6" },
};

// ------------------------------------------------------------
// 🌸 INITIALIZE — inject hotkey labels + initial refresh
// ------------------------------------------------------------

export function initSpireBar() {
  document.querySelectorAll(".spire-slot").forEach((slot, i) => {
    const id = i + 1;
    const data = spireData[id];

    // Add keyboard hotkey label if not already present
    if (!slot.querySelector(".key-label")) {
      const key = document.createElement("div");
      key.className = "key-label";
      key.textContent = data?.key ?? id;
      slot.appendChild(key);
    }
  });

  updateSpireBar();
}

// ------------------------------------------------------------
// 🔄 UPDATE VISUAL STATE (locked → unlocked)
// ------------------------------------------------------------

export function updateSpireBar() {
  const level = gameState.player?.level ?? 1;

  document.querySelectorAll(".spire-slot").forEach(slot => {
    const id = Number(slot.dataset.id);
    const data = spireData[id];
    if (!data) return;

    const img = slot.querySelector("img");
    const label = slot.querySelector("span");
    const keyLabel = slot.querySelector(".key-label");

    // --------------------------------------------------------
    // 🌑 LOCKED STATE
    // --------------------------------------------------------

    if (level < data.level) {
      slot.classList.remove("unlocked");
      label.textContent = `Lv ${data.level}`;
      label.style.color = "#fff";
      label.style.textShadow = "0 0 4px #000";
      slot.title = `${data.name} — Unlocks at Level ${data.level}`;
      img.style.filter = "grayscale(1) brightness(0.6)";
      slot.style.boxShadow = "none";
      keyLabel?.classList.remove("unlocked");
      return;
    }

    // --------------------------------------------------------
    // 🌕 UNLOCKED STATE
    // --------------------------------------------------------
    
    slot.classList.add("unlocked");
    label.textContent = `🪙 ${data.cost}`;
    label.style.color = "#fff";
    label.style.textShadow = "0 0 6px #000000ff, 0 0 12px #000000ff";
    slot.title = `${data.name} — Cost: ${data.cost} Gold`;

    img.style.filter = "none";
    slot.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.6)";
    keyLabel?.classList.add("unlocked");
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

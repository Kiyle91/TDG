// ============================================================
// 🏰 spireBar.js — Olivia’s World: Crystal Keep (Hotkey Labels)
// ------------------------------------------------------------
// ✦ Displays spire unlock progression in the HUD bar
// ✦ Adds visible hotkey indicators beside each spire slot
// ✦ Uses SPIRE_UNLOCKS from spirePlacement.js as the single
//   source of truth for names / levels / costs / hotkeys
// ============================================================

import { gameState } from "./utils/gameState.js";
import { SPIRE_UNLOCKS } from "./spirePlacement.js";

// ------------------------------------------------------------
// ⚙️ CONFIG VIEW
// ------------------------------------------------------------
//
// Reuse the same config object from spirePlacement.
// Keys are 1–6 matching data-id attributes on .spire-slot.
const spireData = SPIRE_UNLOCKS;

// Fallback cost if, for some reason, a spire is missing one.
const DEFAULT_COST = 50;

// ------------------------------------------------------------
// 🌸 INITIALIZE
// ------------------------------------------------------------
export function initSpireBar() {
  // Inject hotkey labels (if not already present)
  document.querySelectorAll(".spire-slot").forEach((slot, i) => {
    const id = i + 1;
    const data = spireData[id];

    if (!slot.querySelector(".key-label")) {
      const key = document.createElement("div");
      key.className = "key-label";
      // Prefer explicit hotkey; fall back to its index
      key.textContent = data?.hotkey ?? String(id);
      slot.appendChild(key);
    }
  });

  updateSpireBar();
  console.log("🏰 Spire bar initialized with shared spire config + hotkeys.");
}

// ------------------------------------------------------------
// 🔄 UPDATE VISUAL STATE
// ------------------------------------------------------------
export function updateSpireBar() {
  const level = gameState.player?.level ?? 1;

  document.querySelectorAll(".spire-slot").forEach((slot) => {
    const id = Number(slot.dataset.id);
    const data = spireData[id];
    if (!data) return;

    const img = slot.querySelector("img");
    const label = slot.querySelector("span");
    const keyLabel = slot.querySelector(".key-label");

    const unlockLevel = data.unlock ?? 1;
    const cost = data.cost ?? DEFAULT_COST;

    // 🌑 Locked
    if (level < unlockLevel) {
      slot.classList.remove("unlocked");

      if (label) {
        label.textContent = `Lv ${unlockLevel}`;
        label.style.color = "#fff";
        label.style.textShadow = "0 0 4px #000";
      }

      slot.title = `${data.name} — Unlocks at Level ${unlockLevel}`;

      if (img) {
        img.style.filter = "grayscale(1) brightness(0.6)";
      }

      slot.style.boxShadow = "none";
      if (keyLabel) keyLabel.classList.remove("unlocked");
    }

    // 🌕 Unlocked
    else {
      slot.classList.add("unlocked");

      if (label) {
        label.textContent = `🪙 ${cost}`;
        label.style.color = "#fff";
        label.style.textShadow =
          "0 0 6px #ffdf5f, 0 0 12px #ffdf5f";
      }

      slot.title = `${data.name} — Cost: ${cost} Gold`;

      if (img) {
        img.style.filter = "none";
      }

      slot.style.boxShadow = "0 0 10px rgba(255, 223, 95, 0.6)";
      if (keyLabel) keyLabel.classList.add("unlocked");
    }
  });
}

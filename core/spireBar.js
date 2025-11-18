// ============================================================
// 🏰 spireBar.js — Olivia’s World: Crystal Keep (Hotkey Labels)
// ------------------------------------------------------------
// ✦ Displays spire unlock progression
// ✦ Adds visible hotkey indicators beside each spire slot
// ✦ Works seamlessly with existing unlock logic
// ============================================================

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const spireData = {
  1: { name: "Crystal Defender", level: 2, cost: 50, key: "1" },
  2: { name: "Frost Sentinel", level: 5, cost: 100, key: "2" },
  3: { name: "Flameheart", level: 10, cost: 150, key: "3" },
  4: { name: "Arcane Spire", level: 15, cost: 200, key: "4" },
  5: { name: "Beacon of Light", level: 20, cost: 250, key: "5" },
  6: { name: "Moonlight Aegis", level: 25, cost: 300, key: "6" },
};

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
      key.textContent = data?.key ?? id;
      slot.appendChild(key);
    }
  });

  updateSpireBar();
  console.log("🏰 Spire bar initialized with hotkey labels.");
}

// ------------------------------------------------------------
// 🔄 UPDATE VISUAL STATE
// ------------------------------------------------------------
export function updateSpireBar() {
  const level = gameState.player?.level ?? 1;

  document.querySelectorAll(".spire-slot").forEach((slot) => {
    const id = Number(slot.dataset.id);
    const data = spireData[id];
    const img = slot.querySelector("img");
    const label = slot.querySelector("span");
    const keyLabel = slot.querySelector(".key-label");

    if (!data) return;

    // 🌑 Locked
    if (level < data.level) {
      slot.classList.remove("unlocked");
      label.textContent = `Lv ${data.level}`;
      label.style.color = "#fff";
      label.style.textShadow = "0 0 4px #000";
      slot.title = `${data.name} — Unlocks at Level ${data.level}`;
      img.style.filter = "grayscale(1) brightness(0.6)";
      slot.style.boxShadow = "none";
      if (keyLabel) keyLabel.classList.remove("unlocked");
    }

    // 🌕 Unlocked
    else {
      slot.classList.add("unlocked");
      label.textContent = `🪙 ${data.cost}`;
      label.style.color = "#fff";
      label.style.textShadow = "0 0 6px #ffdf5f, 0 0 12px #ffdf5f";
      slot.title = `${data.name} — Cost: ${data.cost} Gold`;
      img.style.filter = "none";
      slot.style.boxShadow = "0 0 10px rgba(255, 223, 95, 0.6)";
      if (keyLabel) keyLabel.classList.add("unlocked");
    }
  });
}

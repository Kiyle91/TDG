// ============================================================
// 🏰 turretBar.js — Olivia’s World: Crystal Keep (White Text + Gold Shadow)
// ------------------------------------------------------------
// ✦ Displays turret unlock progression
// ✦ Shows level requirement when locked
// ✦ Shows 🪙 gold cost when unlocked (white text + gold glow)
// ============================================================

import { gameState } from "../utils/gameState.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const turretData = {
  1: { name: "Crystal Defender", level: 2, cost: 50 },
  2: { name: "Frost Sentinel", level: 6, cost: 100 },
  3: { name: "Flameheart", level: 10, cost: 150 },
  4: { name: "Arcane Spire", level: 15, cost: 200 },
  5: { name: "Beacon of Light", level: 20, cost: 250 },
  6: { name: "Moonlight Aegis", level: 25, cost: 300 },
};

// ------------------------------------------------------------
// 🌸 INITIALIZE
// ------------------------------------------------------------
export function initTurretBar() {
  updateTurretBar();
  console.log("🏰 Turret bar initialized.");
}

// ------------------------------------------------------------
// 🔄 UPDATE VISUAL STATE
// ------------------------------------------------------------
export function updateTurretBar() {
  const level = gameState.player?.level ?? 1;

  document.querySelectorAll(".turret-slot").forEach((slot) => {
    const id = Number(slot.dataset.id);
    const data = turretData[id];
    const img = slot.querySelector("img");
    const label = slot.querySelector("span");

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
    }
  });
}

// ============================================================
// 💎 towerUnlock.js — Olivia’s World: Crystal Keep (Cinematic Unlock Popup)
// ------------------------------------------------------------
// ✦ Displays a cinematic popup when a new tower is unlocked
// ✦ Styled to match story.js dialogue system
// ✦ Pauses gameplay until player confirms
// ✦ Shows tower sprite + name + description + OK button
// ============================================================

import { gameState } from "../utils/gameState.js";
import { playFairySprinkle } from "./soundtrack.js";

// ------------------------------------------------------------
// 🏰 Tower Data (matches turretBar/towers.js)
// ------------------------------------------------------------
const towerInfo = {
  1: {
    name: "Crystal Defender",
    img: "./assets/images/turrets/basic_turret.png",
    desc: "A steady crystal cannon that fires glowing bolts of energy to protect the Keep.",
    unlockLevel: 2,
  },
  2: {
    name: "Frost Sentinel",
    img: "./assets/images/turrets/frost_turret.png",
    desc: "Emits waves of freezing air, slowing all nearby goblins with a shimmering frost aura.",
    unlockLevel: 6,
  },
  3: {
    name: "Flameheart",
    img: "./assets/images/turrets/flame_turret.png",
    desc: "Unleashes searing bursts of flame that burn enemies over time — hotter the longer they burn!",
    unlockLevel: 10,
  },
  4: {
    name: "Arcane Spire",
    img: "./assets/images/turrets/arcane_turret.png",
    desc: "A majestic spire that channels pure arcane energy, striking distant foes with great power.",
    unlockLevel: 15,
  },
  5: {
    name: "Beacon of Light",
    img: "./assets/images/turrets/light_turret.png",
    desc: "Blesses nearby allies and heals the Princess when she stands close. Radiant and serene.",
    unlockLevel: 20,
  },
  6: {
    name: "Moonlight Aegis",
    img: "./assets/images/turrets/moon_turret.png",
    desc: "Channels lunar energy to knock back goblins and shield nearby defenders under moonlight.",
    unlockLevel: 25,
  },
};

// ------------------------------------------------------------
// 🌟 SHOW UNLOCK ALERT
// ------------------------------------------------------------
export async function showTowerUnlock(towerId) {
  const data = towerInfo[towerId];
  if (!data) return;

  // 🩵 Pause gameplay
  gameState.paused = true;

  const overlay = document.createElement("div");
  overlay.id = "tower-unlock-overlay";
  overlay.className = "overlay active";
  overlay.style.zIndex = "9999";
  overlay.innerHTML = `
    <div class="story-box tower-unlock-box">
      <div class="story-content">
        <img src="${data.img}" alt="${data.name}" class="story-portrait tower-img" />
        <div class="story-text">
          <h2>✨ ${data.name} Unlocked!</h2>
          <p>${data.desc}</p>
        </div>
      </div>
      <button id="unlock-ok" class="story-next-btn">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  playFairySprinkle();

  return new Promise((resolve) => {
    const okBtn = overlay.querySelector("#unlock-ok");
    okBtn.addEventListener("click", () => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        overlay.remove();
        gameState.paused = false;
        resolve();
      }, 400);
    });
  });
}

// ------------------------------------------------------------
// 🧭 CHECK FOR TOWER UNLOCK
// ------------------------------------------------------------
export async function checkTowerUnlocks() {
  const level = gameState.player?.level ?? 1;
  if (!gameState.unlockedTowers) gameState.unlockedTowers = new Set();

  for (const [id, tower] of Object.entries(towerInfo)) {
    if (level >= tower.unlockLevel && !gameState.unlockedTowers.has(id)) {
      gameState.unlockedTowers.add(id);
      await showTowerUnlock(id);
    }
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

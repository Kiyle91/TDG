// ============================================================
// 🌟 levelSystem.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles XP gain, level-ups, and stat upgrades
// ✦ Uses alert.js for upgrade UI (or a custom overlay later)
// ✦ Grants 3 upgrade points per level
// ============================================================

import { gameState } from "../utils/gameState.js";
import { showAlert } from "./alert.js";
import { updateHUD } from "./ui.js";
import { spawnFloatingText } from "./floatingText.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const XP_PER_LEVEL_BASE = 100;  // base XP required for level 1→2
const XP_SCALING = 1.25;        // how much XP requirement scales per level
const POINTS_PER_LEVEL = 3;     // stat points awarded per level

// ------------------------------------------------------------
// 🧠 XP GAIN ON ENEMY DEATH
// ------------------------------------------------------------
export function awardXP(amount = 25) {
  const p = gameState.player;
  if (!p) return;

  p.xp = (p.xp || 0) + amount;
  spawnFloatingText(p.pos.x, p.pos.y - 50, `+${amount} XP`, "#b3ffb3", 18);
  checkLevelUp();
}

// ------------------------------------------------------------
// 🎯 LEVEL UP CHECK
// ------------------------------------------------------------
function checkLevelUp() {
  const p = gameState.player;
  if (!p) return;

  const xpToNext = getXpForLevel(p.level || 1);
  if (p.xp >= xpToNext) {
    p.xp -= xpToNext;
    p.level = (p.level || 1) + 1;
    p.statPoints = (p.statPoints || 0) + POINTS_PER_LEVEL;

    spawnFloatingText(p.pos.x, p.pos.y - 60, `⭐ Level ${p.level}!`, "#fff2b3", 20);

    showLevelUpAlert(p);
  }
}

// ------------------------------------------------------------
// 📈 CALCULATE XP THRESHOLD
// ------------------------------------------------------------
function getXpForLevel(level) {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_SCALING, level - 1));
}

// ------------------------------------------------------------
// 🧮 LEVEL UP ALERT
// ------------------------------------------------------------
function showLevelUpAlert(p) {
  const msg = `🎉 You reached Level ${p.level}! 
You have ${p.statPoints} points to allocate.`;

  showAlert(msg, () => {
    showStatUpgradeOptions();
  });
}

// ------------------------------------------------------------
// 🧩 STAT UPGRADE MENU (simple alert-driven version)
// ------------------------------------------------------------
function showStatUpgradeOptions() {
  const p = gameState.player;
  if (!p || !p.statPoints) return;

  const stats = [
    { name: "HP", key: "maxHp" },
    { name: "Mana", key: "maxMana" },
    { name: "Attack", key: "attack" },
    { name: "Spell Power", key: "spellPower" },
    { name: "Ranged Attack", key: "rangedAttack" },
  ];

  const buttons = stats.map((s, i) => {
    return `<button class="levelup-btn" data-key="${s.key}">${s.name}</button>`;
  }).join("");

  const modal = document.createElement("div");
  modal.className = "levelup-overlay";
  modal.innerHTML = `
    <div class="levelup-box">
      <h2>✨ Level Up!</h2>
      <p>You have <strong>${p.statPoints}</strong> points left.</p>
      <div class="levelup-buttons">${buttons}</div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll(".levelup-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (p.statPoints > 0) {
        p[key] = (p[key] || 0) + 5; // each point = +5 to stat
        p.statPoints--;
        updateHUD();
        spawnFloatingText(p.pos.x, p.pos.y - 30, `+${key.replace("max", "")}`, "#b5e2ff");
        if (p.statPoints <= 0) {
          modal.remove();
        } else {
          modal.querySelector("p").innerHTML = `You have <strong>${p.statPoints}</strong> points left.`;
        }
      }
    });
  });
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

// ============================================================
// 🌟 levelSystem.js — Olivia’s World: Crystal Keep
//   (Static Overlay + 3 Choices: Attack / Spell / Ranged)
// ------------------------------------------------------------
// ✦ Handles XP gain, level-ups, and stat upgrades
// ✦ HP & Mana now increase +10 automatically every level
// ✦ Player can only allocate to Attack, Spell Power, or Ranged Attack
// ✦ Full pause/resume + spire unlock integration preserved
// ============================================================

import { gameState } from "../utils/gameState.js";
import { updateHUD, pauseGame, resumeGame } from "./ui.js";
import { spawnFloatingText } from "./floatingText.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const XP_PER_LEVEL_BASE = 100;  // base XP required for level 1→2
const XP_SCALING = 1.25;        // XP requirement growth per level
const POINTS_PER_LEVEL = 1;     // stat points awarded per level

// ------------------------------------------------------------
// 🧠 XP GAIN ON GOBLIN DEATH
// ------------------------------------------------------------
export function awardXP(amount = 25) {
  const p = gameState.player;
  if (!p) return;

  p.xp = (p.xp || 0) + amount;

  // Floating XP text
  spawnFloatingText(p.pos.x, p.pos.y - 50, `+${amount} XP`, "#b3ffb3", 18);

  checkLevelUp();
}

// ------------------------------------------------------------
// 🎯 LEVEL UP CHECK
// ------------------------------------------------------------
function checkLevelUp() {
  const p = gameState.player;
  if (!p) return;

  const currentLevel = p.level || 1;
  const xpToNext = getXpForLevel(currentLevel);

  if (p.xp >= xpToNext) {
    p.xp -= xpToNext;
    p.level = currentLevel + 1;
    p.statPoints = (p.statPoints || 0) + POINTS_PER_LEVEL;

    // 🩷 Auto-boost HP and Mana every level
    p.maxHp = (p.maxHp || 100) + 10;
    p.maxMana = (p.maxMana || 50) + 10;
    p.hp = p.maxHp;
    p.mana = p.maxMana;

    spawnFloatingText(p.pos.x, p.pos.y - 60, `⭐ Level ${p.level}!`, "#fff2b3", 22);

    // Pause gameplay while choosing stats
    pauseGame();
    console.log("⏸️ Gameplay paused for Level Up");

    // 🔧 Pass a callback that runs once stat allocation is complete
    showLevelUpOverlay(p, async () => {
      console.log("🎯 Stat allocation complete — checking spire unlocks...");
      resumeGame();
      console.log("▶️ Gameplay resumed after spire unlock popup");
    });
  }
}

// ------------------------------------------------------------
// 📈 CALCULATE XP THRESHOLD
// ------------------------------------------------------------
function getXpForLevel(level) {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_SCALING, level - 1));
}

// ------------------------------------------------------------
// 💫 LEVEL UP OVERLAY (static DOM version)
// ------------------------------------------------------------
function showLevelUpOverlay(p, onClose) {
  const overlay = document.getElementById("overlay-levelup");
  if (!overlay) {
    console.warn("⚠️ overlay-levelup not found in DOM.");
    if (typeof onClose === "function") onClose();
    return;
  }

  // Update message
  const msg = overlay.querySelector(".levelup-message");
  if (msg) {
    msg.innerHTML = `
      You reached <strong>Level ${p.level}</strong>!<br>
      You have <strong>${p.statPoints}</strong> point${p.statPoints > 1 ? "s" : ""} to allocate.
    `;
  }

  // Wire buttons
  const buttons = overlay.querySelectorAll(".levelup-btn");
  buttons.forEach((btn) => {
    const key = btn.dataset.key;
    if (!key) return;

    // Overwrite any existing handler
    btn.onclick = () => handleStatUpgrade(p, key, overlay, onClose);
  });

  // Show overlay (without using generic showOverlay, so we fully control it)
  overlay.classList.remove("hidden");
  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("active"));
}

// ------------------------------------------------------------
// 🧮 HANDLE STAT UPGRADE
// ------------------------------------------------------------
function handleStatUpgrade(p, key, overlay, onClose) {
  if (!p || p.statPoints <= 0) return;

  // Upgrade stat (same +5 as before)
  p[key] = (Number(p[key]) || 0) + 5;
  p.statPoints--;

  // Floating feedback
  const label =
    key === "attack"
      ? "Attack"
      : key === "spellPower"
      ? "Spell Power"
      : key === "rangedAttack"
      ? "Ranged Attack"
      : key;

  spawnFloatingText(p.pos.x, p.pos.y - 30, `+${label}`, "#b5e2ff");

  // Update HUD
  updateHUD();

  // Update overlay text
  const text = overlay.querySelector(".levelup-message");
  if (p.statPoints > 0) {
    if (text) {
      text.innerHTML = `
        You reached <strong>Level ${p.level}</strong>!<br>
        You have <strong>${p.statPoints}</strong> point${p.statPoints > 1 ? "s" : ""} left.
      `;
    }
  } else {
    closeLevelUpOverlay(overlay, onClose);
  }
}

// ------------------------------------------------------------
// 🧹 CLOSE OVERLAY + TRIGGER CALLBACK
// ------------------------------------------------------------
function closeLevelUpOverlay(overlay, onClose) {
  if (!overlay) return;

  overlay.classList.remove("active");
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.add("hidden");
  }, 250);

  if (typeof onClose === "function") onClose();
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

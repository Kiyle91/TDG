// ============================================================
// levelSystem.js - Olivia's World: Crystal Keep
// (Static Overlay + 3 Choices: Attack / Spell / Ranged)
// ------------------------------------------------------------
// - Handles XP gain, level-ups, and stat upgrades
// - HP & Mana auto-increase each level (+10)
// - Player allocates: Attack, Spell Power, or Ranged
// - Pauses gameplay during allocation
// - Fully stable, save-safe, UI integrated
// ============================================================
/* ------------------------------------------------------------
 * MODULE: levelSystem.js
 * PURPOSE:
 *   Manages the player's experience system including XP gain,
 *   level thresholds, stat point allocation, level-up rewards,
 *   and presentation of the Level-Up overlay.
 *
 * SUMMARY:
 *   When enemies award XP, the player can level up. Leveling up
 *   restores HP/Mana, increases max HP/Mana by +10 each, grants
 *   stat points, and pauses gameplay while the player chooses a
 *   stat upgrade (Attack, Spell Power, or Ranged Attack).
 *
 * FEATURES:
 *   - awardXP(): grants XP and triggers level-up checks
 *   - Automatic HP/Mana increases on level up
 *   - Stat allocation overlay with 3 upgrade choices
 *   - pauseGame() + resumeGame() integration preserved
 *   - Floating text feedback for XP + upgrades
 *
 * TECHNICAL NOTES:
 *   - XP thresholds scale by exponential growth
 *   - Overlay is fully static DOM for reliability
 *   - Compatible with game's spire unlock system
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// Imports
// ------------------------------------------------------------

import { gameState, saveProfiles } from "../utils/gameState.js";
import { updateHUD, pauseGame, resumeGame } from "../screenManagement/ui.js";
import { spawnFloatingText } from "../fx/floatingText.js";
import { Events, EVENT_NAMES as E } from "../core/eventEngine.js";

// ------------------------------------------------------------
// Module-level variables
// ------------------------------------------------------------

const XP_PER_LEVEL_BASE = 100;
const XP_SCALING = 1.25;
const POINTS_PER_LEVEL = 1;

// ------------------------------------------------------------
// XP Gain
// ------------------------------------------------------------

export function awardXP(amount = 25) {
  const p = gameState.player;
  if (!p) return;

  p.xp = (p.xp || 0) + amount;

  // Visual feedback
  spawnFloatingText(p.pos.x, p.pos.y - 50, `+${amount} XP`, "#b3ffb3", 18);

  checkLevelUp().catch((err) => {
    console.warn("Level up processing failed:", err);
  });
}

// ------------------------------------------------------------
// Level-up check
// ------------------------------------------------------------

async function checkLevelUp() {
  const p = gameState.player;
  if (!p) return;

  let leveledUp = false;

  while (true) {
    const currentLevel = p.level || 1;
    const xpToNext = getXpForLevel(currentLevel);
    if (p.xp < xpToNext) break;

    p.xp -= xpToNext;
    p.level = currentLevel + 1;
    p.statPoints = (p.statPoints || 0) + POINTS_PER_LEVEL;

    // Auto HP/Mana increase
    p.maxHp = (p.maxHp || 100) + 10;
    p.maxMana = (p.maxMana || 50) + 10;
    p.hp = p.maxHp;
    p.mana = p.maxMana;
    p.xpToNext = getXpForLevel(p.level);

    Events.emit(E.playerLevelUp, { level: p.level });

    spawnFloatingText(
      p.pos.x,
      p.pos.y - 60,
      `Level ${p.level}!`,
      "#fff2b3",
      22
    );

    leveledUp = true;
  }

  if (!leveledUp) return;
  saveProfiles();

  // Pause gameplay for allocation
  pauseGame();

  // Show overlay and resume when done
  showLevelUpOverlay(p, () => {
    updateSummaryPanel(p);
    resumeGame();
  });
}

// ------------------------------------------------------------
// XP threshold curve
// ------------------------------------------------------------

function getXpForLevel(level) {
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_SCALING, level - 1));
}

// ------------------------------------------------------------
// Level-up overlay
// ------------------------------------------------------------

function showLevelUpOverlay(p, onClose) {
  const overlay = document.getElementById("overlay-levelup");
  if (!overlay) {
    if (typeof onClose === "function") onClose();
    return;
  }

  // Update overlay text
  const msg = overlay.querySelector(".levelup-message");
  if (msg) {
    msg.innerHTML = `
      You reached <strong>Level ${p.level}</strong>!<br>
      You have <strong>${p.statPoints}</strong> point${p.statPoints > 1 ? "s" : ""} to allocate.
    `;
  }

  // Attach button handlers
  const buttons = overlay.querySelectorAll(".levelup-btn");
  buttons.forEach((btn) => {
    const key = btn.dataset.key;
    if (!key) return;

    btn.onclick = () => handleStatUpgrade(p, key, overlay, onClose);
  });

  // Show overlay
  overlay.classList.remove("hidden");
  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("active"));
}

// ------------------------------------------------------------
// Stat upgrade handler
// ------------------------------------------------------------

function handleStatUpgrade(p, key, overlay, onClose) {
  if (!p || p.statPoints <= 0) return;

  p[key] = (Number(p[key]) || 0) + 5;
  p.statPoints--;

  const labelMap = {
    attack: "Attack",
    spellPower: "Spell Power",
    rangedAttack: "Ranged Attack",
  };

  const label = labelMap[key] || key;

  spawnFloatingText(p.pos.x, p.pos.y - 30, `+${label}`, "#b5e2ff");
  updateHUD();
  updateSummaryPanel(p);
  saveProfiles();

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

function updateSummaryPanel(p) {
  const BASE_ATTACK = 15;
  const BASE_SPELL = 10;
  const BASE_RANGED = 10;

  const atk = Number(p.attack || 0);
  const sp = Number(p.spellPower || 0);
  const rng = Number(p.rangedAttack || 0);

  const atkSpent = Math.max(0, Math.floor((atk - BASE_ATTACK) / 5));
  const spSpent = Math.max(0, Math.floor((sp - BASE_SPELL) / 5));
  const rngSpent = Math.max(0, Math.floor((rng - BASE_RANGED) / 5));

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set("sum-attack", atkSpent);
  set("sum-spell", spSpent);
  set("sum-ranged", rngSpent);
}

// ------------------------------------------------------------
// Close level-up overlay
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
// END OF FILE
// ============================================================

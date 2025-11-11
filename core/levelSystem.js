// ============================================================
// 🌟 levelSystem.js — Olivia’s World: Crystal Keep (Pause + Full Upgrade + Tower Unlock Integration)
// ------------------------------------------------------------
// ✦ Handles XP gain, level-ups, and stat upgrades
// ✦ Pauses gameplay and opens a proper overlay for upgrades
// ✦ Awards 3 points per level with real-time HUD updates
// ✦ Automatically checks and displays tower unlock popups
// ============================================================

import { gameState } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { spawnFloatingText } from "./floatingText.js";
import { checkTowerUnlocks } from "./towerUnlock.js";

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const XP_PER_LEVEL_BASE = 100;  // base XP required for level 1→2
const XP_SCALING = 1.25;        // XP requirement growth per level
const POINTS_PER_LEVEL = 3;     // stat points awarded per level

// ------------------------------------------------------------
// 🧠 XP GAIN ON ENEMY DEATH
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

  const xpToNext = getXpForLevel(p.level || 1);

  if (p.xp >= xpToNext) {
    p.xp -= xpToNext;
    p.level = (p.level || 1) + 1;
    p.statPoints = (p.statPoints || 0) + POINTS_PER_LEVEL;

    spawnFloatingText(p.pos.x, p.pos.y - 60, `⭐ Level ${p.level}!`, "#fff2b3", 22);

    // ✅ Pause gameplay for stat upgrades
    gameState.paused = true;
    console.log("⏸️ Gameplay paused for Level Up");

    // 🔧 Pass a callback that runs once stat allocation is complete
    showLevelUpOverlay(p, async () => {
      console.log("🎯 Stat allocation complete — checking tower unlocks...");
      await checkTowerUnlocks(); // will show tower popup if new tower unlocked
      gameState.paused = false;
      console.log("▶️ Gameplay resumed after tower unlock popup");
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
// 💫 LEVEL UP OVERLAY (with callback)
// ------------------------------------------------------------
function showLevelUpOverlay(p, onClose) {
  // Remove any existing overlay first
  document.querySelector(".levelup-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "levelup-overlay";
  overlay.innerHTML = `
    <div class="levelup-backdrop"></div>
    <div class="levelup-box">
      <h2>✨ Level Up!</h2>
      <p>You reached <strong>Level ${p.level}</strong>!<br>
      You have <strong>${p.statPoints}</strong> points to allocate.</p>
      <div class="levelup-buttons"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Build stat buttons
  const stats = [
    { name: "HP", key: "maxHp" },
    { name: "Mana", key: "maxMana" },
    { name: "Attack", key: "attack" },
    { name: "Spell Power", key: "spellPower" },
    { name: "Ranged Attack", key: "rangedAttack" },
  ];

  const btnContainer = overlay.querySelector(".levelup-buttons");
  stats.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "levelup-btn";
    btn.textContent = s.name;
    btn.dataset.key = s.key;
    btn.addEventListener("click", () => handleStatUpgrade(p, s.key, overlay, onClose));
    btnContainer.appendChild(btn);
  });

  requestAnimationFrame(() => overlay.classList.add("visible"));
}

// ------------------------------------------------------------
// 🧮 HANDLE STAT UPGRADE
// ------------------------------------------------------------
function handleStatUpgrade(p, key, overlay, onClose) {
  if (!p || p.statPoints <= 0) return;

  // Upgrade stat
  p[key] = (Number(p[key]) || 0) + 5;
  p.statPoints--;

  // Auto-boost current HP/Mana if max increased
  if (key === "maxHp")   p.hp   = Math.min(p.maxHp,   p.hp + 5);
  if (key === "maxMana") p.mana = Math.min(p.maxMana, p.mana + 5);

  // Floating feedback
  spawnFloatingText(p.pos.x, p.pos.y - 30, `+${key.replace("max", "")}`, "#b5e2ff");

  // Update HUD
  updateHUD();

  // Update overlay text
  const text = overlay.querySelector("p");
  if (p.statPoints > 0) {
    text.innerHTML = `You reached <strong>Level ${p.level}</strong>!<br>
    You have <strong>${p.statPoints}</strong> points left.`;
  } else {
    closeLevelUpOverlay(overlay, onClose);
  }
}

// ------------------------------------------------------------
// 🧹 CLOSE OVERLAY + TRIGGER CALLBACK
// ------------------------------------------------------------
function closeLevelUpOverlay(overlay, onClose) {
  if (!overlay) return;

  overlay.classList.remove("visible");
  setTimeout(() => overlay.remove(), 250);

  // Don’t unpause yet — wait for tower unlock alert
  if (typeof onClose === "function") onClose();
}

// ------------------------------------------------------------
// 🎨 BASIC CSS INJECTION (only if missing)
// ------------------------------------------------------------
if (!document.getElementById("levelup-style")) {
  const style = document.createElement("style");
  style.id = "levelup-style";
  style.textContent = `
  .levelup-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    background: rgba(255, 220, 255, 0.35);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 9000;
  }
  .levelup-overlay.visible { opacity: 1; }
  .levelup-box {
    background: linear-gradient(180deg, #fff0fa, #fbe9ff, #e8f5ff);
    border: 2px solid rgba(255,255,255,0.8);
    box-shadow: 0 0 12px rgba(255,255,255,0.6);
    border-radius: 20px;
    padding: 25px 35px;
    text-align: center;
    font-family: "Comic Sans MS", cursive;
    color: #b44ac0;
    animation: popIn 0.3s ease;
  }
  .levelup-box h2 {
    font-size: 26px;
    margin-bottom: 10px;
    color: #ff99d9;
    text-shadow: 0 0 6px rgba(255,255,255,0.7);
  }
  .levelup-box p {
    font-size: 18px;
    margin-bottom: 15px;
  }
  .levelup-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .levelup-btn {
    background: linear-gradient(180deg, #ffb3e6, #b3e5ff);
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 16px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .levelup-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 0 8px rgba(255,255,255,0.6);
  }
  @keyframes popIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  `;
  document.head.appendChild(style);
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

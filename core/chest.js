// ============================================================
// 🎁 chest.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles daily reward chest logic
// ✦ Rewards diamonds (currently fixed at 10 per claim)
// ✦ Individual cooldown per profile (1 hour)
// ✦ Includes hub sparkle burst animation
// ============================================================
/* ------------------------------------------------------------
 * MODULE: chest.js
 * PURPOSE:
 *   Controls the Daily Reward Chest system inside the Hub.
 *
 * SUMMARY:
 *   This module manages a per-profile reward chest that can be
 *   claimed once per hour. It updates its timer automatically,
 *   applies the correct gold/diamond rewards, triggers sparkle
 *   effects, and syncs the result to profile storage.
 *
 * FEATURES:
 *   • initChest() — main setup, attaches listeners & timers
 *   • claimReward() — grants reward + plays chest animation
 *   • updateChestState() — updates timer text & cooldown logic
 *   • spawnSparkles() — visual effect on claim
 *
 * TECHNICAL NOTES:
 *   • Cooldown stored individually for each profile
 *   • reward persists instantly via saveProfiles()
 *   • UI updated through updateHUD() + updateHubCurrencies()
 * ------------------------------------------------------------ */



// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, addGold, addDiamonds, saveProfiles } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { updateHubCurrencies } from "./hub.js";
import { playChestOpen } from "../core/soundtrack.js";

// ------------------------------------------------------------
// ♻️ Variables
// ------------------------------------------------------------

const COOLDOWN_MS = 60 * 60 * 1000;
let chestEl, timerEl, imgEl;

// ------------------------------------------------------------
// 🌸 INITIALIZATION
// ------------------------------------------------------------
export function initChest() {
  chestEl = document.getElementById("daily-chest");
  timerEl = document.getElementById("chest-timer");
  imgEl = document.getElementById("chest-img");

  if (!chestEl || !imgEl) return;

  updateChestState();

  imgEl.addEventListener("click", () => {
    if (!chestEl.classList.contains("disabled")) {
      claimReward();
    }
  });

  setInterval(updateChestState, 1000);
}

// ------------------------------------------------------------
// 💖 CLAIM REWARD
// ------------------------------------------------------------
function claimReward() {
  if (!gameState.profile) return;

  const profile = gameState.profile;

  addDiamonds(10);
  updateHUD();
  updateHubCurrencies();

  spawnSparkles();
  playChestOpen();

  profile.lastChestClaim = Date.now();
  saveProfiles();

  chestEl.classList.add("disabled");
  timerEl.textContent = "Next reward in 1:00:00";
}

// ------------------------------------------------------------
// ⏰ UPDATE CHEST STATE
// ------------------------------------------------------------
function updateChestState() {
  if (!gameState.profile) return;

  const profile = gameState.profile;
  const lastClaimTime = profile.lastChestClaim || 0;

  if (!lastClaimTime) {
    chestEl.classList.remove("disabled");
    timerEl.textContent = "Ready to open!";
    return;
  }

  const now = Date.now();
  const diff = now - lastClaimTime;

  if (diff >= COOLDOWN_MS) {
    chestEl.classList.remove("disabled");
    timerEl.textContent = "Ready to open!";
  } else {
    chestEl.classList.add("disabled");
    const remaining = COOLDOWN_MS - diff;

    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining / (1000 * 60)) % 60);
    const s = Math.floor((remaining / 1000) % 60);

    timerEl.textContent =
      `Next reward in ${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

// ------------------------------------------------------------
// 🌈 SPARKLE BURST EFFECT
// ------------------------------------------------------------
function spawnSparkles() {
  const sparkleCount = 80;
  const maxRadius = 400;
  const duration = 1500;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const size = Math.random() * 16 + 10;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.borderRadius = "50%";
    sparkle.style.left = `${window.innerWidth / 2}px`;
    sparkle.style.top = `${window.innerHeight / 2}px`;

    const color = `hsl(${Math.random() * 360}, 100%, ${70 + Math.random() * 20}%)`;
    sparkle.style.background = color;
    sparkle.style.boxShadow = `0 0 20px ${color}`;

    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);
    sparkle.style.animation = `sparkleFly ${duration}ms ease-out forwards`;

    setTimeout(() => sparkle.remove(), duration);
  }
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

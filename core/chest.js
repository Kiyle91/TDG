// ============================================================
// 🎁 chest.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles daily reward chest logic
// ✦ Rewards gold & diamonds per profile
// ✦ Each profile has its own cooldown (1 hour)
// ✦ Adds sparkle burst on claim
// ============================================================

import { gameState, addGold, addDiamonds, saveProfiles } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { updateHubCurrencies } from "./hub.js";
import { playChestOpen } from "../core/soundtrack.js";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
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
    if (chestEl.classList.contains("disabled")) return;
    claimReward();
  });

  // Update timer every second
  setInterval(updateChestState, 1000);
}

// ------------------------------------------------------------
// 💖 CLAIM REWARD (per profile)
// ------------------------------------------------------------
function claimReward() {
  if (!gameState.profile) {
    console.warn("⚠️ No active profile — cannot claim chest reward.");
    return;
  }

  const profile = gameState.profile;

  // 💎 Reward
  addGold(100);
  addDiamonds(5);
  updateHUD();
  updateHubCurrencies();

  // 💥 Visual sparkle burst
  spawnSparkles();
  playChestOpen();

  // 💾 Save claim time inside this profile
  profile.lastChestClaim = Date.now();
  saveProfiles();

  // Disable chest + reset timer text
  chestEl.classList.add("disabled");
  timerEl.textContent = "Next reward in 1:00:00";
}

// ------------------------------------------------------------
// ⏰ UPDATE CHEST STATE (per profile)
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
    timerEl.textContent = `Next reward in ${h}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}

// ------------------------------------------------------------
// 🌈 Sparkle Burst Effect — Enhanced Magical Explosion
// ------------------------------------------------------------
function spawnSparkles() {
  const sparkleCount = 80; // 🌸 was 25 → now MUCH bigger
  const maxRadius = 400;   // how far sparkles travel
  const duration = 1500;   // how long each lasts (ms)

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);

    // Random direction + distance
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Random size & color
    const size = Math.random() * 16 + 10; // 10–26px
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.borderRadius = "50%";
    sparkle.style.left = `${window.innerWidth / 2}px`;
    sparkle.style.top = `${window.innerHeight / 2}px`;
    sparkle.style.background = `hsl(${Math.random() * 360}, 100%, ${70 + Math.random() * 20}%)`;
    sparkle.style.boxShadow = `0 0 20px ${sparkle.style.background}`;

    // Animate outward (CSS handles movement via custom props)
    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);

    // Longer animation
    sparkle.style.animation = `sparkleFly ${duration}ms ease-out forwards`;

    // Remove after it fades out
    setTimeout(() => sparkle.remove(), duration);
  }
}

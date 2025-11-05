// ============================================================
// 🎁 chest.js — Olivia’s World: Crystal Keep
// ------------------------------------------------------------
// ✦ Handles daily reward chest logic
// ✦ Click gives gold & diamonds, cooldown 1 hour
// ✦ Adds sparkle burst on claim
// ============================================================

import { addGold, addDiamonds } from "../utils/gameState.js";
import { updateHUD } from "./ui.js";
import { updateHubCurrencies } from "./hub.js";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
let lastClaimTime = null;
let chestEl, timerEl, imgEl;

export function initChest() {
  chestEl = document.getElementById("daily-chest");
  timerEl = document.getElementById("chest-timer");
  imgEl = document.getElementById("chest-img");

  if (!chestEl || !imgEl) return;

  const saved = localStorage.getItem("ow_lastChestClaim");
  if (saved) lastClaimTime = parseInt(saved, 10);

  updateChestState();

  imgEl.addEventListener("click", () => {
    if (chestEl.classList.contains("disabled")) return;
    claimReward();
  });

  // Update timer every second
  setInterval(updateChestState, 1000);
}

function claimReward() {
  // 💎 Reward
  addGold(100);
  addDiamonds(5);
  updateHUD();
  updateHubCurrencies()

  // 💥 Visual sparkle burst
  spawnSparkles();

  // Save claim time
  lastClaimTime = Date.now();
  localStorage.setItem("ow_lastChestClaim", lastClaimTime);

  // Disable chest
  chestEl.classList.add("disabled");
  timerEl.textContent = "Next reward in 1:00:00";
}

function updateChestState() {
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
    timerEl.textContent = `Next reward in ${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }
}

// ------------------------------------------------------------
// 🌈 Sparkle Burst Effect
// ------------------------------------------------------------
function spawnSparkles() {
  for (let i = 0; i < 25; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 120 + 40;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    sparkle.style.setProperty("--x", `${x}px`);
    sparkle.style.setProperty("--y", `${y}px`);

    sparkle.style.left = `${window.innerWidth / 2}px`;
    sparkle.style.top = `${window.innerHeight / 2}px`;

    sparkle.style.background = `hsl(${Math.random() * 360}, 100%, 80%)`;

    setTimeout(() => sparkle.remove(), 1000);
  }
}

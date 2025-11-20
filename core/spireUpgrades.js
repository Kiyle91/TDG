// ============================================================
// 💎 spireUpgrades.js — Turret diamond upgrade system
// ------------------------------------------------------------
// ✦ 1% damage per 20 diamonds spent, per spire
// ✦ Linked to Hub ➜ Spires overlay
// ✦ Provides damage multiplier for PROJECTILE_DAMAGE
// ============================================================

import { gameState, saveProfiles } from "../utils/gameState.js";
import { updateHubCurrencies } from "./hub.js"; // already exists in your project
// If updateHubCurrencies is elsewhere, adjust the import accordingly.

// ------------------------------------------------------------
// 💫 Helpers
// ------------------------------------------------------------

// Ensure profile.spires exists (safety if load order weird)
function ensureSpireData() {
  const p = gameState.profile;
  if (!p.spires) {
    p.spires = {
      1: { diamondsSpent: 0 },
      2: { diamondsSpent: 0 },
      3: { diamondsSpent: 0 },
      4: { diamondsSpent: 0 },
      5: { diamondsSpent: 0 },
      6: { diamondsSpent: 0 }
    };
  } else {
    for (let i = 1; i <= 6; i++) {
      if (!p.spires[i]) p.spires[i] = { diamondsSpent: 0 };
    }
  }
}

// 1% per 20 diamonds spent ➜ multiplier
export function getSpireDamageMultiplier(spireId) {
  ensureSpireData();
  const spent = gameState.profile.spires[spireId]?.diamondsSpent || 0;
  const bonusPercent = Math.floor(spent / 20); // integer %
  return 1 + bonusPercent / 100; // e.g. 5% ➜ 1.05
}

// ------------------------------------------------------------
// 💎 UI Wiring — Hub Spires Overlay
// ------------------------------------------------------------

function refreshSpireUpgradeUI() {
  ensureSpireData();

  const cards = document.querySelectorAll("#overlay-spires .spire-card");

  // Pull the active player level from runtime first, falling back to any
  // persisted profile data so locked cards flip to unlocked as soon as the
  // player reaches the required level.
  const playerLevel =
    gameState.player?.level ??
    gameState.profile?.player?.level ??
    gameState.profile?.level ??
    gameState.level ??
    1;

  cards.forEach(card => {
    const id = Number(card.dataset.spire);
    const requiredLevel = Number(card.dataset.unlock) || 1;

    const btn = card.querySelector("[data-upgrade-btn]");
    const levelEl = card.querySelector("[data-spire-level]");
    const unlockText = card.querySelector(".unlock-info");

    if (!btn || !levelEl) return;

    const spent = gameState.profile.spires[id]?.diamondsSpent || 0;
    const bonus = Math.floor(spent / 20);

    levelEl.textContent = `Damage Bonus: ${bonus}%`;

    // Disable if spire not unlocked yet or not enough diamonds
    const unlocked = playerLevel >= requiredLevel;
    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("locked", !unlocked);

    if (unlockText) {
      unlockText.textContent = unlocked
        ? "Unlocked"
        : `🔒 Unlocks at Level ${requiredLevel}`;
    }

    const diamonds =
      gameState.profile?.currencies?.diamonds ??
      gameState.currencies?.diamonds ??
      gameState.profile?.diamonds ??
      gameState.diamonds ??
      0;
    const canAfford = diamonds >= 20;

    btn.classList.toggle("disabled", !unlocked || !canAfford);
  });
}

function attemptUpgradeSpire(card, spireId) {
  ensureSpireData();

  const btn = card.querySelector("[data-upgrade-btn]");
  if (!btn || btn.classList.contains("disabled")) return;

  const currencies =
    gameState.profile?.currencies ??
    gameState.currencies ??
    gameState;
  const diamonds = currencies.diamonds ?? 0;

  if (diamonds < 20) {
    // If you have a fancy alert, swap this for showAlert("Not enough diamonds!");
    console.log("Not enough diamonds for upgrade.");
    refreshSpireUpgradeUI();
    return;
  }

  // Spend 20 diamonds
  currencies.diamonds = diamonds - 20;

  // Track invested diamonds
  gameState.profile.spires[spireId].diamondsSpent += 20;

  // Little glow pulse
  card.classList.add("pulse-upgrade");
  setTimeout(() => card.classList.remove("pulse-upgrade"), 500);

  saveProfiles();
  updateHubCurrencies();
  refreshSpireUpgradeUI();
}

// Public init called from initHub()
export function initSpireUpgrades() {
  ensureSpireData();

  const cards = document.querySelectorAll("#overlay-spires .spire-card");
  cards.forEach(card => {
    const id = Number(card.dataset.spire);
    const btn = card.querySelector("[data-upgrade-btn]");
    if (!btn) return;

    btn.addEventListener("click", () => attemptUpgradeSpire(card, id));
  });

  refreshSpireUpgradeUI();
}

// Optional: call this from wherever your hub diamonds change (e.g. chest)
export function refreshSpireUpgradeFromHub() {
  refreshSpireUpgradeUI();
}

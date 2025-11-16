// ============================================================
// 🌸 ui.js — Olivia’s World: Crystal Keep (Cleaned + Fixed Build)
// ------------------------------------------------------------
// ✦ Basic HUD display and stat management
// ✦ Controls wave, gold, diamond, and life counters
// ✦ Updates in-game UI + overlays dynamically
// ✦ Includes unified Stats overlay logic (Hub + In-Game)
// ============================================================

import { gameState, getCurrencies, saveProfiles } from "../utils/gameState.js";
import { playCancelSound } from "./soundtrack.js";
import { initTurretBar, updateTurretBar } from "./turretBar.js";
import { SKINS, ensureSkin } from "./skins.js";

// ============================================================
// ⏸️ GAME PAUSE / RESUME HELPERS
// ============================================================

export function pauseGame() {
  if (!gameState.paused) {
    gameState.paused = true;
    console.log("⏸️ Game paused (overlay open).");
  }
}

export function resumeGame() {
  if (gameState.paused) {
    gameState.paused = false;
    console.log("▶️ Game resumed (overlay closed).");
  }
}

// ------------------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------------------
let waveDisplay, goldDisplay, diamondDisplay, livesDisplay;

let gameStats = {
  wave: 1,
  lives: 10,
};

// ------------------------------------------------------------
// 🌷 INITIALIZATION
// ------------------------------------------------------------
export function initUI() {
  waveDisplay = document.getElementById("wave-display");
  goldDisplay = document.getElementById("gold-display");
  diamondDisplay = document.getElementById("diamond-display");
  livesDisplay = document.getElementById("lives-display");

  updateHUD();
  initTurretBar();
}

// ------------------------------------------------------------
// 💖 UPDATE HUD (safe numeric fallback)
// ------------------------------------------------------------
export function updateHUD() {
  if (!waveDisplay || !goldDisplay || !diamondDisplay || !livesDisplay) return;

  const { gold, diamonds } = getCurrencies();
  const p = gameState.player || {};

  // Existing stats
  const wave  = gameState.wave ?? 1;
  const total = gameState.totalWaves ?? 1;
  waveDisplay.textContent = `Wave ${wave} / ${total}`;
  goldDisplay.textContent = `Gold: ${gold}`;
  diamondDisplay.textContent = `Diamonds: ${diamonds}`;

  const playerLives = p.lives ?? gameStats.lives;
  livesDisplay.textContent = `Lives: ${playerLives}`;

  // 💖 HP + MANA BARS (via CSS variable --fill)
  const hpBar   = document.getElementById("hp-bar");
  const manaBar = document.getElementById("mana-bar");
  const hpText   = document.getElementById("hp-text");
  const manaText = document.getElementById("mana-text");

  if (hpBar && manaBar) {
    // numeric safety
    const hp       = Number(p.hp)       || 0;
    const maxHp    = Number(p.maxHp)    || 100;
    const mana     = Number(p.mana)     || 0;
    const maxMana  = Number(p.maxMana)  || 50;

    const hpPct   = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    const manaPct = Math.max(0, Math.min(100, (mana / maxMana) * 100));

    // Apply CSS variable fills
    hpBar.style.setProperty("--fill", `${hpPct}%`);
    manaBar.style.setProperty("--fill", `${manaPct}%`);

    // Update text values safely
    if (hpText)   hpText.textContent   = `${Math.round(hp)} / ${Math.round(maxHp)}`;
    if (manaText) manaText.textContent = 
      `${Math.round(Number(p.mana))} / ${Math.round(Number(p.maxMana))}`;
  }

  updateTurretBar();
}

// ------------------------------------------------------------
// 📜 GET GAME STATS
// ------------------------------------------------------------
export function getStats() {
  return gameStats;
}

// ============================================================
// 🌸 OVERLAY HELPERS
// ============================================================
export function showOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) {
    console.warn(`⚠️ Overlay "${id}" not found.`);
    return;
  }

  // Hide others
  document.querySelectorAll(".overlay").forEach((o) => {
    o.classList.remove("active");
    o.style.display = "none";
  });

  // Pause gameplay
  pauseGame();

  // Show this one
  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("active"));

  // Add close behavior
  const closeBtn = overlay.querySelector(".overlay-close");
  if (closeBtn) {
    closeBtn.onclick = () => closeOverlay(overlay);
  }
}

export function closeOverlay(overlay) {
  overlay.classList.remove("active");
  playCancelSound();
  setTimeout(() => {
    overlay.style.display = "none";
    resumeGame();
  }, 600);
}

// ------------------------------------------------------------
// ⚙️ SETTINGS MENU INITIALIZATION
// ------------------------------------------------------------
export function initSettingsMenu() {
  const visualsToggle = document.getElementById("visuals-toggle");
  const visualsLabel = visualsToggle?.nextElementSibling;

  if (!visualsToggle) return;

  visualsToggle.checked = gameState.settings.visualEffects;
  if (visualsLabel)
    visualsLabel.textContent = visualsToggle.checked ? "Enabled" : "Disabled";

  toggleMagicSparkles(gameState.settings.visualEffects);

  visualsToggle.addEventListener("change", () => {
    const enabled = visualsToggle.checked;
    gameState.settings.visualEffects = enabled;
    if (visualsLabel)
      visualsLabel.textContent = enabled ? "Enabled" : "Disabled";
    saveProfiles();
    toggleMagicSparkles(enabled);
  });
}

// ------------------------------------------------------------
// ✨ MAGIC SPARKLES VISIBILITY
// ------------------------------------------------------------
export function toggleMagicSparkles(enabled) {
  const sparkles = document.querySelectorAll(".magic-sparkle");
  if (!sparkles.length) return;

  sparkles.forEach((el) => {
    el.style.opacity = enabled ? "1" : "0";
    el.style.pointerEvents = enabled ? "auto" : "none";
  });
}

// ============================================================
// 🧪 TEMP TEST — Keyboard Controls for HUD Verification
// ============================================================
document.addEventListener("keydown", (e) => {
  const p = gameState.player;
  if (!p) return;

  switch (e.key.toLowerCase()) {
    case "h":
      p.hp = Math.max(0, p.hp - 10);
      updateHUD();
      break;
    case "j":
      p.hp = Math.min(p.maxHp, p.hp + 10);
      updateHUD();
      break;
    case "m":
      p.mana = Math.max(0, p.mana - 10);
      updateHUD();
      break;
    case "n":
      p.mana = Math.min(p.maxMana, p.mana + 10);
      updateHUD();
      break;
  }
});

// ============================================================
// 👑 PLAYER / HUB STATS — Live Overlay Updaters
// ============================================================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fillStats(prefix, titleId) {
  const p = gameState.player || {};
  setText(titleId, p.name ? `Princess ${p.name}` : "Princess (Unknown)");

  const level = p.level ?? 1;
  const xp = p.xp ?? 0;
  const xpToNext = p.xpToNext ?? 100;
  const statPts = p.statPoints ?? 0;
  const hp = p.hp ?? p.maxHp ?? 100;
  const maxHp = p.maxHp ?? 100;

  // ⭐ MANA — now fully rounded + safe
  const mana = p.mana ?? p.maxMana ?? 50;
  const maxMana = p.maxMana ?? 50;

  const sp = p.spellPower ?? 10;
  const ranged = p.rangedAttack ?? 10;
  const atk = p.attack ?? 15;
  const def = p.defense ?? 5;
  const critPct = Math.round((p.critChance ?? 0) * 100);

  setText(`${prefix}level`, String(level));
  setText(`${prefix}xp`, `${xp} / ${xpToNext}`);
  setText(`${prefix}statPoints`, String(statPts));
  setText(`${prefix}hp`, `${hp} / ${maxHp}`);

  // ⭐ FIXED MANA LINE (previously unrounded)
  setText(
    `${prefix}mana`,
    `${Math.round(Number(mana))} / ${Math.round(Number(maxMana))}`
  );

  setText(`${prefix}spellPower`, String(sp));
  setText(`${prefix}ranged`, String(ranged));
  setText(`${prefix}attack`, String(atk));
  setText(`${prefix}defense`, String(def));
  setText(`${prefix}crit`, `${critPct}%`);
}

function startLiveRefresh(overlayId, refreshFn) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  if (overlay.__statsInterval) clearInterval(overlay.__statsInterval);

  overlay.__statsInterval = setInterval(() => {
    if (
      !document.body.contains(overlay) ||
      overlay.classList.contains("hidden") ||
      overlay.style.display === "none"
    ) {
      clearInterval(overlay.__statsInterval);
      overlay.__statsInterval = null;
      return;
    }
    refreshFn();
  }, 300);
}

export function updateStatsOverlay() {
  const p = gameState.player || {};
  ensureSkin(p);

  // ---------------------------
  // 🌈 DYNAMIC HUB PORTRAIT
  // ---------------------------
  const skinKey = p.skin;
  const skinData = SKINS[skinKey];

  const portraitEl = document.getElementById("hub-stats-portrait");
  if (portraitEl && skinData) {
    portraitEl.src = `./assets/images/portraits/${skinData.portrait}`;
    portraitEl.alt = skinData.name;
  }

  // ---------------------------
  // 🧮 APPLY TEXT VALUES
  // ---------------------------
  const xpToNext = p.xpToNext ?? 100;

  const map = {
    "stat-level": p.level ?? 1,
    "stat-xp": `${p.xp ?? 0} / ${xpToNext}`,
    "stat-hp": `${p.hp ?? p.maxHp ?? 100} / ${p.maxHp ?? 100}`,
    "stat-mana": `${p.mana ?? p.maxMana ?? 50} / ${p.maxMana ?? 50}`,
    "stat-spellPower": p.spellPower ?? 10,
    "stat-ranged": p.rangedAttack ?? 10,
    "stat-attack": p.attack ?? 15,
    "stat-defense": p.defense ?? 5,
    "stat-crit": `${Math.round((p.critChance ?? 0) * 100)}%`,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  const titleEl = document.getElementById("stats-title");
  if (titleEl) titleEl.textContent = p.name ? `Princess ${p.name}` : "Princess";
}

// IN-GAME overlay updater
export function updatePlayerStatsOverlay() {
  const p = gameState.player || {};
  ensureSkin(p);

  // 🌈 DYNAMIC IN-GAME PORTRAIT
  const skinKey = p.skin;
  const skinData = SKINS[skinKey];

  const portraitEl = document.getElementById("player-stats-portrait");
  if (portraitEl && skinData) {
    portraitEl.src = `./assets/images/portraits/${skinData.portrait}`;
    portraitEl.alt = skinData.name;
  }

  // Reuse general stats filler
  fillStats("pstat-", "player-stats-title");

  startLiveRefresh("overlay-player-stats", () =>
    fillStats("pstat-", "player-stats-title")
  );
}

// ============================================================
// 💖 BRAVERY BAR SYSTEM — NO PROMPT VERSION
// ============================================================

export function updateBraveryBar() {
  const bar = document.getElementById("bravery-bar");
  const fill = document.getElementById("bravery-fill");

  if (!bar || !fill) return;

  const b = gameState.bravery;
  const pct = Math.max(0, Math.min(1, b.current / b.max));

  // Update fill height
  fill.style.height = `${pct * 100}%`;

  // Reset flash state
  fill.classList.remove("full");

  // When charged (full & not draining) → flash
  if (b.charged && !b.draining) {
    fill.classList.add("full");
  }
}

// ------------------------------------------------------------
// ➕ Add bravery (kills, waves, whatever)
// ------------------------------------------------------------
export function addBravery(amount) {
  const b = gameState.bravery;

  if (b.charged || b.draining) return; // can't increase while full/draining

  b.current = Math.min(b.max, b.current + amount);

  if (b.current >= b.max) {
    b.current = b.max;
    b.charged = true;
    b.draining = false;
  }

  updateBraveryBar();
}

// ------------------------------------------------------------
// 🎯 Player activates bravery manually
// ------------------------------------------------------------
export function activateBravery() {
  const b = gameState.bravery;
  if (!b.charged) return;

  // Switch to draining
  b.charged = false;
  b.draining = true;

  updateBraveryBar();
  triggerBraveryPower();

  // Start 8 second drain
  drainBraveryBar(8000);
}

// ------------------------------------------------------------
// 🕒 Smooth drain over `duration` ms
// ------------------------------------------------------------
function drainBraveryBar(duration) {
  const b = gameState.bravery;
  const start = b.current;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const pct = Math.min(1, elapsed / duration);

    b.current = start * (1 - pct);
    updateBraveryBar();

    if (pct < 1 && b.draining) {
      requestAnimationFrame(tick);
    } else {
      b.current = 0;
      b.draining = false;
      updateBraveryBar();
    }
  }

  requestAnimationFrame(tick);
}

// ------------------------------------------------------------
// 🔥 Bravery Buff Logic
// ------------------------------------------------------------
export function triggerBraveryPower() {
  console.log("🔥 Bravery Power ACTIVATED!");

  const p = gameState.player;
  if (!p) return;

  const original = {
    speed: p.speed,
    attack: p.attack,
    defense: p.defense
  };

  // Apply buff
  p.speed *= 1.8;
  p.attack *= 1.6;
  p.defense *= 1.4;
  p.invincible = true;

  braveryFlashEffect();

  // Buff ends exactly when draining stops
  const watchEnd = () => {
    if (!gameState.bravery.draining) {
      p.speed = original.speed;
      p.attack = original.attack;
      p.defense = original.defense;
      p.invincible = false;
      console.log("✨ Bravery Power faded.");
    } else {
      requestAnimationFrame(watchEnd);
    }
  };

  requestAnimationFrame(watchEnd);
}

// ------------------------------------------------------------
// ✨ Activation Flash
// ------------------------------------------------------------
function braveryFlashEffect() {
  const fx = document.createElement("div");
  Object.assign(fx.style, {
    position: "fixed",
    inset: 0,
    background: "rgba(255, 140, 255, 0.35)",
    pointerEvents: "none",
    zIndex: "9999999",
    opacity: "0"
  });

  document.body.appendChild(fx);

  fx.animate(
    [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
    { duration: 600, easing: "ease-out" }
  ).finished.then(() => fx.remove());
}


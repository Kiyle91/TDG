// ============================================================
// ­ƒî© ui.js ÔÇö OliviaÔÇÖs World: Crystal Keep
// ------------------------------------------------------------
// Ô£ª Core HUD manager for in-game and Hub UI
// Ô£ª Updates wave, gold, diamonds, lives, HP/Mana, arrows
// Ô£ª Manages stats overlays, settings menu, sparkles, bravery bar
// Ô£ª Provides pause/resume helpers for all overlays
// ============================================================
/* ------------------------------------------------------------
 * MODULE: ui.js
 * PURPOSE:
 *   Controls all user interface elements for gameplay and hub.
 *
 * SUMMARY:
 *   Handles HUD refreshes, overlay transitions, settings menu,
 *   portraits, stats overlays, HP/mana bars, wave display,
 *   crystal echoes, arrow counter, and the full bravery bar
 *   system. This is the main UI integration layer between
 *   gameplay state and on-screen visuals.
 *
 * FEATURES:
 *   ÔÇó initUI(), updateHUD() ÔÇö main HUD loop
 *   ÔÇó showOverlay(), closeOverlay() ÔÇö overlay navigation
 *   ÔÇó initSettingsMenu() ÔÇö visuals toggle + persistence
 *   ÔÇó updateStatsOverlay(), updatePlayerStatsOverlay()
 *   ÔÇó Full Bravery Bar system (charge, activate, drain)
 *   ÔÇó toggleMagicSparkles() ÔÇö global effect toggle
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// Ôå¬´©Å Imports
// ------------------------------------------------------------

import { gameState, getCurrencies, saveProfiles } from "../utils/gameState.js";
import { playCancelSound } from "./soundtrack.js";
import { initSpireBar, updateSpireBar } from "./spireBar.js";
import { SKINS, ensureSkin } from "./skins.js";


// ============================================================
// ÔÅ©´©Å GAME PAUSE / RESUME
// ============================================================

export function pauseGame() {
  gameState.paused = true;
}

export function resumeGame() {
  gameState.paused = false;
}


// ------------------------------------------------------------
// ÔÜÖ´©Å LOCAL STATE
// ------------------------------------------------------------

let waveDisplay, goldDisplay, diamondDisplay, livesDisplay;

let gameStats = {
  wave: 1,
  lives: 10,
};

let lastCrystalFound = -1;
let lastCrystalTotal = -1;
let lastArrowCount = -1;


// ============================================================
// ­ƒîÀ INITIALIZATION
// ============================================================

export function initUI() {
  waveDisplay = document.getElementById("wave-display");
  goldDisplay = document.getElementById("gold-display");
  diamondDisplay = document.getElementById("diamond-display");
  livesDisplay = document.getElementById("lives-display");

  updateHUD();
  initSpireBar();
}


// ============================================================
// ­ƒÆû UPDATE HUD
// ============================================================

export function updateHUD() {
  if (!waveDisplay || !goldDisplay || !diamondDisplay || !livesDisplay) return;

  const { gold, diamonds } = getCurrencies();
  const p = gameState.player || {};

  // ------------------------------------------------------------
  // ­ƒîƒ WAVE DISPLAY
  // ------------------------------------------------------------

  const wave  = gameState.wave ?? 1;
  const total = gameState.totalWaves ?? 1;

  if (window.firstWaveStarted === false || window.betweenWaveTimerActive === true) {
    waveDisplay.textContent = "Incoming";
    waveDisplay.style.color = "#3cff7a";
  } else {
    waveDisplay.textContent = `Wave ${wave} / ${total}`;
    waveDisplay.style.color = "";
  }

  goldDisplay.textContent = `Gold: ${gold}`;
  diamondDisplay.textContent = `Diamonds: ${diamonds}`;

  const playerLives = p.lives ?? gameStats.lives;
  livesDisplay.textContent = `Lives: ${playerLives}`;

  // ------------------------------------------------------------
  // ÔØñ´©Å HP & ­ƒö« MANA BARS
  // ------------------------------------------------------------

  const hpBar = document.getElementById("hp-bar");
  const manaBar = document.getElementById("mana-bar");
  const hpText = document.getElementById("hp-text");
  const manaText = document.getElementById("mana-text");

  if (hpBar && manaBar) {
    const hp = Number(p.hp) || 0;
    const maxHp = Number(p.maxHp) || 100;
    const mana = Number(p.mana) || 0;
    const maxMana = Number(p.maxMana) || 50;

    hpBar.style.setProperty("--fill", `${Math.min(100, (hp / maxHp) * 100)}%`);
    manaBar.style.setProperty("--fill", `${Math.min(100, (mana / maxMana) * 100)}%`);

    if (hpText) hpText.textContent = `${Math.round(hp)} / ${Math.round(maxHp)}`;
    if (manaText) manaText.textContent = `${Math.round(mana)} / ${Math.round(maxMana)}`;
  }

  // ------------------------------------------------------------
  // ­ƒÅ╣ ARROW COUNTER (Mana-based)
  // ------------------------------------------------------------

  const arrowCircle = document.getElementById("hud-arrows-circle");
  // Support both legacy id (hud-arrows) and current markup (hud-arrows-value)
  const arrowsEl =
    document.getElementById("hud-arrows") ||
    document.getElementById("hud-arrows-value");

  if (arrowsEl) {
    const arrows = Math.floor((p.mana || 0) / 2);
    arrowsEl.textContent = arrows;

    if (arrows !== lastArrowCount) {
      if (arrowCircle) {
        arrowCircle.classList.remove("hud-circle-flash");
        void arrowCircle.offsetWidth;
        arrowCircle.classList.add("hud-circle-flash");
      }
      lastArrowCount = arrows;
    }
  }

  // ------------------------------------------------------------
  // Ô£º CRYSTAL ECHOES
  // ------------------------------------------------------------

  if (gameState.exploration) {
    const foundEl = document.getElementById("hud-crystals-found");
    const totalEl = document.getElementById("hud-crystals-total");
    const circle = document.getElementById("hud-crystals-circle");

    if (foundEl) foundEl.textContent = gameState.exploration.found ?? 0;
    if (totalEl) totalEl.textContent = gameState.exploration.total ?? 0;

    if (circle) {
      const found = gameState.exploration.found ?? 0;
      const total = gameState.exploration.total ?? 0;

      if (found !== lastCrystalFound || total !== lastCrystalTotal) {
        circle.classList.remove("hud-circle-flash");
        void circle.offsetWidth;
        circle.classList.add("hud-circle-flash");

        lastCrystalFound = found;
        lastCrystalTotal = total;
      }
    }
  }

  updateSpireBar();
}


// ============================================================
// ­ƒô£ GAME STATS ACCESSOR
// ============================================================

export function getStats() {
  return gameStats;
}


// ============================================================
// ­ƒî© OVERLAY HELPERS
// ============================================================

export function showOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;

  document.querySelectorAll(".overlay").forEach((o) => {
    o.classList.remove("active");
    o.style.display = "none";
  });

  pauseGame();

  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("active"));

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


// ============================================================
// ÔÜÖ´©Å SETTINGS MENU
// ============================================================

export function initSettingsMenu() {
  const visualsToggle = document.getElementById("visuals-toggle");
  const visualsLabel = visualsToggle?.nextElementSibling;
  if (!visualsToggle) return;

  visualsToggle.checked = gameState.settings.visualEffects;
  if (visualsLabel)
    visualsLabel.textContent = visualsToggle.checked ? "Enabled" : "Disabled";

  toggleMagicSparkles(visualsToggle.checked);

  visualsToggle.addEventListener("change", () => {
    const enabled = visualsToggle.checked;
    gameState.settings.visualEffects = enabled;

    if (visualsLabel)
      visualsLabel.textContent = enabled ? "Enabled" : "Disabled";

    saveProfiles();
    toggleMagicSparkles(enabled);
  });
}


// ============================================================
// Ô£¿ MAGIC SPARKLES VISIBILITY
// ============================================================

export function toggleMagicSparkles(enabled) {
  document.querySelectorAll(".magic-sparkle").forEach((el) => {
    el.style.opacity = enabled ? "1" : "0";
    el.style.pointerEvents = enabled ? "auto" : "none";
  });
}


// ============================================================
// ­ƒææ HUB & IN-GAME STATS OVERLAYS
// ============================================================

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fillStats(prefix, titleId) {
  const p = gameState.player || {};

  setText(titleId, p.name ? `Princess ${p.name}` : "Princess");

  const level = p.level ?? 1;
  const xp = p.xp ?? 0;
  const xpToNext = p.xpToNext ?? 100;

  const hp = p.hp ?? p.maxHp ?? 100;
  const maxHp = p.maxHp ?? 100;

  const mana = p.mana ?? p.maxMana ?? 50;
  const maxMana = p.maxMana ?? 50;

  const sp = p.spellPower ?? 10;
  const ranged = p.rangedAttack ?? 10;
  const atk = p.attack ?? 15;
  const def = p.defense ?? 5;
  const critPct = Math.round((p.critChance ?? 0) * 100);

  setText(`${prefix}level`, String(level));
  setText(`${prefix}xp`, `${xp} / ${xpToNext}`);
  setText(`${prefix}statPoints`, String(p.statPoints ?? 0));
  setText(`${prefix}hp`, `${hp} / ${maxHp}`);
  setText(`${prefix}mana`, `${Math.round(mana)} / ${Math.round(maxMana)}`);
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
      overlay.style.display === "none" ||
      overlay.classList.contains("hidden")
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

  const skinData = SKINS[p.skin];
  const portraitEl = document.getElementById("hub-stats-portrait");

  if (portraitEl && skinData) {
    portraitEl.src = `./assets/images/portraits/${skinData.portrait}`;
    portraitEl.alt = skinData.name;
  }

  const map = {
    "stat-level": p.level ?? 1,
    "stat-xp": `${p.xp ?? 0} / ${p.xpToNext ?? 100}`,
    "stat-hp": `${p.hp ?? p.maxHp ?? 100} / ${p.maxHp ?? 100}`,
    "stat-mana": `${Math.round(p.mana ?? p.maxMana ?? 50)} / ${Math.round(p.maxMana ?? 50)}`,
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

export function updatePlayerStatsOverlay() {
  const p = gameState.player || {};
  ensureSkin(p);

  const skinData = SKINS[p.skin];
  const portraitEl = document.getElementById("player-stats-portrait");

  if (portraitEl && skinData) {
    portraitEl.src = `./assets/images/portraits/${skinData.portrait}`;
    portraitEl.alt = skinData.name;
  }

  fillStats("pstat-", "player-stats-title");

  startLiveRefresh("overlay-player-stats", () =>
    fillStats("pstat-", "player-stats-title")
  );
}


// ============================================================
// ­ƒÆû BRAVERY BAR SYSTEM
// ============================================================

export function updateBraveryBar() {
  const bar = document.getElementById("bravery-bar");
  const fill = document.getElementById("bravery-fill");
  if (!bar || !fill) return;

  const b = gameState.bravery;
  const pct = Math.min(1, b.current / b.max);

  fill.style.height = `${pct * 100}%`;
  fill.classList.remove("full");

  if (b.charged && !b.draining) {
    fill.classList.add("full");
  }
}

export function addBravery(amount) {
  const b = gameState.bravery;
  if (b.charged || b.draining) return;

  b.current = Math.min(b.max, b.current + amount);

  if (b.current >= b.max) {
    b.current = b.max;
    b.charged = true;
    b.draining = false;
  }

  updateBraveryBar();
}

export function activateBravery() {
  const b = gameState.bravery;
  if (!b.charged) return;

  b.charged = false;
  b.draining = true;

  updateBraveryBar();
  triggerBraveryPower();
  drainBraveryBar(8000);
}

function drainBraveryBar(duration) {
  const b = gameState.bravery;
  const start = b.current;
  const startTime = performance.now();

  function tick(now) {
    const pct = Math.min(1, (now - startTime) / duration);
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

export function triggerBraveryPower() {
  const p = gameState.player;
  if (!p) return;

  const original = {
    speed: p.speed,
    attack: p.attack,
    defense: p.defense,
  };

  p.speed *= 1.8;
  p.attack *= 1.6;
  p.defense *= 1.4;
  p.invincible = true;

  braveryFlashEffect();

  const watchEnd = () => {
    if (!gameState.bravery.draining) {
      p.speed = original.speed;
      p.attack = original.attack;
      p.defense = original.defense;
      p.invincible = false;
    } else {
      requestAnimationFrame(watchEnd);
    }
  };

  requestAnimationFrame(watchEnd);
}

function braveryFlashEffect() {
  const fx = document.createElement("div");
  Object.assign(fx.style, {
    position: "fixed",
    inset: 0,
    background: "rgba(255, 140, 255, 0.35)",
    pointerEvents: "none",
    zIndex: "9999999",
    opacity: "0",
  });

  document.body.appendChild(fx);

  fx.animate(
    [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
    { duration: 600, easing: "ease-out" }
  ).finished.then(() => fx.remove());
}

export function getArrowCount() {
  const p = gameState.player;
  return p ? Math.floor((p.mana || 0) / 2) : 0;
}


// ============================================================
// ­ƒîƒ END OF FILE ÔÇö ui.js
// ============================================================

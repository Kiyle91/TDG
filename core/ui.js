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
  waveDisplay.textContent = `Wave ${gameStats.wave}`;
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
    // ✅ numeric safety: avoid undefined / NaN
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
    if (manaText) manaText.textContent = `${mana.toFixed(1)} / ${Math.round(maxMana)}`;
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
    resumeGame(); // ✅ resume gameplay once overlay fully closed
  }, 600);
}



// ------------------------------------------------------------
// ⚙️ SETTINGS MENU INITIALIZATION
// ------------------------------------------------------------
export function initSettingsMenu() {
  const visualsToggle = document.getElementById("visuals-toggle");
  const visualsLabel = visualsToggle?.nextElementSibling;

  if (!visualsToggle) return;

  // 🩷 Apply saved preference
  visualsToggle.checked = gameState.settings.visualEffects;
  if (visualsLabel)
    visualsLabel.textContent = visualsToggle.checked ? "Enabled" : "Disabled";

  // 🪄 Apply state immediately
  toggleMagicSparkles(gameState.settings.visualEffects);

  // 🎧 When player changes the toggle
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
// ------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  const p = gameState.player;
  if (!p) return;

  switch (e.key.toLowerCase()) {
    case "h":
      p.hp = Math.max(0, p.hp - 10);
      console.log(`💔 HP -10 → ${p.hp}/${p.maxHp}`);
      updateHUD();
      break;
    case "j":
      p.hp = Math.min(p.maxHp, p.hp + 10);
      console.log(`💖 HP +10 → ${p.hp}/${p.maxHp}`);
      updateHUD();
      break;
    case "m":
      p.mana = Math.max(0, p.mana - 10);
      console.log(`🔷 Mana -10 → ${p.mana}/${p.maxMana}`);
      updateHUD();
      break;
    case "n":
      p.mana = Math.min(p.maxMana, p.mana + 10);
      console.log(`🔹 Mana +10 → ${p.mana}/${p.maxMana}`);
      updateHUD();
      break;
  }
});

// ============================================================
// 👑 PLAYER / HUB STATS — Live Overlay Updaters
// ------------------------------------------------------------
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function fillStats(prefix, titleId) {
  const p = gameState.player || {};
  setText(titleId, p.name ? `Princess ${p.name}` : "Princess (Unknown)");

  // Core numbers (with sane fallbacks)
  const level = p.level ?? 1;
  const xp = p.xp ?? 0;
  const xpToNext = p.xpToNext ?? 100;
  const statPts = p.statPoints ?? 0;
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
  setText(`${prefix}statPoints`, String(statPts));
  setText(`${prefix}hp`, `${hp} / ${maxHp}`);
  setText(`${prefix}mana`, `${mana} / ${maxMana}`);
  setText(`${prefix}spellPower`, String(sp));
  setText(`${prefix}ranged`, String(ranged));
  setText(`${prefix}attack`, String(atk));
  setText(`${prefix}defense`, String(def));
  setText(`${prefix}crit`, `${critPct}%`);
}

// Live refresh while overlay is open
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

// HUB overlay updater — excludes Stat Points
export function updateStatsOverlay() {
  const p = gameState.player || {};
  const titleEl = document.getElementById("stats-title");
  if (titleEl) titleEl.textContent = p.name ? `Princess ${p.name}` : "Princess (Unknown)";

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

  const map = {
    "stat-level": level,
    "stat-xp": `${xp} / ${xpToNext}`,
    "stat-hp": `${hp} / ${maxHp}`,
    "stat-mana": `${mana} / ${maxMana}`,
    "stat-spellPower": sp,
    "stat-ranged": ranged,
    "stat-attack": atk,
    "stat-defense": def,
    "stat-crit": `${critPct}%`,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}


// IN-GAME overlay updater
export function updatePlayerStatsOverlay() {
  fillStats("pstat-", "player-stats-title");
  startLiveRefresh("overlay-player-stats", () =>
    fillStats("pstat-", "player-stats-title")
  );
}

// ============================================================
// 🌟 END OF FILE
// ============================================================

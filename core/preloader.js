// ============================================================
// 🌟 preloader.js — Global Silent Asset Preloader
// ------------------------------------------------------------
// This module loads all heavy assets while the user is sitting
// on the Landing Screen. By the time they press "START", the
// full engine is warm and initGame() is instant.
// ============================================================

// ------------------------------------------------------------
// 🔮 Import lightweight preload functions from each subsystem
// ------------------------------------------------------------

// Crystal Echo images
import { preloadCrystalImages } from "./crystalEchoes.js";

// Loot images
import { loadLootImages } from "./loot.js";

// Pegasus animation frames
import { loadPegasus } from "./pegasus.js";

// Map loader (preloads map JSON + image layers)
import { loadMap } from "./map.js";

let preloadStarted = false;
let preloadFinished = false;

// ------------------------------------------------------------
// ⚙️ PRELOAD EVERYTHING
// ------------------------------------------------------------

export async function preloadAllAssets() {
  if (preloadStarted) return; // prevent double-run
  preloadStarted = true;

  console.log("%c🔮 Preloader: Starting background warm-up…", "color:#c397ff");

  try {
    await Promise.all([
      preloadCrystalImages(),
      loadLootImages(),
      loadPegasus(),
      loadMap("preload"),      // loads map JSON + caches layers
      // Future expansions:
      // preloadGoblinSprites(),
      // preloadWorgSprites(),
      // preloadTrollSprites(),
      // preloadEliteSprites(),
      // preloadOgreSprites(),
      // preloadCrossbowSprites(),
      // preloadSpireSprites(),
      // preloadProjectiles(),
      // preloadAudio(),
    ]);

    preloadFinished = true;

    console.log("%c✨ Preloader: All assets warmed and ready!", 
      "color:#b57aff;font-weight:bold;");

  } catch (err) {
    console.warn("⚠️ Preloader: Some assets failed to preload:", err);
    preloadFinished = true; // allow game to start even if partial
  }
}

// ------------------------------------------------------------
// 🟢 STATUS HELPERS
// ------------------------------------------------------------

export function isPreloadComplete() {
  return preloadFinished;
}

export function hasPreloadStarted() {
  return preloadStarted;
}

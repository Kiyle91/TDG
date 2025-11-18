// ============================================================
// 🏗️ spirePlacement.js — Multi-Spire System + Overlap Safety
// ============================================================
/* ------------------------------------------------------------
 * MODULE: spirePlacement.js
 * PURPOSE:
 *   Handles ALL logic related to placing combat spires via
 *   hotkeys (1–6). Ensures correct unlock levels, costs, and
 *   spatial rules, and integrates cleanly with the unified
 *   combat + economy systems.
 *
 * SUMMARY:
 *   • handleSpireKey() — processes user hotkey input
 *   • tryPlaceSpire() — full validation + placement pipeline
 *   • Prevents overlap with existing spires
 *   • Deducts gold via spendGold()
 *   • Triggers particle feedback + sounds + HUD refresh
 *   • Anti-spam cooldown between placements
 *
 * DESIGN NOTES:
 *   • Spire type metadata is defined in SPIRE_UNLOCKS
 *   • Player position is always the spawn position
 *   • Overlap guard uses radial distance (SPIRE_RADIUS)
 *   • Cooldown uses a lightweight 60fps interval reducer
 * ------------------------------------------------------------ */

// ------------------------------------------------------------
// ↪️ Imports
// ------------------------------------------------------------

import { gameState, spendGold } from "../utils/gameState.js";
import { addSpire, getSpires } from "./spires.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";


// ------------------------------------------------------------
// ⏱️ PLACEMENT COOLDOWN (anti-spam)
// ------------------------------------------------------------

let spirePlaceCooldown = 0;
const SPIRE_PLACE_DELAY = 300; // ms


// ------------------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------------------

const TILE_SIZE = 64;
const SPIRE_COST = 50;
const SPIRE_RADIUS = 75; // minimum spacing between spires

const SPIRE_UNLOCKS = {
  1: { name: "Crystal Defender",  key: "basic_spire",  unlock: 2,  projectile: "crystal" },
  2: { name: "Frost Sentinel",    key: "frost_spire",  unlock: 5,  projectile: "frost"   },
  3: { name: "Flameheart",        key: "flame_spire",  unlock: 10, projectile: "flame"   },
  4: { name: "Arcane Spire",      key: "arcane_spire", unlock: 15, projectile: "arcane"  },
  5: { name: "Beacon of Light",   key: "light_spire",  unlock: 20, projectile: "light"   },
  6: { name: "Moonlight Aegis",   key: "moon_spire",   unlock: 25, projectile: "moon"    },
};


// ------------------------------------------------------------
// 🎮 handleSpireKey()
// ------------------------------------------------------------

export function handleSpireKey(keyCode) {
  if (spirePlaceCooldown > 0) return;

  const num = parseInt(keyCode.replace("Digit", ""));
  if (num >= 1 && num <= 6) {
    tryPlaceSpire(num);
    spirePlaceCooldown = SPIRE_PLACE_DELAY;
  }
}


// ------------------------------------------------------------
// 🏗️ tryPlaceSpire()
// ------------------------------------------------------------

function tryPlaceSpire(num) {
  const player = gameState.player;
  if (!player || !gameState.profile) return;

  const data = SPIRE_UNLOCKS[num];
  if (!data) return;

  // 🔒 Level requirement
  if ((player.level || 1) < data.unlock) {
    spawnFloatingText(player.pos.x, player.pos.y - 40, `Locked — Lvl ${data.unlock}`, "#ff7aa8");
    playCancelSound();
    return;
  }

  // 💰 Gold requirement
  const gold = gameState.profile.currencies?.gold ?? 0;
  if (gold < SPIRE_COST) {
    spawnFloatingText(player.pos.x, player.pos.y - 40, "Not enough gold", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🗺️ Position (player pos)
  const x = player.pos.x;
  const y = player.pos.y;

  // 🚫 Overlap check
  const tooClose = getSpires().some(t => Math.hypot(t.x - x, t.y - y) < SPIRE_RADIUS);
  if (tooClose) {
    spawnFloatingText(x, y - 40, "❌ Too close to another spire", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🏰 Place spire
  addSpire({
    name: data.name,
    type: data.key,
    projectileType: data.projectile,
    x,
    y,
  });

  // 🪙 Deduct gold + update HUD
  if (spendGold(SPIRE_COST)) {
    updateHUD();
    playFairySprinkle();
  } else {
    playCancelSound();
  }
}


// ------------------------------------------------------------
// 🔁 COOL DOWN TICKER (approx. 60fps)
// ------------------------------------------------------------

setInterval(() => {
  if (spirePlaceCooldown > 0) {
    spirePlaceCooldown -= 16;
    if (spirePlaceCooldown < 0) spirePlaceCooldown = 0;
  }
}, 16);


// ------------------------------------------------------------
// 📤 Exports
// ------------------------------------------------------------

export { spirePlaceCooldown, SPIRE_PLACE_DELAY };


// ============================================================
// 🌟 END OF FILE
// ============================================================

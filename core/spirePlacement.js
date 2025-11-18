// ============================================================
// 🏗️ spirePlacement.js — Olivia’s World: Crystal Keep 
//    (Full Multi-Spire System + Overlap Check)
// ------------------------------------------------------------
// ✦ Handles player-triggered spire placement (keys 1–6)
// ✦ Unlocks different spire types based on player level
// ✦ Deducts gold using profile currencies via spendGold()
// ✦ Uses addSpire() to create spire instances
// ✦ Integrates sounds, floating text, and HUD updates
// ✦ 🆕 Spawns spire at player location, prevents overlap
// ✦ 🆕 Placement cooldown (anti-spam)
// ============================================================

import { gameState, spendGold } from "../utils/gameState.js";
import { addSpire, getSpires } from "./spires.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🕒 Spire Placement Cooldown (anti-spam safeguard)
// ------------------------------------------------------------
let spirePlaceCooldown = 0;   // ms remaining
const SPIRE_PLACE_DELAY = 300; // 300ms between placements

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const TILE_SIZE = 64;
const SPIRE_COST = 50;
const SPIRE_RADIUS = 75; // 🛑 No other spire can be within this distance

// ✨ Unlock levels + metadata for each spire
const SPIRE_UNLOCKS = {
  1: { name: "Crystal Defender", key: "basic_spire", unlock: 2, projectile: "crystal" },
  2: { name: "Frost Sentinel", key: "frost_spire", unlock: 5, projectile: "frost" },
  3: { name: "Flameheart", key: "flame_spire", unlock: 10, projectile: "flame" },
  4: { name: "Arcane Spire", key: "arcane_spire", unlock: 15, projectile: "arcane" },
  5: { name: "Beacon of Light", key: "light_spire", unlock: 20, projectile: "light" },
  6: { name: "Moonlight Aegis", key: "moon_spire", unlock: 25, projectile: "moon" },
};

// ------------------------------------------------------------
// 🧭 handleSpireKey()
// ------------------------------------------------------------
export function handleSpireKey(keyCode) {
  // Cooldown check
  if (spirePlaceCooldown > 0) return;

  const num = parseInt(keyCode.replace("Digit", ""));
  if (num >= 1 && num <= 6) {
    tryPlaceSpire(num);
    spirePlaceCooldown = SPIRE_PLACE_DELAY; // Start cooldown
  }
}

// ------------------------------------------------------------
// 🩵 tryPlaceSpire()
// ------------------------------------------------------------
function tryPlaceSpire(num) {
  const p = gameState.player;
  if (!p || !gameState.profile) return;

  const spireData = SPIRE_UNLOCKS[num];
  if (!spireData) return;

  // 🔒 Check level unlock
  if ((p.level || 1) < spireData.unlock) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, `Locked — Lvl ${spireData.unlock}`, "#ff7aa8");
    playCancelSound();
    console.log(`🔒 ${spireData.name} locked until level ${spireData.unlock}.`);
    return;
  }

  // 💰 Check gold
  const gold = gameState.profile?.currencies?.gold ?? 0;
  if (gold < SPIRE_COST) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough gold", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🏗️ Position (player location)
  const spawnX = p.pos.x;
  const spawnY = p.pos.y;

  // 🧱 Prevent overlapping spires
  const spires = getSpires();
  const overlapping = spires.some(t => {
    const dx = t.x - spawnX;
    const dy = t.y - spawnY;
    return Math.hypot(dx, dy) < SPIRE_RADIUS;
  });

  if (overlapping) {
    spawnFloatingText(spawnX, spawnY - 40, "❌ Too close to another spire", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🏰 Create new spire
  addSpire({
    name: spireData.name,
    type: spireData.key,
    projectileType: spireData.projectile,
    x: spawnX,
    y: spawnY,
  });

  // 💸 Deduct gold
  const success = spendGold(SPIRE_COST);
  if (success) {
    updateHUD();
    
    playFairySprinkle();
  } else {
    playCancelSound();
  }
}

// ------------------------------------------------------------
// 📤 Export cooldown
// ------------------------------------------------------------
export { spirePlaceCooldown, SPIRE_PLACE_DELAY };

// ------------------------------------------------------------
// ⏳ Auto-cooldown tick (60fps)
// ------------------------------------------------------------
setInterval(() => {
  if (spirePlaceCooldown > 0) {
    spirePlaceCooldown -= 16;
    if (spirePlaceCooldown < 0) spirePlaceCooldown = 0;
  }
}, 16);

// ============================================================
// 🌟 END OF FILE
// ============================================================

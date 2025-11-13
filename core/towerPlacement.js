// ============================================================
// 🏗️ towerPlacement.js — Olivia’s World: Crystal Keep 
//    (Full Multi-Turret System + Overlap Check)
// ------------------------------------------------------------
// ✦ Handles player-triggered tower placement (keys 1–6)
// ✦ Unlocks different turret types based on player level
// ✦ Deducts gold using profile currencies via spendGold()
// ✦ Uses addTower() to create turret instances
// ✦ Integrates sounds, floating text, and HUD updates
// ✦ 🆕 Spawns tower at player location, prevents overlap
// ✦ 🆕 Placement cooldown (anti-spam)
// ============================================================

import { gameState, spendGold } from "../utils/gameState.js";
import { addTower, getTowers } from "./towers.js";
import { spawnFloatingText } from "./floatingText.js";
import { playFairySprinkle, playCancelSound } from "./soundtrack.js";
import { updateHUD } from "./ui.js";

// ------------------------------------------------------------
// 🕒 Tower Placement Cooldown (anti-spam safeguard)
// ------------------------------------------------------------
let towerPlaceCooldown = 0;   // ms remaining
const TOWER_PLACE_DELAY = 300; // 300ms between placements

// ------------------------------------------------------------
// ⚙️ CONFIGURATION
// ------------------------------------------------------------
const TILE_SIZE = 64;
const TOWER_COST = 50;
const TOWER_RADIUS = 75; // 🛑 No other tower can be within this distance

// ✨ Unlock levels + metadata for each turret
const TOWER_UNLOCKS = {
  1: { name: "Crystal Defender", key: "basic_turret", unlock: 1, projectile: "crystal" },
  2: { name: "Frost Sentinel", key: "frost_turret", unlock: 1, projectile: "frost" },
  3: { name: "Flameheart", key: "flame_turret", unlock: 1, projectile: "flame" },
  4: { name: "Arcane Spire", key: "arcane_turret", unlock: 1, projectile: "arcane" },
  5: { name: "Beacon of Light", key: "light_turret", unlock: 1, projectile: "light" },
  6: { name: "Moonlight Aegis", key: "moon_turret", unlock: 1, projectile: "moon" },
};

// ------------------------------------------------------------
// 🧭 handleTowerKey()
// ------------------------------------------------------------
export function handleTowerKey(keyCode) {
  // Cooldown check
  if (towerPlaceCooldown > 0) return;

  const num = parseInt(keyCode.replace("Digit", ""));
  if (num >= 1 && num <= 6) {
    tryPlaceTower(num);
    towerPlaceCooldown = TOWER_PLACE_DELAY; // Start cooldown
  }
}

// ------------------------------------------------------------
// 🩵 tryPlaceTower()
// ------------------------------------------------------------
function tryPlaceTower(num) {
  const p = gameState.player;
  if (!p || !gameState.profile) return;

  const towerData = TOWER_UNLOCKS[num];
  if (!towerData) return;

  // 🔒 Check level unlock
  if ((p.level || 1) < towerData.unlock) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, `Locked — Lvl ${towerData.unlock}`, "#ff7aa8");
    playCancelSound();
    console.log(`🔒 ${towerData.name} locked until level ${towerData.unlock}.`);
    return;
  }

  // 💰 Check gold
  const gold = gameState.profile?.currencies?.gold ?? 0;
  if (gold < TOWER_COST) {
    spawnFloatingText(p.pos.x, p.pos.y - 40, "Not enough gold", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🏗️ Position (player location)
  const spawnX = p.pos.x;
  const spawnY = p.pos.y;

  // 🧱 Prevent overlapping towers
  const towers = getTowers();
  const overlapping = towers.some(t => {
    const dx = t.x - spawnX;
    const dy = t.y - spawnY;
    return Math.hypot(dx, dy) < TOWER_RADIUS;
  });

  if (overlapping) {
    spawnFloatingText(spawnX, spawnY - 40, "❌ Too close to another tower", "#ff7aa8");
    playCancelSound();
    return;
  }

  // 🏰 Create new tower
  addTower({
    name: towerData.name,
    type: towerData.key,
    projectileType: towerData.projectile,
    x: spawnX,
    y: spawnY,
  });

  // 💸 Deduct gold
  const success = spendGold(TOWER_COST);
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
export { towerPlaceCooldown, TOWER_PLACE_DELAY };

// ------------------------------------------------------------
// ⏳ Auto-cooldown tick (60fps)
// ------------------------------------------------------------
setInterval(() => {
  if (towerPlaceCooldown > 0) {
    towerPlaceCooldown -= 16;
    if (towerPlaceCooldown < 0) towerPlaceCooldown = 0;
  }
}, 16);

// ============================================================
// 🌟 END OF FILE
// ============================================================
